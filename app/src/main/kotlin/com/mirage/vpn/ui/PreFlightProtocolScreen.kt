package com.mirage.vpn.ui

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.Button
import androidx.compose.material.ButtonDefaults
import androidx.compose.material.Icon
import androidx.compose.material.Text
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Warning
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.hapticfeedback.HapticFeedbackType
import androidx.compose.ui.platform.LocalHapticFeedback
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.delay

enum class CheckStatus { PENDING, SCANNING, VERIFIED, WARNING }

data class DiagnosticItem(
    val label: String,
    val icon: String,
    var status: CheckStatus = CheckStatus.PENDING
)

@Composable
fun PreFlightProtocolScreen(onComplete: (Boolean) -> Unit) {
    val haptic = LocalHapticFeedback.current

    var checks by remember {
        mutableStateOf(
            listOf(
                DiagnosticItem("Integrity Check", "💓"),
                DiagnosticItem("Core Logic", "✅"),
                DiagnosticItem("Satellite Links", "🛰️"),
                DiagnosticItem("Haptic & Audio", "🎵"),
                DiagnosticItem("Encryption Key", "🔑")
            )
        )
    }

    var showAnalysis by remember { mutableStateOf(false) }
    var showWarningPrompt by remember { mutableStateOf(false) }

    // بدء تسلسل التحليل والفحص
    LaunchedEffect(Unit) {
        for (i in checks.indices) {
            // حالة "جاري الفحص المتقدم للمحور"
            val newScanningList = checks.toMutableList()
            newScanningList[i] = newScanningList[i].copy(status = CheckStatus.SCANNING)
            checks = newScanningList
            
            // نبضة רادار خفيفة
            haptic.performHapticFeedback(HapticFeedbackType.TextHandleMove) 
            delay(800) // محاكاة عملية معقدة

            // حالة "نجاح التحقق"
            val newVerifiedList = checks.toMutableList()
            newVerifiedList[i] = newVerifiedList[i].copy(status = CheckStatus.VERIFIED)
            checks = newVerifiedList
            
            // نبضة تأكيد قوية
            haptic.performHapticFeedback(HapticFeedbackType.LongPress) 
            delay(300)
        }

        // بعد التحقق الأساسي، سنعرض تحليل المسار الذي سيقوم بالإبلاغ عن مسار روسيا
        showAnalysis = true
        delay(1500)
        
        // نبضة إنذار تنبيهية خفيفة
        haptic.performHapticFeedback(HapticFeedbackType.LongPress) 
        delay(150)
        haptic.performHapticFeedback(HapticFeedbackType.LongPress)
        
        showWarningPrompt = true
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(DarkCharcoal)
            .padding(24.dp),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(
            "PRE-FLIGHT DIAGNOSTICS", 
            color = NeonBlue, 
            fontSize = 22.sp, 
            fontWeight = FontWeight.Black, 
            letterSpacing = 2.sp
        )
        Spacer(modifier = Modifier.height(8.dp))
        Text(
            "Initiating system health check...", 
            color = Color.Gray, 
            fontSize = 12.sp, 
            fontFamily = FontFamily.Monospace
        )

        Spacer(modifier = Modifier.height(40.dp))

        // القائمة التشخيصية للتحميل الرقمي
        Column(verticalArrangement = Arrangement.spacedBy(16.dp)) {
            checks.forEach { item ->
                DiagnosticRow(item)
            }
        }

        Spacer(modifier = Modifier.height(40.dp))

        // عرض تفاصيل تحليل المسارات (Path Tracing)
        AnimatedVisibility(visible = showAnalysis) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(12.dp))
                    .background(Color(0xFF1A1A1A))
                    .border(1.dp, Color.DarkGray, RoundedCornerShape(12.dp))
                    .padding(16.dp)
            ) {
                Text("📍 Path Tracing Analysis:", color = Color.White, fontSize = 14.sp, fontWeight = FontWeight.Bold)
                Spacer(modifier = Modifier.height(8.dp))
                // عرض المسارات الدولية كما طلبت
                Text("- CN-Beijing: 110ms", color = Color.Gray, fontSize = 12.sp, fontFamily = FontFamily.Monospace)
                Text("- JP-Tokyo: 85ms", color = Color.Gray, fontSize = 12.sp, fontFamily = FontFamily.Monospace)
                Text("- RU-Moscow: 280ms [HIGH LATENCY]", color = AlertRed, fontSize = 12.sp, fontFamily = FontFamily.Monospace)
                Text("- SA-Riyadh: 35ms [GOLDEN PATH]", color = EmeraldNeon, fontSize = 12.sp, fontFamily = FontFamily.Monospace)
            }
        }

        Spacer(modifier = Modifier.height(30.dp))

        // الاقتراح الاستراتيجي للمسار الذهبي
        AnimatedVisibility(visible = showWarningPrompt) {
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.Warning, contentDescription = "Warning", tint = Color(0xFFFF9100))
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        "تم رصد تأخير عالي في مسار روسيا.",
                        color = Color(0xFFFF9100),
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    "هل ننتقل لمسار السعودية كبديل أسرع؟",
                    color = Color.White,
                    fontSize = 13.sp
                )
                Spacer(modifier = Modifier.height(16.dp))

                Row(horizontalArrangement = Arrangement.spacedBy(16.dp)) {
                    Button(
                        onClick = { onComplete(false) }, // الرفض والبقاء على المسار الروسي
                        colors = ButtonDefaults.buttonColors(backgroundColor = Color.DarkGray)
                    ) {
                        Text("تجاهل (بقاء)", color = Color.White)
                    }

                    Button(
                        onClick = { onComplete(true) }, // الموافقة على مسار السعودية
                        colors = ButtonDefaults.buttonColors(backgroundColor = EmeraldNeon)
                    ) {
                        Text("تأكيد النقل الاستراتيجي", color = Color.Black, fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    }
}

@Composable
fun DiagnosticRow(item: DiagnosticItem) {
    Row(
        modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(
            text = item.label, 
            color = if (item.status == CheckStatus.PENDING) Color.Gray else Color.White, 
            fontSize = 16.sp, 
            modifier = Modifier.weight(1f)
        )
        
        when (item.status) {
            CheckStatus.PENDING -> Text("[WAIT]", color = Color.DarkGray, fontFamily = FontFamily.Monospace)
            CheckStatus.SCANNING -> Text("[SCAN...]", color = NeonBlue, fontFamily = FontFamily.Monospace)
            CheckStatus.VERIFIED -> Text("[Verified] ${item.icon}", color = EmeraldNeon, fontFamily = FontFamily.Monospace)
            CheckStatus.WARNING -> Text("[FAILED]", color = AlertRed, fontFamily = FontFamily.Monospace)
        }
    }
}
