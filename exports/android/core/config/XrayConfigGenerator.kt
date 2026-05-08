package com.mirage.vpn.core.config

import org.json.JSONArray
import org.json.JSONObject

/**
 * 🛡️ خوارزمية التوليد الداخلي للـ Xray Config
 * تمنع الاعتماد على أكواد مسروقة خارجية، وتتم التوليفة محلياً بالذاكرة (RAM) 
 * كي لا يتم تسريبها للمتطفلين أو عبر الهندسة العكسية.
 */
object XrayConfigGenerator {

    fun generateRealityConfig(
        serverIp: String,
        port: Int,
        uuid: String,
        shortId: String,
        publicKey: String,
        sni: String
    ): String {
        val config = JSONObject()
        
        // 1. إعداد الـ Inbound (نقطة دخول الترافيك من الجهاز)
        val inbound = JSONObject().apply {
            put("port", 10808)
            put("protocol", "socks")
            put("listen", "127.0.0.1")
            put("settings", JSONObject().put("udp", true))
        }
        config.put("inbounds", JSONArray().put(inbound))

        // 2. إعداد الـ Outbound مع بروتوكول VLESS + XTLS-Reality للتمويه
        val outbound = JSONObject().apply {
            put("protocol", "vless")
            put("settings", JSONObject().apply {
                val vnext = JSONObject().apply {
                    put("address", serverIp)
                    put("port", port)
                    put("users", JSONArray().put(JSONObject().apply {
                        put("id", uuid)
                        put("encryption", "none")
                        put("flow", "xtls-rprx-vision")
                    }))
                }
                put("vnext", JSONArray().put(vnext))
            })
            
            // إضافة طبقة العتاد الثقيل (Reality) للهروب من الـ DPI
            put("streamSettings", JSONObject().apply {
                put("network", "tcp")
                put("security", "reality")
                put("realitySettings", JSONObject().apply {
                    put("serverName", sni)
                    put("fingerprint", "chrome") // التخفي كمتصفح كروم
                    put("show", false)
                    put("publicKey", publicKey)
                    put("shortId", shortId)
                    put("spiderX", "/")
                })
            })
        }
        config.put("outbounds", JSONArray().put(outbound))

        return config.toString(4)
    }
}
