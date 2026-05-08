package com.mirage.app.core

import android.content.Context
import android.content.Intent
import android.widget.Toast
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import com.mirage.app.services.MirageService
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.launch

enum class ConnectionStatus {
    DISCONNECTED, CONNECTING, CONNECTED
}

class MirageViewController(
    private val context: Context,
    private val scope: CoroutineScope
) {
    // حالة الاتصال التي تراها الواجهة (بسيطة جداً)
    var connectionState by mutableStateOf(ConnectionStatus.DISCONNECTED)
    var pingDisplay by mutableStateOf("-- ms")

    // قائمة افتراضية للتجربة (يتم جلبها في الإنتاج من الـ API)
    private val serverList = listOf(
        MirageServerConfig(
            id = "12345678901234567890123456789012",
            name = "Server Alpha",
            address = "1.1.1.1",
            port = 443,
            protocol = MirageProtocol.VLESS_WS
        )
    )

    private fun validateConnectionInputs(config: MirageServerConfig): Boolean {
        return when {
            config.address.isBlank() -> {
                Toast.makeText(context, "عنوان السيرفر لا يمكن أن يكون فارغاً", Toast.LENGTH_SHORT).show()
                false
            }
            config.port !in 1..65535 -> {
                Toast.makeText(context, "منفذ (Port) غير صالح", Toast.LENGTH_SHORT).show()
                false
            }
            config.protocol == MirageProtocol.VLESS_WS && config.id.length < 32 -> {
                Toast.makeText(context, "معرف المستخدم (UUID) غير مكتمل", Toast.LENGTH_SHORT).show()
                false
            }
            else -> true
        }
    }

    fun onConnectClicked() {
        scope.launch {
            if (connectionState == ConnectionStatus.DISCONNECTED) {
                connectionState = ConnectionStatus.CONNECTING
                
                // 1. العمل بصمت: اختيار أفضل سيرفر بناءً على الـ Ping
                val bestServer = MiragePingManager.selectBestConfig(serverList)
                
                if (bestServer != null && validateConnectionInputs(bestServer)) {
                    // 2. العمل بصمت: توليد إعدادات التمويه (VLESS/Reality)
                    // في السيناريو الفعلي، نحتاج لـ VlessSettings، هنا تمرير وهمي لأجل التوضيح
                    val configJson = MirageCoreConfig.generateVlessWsTlsConfig(
                        VlessSettings(
                            address = bestServer.address,
                            port = bestServer.port,
                            uuid = "your-mirage-uuid",
                            serverName = "www.microsoft.com",
                            wsPath = "/graphql",
                            fingerprint = "chrome"
                        )
                    )
                    
                    // 3. تشغيل الدرع
                    startVpnService(configJson)
                    connectionState = ConnectionStatus.CONNECTED
                    pingDisplay = "\${MiragePingManager.checkPing(bestServer.address, bestServer.port)} ms"
                } else {
                    connectionState = ConnectionStatus.DISCONNECTED
                    // إشعار بسيط للمستخدم بفشل العثور على مسار
                }
            } else {
                stopVpnService()
                connectionState = ConnectionStatus.DISCONNECTED
            }
        }
    }

    private fun startVpnService(config: String) {
        val intent = Intent(context, MirageService::class.java).apply {
            action = "START_SHIELD"
            putExtra("CONFIG_JSON", config)
        }
        context.startService(intent)
    }

    private fun stopVpnService() {
        val intent = Intent(context, MirageService::class.java).apply {
            action = "STOP_SHIELD"
        }
        context.startService(intent)
    }
}
