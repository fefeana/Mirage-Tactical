package com.mirage.vpn.ui

import androidx.compose.animation.*
import androidx.compose.animation.core.*
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.Icon
import androidx.compose.material.IconButton
import androidx.compose.material.Text
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Lock
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.mirage.vpn.core.AdminSecurity
import com.mirage.vpn.core.MirageSentinel
import com.mirage.vpn.core.NetworkStatus
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import kotlin.math.abs
import kotlin.random.Random
import androidx.compose.ui.hapticfeedback.HapticFeedbackType
import androidx.compose.ui.platform.LocalHapticFeedback
import androidx.compose.material.Button
import androidx.compose.material.ButtonDefaults
import androidx.compose.material.Surface
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import com.mirage.vpn.core.MirageTracker

// إضافة SPEED_TEST إلى الحالات
enum class FlashType { IDLE, MAX_ENCRYPTION, SERVER_CHANGE, DANGER, SPEED_TEST }

@Composable
fun MirageKatanaAdminScreen(onBack: () -> Unit) {
    var hasCriticalError by remember { mutableStateOf(false) }

    MirageTheme {
        MirageErrorBoundary(
            hasError = hasCriticalError,
            onReset = { hasCriticalError = false }
        ) {
            val haptic = LocalHapticFeedback.current
            var isGhostMode by remember { mutableStateOf(false) }
            val uiAlpha by animateFloatAsState(if (isGhostMode) 0.3f else 1f)

            val isVipMode by AdminSecurity.isVipMode.collectAsState()

            val isFingerprintAuthenticated by AdminSecurity.isFingerprintAuthenticated.collectAsState()
            val coroutineScope = rememberCoroutineScope()

    var currentFlash by remember { mutableStateOf(FlashType.IDLE) }
    var toastMessage by remember { mutableStateOf("") }

    // Telemetry State (الأرقام اللحظية للشبكة)
    var downlink by remember { mutableStateOf(45.0) }
    var uplink by remember { mutableStateOf(15.0) }
    var ping by remember { mutableStateOf(45) }
    var stability by remember { mutableStateOf(95) }
    var isMaxEncryptionActive by remember { mutableStateOf(false) }

    // التحكم بطبقة عرض السرعة الضخمة (Overlay)
    var showBigSpeedTest by remember { mutableStateOf(false) }
    var massiveSpeedResult by remember { mutableStateOf(0.0) }

    // إعدادات الوميض الدائري (Ripple Effect) للسيرفر
    val rippleRadius = remember { Animatable(0f) }
    val rippleAlpha = remember { Animatable(0f) }
    val rippleColor = NeonViolet

    // تخصيص الألوان المطلوبة
    val iceBlue = Color(0xFF00E5FF)
    val dangerRed = Color(0xFFFF0033)
    val speedTestColor = Color(0xFF00FF9F) // Matrix/Cyber Green
    val bladeBaseColor = if (isMaxEncryptionActive) iceBlue else if (isVipMode) Color(0xFFFFD700) else EmeraldNeon

    // 애니메이션 الحالة
    val animatedBladeColor = remember { Animatable(bladeBaseColor) }
    val animatedGlow = remember { Animatable(1f) }

    // محاكاة الأرقام الحية
    LaunchedEffect(Unit) {
        while (true) {
            if (!showBigSpeedTest) {
                downlink = (downlink + Random.nextDouble(-10.0, 20.0)).coerceIn(10.0, 160.0)
                uplink = (uplink + Random.nextDouble(-5.0, 5.0)).coerceIn(5.0, 80.0)
            }
            ping = (ping + Random.nextInt(-5, 5)).coerceIn(10, 200)

            // انخفاض عشوائي للاستقرار
            if (Random.nextFloat() > 0.95f) {
                stability = Random.nextInt(40, 69) // إسقاطات مفاجئة للـ Danger
            } else {
                stability = (stability + Random.nextInt(-2, 5)).coerceIn(0, 100)
            }
            delay(1000)
        }
    }

    // ربط الخطر التلقائي بنسبة الاستقرار (الدرع الذكي)
    LaunchedEffect(stability) {
        if (stability < 70 && currentFlash == FlashType.IDLE) {
            currentFlash = FlashType.DANGER
            coroutineScope.launch {
                toastMessage = "نظام الاختراق يحاول كشف الحزم! تم تفعيل الطوارئ."
                delay(3000)
                if (toastMessage.contains("كشف")) toastMessage = ""
            }
        } else if (stability >= 70 && currentFlash == FlashType.DANGER) {
            currentFlash = FlashType.IDLE
        }
    }

    LaunchedEffect(currentFlash, bladeBaseColor) {
        when (currentFlash) {
            FlashType.SPEED_TEST -> {
                // التحكم في واجهة اختبار السرعة القصوى (Speed Test Overlay)
                showBigSpeedTest = true
                animatedBladeColor.animateTo(speedTestColor, tween(200))
                
                launch {
                    // وميض عالي التردد شديد (High-Frequency Strobe)
                    for (i in 1..25) {
                        animatedGlow.animateTo(5f, tween(30))
                        animatedGlow.animateTo(0.5f, tween(30))
                    }
                    animatedGlow.animateTo(2f, tween(300))
                }
                
                // صعود الرقم بشكل صاروخي لمحاكاة قياس فعلية للجيجا
                var simulatingSpeed = 0.0
                for (i in 1..25) {
                    simulatingSpeed = (simulatingSpeed + Random.nextDouble(50.0, 250.0)).coerceIn(10.0, 2500.0)
                    massiveSpeedResult = simulatingSpeed
                    downlink = simulatingSpeed // تحديث اللوحة الصغيرة أيضاً
                    delay(60)
                }
                
                delay(1500) // عرض النتيجة لفترة
                showBigSpeedTest = false
                currentFlash = FlashType.IDLE
            }
            FlashType.MAX_ENCRYPTION -> {
                // 1. الضربة القاطعة (White Strobe -> Ice Blue)
                isMaxEncryptionActive = true // تفعيل أيقونة القفل والثبات الجليدي
                animatedColorStrobe(animatedBladeColor, animatedGlow, iceBlue)
                delay(1000)
                currentFlash = FlashType.IDLE
            }
            FlashType.SERVER_CHANGE -> {
                // 2. تغيير السيرفر السريع (Ripple Effect)
                animatedBladeColor.animateTo(rippleColor, tween(200))
                animatedGlow.animateTo(3f, tween(200))

                launch {
                    rippleAlpha.snapTo(0.6f)
                    rippleRadius.snapTo(0f)
                    rippleRadius.animateTo(2500f, tween(600, easing = LinearOutSlowInEasing))
                    rippleAlpha.animateTo(0f, tween(300))
                    rippleRadius.snapTo(0f)
                }

                delay(400)
                animatedGlow.animateTo(1f, tween(400))
                animatedBladeColor.animateTo(bladeBaseColor, tween(400))
                currentFlash = FlashType.IDLE
            }
            FlashType.DANGER -> {
                // 3. إنذار الخطر النبضي
                animatedBladeColor.animateTo(dangerRed, tween(300))
                while (true) {
                    animatedGlow.animateTo(3.5f, tween(200, easing = FastOutLinearInEasing))
                    animatedGlow.animateTo(0.5f, tween(200, easing = FastOutSlowInEasing))
                }
            }
            FlashType.IDLE -> {
                // الوضع الهادئ المتفاعل مع السرعة (Dynamic Pulse Rate)
                animatedBladeColor.animateTo(bladeBaseColor, tween(500))
                while (true) {
                    // كلما زادت السرعة زاد توهج السيف وتردده
                    val speedFactor = if (downlink > 100.0) 250 else 1200
                    val peakGlow = if (downlink > 100.0) 2.5f else 1.2f

                    animatedGlow.animateTo(peakGlow, tween(speedFactor, easing = LinearOutSlowInEasing))
                    animatedGlow.animateTo(0.6f, tween(speedFactor, easing = FastOutSlowInEasing))
                }
            }
        }
    }

    // إنهاء الجلسة عند الخروج
    DisposableEffect(Unit) {
        onDispose { AdminSecurity.endSession() }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF0F0F0F))
            .graphicsLayer(alpha = uiAlpha), // تطبيق وضع الشبح (Phantom Mode)
        contentAlignment = Alignment.Center
    ) {
        // طبقة التموج الخاصة بتغيير السيرفر (Ripple Canvas)
        Canvas(modifier = Modifier.fillMaxSize()) {
            if (rippleRadius.value > 0f) {
                drawCircle(
                    color = rippleColor.copy(alpha = rippleAlpha.value),
                    radius = rippleRadius.value,
                    center = Offset(size.width / 2, size.height * 0.6f) // نقطة المنتصف السفلية (مقبض السيف)
                )
            }
        }

        IconButton(
            onClick = onBack,
            modifier = Modifier.align(Alignment.TopStart).padding(16.dp)
        ) {
            Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = Color.Gray)
        }

        // Phantom Toggle
        Box(modifier = Modifier.align(Alignment.TopEnd).padding(16.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text("GHOST MODE", color = if (isGhostMode) Color.Gray else Color.DarkGray, fontSize = 10.sp, fontWeight = FontWeight.Bold)
                Spacer(modifier = Modifier.width(8.dp))
                MirageTheme.PhantomToggle(isGhostMode = isGhostMode) { isGhostMode = it }
            }
        }

        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Text(
                text = "غرفة عمليات الساموراي",
                color = animatedBladeColor.value,
                fontSize = 20.sp,
                fontWeight = FontWeight.Bold,
                letterSpacing = 2.sp
            )

            Spacer(modifier = Modifier.height(20.dp))

            // وحدة التحكم بالسيف وعرض البيانات
            Row(
                modifier = Modifier.fillMaxWidth().padding(horizontal = 32.dp),
                horizontalArrangement = Arrangement.Center,
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Katana Controller
                KatanaBladeController(
                    currentColor = animatedBladeColor.value,
                    glowScale = animatedGlow.value,
                    onDoubleTap = {
                        haptic.performHapticFeedback(HapticFeedbackType.LongPress)
                        if (isFingerprintAuthenticated) {
                            currentFlash = FlashType.MAX_ENCRYPTION
                            MirageTracker.trackFeatureUsed("encryption_max_toggled")
                            coroutineScope.launch {
                                toastMessage = "الضربة القاطعة: تم القفل (Ice Blue Sec)"
                                delay(3000)
                                toastMessage = ""
                            }
                        } else showAuthError(coroutineScope, { toastMessage = it })
                    },
                    onLongPress = {
                        haptic.performHapticFeedback(HapticFeedbackType.LongPress)
                        if (isFingerprintAuthenticated) {
                            currentFlash = FlashType.SPEED_TEST
                            MirageTracker.trackFeatureUsed("katana_speed_test")
                        } else showAuthError(coroutineScope, { toastMessage = it })
                    },
                    onSwipe = {
                        haptic.performHapticFeedback(HapticFeedbackType.TextHandleMove) // اهتزاز خفيف جداً
                        if (isFingerprintAuthenticated) {
                            currentFlash = FlashType.SERVER_CHANGE
                            MirageTracker.trackFeatureUsed("server_change_swipe")
                            coroutineScope.launch {
                                toastMessage = "ومضة السيرفر: تم تبديل العقدة (Ripple)"
                                delay(2000)
                                toastMessage = ""
                            }
                        } else showAuthError(coroutineScope, { toastMessage = it })
                    }
                )

                Spacer(modifier = Modifier.width(32.dp))

                // Telemetry Panel (الأرقام السيبرانية)
                TelemetryPanel(downlink, uplink, ping, stability, isMaxEncryptionActive)
            }

            Spacer(modifier = Modifier.height(30.dp))

            // عرض حالة السيرفرات الحية
            LiveServerStatusGrid()

            Spacer(modifier = Modifier.height(20.dp))

            // إدارة مفاتيح التشفير
            EncryptionKeyManager(onRotate = {
                haptic.performHapticFeedback(HapticFeedbackType.TextHandleMove)
                coroutineScope.launch {
                    toastMessage = "Rotating encryption keys..."
                    delay(1500)
                    toastMessage = "Keys rotated successfully."
                    delay(2000)
                    toastMessage = ""
                }
            })

            Spacer(modifier = Modifier.height(20.dp))

            // الأوامر الخطيرة - Kill Switch (باللون الأحمر التنبيهي)
            Button(
                onClick = { 
                    haptic.performHapticFeedback(HapticFeedbackType.LongPress)
                    MirageTracker.trackFeatureUsed("kill_switch_activated")
                    coroutineScope.launch {
                        currentFlash = FlashType.DANGER
                        toastMessage = "SYSTEM KILLED. ALL CONNECTIONS DROPPED."
                        delay(4000)
                        toastMessage = ""
                        currentFlash = FlashType.IDLE
                    }
                },
                colors = ButtonDefaults.buttonColors(backgroundColor = Color(0xFFFF003C)),
                modifier = Modifier.fillMaxWidth(0.8f).height(50.dp)
            ) {
                Text("KILL SWITCH (إغلاق تام)", color = Color.White, fontWeight = FontWeight.Bold)
            }

            Spacer(modifier = Modifier.height(10.dp))

            // لوحة محاكاة الأوامر والأخطار للمطور
            Row(horizontalArrangement = Arrangement.spacedBy(16.dp)) {
                AdminDangerButton(isDanger = currentFlash == FlashType.DANGER) {
                    if (currentFlash == FlashType.DANGER) {
                        stability = 100 // فك الأزمة
                        currentFlash = FlashType.IDLE
                    } else {
                        stability = 40 // محاكاة الانهيار
                    }
                }
            }

            Spacer(modifier = Modifier.height(20.dp))

            // زر الترقية لـ VIP (Golden Edition)
            Box(
                modifier = Modifier
                    .fillMaxWidth(0.6f)
                    .clip(RoundedCornerShape(12.dp))
                    .background(Color(0xFF1F1F1F))
                    .border(
                        1.dp,
                        if (isVipMode) Color(0xFFFFD700) else Color.DarkGray,
                        RoundedCornerShape(12.dp)
                    )
                    .clickable {
                        if (isFingerprintAuthenticated) {
                            if (isVipMode) AdminSecurity.deactivateVIPStatus() else AdminSecurity.activateVIPStatus()
                        }
                    }
                    .padding(16.dp),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = if (isVipMode) "تعطيل الدروع الذهبية" else "تفعيل الدروع الذهبية",
                    color = if (isVipMode) Color(0xFFFFD700) else Color.Gray,
                    fontWeight = FontWeight.Bold
                )
            }

            Spacer(modifier = Modifier.height(20.dp))

            AnimatedVisibility(visible = toastMessage.isNotEmpty(), enter = fadeIn(), exit = fadeOut()) {
                Text(
                    text = toastMessage,
                    color = Color.White,
                    fontSize = 13.sp,
                    modifier = Modifier.background(Color.DarkGray.copy(alpha = 0.8f), RoundedCornerShape(8.dp)).padding(8.dp)
                )
            }
        }
        
        // Massive Speed Test Overlay Layer
        AnimatedVisibility(
            visible = showBigSpeedTest,
            enter = fadeIn(tween(200)) + scaleIn(initialScale = 0.8f),
            exit = fadeOut(tween(500)) + scaleOut(targetScale = 1.2f),
            modifier = Modifier.align(Alignment.Center)
        ) {
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Color(0xBB000000))
                    .padding(vertical = 40.dp)
            ) {
                Text("TESTING CORE SPEED...", color = Color.White, fontSize = 16.sp, letterSpacing = 4.sp)
                Spacer(modifier = Modifier.height(10.dp))
                Text(
                    text = String.format("%.0f", massiveSpeedResult),
                    color = speedTestColor,
                    fontSize = 80.sp,
                    fontWeight = FontWeight.Black,
                    fontFamily = FontFamily.Monospace,
                    modifier = Modifier.graphicsLayer {
                        shadowElevation = 30f
                        shape = RoundedCornerShape(8.dp)
                        ambientShadowColor = speedTestColor
                        spotShadowColor = speedTestColor
                    }
                )
                Text("Mbps", color = speedTestColor, fontSize = 24.sp, fontWeight = FontWeight.Bold)
            }
        }
    }
    // Simulate error throwing mechanism for devs
    val throwErrorMock = { hasCriticalError = true }
        }
    }
}

@Composable
fun TelemetryPanel(downlink: Double, uplink: Double, ping: Int, stability: Int, isMaxEncryptionActive: Boolean) {
    Column(
        verticalArrangement = Arrangement.spacedBy(20.dp)
    ) {
        TelemetryRow("DOWNLINK", String.format("%.1f", downlink) + " Mbps", if (downlink > 100) Color(0xFF00E5FF) else EmeraldNeon)
        TelemetryRow("UPLINK", String.format("%.1f", uplink) + " Mbps", EmeraldNeon)
        TelemetryRow("LATENCY", "$ping ms", if (ping > 100) Color(0xFFFF9100) else EmeraldNeon)
        TelemetryRow("STABILITY", "$stability%", if (stability < 70) Color(0xFFFF0033) else EmeraldNeon)

        if (isMaxEncryptionActive) {
            Spacer(modifier = Modifier.height(4.dp))
            Row(
                modifier = Modifier
                    .background(Color(0xFF00E5FF).copy(alpha = 0.1f), RoundedCornerShape(12.dp))
                    .border(1.dp, Color(0xFF00E5FF).copy(alpha = 0.5f), RoundedCornerShape(12.dp))
                    .padding(horizontal = 10.dp, vertical = 6.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(Icons.Default.Lock, contentDescription = "Locked", tint = Color(0xFF00E5FF), modifier = Modifier.size(16.dp))
                Spacer(modifier = Modifier.width(6.dp))
                Text("Hysteria2\nAES-256", color = Color(0xFF00E5FF), fontSize = 9.sp, fontWeight = FontWeight.Bold, lineHeight = 12.sp)
            }
        }
    }
}

@Composable
fun TelemetryRow(label: String, value: String, valueColor: Color) {
    Column {
        Text(label, color = Color.Gray, fontSize = 10.sp, letterSpacing = 1.sp, fontWeight = FontWeight.SemiBold)
        Spacer(modifier = Modifier.height(2.dp))
        Text(value, color = valueColor, fontSize = 18.sp, fontWeight = FontWeight.Black, fontFamily = FontFamily.Monospace)
    }
}

// دالة محاكاة وميض البرق السريع (White Strobe) المتوجه لـ Ice Blue
suspend fun animatedColorStrobe(colorAnim: Animatable<Color, *>, glowAnim: Animatable<Float, *>, finalColor: Color) {
    // وميض أبيض ناصع متردد السطوع
    colorAnim.snapTo(Color.White)
    glowAnim.animateTo(4f, tween(50))
    glowAnim.animateTo(1f, tween(50))
    glowAnim.animateTo(5f, tween(50))
    glowAnim.animateTo(0.5f, tween(50))
    glowAnim.animateTo(6f, tween(100))

    // الاستقرار على الأزرق الجليدي
    colorAnim.animateTo(finalColor, tween(400))
    glowAnim.animateTo(1.5f, tween(400))
}

fun showAuthError(scope: kotlinx.coroutines.CoroutineScope, updateToast: (String) -> Unit) {
    scope.launch {
        updateToast("مرفوض: يجب التحقق من البصمة السيادية!")
        delay(2500)
        updateToast("")
    }
}

@Composable
fun KatanaBladeController(
    currentColor: Color,
    glowScale: Float,
    onDoubleTap: () -> Unit,
    onLongPress: () -> Unit,
    onSwipe: () -> Unit
) {
    Box(
        modifier = Modifier
            .height(280.dp)
            .width(80.dp)
            .pointerInput(Unit) {
                detectTapGestures(
                    onDoubleTap = { onDoubleTap() },
                    onLongPress = { onLongPress() }
                )
            }
            .pointerInput(Unit) {
                detectDragGestures(
                    onDrag = { change, dragAmount ->
                        change.consume()
                        if (abs(dragAmount.x) > 30 || abs(dragAmount.y) > 30) {
                            onSwipe()
                        }
                    }
                )
            },
        contentAlignment = Alignment.Center
    ) {
        // توهج السيف
        Box(
            modifier = Modifier
                .fillMaxHeight(0.9f)
                .width(6.dp)
                .graphicsLayer(
                    scaleY = 1f,
                    scaleX = glowScale,
                    alpha = (glowScale * 0.3f).coerceIn(0.2f, 1f)
                )
                .shadow(elevation = 25.dp, spotColor = currentColor, ambientColor = currentColor)
                .background(
                    Brush.verticalGradient(
                        listOf(Color.Transparent, currentColor, Color.White, currentColor, Color.Transparent)
                    )
                )
        )
        // شفرة السيف الصلبة القلبية
        Box(
            modifier = Modifier
                .fillMaxHeight(0.7f)
                .width(2.dp)
                .background(Brush.verticalGradient(listOf(Color.Transparent, Color.White, Color.Transparent)))
        )
        // مقبض السيف (Hilt)
        Box(
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .padding(bottom = 10.dp)
                .height(40.dp)
                .width(12.dp)
                .background(Color.DarkGray, RoundedCornerShape(4.dp))
                .border(1.dp, currentColor.copy(alpha = 0.5f), RoundedCornerShape(4.dp))
        )
    }
}

@Composable
fun AdminDangerButton(isDanger: Boolean, onClick: () -> Unit) {
    Box(
        modifier = Modifier
            .clip(RoundedCornerShape(8.dp))
            .background(if (isDanger) Color(0xFFFF0033) else Color.DarkGray.copy(alpha = 0.5f))
            .clickable { onClick() }
            .padding(horizontal = 16.dp, vertical = 8.dp),
        contentAlignment = Alignment.Center
    ) {
        Text(
            text = if (isDanger) "إيقاف الإنذار" else "محاكاة الإنذار (خطر)",
            color = Color.White,
            fontSize = 12.sp,
            fontWeight = FontWeight.Bold
        )
    }
}

@Composable
fun LiveServerStatusGrid() {
    val nodes = listOf("TKY-01", "NYC-04", "FFT-09")
    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
        nodes.forEach { node ->
            Box(
                modifier = Modifier
                    .clip(RoundedCornerShape(6.dp))
                    .background(Color(0xFF1E1E1E))
                    .border(1.dp, EmeraldNeon.copy(alpha = 0.3f), RoundedCornerShape(6.dp))
                    .padding(horizontal = 12.dp, vertical = 6.dp)
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(modifier = Modifier.size(6.dp).background(EmeraldNeon, androidx.compose.foundation.shape.CircleShape))
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(node, color = Color.White, fontSize = 10.sp, fontFamily = FontFamily.Monospace)
                }
            }
        }
    }
}

@Composable
fun EncryptionKeyManager(onRotate: () -> Unit) {
    Row(
        modifier = Modifier
            .fillMaxWidth(0.8f)
            .clip(RoundedCornerShape(8.dp))
            .background(Color.DarkGray.copy(alpha = 0.3f))
            .padding(12.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Column {
            Text("Encryption Keys", color = Color.Gray, fontSize = 10.sp)
            Text("Active & Synced", color = EmeraldNeon, fontSize = 12.sp, fontWeight = FontWeight.Bold)
        }
        Box(
            modifier = Modifier
                .clip(RoundedCornerShape(4.dp))
                .clickable { onRotate() }
                .background(NeonViolet.copy(alpha = 0.2f))
                .border(1.dp, NeonViolet, RoundedCornerShape(4.dp))
                .padding(horizontal = 12.dp, vertical = 6.dp)
        ) {
            Text("ROTATE", color = NeonViolet, fontSize = 10.sp, fontWeight = FontWeight.Black)
        }
    }
}
