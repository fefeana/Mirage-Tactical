package com.mirage.vpn

import android.content.Context
import android.os.Bundle
import androidx.activity.compose.setContent
import androidx.compose.material.MaterialTheme
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.fragment.app.FragmentActivity
import com.mirage.vpn.core.scheduleAIExecutive
import com.mirage.vpn.core.SecurityProvider
import com.mirage.vpn.ui.MirageDashboardScreen
import com.mirage.vpn.ui.MirageOnboardingScreen

// يتم توريث FragmentActivity لاستخدام ميزات BiometricPrompt و FragmentManager براحة.
// يمكن الاعتماد على ComponentActivity أيضاً ولكن AndroidX Biometric يفضل FragmentActivity
class MainActivity : FragmentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // التحقق من سلامة البصمة قبل استعراض أي كود آخر (Signature Guardian)
        if (!SecurityProvider.verifyIntegrity(this)) {
            // التلاعب المكتشف سيقوم بإغلاق التطبيق فوراً من داخل الـ SecurityProvider
            return
        }
        
        // تشغيل المدير التنفيذي لضمان الجودة، الحماية وتنظيف اللوغات في الخلفية
        scheduleAIExecutive(this)
        
        setContent {
            // استخدام تصميم الساموراي الزمردي التكتيكي
            MaterialTheme {
                com.mirage.vpn.ui.EmeraldSamuraiScreen()
            }
        }
    }
}
