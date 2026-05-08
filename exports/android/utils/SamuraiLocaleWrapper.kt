package com.mirage.vpn.utils

import android.content.Context
import android.content.ContextWrapper
import android.content.res.Configuration
import java.util.Locale

/**
 * 🛡️ المحول الجذري (Samurai Locale Wrapper)
 * هذا الكلاس يعيد صياغة سياق الأندرويد (Context) ليجبر الموارد على اتباع لغة محددة 
 * وتغيير اتجاه العرض (RTL/LTR) برمجياً بمرونة عالية.
 */
class SamuraiLocaleWrapper(base: Context) : ContextWrapper(base) {
    companion object {
        fun wrap(context: Context, languageCode: String): ContextWrapper {
            val locale = Locale(languageCode)
            Locale.setDefault(locale)
            
            val config = Configuration(context.resources.configuration)
            config.setLocale(locale)
            
            // إجبار النظام على تغيير اتجاه التخطيط (RTL/LTR)
            config.setLayoutDirection(locale)
            
            val updatedContext = context.createConfigurationContext(config)
            return SamuraiLocaleWrapper(updatedContext)
        }
    }
}
