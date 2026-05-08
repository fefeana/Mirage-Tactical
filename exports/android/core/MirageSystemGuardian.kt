package com.mirage.vpn.core

import android.os.Build

/**
 * كود قراءة بصمة الجهاز والمعمارية (Device DNA)
 * يقف كحارس لفحص الجهاز وتحديد نوع المعالج قبل حقن المحرك المشفر.
 */
object MirageSystemGuardian {

    /**
     * قراءة معمارية الجهاز بدقة
     */
    fun getDeviceArchitecture(): String {
        val supportedAbis = Build.SUPPORTED_ABIS
        return if (supportedAbis.isNotEmpty()) {
            supportedAbis[0] // المعمارية الأساسية (مثل arm64-v8a)
        } else {
            System.getProperty("os.arch") ?: "unknown"
        }
    }

    /**
     * فحص بصمة الجهاز التقنية
     */
    fun getDeviceFingerprint(): Map<String, String> {
        return mapOf(
            "model" to Build.MODEL,
            "brand" to Build.BRAND,
            "sdk" to Build.VERSION.SDK_INT.toString(),
            "abi" to getDeviceArchitecture()
        )
    }
}
