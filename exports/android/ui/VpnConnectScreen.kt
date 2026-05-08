package com.mirage.vpn.ui

import androidx.compose.animation.core.*
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.PowerSettingsNew
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.unit.dp
import com.mirage.vpn.core.VpnState
import com.mirage.vpn.core.VpnViewModel

import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material.icons.filled.Shield
import androidx.compose.material.icons.filled.Autorenew
import androidx.compose.material.icons.filled.FlashOn
import androidx.compose.material.icons.filled.Radar
import androidx.compose.ui.draw.blur
import androidx.compose.foundation.Canvas
import androidx.compose.ui.graphics.drawscope.Stroke

@Composable
fun VpnConnectScreen(viewModel: VpnViewModel) {
    val pingValue by viewModel.pingState.collectAsState()
    val connectionState by viewModel.connectionState.collectAsState()

    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center,
        modifier = Modifier.fillMaxSize()
    ) {
        // عرض البينج في مكان بارز فوق زر الاتصال
        PingDisplay(pingValue = pingValue)
        
        Spacer(modifier = Modifier.height(24.dp))
        
        // زر الاتصال المطور
        ConnectionButton(
            state = connectionState,
            onClick = { viewModel.toggleConnection() }
        )
    }
}

@Composable
fun ConnectionButton(state: VpnState, onClick: () -> Unit) {
    val infiniteTransition = rememberInfiniteTransition(label = "CombatPulse")
    
    // أنميشن النبض للاتصال
    val pulseScale by infiniteTransition.animateFloat(
        initialValue = 1f,
        targetValue = 1.2f,
        animationSpec = infiniteRepeatable(
            animation = tween(1000),
            repeatMode = RepeatMode.Reverse
        ), label = "Pulse"
    )

    // أنميشن الدوران للرادار
    val rotation by infiniteTransition.animateFloat(
        initialValue = 0f,
        targetValue = 360f,
        animationSpec = infiniteRepeatable(
            animation = tween(2000, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        ), label = "RadarRotation"
    )

    val (buttonColor, glowColor, icon) = when (state) {
        is VpnState.Connected -> Triple(Color(0xFF00F3FF), Color(0xFF00F3FF).copy(alpha = 0.5f), Icons.Default.Shield)
        is VpnState.Connecting -> Triple(Color(0xFFFF00FF), Color(0xFFFF00FF).copy(alpha = 0.5f), Icons.Default.Autorenew)
        is VpnState.SelfHealing -> Triple(Color(0xFFFFA500), Color(0xFFFFA500).copy(alpha = 0.5f), Icons.Default.AutoFixHigh)
        is VpnState.Analyzing -> Triple(Color(0xFF00F3FF), Color(0xFF00F3FF).copy(alpha = 0.5f), Icons.Default.Radar)
        is VpnState.Error -> Triple(Color.Red, Color.Red.copy(alpha = 0.4f), Icons.Default.FlashOn)
        else -> Triple(Color.DarkGray, Color.Transparent, Icons.Default.PowerSettingsNew)
    }

    Box(contentAlignment = Alignment.Center, modifier = Modifier.size(120.dp)) {
        // طبقة التوهج (Glow Layer) باستخدام Canvas وتأثير Blur
        Canvas(modifier = Modifier.fillMaxSize().blur(15.dp)) {
            if (state !is VpnState.Idle) {
                val scale = if (state is VpnState.Connecting || state is VpnState.SelfHealing || state is VpnState.Analyzing) pulseScale else 1f
                drawCircle(
                    color = glowColor,
                    radius = (size.minDimension / 2) * scale
                )
            }
        }

        // مسح راداري (Radar Scan) حالة التحليل
        if (state is VpnState.Analyzing) {
            Canvas(modifier = Modifier.size(90.dp).graphicsLayer(rotationZ = rotation)) {
                drawArc(
                    color = Color(0xFF00F3FF),
                    startAngle = 0f,
                    sweepAngle = 90f,
                    useCenter = true,
                    style = Stroke(width = 4.dp.toPx())
                )
            }
        }

        FloatingActionButton(
            onClick = onClick,
            containerColor = buttonColor,
            shape = CircleShape,
            modifier = Modifier.size(80.dp)
        ) {
            Icon(icon, contentDescription = null, tint = Color.Black, modifier = Modifier.size(36.dp))
        }
    }
}
