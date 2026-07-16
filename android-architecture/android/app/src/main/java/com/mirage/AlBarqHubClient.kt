// android/app/src/main/java/com/mirage/AlBarqHubClient.kt
package com.mirage

import android.content.Context
import android.util.Log
import kotlinx.coroutines.*
import okhttp3.*
import okhttp3.sse.EventSource
import okhttp3.sse.EventSourceListener
import okhttp3.sse.EventSources
import org.json.JSONObject
import java.util.concurrent.TimeUnit

class AlBarqHubClient(
    private val context: Context,
    private val userId: String
) {
    companion object {
        private const val TAG = "AlBarqHubClient"
        private const val SSE_URL = "https://albarq-hub.web.app/sse"
        private const val HEARTBEAT_INTERVAL = 30000L
        private const val RECONNECT_DELAY = 5000L
    }

    private val client = OkHttpClient.Builder()
        .connectTimeout(30, TimeUnit.SECONDS)
        .readTimeout(30, TimeUnit.SECONDS)
        .build()

    private var eventSource: EventSource? = null
    private var isConnected = false
    private var reconnectAttempts = 0
    private val maxReconnectAttempts = 10
    private val pendingCommands = mutableListOf<Pair<String, Map<String, Any>>>()
    private val scope = CoroutineScope(Dispatchers.IO + SupervisorJob())
    private var listener: AlBarqListener? = null

    interface AlBarqListener {
        fun onConnected()
        fun onDisconnected()
        fun onUIUpdate(data: Map<String, Any>)
        fun onSettingsUpdate(data: Map<String, Any>)
        fun onVPNUpdate(data: Map<String, Any>)
        fun onSecurityAlert(data: Map<String, Any>)
        fun onAISuggestion(data: Map<String, Any>)
        fun onHeartbeat(data: Map<String, Any>)
        fun onError(error: String)
    }

    fun setListener(listener: AlBarqListener) {
        this.listener = listener
    }

    fun connect() {
        if (isConnected) return

        Log.d(TAG, "🚀 Connecting to AlBarqHub...")
        
        val request = Request.Builder()
            .url("$SSE_URL?userId=$userId&platform=android")
            .header("Accept", "text/event-stream")
            .header("Cache-Control", "no-cache")
            .build()

        val factory = EventSources.createFactory(client)
        eventSource = factory.newEventSource(request, object : EventSourceListener() {
            override fun onOpen(eventSource: EventSource, response: Response) {
                isConnected = true
                reconnectAttempts = 0
                Log.d(TAG, "✅ SSE connection opened")
                listener?.onConnected()
                flushPendingCommands()
                startHeartbeat()
            }

            override fun onEvent(
                eventSource: EventSource,
                id: String?,
                type: String?,
                data: String
            ) {
                try {
                    val json = JSONObject(data)
                    val eventType = type ?: json.getString("type")
                    val payload = json.getJSONObject("data").toMap()

                    Log.d(TAG, "📨 Event received: $eventType")

                    when (eventType) {
                        "ui_update" -> listener?.onUIUpdate(payload)
                        "settings_change" -> listener?.onSettingsUpdate(payload)
                        "vpn_switch" -> listener?.onVPNUpdate(payload)
                        "security_alert" -> listener?.onSecurityAlert(payload)
                        "ai_suggestion" -> listener?.onAISuggestion(payload)
                        "heartbeat" -> listener?.onHeartbeat(payload)
                        else -> Log.d(TAG, "Unknown event type: $eventType")
                    }
                } catch (e: Exception) {
                    Log.e(TAG, "❌ Error parsing event: ${e.message}")
                }
            }

            override fun onClosed(eventSource: EventSource) {
                Log.d(TAG, "🔌 SSE connection closed")
                isConnected = false
                listener?.onDisconnected()
                scheduleReconnect()
            }

            override fun onFailure(
                eventSource: EventSource,
                t: Throwable?,
                response: Response?
            ) {
                Log.e(TAG, "❌ SSE connection failed: ${t?.message}")
                isConnected = false
                listener?.onError(t?.message ?: "Connection failed")
                scheduleReconnect()
            }
        })
    }

    fun sendCommand(command: String, payload: Map<String, Any> = emptyMap()) {
        if (isConnected) {
            sendViaHTTP(command, payload)
        } else {
            pendingCommands.add(command to payload)
            Log.d(TAG, "📦 Command queued: $command")
        }
    }

    private fun sendViaHTTP(command: String, payload: Map<String, Any>) {
        scope.launch {
            try {
                val response = client.newCall(
                    Request.Builder()
                        .url("https://albarq-hub.web.app/api/command")
                        .post(
                            FormBody.Builder()
                                .add("userId", userId)
                                .add("command", command)
                                .add("payload", JSONObject(payload).toString())
                                .build()
                        )
                        .build()
                ).execute()

                if (response.isSuccessful) {
                    Log.d(TAG, "✅ Command sent: $command")
                } else {
                    Log.e(TAG, "❌ Command failed: ${response.code}")
                }
                response.close()
            } catch (e: Exception) {
                Log.e(TAG, "❌ Error sending command: ${e.message}")
                listener?.onError(e.message ?: "Send failed")
            }
        }
    }

    private fun flushPendingCommands() {
        if (pendingCommands.isEmpty()) return
        Log.d(TAG, "📤 Flushing ${pendingCommands.size} pending commands")
        for ((command, payload) in pendingCommands) {
            sendCommand(command, payload)
        }
        pendingCommands.clear()
    }

    private fun scheduleReconnect() {
        if (reconnectAttempts >= maxReconnectAttempts) {
            Log.e(TAG, "❌ Max reconnect attempts reached")
            return
        }

        reconnectAttempts++
        val delay = RECONNECT_DELAY * (reconnectAttempts.toLong())
        Log.d(TAG, "🔄 Reconnecting in ${delay}ms (attempt $reconnectAttempts)")
        
        scope.launch {
            delay(delay)
            if (!isConnected) {
                connect()
            }
        }
    }

    private fun startHeartbeat() {
        scope.launch {
            while (isActive && isConnected) {
                delay(HEARTBEAT_INTERVAL)
                sendCommand("heartbeat", mapOf("timestamp" to System.currentTimeMillis()))
            }
        }
    }

    fun disconnect() {
        eventSource?.cancel()
        eventSource = null
        isConnected = false
        scope.cancel()
        Log.d(TAG, "🔌 Disconnected from AlBarqHub")
    }

    fun isConnected(): Boolean = isConnected

    suspend fun getAppState(): Map<String, Any>? {
        return try {
            val response = client.newCall(
                Request.Builder()
                    .url("https://albarq-hub.web.app/api/state?userId=$userId")
                    .build()
            ).execute()

            if (response.isSuccessful) {
                val body = response.body?.string()
                response.close()
                JSONObject(body).toMap()
            } else {
                response.close()
                null
            }
        } catch (e: Exception) {
            Log.e(TAG, "❌ Error getting state: ${e.message}")
            null
        }
    }
}

fun JSONObject.toMap(): Map<String, Any> {
    val map = mutableMapOf<String, Any>()
    val keys = this.keys()
    while (keys.hasNext()) {
        val key = keys.next()
        map[key] = this.get(key)
    }
    return map
}
