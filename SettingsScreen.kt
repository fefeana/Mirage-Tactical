package com.mirage.vpn.ui

import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel

// 🎨 ألوان قمرة القيادة السيبرانية
val DarkCharcoal = Color(0xFF0A0A0A)
val DeepVoid = Color(0xFF050505)
val NeonEmerald = Color(0xFF00FFCC)

@Composable
fun MiragePhantomToggle(isGhostMode: Boolean, isNeonMode: Boolean, onToggle: (Boolean) -> Unit) {
    val accentColor = if (isNeonMode) NeonEmerald else Color.White
    val glowAlpha by animateFloatAsState(
        targetValue = if (isGhostMode && isNeonMode) 0.6f else 0f,
        animationSpec = tween(500)
    )

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .background(DarkCharcoal, RoundedCornerShape(8.dp))
            .border(
                width = 1.dp,
                color = if (isGhostMode) accentColor else Color(0xFF333333),
                shape = RoundedCornerShape(8.dp)
            )
            .shadow(
                elevation = if (isGhostMode && isNeonMode) 20.dp else 0.dp,
                shape = RoundedCornerShape(8.dp),
                spotColor = accentColor.copy(alpha = glowAlpha),
                ambientColor = accentColor.copy(alpha = glowAlpha)
            )
            .padding(20.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Column(modifier = Modifier.weight(1f)) {
            Text(
                text = "PHANTOM GHOST MODE",
                color = if (isGhostMode) accentColor else Color.White,
                fontSize = 16.sp,
                fontWeight = FontWeight.Bold,
                fontFamily = FontFamily.Monospace,
                letterSpacing = 1.5.sp
            )
            Text(
                text = "Activate XTLS-Reality Camouflage. Bypasses DPI firewalls instantly.",
                color = if (isGhostMode) accentColor.copy(alpha=0.7f) else Color.Gray,
                fontSize = 11.sp,
                lineHeight = 16.sp,
                fontFamily = FontFamily.Monospace,
                modifier = Modifier.padding(top = 6.dp, end = 16.dp)
            )
        }

        // Phantom Glowing Switch
        Box(
            modifier = Modifier
                .width(52.dp)
                .height(28.dp)
                .background(
                    if (isGhostMode) accentColor.copy(alpha = 0.2f) else Color.Black,
                    RoundedCornerShape(14.dp)
                )
                .border(
                    width = 1.dp, 
                    color = if (isGhostMode) accentColor else Color(0xFF444444), 
                    shape = RoundedCornerShape(14.dp)
                )
                .clickable(
                    interactionSource = remember { MutableInteractionSource() },
                    indication = null 
                ) { onToggle(!isGhostMode) }
                .padding(4.dp),
            contentAlignment = if (isGhostMode) Alignment.CenterEnd else Alignment.CenterStart
        ) {
            Box(
                modifier = Modifier
                    .size(20.dp)
                    .shadow(
                        elevation = if (isGhostMode && isNeonMode) 15.dp else 0.dp, 
                        spotColor = accentColor,
                        ambientColor = accentColor
                    )
                    .background(
                        color = if (isGhostMode) accentColor else Color.Gray, 
                        shape = RoundedCornerShape(10.dp)
                    )
            )
        }
    }
}

@Composable
fun SettingsScreen(viewModel: SettingsViewModel = viewModel()) {
    // مراقبة قيم الـ ViewModel
    val isNeon = viewModel.isNeonMode
    val isAdBlock = viewModel.isAdBlockEnabled

    val bgColor = if (isNeon) DeepVoid else Color(0xFF121212)
    val accentColor = if (isNeon) NeonEmerald else Color.White

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(bgColor)
            .padding(24.dp)
    ) {
        // العنوان بروح المصفوفة (Matrix)
        Text(
            text = "COCKPIT CONTROLS",
            color = accentColor,
            fontSize = 24.sp,
            fontWeight = FontWeight.Bold,
            fontFamily = FontFamily.Monospace,
            modifier = Modifier.padding(bottom = 8.dp)
        )
        
        Text(
            text = "SYSTEM OVERSIGHT & TACTICAL PROTOCOLS",
            color = Color.Gray,
            fontSize = 10.sp,
            fontFamily = FontFamily.Monospace,
            letterSpacing = 2.sp,
            modifier = Modifier.padding(bottom = 32.dp)
        )

        // مفتاح فلترة الإعلانات المدمج
        SettingSwitchRow(
            title = "CYBER AD-BLOCKER",
            subtitle = "Drops tracking and ad requests into a black hole before they reach your device.",
            isChecked = isAdBlock,
            isNeonMode = isNeon,
            onCheckedChange = { viewModel.toggleAdBlock(it) }
        )

        Spacer(modifier = Modifier.height(24.dp))
        
        // مفتاح الشبح
        MiragePhantomToggle(
            isGhostMode = viewModel.isGhostMode,
            isNeonMode = isNeon,
            onToggle = { viewModel.toggleGhostMode(it) }
        )

        Spacer(modifier = Modifier.height(24.dp))

        // مفتاح وضع التخفي / النيون
        SettingSwitchRow(
            title = "NEON/STEALTH MODE",
            subtitle = "Toggle UI electromagnetic emissions and HUD aesthetics.",
            isChecked = isNeon,
            isNeonMode = isNeon,
            onCheckedChange = { viewModel.switchTheme(it) }
        )
    }
}

@Composable
fun SettingSwitchRow(
    title: String,
    subtitle: String,
    isChecked: Boolean,
    isNeonMode: Boolean,
    onCheckedChange: (Boolean) -> Unit
) {
    val accentColor = if (isNeonMode) NeonEmerald else Color.White
    
    // أنميشن توهج الصندوق عند التفعيل
    val glowAlpha by animateFloatAsState(
        targetValue = if (isChecked && isNeonMode) 0.3f else 0f,
        animationSpec = tween(500)
    )

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .background(DarkCharcoal)
            .border(
                width = 1.dp, 
                color = if (isChecked) accentColor.copy(alpha = 0.5f) else Color(0xFF222222), 
                shape = RoundedCornerShape(8.dp)
            )
            .shadow(
                elevation = if (isChecked && isNeonMode) 15.dp else 0.dp,
                shape = RoundedCornerShape(8.dp),
                spotColor = accentColor.copy(alpha = glowAlpha)
            )
            .padding(20.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Column(modifier = Modifier.weight(1f)) {
            Text(
                text = title,
                color = if (isChecked) accentColor else Color.LightGray,
                fontSize = 16.sp,
                fontWeight = FontWeight.Bold,
                fontFamily = FontFamily.Monospace,
                letterSpacing = 1.5.sp
            )
            Text(
                text = subtitle,
                color = Color.Gray,
                fontSize = 11.sp,
                lineHeight = 16.sp,
                fontFamily = FontFamily.Monospace,
                modifier = Modifier.padding(top = 6.dp, end = 16.dp)
            )
        }

        // تصميم زر التبديل المضيء (Glowing Switch)
        Box(
            modifier = Modifier
                .width(52.dp)
                .height(28.dp)
                .background(
                    if (isChecked) accentColor.copy(alpha = 0.15f) else Color.Black,
                    RoundedCornerShape(14.dp)
                )
                .border(
                    width = 1.dp, 
                    color = if (isChecked) accentColor else Color(0xFF333333), 
                    shape = RoundedCornerShape(14.dp)
                )
                .clickable(
                    interactionSource = remember { MutableInteractionSource() },
                    indication = null 
                ) { onCheckedChange(!isChecked) }
                .padding(4.dp),
            contentAlignment = if (isChecked) Alignment.CenterEnd else Alignment.CenterStart
        ) {
            Box(
                modifier = Modifier
                    .size(20.dp)
                    .shadow(
                        elevation = if (isChecked && isNeonMode) 10.dp else 0.dp, 
                        spotColor = accentColor,
                        ambientColor = accentColor
                    )
                    .background(
                        color = if (isChecked) accentColor else Color.Gray, 
                        shape = RoundedCornerShape(10.dp)
                    )
            )
        }
    }
}
