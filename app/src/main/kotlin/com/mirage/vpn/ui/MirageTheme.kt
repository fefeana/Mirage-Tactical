package com.mirage.vpn.ui

import androidx.compose.material.MaterialTheme
import androidx.compose.material.Typography
import androidx.compose.material.darkColors
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp

import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material.Icon
import androidx.compose.material.Text
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Build
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.res.painterResource
import androidx.compose.runtime.getValue

// ألوان الساموراي التكتيكية
val EmeraldGreen = Color(0xFF50C878)
val DeepViolet = Color(0xFF9400D3)
val ShadowBlack = Color(0xFF0D0D0D)

@Composable
fun SamuraiInterface(isSatelliteActive: Boolean) {
    val pulseColor by animateColorAsState(
        targetValue = if (isSatelliteActive) EmeraldGreen else Color.Gray,
        animationSpec = infiniteRepeatable(animation = tween(2000))
    )

    Box(modifier = Modifier.fillMaxSize().background(ShadowBlack), contentAlignment = Alignment.Center) {
        // أيقونة الساموراي مع وهج بنفسجي (Assuming an icon exists, or substitute with standard icon if unavailable)
        // using standard icon just in case painterResource fails on non-existent drawable
        androidx.compose.material.Icon(
            imageVector = androidx.compose.material.icons.Icons.Default.Build, // Placeholder for samurai_logo
            contentDescription = null,
            tint = pulseColor,
            modifier = Modifier.size(100.dp).shadow(elevation = 20.dp, ambientColor = DeepViolet)
        )
        
        if (isSatelliteActive) {
            Text(
                "SATELLITE MODE: ACTIVE", 
                color = EmeraldGreen, 
                modifier = Modifier.align(Alignment.BottomCenter).padding(bottom = 32.dp),
                style = TextStyle(
                    fontWeight = FontWeight.Bold,
                    fontSize = 18.sp,
                    shadow = androidx.compose.ui.graphics.Shadow(
                        color = EmeraldGreen,
                        blurRadius = 10f
                    )
                )
            )
        }
    }
}

// 1. نظام الألوان المتناسق الشامل
val DarkCharcoal = Color(0xFF101010)
val NeonBlue = Color(0xFF00F3FF)
val NeonPurple = Color(0xFFBC00FF)
val AlertRed = Color(0xFFFF003C)
val EmeraldNeon = Color(0xFF00FF9D) // من استخدامات التطبيق الفعلية

val MirageColors = darkColors(
    primary = NeonBlue,
    secondary = NeonPurple,
    background = DarkCharcoal,
    surface = Color(0xFF1A1A1A),
    error = AlertRed
)

// 2. تحجيم الخطوط الديناميكي (Accessibility & Font Scaling)
val MirageTypography = Typography(
    body1 = TextStyle(
        fontFamily = FontFamily.Monospace,
        fontSize = 16.sp, // يتوسع تلقائياً مع إعدادات الجهاز
        letterSpacing = 1.25.sp
    ),
    h4 = TextStyle(
        fontFamily = FontFamily.Monospace,
        fontSize = 30.sp,
        fontWeight = FontWeight.Bold
    ),
    h6 = TextStyle(
        fontFamily = FontFamily.Monospace,
        fontSize = 20.sp,
        fontWeight = FontWeight.Bold
    )
)

// 3. وضع التخفي الشامل كطبقة متسقة (Global Theming)
@Composable
fun MirageTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colors = MirageColors,
        typography = MirageTypography, // يشمل تحجيم الخطوط
        content = content
    )
}
