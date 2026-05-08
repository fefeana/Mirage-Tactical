package com.mirage.app.core

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.os.Build
import androidx.core.app.NotificationCompat

object MirageNotificationManager {

    private const val CHANNEL_ID = "MIRAGE_SHIELD_CHANNEL"
    const val NOTIFICATION_ID = 1337 // رقم مميز للساموراي

    fun createNotification(context: Context, status: String, speed: String): Notification {
        // إنشاء القناة للإصدارات الحديثة
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "Mirage Shield Active",
                NotificationManager.IMPORTANCE_LOW // ليكون هادئاً وغير مزعج
            )
            val manager = context.getSystemService(NotificationManager::class.java)
            manager.createNotificationChannel(channel)
        }

        val intent = android.content.Intent(context, com.mirage.app.ui.MainActivity::class.java).apply {
            flags = android.content.Intent.FLAG_ACTIVITY_SINGLE_TOP
        }

        // تصحيح مهم لضمان عمل الإشعارات على أندرويد 12+
        val pendingIntent = android.app.PendingIntent.getActivity(
            context, 0, intent,
            android.app.PendingIntent.FLAG_IMMUTABLE or android.app.PendingIntent.FLAG_UPDATE_CURRENT
        )

        // بناء الإشعار بتصميم نظيف
        return NotificationCompat.Builder(context, CHANNEL_ID)
            .setContentTitle("Mirage: $status")
            .setContentText("سرعة الاستجابة الحالية: $speed")
            .setSmallIcon(android.R.drawable.ic_secure) // أيقونة الدرع (تم استبدالها بأيقونة للنظام لعدم توفر R.drawable المخصصة)
            .setContentIntent(pendingIntent)
            .setOngoing(true) // لا يمكن حذفه بالسحب لضمان بقاء الخدمة
            .setOnlyAlertOnce(true) // تحديث البيانات بدون صوت مزعج في كل مرة
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setCategory(NotificationCompat.CATEGORY_SERVICE)
            .build()
    }

    fun updateNotification(context: Context, status: String, speed: String) {
        val notification = createNotification(context, status, speed)
        val manager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        manager.notify(NOTIFICATION_ID, notification)
    }
}
