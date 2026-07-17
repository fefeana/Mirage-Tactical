// android/app/src/main/java/com/mirage/AlBarqHubClient.kt (محدث)
package com.mirage

import android.content.Context
import android.util.Log
import kotlinx.coroutines.*
import okhttp3.*
import okhttp3.sse.EventSource
import okhttp3.sse.EventSourceListener
import okhttp3.sse.EventSources
import org.json.JSONObject
import org.webrtc.*
import java.nio.ByteBuffer
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

    // ======================== WebRTC ========================
    
    private var peerConnection: PeerConnection? = null
    private var dataChannel: DataChannel? = null
    private var peerConnectionFactory: PeerConnectionFactory? = null
    
    // ======================== Offline Cache ========================
    
    private val offlineManager = OfflineManager(context)

    // ======================== Interfaces ========================

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
        
        // 1. بدء SSE
        startSSE()
        
        // 2. بدء WebRTC
        initWebRTC()
        
        // 3. بدء مراقبة الاتصال
        startConnectionMonitor()
    }

    // ======================== 1. SSE (Server-Sent Events) ========================

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

                    Log.d(TAG, "📨 Event received: $eventType")

                    when (eventType) {
                        "ui_update" -> {
                            listener?.onUIUpdate(payload)
                            // تخزين مؤقت للوضع offline
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

    // ======================== 2. WebRTC Data Channel ========================

    private fun initWebRTC() {
        try {
            // تهيئة PeerConnectionFactory
            val options = PeerConnectionFactory.InitializationOptions.builder(context)
                .setEnableInternalTracer(true)
                .createInitializationOptions()
            PeerConnectionFactory.initialize(options)

            val encoderFactory = DefaultVideoEncoderFactory(
                EglBase.create().eglBaseContext,
                true,
                true
            )
            val decoderFactory = DefaultVideoDecoderFactory(EglBase.create().eglBaseContext)

            peerConnectionFactory = PeerConnectionFactory.builder()
                .setVideoEncoderFactory(encoderFactory)
                .setVideoDecoderFactory(decoderFactory)
                .createPeerConnectionFactory()

            // إعداد ICE Servers
            val iceServers = listOf(
                PeerConnection.IceServer.builder("stun:stun.l.google.com:19302").createIceServer(),
                PeerConnection.IceServer.builder("stun:stun1.l.google.com:19302").createIceServer()
            )

            val rtcConfig = PeerConnection.RTCConfiguration(iceServers)

            // إنشاء PeerConnection
            peerConnection = peerConnectionFactory?.createPeerConnection(
                rtcConfig,
                object : PeerConnection.Observer {
                    override fun onIceCandidate(candidate: IceCandidate?) {
                        // إرسال المرشح إلى السحابة
                        candidate?.let {
                            sendIceCandidate(it)
                        }
                    }

                    override fun onDataChannel(channel: DataChannel?) {
                        channel?.let {
                            dataChannel = it
                            it.registerObserver(object : DataChannel.Observer {
                                override fun onMessage(buffer: DataChannel.Buffer) {
                                    handleRealtimeMessage(buffer)
                                }

                                override fun onStateChange() {
                                    Log.d(TAG, "📡 DataChannel state: ${it.state()}")
                                }
                            })
                            Log.d(TAG, "✅ DataChannel established")
                        }
                    }

                    override fun onIceConnectionChange(state: PeerConnection.IceConnectionState?) {
                        Log.d(TAG, "🔄 ICE state: $state")
                    }

                    override fun onIceGatheringChange(state: PeerConnection.IceGatheringState?) {}
                    override fun onIceCandidatesRemoved(candidates: Array<out IceCandidate>?) {}
                    override fun onAddStream(stream: MediaStream?) {}
                    override fun onRemoveStream(stream: MediaStream?) {}
                    override fun onRenegotiationNeeded() {}
                    override fun onAddTrack(receiver: RtpReceiver?, streams: Array<out MediaStream>?) {}
                    override fun onSignalingChange(state: PeerConnection.SignalingState?) {}
                }
            )

            // إنشاء DataChannel
            val init = DataChannel.Init().apply {
                ordered = true
                id = 1
            }
            dataChannel = peerConnection?.createDataChannel("albarq-channel", init)

            Log.d(TAG, "✅ WebRTC initialized")

        } catch (e: Exception) {
            Log.e(TAG, "❌ WebRTC init failed: ${e.message}")
        }
    }

    // ======================== 3. Auto-Reconnect (Smart Backoff) ========================

    private fun scheduleReconnect() {
        if (isReconnecting || reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
            Log.e(TAG, "❌ Max reconnect attempts reached")
            return
        }

        isReconnecting = true
        scope.launch {
            // خوارزمية التراجع الأسي (Exponential Backoff)
            val delay = (RECONNECT_DELAY * Math.pow(2.0, reconnectAttempts.toDouble())).toLong()
            val finalDelay = delay.coerceAtMost(30000) // الحد الأقصى 30 ثانية
            
            Log.d(TAG, "🔄 Reconnecting in ${finalDelay}ms (attempt ${reconnectAttempts + 1})")
            delay(finalDelay)

            reconnectAttempts++
            isReconnecting = false

            if (!isConnected) {
                connect()
                if (isConnected) {
                    reconnectAttempts = 0 // إعادة ضبط العداد عند النجاح
                } else {
                    scheduleReconnect() // محاولة مجدداً
                }
            }
        }
    }

    // ======================== 4. Connection Monitor ========================

    private fun startConnectionMonitor() {
        scope.launch {
            while (isActive) {
                delay(5000) // كل 5 ثوانٍ
                if (!isConnected && !isReconnecting) {
                    Log.w(TAG, "⚠️ Connection lost, attempting reconnect...")
                    scheduleReconnect()
                }
            }
        }
    }

    // ======================== 5. Heartbeat ========================

    private fun startHeartbeat() {
        scope.launch {
            while (isActive && isConnected) {
                delay(HEARTBEAT_INTERVAL)
                sendCommand("heartbeat", mapOf("timestamp" to System.currentTimeMillis()))
            }
        }
    }

    // ======================== 6. Send Commands ========================

    suspend fun sendCommand(command: String, payload: Map<String, Any> = emptyMap()) {
        if (isConnected) {
            // محاولة إرسال عبر WebRTC أولاً (أسرع)
            val sent = sendViaWebRTC(command, payload)
            if (!sent) {
                // إذا فشل WebRTC، استخدم HTTP
                sendViaHTTP(command, payload)
            }
        } else {
            // تخزين الأمر للإرسال لاحقاً (Offline)
            pendingCommands.add(command to payload)
            offlineManager.cacheCommand(command, payload)
            Log.d(TAG, "📦 Command queued: $command")
        }
    }

    private fun sendViaWebRTC(command: String, payload: Map<String, Any>): Boolean {
        try {
            val channel = dataChannel
            if (channel?.state() == DataChannel.State.OPEN) {
                val message = JSONObject(mapOf(
                    "command" to command,
                    "payload" to payload,
                    "timestamp" to System.currentTimeMillis()
                )).toString()

                val buffer = DataChannel.Buffer(
                    ByteBuffer.wrap(message.toByteArray()),
                    true
                )
                channel.send(buffer)
                Log.d(TAG, "✅ Command sent via WebRTC: $command")
                return true
            }
        } catch (e: Exception) {
            Log.e(TAG, "❌ WebRTC send failed: ${e.message}")
        }
        return false
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
                Log.d(TAG, "✅ Command sent via HTTP: $command")
            } else {
                Log.e(TAG, "❌ Command failed: ${response.code}")
            }
            response.close()
        } catch (e: Exception) {
            Log.e(TAG, "❌ HTTP send failed: ${e.message}")
        }
    }

    // ======================== 7. Offline Mode ========================

    fun handleOfflineMode() {
        scope.launch {
            // 1. عرض البيانات المخزنة مؤقتاً
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

            // 2. تخزين الأوامر الجديدة
            // سيتم تخزينها تلقائياً عبر sendCommand()

            Log.d(TAG, "📴 Offline mode active")
        }
    }

    // ======================== 8. Real-time Messages ========================

    private fun handleRealtimeMessage(buffer: DataChannel.Buffer) {
        try {
            val data = buffer.data
            val bytes = ByteArray(data.remaining())
            data.get(bytes)
            val message = String(bytes)
            val json = JSONObject(message)

            val command = json.getString("command")
            val payload = json.getJSONObject("payload").toMap()

            Log.d(TAG, "📨 Real-time message: $command")

            when (command) {
                "ping" -> {
                    // رد تلقائي
                    scope.launch {
                        sendCommand("pong", mapOf("timestamp" to System.currentTimeMillis()))
                    }
                }
                "ui_update" -> listener?.onUIUpdate(payload)
                "settings_change" -> listener?.onSettingsUpdate(payload)
                "vpn_switch" -> listener?.onVPNUpdate(payload)
                "security_alert" -> listener?.onSecurityAlert(payload)
                "ai_suggestion" -> listener?.onAISuggestion(payload)
                else -> Log.d(TAG, "Unknown command: $command")
            }
        } catch (e: Exception) {
            Log.e(TAG, "❌ Error handling real-time message: ${e.message}")
        }
    }

    // ======================== 9. Ice Candidates ========================

    private fun sendIceCandidate(candidate: IceCandidate) {
        scope.launch {
            val payload = mapOf(
                "sdpMid" to candidate.sdpMid,
                "sdpMLineIndex" to candidate.sdpMLineIndex,
                "candidate" to candidate.sdp
            )
            sendCommand("ice_candidate", payload)
        }
    }

    // ======================== 10. Utility Functions ========================

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
        peerConnection?.close()
        peerConnection = null
        dataChannel?.close()
        dataChannel = null
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

// ======================== Extensions ========================

fun JSONObject.toMap(): Map<String, Any> {
    val map = mutableMapOf<String, Any>()
    val keys = this.keys()
    while (keys.hasNext()) {
        val key = keys.next()
        map[key] = this.get(key)
    }
    return map
}
