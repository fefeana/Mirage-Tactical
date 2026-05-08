package com.mirage.vpn.ui

import android.content.Context
import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun ActivateMirageButton() {
    var isConnected by remember { mutableStateOf(false) }
    val context = LocalContext.current

    // حركة (Animation) النبض عندما تكون الشبكة نشطة
    val infiniteTransition = rememberInfiniteTransition(label = "pulse")
    val scale by infiniteTransition.animateFloat(
        initialValue = 1f,
        targetValue = if (isConnected) 1.05f else 1f,
        animationSpec = infiniteRepeatable(
            animation = tween(800, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "scale"
    )

    val containerColor = if (isConnected) Color(0xFF00C853) else Color.Transparent // أخضر عند الاتصال
    val textColor = if (isConnected) Color.Black else Color(0xFFFFD700) // ذهبي Mirage
    val textStr = if (isConnected) "⚡ ميراج متصل ⚡" else "تفعيل بوابة ميراج"

    Box(
        modifier = Modifier
            .padding(16.dp)
            .scale(scale)
            .clip(RoundedCornerShape(30.dp))
            .background(containerColor)
            .clickable {
                isConnected = !isConnected
                if (isConnected) {
                    startMirageVpnService(context)
                } else {
                    stopMirageVpnService(context)
                }
            }
            .padding(horizontal = 32.dp, vertical = 12.dp),
        contentAlignment = Alignment.Center
    ) {
        Text(
            text = textStr,
            color = textColor,
            fontSize = 24.sp,
            fontWeight = FontWeight.Bold
        )
    }
}

fun startMirageVpnService(context: Context) {
    // ⚔️ الكود الخاص بتشغيل VpnService
    // val intent = Intent(context, MirageVpnService::class.java)
    // intent.action = "START_VPN"
    // context.startService(intent)
}

fun stopMirageVpnService(context: Context) {
    // ⚔️ الكود الخاص بإيقاف VpnService
    // val intent = Intent(context, MirageVpnService::class.java)
    // intent.action = "STOP_VPN"
    // context.startService(intent)
}
