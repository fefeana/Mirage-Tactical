package com.mirage.vpn.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.input.pointer.PointerEventType
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.mirage.vpn.core.Server

@Composable
fun ServerListItem(server: Server) {
    var isHovered by remember { mutableStateOf(false) }
    
    // تخصيص لون التوهج بناءً على البروتوكول (VLESS = بنفسجي، Hysteria = أخضر)
    val glowColor = if (server.protocol == "HYSTERIA2") Color(0xFF50C878) else Color(0xFF8B00FF)

    Box(
        modifier = Modifier
            .fillMaxWidth()
            .padding(8.dp)
            .pointerInput(Unit) {
                // محاكاة تأثير Hover للأجهزة اللمسية أو المؤشر
                awaitPointerEventScope {
                    while (true) {
                        val event = awaitPointerEvent()
                        // On Android touching down might be Enter for a mouse, but checking event type is okay here
                        if (event.type == PointerEventType.Enter) {
                            isHovered = true
                        } else if (event.type == PointerEventType.Exit) {
                            isHovered = false
                        }
                    }
                }
            }
            .background(
                color = if (isHovered) glowColor.copy(alpha = 0.1f) else Color.Transparent,
                shape = RoundedCornerShape(12.dp)
            )
            .border(
                width = if (isHovered) 2.dp else 1.dp,
                color = if (isHovered) glowColor else Color.White.copy(alpha = 0.1f),
                shape = RoundedCornerShape(12.dp)
            )
            .padding(16.dp)
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween,
            modifier = Modifier.fillMaxWidth()
        ) {
            Column {
                Text(
                    text = server.name,
                    color = Color.White,
                    fontWeight = FontWeight.Bold,
                    fontSize = 16.sp
                )
                // إضافة حقل المنطقة (Region)
                Text(
                    text = "REGION: ${server.region.uppercase()}",
                    color = glowColor.copy(alpha = 0.7f),
                    fontSize = 10.sp,
                    letterSpacing = 1.sp
                )
            }
            
            // رمز السرعة
            Text(text = if (server.latency < 50) "⚡" else "🚀", fontSize = 18.sp)
        }
    }
}
