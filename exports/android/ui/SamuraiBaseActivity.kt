package com.mirage.vpn.ui

import android.content.Context
import androidx.activity.ComponentActivity
import com.mirage.vpn.utils.PrefsManager
import com.mirage.vpn.utils.SamuraiLocaleWrapper

/**
 * ⚡نشاط القاعدة (SamuraiBaseActivity)
 * لحقن الـ Wrapper في دورة حياة التطبيق لضمان سريان تغيير اللغة على كافة الشاشات
 * (بما في ذلك لوحة التحكم الـ Cyberpunk)، فكل شاشاتك من الآن يجب أن ترث هذا الكلاس.
 */
abstract class SamuraiBaseActivity : ComponentActivity() {

    override fun attachBaseContext(newBase: Context) {
        // جلب اللغة المطلوبة من مدير التفضيلات
        val langName = PrefsManager.getLanguage(newBase) 
        
        // التحويل إلى كود لغوي صحيح
        val langCode = when (langName) {
            "العربية" -> "ar"
            "Русский" -> "ru"
            else -> "en"
        }
        
        // حقن لغة الساموراي المحددة
        super.attachBaseContext(SamuraiLocaleWrapper.wrap(newBase, langCode))
    }
}
