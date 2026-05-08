package com.mirage.app.core

import java.net.InetSocketAddress
import java.net.Socket
import kotlin.system.measureTimeMillis
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

/**
 * MiragePingManager: المحرك المسؤول عن قياس زمن الاستجابة (Latency) 
 * واختيار أفضل سيرفر متاح لتأمين اتصال الساموراي.
 */
object MiragePingManager {

    var latestPing: Long = 0L

    /**
     * اختبار Ping للسيرفر باستخدام Socket Connection لضمان الدقة
     */
    suspend fun checkPing(address: String, port: Int, timeout: Int = 3000): Long = withContext(Dispatchers.IO) {
        val timeResult = try {
            val socket = Socket()
            val time = measureTimeMillis {
                socket.connect(InetSocketAddress(address, port), timeout)
            }
            socket.close()
            time
        } catch (e: Exception) {
            Long.MAX_VALUE // السيرفر غير مستجيب
        }
        latestPing = timeResult
        return@withContext timeResult
    }
    
    fun getLatestPing(): Long {
        return latestPing
    }

    /**
     * اختيار أفضل إعداد (Best Configuration) من القائمة بناءً على أقل زمن استجابة
     */
    suspend fun selectBestConfig(configs: List<MirageServerConfig>): MirageServerConfig? {
        return configs
            .map { it to checkPing(it.address, it.port) }
            .filter { it.second < Long.MAX_VALUE }
            .minByOrNull { it.second }?.first
    }
}

/**
 * نموذج بيانات إعدادات السيرفر
 */
data class MirageServerConfig(
    val id: String,
    val name: String,
    val address: String,
    val port: Int,
    val protocol: MirageProtocol // VLESS, TROJAN, SATELLITE
)

enum class MirageProtocol {
    VLESS_REALITY, VLESS_WS, TROJAN, SATELLITE_EMERGENCY
}
