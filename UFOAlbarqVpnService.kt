package com.ufoalbarq.vpn.data.remote

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.content.Intent
import android.net.VpnService
import android.os.Build
import android.os.ParcelFileDescriptor
import android.util.Log
import androidx.core.app.NotificationCompat
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.launch
import java.io.FileInputStream
import java.io.FileOutputStream
import java.nio.ByteBuffer

/**
 * ⚔️ UFO ALBARQ - The Core VPN Service (Samurai Tunnel)
 * يستلم إعدادات Xray-core، ينشئ واجهة TUN الافتراضية، ويدير تدفق البيانات.
 */
class UFOAlbarqVpnService : VpnService() {

    private val tag = "SamuraiVpnService"
    private val notificationId = 1001
    private val channelId = "ufo_albarq_vpn_channel"

    private var vpnInterface: ParcelFileDescriptor? = null
    private var tunnelJob: Job? = null
    
    // محرك Xray-core (واجهة تخيلية تمثل مكتبة libv2ray.so أو ما شابه)
    // في التطبيق الفعلي، ستستدعي دوال الـ JNI الخاصة بـ Xray هنا.
    private var xrayProcessId: Int = -1 

    override fun onCreate() {
        super.onCreate()
        Log.d(tag, "[+] VPN Service Created.")
        createNotificationChannel()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val action = intent?.action
        Log.d(tag, "[-] Received Action: $action")

        when (action) {
            "ACTION_CONNECT" -> {
                val configJson = intent.getStringExtra("EXTRA_CONFIG") ?: ""
                startSamuraiTunnel(configJson)
            }
            "ACTION_DISCONNECT" -> {
                stopSamuraiTunnel()
            }
        }
        
        // START_NOT_STICKY: إذا قتل النظام الخدمة، لا تقم بإعادة تشغيلها تلقائياً بدون Intent صريح
        return START_NOT_STICKY 
    }

    /**
     * ⚡ إطلاق النفق (Establish TUN Interface)
     */
    private fun startSamuraiTunnel(configJson: String) {
        if (vpnInterface != null) {
            Log.w(tag, "[!] Tunnel already active. Ignoring start request.")
            return
        }

        // 1. تشغيل إشعار الـ Foreground Service (إلزامي في أندرويد)
        startForeground(notificationId, createNotification("Samurai Protocol Active 🛡️"))

        // 2. بناء واجهة TUN
        try {
            val builder = Builder()
                .setSession("UFO_ALBARQ_TUNNEL")
                .addAddress("10.0.0.2", 24) // IP محلي وهمي للواجهة
                .addDnsServer("8.8.8.8")    // DNS جوجل (أو DNS مشفر خاص بك)
                .addRoute("0.0.0.0", 0)     // توجيه كل الترافيك عبر النفق
                .setMtu(1500)               // حجم الحزمة القياسي

            // استثناء التطبيق نفسه من الـ VPN لمنع الـ Routing Loop
            builder.addDisallowedApplication(packageName)

            vpnInterface = builder.establish()
            Log.d(tag, "[+] TUN Interface established: ${vpnInterface?.fd}")

            // 3. تشغيل محرك Xray-core في الخلفية (JNI Call)
            // xrayProcessId = XrayNative.startCore(configJson, vpnInterface!!.fd)
            
            // 4. (اختياري) مراقبة تدفق البيانات إذا كنت تكتب محركك الخاص
            // startTrafficMonitor()

        } catch (e: Exception) {
            Log.e(tag, "[X] Failed to establish TUN interface: ${e.message}")
            stopSamuraiTunnel()
        }
    }

    /**
     * 🛑 إيقاف النفق (Tear down TUN Interface)
     */
    private fun stopSamuraiTunnel() {
        Log.d(tag, "[-] Tearing down Samurai Tunnel...")
        
        // 1. إيقاف محرك Xray-core
        // if (xrayProcessId != -1) XrayNative.stopCore(xrayProcessId)

        // 2. إغلاق واجهة TUN
        try {
            vpnInterface?.close()
            vpnInterface = null
        } catch (e: Exception) {
            Log.e(tag, "[X] Error closing TUN interface: ${e.message}")
        }

        // 3. إيقاف الـ Coroutines
        tunnelJob?.cancel()
        tunnelJob = null

        // 4. إيقاف الخدمة
        stopForeground(true)
        stopSelf()
        Log.d(tag, "[+] VPN Service Stopped.")
    }

    /**
     * 👁️ (لأغراض تعليمية) كيف تقرأ وتكتب من واجهة TUN إذا كنت لا تستخدم Xray
     */
    private fun startTrafficMonitor() {
        tunnelJob = CoroutineScope(Dispatchers.IO).launch {
            val fd = vpnInterface?.fileDescriptor ?: return@launch
            val inputStream = FileInputStream(fd)
            val outputStream = FileOutputStream(fd)
            val buffer = ByteBuffer.allocate(32767)

            try {
                while (true) {
                    val length = inputStream.read(buffer.array())
                    if (length > 0) {
                        // هنا تمر الحزم (IP Packets) الصادرة من الجهاز
                        // في تطبيق Xray، الـ Core هو من يقرأ هذا الـ FD مباشرة عبر C/C++
                        // Log.d(tag, "Read $length bytes from TUN")
                    }
                    buffer.clear()
                }
            } catch (e: Exception) {
                Log.e(tag, "Traffic monitor error: ${e.message}")
            }
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        stopSamuraiTunnel()
    }

    // --- إعدادات الإشعارات (Notification Setup) ---
    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                channelId,
                "UFO ALBARQ VPN Status",
                NotificationManager.IMPORTANCE_LOW // Low importance لتجنب الإزعاج الصوتي
            ).apply {
                description = "Shows the active status of the Samurai Tunnel."
            }
            val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            manager.createNotificationChannel(channel)
        }
    }

    private fun createNotification(message: String): Notification {
        return NotificationCompat.Builder(this, channelId)
            // .setSmallIcon(R.drawable.ic_vpn_key) // أضف أيقونة الساموراي هنا
            .setContentTitle("UFO ALBARQ")
            .setContentText(message)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setOngoing(true)
            .build()
    }
}
