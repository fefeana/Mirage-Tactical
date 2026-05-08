package com.mirage.vpn.ui

import androidx.compose.foundation.layout.*
import androidx.compose.material.Button
import androidx.compose.material.Icon
import androidx.compose.material.Text
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Warning
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp

// 4. حدود الخطأ (React-style Error Boundaries Fallback)
// ملاحظة: بما أن Compose لا تدعم try/catch مباشرة، نستخدم حاوية حالة لإصلاح الأخطاء يدوياً أو تقديم واجهة طوارئ
@Composable
fun MirageErrorBoundary(hasError: Boolean, onReset: () -> Unit, content: @Composable () -> Unit) {
    if (hasError) {
        Column(
            modifier = Modifier.fillMaxSize(), 
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Icon(
                imageVector = Icons.Default.Warning, 
                contentDescription = null, 
                tint = AlertRed,
                modifier = Modifier.size(64.dp)
            )
            Spacer(modifier = Modifier.height(16.dp))
            Text("حدث خطأ في مصفوفة الواجهة، جاري الإصلاح تلقائياً...", color = Color.White)
            Spacer(modifier = Modifier.height(16.dp))
            Button(onClick = onReset) {
                Text("إعادة تشغيل النظام")
            }
        }
    } else {
        content()
    }
}
