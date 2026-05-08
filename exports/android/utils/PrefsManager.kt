package com.mirage.vpn.utils

import android.content.Context

/**
 * 🗄️ مدير الذاكرة السيادية (PrefsManager)
 * يُخزن وضعيات المستخدم الأساسية (Language, Theme) ليتم استرجاعها قبل الإقلاع.
 */
object PrefsManager {
    private const val PREFS_NAME = "MirageSamuraiPrefs"
    private const val KEY_LANGUAGE = "app_language"

    fun getLanguage(context: Context): String {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        return prefs.getString(KEY_LANGUAGE, "en") ?: "en" // Default to English / LTR
    }

    fun saveLanguage(context: Context, language: String) {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        prefs.edit().putString(KEY_LANGUAGE, language).apply()
    }
}
