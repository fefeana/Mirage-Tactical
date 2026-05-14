package com.ufoalbarq.vpn.domain.model

data class VpnConfig(
    val serverIp: String = "",
    val sni: String = "",
    val protocol: String = "",
    val transport: String = "",
    val isPremium: Boolean = false,
    val port: Int = 443,
    val auth: String? = null,
    val obfs: String? = null,
    val uuid: String? = null,
    val reality: Boolean = false
) {
    companion object {
        fun fromMap(map: Map<String, Any>): VpnConfig {
            return VpnConfig(
                serverIp = map["server"] as? String ?: "",
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
