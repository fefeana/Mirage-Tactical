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
        private const val MAX_RECONNECT_ATTEMPTS = 20
    }

    // ======================== SSE Client ========================
    
    private val client = OkHttpClient.Builder()
        .connectTimeout(30, TimeUnit.SECONDS)
        .readTimeout(30, TimeUnit.SECONDS)
        .build()

    private var eventSource: EventSource? = null
    private var isConnected = false
    private var reconnectAttempts = 0
    private var isReconnecting = false
    
    private val pendingCommands = mutableListOf<Pair<String, Map<String, Any>>>()
    private val scope = CoroutineScope(Dispatchers.IO + SupervisorJob())
    private var listener: AlBarqListener? = null

    // ======================== Offline Cache ========================
    
    private val offlineManager = OfflineManager(context)

    // ======================== Interface ========================

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

    // ======================== Initialization ========================

    fun setListener(listener: AlBarqListener) {
        this.listener = listener
    }

    fun connect() {
        if (isConnected) return
        
        Log.d(TAG, "🚀 Connecting to AlBarqHub...")
        startSSE()
        startConnectionMonitor()
    }

    // ======================== 1. SSE ========================

    private fun startSSE() {
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

                    Log.d(TAG, "📨 Event: $eventType")

                    when (eventType) {
                        "ui_update" -> {
                            listener?.onUIUpdate(payload)
                            scope.launch {
                                offlineManager.cacheState("ui_state", data)
                            }
                        }
                        "settings_change" -> {
                            listener?.onSettingsUpdate(payload)
                            scope.launch {
                                offlineManager.cacheState("settings", data)
                            }
                        }
                        "vpn_switch" -> listener?.onVPNUpdate(payload)
                        "security_alert" -> listener?.onSecurityAlert(payload)
                        "ai_suggestion" -> listener?.onAISuggestion(payload)
                        "heartbeat" -> listener?.onHeartbeat(payload)
                        else -> Log.d(TAG, "Unknown event: $eventType")
                    }
                } catch (e: Exception) {
                    Log.e(TAG, "❌ Error parsing event: ${e.message}")
                }
            }

            override fun onClosed(eventSource: EventSource) {
                Log.d(TAG, "🔌 SSE closed")
                isConnected = false
                listener?.onDisconnected()
                scheduleReconnect()
            }

            override fun onFailure(
                eventSource: EventSource,
                t: Throwable?,
                response: Response?
            ) {
                Log.e(TAG, "❌ SSE failed: ${t?.message}")
                isConnected = false
                listener?.onError(t?.message ?: "Connection failed")
                scheduleReconnect()
            }
        })
    }

    // ======================== 2. Auto-Reconnect ========================

    private fun scheduleReconnect() {
        if (isReconnecting || reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
            Log.e(TAG, "❌ Max reconnect attempts reached")
            return
        }

        isReconnecting = true
        scope.launch {
            val delay = (RECONNECT_DELAY * Math.pow(2.0, reconnectAttempts.toDouble())).toLong()
            val finalDelay = delay.coerceAtMost(30000)
            
            Log.d(TAG, "🔄 Reconnecting in ${finalDelay}ms (attempt ${reconnectAttempts + 1})")
            delay(finalDelay)

            reconnectAttempts++
            isReconnecting = false

            if (!isConnected) {
                connect()
                if (isConnected) {
                    reconnectAttempts = 0
                } else {
                    scheduleReconnect()
                }
            }
        }
    }

    // ======================== 3. Connection Monitor ========================

    private fun startConnectionMonitor() {
        scope.launch {
            while (isActive) {
                delay(5000)
                if (!isConnected && !isReconnecting) {
                    Log.w(TAG, "⚠️ Connection lost, reconnecting...")
                    scheduleReconnect()
                }
            }
        }
    }

    // ======================== 4. Heartbeat ========================

    private fun startHeartbeat() {
        scope.launch {
            while (isActive && isConnected) {
                delay(HEARTBEAT_INTERVAL)
                sendCommand("heartbeat", mapOf("timestamp" to System.currentTimeMillis()))
            }
        }
    }

    // ======================== 5. Send Commands ========================

    suspend fun sendCommand(command: String, payload: Map<String, Any> = emptyMap()) {
        if (isConnected) {
            sendViaHTTP(command, payload)
        } else {
            pendingCommands.add(command to payload)
            offlineManager.cacheCommand(command, payload)
            Log.d(TAG, "📦 Command queued: $command")
        }
    }

    private suspend fun sendViaHTTP(command: String, payload: Map<String, Any>) {
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
            Log.e(TAG, "❌ HTTP send failed: ${e.message}")
        }
    }

    // ======================== 6. Offline Mode ========================

    fun handleOfflineMode() {
        scope.launch {
            val cachedUI = offlineManager.getCachedState("ui_state")
            cachedUI?.let {
                val data = JSONObject(it).toMap()
                listener?.onUIUpdate(data)
            }

            val cachedSettings = offlineManager.getCachedState("settings")
            cachedSettings?.let {
                val data = JSONObject(it).toMap()
                listener?.onSettingsUpdate(data)
            }

            Log.d(TAG, "📴 Offline mode active")
        }
    }

    // ======================== 7. Utility ========================

    private fun flushPendingCommands() {
        if (pendingCommands.isEmpty()) return
        Log.d(TAG, "📤 Flushing ${pendingCommands.size} pending commands")
        scope.launch {
            for ((command, payload) in pendingCommands) {
                sendCommand(command, payload)
            }
            pendingCommands.clear()
        }
    }

    fun disconnect() {
        eventSource?.cancel()
        eventSource = null
        isConnected = false
        scope.cancel()
        Log.d(TAG, "🔌 Disconnected")
    }

    fun isConnected(): Boolean = isConnected
}

// ======================== Extension ========================

fun JSONObject.toMap(): Map<String, Any> {
    val map = mutableMapOf<String, Any>()
    val keys = this.keys()
    while (keys.hasNext()) {
        val key = keys.next()
        map[key] = this.get(key)
    }
    return map
}
