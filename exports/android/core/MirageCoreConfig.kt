package com.mirage.app.core

data class VlessSettings(
    val address: String,
    val port: Int,
    val uuid: String,
    val serverName: String,
    val wsPath: String,
    val fingerprint: String? = "chrome"
)

data class TrojanSettings(
    val address: String,
    val port: Int,
    val password: String,
    val serverName: String,
    val fingerprint: String? = "chrome"
)

data class RealitySettings(
    val serverName: String,
    val privateKey: String,
    val shortId: String,
    val fingerprint: String = "chrome"
)

/**
 * MirageCoreConfig: المحرك المسؤول عن توليد تكوينات التشفير لبروتوكولات الساموراي.
 * يدعم VLESS (Reality/WS), Trojan, وتقنيات التمويه المتقدمة.
 */
object MirageCoreConfig {

    /**
     * توليد إعدادات VLESS مع دعم كامل لـ WebSocket و TLS وضغط Gzip.
     */
    fun generateVlessWsTlsConfig(config: VlessSettings): String {
        return """
        {
          "outbounds": [{
            "protocol": "vless",
            "settings": {
              "vnext": [{
                "address": "${config.address}",
                "port": ${config.port},
                "users": [{ "id": "${config.uuid}", "encryption": "none" }]
              }]
            },
            "streamSettings": {
              "network": "ws",
              "security": "tls",
              "tlsSettings": {
                "serverName": "${config.serverName}",
                "allowInsecure": false,
                "fingerprint": "${config.fingerprint ?: "chrome"}"
              },
              "wsSettings": {
                "path": "${config.wsPath}",
                "headers": { "Host": "${config.serverName}" }
              },
              "tcpSettings": {
                "header": {
                  "type": "http",
                  "request": {
                    "headers": { 
                        "Content-Encoding": ["gzip"],
                        "Connection": ["keep-alive"] 
                    }
                  }
                }
              }
            }
          }]
        }
        """.trimIndent()
    }

    /**
     * إعدادات بروتوكول Trojan مع دعم TLS وبصمة إصبع المتصفح.
     */
    fun generateTrojanConfig(config: TrojanSettings): String {
        return """
        {
          "outbounds": [{
            "protocol": "trojan",
            "settings": {
              "servers": [{
                "address": "${config.address}",
                "port": ${config.port},
                "password": "${config.password}"
              }]
            },
            "streamSettings": {
              "network": "tcp",
              "security": "tls",
              "tlsSettings": {
                "serverName": "${config.serverName}",
                "allowInsecure": false,
                "fingerprint": "${config.fingerprint ?: "chrome"}"
              }
            }
          }]
        }
        """.trimIndent()
    }

    /**
     * تعزيز إعدادات Reality للتمويه العميق.
     */
    fun getEnhancedRealityPart(config: RealitySettings): String {
        return """
        "realitySettings": {
            "show": false,
            "dest": "${config.serverName}:443",
            "xver": 0,
            "serverName": "${config.serverName}",
            "privateKey": "${config.privateKey}",
            "shortId": "${config.shortId}",
            "fingerprint": "${config.fingerprint}"
        }
        """.trimIndent()
    }
}
