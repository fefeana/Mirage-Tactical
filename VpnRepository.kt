package com.ufoalbarq.vpn.domain.repository

import com.google.firebase.functions.ktx.functions
import com.google.firebase.ktx.Firebase
import com.ufoalbarq.vpn.domain.model.VpnConfig
import kotlinx.coroutines.tasks.await
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow

enum class VpnStatus {
    DISCONNECTED, CONNECTING, CONNECTED, ERROR
}

class VpnRepository {
    private val functions = Firebase.functions // Firebase Functions SDK
    private val _connectionStatus = MutableStateFlow(VpnStatus.DISCONNECTED)

    fun getConnectionStatus(): Flow<VpnStatus> = _connectionStatus

    suspend fun fetchVpnConfig(): Result<VpnConfig> {
        return try {
            // استدعاء الوظيفة التي كتبناها بالأعلى
            val result = functions
                .getHttpsCallable("getMirageConfig")
                .call()
                .await()
            
            // تحويل النتيجة إلى Object (يمكنك استخدام Gson هنا)
            val data = result.data as Map<String, Any>
            Result.success(VpnConfig.fromMap(data))
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun connect(config: VpnConfig) {
        _connectionStatus.value = VpnStatus.CONNECTING
        // Simulate connection
        kotlinx.coroutines.delay(1000)
        _connectionStatus.value = VpnStatus.CONNECTED
    }

    fun disconnect() {
        _connectionStatus.value = VpnStatus.DISCONNECTED
    }
}
