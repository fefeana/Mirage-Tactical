package com.ufoalbarq.vpn.domain.manager

import android.util.Log
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import kotlinx.coroutines.flow.flowOn
import kotlinx.coroutines.withContext
import java.io.InputStream
import java.io.OutputStream
import java.net.HttpURLConnection
import java.net.URL
import kotlin.system.measureTimeMillis

/**
 * ⚔️ UFO ALBARQ - Speed Test Manager (The Scout)
 * مسؤول عن قياس جودة الاتصال (Ping, Download, Upload) عبر النفق المشفر.
 */
class SpeedTestManager {

    private val tag = "SamuraiSpeedTest"
    
    // خوادم اختبار قياسية (يفضل استبدالها بخوادمك الخاصة أو خوادم قريبة)
    private val downloadTestUrl = "https://speed.hetzner.de/100MB.bin" 
    private val uploadTestUrl = "https://httpbin.org/post" // خادم يقبل طلبات POST للاختبار

    /**
     * 1. قياس الـ Ping (الكمون)
     */
    suspend fun measurePing(serverUrl: String = "https://www.google.com"): Long = withContext(Dispatchers.IO) {
        try {
            val time = measureTimeMillis {
                val url = URL(serverUrl)
                val connection = url.openConnection() as HttpURLConnection
                connection.connectTimeout = 3000
                connection.readTimeout = 3000
                connection.requestMethod = "HEAD"
                connection.connect()
                
                if (connection.responseCode >= 400) {
                    throw Exception("HTTP Error: ${connection.responseCode}")
                }
                connection.disconnect()
            }
            Log.d(tag, "[+] Ping measured: ${time}ms")
            return@withContext time
        } catch (e: Exception) {
            Log.e(tag, "[X] Ping failed: ${e.message}")
            return@withContext -1L
        }
    }

    /**
     * 2. قياس سرعة التحميل (Download Speed)
     */
    fun measureDownloadSpeedFlow(): Flow<Double> = flow {
        var connection: HttpURLConnection? = null
        var inputStream: InputStream? = null
        
        try {
            Log.d(tag, "[-] Initiating Download Speed Test...")
            val url = URL(downloadTestUrl)
            connection = url.openConnection() as HttpURLConnection
            connection.connectTimeout = 5000
            connection.readTimeout = 5000
            connection.connect()

            if (connection.responseCode != HttpURLConnection.HTTP_OK) {
                throw Exception("Server returned HTTP ${connection.responseCode}")
            }

            inputStream = connection.inputStream
            val buffer = ByteArray(8192)
            var bytesRead: Int
            var totalDownloadedBytes = 0L
            
            val startTime = System.currentTimeMillis()
            var lastEmitTime = startTime
            val maxTestDurationMs = 5000L 

            while (inputStream.read(buffer).also { bytesRead = it } != -1) {
                totalDownloadedBytes += bytesRead
                val currentTime = System.currentTimeMillis()
                
                if (currentTime - lastEmitTime >= 250) {
                    val durationInSeconds = (currentTime - startTime) / 1000.0
                    if (durationInSeconds > 0) {
                        val speedMbps = (totalDownloadedBytes * 8.0) / (1024 * 1024) / durationInSeconds
                        emit(speedMbps)
                        lastEmitTime = currentTime
                    }
                }
                
                if (currentTime - startTime > maxTestDurationMs) {
                    break
                }
            }
            Log.d(tag, "[+] Download test completed.")
        } catch (e: Exception) {
            Log.e(tag, "[X] Download test failed: ${e.message}")
            emit(0.0)
        } finally {
            inputStream?.close()
            connection?.disconnect()
        }
    }.flowOn(Dispatchers.IO)

    /**
     * 3. قياس سرعة الرفع (Upload Speed)
     * يعيد السرعة النهائية بالميغابت في الثانية (Mbps).
     */
    suspend fun measureUploadSpeed(): Double = withContext(Dispatchers.IO) {
        var connection: HttpURLConnection? = null
        var outputStream: OutputStream? = null
        
        try {
            Log.d(tag, "[-] Initiating Upload Speed Test...")
            val url = URL(uploadTestUrl)
            connection = url.openConnection() as HttpURLConnection
            connection.connectTimeout = 5000
            connection.readTimeout = 5000
            connection.doOutput = true // تفعيل إرسال البيانات (POST)
            connection.requestMethod = "POST"
            connection.setRequestProperty("Content-Type", "application/octet-stream")

            // تجهيز حمولة وهمية (Payload) بحجم 1 ميغابايت للاختبار
            val payloadSize = 1024 * 1024 // 1 MB
            val dataToUpload = ByteArray(payloadSize) { 0x00 } // مصفوفة مليئة بالأصفار
            
            connection.setFixedLengthStreamingMode(payloadSize)

            val startTime = System.currentTimeMillis()
            
            outputStream = connection.outputStream
            
            // إرسال البيانات على دفعات (Chunks) لعدم إرهاق الذاكرة
            val chunkSize = 8192 // 8 KB
            var bytesUploaded = 0
            
            while (bytesUploaded < payloadSize) {
                val currentChunkSize = minOf(chunkSize, payloadSize - bytesUploaded)
                outputStream.write(dataToUpload, bytesUploaded, currentChunkSize)
                bytesUploaded += currentChunkSize
            }
            
            outputStream.flush()

            // انتظار استجابة الخادم للتأكد من وصول البيانات
            val responseCode = connection.responseCode
            if (responseCode >= 400) {
                throw Exception("Server returned HTTP $responseCode")
            }

            val endTime = System.currentTimeMillis()
            val durationInSeconds = (endTime - startTime) / 1000.0
            
            if (durationInSeconds > 0) {
                val sizeInBits = payloadSize * 8.0
                val speedMbps = (sizeInBits / durationInSeconds) / 1_000_000.0
                Log.d(tag, "[+] Upload test completed: ${String.format("%.2f", speedMbps)} Mbps")
                return@withContext speedMbps
            } else {
                return@withContext 0.0
            }

        } catch (e: Exception) {
            Log.e(tag, "[X] Upload test failed: ${e.message}")
            return@withContext 0.0
        } finally {
            outputStream?.close()
            connection?.disconnect()
        }
    }
}
