package com.mirage.vpn.core.network

import android.util.Log
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONObject
import java.io.BufferedReader
import java.io.InputStreamReader
import java.net.HttpURLConnection
import java.net.URL
import javax.crypto.Cipher
import javax.crypto.spec.IvParameterSpec
import javax.crypto.spec.SecretKeySpec
import java.security.MessageDigest

/**
 * 🛰️ محرك جلب الإعدادات سيبرانياً (Mirage Config Fetcher)
 * يتصل بالسحابة، يستقبل البيانات المشفرة، يفك تشفيرها في الـ RAM ويمررها للـ VpnService
 */
object ConfigFetcher {
    private const val TAG = "MirageConfigFetcher"
    private const val API_ENDPOINT = "https://us-central1-mirage-vpn-cloud.cloudfunctions.net/getSecureConfig"
    
    // مفتاح التشفير السري (يجب أن يكون مخفياً عبر JNI في بيئة الإنتاج الفعلي)
    private const val CLIENT_SECRET = "MIRAGE_SECURE_ENCLAVE_KEY_2026"

    /**
     * جلب وفك تشفير إعدادات السيرفر ديناميكياً
     */
    suspend fun fetchSecureConfig(serverNodeId: String): String? = withContext(Dispatchers.IO) {
        try {
            Log.i(TAG, "Initiating secure uplink to Cloud API for node: \$serverNodeId")
            
            // 1. الاتصال بـ API السحابة
            val url = URL("\$API_ENDPOINT?nodeId=\$serverNodeId")
            val connection = url.openConnection() as HttpURLConnection
            connection.requestMethod = "GET"
            connection.connectTimeout = 5000
            connection.readTimeout = 5000

            if (connection.responseCode != HttpURLConnection.HTTP_OK) {
                Log.e(TAG, "Cloud API uplink failed: \${connection.responseCode}")
                return@withContext null
            }

            val reader = BufferedReader(InputStreamReader(connection.inputStream))
            val encryptedPayload = reader.use { it.readText() }
            
            // 2. فك التشفير (Decrypting AES-256-CBC)
            val decryptedJson = decryptConfig(encryptedPayload, CLIENT_SECRET)
            Log.i(TAG, "Payload decrypted successfully. XTLS-Reality config injected to RAM.")
            
            return@withContext decryptedJson

        } catch (e: Exception) {
            Log.e(TAG, "Phantom attack or network error intercepted: \${e.message}")
            return@withContext null
        }
    }

    /**
     * خوارزمية فك التشفير المضادة للـ AES-256-CBC
     */
    private fun decryptConfig(encryptedData: String, secretKey: String): String {
        val parts = encryptedData.split(":")
        if (parts.size != 2) throw IllegalArgumentException("Malformed encrypted payload")

        val ivHex = parts[0]
        val cipherHex = parts[1]

        val iv = hexStringToByteArray(ivHex)
        val encryptedByteArray = hexStringToByteArray(cipherHex)

        // Generate 32-byte key from the secret string (matching Node.js behavior)
        val digest = MessageDigest.getInstance("SHA-256")
        val keyBytes = digest.digest(secretKey.toByteArray(Charsets.UTF_8)).copyOf(32)

        val cipher = Cipher.getInstance("AES/CBC/PKCS5Padding")
        val secretKeySpec = SecretKeySpec(keyBytes, "AES")
        val ivParameterSpec = IvParameterSpec(iv)

        cipher.init(Cipher.DECRYPT_MODE, secretKeySpec, ivParameterSpec)
        val decryptedBytes = cipher.doFinal(encryptedByteArray)

        return String(decryptedBytes, Charsets.UTF_8)
    }

    private fun hexStringToByteArray(s: String): ByteArray {
        val len = s.length
        val data = ByteArray(len / 2)
        var i = 0
        while (i < len) {
            data[i / 2] = ((Character.digit(s[i], 16) shl 4) + Character.digit(s[i + 1], 16)).toByte()
            i += 2
        }
        return data
    }
}
