package com.mirage.app.core

import java.io.File
import java.security.SecureRandom

/**
 * محرك التطهير الرقمي (Auto-Log Wipe & File Shredder)
 * يضمن مسح جميع آثار التكوينات والاتصالات من الجهاز عند إغلاق التطبيق.
 */
object MirageSanitizer {

    /**
     * المسح الشامل عند إغلاق التطبيق
     */
    fun performFullWipe(context: android.content.Context) {
        kotlinx.coroutines.CoroutineScope(kotlinx.coroutines.Dispatchers.IO).launch {
            // 1. مسح ملفات التكوين (Configs)
            wipeDirectory(context.filesDir)
            
            // 2. مسح التخزين المؤقت (Cache)
            wipeDirectory(context.cacheDir)
            
            // 3. تنظيف قاعدة البيانات المؤقتة إن وجدت
            context.databaseList().forEach { dbName ->
                context.deleteDatabase(dbName)
            }
        }
    }

    /**
     * تمزيق الملفات (Overwrite then Delete)
     * يكتب بيانات عشوائية فوق الملف لمنع استرجاعه عبر برامج الـ Forensics
     */
    private fun wipeFile(file: File) {
        if (file.exists()) {
            val length = file.length()
            val random = SecureRandom()
            val randomData = ByteArray(length.toInt())
            random.nextBytes(randomData)
            
            // كتابة بيانات عشوائية فوق الملف الأصلي
            file.writeBytes(randomData)
            
            // الحذف النهائي
            file.delete()
        }
    }

    private fun wipeDirectory(directory: File) {
        directory.listFiles()?.forEach { file ->
            if (file.isDirectory) wipeDirectory(file) else wipeFile(file)
        }
    }
}
