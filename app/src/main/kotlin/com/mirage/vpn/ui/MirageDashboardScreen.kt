package com.mirage.vpn.ui

import androidx.compose.animation.core.*
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.Icon
import androidx.compose.material.Text
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.FavoriteBorder
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.animation.core.animateIntAsState
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.mirage.vpn.core.NativeEngine
import androidx.compose.ui.platform.LocalContext
import androidx.fragment.app.FragmentActivity
import androidx.compose.foundation.ExperimentalFoundationApi
import androidx.compose.foundation.combinedClickable
import com.mirage.vpn.core.AdminSecurity
import com.mirage.vpn.core.ExecutiveDirectorAI
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import kotlin.random.Random

// لوحة الألوان الخاصة بمشروع الميراج (Mirage Palette)
val AbsoluteBlack = Color(0xFF000000)
val EmeraldNeon = Color(0xFF50C878)
val CalmTeal = Color(0xFF00E5FF)
val AnxiousOrange = Color(0xFFFF9100)
val CriticalRed = Color(0xFFFF0033)

import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.IconButton

@OptIn(ExperimentalFoundationApi::class)
@Composable
fun MirageDashboardScreen() {
    val context = LocalContext.current
    val isVipMode by AdminSecurity.isVipMode.collectAsState()

    // لوحة الألوان المخصصة (ترد dynamically حال الترقية للـ VIP)
    val primaryColor = if (isVipMode) Color(0xFFFFD700) else EmeraldNeon // الذهب النيوني للـ VIP، أو الأخضر
    val secondaryColor = if (isVipMode) Color(0xFF1A1A1A) else AbsoluteBlack
    val currentGlowMultiplier = if (isVipMode) 2.0f else 1.0f

    // نظام ملاحة بسيط للتبديل بين النافذة الرئيسية وقسم الإعدادات المموه (Drafts)
    var showDraftsScreen by remember { mutableStateOf(false) }
    if (showDraftsScreen) {
        MirageDraftsScreen(onBack = { showDraftsScreen = false })
        return
    }

    var showProfileScreen by remember { mutableStateOf(false) }
    if (showProfileScreen) {
        MirageProfileScreen(onBack = { showProfileScreen = false })
        return
    }

    // لوحة الإدارة
    var showAdminPanel by remember { mutableStateOf(false) }
    if (showAdminPanel) {
        MirageKatanaAdminScreen(onBack = { showAdminPanel = false })
        return
    }

    // حالة الاتصال المركزية
    var isConnected by remember { mutableStateOf(false) }
    
    // مراقب السرعة الحي
    var currentSpeed by remember { mutableStateOf(0.0) }
    var currentPing by remember { mutableStateOf(0) }

    // الاستماع المباشر لنبض الـ C++ ولـ Executive Director AI
    val trafficUpdate by NativeEngine.nativeTrafficFlow.collectAsState()
    val glowIntensity by ExecutiveDirectorAI.liveGlowIntensity.collectAsState()
    val managedComments by ExecutiveDirectorAI.managedComments.collectAsState()

    val coroutineScope = rememberCoroutineScope()
    var showFreedomMessage by remember { mutableStateOf(false) }

    LaunchedEffect(isConnected) {
        if (isConnected) {
            val fanNames = listOf("User_89x", "CyberNinja", "Ghost_Pro", "Samurai_01", "NightOwl", "Neon_Glitch")
            val reviewTexts = listOf("OMG so fast! 🔥", "Love this story!!!", "Can't wait for the next part!", "Insane interaction! 🚀", "100% recommended!", "This is going viral 🤯", "Awesome content!", "So smooth \uD83D\uDE0E")
            
            // إضافة "نبض الحياة" إذا كان الجسر متصلاً لكن لا توجد بيانات عبر الـ JNI
            while (true) {
                delay((Random.nextInt(2, 5) * 1000).toLong())
                if (currentSpeed < 0.1) {
                    currentSpeed = Random.nextDouble(0.1, 0.5) // وهج هادئ للنبض الليزري
                    currentPing = Random.nextInt(35, 60)
                }
                
                // تغذية المدير التنفيذي
                ExecutiveDirectorAI.processIncomingFeedback(fanNames.random(), reviewTexts.random())
            }
        } else {
            ExecutiveDirectorAI.resetStandby()
        }
    }

    LaunchedEffect(trafficUpdate) {
        if (isConnected && trafficUpdate.first > 0) {
            // حين يضخ الـ C++ بيانات عبر الـ Callback
            val (rx, tx) = trafficUpdate
            // للتبسيط في هذا المخطط، نأخذ دلالة الحدث على كونه حزمة بحجم 16KB-32KB مرت في أجزاء من الثانية
            currentSpeed = Random.nextDouble(10.0, 85.0) // سرعة قوية تترجم تدفق الحزم
            currentPing = Random.nextInt(40, 70)         // محاكاة بينج منخفض
        }
    }

    // حالة إظهار التوجيهات
    var showTutorialOverlay by remember { mutableStateOf(true) }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(secondaryColor) // الأسود المطلق لتوفير بطاريات OLED ولإبراز النيون، يتغير في VIP
    ) {
        // أيقونة الإعدادات (Control Portal)
        Box(
            modifier = Modifier
                .align(Alignment.TopStart)
                .padding(16.dp)
                .size(48.dp)
                .clickable { 
                    showTutorialOverlay = false
                    showDraftsScreen = true 
                },
            contentAlignment = Alignment.Center
        ) {
            Icon(
                imageVector = androidx.compose.material.icons.Icons.Default.Settings,
                contentDescription = "Settings",
                tint = if (isVipMode) primaryColor else Color.DarkGray
            )
        }

        // الأيقونة المموهة للملف الشخصي
        // عند الضغط المطول تستدعي نظام البصمة لفتح لوحة التحكم
        Box(
            modifier = Modifier
                .align(Alignment.TopEnd)
                .padding(16.dp)
                .size(48.dp)
                .combinedClickable(
                    onClick = { showProfileScreen = true },
                    onLongClick = {
                        val activity = context as? FragmentActivity
                        if (activity != null) {
                            AdminSecurity.authenticate(
                                activity = activity,
                                onSuccess = { token -> showAdminPanel = true },
                                onError = { /* يمكن إظهار رسالة فشل */ }
                            )
                        }
                    }
                ),
            contentAlignment = Alignment.Center
        ) {
            Icon(
                imageVector = Icons.Default.Person,
                contentDescription = "User Profile",
                tint = if (isVipMode) primaryColor else Color.DarkGray
            )
        }

        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(32.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            if (isConnected) {
                // هالة الـ Ping المستقرة (Audience Engagement)
                AudienceEngagementStatus(ping = currentPing)
                
                Spacer(modifier = Modifier.height(24.dp))
                
                // واجهة التمويه (Disguised Speed Meter)
                LikeSpeedMeter(speedInMb = currentSpeed, isConnected = isConnected, primaryColor = primaryColor)
                
                Spacer(modifier = Modifier.height(8.dp))
                DynamicLightStrings(speed = currentSpeed, primaryColor = primaryColor)
                
                Spacer(modifier = Modifier.height(16.dp))
                
                // واجهة آراء المعجبين (FanFeedbackSheet TikTok-Style)
                FanFeedbackSheet(comments = managedComments)

            } else {
                LikeSpeedMeter(speedInMb = 0.0, isConnected = isConnected, primaryColor = primaryColor)
                Spacer(modifier = Modifier.height(16.dp))
                FanFeedbackSheet(comments = managedComments)
            }

            Spacer(modifier = Modifier.height(40.dp))

            // زر الاتصال المكون من الزجاج السائل والنيون المشع
            NeonConnectionButton(
                isConnected = isConnected,
                glowIntensity = glowIntensity * currentGlowMultiplier,
                primaryColor = primaryColor,
                onClick = { 
                    isConnected = !isConnected
                    if (isConnected) {
                        coroutineScope.launch {
                            showFreedomMessage = true
                            delay(4500)
                            showFreedomMessage = false
                        }
                    } else {
                        showFreedomMessage = false
                    }
                }
            )
        }

        // الرسالة التحفيزية (Snackbar Policy & Philosophy) النيونية
        NeonSnackbar(
            message = "الحرية ليست مجرد كسر القيود، بل هي أن تعيش بطريقة تحترم وتعزز حرية الآخرين.",
            isVisible = showFreedomMessage,
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .padding(bottom = 32.dp, start = 16.dp, end = 16.dp)
        )

        // الدليل التفاعلي لنظام الاستهداف (Targeting System Tutorial Overlay)
        if (showTutorialOverlay) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(Color.Black.copy(alpha = 0.7f))
                    .clickable { showTutorialOverlay = false } // إخفاء عند الضغط في أي مكان
            ) {
                // إرشاد الإعدادات
                Column(
                    modifier = Modifier.align(Alignment.TopStart).padding(start = 24.dp, top = 70.dp)
                ) {
                    androidx.compose.foundation.Canvas(modifier = Modifier.size(24.dp)) {
                        drawLine(color = EmeraldNeon, start = Offset(size.width / 2, -30f), end = Offset(size.width / 2, size.height), strokeWidth = 3f)
                    }
                    Text(
                        "TARGET ACQUIRED: SETTINGS\nقم بتخصيص تشفيرك.",
                        color = EmeraldNeon,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        fontFamily = FontFamily.Monospace,
                        modifier = Modifier.padding(top = 8.dp)
                    )
                }

                // إرشاد المحرك (Connect Button)
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    modifier = Modifier.align(Alignment.BottomCenter).padding(bottom = 180.dp)
                ) {
                    Text(
                        "TARGET ACQUIRED: ENGINE\nشغل المحرك التكتيكي من هنا.",
                        color = EmeraldNeon,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        fontFamily = FontFamily.Monospace,
                        textAlign = TextAlign.Center,
                        modifier = Modifier.padding(bottom = 16.dp)
                    )
                    androidx.compose.foundation.Canvas(modifier = Modifier.size(24.dp)) {
                        drawLine(color = EmeraldNeon, start = Offset(size.width / 2, 0f), end = Offset(size.width / 2, 80f), strokeWidth = 3f)
                    }
                }
            }
        }
    }
}

// ========================================================
// واجهة التمويه (The Camouflage UI): LikeSpeedMeter
// ========================================================
@Composable
fun LikeSpeedMeter(speedInMb: Double, isConnected: Boolean, primaryColor: Color = EmeraldNeon) {
    if (!isConnected) {
        // وضع "الاستعداد" (The Standby Mode / Archive)
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Box(
                modifier = Modifier
                    .background(Color.DarkGray.copy(alpha = 0.2f), RoundedCornerShape(12.dp))
                    .border(1.dp, Color.DarkGray, RoundedCornerShape(12.dp))
                    .padding(horizontal = 16.dp, vertical = 20.dp),
                contentAlignment = Alignment.Center
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(16.dp)) {
                    Icon(
                        imageVector = Icons.Default.FavoriteBorder,
                        contentDescription = "Archived Story",
                        tint = Color.Gray,
                        modifier = Modifier.size(28.dp)
                    )
                    EmeraldPulseLineLightning(modifier = Modifier.width(60.dp))
                }
            }
            
            Text(
                text = "SYSTEM STANDBY",
                style = TextStyle(
                    color = Color.Gray,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold,
                    fontFamily = FontFamily.Monospace,
                    letterSpacing = 2.sp
                ),
                modifier = Modifier.padding(top = 12.dp)
            )
        }
        return
    }

    // اللمسة السحرية لربط السرعة باللايكات (1 MB = 1000 Likes)
    val targetLikes = (speedInMb * 1000).toInt()
    val animatedLikes by animateIntAsState(
        targetValue = targetLikes,
        animationSpec = tween(durationMillis = 500)
    )

    // كلما زادت السرعة، قلّ وقت النبضة (ينبض بشكل أسرع)
    val duration = when {
        speedInMb < 0.5 -> 1000 // هادئ جداً
        speedInMb < 5.0 -> 700  // طبيعي
        speedInMb < 20.0 -> 300 // سريع
        else -> 100             // جنوني (5G)
    }

    val infiniteTransition = rememberInfiniteTransition()
    val pulseScale by infiniteTransition.animateFloat(
        initialValue = 0.85f,
        targetValue = 1.25f,
        animationSpec = infiniteRepeatable(
            animation = tween(duration),
            repeatMode = RepeatMode.Reverse
        )
    )

    val baseScale by animateFloatAsState(targetValue = if (speedInMb > 5) 1.2f else 1.0f)

    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        // المستطيل النيوني
        Box(
            modifier = Modifier
                .scale(baseScale) // يكبر حجم القلب مع السرعة
                .background(primaryColor.copy(alpha = 0.2f), RoundedCornerShape(12.dp)) // خلفية شفافة النيون
                .border(1.dp, primaryColor, RoundedCornerShape(12.dp))
                .padding(horizontal = 16.dp, vertical = 8.dp),
            contentAlignment = Alignment.Center
        ) {
            Icon(
                imageVector = Icons.Default.Favorite,
                contentDescription = "Likes Counter", // تمويه
                tint = primaryColor,
                modifier = Modifier
                    .size(28.dp)
                    .graphicsLayer(
                        scaleX = pulseScale,
                        scaleY = pulseScale
                    )
            )
        }
        
        // عدد اللايكات (الذي هو في الحقيقة سرعة الـ VPN)
        val thousands = animatedLikes / 1000
        val hundreds = (animatedLikes % 1000) / 100
        Text(
            text = "${thousands}.${hundreds}K Likes",
            style = TextStyle(
                color = Color.White,
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold,
                fontFamily = FontFamily.Monospace
            ),
            modifier = Modifier.padding(top = 8.dp)
        )
    }
}

// 2. هالة تفاعل الجمهور (The Audience Engagement Aura - was StabilityAura)
@Composable
fun AudienceEngagementStatus(ping: Int) {
    val (auraColor, pulseDuration) = when {
        ping < 60 -> CalmTeal to 1500           // حماس عالي
        ping < 120 -> AnxiousOrange to 800      // حماس متوسط
        else -> CriticalRed to 300              // حماس ناري
    }

    val infiniteTransition = rememberInfiniteTransition()
    val alpha by infiniteTransition.animateFloat(
        initialValue = 0.3f,
        targetValue = 0.9f,
        animationSpec = infiniteRepeatable(
            animation = tween(pulseDuration, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        )
    )

    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(
            text = "Audience Engagement",
            color = Color.LightGray,
            fontSize = 12.sp,
            letterSpacing = 1.sp,
            modifier = Modifier.padding(bottom = 8.dp)
        )
        Box(
            modifier = Modifier
                .size(100.dp)
                .graphicsLayer(alpha = alpha)
                .border(2.dp, auraColor, CircleShape)
                .background(auraColor.copy(alpha = 0.1f), CircleShape), // توهج داخلي خفيف
            contentAlignment = Alignment.Center
        ) {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Text(
                    text = "$ping",
                    color = auraColor,
                    fontWeight = FontWeight.Bold,
                    fontSize = 24.sp
                )
                Text(
                    text = "pts",
                    color = auraColor.copy(alpha = 0.7f),
                    fontSize = 12.sp
                )
            }
        }
    }
}
