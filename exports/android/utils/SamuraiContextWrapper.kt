package com.mirage.vpn.utils

import android.content.Context
import android.content.ContextWrapper
import java.util.Locale

/**
 * 🛡️ Samurai Context Wrapper
 * مُعترض سياق التطبيق الأساسي لمعالجة وتغيير لغة النظام (RTL/LTR) في الوقت الفعلي
 * دون الحاجة لعمل Restart كامل للتطبيق لتفادي قطع الـ VPN.
 */
class SamuraiContextWrapper(base: Context) : ContextWrapper(base) {
    companion object {
        fun wrap(context: Context, language: String): ContextWrapper {
            // كود اللغة كـ "ar" للغة العربية، أو "en" للإنجليزية
            val languageCode = when (language) {
                "العربية" -> "ar"
                "Русский" -> "ru"
                else -> "en"
            }
            
            val locale = Locale(languageCode)
            Locale.setDefault(locale)
            
            val resources = context.resources
            val configuration = resources.configuration
            
            // ⚔️ تحديث الإعدادات للغة والاتجاه (RTL/LTR)
            configuration.setLocale(locale)
            configuration.setLayoutDirection(locale)
            
            val updatedContext = context.createConfigurationContext(configuration)
            return SamuraiContextWrapper(updatedContext)
        }
    }
}
