package com.mirage.app.services

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Intent
import android.net.VpnService
import android.os.Build
import android.os.ParcelFileDescriptor
import android.util.Log
import com.mirage.app.core.MirageCoreConfig
import com.mirage.app.core.MirageNotificationManager
import com.mirage.app.core.MiragePingManager
import com.mirage.app.core.VlessSettings
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch

class MirageService : VpnService() {

    private var vpnInterface: ParcelFileDescriptor? = null
    private val serviceScope = CoroutineScope(Dispatchers.IO)

    override fun onCreate() {
        super.onCreate()
        Log.d("MirageService", "VPN Service created.")
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val action = intent?.action
        
        if (action == "STOP_SHIELD") {
            stopSelf()
            return START_NOT_STICKY
        }
        
        // تشغيل الخدمة في الواجهة الأمامية (Foreground)
        val notification = MirageNotificationManager.createNotification(this, "جاري تأمين الاتصال...", "-- ms")
        
        // في أندرويد 14+ يجب تحديد نوع الخدمة برمجياً أيضاً
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
            startForeground(MirageNotificationManager.NOTIFICATION_ID, notification, 
                android.content.pm.ServiceInfo.FOREGROUND_SERVICE_TYPE_SPECIAL_USE)
        } else {
            startForeground(MirageNotificationManager.NOTIFICATION_ID, notification)
        }

        // هنا تضع منطق الاتصال الخاص بك (VLESS، الساتلايت، إلخ)
        startMirageConnection()
        startNotificationUpdateLoop()

        return START_STICKY // لضمان إعادة تشغيل الخدمة إذا أغلقها النظام
    }

    private fun startMirageConnection() {
        serviceScope.launch {
            try {
                // 1. توليد التكوين للاتصال بـ VLESS
                // (في بيئة الإنتاج، يتم جلب هذه البيانات من الواجهة أو قاعدة البيانات)
                val coreConfig = VlessSettings(
                    address = "node1.mirage.net",
                    port = 443,
                    uuid = "your-mirage-uuid",
                    serverName = "www.microsoft.com",
                    wsPath = "/graphql",
                    fingerprint = "chrome"
                )
                
                val jsonConfig = MirageCoreConfig.generateVlessWsTlsConfig(coreConfig)
                Log.d("MirageService", "Generated Config: $jsonConfig")
                
                // 2. إعداد جسر الـ VPN (Tun Device)
                setupVpnInterface()
                
                // 3. تمرير ملف الـ JSON وواجهة الـ TUN لمحرك Xray (Core)
                startXrayCore(jsonConfig)
                
            } catch (e: Exception) {
                Log.e("MirageService", "فشل تشغيل نفق Mirage: \${e.message}")
            }
        }
    }
    
    private fun setupGamingTunnel(builder: Builder, gamePackages: List<String>) {
        gamePackages.forEach { packageName ->
            try {
                builder.addAllowedApplication(packageName) 
                // الآن فقط هذه الألعاب ستمر عبر النفق السحابي المخصص
            } catch (e: Exception) {
                Log.e("MirageService", "تطبيق غير موجود: $packageName")
            }
        }
    }

    private fun setupVpnInterface(isGamingMode: Boolean = false) {
        if (vpnInterface != null) return
        
        val builder = Builder()
        builder.setSession("Mirage VPN")
            .addAddress("10.0.0.2", 24)
            .addDnsServer("1.1.1.1")
            .addDnsServer("8.8.8.8")
            .addRoute("0.0.0.0", 0) // توجيه كل الترافيك عبر النفق
            
        if (isGamingMode) {
            setupGamingTunnel(builder, com.mirage.app.core.MirageCloudRouter.popularGamingPackages)
        }

        
        // منع التسريب (Kill Switch) (اختياري)
        // builder.setBlocking(true)

        vpnInterface = builder.establish()
        Log.d("MirageService", "TUN Device established successfully.")
    }
    
    private fun startXrayCore(configJson: String) {
        // TODO: دمج مكتبة JNI الأصلية لتشغيل Xray Core وتمرير configJson و File Descriptor الخاص بالـ TUN
        // مثال وهمي: XrayNative.start(configJson, vpnInterface?.fd ?: -1)
        Log.d("MirageService", "Xray Core should be starting now with generated config...")
    }

    private fun startNotificationUpdateLoop() {
        serviceScope.launch {
            while (isActive) {
                val currentPing = MiragePingManager.getLatestPing()
                val pingStr = if (currentPing == Long.MAX_VALUE || currentPing == 0L) "-- ms" else "$currentPing ms"
                MirageNotificationManager.updateNotification(
                    this@MirageService,
                    "الدرع نشط 🛡️",
                    pingStr
                )
                delay(5000) // تحديث الإشعار كل 5 ثوانٍ
            }
        }
    }

    override fun onTaskRemoved(rootIntent: Intent?) {
        // هذا الكود يعمل عند سحب التطبيق من قائمة المهام (Swiped away)
        com.mirage.app.core.MirageSanitizer.performFullWipe(applicationContext)
        stopSelf()
        super.onTaskRemoved(rootIntent)
    }

    override fun onDestroy() {
        super.onDestroy()
        // تنظيف الموارد وإغلاق الاتصالات
        try {
            vpnInterface?.close()
            vpnInterface = null
            // إيقاف الـ Core هنا (مثال: XrayNative.stop())
        } catch (e: Exception) {
            Log.e("MirageService", "Error during termination", e)
        }
    }
}
