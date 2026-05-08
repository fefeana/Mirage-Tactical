package com.ufoalbarq.vpn.presentation.ui

import androidx.compose.animation.core.*
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.blur
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.ColorMatrix
import androidx.compose.ui.graphics.ColorFilter
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.ufoalbarq.vpn.R // تأكد من استيراد ملف R الخاص بمشروعك
import com.ufoalbarq.vpn.domain.repository.VpnStatus

/**
 * ⚔️ UFO ALBARQ - Mirage UI Core
 * الكود الأساسي للواجهة بعد التعديلات النهائية (زجاج نقي، نيون، بدون مربعات)
 */
@Composable
fun MirageMainScreen(
    status: VpnStatus,
    ping: String,
    downloadSpeed: String,
    uploadSpeed: String,
    onConnectClick: () -> Unit
) {
    val neonGreen = Color(0xFF00FF9D)
    val darkBg = Color(0xFF000B08) // خلفية داكنة جداً (Cyberpunk Style)

    // ضبط السطوع (Brightness) لعناصر الواجهة الخضراء
    val brightnessMatrix = ColorMatrix().apply {
        setToScale(1.2f, 1.5f, 1.2f, 1f) // رفع اللون الأخضر (Emerald) لزيادة السطوع
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(darkBg) // تثبيت الواجهة على Dark دائماً
    ) {
        // 1. الخلفية: الفيديو العشوائي من الاستوديو (Placeholder)
        // TODO: Replace with actual ExoPlayer VideoView
        Box(modifier = Modifier.fillMaxSize().background(Color.Black))

        // 2. الوسط: موجه الشفق القطبي (Emerald Aurora Layer)
        EmeraldAuroraLayer()

        // 3. الخلفية المتحركة (الشبكة)
        MirageAnimatedGrid()

        // 4. المقدمة: الواجهة الخضراء الزمردية (بسطوع عالٍ وتأثير نيون)
        Column(
            modifier = Modifier
                .fillMaxSize()
                .graphicsLayer {
                    colorFilter = ColorFilter.colorMatrix(brightnessMatrix)
                }
                .padding(vertical = 40.dp, horizontal = 24.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            // --- الجزء العلوي: العنوان (UFO ALBARQ / Samurai Protocol) ---
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.Center
                ) {
                    // Shield with Outer Glow
                    Box(contentAlignment = Alignment.Center) {
                        Icon(
                            imageVector = Icons.Default.Shield,
                            contentDescription = "Shield Glow",
                            tint = neonGreen.copy(alpha = 0.3f),
                            modifier = Modifier.size(48.dp).blur(12.dp)
                        )
                        Icon(
                            imageVector = Icons.Default.Shield,
                            contentDescription = "Shield",
                            tint = neonGreen,
                            modifier = Modifier.size(32.dp)
                        )
                    }
                    Spacer(modifier = Modifier.width(12.dp))
                    // UFO ALBARQ with Vertical Gradient
                    Text(
                        text = "UFO ALBARQ",
                        style = TextStyle(
                            fontFamily = FontFamily.SansSerif,
                            fontSize = 32.sp,
                            fontWeight = FontWeight.ExtraBold,
                            brush = Brush.verticalGradient(
                                colors = listOf(Color.White, neonGreen)
                            ),
                            letterSpacing = 2.sp
                        )
                    )
                }
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = "SAMURAI PROTOCOL",
                    style = TextStyle(
                        fontFamily = FontFamily.Monospace,
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Medium,
                        color = Color.White.copy(alpha = 0.5f),
                        letterSpacing = 4.sp
                    )
                )
            }

            // --- المركز: القفل وتحته مباشرة الطيار الآلي (النبض) ---
            Box(
                contentAlignment = Alignment.Center,
                modifier = Modifier
                    .weight(1f)
            ) {
                ConnectionButton(
                    isConnected = status == VpnStatus.CONNECTED,
                    onConnectClick = onConnectClick
                )
            }

            // --- الجزء السفلي: الإحصائيات (الزجاج النقي بدون تمويه) ---
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(24.dp))
                    // تدرج لوني خفيف جداً يعطي لمعة الزجاج النقي
                    .background(
                        Brush.verticalGradient(
                            colors = listOf(neonGreen.copy(alpha = 0.05f), Color.Transparent)
                        )
                    )
                    // إطار نيون زمردي نحيف
                    .border(1.dp, neonGreen.copy(alpha = 0.2f), RoundedCornerShape(24.dp))
                    .padding(vertical = 24.dp, horizontal = 8.dp),
                horizontalArrangement = Arrangement.SpaceEvenly,
                verticalAlignment = Alignment.CenterVertically
            ) {
                StatItem(
                    value = if (status == VpnStatus.CONNECTED) ping else "--",
                    unit = "ms",
                    label = "PING",
                    icon = Icons.Default.ShowChart,
                    color = neonGreen
                )
                
                // الخطوط (Dividers): متدرجة الشفافية لتندمج بنعومة
                Box(
                    modifier = Modifier
                        .height(48.dp)
                        .width(1.dp)
                        .background(
                            Brush.verticalGradient(
                                colors = listOf(Color.Transparent, Color.White.copy(alpha = 0.2f), Color.Transparent)
                            )
                        )
                )
                
                StatItem(
                    value = if (status == VpnStatus.CONNECTED) downloadSpeed else "--",
                    unit = "Mbps",
                    label = "DOWN",
                    icon = Icons.Default.ArrowDownward,
                    color = neonGreen
                )
                
                Box(
                    modifier = Modifier
                        .height(48.dp)
                        .width(1.dp)
                        .background(
                            Brush.verticalGradient(
                                colors = listOf(Color.Transparent, Color.White.copy(alpha = 0.2f), Color.Transparent)
                            )
                        )
                )
                
                StatItem(
                    value = if (status == VpnStatus.CONNECTED) uploadSpeed else "--",
                    unit = "Mbps",
                    label = "UP",
                    icon = Icons.Default.ArrowUpward,
                    color = neonGreen
                )
            }
        }
    }
}

// --- دالة بطاقة الإعدادات الزجاجية (Glass Card) ---
@Composable
fun SettingsGlassCard(neonGreen: Color, content: @Composable () -> Unit) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 8.dp)
            .clip(RoundedCornerShape(20.dp))
            // تأثير الزجاج النقي (Clear Glassmorphism)
            .background(
                Brush.verticalGradient(
                    colors = listOf(Color.White.copy(alpha = 0.02f), Color.Transparent)
                )
            )
            .border(1.dp, Color.White.copy(alpha = 0.1f), RoundedCornerShape(20.dp))
            .padding(20.dp)
    ) {
        content()
    }
}

// --- دالة بطاقة VIP الزجاجية (VIP Glass Card) ---
@Composable
fun VipGlassCard(neonGreen: Color, content: @Composable () -> Unit) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 8.dp)
            .clip(RoundedCornerShape(20.dp))
            // تأثير الزجاج النقي مع لون النيون
            .background(
                Brush.verticalGradient(
                    colors = listOf(neonGreen.copy(alpha = 0.05f), Color.Transparent)
                )
            )
            .border(1.dp, neonGreen.copy(alpha = 0.2f), RoundedCornerShape(20.dp))
            .padding(20.dp)
    ) {
        content()
    }
}
@Composable
fun ConnectionButton(
    isConnected: Boolean,
    onConnectClick: () -> Unit // هنا يتم استدعاء منطق التحقق من الاشتراك والاتصال
) {
    val EmeraldGreen = Color(0xFF00FF9D)
    val DarkGrey = Color(0xFF1A1A1A)
    
    Box(
        modifier = Modifier
            .size(200.dp)
            .shadow(
                elevation = if (isConnected) 50.dp else 0.dp,
                shape = CircleShape,
                ambientColor = EmeraldGreen,
                spotColor = EmeraldGreen
            )
            .clip(CircleShape)
            .background(
                if (isConnected) Brush.radialGradient(
                    colors = listOf(Color.White.copy(alpha = 0.2f), EmeraldGreen.copy(alpha = 0.1f))
                ) else Brush.radialGradient(
                    colors = listOf(DarkGrey, Color.Black)
                )
            )
            .clickable { onConnectClick() }
            .border(
                width = 2.dp,
                color = if (isConnected) EmeraldGreen else Color.Gray,
                shape = CircleShape
            ),
        contentAlignment = Alignment.Center
    ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Box(contentAlignment = Alignment.Center) {
                if (isConnected) {
                    Icon(
                        imageVector = Icons.Default.Shield, 
                        contentDescription = null,
                        tint = EmeraldGreen.copy(alpha = 0.5f),
                        modifier = Modifier.size(80.dp).blur(16.dp)
                    )
                }
                Icon(
                    imageVector = Icons.Default.Shield, 
                    contentDescription = null,
                    tint = if (isConnected) EmeraldGreen else Color.White,
                    modifier = Modifier.size(60.dp)
                )
            }
            Text(
                text = if (isConnected) "DISCONNECT" else "TAP TO CONNECT",
                style = MaterialTheme.typography.labelSmall,
                color = if (isConnected) EmeraldGreen else Color.White
            )
        }
    }
}

@Composable
fun AutopilotPulseIndicator(isConnected: Boolean, neonColor: Color) {
    val infiniteTransition = rememberInfiniteTransition(label = "pulse")
    val pulseAlpha by infiniteTransition.animateFloat(
        initialValue = 0.1f,
        targetValue = 0.5f,
        animationSpec = infiniteRepeatable(
            animation = tween(1500, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ), label = "pulseAlpha"
    )
    val pulseScale by infiniteTransition.animateFloat(
        initialValue = 1f,
        targetValue = 1.4f,
        animationSpec = infiniteRepeatable(
            animation = tween(1500, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ), label = "pulseScale"
    )

    Box(contentAlignment = Alignment.Center) {
        if (isConnected) {
            Canvas(modifier = Modifier.size(220.dp)) {
                drawCircle(
                    color = neonColor.copy(alpha = pulseAlpha),
                    radius = (size.width / 2) * pulseScale
                )
                drawCircle(
                    color = neonColor.copy(alpha = pulseAlpha * 0.4f),
                    radius = (size.width / 2) * (pulseScale * 1.2f)
                )
            }
        }

        Box(
            modifier = Modifier
                .size(180.dp)
                .border(2.dp, if (isConnected) neonColor.copy(alpha = 0.8f) else neonColor.copy(alpha = 0.3f), CircleShape)
                .background(Color.Black.copy(alpha = 0.4f), CircleShape)
                .shadow(
                    elevation = if (isConnected) 40.dp else 0.dp,
                    shape = CircleShape,
                    ambientColor = neonColor,
                    spotColor = neonColor
                ),
            contentAlignment = Alignment.Center
        ) {
            if (isConnected) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Icon(
                        imageVector = Icons.Default.Lock,
                        contentDescription = "Active",
                        tint = neonColor,
                        modifier = Modifier.size(56.dp)
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = "ACTIVE",
                        color = neonColor,
                        fontSize = 22.sp,
                        fontWeight = FontWeight.Bold,
                        letterSpacing = 2.sp
                    )
                }
            } else {
                Text(
                    text = "تشغيل",
                    color = Color.White.copy(alpha = 0.9f),
                    fontSize = 32.sp,
                    fontWeight = FontWeight.Bold
                )
            }
        }
    }
}

@Composable
fun StatItem(value: String, unit: String, label: String, icon: ImageVector, color: Color) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Box(contentAlignment = Alignment.Center) {
            Icon(icon, contentDescription = null, tint = color.copy(alpha = 0.5f), modifier = Modifier.size(32.dp).blur(8.dp))
            Icon(icon, contentDescription = null, tint = color, modifier = Modifier.size(24.dp))
        }
        Spacer(modifier = Modifier.height(8.dp))
        Row(verticalAlignment = Alignment.Bottom) {
            Box(contentAlignment = Alignment.Center) {
                Text(
                    text = value,
                    style = TextStyle(
                        fontSize = 24.sp,
                        fontWeight = FontWeight.ExtraBold,
                        color = Color.White.copy(alpha = 0.3f),
                        letterSpacing = 1.sp
                    ),
                    modifier = Modifier.blur(4.dp)
                )
                Text(
                    text = value,
                    style = TextStyle(
                        fontSize = 24.sp,
                        fontWeight = FontWeight.ExtraBold,
                        color = Color.White,
                        letterSpacing = 1.sp
                    )
                )
            }
            Spacer(modifier = Modifier.width(2.dp))
            Text(
                text = unit,
                style = TextStyle(
                    fontSize = 12.sp,
                    color = Color.White.copy(alpha = 0.6f)
                ),
                modifier = Modifier.padding(bottom = 3.dp)
            )
        }
        Spacer(modifier = Modifier.height(4.dp))
        Text(
            text = label,
            style = TextStyle(
                fontSize = 10.sp,
                color = Color.White.copy(alpha = 0.4f),
                letterSpacing = 1.5.sp
            )
        )
    }
}

@Composable
fun EmeraldAuroraLayer() {
    val infiniteTransition = rememberInfiniteTransition(label = "Aurora")
    
    // Blob 1 (Purple/Magenta)
    val x1 by infiniteTransition.animateFloat(
        initialValue = 0.2f, targetValue = 0.8f,
        animationSpec = infiniteRepeatable(tween(8000, easing = FastOutSlowInEasing), RepeatMode.Reverse), label = "x1"
    )
    val y1 by infiniteTransition.animateFloat(
        initialValue = 0.1f, targetValue = 0.9f,
        animationSpec = infiniteRepeatable(tween(9000, easing = FastOutSlowInEasing), RepeatMode.Reverse), label = "y1"
    )
    
    // Blob 2 (Emerald Green)
    val x2 by infiniteTransition.animateFloat(
        initialValue = 0.8f, targetValue = 0.1f,
        animationSpec = infiniteRepeatable(tween(10000, easing = FastOutSlowInEasing), RepeatMode.Reverse), label = "x2"
    )
    val y2 by infiniteTransition.animateFloat(
        initialValue = 0.8f, targetValue = 0.2f,
        animationSpec = infiniteRepeatable(tween(7000, easing = FastOutSlowInEasing), RepeatMode.Reverse), label = "y2"
    )

    // Blob 3 (Deep Purple)
    val x3 by infiniteTransition.animateFloat(
        initialValue = 0.5f, targetValue = 0.5f,
        animationSpec = infiniteRepeatable(tween(12000, easing = LinearEasing), RepeatMode.Reverse), label = "x3"
    )
    val y3 by infiniteTransition.animateFloat(
        initialValue = 0.5f, targetValue = 0.1f,
        animationSpec = infiniteRepeatable(tween(11000, easing = FastOutSlowInEasing), RepeatMode.Reverse), label = "y3"
    )

    // Particles (Stars/Dust)
    val particleOffset by infiniteTransition.animateFloat(
        initialValue = 0f, targetValue = 1000f,
        animationSpec = infiniteRepeatable(tween(20000, easing = LinearEasing), RepeatMode.Restart), label = "particles"
    )

    Box(modifier = Modifier.fillMaxSize()) {
        // Blurred Blobs for Aurora Effect (Pure Green)
        Canvas(modifier = Modifier.fillMaxSize().blur(80.dp)) {
            val w = size.width
            val h = size.height
            
            drawCircle(
                brush = Brush.radialGradient(
                    colors = listOf(Color(0xFF00C853).copy(alpha = 0.6f), Color.Transparent),
                    center = androidx.compose.ui.geometry.Offset(w * x1, h * y1),
                    radius = w * 0.8f
                ),
                radius = w * 0.8f,
                center = androidx.compose.ui.geometry.Offset(w * x1, h * y1)
            )
            
            drawCircle(
                brush = Brush.radialGradient(
                    colors = listOf(Color(0xFF00FF9D).copy(alpha = 0.5f), Color.Transparent),
                    center = androidx.compose.ui.geometry.Offset(w * x2, h * y2),
                    radius = w * 0.7f
                ),
                radius = w * 0.7f,
                center = androidx.compose.ui.geometry.Offset(w * x2, h * y2)
            )

            drawCircle(
                brush = Brush.radialGradient(
                    colors = listOf(Color(0xFF009664).copy(alpha = 0.5f), Color.Transparent),
                    center = androidx.compose.ui.geometry.Offset(w * x3, h * y3),
                    radius = w * 0.9f
                ),
                radius = w * 0.9f,
                center = androidx.compose.ui.geometry.Offset(w * x3, h * y3)
            )
        }

        // Sharp Particles (Stars/Dust)
        Canvas(modifier = Modifier.fillMaxSize()) {
            val w = size.width
            val h = size.height
            val random = kotlin.random.Random(123)
            
            for (i in 0..40) {
                val startX = random.nextFloat() * w
                val startY = random.nextFloat() * h
                val speed = random.nextFloat() * 0.5f + 0.1f
                
                val currentY = (startY - particleOffset * speed) % h
                val actualY = if (currentY < 0) currentY + h else currentY
                
                drawCircle(
                    color = Color(0xFF00FF9D).copy(alpha = random.nextFloat() * 0.5f + 0.1f),
                    radius = random.nextFloat() * 4f + 1f,
                    center = androidx.compose.ui.geometry.Offset(startX, actualY)
                )
            }
        }
    }
}

@Composable
fun MirageAnimatedGrid() {
    // 1. تعريف الأنيميشن للحركة المستمرة (Vertical Scrolling)
    val infiniteTransition = rememberInfiniteTransition(label = "GridScroll")
    val offset by infiniteTransition.animateFloat(
        initialValue = 0f,
        targetValue = 100f, // المسافة بين كل خطين
        animationSpec = infiniteRepeatable(
            animation = tween(5000, easing = LinearEasing), // سرعة الحركة (5 ثواني لكل دورة)
            repeatMode = RepeatMode.Restart
        ), label = "Offset"
    )

    // 2. رسم الشبكة باستخدام Canvas
    Canvas(modifier = Modifier.fillMaxSize().background(Color(0xFF050505))) {
        val gridSpacing = 50.dp.toPx()
        val strokeWidth = 1.dp.toPx()
        val gridColor = Color(0xFF00FF9D).copy(alpha = 0.05f) // أخضر زمردي خافت جداً

        // رسم الخطوط الأفقية المتحركة
        var y = offset % gridSpacing
        while (y < size.height) {
            drawLine(
                color = gridColor,
                start = androidx.compose.ui.geometry.Offset(0f, y),
                end = androidx.compose.ui.geometry.Offset(size.width, y),
                strokeWidth = strokeWidth
            )
            y += gridSpacing
        }

        // رسم الخطوط العمودية الثابتة
        var x = 0f
        while (x < size.width) {
            drawLine(
                color = gridColor,
                start = androidx.compose.ui.geometry.Offset(x, 0f),
                end = androidx.compose.ui.geometry.Offset(x, size.height),
                strokeWidth = strokeWidth
            )
            x += gridSpacing
        }

        // إضافة تأثير "التدرج العميق" (Vignette) ليظهر الضوء في المنتصف فقط
        if (size.maxDimension > 0f) {
            drawRect(
                brush = Brush.radialGradient(
                    colors = listOf(Color.Transparent, Color(0xFF050505)),
                    center = center,
                    radius = size.maxDimension / 1.5f
                )
            )
        }
    }
}