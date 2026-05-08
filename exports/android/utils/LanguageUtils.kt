package com.mirage.vpn.utils

import android.app.Activity
import android.content.Intent
import android.widget.Toast

/**
 * ⚡ أدوات المناورة اللغوية (Language Switch Utilities)
 * يتضمن آليات التبديل اللحظي (Hot-Swap) مع التأثرات البصرية
 */
object LanguageUtils {

    /**
     * عرض إشعار بنكهة العالم السيبراني (Neon Cyber Toast)
     */
    fun showCyberToast(activity: Activity, message: String) {
        // يمكن تطوير هذا لاحقاً ليكون Custom Toast يُرسم بالـ Compose
        Toast.makeText(activity, message, Toast.LENGTH_SHORT).show()
    }

    /**
     * تنفيذ الـ Hot-Swap للمسار اللغوي بدون الحاجة لإيقاف تطبيقك من الجذور
     */
    fun switchLanguage(activity: Activity, newLang: String) {
        // 1. حفظ الاختيار في الـ Database المحلية
        PrefsManager.saveLanguage(activity, newLang)
        
        // 2. تحديث واجهة الساموراي برسالة نيون
        showCyberToast(activity, "تم تغيير المسار اللغوي إلى: $newLang 🛡️")
        
        // 3. إعادة تحميل الواجهة بسلاسة (Hot-Swap)
        // نستخدم Intent لإعادة التشغيل مع تأثير انتقال "Fade" لتقليل حدة التغيير
        val intent = activity.intent
        activity.finish()
        activity.overridePendingTransition(android.R.anim.fade_in, android.R.anim.fade_out)
        activity.startActivity(intent)
    }
}
