package com.mirage.vpn.core

import android.util.Base64
import javax.crypto.Cipher
import javax.crypto.spec.IvParameterSpec
import javax.crypto.spec.SecretKeySpec

object MirageSecurity {
    private const val ALGORITHM = "AES/CBC/PKCS5Padding"
    private val KEY = "12345678901234567890123456789012" // يجب أن يكون 32 حرفاً لـ 256-bit
    private val IV = "1234567890123456" // Initialization Vector (16 حرفاً)

    // التشفير العسكري لمفاتيح الـ API
    fun encrypt(data: String): String {
        val cipher = Cipher.getInstance(ALGORITHM)
        val keySpec = SecretKeySpec(KEY.toByteArray(), "AES")
        val ivSpec = IvParameterSpec(IV.toByteArray())
        
        cipher.init(Cipher.ENCRYPT_MODE, keySpec, ivSpec)
        val encrypted = cipher.doFinal(data.toByteArray())
        return Base64.encodeToString(encrypted, Base64.DEFAULT)
    }

    // فك التشفير عند الاستخدام فقط
    fun decrypt(encryptedData: String): String {
        val cipher = Cipher.getInstance(ALGORITHM)
        val keySpec = SecretKeySpec(KEY.toByteArray(), "AES")
        val ivSpec = IvParameterSpec(IV.toByteArray())
        
        cipher.init(Cipher.DECRYPT_MODE, keySpec, ivSpec)
        val decoded = Base64.decode(encryptedData, Base64.DEFAULT)
        return String(cipher.doFinal(decoded))
    }

    // التحقق من صحة المفتاح قبل الوصول لبيانات السيرفرات
    fun validateApiKey(key: String): Boolean {
        return key.startsWith("MRG-") && key.length > 20
    }

    // تقنية بسيطة لإخفاء البيانات الحساسة (Obfuscation) (متبقية للتوافق الخلفي)
    fun obfuscate(data: String): String {
        return Base64.encodeToString(data.reversed().toByteArray(), Base64.DEFAULT)
    }
}
