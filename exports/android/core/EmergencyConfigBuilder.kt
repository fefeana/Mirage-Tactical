package com.mirage.vpn.core

data class ServerConfig(
    val id: String,
    val ip: String,
    val port: Int,
    val protocol: String
)

data class VpnConfig(
    val serverIp: String,
    val port: Int,
    val protocol: String,
    val transport: String,
    val sni: String
)

object EmergencyConfigBuilder {
    
    // مصفوفة الأولويات: نختار VLESS أولاً ثم ننتقل لبروتوكولات أكثر تخفياً إذا لزم الأمر
    private val protocolPriority = listOf("VLESS", "Hysteria2", "TUIC")

    fun buildNextAvailable(serverList: List<ServerConfig>, pingMap: Map<String, Long>): VpnConfig? {
        // 1. فرز الخوادم: نختار الخوادم التي لديها أقل Ping وأعلى استقرار
        val bestServer = serverList
            .filter { (pingMap[it.id] ?: Long.MAX_VALUE) < 500 } // تجاهل الخوادم البطيئة جداً
            .minByOrNull { pingMap[it.id] ?: Long.MAX_VALUE }

        return bestServer?.let { server ->
            // 2. بناء التكوين مع تفعيل تقنيات التمويه (Obfuscation) تلقائياً في حالات الطوارئ
            VpnConfig(
                serverIp = server.ip,
                port = server.port,
                protocol = server.protocol,
                transport = "XTLS-Reality", // فرض التشفير القوي في وضع الطوارئ
                sni = "www.google.com" // استخدام SNI مموه
            )
        }
    }
}
