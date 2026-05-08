package com.mirage.vpn.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.Icon
import androidx.compose.material.IconButton
import androidx.compose.material.Text
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Bolt
import androidx.compose.material.icons.filled.Cloud
import androidx.compose.material.icons.filled.Podcasts
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

@Composable
fun MirageDraftsScreen(onBack: () -> Unit) {
    var syncMessage by remember { mutableStateOf("") }
    val coroutineScope = rememberCoroutineScope()

    // محاكاة استشعار "التقاط شاشة" أو "المتطفلين"
    // لحماية فعلية يمكن استخدام WindowManager.LayoutParams.FLAG_SECURE في الـ Activity
    var isCompromised by remember { mutableStateOf(false) }

    // العقد التمويهية (Streaming Nodes)
    val nodes = listOf(
        Triple("Region: Global-Alpha", "Sync: 45ms", Icons.Default.Podcasts), // سيرفر أمريكا 📡
        Triple("Region: Europe-Node", "Sync: 110ms", Icons.Default.Cloud),    // سيرفر ألمانيا ☁️
        Triple("Performance: Ultra-High", "Sync: 25ms", Icons.Default.Bolt) // سيرفر جيمنج ⚡
    )

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF000000))
            .padding(24.dp)
    ) {
        // الشريط العلوي مموها كـ "تحليلات القصة"
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                IconButton(onClick = onBack) {
                    Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = Color(0xFF50C878))
                }
                Text(
                    text = "Story Analytics",
                    color = Color.White,
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.padding(start = 8.dp)
                )
            }
            
            // زر مخفي لاختبار الـ Screenshot/Sensor Bypass
            Text(
                text = "🛡️",
                modifier = Modifier.clickable { 
                    isCompromised = !isCompromised 
                }
            )
        }

        Spacer(modifier = Modifier.height(24.dp))

        Text(
            text = "STREAMING NODES",
            color = Color.DarkGray,
            fontSize = 12.sp,
            letterSpacing = 2.sp,
            fontWeight = FontWeight.Bold,
            modifier = Modifier.padding(bottom = 16.dp)
        )

        // قائمة السيرفرات المتخفية
        nodes.forEachIndexed { index, (nodeName, pingStatus, icon) ->
            // التمويه الدفاعي: إذا تم التحسس بتصوير شاشة، اعرض مجلدات فارغة أو أسماء عشوائية
            val displayedName = if (isCompromised) "Metric_Data_$index" else nodeName
            val displayedPing = if (isCompromised) "N/A" else pingStatus

            ServerSettingsItem(
                nodeName = displayedName,
                pingStatus = displayedPing,
                icon = icon,
                onClick = {
                    if(!isCompromised) {
                        coroutineScope.launch {
                            syncMessage = "Syncing story data with global node..."
                            // هنا يتم استدعاء NativeEngine لتغيير السيرفر (Connect to VPN Server)
                            delay(2000)
                            syncMessage = "Sync Complete. Stream Optimized."
                            delay(1500)
                            syncMessage = ""
                        }
                    }
                }
            )
        }

        Spacer(modifier = Modifier.height(32.dp))

        if (syncMessage.isNotEmpty()) {
            Text(
                text = syncMessage,
                color = Color(0xFF50C878),
                fontSize = 14.sp,
                fontStyle = FontStyle.Italic,
                modifier = Modifier.align(Alignment.CenterHorizontally)
            )
        }
    }
}

// كود "لوحة التحكم السرية" (Stealth UI Code)
@Composable
fun ServerSettingsItem(
    nodeName: String, 
    pingStatus: String, 
    icon: ImageVector,
    onClick: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 8.dp)
            .border(1.dp, Color(0xFF50C878).copy(alpha = 0.5f), RoundedCornerShape(8.dp))
            .clickable { onClick() }
            .padding(16.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Icon(
                imageVector = icon,
                contentDescription = null,
                tint = Color(0xFF50C878),
                modifier = Modifier.size(24.dp)
            )
            Spacer(modifier = Modifier.width(16.dp))
            Text(text = nodeName, color = Color.White, fontWeight = FontWeight.Medium) // اسم السيرفر المموه
        }
        Text(text = pingStatus, color = Color(0xFF50C878), fontSize = 14.sp) // البنج يظهر كـ "سرعة مزامنة"
    }
}
