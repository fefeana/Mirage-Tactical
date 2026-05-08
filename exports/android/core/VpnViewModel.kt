package com.mirage.vpn.core

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

sealed class VpnState {
    object Idle : VpnState()
    object Connecting : VpnState()
    object Connected : VpnState()
    object SelfHealing : VpnState()
    object Analyzing : VpnState()
    data class Error(val message: String) : VpnState()
}

data class ServerNode(val name: String, val config: String)

// واجهة افتراضية لعمليات الاتصال للـ VpnService
interface VpnServiceInteractor {
    suspend fun startVpn(config: String)
}

/**
 * ⚡ Samurai VpnViewModel
 * عقل إدارة الحالة (State Management) للواجهة. يدير الاتصال ويمتلك قدرات "الشفاء الذاتي".
 */
class VpnViewModel(
    private val vpnServiceInteractor: VpnServiceInteractor,
    private val configBuilder: VpnConfigBuilder
) : ViewModel() {

    // مراقبة حالة الاتصال الحية
    private val _connectionState = MutableStateFlow<VpnState>(VpnState.Idle)
    val connectionState: StateFlow<VpnState> = _connectionState.asStateFlow()

    private val _pingState = MutableStateFlow(0L)
    val pingState: StateFlow<Long> = _pingState.asStateFlow()

    // حالة تدفق للرسائل البصرية (Cyber Toast Notifications)
    private val _uiStatusMessage = MutableStateFlow<String>("STANDBY")
    val uiStatusMessage: StateFlow<String> = _uiStatusMessage.asStateFlow()

    private var lastValidConfig: String? = null
    private var retryCount = 0
    private val MAX_RETRIES = 3
    private var currentServerIndex = 0
    
    // قائمة الخوادم المتاحة لتبديل المسارات (Server Node Pool)
    private val _availableServers = MutableStateFlow<List<ServerNode>>(emptyList())
    val availableServers: StateFlow<List<ServerNode>> = _availableServers.asStateFlow()

    private val sentinel = SentinelObserver()
    private val maxLatencyThreshold = 100 // 100ms

    init {
        fetchServersFromBackend()
        startSentinelShield()
    }

    private fun startSentinelShield() {
        viewModelScope.launch {
            sentinel.metricsFlow.collect { metrics ->
                if (_connectionState.value is VpnState.Connected) {
                    _pingState.value = metrics.latency.toLong()
                    if (metrics.latency > maxLatencyThreshold || metrics.packetLoss > 0) {
                        println("Sentinel Alert: Latency ${metrics.latency}ms. Switching node...")
                        updateUIStatus("Sentinel Alert: AI Optimizing Route...")
                        switchToNextBestServer()
                    }
                }
            }
        }
    }

    fun fetchServersFromBackend() {
        viewModelScope.launch(kotlinx.coroutines.Dispatchers.IO) {
            try {
                updateUIStatus("Fetching elite servers...")
                delay(1000) // محاكاة وقت الاتصال بالشبكة لحال عدم وجود الـ API
                // محاكاة استجابة الخادم بدلاً من apiService الحقيقي حالياً لضمان البناء
                val responseList = listOf(
                    ServerNode("Tokyo - Primary", "vless_tokyo_config"),
                    ServerNode("Frankfurt - Backup", "vless_frankfurt_config"),
                    ServerNode("USA - Stealth", "vless_usa_config")
                )
                
                _availableServers.value = responseList
                updateUIStatus("Mirage Network Synced.")
            } catch (e: Exception) {
                updateUIStatus("Network Sync Failed. Using local cache.")
            }
        }
    }

    fun updateProtocol(protocol: String) {
        updateUIStatus("🔄 تم تغيير البروتوكول النشط إلى: $protocol")
        // يمكننا هنا تحديث الإعدادات الافتراضية
    }

    fun toggleConnection() {
        val currentState = _connectionState.value
        if (currentState is VpnState.Connected || currentState is VpnState.Connecting) {
            _connectionState.value = VpnState.Idle
            updateUIStatus("🛑 تم إيقاف الاتصال وتجميد النفق السيادي")
            _pingState.value = 0L
        } else {
            initiateConnection(lastValidConfig ?: "{}")
        }
    }

    // تُطلق هذه الدالة لمراقبة الشبكة أثناء الاتصال 
    fun startNetworkMonitoring(currentIp: String = "8.8.8.8") {
        viewModelScope.launch {
            while (kotlinx.coroutines.isActive) {
                if (_connectionState.value is VpnState.Connected) {
                    // قياس زمن الاستجابة الفعلي (محاكاة أو عبر JNI)
                    val latency = (20L..180L).random() 
                    val packetLoss = (0..6).random()
                    _pingState.value = latency
                    
                    monitorPerformance(latency.toInt(), packetLoss)
                }
                delay(3000) // تحديث كل 3 ثوانٍ
            }
        }
    }

    fun monitorPerformance(currentLatency: Int, packetLoss: Int) {
        if (currentLatency > 100 || packetLoss > 5) {
            println("High Latency Detected. Switching to nearest High-Speed Node...")
            switchToNextBestServer()
        }
    }

    fun initiateConnection(configJson: String, isRetry: Boolean = false) {
        lastValidConfig = configJson
        if (!isRetry) retryCount = 0
        
        viewModelScope.launch(kotlinx.coroutines.Dispatchers.IO) {
            onConnectionStateChanged(if (isRetry) VpnState.SelfHealing else VpnState.Connecting)
            try {
                // هنا يتم وضع منطق ربط الـ VLESS الفعلي
                vpnServiceInteractor.startVpn(configJson)
                delay(2000) // محاكاة وقت الاتصال
                onConnectionStateChanged(VpnState.Connected)
            } catch (e: Exception) {
                onConnectionStateChanged(VpnState.Error(e.message ?: "Unknown Error"))
            }
        }
    }

    fun onConnectionStateChanged(newState: VpnState) {
        _connectionState.value = newState

        when (newState) {
            is VpnState.Error -> {
                updateUIStatus("Error: ${newState.message}. Attempting recovery...")
                triggerSelfHealing()
            }
            is VpnState.Connecting -> updateUIStatus("Establishing Secure Tunnel...")
            is VpnState.Connected -> {
                updateUIStatus("Securely Connected via VLESS")
                retryCount = 0 // تصفير العداد عند النجاح
            }
            else -> updateUIStatus("Ready to Connect")
        }
    }

    private fun triggerSelfHealing() {
        viewModelScope.launch(kotlinx.coroutines.Dispatchers.IO) {
            _connectionState.value = VpnState.SelfHealing
            if (retryCount < MAX_RETRIES && lastValidConfig != null) {
                // المرحلة الأولى: محاولة الإصلاح الذاتي على نفس الخادم
                retryCount++
                updateUIStatus("Self-healing: Attempt $retryCount of $MAX_RETRIES...")
                delay(3000) 
                
                lastValidConfig?.let { initiateConnection(it, isRetry = true) }
            } else {
                // المرحلة الثانية: التبديل التلقائي للخادم (Server Switching)
                updateUIStatus("Server unstable. Switching to a better route...")
                switchToNextBestServer()
            }
        }
    }

    private fun switchToNextBestServer() {
        val serverList = availableServers.value 
        if (serverList.isNotEmpty() && currentServerIndex < serverList.size - 1) {
            // تصفير عداد المحاولات للخادم الجديد
            retryCount = 0
            
            // اختيار الخادم التالي في القائمة
            currentServerIndex++
            val nextServer = serverList[currentServerIndex]
            
            updateUIStatus("Connecting to: ${nextServer.name}...")
            initiateConnection(nextServer.config, isRetry = true) 
        } else {
            // إذا نفدت الخوادم المعيارية، نقوم بسحب تكوين الطوارئ
            fetchNewConfigAndRetry()
        }
    }

    // التبديل التلقائي: جلب إعدادات جديدة في حالة فشل الشفاء الذاتي
    private fun fetchNewConfigAndRetry() {
        // نغير المنطق هنا ليعتمد على التحليل الذكي من Genkit بدلاً من الجلب المباشر
        consultGenkitForStrategy("DPI Detection suspected after 3 failed handshakes on XTLS-Reality.")
    }

    private fun consultGenkitForStrategy(errorDetail: String) {
        viewModelScope.launch {
            _connectionState.value = VpnState.Analyzing
            updateUIStatus("Genkit is analyzing blocking patterns...")
            delay(2000) // محاكاة الاتصال السحابي للـ AI
            
            // محاكاة رد Genkit
            val strategy = "Recommended action: Use Hysteria2 due to heavy TCP throttling."
            
            // تطبيق الاستراتيجية المقترحة من Genkit
            updateUIStatus("Strategy Applied: Switching to Stealth Mode")
            delay(1000)
            
            when {
                strategy.contains("Hysteria2") -> switchProtocolToHysteria()
                strategy.contains("CDN") -> enableCloudflareWorkers()
                else -> fallbackToBasicEmergency()
            }
        }
    }

    private fun switchProtocolToHysteria() {
        val emergencyConfig = configBuilder.buildEmergencyHysteriaConfig("nodes.emergency.com", 443, "auth_secret", "microsoft.com")
        retryCount = 0
        initiateConnection(emergencyConfig, isRetry = true)
    }

    private fun enableCloudflareWorkers() {
        updateUIStatus("Cloudflare Worker Obfuscation enabled. Retrying...")
        fallbackToBasicEmergency()
    }

    private fun fallbackToBasicEmergency() {
        viewModelScope.launch(kotlinx.coroutines.Dispatchers.IO) {
            try {
                // استدعاء منشئ التكوين الطارئ
                val emergencyConfig = configBuilder.buildEmergencyHysteriaConfig("nodes.emergency.com", 443, "auth_secret", "microsoft.com")
                
                if (emergencyConfig.isNotEmpty()) {
                    retryCount = 0 // تصفير العداد للبدء بالمسار الجديد
                    updateUIStatus("🔄 تم جلب مسار الطوارئ بنجاح، جاري الاتصال...")
                    initiateConnection(emergencyConfig, isRetry = true)
                } else {
                    updateUIStatus("Total Outage: No alternative routes found.")
                    _connectionState.value = VpnState.Error("Critical Network Failure")
                }
            } catch (e: Exception) {
                updateUIStatus("Recovery failed: ${e.localizedMessage}")
                _connectionState.value = VpnState.Error("Critical Network Failure")
            }
        }
    }

    private fun updateUIStatus(msg: String) {
        _uiStatusMessage.value = msg
        println(msg)
    }
}
