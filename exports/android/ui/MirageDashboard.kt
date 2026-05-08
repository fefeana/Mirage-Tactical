package com.mirage.vpn.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Shadow
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.mirage.vpn.core.MirageDashboardViewModel
import androidx.lifecycle.viewmodel.compose.viewModel

@Composable
fun MirageDashboard(viewModel: MirageDashboardViewModel = viewModel()) {
    val activeServer by viewModel.currentServer.collectAsState()

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF050505)), // خلفية سوداء عميقة
        contentAlignment = Alignment.Center
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            modifier = Modifier.padding(20.dp)
        ) {
            // مؤشر الحالة النبضي
            StatusGlowIndicator(status = if (activeServer != null) "ACTIVE" else "INACTIVE")

            Spacer(modifier = Modifier.height(24.dp))

            activeServer?.let { server ->
                // اسم السيرفر بتأثير النيون الأخضر
                Text(
                    text = server.name.uppercase(),
                    style = TextStyle(
                        color = Color.White,
                        fontSize = 22.sp,
                        fontWeight = FontWeight.Black,
                        letterSpacing = 3.sp,
                        shadow = Shadow(color = Color(0xFF50C878), blurRadius = 15f)
                    )
                )

                Spacer(modifier = Modifier.height(12.dp))

                // عرض الأداء (Latency + Speed Icon)
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier
                        .background(Color.White.copy(alpha = 0.05f), RoundedCornerShape(12.dp))
                        .padding(horizontal = 16.dp, vertical = 8.dp)
                ) {
                    // اختيار الرمز بناءً على السرعة
                    val (icon, color) = when {
                        server.latency <= 20 -> "⚡" to Color(0xFF50C878) // فائق السرعة
                        else -> "🚀" to Color(0xFFFDD835) // سريع/مستقر
                    }

                    Text(text = icon, fontSize = 18.sp)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "${server.latency} MS",
                        color = color,
                        fontWeight = FontWeight.Bold,
                        fontSize = 16.sp
                    )
                }
            } ?: Text("WAITING FOR SIGNAL...", color = Color.Gray)
        }
    }
}
