package com.mirage.app.core

import android.app.DownloadManager
import android.content.Context
import android.net.Uri
import android.os.Environment
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL

/**
 * 🛡️ مدير التحديثات التلقائي (AutoUpdateManager)
 * يتحقق من خوادم Mirage السحابية لوجود تحديثات APK وينفذ التنزيل المباشر والتثبيت
 */
object AutoUpdateManager {

    // مسار التحقق من التحديثات السحابية
    private const val UPDATE_URL = "https://api.mirage.net/v1/android/latest"
    private const val CURRENT_VERSION_CODE = 1 // يمكن ربطها بـ BuildConfig.VERSION_CODE

    suspend fun checkForUpdates(onResult: (Boolean, String) -> Unit) {
        withContext(Dispatchers.IO) {
            try {
                val url = URL(UPDATE_URL)
                val connection = url.openConnection() as HttpURLConnection
                connection.requestMethod = "GET"
                connection.connectTimeout = 5000
                connection.readTimeout = 5000

                if (connection.responseCode == HttpURLConnection.HTTP_OK) {
                    val response = connection.inputStream.bufferedReader().readText()
                    val jsonResponse = JSONObject(response)
                    val latestVersionCode = jsonResponse.getInt("latest_version_code")
                    val apkUrl = jsonResponse.getString("apk_url")

                    if (latestVersionCode > CURRENT_VERSION_CODE) {
                        withContext(Dispatchers.Main) {
                            onResult(true, apkUrl)
                        }
                    } else {
                        withContext(Dispatchers.Main) {
                            onResult(false, "")
                        }
                    }
                } else {
                    withContext(Dispatchers.Main) {
                        onResult(false, "")
                    }
                }
            } catch (e: Exception) {
                e.printStackTrace()
                withContext(Dispatchers.Main) {
                    onResult(false, "")
                }
            }
        }
    }

    fun downloadAndInstallUpdate(context: Context, apkUrl: String) {
        try {
            val request = DownloadManager.Request(Uri.parse(apkUrl))
                .setTitle("Mirage Core Update 🚀")
                .setDescription("جاري تنزيل أحدث بروتوكولات التخفي والسرعة...")
                .setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED)
                .setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, "Mirage_Latest.apk")
                .setAllowedOverMetered(true)
                .setAllowedOverRoaming(true)

            val downloadManager = context.getSystemService(Context.DOWNLOAD_SERVICE) as DownloadManager
            downloadManager.enqueue(request)
            
            // 📝 ملاحظة للمحارب: 
            // يجب إعداد BroadcastReceiver للاستماع لإكمال التنزيل وطلب Intent.ACTION_VIEW باستخدام FileProvider للتثبيت المباشر.
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }
}
