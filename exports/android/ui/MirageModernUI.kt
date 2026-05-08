package com.mirage.vpn.ui

import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.animateContentSize
import androidx.compose.animation.core.*
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.blur
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.Flow
import android.app.Activity
import com.mirage.vpn.utils.PrefsManager
import com.mirage.vpn.ui.updateAppLanguage

// ⚔️ لوحة ألوان النيون الخاصة بالمشروع (Cyberpunk Aesthetic)
val SamuraiBlack = Color(0xFF000000)
val NeonBlue = Color(0xFF00F3FF)
val NeonPurple = Color(0xFFFF00FF)
val AlertRed = Color(0xFFFF003C)

// 1. الشبكة الرقمية المتحركة (Cyber Grid Background)
@Composable
fun CyberGridBackground() {
    val infiniteTransition = rememberInfiniteTransition(label = "GridTransition")
    
    // حركة الإزاحة لمحاكاة الحركة البطيئة
    val offset by infiniteTransition.animateFloat(
        initialValue = 0f,
        targetValue = 100f,
        animationSpec = infiniteRepeatable(
            animation = tween(8000, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "GridOffset"
    )

    Canvas(modifier = Modifier.fillMaxSize().background(Color(0xFF000000))) {
        val gridSpacing = 50.dp.toPx()
        val electricBlue = Color(0xFF00F3FF)
        val hotPink = Color(0xFFFF00FF)

        // رسم الخطوط الطولية بتأثير النيون
        for (x in 0..size.width.toInt() step gridSpacing.toInt()) {
            val xPos = (x + offset) % size.width
            drawLine(
                color = electricBlue.copy(alpha = 0.2f),
                start = Offset(xPos, 0f),
                end = Offset(xPos, size.height),
                strokeWidth = 1.dp.toPx()
            )
        }

        // رسم الخطوط العرضية بتأثير النيون
        for (y in 0..size.height.toInt() step gridSpacing.toInt()) {
            val yPos = (y + offset) % size.height
            drawLine(
                color = hotPink.copy(alpha = 0.15f),
                start = Offset(0f, yPos),
                end = Offset(size.width, yPos),
                strokeWidth = 1.dp.toPx()
            )
        }
    }
}

// 2. شاشة إعدادات الوصول السيادي (Settings Sheet)
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MirageSettingsSheet(activity: Activity? = null, onProtocolSelected: (String) -> Unit = {}) {
    // نجلب اللغة المحفوظة لنعرضها كخيار افتراضي
    var selectedLanguage by remember { 
        mutableStateOf(if (activity != null) PrefsManager.getLanguage(activity) else "العربية") 
    }
    var selectedProtocol by remember { mutableStateOf("VLESS") }

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .background(SamuraiBlack)
            .border(1.dp, NeonBlue.copy(alpha = 0.3f), RoundedCornerShape(topStart = 16.dp, topEnd = 16.dp))
            .padding(24.dp)
            .animateContentSize()
    ) {
        Text(
            "إعدادات الوصول السيادي", 
            color = NeonBlue, 
            style = MaterialTheme.typography.titleLarge,
            fontWeight = FontWeight.Bold,
            modifier = Modifier.padding(bottom = 16.dp)
        )
        
        // اختيار البروتوكول عبر Chips نيون
        val protocols = listOf("VLESS", "Hysteria2", "Trojan")
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            protocols.forEach { protocol ->
                val isSelected = selectedProtocol == protocol
                FilterChip(
                    selected = isSelected,
                    onClick = { 
                        selectedProtocol = protocol
                        onProtocolSelected(protocol)
                    },
                    label = { 
                        Text(
                            protocol, 
                            color = if (isSelected) NeonBlue else Color.Gray,
                            fontFamily = FontFamily.Monospace, 
                            fontWeight = FontWeight.Bold
                        ) 
                    },
                    colors = FilterChipDefaults.filterChipColors(
                        selectedContainerColor = Color(0xFFFF00FF).copy(alpha = 0.2f),
                        containerColor = Color.Transparent
                    ),
                    border = FilterChipDefaults.filterChipBorder(
                        enabled = true,
                        selected = isSelected,
                        borderColor = if (isSelected) Color(0xFFFF00FF) else Color.DarkGray,
                        borderWidth = 1.dp
                    )
                )
            }
        }

        Spacer(modifier = Modifier.height(24.dp))

        // اختيار اللغة (Locale Logic)
        DropdownLanguagePicker(selectedLanguage) { lang ->
            selectedLanguage = lang
            if (activity != null) {
                // تنفيذ الـ Hot-Swap (التبديل اللحظي) بانسيابية
                com.mirage.vpn.utils.LanguageUtils.switchLanguage(activity, lang)
            }
        }
    }
}

@Composable
fun DropdownLanguagePicker(currentLang: String, onLangSelected: (String) -> Unit) {
    var expanded by remember { mutableStateOf(false) }
    
    Box(modifier = Modifier.fillMaxWidth()) {
        OutlinedButton(
            onClick = { expanded = true },
            modifier = Modifier.fillMaxWidth(),
            colors = ButtonDefaults.outlinedButtonColors(contentColor = NeonBlue),
            border = androidx.compose.foundation.BorderStroke(1.dp, NeonBlue.copy(alpha = 0.5f))
        ) {
            Text("الواجهة اللغوية: $currentLang", fontFamily = FontFamily.Monospace)
        }
        
        DropdownMenu(
            expanded = expanded,
            onDismissRequest = { expanded = false },
            modifier = Modifier.background(SamuraiBlack).border(1.dp, NeonPurple)
        ) {
            DropdownMenuItem(
                text = { Text("العربية", color = Color.White) },
                onClick = { onLangSelected("العربية"); expanded = false }
            )
            DropdownMenuItem(
                text = { Text("English", color = Color.White) },
                onClick = { onLangSelected("English"); expanded = false }
            )
            DropdownMenuItem(
                text = { Text("Русский", color = Color.White) },
                onClick = { onLangSelected("Русский"); expanded = false }
            )
        }
    }
}

// 3. مراقبة الـ Ping في الوقت الفعلي (Real-time Telemetry)
@Composable
fun PingDisplay(pingValue: Long) {
    val activeColor by animateColorAsState(
        targetValue = when {
            pingValue == 0L -> Color.Gray
            pingValue < 100 -> Color.Green
            pingValue < 250 -> Color.Yellow
            else -> AlertRed
        },
        label = "PingColor"
    )

    Row(
        verticalAlignment = Alignment.CenterVertically,
        modifier = Modifier
            .background(SamuraiBlack)
            .border(1.dp, activeColor.copy(alpha = 0.5f), RoundedCornerShape(4.dp))
            .padding(horizontal = 12.dp, vertical = 6.dp)
    ) {
        // Neon Glow Dot
        Box(
            modifier = Modifier
                .size(8.dp)
                .background(activeColor, CircleShape)
                .blur(2.dp) // Simulate Glow
        )
        Box(modifier = Modifier.size(6.dp).background(activeColor, CircleShape).offset(x = (-7).dp))

        Text(
            text = "LATENCY: ${if(pingValue == 0L) "---" else pingValue}ms",
            color = activeColor,
            fontFamily = FontFamily.Monospace,
            fontWeight = FontWeight.Bold,
            modifier = Modifier.padding(start = 4.dp)
        )
    }
}

// 4. مؤشرات الاتصال (Cybernetic Pulse Visual Feedback)
@Composable
fun CyberneticPulseConnection() {
    val infiniteTransition = rememberInfiniteTransition(label = "Pulse")
    val scale by infiniteTransition.animateFloat(
        initialValue = 0.8f,
        targetValue = 1.4f,
        animationSpec = infiniteRepeatable(
            animation = tween(1200, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "PulseScale"
    )
    val alpha by infiniteTransition.animateFloat(
        initialValue = 1f,
        targetValue = 0f,
        animationSpec = infiniteRepeatable(
            animation = tween(1200, easing = FastOutLinearInEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "PulseAlpha"
    )

    // نصوص متحركة تتبدل تلقائياً
    val loadingTexts = listOf(
        "Initializing Samurai Core...",
        "Bypassing DPI Filters...",
        "Infiltrating Network...",
        "Establishing Secure Tunnel...",
        "Injecting Payload..."
    )
    var textIndex by remember { mutableStateOf(0) }

    LaunchedEffect(Unit) {
        while (true) {
            delay(1500)
            textIndex = (textIndex + 1) % loadingTexts.size
        }
    }

    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center,
        modifier = Modifier.fillMaxWidth().padding(32.dp)
    ) {
        Box(contentAlignment = Alignment.Center, modifier = Modifier.size(150.dp)) {
            // Expanding glow rings
            Box(
                modifier = Modifier
                    .size(100.dp)
                    .scale(scale)
                    .alpha(alpha)
                    .border(2.dp, NeonBlue, CircleShape)
            )
            Box(
                modifier = Modifier
                    .size(80.dp)
                    .scale(scale * 1.2f)
                    .alpha(alpha * 0.5f)
                    .border(1.dp, NeonPurple, CircleShape)
            )
            // Center Core
            Box(
                modifier = Modifier
                    .size(50.dp)
                    .background(NeonBlue.copy(alpha = 0.2f), CircleShape)
                    .border(2.dp, NeonBlue, CircleShape)
            )
        }

        Spacer(modifier = Modifier.height(24.dp))
        
        Text(
            text = loadingTexts[textIndex],
            color = NeonBlue,
            fontFamily = FontFamily.Monospace,
            fontSize = 14.sp,
            modifier = Modifier.animateContentSize()
        )
    }
}
