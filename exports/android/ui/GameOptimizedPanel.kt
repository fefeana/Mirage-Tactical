package com.mirage.app.ui

import android.widget.Toast
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Bolt
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.mirage.app.core.MirageAccessGate
import com.mirage.app.core.MirageBillingManager
import com.mirage.app.core.MirageCloudRouter
import com.mirage.app.core.MirageGameController
import com.mirage.app.core.MirageIdentityManager
import com.mirage.app.core.SubscriptionTier

@Composable
fun CloudRoutePanel() {
    Column(modifier = Modifier.padding(16.dp)) {
        Text("المسار السحابي النشط: مخصص للألعاب", color = Color(0xFF00F2FF))
        
        Button(
            onClick = { MirageCloudRouter.getGamingRoute { /* تحديث الرابط */ } },
            modifier = Modifier.fillMaxWidth().padding(top = 10.dp),
            colors = ButtonDefaults.buttonColors(containerColor = Color.White.copy(alpha = 0.05f))
        ) {
            Icon(Icons.Default.Refresh, contentDescription = null)
            Spacer(modifier = Modifier.width(8.dp))
            Text("تحديث المسار السحابي")
        }
    }
}

@Composable
fun GameTurboButton(controller: MirageGameController) {
    val context = LocalContext.current
    val isCloudRouteReady = MirageBillingManager.videoCount.value >= 5 || 
                            MirageIdentityManager.isFeatureAccessAllowed(SubscriptionTier.PRO)

    Button(
        onClick = {
            if (isCloudRouteReady) {
                controller.toggleTurbo()
            } else {
                Toast.makeText(context, "شاهد 5 فيديوهات لتفعيل المسار السحابي للألعاب", Toast.LENGTH_SHORT).show()
            }
        },
        modifier = Modifier
            .fillMaxWidth()
            .height(65.dp),
        shape = RoundedCornerShape(16.dp),
        colors = ButtonDefaults.buttonColors(
            containerColor = if (isCloudRouteReady && controller.isTurboActive) Color(0xFF00F2FF).copy(alpha = 0.2f) 
                             else if (isCloudRouteReady && !controller.isTurboActive) Color.White.copy(alpha = 0.05f) 
                             else Color.Gray.copy(alpha = 0.1f)
        ),
        border = BorderStroke(1.dp, if (isCloudRouteReady && controller.isTurboActive) Color(0xFF00F2FF) 
                                    else if (isCloudRouteReady && !controller.isTurboActive) Color.White.copy(alpha = 0.1f) 
                                    else Color.Gray.copy(alpha = 0.1f))
    ) {
        if (isCloudRouteReady && controller.isTurboActive) {
            Text("إيقاف المسار السحابي", color = Color(0xFF00F2FF))
        } else {
            Text(if (isCloudRouteReady) "تفعيل المسار السحابي ⚡" else "افتح المسار السحابي (0/5) 🔓", color = Color.White)
        }
    }
}

@Composable
fun CloudPowerStatus() {
    val remainingTime = MirageBillingManager.remainingBonusTime.value
    val isProtected = MirageAccessGate.canAccessCloudRoute()

    Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.fillMaxWidth()) {
        // شريط طاقة نيون (Neon Power Bar)
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(10.dp)
                .clip(RoundedCornerShape(5.dp))
                .background(Color.White.copy(alpha = 0.1f))
        ) {
            Box(
                modifier = Modifier
                    .fillMaxWidth(if (isProtected) 1f else 0f) // يملأ الشريط إذا كان الاتصال نشطاً
                    .fillMaxHeight()
                    .background(Brush.horizontalGradient(listOf(Color(0xFF00F2FF), Color(0xFF50FFB1))))
            )
        }
        
        Text(
            text = if (isProtected) "المسار السحابي نشط: حماية فائقة" else "المسار السحابي متوقف: اشحن الطاقة",
            color = if (isProtected) Color(0xFF50FFB1) else Color.White.copy(alpha = 0.5f),
            fontSize = 12.sp,
            modifier = Modifier.padding(top = 8.dp)
        )
    }
}

@Composable
fun GameOptimizedPanel(controller: MirageGameController) {
    val iceBlue = Color(0xFF00F2FF)
    val darkBg = Color(0xFF0B0E11)

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(darkBg)
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(
            text = "مركز تسريع الألعاب السحابي",
            color = Color.White,
            style = MaterialTheme.typography.headlineSmall
        )

        Spacer(modifier = Modifier.height(32.dp))

        // بطاقة الحالة (Status Card)
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(24.dp))
                .background(Color.White.copy(alpha = 0.05f))
                .border(1.dp, Color.White.copy(alpha = 0.1f), RoundedCornerShape(24.dp))
                .padding(24.dp)
        ) {
            Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.fillMaxWidth()) {
                Text(
                    text = if (controller.isTurboActive) "الوضع السحابي: نشط ⚡" else "الوضع السحابي: خامل",
                    color = if (controller.isTurboActive) iceBlue else Color.Gray
                )
                
                Spacer(modifier = Modifier.height(16.dp))
                
                // عرض الـ Ping
                Text(
                    text = "${controller.gamePing} ms",
                    fontSize = 48.sp,
                    fontWeight = FontWeight.Bold,
                    color = if (controller.isTurboActive) iceBlue else Color.White
                )
                Text("زمن الاستجابة الحالي", color = Color.White.copy(alpha = 0.6f))
            }
        }

        Spacer(modifier = Modifier.weight(1f))

        GameTurboButton(controller)
        
        Spacer(modifier = Modifier.height(20.dp))
        
        CloudPowerStatus()
        
        Spacer(modifier = Modifier.height(20.dp))
        
        // لوحة المسارات السحابية
        if (controller.isTurboActive) {
            CloudRoutePanel()
        }
    }
}
