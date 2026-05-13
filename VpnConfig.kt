kotlin
package com.ufoalbarq.vpn.domain.model

data class VpnConfig(
    // 🖥️ قائمة الخوادم
    val servers: List<String> = listOf(
        "mcp-server.net",
        "gcp-main.net",
        "firebase-node.net",
        "local-node"
    ),

    // 🌐 البروتوكولات
    val globalProtocols: List<String> = listOf(
        "WireGuard",
        "OpenVPN",
        "IKEv2",
        "XTLS-Reality"
    ),
    val localProtocols: List<String> = listOf(
        "AES-256-GCM",
        "ChaCha20-Poly1305"
    ),

    // ⚡ إعدادات النفق
    val sni: String = "",
    val protocol: String = "",
    val transport: String = "",
    val port: Int = 443,
    val auth: String? = null,
    val obfs: String? = null,
    val uuid: String? = null,
    val reality: Boolean = false,
    val isPremium: Boolean = false,

    // 🤖 وظائف AI
    val aiPolicies: Map<String, Any> = mapOf(
        "retry" to mapOf(
            "enabled" to true,
            "attempts" to 5,
            "backoff" to "exponential",
            "timeout" to 3000
        ),
        "failover" to mapOf(
            "enabled" to true,
            "primary" to "gcp-main",
            "backup" to listOf("mcp-server.net","firebase-node.net","local-node"),
            "switchonerror" to true
        ),
        "routing" to mapOf(
            "enabled" to true,
            "strategy" to "nearest-region",
            "healthcheckinterval" to 60
        ),
        "load_balancer" to mapOf(
            "enabled" to true,
            "algorithm" to "round-robin",
            "max_cpu" to 70,
            "auto_rebalance" to true
        ),
        "health_checks" to mapOf(
            "enabled" to true,
            "monitor" to listOf("api-stream","db-node","satellite-module"),
            "actiononfail" to "switch-route"
        )
    )
) {
    companion object {
        fun fromMap(map: Map<String, Any>): VpnConfig {
            return VpnConfig(
                servers = (map["servers"] as? List<String>) ?: listOf(
                    "mcp-server.net",
                    "gcp-main.net",
                    "firebase-node.net",
                    "local-node"
                ),
                protocol = map["protocol"] as? String ?: "",
                port = (map["port"] as? Number)?.toInt() ?: 443,
                auth = map["auth"] as? String,
                obfs = map["obfs"] as? String,
                uuid = map["uuid"] as? String,
                reality = map["reality"] as? Boolean ?: false,
                isPremium = map["auth"] != null
            )
        }
    }
}
`
