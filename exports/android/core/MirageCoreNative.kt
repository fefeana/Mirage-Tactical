package com.mirage.vpn.core

import android.util.Log

/**
 * ⚔️ Mirage Native Core (JNI Layer)
 * هذا الكلاس هو جسر التواصل بين واجهة الأندرويد ومكتبات C++/Go (Xray/Sing-box) المترجمة.
 */
class MirageCoreNative {
    companion object {
        private const val TAG = "MirageCoreNative"
        
        init {
            try {
                // تحميل المكتبة السيادية للمحرك (يجب تواجدها في src/main/jniLibs)
                System.loadLibrary("mirage_vless_core")
                Log.i(TAG, "🛡️ [JNI] تم تحميل محرك ميراج النواة بنجاح.")
            } catch (e: UnsatisfiedLinkError) {
                Log.e(TAG, "❌ [CRITICAL] فشل في تحميل المكتبة الأساسية! تأكد من وجود ملفات الـ .so", e)
            }
        }
    }
    
    // ==========================================
    // ⚔️ تعريف الدوال الأصلية للتحكم بالأنفاق (C++ Layer)
    // ==========================================

    /**
     * تشغيل المحرك عن طريق إرسال الـ JSON Config
     * @return 0 إذا نجح، قيمة سالبة في حال الخطأ.
     */
    external fun startEngine(configJson: String): Int

    /**
     * إيقاف النفق كلياً وتحرير الموارد.
     */
    external fun stopEngine(): Int

    /**
     * ⚡ تحديث الـ Config أثناء عمل المحرك (Hot-Reload) لضمان عدم تسرب الـ IP.
     * @return 0 إذا نجح التبديل، قيمة سالبة في حال الخطأ.
     */
    external fun updateConfig(configJson: String): Int

    /**
     * قراءة الإحصائيات (Traffic / Upload / Download) من المحرك.
     * @return JSON string يحتوي على الإحصائيات الحية.
     */
    external fun getStats(): String
    
    /**
     * إجراء فحص Ping السريع للعقدة (Node) عبر الـ NDK.
     */
    external fun measureLatency(targetHost: String, port: Int): Int
}
