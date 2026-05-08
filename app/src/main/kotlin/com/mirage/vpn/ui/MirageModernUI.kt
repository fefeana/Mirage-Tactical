package com.mirage.vpn.ui

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.*
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.material.Switch
import androidx.compose.material.SwitchDefaults

// تعريف سمات السايبربانك ووضع التخفي (MirageTheme & PhantomToggle)
object MirageTheme {
    val DarkCharcoal = Color(0xFF101010)
    val NeonBlue = Color(0xFF00F3FF)
    val NeonPurple = Color(0xFFBC00FF)
    val AlertRed = Color(0xFFFF003C)

    @Composable
    fun PhantomToggle(isGhostMode: Boolean, onToggle: (Boolean) -> Unit) {
        // مفتاح تبديل يغير مظهر التطبيق بالكامل
        Switch(
            checked = isGhostMode,
            onCheckedChange = onToggle,
            colors = SwitchDefaults.colors(
                checkedThumbColor = NeonPurple,
                uncheckedThumbColor = NeonBlue
            )
        )
    }
}
import androidx.compose.animation.slideInVertically
import androidx.compose.animation.slideOutVertically
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.ui.layout.ContentScale
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.*
import androidx.compose.ui.unit.IntOffset
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.Icon
import androidx.compose.material.Text
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.Reply
import androidx.compose.material.icons.outlined.FavoriteBorder
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.blur
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.hapticfeedback.HapticFeedbackType
import androidx.compose.ui.platform.LocalHapticFeedback
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.mirage.vpn.core.FanComment
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

val NeonViolet = Color(0xFFB026FF)
val EmeraldGreenLight = Color(0xFF00FF88)

// ========================================================
// 1. زر الاتصال السيبراني (Neon Connection Button)
// ========================================================
@Composable
fun NeonConnectionButton(isConnected: Boolean, glowIntensity: Float, primaryColor: Color = EmeraldNeon, onClick: () -> Unit) {
    val coroutineScope = rememberCoroutineScope()
    var isPressed by remember { mutableStateOf(false) }

    // نبض خلفي متصاعد يعتمد على حالة الاتصال و"حماس" الجمهور
    val infiniteTransition = rememberInfiniteTransition()
    val pulseScale by infiniteTransition.animateFloat(
        initialValue = 1f,
        targetValue = if (isConnected) 1.3f * glowIntensity else 1f,
        animationSpec = infiniteRepeatable(
            animation = tween(1200, easing = LinearOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        )
    )

    // تأثير الضغط
    val buttonScale by animateFloatAsState(targetValue = if (isPressed) 0.95f else 1f)

    val gradientBrush = Brush.linearGradient(
        colors = listOf(primaryColor, NeonViolet),
        start = Offset(0f, 0f),
        end = Offset(Float.POSITIVE_INFINITY, Float.POSITIVE_INFINITY)
    )

    val haptic = LocalHapticFeedback.current

    Box(contentAlignment = Alignment.Center, modifier = Modifier.size(160.dp)) {
        // حلقة النبض النيون (Pulsing Glow)
        if (isConnected) {
            Box(
                modifier = Modifier
                    .size(120.dp)
                    .graphicsLayer(scaleX = pulseScale, scaleY = pulseScale, alpha = 0.4f)
                    .blur(20.dp) // ضبابية نيون مشعة
                    .background(gradientBrush, CircleShape)
            )
        }

        // الزر الأساسي Glassmorphism
        Box(
            modifier = Modifier
                .size(120.dp)
                .scale(buttonScale)
                .clip(CircleShape)
                .background(Color.White.copy(alpha = 0.05f)) // Glass Effect Opacity
                .blur(radius = 15.dp, edgeTreatment = androidx.compose.ui.draw.BlurredEdgeTreatment.Unbounded)
                .border(
                    width = 2.dp,
                    brush = if (isConnected) gradientBrush else Brush.linearGradient(listOf(Color.DarkGray, Color.Gray)),
                    shape = CircleShape
                )
                .clickable(
                    interactionSource = remember { MutableInteractionSource() },
                    indication = null
                ) {
                    coroutineScope.launch {
                        isPressed = true
                        if (isConnected) {
                            haptic.performHapticFeedback(HapticFeedbackType.LongPress)
                            delay(100)
                            haptic.performHapticFeedback(HapticFeedbackType.LongPress) // Double buzz for disconnect/error
                        } else {
                            haptic.performHapticFeedback(HapticFeedbackType.LongPress) // Success pulse
                        }
                        delay(100)
                        isPressed = false
                        onClick()
                    }
                },
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = if (isConnected) "CONNECTED" else "ENGAGE",
                color = if (isConnected) Color.White else Color.LightGray,
                fontWeight = FontWeight.Bold,
                letterSpacing = 2.sp,
                fontSize = 15.sp
            )
        }
    }
}

// ========================================================
// 2. خطوط الشبكة المتسارعة (Dynamic Light Strings)
// ========================================================
@Composable
fun DynamicLightStrings(speed: Double, primaryColor: Color = EmeraldNeon) {
    val linesCount = if (speed > 5) 3 else 1
    
    Column(modifier = Modifier.fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(4.dp)) {
        for (i in 0 until linesCount) {
            val infiniteTransition = rememberInfiniteTransition()
            val duration = (1000 / (speed.coerceAtLeast(0.1) * (i + 1))).toInt().coerceIn(200, 2000)
            
            val xOffset by infiniteTransition.animateFloat(
                initialValue = -500f,
                targetValue = 1500f,
                animationSpec = infiniteRepeatable(
                    animation = tween(duration, easing = LinearEasing),
                    repeatMode = RepeatMode.Restart
                )
            )

            androidx.compose.foundation.Canvas(modifier = Modifier.fillMaxWidth().height(2.dp)) {
                drawLine(
                    brush = Brush.linearGradient(
                        colors = listOf(Color.Transparent, if (i % 2 == 0) primaryColor else NeonViolet, Color.Transparent),
                        start = Offset(xOffset, 0f),
                        end = Offset(xOffset + 400f, 0f)
                    ),
                    start = Offset(0f, 0f),
                    end = Offset(size.width, 0f),
                    strokeWidth = (4 - i).toFloat()
                )
            }
        }
    }
}

// ========================================================
// 3. واجهة "آراء المعجبين" (FanFeedbackSheet TikTok-Style)
// ========================================================
@Composable
fun FanFeedbackSheet(comments: List<FanComment>) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .fillMaxHeight(0.5f) // يظهر كنصف شاشة سفلي كما طلب المستخدم
            .clip(RoundedCornerShape(16.dp))
            .background(Color.Black.copy(alpha = 0.8f)) // خلفية سوداء شفافة
            .border(1.dp, NeonViolet.copy(alpha = 0.3f), RoundedCornerShape(16.dp))
            .padding(16.dp)
    ) {
        Text(
            text = "Fans' Feedback",
            color = Color.White.copy(alpha = 0.8f),
            fontSize = 11.sp,
            fontWeight = FontWeight.Bold,
            modifier = Modifier.padding(bottom = 8.dp, start = 4.dp)
        )

        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            items(comments, key = { it.id }) { comment ->
                // تأثير الظهور التدريجي (Fade-in / Slide-up)
                AnimatedVisibility(
                    visible = true,
                    enter = fadeIn(tween(500)) + slideInVertically(tween(500)) { it / 2 }
                ) {
                    FanFeedbackCard(comment)
                }
            }
        }
    }
}

@Composable
fun FanFeedbackCard(comment: FanComment) {
    var isLiked by remember { mutableStateOf(false) }
    val likeScale by animateFloatAsState(targetValue = if (isLiked) 1.3f else 1.0f, animationSpec = spring(dampingRatio = Spring.DampingRatioMediumBouncy))

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(12.dp))
            .background(Color.White.copy(alpha = 0.05f))
            .border(0.5.dp, NeonViolet.copy(alpha = 0.5f), RoundedCornerShape(12.dp))
            .padding(8.dp),
        verticalAlignment = Alignment.Top
    ) {
        // صورة البروفايل
        Box(
            modifier = Modifier
                .size(38.dp)
                .background(Brush.linearGradient(listOf(EmeraldNeon, NeonViolet)), CircleShape)
                .padding(1.5.dp) // إطار النيون
                .background(Color.DarkGray, CircleShape),
            contentAlignment = Alignment.Center
        ) {
            Text(text = comment.fanName.take(1).uppercase(), color = Color.White, fontWeight = FontWeight.Bold, fontSize = 14.sp)
        }

        Spacer(modifier = Modifier.width(12.dp))

        // بنية التعليق
        Column(modifier = Modifier.weight(1f)) {
            Text(text = comment.fanName, fontWeight = FontWeight.SemiBold, color = Color.White, fontSize = 13.sp)
            Spacer(modifier = Modifier.height(2.dp))
            Text(text = comment.text, color = Color.LightGray, fontSize = 12.sp, lineHeight = 16.sp)
            
            // رد سريع
            Row(modifier = Modifier.padding(top = 4.dp), verticalAlignment = Alignment.CenterVertically) {
                Icon(Icons.Default.Reply, contentDescription = "Reply", tint = Color.Gray, modifier = Modifier.size(12.dp))
                Spacer(modifier = Modifier.width(4.dp))
                Text("Reply", color = Color.Gray, fontSize = 10.sp, fontWeight = FontWeight.Medium)
            }
        }

        // تفاعل "اللايك" (Neon Glowing Heart)
        IconButton(onClick = { isLiked = !isLiked }, modifier = Modifier.size(32.dp)) {
            Icon(
                imageVector = if (isLiked) Icons.Filled.Favorite else Icons.Outlined.FavoriteBorder,
                contentDescription = "Like",
                tint = if (isLiked) NeonViolet else Color.Gray,
                modifier = Modifier.scale(likeScale)
            )
        }
    }
}

// ========================================================
// 5. خط النبض الزمردي السريع (Emerald Pulse Line replacing CircularProgressIndicator)
// ========================================================
@Composable
fun EmeraldPulseLine(modifier: Modifier = Modifier) {
    val infiniteTransition = rememberInfiniteTransition()
    val xOffset by infiniteTransition.animateFloat(
        initialValue = -1f,
        targetValue = 1f,
        animationSpec = infiniteRepeatable(
            animation = tween(600, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Restart
        )
    )

    BoxWithConstraints(
        modifier = modifier
            .fillMaxWidth()
            .height(4.dp)
            .clip(RoundedCornerShape(2.dp))
            .background(Color.DarkGray.copy(alpha = 0.3f))
    ) {
        val widthPx = constraints.maxWidth
        Box(
            modifier = Modifier
                .fillMaxWidth(0.3f) // الحجم الفعلي للخط
                .height(4.dp)
                .background(EmeraldNeon)
                .offset { IntOffset((xOffset * widthPx).toInt(), 0) }
        )
    }
}

// better implementation using Canvas
@Composable
fun EmeraldPulseLineLightning(modifier: Modifier = Modifier) {
    val infiniteTransition = rememberInfiniteTransition()
    val xOffset by infiniteTransition.animateFloat(
        initialValue = -500f,
        targetValue = 2000f,
        animationSpec = infiniteRepeatable(
            animation = tween(400, easing = LinearOutSlowInEasing),
            repeatMode = RepeatMode.Restart
        )
    )

    androidx.compose.foundation.Canvas(modifier = modifier.fillMaxWidth().height(4.dp)) {
        val brush = Brush.linearGradient(
            colors = listOf(Color.Transparent, EmeraldNeon, Color.White, EmeraldNeon, Color.Transparent),
            start = Offset(xOffset, 0f),
            end = Offset(xOffset + 300f, 0f)
        )
        drawLine(
            brush = brush,
            start = Offset(0f, size.height / 2),
            end = Offset(size.width, size.height / 2),
            strokeWidth = 4.dp.toPx(),
            cap = androidx.compose.ui.graphics.StrokeCap.Round
        )
    }
}
// ========================================================
@Composable
fun NeonSnackbar(message: String, isVisible: Boolean, modifier: Modifier = Modifier) {
    AnimatedVisibility(
        visible = isVisible,
        enter = slideInVertically(initialOffsetY = { it }) + fadeIn(tween(300)),
        exit = slideOutVertically(targetOffsetY = { it }) + fadeOut(tween(300)),
        modifier = modifier
    ) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(12.dp))
                .background(Color(0xFF1A0033).copy(alpha = 0.95f)) // لون بنفسجي غامق
                .border(1.dp, EmeraldNeon.copy(alpha = 0.6f), RoundedCornerShape(12.dp))
                .padding(16.dp),
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = message,
                color = EmeraldNeon, // لون زمردي نيون
                fontSize = 14.sp,
                fontWeight = FontWeight.Bold,
                textAlign = androidx.compose.ui.text.style.TextAlign.Center,
                lineHeight = 22.sp
            )
        }
    }
}
