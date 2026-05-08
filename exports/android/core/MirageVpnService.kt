package com.mirage.vpn.core

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.net.VpnService
import android.os.Build
import android.os.ParcelFileDescriptor
import android.util.Log
import androidx.core.app.NotificationCompat
import com.mirage.vpn.sentinel.SentinelObserver
import kotlinx.coroutines.*
import java.io.IOException

/**
 * ⚡ Mirage VPN Service
 * الخدمة السيادية التي تُنشئ الـ TUN Interface وتربط الترافيك بمحرك JNI السيبراني.
 */
class MirageVpnService : VpnService() {

    private var tunnelInterface: ParcelFileDescriptor? = null
    private val serviceScope = CoroutineScope(Dispatchers.IO + SupervisorJob())
    private var isEngineRunning = false

    companion object {
        const val TAG = "MirageVpnService"
        const val ACTION_CONNECT = "com.mirage.vpn.CONNECT"
        const val ACTION_DISCONNECT = "com.mirage.vpn.DISCONNECT"
        const val NOTIFICATION_CHANNEL_ID = "mirage_vpn_channel"
        const val EXTRA_CONFIG = "vpn_config_json"
    }

    // --- Native Methods Definitions ---
    private external fun startEngine(config: String): Int
    private external fun stopEngine(): Int
    private external fun updateConfig(newConfig: String): Int

    override fun onCreate() {
        super.onCreate()
        initializeNativeEngine()
    }

    private fun initializeNativeEngine() {
        val abi = android.os.Build.SUPPORTED_ABIS.getOrNull(0) ?: "unknown"
        Log.i(TAG, "Detecting Device DNA: $abi")

        try {
            // المحاولة القياسية لتحميل المكتبة
            System.loadLibrary("mirage_core")
            Log.i(TAG, "Native library loaded successfully from local storage.")
        } catch (e: UnsatisfiedLinkError) {
            Log.e(TAG, "Native library missing for architecture: $abi. Initiating AI Recovery...")
            
            // إرسال إشارة خفية للواجهة للتحول لوضع "الرادار" (Analyzing)
            updateUI("Missing ABI component. AI Auto-Repair Engaged...")
            val intent = Intent("com.mirage.vpn.STATE_CHANGE").apply {
                putExtra("state", "ANALYZING")
            }
            sendBroadcast(intent)
            
            // التكامل مع SamuraiMcpManager لطلب المكتبة ديناميكيًا
            SamuraiMcpManager.requestMissingModule(
                context = this,
                architecture = abi,
                platform = "Android",
                callback = { success, filePath ->
                    try {
                        if (success) {
                            System.load(filePath)
                            Log.i(TAG, "Dynamic Module injected successfully: $filePath")
                            updateUI("Universal Engine Ready ⚡")
                            val readyIntent = Intent("com.mirage.vpn.STATE_CHANGE").apply {
                                putExtra("state", "IDLE")
                            }
                            sendBroadcast(readyIntent)
                        } else {
                            Log.e(TAG, "Failed to inject dynamic module: MCP failed")
                        }
                    } catch (ex: Exception) {
                        Log.e(TAG, "Failed to inject dynamic module: ${ex.message}")
                        updateUI("AI Recovery failed to synthesize module.")
                        val errIntent = Intent("com.mirage.vpn.STATE_CHANGE").apply {
                            putExtra("state", "ERROR")
                        }
                        sendBroadcast(errIntent)
                    }
                }
            )
        }
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val action = intent?.action
        
        when (action) {
            ACTION_CONNECT -> {
                val config = intent.getStringExtra(EXTRA_CONFIG) ?: "{}"
                startForeground(1, createNotification("Infiltrating Network..."))
                
                // بدء الاتصال في Thread منفصل لعدم تجميد الواجهة وتأمين الأداء
                serviceScope.launch { 
                    establishConnection(config) 
                }
            }
            ACTION_DISCONNECT -> {
                stopVpnConnection()
            }
        }
        
        return START_STICKY
    }

    private fun establishConnection(configJson: String) {
        if (isEngineRunning) return
        
        Log.i(TAG, "[⚔️ TUNNEL] البدء في حفر النفق المشفر المباشر...")
        
        try {
            val builder = Builder()
            
            // 🛡️ إعدادات النفق السيادي لتمرير الترافيك للجهاز بالكامل
            builder.setSession("Mirage VLESS Tunnel")
                   .addAddress("10.0.0.2", 32)
                   .addRoute("0.0.0.0", 0)
                   .setMtu(1500)
            
            tunnelInterface = builder.establish()
            
            if (tunnelInterface != null) {
                Log.i(TAG, "[⚔️ TUNNEL] تم فتح واجهة TUN بنجاح. نقل ملف الوصف (FD) إلى C++...")
                safeStartEngine(configJson) // نستخدم الدالة الآمنة الآن
            } else {
                 Log.e(TAG, "❌ [TUNNEL ERROR] تم رفض الإذن بإنشاء واجهة الـ VPN من قبل النظام.")
            }
            
        } catch (e: Exception) {
            Log.e(TAG, "❌ [CRITICAL] خطأ أثناء إنشاء النفق: ", e)
            stopVpnConnection()
        }
    }

    // --- Wrapped Functions ---

    /**
     * تشغيل المحرك مع معالجة استثناءات الربط
     */
    fun safeStartEngine(config: String) {
        try {
            Log.d(TAG, "Attempting to start Cyber-Engine...")
            val result = startEngine(config)
            if (result == 0) {
                Log.i(TAG, "Engine started successfully.")
                isEngineRunning = true
                updateNotification("Mirage Portal Active ⚔️")
                startTelemetryMonitoring()
            } else {
                Log.w(TAG, "Engine started with warning code: $result")
                updateUI("Error: Engine returned code $result.")
                stopVpnConnection()
            }
        } catch (e: UnsatisfiedLinkError) {
            Log.e(TAG, "JNI Error: startEngine not found. Check architecture compatibility.")
            handleFatalError(e)
            stopVpnConnection()
        } catch (e: Exception) {
            Log.e(TAG, "Unexpected error during engine startup: ${e.localizedMessage}")
            updateUI("Engine failed to ignite.")
            stopVpnConnection()
        }
    }

    /**
     * إيقاف المحرك بأمان
     */
    fun safeStopEngine() {
        try {
            if (!isEngineRunning) return
            Log.d(TAG, "Shutting down engine...")
            stopEngine()
            isEngineRunning = false
        } catch (e: UnsatisfiedLinkError) {
            Log.e(TAG, "JNI Error: stopEngine mapping failed.")
        } catch (e: Exception) {
            Log.e(TAG, "General error during shutdown: ${e.message}")
        }
    }

    /**
     * تحديث التكوين (Hot-Update)
     */
    fun safeUpdateConfig(newConfig: String) {
        try {
            if (!isEngineRunning) return
            Log.d(TAG, "Updating core configuration...")
            val updateResult = updateConfig(newConfig)
            Log.i(TAG, "Update status: $updateResult")
            updateNotification("Route Updated 🔄")
        } catch (e: UnsatisfiedLinkError) {
            Log.e(TAG, "JNI Error: updateConfig method is missing.")
        } catch (e: Exception) {
            Log.e(TAG, "Failed to apply new configuration: ${e.message}")
        }
    }

    private fun handleFatalError(e: Throwable) {
        // رسالة للواجهة وحفظ سجل الفشل للـ Genkit لاحقاً
        updateUI("Fatal Error: Entering Failsafe Mode.")
        Log.e(TAG, "Mirage Service is entering 'Failsafe' mode due to native error.")
    }

    // 2. تشغيل روتين مراقبة القياس عن بُعد (Sentinel)
    private fun startTelemetryMonitoring() {
        serviceScope.launch {
            SentinelObserver.startMonitoring().collect { telemetryData ->
                // تشغيل ملاحظات مرئية أو تسجيل الحالة
                Log.d("MirageSentinel", "Network Load: Ping ${telemetryData.latencyMs}ms | Loss: ${telemetryData.packetLossPercent}%")
                
                // إرسال البيانات للـ UI
                updateUI("Ping: ${telemetryData.latencyMs}ms | Status: Connected")
            }
        }
    }

    private fun stopVpnConnection() {
        Log.w(TAG, "[🛑 TUNNEL] إغلاق النفق وبتر الاتصال...")
        
        safeStopEngine()
        
        try {
            tunnelInterface?.close()
            tunnelInterface = null
        } catch (e: IOException) {
            Log.e(TAG, "Error closing tunnel", e)
        }
        
        stopForeground(true)
        stopSelf()
    }

    // ==========================================
    // 🛡️ إشعارات الخدمة الخلفية المستمرة وتواصل الواجهة
    // ==========================================
    
    fun updateUI(message: String) {
        // إرسال تحديث للواجهة الأمامية لـ MirageModernUI
        val intent = Intent("com.mirage.vpn.UI_UPDATE").apply { 
            putExtra("message", message) 
        }
        sendBroadcast(intent)
        updateNotification(message)
    }

    fun triggerVisualPulse() {
        // إشارة للواجهة للومض باللون الأحمر أو الزمردي لدلالة تغيير المسار
        val intent = Intent("com.mirage.vpn.PULSE_ALERT")
        sendBroadcast(intent)
    }

    private fun createNotification(message: String): Notification {
        val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                NOTIFICATION_CHANNEL_ID,
                "Mirage Secure Protocol",
                NotificationManager.IMPORTANCE_LOW
            )
            manager.createNotificationChannel(channel)
        }

        return NotificationCompat.Builder(this, NOTIFICATION_CHANNEL_ID)
            .setContentTitle("UFO ALBARQ ☢️")
            .setContentText(message)
            .setSmallIcon(android.R.drawable.ic_secure) // يفضل تغييرها لأيقونة خاصة بك
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .build()
    }

    private fun updateNotification(message: String) {
        val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        manager.notify(1, createNotification(message))
    }

    override fun onDestroy() {
        super.onDestroy()
        stopVpnConnection()
        serviceScope.cancel()
    }
}
