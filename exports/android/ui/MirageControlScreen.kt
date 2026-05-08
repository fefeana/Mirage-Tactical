package com.mirage.app.ui

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
import androidx.compose.ui.draw.blur
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.mirage.app.core.AutoUpdateManager
import com.mirage.app.core.ConnectionStatus
import com.mirage.app.core.MirageViewController
import com.mirage.app.core.SatelliteEmergencyManager
import kotlinx.coroutines.delay

@Composable
fun MirageControlScreen(controller: MirageViewController) {
    var showUpdateDialog by remember { mutableStateOf(false) }
    var apkDownloadUrl by remember { mutableStateOf("") }
    
    var isSatelliteMode by remember { mutableStateOf(false) }
    
    val context = LocalContext.current
    val satelliteManager = remember { SatelliteEmergencyManager(context) }
    
    val isConnected = controller.connectionState == ConnectionStatus.CONNECTED
    // extract ping as number if possible for color logic, otherwise 0
    val pingValue = controller.pingDisplay.removeSuffix(" ms").trim().toLongOrNull() ?: 0L

    // ألوان النيون الزمردية والسايبر بانك
    val neonEmerald = Color(0xFF50FFB1)
    val neonYellow = Color(0xFFF3E500)
    val dimRed = Color(0xFFFF5252)
    val cosmicBlue = Color(0xFF00BFFF)
    val darkBackground = Color(0xFF0B0E11)

    // لون النشاط بناءً على حالة الطوارئ والمستوى
    val activeColor = remember(isSatelliteMode, pingValue) {
        if (isSatelliteMode) cosmicBlue
        else if (pingValue in 1..99) neonEmerald
        else if (pingValue in 100..250) neonYellow
        else if (pingValue > 250) dimRed
        else neonEmerald // default when showing "-- ms"
    }

    // Phase 1: تحقق من التطور التكنولوجي (Auto-Update Check)
    LaunchedEffect(Unit) {
        AutoUpdateManager.checkForUpdates { hasUpdate, url ->
            if (hasUpdate) {
                apkDownloadUrl = url
                showUpdateDialog = true
            }
        }
    }
    
    // محاكاة تقييم الشبكة إذا كان متصلاً والتأكد من الطوارئ
    LaunchedEffect(controller.connectionState) {
        if (isConnected) {
            satelliteManager.triggerEmergencyProtocol { activated ->
                isSatelliteMode = activated
            }
        } else {
            isSatelliteMode = false
        }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(darkBackground),
        contentAlignment = Alignment.Center
    ) {
        // تأثير توهج في الخلفية (Neon Glow)
        Box(
            modifier = Modifier
                .size(300.dp)
                .blur(100.dp)
                .background(activeColor.copy(alpha = 0.15f), CircleShape)
        )

        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(30.dp)
        ) {
            // دائرة الحالة المتوهجة (بسيطة وجذابة)
            Box(
                modifier = Modifier
                    .size(220.dp)
                    .clip(CircleShape)
                    .background(Color.White.copy(alpha = 0.05f))
                    .border(2.dp, if (isConnected) activeColor else Color.Gray.copy(alpha = 0.3f), CircleShape)
                    .clickable { controller.onConnectClicked() },
                contentAlignment = Alignment.Center
            ) {
                // نبض بصري (Cybernetic Pulse) عند الاتصال
                if (isConnected) {
                    CyberneticPulseAnimation(color = activeColor)
                }
                
                Text(
                    text = when(controller.connectionState) {
                        ConnectionStatus.DISCONNECTED -> "إتصال"
                        ConnectionStatus.CONNECTING -> "جاري التأمين..."
                        ConnectionStatus.CONNECTED -> if (isSatelliteMode) "SATELLITE SHIELD ACTIVE" else "محمي"
                    },
                    color = Color.White,
                    fontSize = 20.sp
                )
            }

            // عرض السرعة بشكل مبسط جداً
            if (isConnected && !isSatelliteMode) {
                StatusChip(
                    label = "استجابة الشبكة: \${controller.pingDisplay}", 
                    active = true, 
                    color = activeColor
                )
            }

            // مؤشر حالة الساتلايت المتناغمة بصرياً
            if (isSatelliteMode || !isConnected) {
                StatusChip(
                    label = "SATELLITE MODE", 
                    active = isSatelliteMode, 
                    color = if (isSatelliteMode) cosmicBlue else Color.White.copy(alpha = 0.3f)
                )
            }
        }

        // نافذة التحديث بأسلوب Mirage
        if (showUpdateDialog) {
            AlertDialog(
                onDismissRequest = { showUpdateDialog = false },
                title = { Text("🚀 تحديث طارئ للدرع", color = neonEmerald) },
                text = { Text("هناك إصدار جديد من Mirage متاح الآن. يرجى التحديث لضمان أقصى درجات التخفي والسرعة.", color = Color.White) },
                confirmButton = {
                    TextButton(onClick = { 
                        showUpdateDialog = false
                        AutoUpdateManager.downloadAndInstallUpdate(context, apkDownloadUrl)
                    }) {
                        Text("تثبيت البروتوكول", color = neonEmerald)
                    }
                },
                dismissButton = {
                    TextButton(onClick = { showUpdateDialog = false }) {
                        Text("تأجيل للمهمة القادمة", color = Color.Gray)
                    }
                },
                containerColor = darkBackground,
                textContentColor = Color.White
            )
        }
    }
}

@Composable
fun CyberneticPulseAnimation(color: Color) {
    val infiniteTransition = rememberInfiniteTransition()
    val pulseRatio by infiniteTransition.animateFloat(
        initialValue = 0f,
        targetValue = 1f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 1500, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Restart
        )
    )

    Canvas(modifier = Modifier.fillMaxSize()) {
        drawCircle(
            color = color.copy(alpha = 1f - pulseRatio),
            radius = size.minDimension / 2f * pulseRatio,
            style = Stroke(width = 8f * (1f - pulseRatio))
        )
    }
}

@Composable
fun StatusChip(label: String, active: Boolean, color: Color) {
    Row(
        modifier = Modifier
            .clip(RoundedCornerShape(20.dp))
            .background(Color.White.copy(alpha = 0.05f))
            .padding(horizontal = 16.dp, vertical = 8.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Box(
            modifier = Modifier
                .size(8.dp)
                .background(color, CircleShape)
        )
        Spacer(modifier = Modifier.width(8.dp))
        Text(text = label, color = Color.White.copy(alpha = 0.7f), fontSize = 12.sp)
    }
}
