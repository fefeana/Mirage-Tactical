package com.mirage.vpn.ui

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Shadow
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun MirageMainScreen() {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF000000)) // خلفية سوداء عميقة
    ) {
        // تأثير الهالة (Glow Aura) - بنفسجي وذهبي
        Canvas(modifier = Modifier.fillMaxSize()) {
            drawCircle(
                brush = Brush.radialGradient(
                    colors = listOf(Color(0xFF8B00FF).copy(alpha = 0.15f), Color.Transparent),
                    center = Offset(size.width * 0.8f, size.height * 0.2f),
                    radius = 800f
                )
            )
        }

        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            // نص النيون (Emerald Green)
            Text(
                text = "MIRAGE PROTOCOL",
                style = TextStyle(
                    color = Color(0xFF50C878), 
                    fontSize = 32.sp,
                    fontWeight = FontWeight.Bold,
                    shadow = Shadow(color = Color(0xFF50C878), blurRadius = 20f)
                )
            )
            
            Spacer(modifier = Modifier.height(40.dp))

            // زر الاتصال الماسي (Glassmorphism)
            Box(
                modifier = Modifier
                    .size(200.dp)
                    .clip(CircleShape)
                    .background(Color.White.copy(alpha = 0.05f))
                    .border(1.dp, Color.White.copy(alpha = 0.2f), CircleShape)
                    .clickable { /* منطق الاتصال */ },
                contentAlignment = Alignment.Center
            ) {
                Text("ACTIVATE", color = Color.White)
            }
        }
    }
}
