package com.mirage.vpn.core

import android.util.Log

/**
 * ذراع التحميل الديناميكي (Dynamic Loader)
 * يعزل المخاطر عن المحرك الرئيسي ويتحكم بتحميل المكتبة السيادية وقت الحاجة.
 */
object NativeLoader {
    private const val TAG = "NativeLoader"
    
    // تتبع حالة التحميل لتجنب التكرار
    var isLoaded = false
        private set

    fun isLibraryPresent(arch: String): Boolean {
        // في الواقع يتم فحص مسار التطبيق، لكن سنصنع محاكاة: 
        // سنفترض أننا نملك مكتبات الـ ARM مسبقاً، ونفتقد معالجات x86 و x86_64
        return arch.startsWith("arm")
    }

    fun loadSafe() {
        if (isLoaded) return
        try {
            System.loadLibrary("mirage-core")
            isLoaded = true
            Log.i(TAG, "🛡️ Native library 'mirage-core' loaded safely from base APK.")
        } catch (e: UnsatisfiedLinkError) {
            Log.e(TAG, "❌ Failed to load library in safe mode: ${e.message}")
        }
    }

    fun loadDynamicPath(absolutePath: String) {
        if (isLoaded) return
        try {
            System.load(absolutePath)
            isLoaded = true
            Log.i(TAG, "⚡ Dynamic native library loaded cleanly from: $absolutePath")
        } catch (e: UnsatisfiedLinkError) {
            Log.e(TAG, "❌ Failed to link dynamic library: ${e.message}")
        }
    }
}
