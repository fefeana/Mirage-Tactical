package com.mirage.vpn.ui

import android.app.Activity
import android.content.Context
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.layout.*
import androidx.compose.material3.Text
import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.ufoalbarq.vpn.core.LocaleHelper

val NeonBlue = Color(0xFF00E5FF)

@Composable
fun MirageSettingsSheet(viewModel: com.mirage.vpn.core.ServerViewModel = androidx.lifecycle.viewmodel.compose.viewModel()) {
    val servers by viewModel.serverList.collectAsState()

    Column(
        modifier = Modifier
            .fillMaxHeight(0.8f) // أخذ مساحة أكبر لعرض القائمة
            .fillMaxWidth()
            .background(Color(0xFF0A0A0A))
            .border(1.dp, Color(0xFF8B00FF), RoundedCornerShape(topStart = 20.dp, topEnd = 20.dp)) // حدود بنفسجية
            .padding(20.dp)
    ) {
        // عنوان القائمة بتصميم ساموراي نيون
        Text(
            text = "AVAILABLE NODES",
            color = Color(0xFF8B00FF), // بنفسجي نيون
            style = androidx.compose.ui.text.TextStyle(
                letterSpacing = 4.sp,
                fontWeight = androidx.compose.ui.text.font.FontWeight.Black,
                shadow = androidx.compose.ui.graphics.Shadow(color = Color(0xFF8B00FF), blurRadius = 15f),
                fontSize = 20.sp
            )
        )
        
        Spacer(modifier = Modifier.height(16.dp))

        // قائمة السيرفرات
        androidx.compose.foundation.lazy.LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(bottom = 20.dp)
        ) {
            androidx.compose.foundation.lazy.items(servers) { server ->
                ServerListItem(server)
            }
        }
    }
}

@Composable
fun LanguageSelector(currentLanguage: String) {
    val context = LocalContext.current
    val languages = listOf("ar" to "العربية", "en" to "English")

    Column(modifier = Modifier.fillMaxWidth()) {
        languages.forEach { (code, name) ->
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable {
                        // تطبيق اللغة الجديدة وإعادة التشغيل بسلاسة
                        LocaleHelper.applyLanguage(context, code)
                        
                        val activity = context as? Activity
                        if (activity != null) {
                            val intent = activity.intent
                            activity.finish()
                            // لمسة Mirage: تحول سلس للغطاء المرئي
                            activity.overridePendingTransition(android.R.anim.fade_in, android.R.anim.fade_out)
                            activity.startActivity(intent)
                        }
                    }
                    .padding(vertical = 12.dp, horizontal = 16.dp)
            ) {
                Text(
                    text = name, 
                    color = if (currentLanguage == code) NeonBlue else Color.White,
                    fontSize = 16.sp
                )
            }
        }
    }
}
