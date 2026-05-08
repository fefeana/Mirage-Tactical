package com.mirage.vpn.core

import android.content.Context
import android.content.pm.PackageManager
import android.os.Build
import com.mirage.vpn.BuildConfig
import java.security.MessageDigest

object SecurityProvider {
    init {
        // تحميل المكتبة التي حكناها في المرحلة الأولى
        System.loadLibrary("mirage_security")
    }

    @JvmStatic
    external fun getShieldedKey(): String

    fun getTacticalAuthHeader(): String {
        val secureKey = getShieldedKey()
        // هنا يمكنك إضافة منطق إضافي مثل إضافة Timestamp أو Hash
        return "Tactical-Auth $secureKey"
    }

    // ==========================================
    // دالة فحص البصمة (The Signature Guardian)
    // ==========================================
    fun verifyIntegrity(context: Context): Boolean {
        // إذا كنا في وضع التطوير (Debug) يمكننا تخطي الفحص حتى لا يزعجنا أثناء اختبار الكود
        if (BuildConfig.DEBUG) return true 

        return try {
            val currentSignature = getSigningCertificate(context)
            // البصمة المطلوبة يتم سحبها من الكومبايلر مباشرة ولا يمكن تغييرها (Hardcoded by Gradle)
            if (currentSignature == BuildConfig.EXPECTED_SIGNATURE) {
                true // البصمة سليمة، الساموراي جاهز
            } else {
                // اكتشاف تلاعب! 🚩
                triggerSelfDestruct()
                false
            }
        } catch (e: Exception) {
            false
        }
    }

    private fun getSigningCertificate(context: Context): String {
        val packageInfo = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            context.packageManager.getPackageInfo(
                context.packageName,
                PackageManager.GET_SIGNING_CERTIFICATES
            )
        } else {
            @Suppress("DEPRECATION")
            context.packageManager.getPackageInfo(
                context.packageName, 
                PackageManager.GET_SIGNATURES
            )
        }

        val signatures = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            packageInfo.signingInfo.apkContentsSigners
        } else {
            @Suppress("DEPRECATION")
            packageInfo.signatures
        }

        val md = MessageDigest.getInstance("SHA-256")
        val digest = md.digest(signatures[0].toByteArray())
        return digest.joinToString(":") { String.format("%02X", it) }
    }

    private fun triggerSelfDestruct() {
        // منطق "الانتحار البرمجي": إغلاق التطبيق فوراً وعمل Clear Memory (إن لزم)
        android.os.Process.killProcess(android.os.Process.myPid())
        System.exit(0)
    }
}
