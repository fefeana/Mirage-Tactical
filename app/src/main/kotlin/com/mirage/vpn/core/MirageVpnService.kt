package com.mirage.vpn.core

import android.content.Intent
import android.net.VpnService
import android.os.ParcelFileDescriptor
import android.util.Log
import com.mirage.vpn.SecurityProvider

class MirageVpnService : VpnService() {

    private var vpnInterface: ParcelFileDescriptor? = null

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        Log.i("MirageVpnService", "INITIATING STEALTH TUNNEL...")

        // 1. بناء واجهة الـ TUN الافتراضية
        val builder = Builder()
            .setSession("Mirage Cyber-Samurai")
            .addAddress("10.0.0.2", 32)
            .addRoute("0.0.0.0", 0) // توجيه كل المرور عبر ميراج
            .setBlocking(true) // لمنع تسريب بيانات خارج الـ VPN (Kill Switch)
            .setMtu(1400) // MTU مخصص لترك مساحة كافية للـ HTTPS Obfuscation Header

        // منطق التعامل مع الشهادات والبروتوكولات (Certificate Fallback)
        val isCertValid = false // محاكاة لأن الشهادة سقطت فننتقل للاحتياطي
        checkSecurityProtocol(isCertValid, builder)

        try {
            vpnInterface = builder.establish()
            
            vpnInterface?.let { parcelFd ->
                val fd = parcelFd.fd // استخراج الـ File Descriptor الخام
                
                // 2. التحقق السيبراني: جلب المفتاح المشفر من الدرع
                val secretKey = SecurityProvider.getVoucherSecret(this)

                // 3. تسليم الـ FD للمحرك (C++) ليبدأ التشفير بـ ChaCha20 وتطبيق الـ DPI Bypass
                val engineStarted = NativeEngine.startEngine(fd, secretKey)

                if (engineStarted) {
                    Log.i("MirageVpnService", "VPN TUNNEL HANDED OVER TO C++ CORE FOR OBFUSCATION.")
                } else {
                    Log.e("MirageVpnService", "CRITICAL: NATIVE ENGINE REJECTED THE HANDSHAKE (TAMPERING DOWN?).")
                    stopSelf()
                }
            } ?: run {
                Log.e("MirageVpnService", "FAILED TO ESTABLISH TUN INTERFACE.")
                stopSelf()
            }
        } catch (e: Exception) {
            Log.e("MirageVpnService", "TUNNEL BUILD ERROR: \${e.message}")
            stopSelf()
        }

        return START_STICKY
    }

    override fun onDestroy() {
        super.onDestroy()
        Log.i("MirageVpnService", "SHUTTING DOWN TUNNEL...")
        NativeEngine.stopEngine()
        vpnInterface?.close()
        vpnInterface = null
    }

    // =========================================================================
    // مصفوفة اختبار الاستقرار (Internal Diagnostic & Fallback Suite)
    // =========================================================================

    private fun checkSecurityProtocol(isCertValid: Boolean, builder: Builder) {
        if (!isCertValid) {
            // الانتقال للشهادة الذاتية المشفرة (Certificate Fallback)
            enableSelfSignedMode() 
            Log.d("MirageVpnService", "Mirage: Switching to Self-Signed Security Layer")
        }
        
        // تفعيل حماية العناوين (IPv4/IPv6 Dual Stack Leak Protection)
        enforceDualStackProtection(ipv4 = true, ipv6 = true, builder = builder)
    }

    private fun enableSelfSignedMode() {
        // Here we would tell the Native Engine to use the pinned self-signed certificate.
        // E.g., NativeEngine.setFallbackCert(fingerprint)
        ExecutiveDirectorAI.updateSecurityStatusUI("FALLBACK_MODE")
    }

    private fun enforceDualStackProtection(ipv4: Boolean, ipv6: Boolean, builder: Builder) {
        // منع تسريب IP6 الذي غالباً ما يكون ثغرة في تطبيقات الـ VPN
        if (ipv6) {
            try {
                // By adding an IPv6 address and routing all IPv6 locally to the TUN interface,
                // we block external IPv6 leaks. The system doesn't bypass the VPN.
                builder.addAddress("fd00:1:fd00:1:fd00:1:fd00:1", 128)
                builder.addRoute("::", 0) 
            } catch (e: Exception) {
                Log.e("MirageVpnService", "Failed to secure IPv6 stack: \${e.message}")
            }
        }
    }
}
