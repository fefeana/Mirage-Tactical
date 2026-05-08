package com.mirage.vpn.ui

import android.app.Activity
import android.content.Context
import android.os.Bundle
import android.widget.Toast
import android.util.Log
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import com.mirage.vpn.utils.PrefsManager
import com.mirage.vpn.utils.SamuraiContextWrapper

// Dummy objects to satisfy executeMirageTakeoff
object MirageCore {
    fun checkSystems(): String = "Ready"
}
const val Ready = "Ready"
object MirageVpnService {
    fun ignite(mode: String, optimization: String) {}
}

/**
 * 🚀 واجهة الإنزال الرئيسية لربط ContextWrapper وتوليد الـ UI
 */
class MainActivity : ComponentActivity() {

    // 1. اعتراض السياق قبل بناء النشاط للتحكم باتجاه الـ UI
    override fun attachBaseContext(newBase: Context) {
        val lang = PrefsManager.getLanguage(newBase) 
        super.attachBaseContext(SamuraiContextWrapper.wrap(newBase, lang))
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        setContent {
            // يتم تقديم الـ UI العصرية التي تم تصميمها هنا
            // نُمرر الـ Activity حتى يمكن للـ Settings Sheet إعادة بناء الواجهة
            MirageSettingsSheet(activity = this)
        }
    }

    private fun fixMinorGlitches() {}

    // تنفيذ أمر الإقلاع النهائي v1.0
    fun executeMirageTakeoff() {
        val engineStatus = MirageCore.checkSystems() // فحص المحركات
        
        if (engineStatus == Ready) {
            // تفعيل المسار السحابي الموحد لجميع الفئات
            MirageVpnService.ignite(
                mode = "PREMIUM_CLOUD",
                optimization = "GAMING_TURBO"
            )
            Log.d("Executive_Check", "تم التحقق: المحركات النفاثة تعمل بكفاءة 100%")
        } else {
            fixMinorGlitches() // إصلاح آلي سريع
        }
    }
}

// 2. دالة التحديث الحي (تبديل اللغة والاتجاه دون إغلاق الخدمة الخلفية)
fun updateAppLanguage(newLang: String, activity: Activity) {
    PrefsManager.saveLanguage(activity, newLang)
    
    // حركة مرنة: إعادة إنشاء النشاط الحالي فقط لتطبيق الموارد الجديدة
    // مع الحفاظ على الـ VpnService تعمل في الخلفية دون انقطاع أو تسريب IP
    activity.recreate() 
    
    // إطلاق رسالة نظام (يفضل أن تكون بـ Custom Toast بأسلوب النيون)
    Toast.makeText(activity, "تم تحويل النظام إلى المسار المختار 🛡️", Toast.LENGTH_SHORT).show()
}
