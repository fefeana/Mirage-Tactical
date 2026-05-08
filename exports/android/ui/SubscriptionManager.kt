package com.mirage.app.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Shield
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.mirage.app.core.MirageIdentityManager
import com.mirage.app.core.SubscriptionTier

@Composable
fun SubscriptionManager() {
    val neonEmerald = Color(0xFF50FFB1)
    val goldSamurai = Color(0xFFFFD700) // لون خاص بالفئة العليا

    Column(
        modifier = Modifier.fillMaxSize().padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text("هوية الساموراي", color = Color.White, fontSize = 22.sp)
        
        Spacer(modifier = Modifier.height(30.dp))

        // بطاقة العضوية الزجاجية (The Identity Card)
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(200.dp)
                .clip(RoundedCornerShape(24.dp))
                .background(
                    Brush.linearGradient(
                        colors = listOf(Color.White.copy(alpha = 0.1f), Color.White.copy(alpha = 0.02f))
                    )
                )
                .border(1.dp, Color.White.copy(alpha = 0.1f), RoundedCornerShape(24.dp))
                .padding(24.dp)
        ) {
            Column {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.Shield, contentDescription = null, tint = neonEmerald)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = if (MirageIdentityManager.currentTier == SubscriptionTier.SAMURAI_ELITE) "SAMURAI ELITE" else "FREE TIER",
                        color = if (MirageIdentityManager.currentTier == SubscriptionTier.SAMURAI_ELITE) goldSamurai else Color.White,
                        fontWeight = FontWeight.Bold
                    )
                }
                Spacer(modifier = Modifier.height(40.dp))
                Text("Samurai ID: ${MirageIdentityManager.samuraiId}", color = Color.White.copy(alpha = 0.5f), fontSize = 12.sp)
                Text("تاريخ الانتهاء: ${MirageIdentityManager.expiryDate}", color = Color.White, fontSize = 14.sp)
            }
        }

        Spacer(modifier = Modifier.height(40.dp))

        // قائمة الميزات (Feature Checklist)
        FeatureItem("تشفير VLESS Reality", true)
        FeatureItem("وضع الألعاب (Turbo)", MirageIdentityManager.isFeatureAccessAllowed(SubscriptionTier.PRO))
        FeatureItem("اتصال الأقمار الصناعية", MirageIdentityManager.isFeatureAccessAllowed(SubscriptionTier.SAMURAI_ELITE))
    }
}

@Composable
fun FeatureItem(title: String, isAllowed: Boolean) {
    val neonEmerald = Color(0xFF50FFB1)
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 12.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Icon(
            imageVector = if (isAllowed) Icons.Default.CheckCircle else Icons.Default.Lock,
            contentDescription = null,
            tint = if (isAllowed) neonEmerald else Color.Gray,
            modifier = Modifier.size(20.dp)
        )
        Spacer(modifier = Modifier.width(16.dp))
        Text(
            text = title,
            color = if (isAllowed) Color.White else Color.Gray,
            fontSize = 16.sp
        )
    }
}
