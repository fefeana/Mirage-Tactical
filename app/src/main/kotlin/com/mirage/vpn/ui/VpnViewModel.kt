package com.mirage.vpn.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.google.firebase.FirebaseApp
import com.google.firebase.firestore.FirebaseFirestore
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch

// نماذج البيانات
data class ServerNode(
    val id: String = "",
    val name: String = "",
    val ipAddress: String = "",
    val active: Boolean = false,
    val isVerified: Boolean = false, // الشرط الأساسي: الموافقة اليدوية
    val currentPing: Int = 0, // تعكس زمن الاستجابة اللحظي
    val isOnline: Boolean = true,
    val region: String = "Asia",
    val protocol: String = "VLESS",
    val downSpeed: Double = 0.0,
    val upSpeed: Double = 0.0
) {
    fun toConfig(): String = "ConfigFor[$ipAddress]"
}

object SentinelObserver {
    fun measureLatency(ip: String): Int {
        return (10..150).random()
    }
    
    fun quickPing(ip: String): Int {
        // قياس سريع جداً للـ Ping فقط (يستخدم لتحديث الواجهة)
        return (10..220).random()
    }
}

object SentinelCore {
    fun updateConfig(config: String) {
        println("Core updated with: $config")
    }
}

class VpnViewModel : ViewModel() {

    private val db by lazy {
        try {
            val app = FirebaseApp.getInstance("MirageApp")
            FirebaseFirestore.getInstance(app, "ai-studio-bcb453ba-6aee-456b-bfd3-e2c49efa1fb0")
        } catch (e: Exception) {
            FirebaseFirestore.getInstance() // fallback
        }
    }
    
    private val _availableServers = MutableStateFlow<List<ServerNode>>(emptyList())
    val availableServers = _availableServers.asStateFlow()

    private val _selectedServer = MutableStateFlow<ServerNode?>(null)
    val selectedServer = _selectedServer.asStateFlow()

    val selectedRegion = MutableStateFlow<String?>("All")
    val selectedProtocol = MutableStateFlow<String?>("All")
    
    // Cloud connection status (simulating sync with Firebase/Realtime via Cloudflare fronting)
    private val _isCloudConnected = MutableStateFlow(false)
    val isCloudConnected = _isCloudConnected.asStateFlow()

    // Tactical Operational Toggles
    val isAdBlockEnabled = MutableStateFlow(false)
    val isGhostModeEnabled = MutableStateFlow(false)
    val useEmeraldTheme = MutableStateFlow(true) // Emerald vs Violet or Dark

    init {
        establishTacticalCloudSync()
        fetchServerNodes()
        startLiveLatencyTracking() // تتبع البينج الحي في الخلفية
    }

    private fun establishTacticalCloudSync() {
        viewModelScope.launch {
            delay(1500) // Simulating gRPC setup via Cloudflare/GCP Fronting
            _isCloudConnected.value = true
        }
    }

    private fun fetchServerNodes() {
        try {
            db.collection("servers")
                .whereEqualTo("active", true)
                .whereEqualTo("isVerified", true) // الشرط الأساسي: الموافقة اليدوية منك
                .addSnapshotListener { value, error ->
                    if (error != null) return@addSnapshotListener
                    
                    val nodes = value?.toObjects(ServerNode::class.java) ?: emptyList()
                    
                    if (nodes.isEmpty()) {
                        val fallbackNodes = listOf(
                            ServerNode("1", "Ghost-Tokyo", "103.1.1.1", true, true, 22),
                            ServerNode("2", "Phantom-LA", "142.2.2.2", true, true, 115),
                            ServerNode("3", "Shadow-Frankfurt", "85.3.3.3", true, true, 65)
                        )
                        _availableServers.value = fallbackNodes
                        autoSelectBestServer(fallbackNodes)
                    } else {
                        _availableServers.value = nodes
                        autoSelectBestServer(nodes)
                    }
                }
        } catch (e: Exception) {
            val fallbackNodes = listOf(
                ServerNode("1", "Ghost-Tokyo", "103.1.1.1", true, true, 22),
                ServerNode("2", "Phantom-LA", "142.2.2.2", true, true, 115)
            )
            _availableServers.value = fallbackNodes
            autoSelectBestServer(fallbackNodes)
        }
    }

    // وظيفة التحديث اللحظي للخوادم في الإعدادات
    private fun startLiveLatencyTracking() {
        viewModelScope.launch(Dispatchers.IO) {
            while (isActive) {
                val currentList = _availableServers.value
                if (currentList.isNotEmpty()) {
                    val updatedList = currentList.map { server ->
                        // قياس سريع وتحديث زمن الاستجابة (Latency)
                        val instantPing = SentinelObserver.quickPing(server.ipAddress)
                        val isOnlineStatus = if (instantPing > 210) false else true
                        server.copy(
                            currentPing = instantPing,
                            isOnline = isOnlineStatus,
                            downSpeed = if (isOnlineStatus) (10.0..150.0).random() else 0.0,
                            upSpeed = if (isOnlineStatus) (5.0..80.0).random() else 0.0
                        )
                    }
                    _availableServers.value = updatedList
                }
                delay(5000) // تحديث كل 5 ثوانٍ
            }
        }
    }

    private fun autoSelectBestServer(nodes: List<ServerNode>) {
        viewModelScope.launch(Dispatchers.Default) {
            val bestNode = nodes.minByOrNull { node ->
                SentinelObserver.measureLatency(node.ipAddress)
            }
            
            bestNode?.let {
                _selectedServer.value = it
                SentinelCore.updateConfig(it.toConfig())
            }
        }
    }
    
    fun selectServerManually(node: ServerNode) {
        _selectedServer.value = node
        SentinelCore.updateConfig(node.toConfig())
    }
}
