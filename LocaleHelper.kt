package com.ufoalbarq.vpn.core

import android.content.Context
import java.util.Locale

/**
 * ⚙️ المحرك الأساسي لإدارة اللغات (LocaleHelper)
 * مسؤول عن تغيير اللغة برمجياً وتحديث الـ Resources لضمان استمرارية لغة الواجهة.
 */
object LocaleHelper {
    fun applyLanguage(context: Context, languageCode: String) {
        val locale = Locale(languageCode)
        Locale.setDefault(locale)
        
        val resources = context.resources
        val config = resources.configuration
        config.setLocale(locale)
        
        // تحديث السياق (Context) للتطبيق
        context.createConfigurationContext(config)
        resources.updateConfiguration(config, resources.displayMetrics)
        
        // حفظ اللغة المختارة في SharedPreferences لضمان الاستمرارية
        val prefs = context.getSharedPreferences("mirage_settings", Context.MODE_PRIVATE)
        prefs.edit().putString("selected_lang", languageCode).apply()
    }

    fun getPersistedLanguage(context: Context): String {
        val prefs = context.getSharedPreferences("mirage_settings", Context.MODE_PRIVATE)
        // الافتراضي هو العربية بناءً على توجيهات النظام
        return prefs.getString("selected_lang", "ar") ?: "ar"
    }
}
