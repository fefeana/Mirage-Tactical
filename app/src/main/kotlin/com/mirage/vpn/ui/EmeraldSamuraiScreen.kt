package com.mirage.vpn.ui

import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun EmeraldSamuraiScreen() {
    var isConnected by remember { mutableStateOf(false) }

    // ✨ تأثير النبض (Breathing Effect) للواجهة
    val infiniteTransition = rememberInfiniteTransition(label = "pulse_transition")
    val pulseScale by infiniteTransition.animateFloat(
        initialValue = 1f,
        targetValue = 1.05f,
        animationSpec = infiniteRepeatable(
            animation = tween(2000, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "pulse_scale"
    )

    Surface(modifier = Modifier.fillMaxSize(), color = Color(0xFF000805)) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            // شعار النظام النابض
            Box(
                modifier = Modifier
                    .size(200.dp)
                    .scale(pulseScale)
                    .border(2.dp, Color(0xFF50FFB0), CircleShape) // الزمردي النيون
                    .padding(16.dp),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = if (isConnected) "ACTIVE" else "READY",
                    color = if (isConnected) Color(0xFF50FFB0) else Color.White,
                    fontSize = 24.sp,
                    fontWeight = FontWeight.Bold
                )
            }

            Spacer(modifier = Modifier.height(48.dp))

            // زر التشغيل التكتيكي
            Button(
                onClick = { isConnected = !isConnected },
                colors = ButtonDefaults.buttonColors(
                    backgroundColor = if (isConnected) Color(0xFF50FFB0) else Color(0xFF1A1A1A)
                ),
                shape = CircleShape,
                modifier = Modifier.size(width = 250.dp, height = 60.dp)
            ) {
                Text(
                    text = if (isConnected) "DISCONNECT FROM NEON" else "ENGAGE MIRAGE",
                    color = if (isConnected) Color.Black else Color.White,
                    fontWeight = FontWeight.Bold
                )
            }

            // تفاصيل الحالة في الأسفل
            Spacer(modifier = Modifier.height(24.dp))
            Text(
                text = "Status: Secured by JNI Shield v2.0",
                color = Color.Gray,
                fontSize = 12.sp
            )
        }
    }
}
