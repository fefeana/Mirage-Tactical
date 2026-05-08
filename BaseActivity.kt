package com.ufoalbarq.vpn.ui

import android.content.Context
import androidx.activity.ComponentActivity
import com.ufoalbarq.vpn.core.LocaleHelper
import java.util.Locale

/**
 * 🛡️ BaseActivity (Mirage Core)
 * يجب أن ترث جميع أنشطة التطبيق (Activities) من هذا الكلاس لضمان تطبيق اللغة الصحيحة عند بدء التشغيل.
 */
abstract class BaseActivity : ComponentActivity() {
    
    override fun attachBaseContext(newBase: Context) {
        val lang = LocaleHelper.getPersistedLanguage(newBase)
        val locale = Locale(lang)
        val config = newBase.resources.configuration
        config.setLocale(locale)
        val context = newBase.createConfigurationContext(config)
        super.attachBaseContext(context)
    }
}
