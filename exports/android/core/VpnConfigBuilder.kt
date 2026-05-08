package com.mirage.vpn.core

/**
 * 🛡️ باني التكوين السيادي (VpnConfigBuilder)
 * هذا الكائن مسؤول عن هندسة الـ JSON المعقد لبروتوكول VLESS وتقنية Reality لضمان التخفي الكامل.
 * يتم توليد الإعدادات ديناميكياً لتفادى التوقيعات الثابتة وتخطي جدران الحماية.
 */
object VpnConfigBuilder {
    
    fun buildVlessRealityConfig(
        address: String,
        uuid: String,
        publicKey: String,
        shortId: String,
        sni: String,
        enableAdBlock: Boolean = true
    ): String {
        // حقن قوانين التوجيه لحجب الإعلانات (Ad-Blocking via Routing)
        val routingRules = if (enableAdBlock) {
            """
            "routing": {
              "domainStrategy": "AsIs",
              "rules": [
                {
                  "type": "field",
                  "domain": ["geosite:category-ads-all"],
                  "outboundTag": "block"
                }
              ]
            },
            """
        } else {
            """"routing": {},"""
        }

        return """
        {
          "log": {
            "access": "none",
            "error": "warning"
          },
          $routingRules
          "outbounds": [
            {
              "protocol": "vless",
              "settings": {
                "vnext": [{
                  "address": "$address",
                  "port": 443,
                  "users": [{
                    "id": "$uuid",
                    "encryption": "none",
                    "flow": "xtls-rprx-vision"
                  }]
                }]
              },
              "streamSettings": {
                "network": "tcp",
                "security": "reality",
                "realitySettings": {
                  "show": false,
                  "fingerprint": "chrome",
                  "serverName": "$sni",
                  "publicKey": "$publicKey",
                  "shortId": "$shortId",
                  "spiderX": "/"
                }
              }
            },
            {
              "tag": "block",
              "protocol": "blackhole",
              "settings": {
                "response": {
                  "type": "none"
                }
              }
            }
          ]
        }
        """.trimIndent()
    }

    fun buildEmergencyHysteriaConfig(
        address: String,
        port: Int,
        auth: String,
        sni: String
    ): String {
        // 🚀 مولد قالب طوارئ للتبديل الخاطف عبر Hysteria2
        return """
        {
            "server": "$address:$port",
            "auth": "$auth",
            "tls": { "sni": "$sni", "insecure": true },
            "bandwidth": { "up": "200 mbps", "down": "200 mbps" },
            "fastOpen": true
        }
        """.trimIndent()
    }
}
