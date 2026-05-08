package com.mirage.app.ui

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.mirage.app.core.MirageBillingManager

data class PlanItem(
    val title: String,
    val price: String,
    val duration: String
)

@Composable
fun SubscriptionPlansScreen() {
    Column(
        modifier = Modifier.fillMaxSize().padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text("اختر خطتك", color = Color.White, fontSize = 24.sp, fontWeight = FontWeight.Bold)
        Spacer(modifier = Modifier.height(20.dp))
        
        SubscriptionPlans()
        
        Spacer(modifier = Modifier.height(40.dp))
        
        AdRewardSection()
    }
}

@Composable
fun SubscriptionPlans() {
    val plans = listOf(
        PlanItem("يومي", "1$", "24 ساعة"),
        PlanItem("أسبوعي", "5$", "7 أيام"),
        PlanItem("شهري", "15$", "30 يوم"),
        PlanItem("سنوي", "99$", "عام كامل")
    )

    LazyVerticalGrid(columns = GridCells.Fixed(2), modifier = Modifier.fillMaxWidth().height(250.dp)) {
        items(plans) { plan ->
            PlanCard(plan)
        }
    }
}

@Composable
fun PlanCard(plan: PlanItem) {
    val context = LocalContext.current
    val paymentUrl = "https://t.me/mirage_payment_bot" // الرابط الخارجي للدفع

    Box(
        modifier = Modifier
            .padding(8.dp)
            .clip(RoundedCornerShape(16.dp))
            .background(Color.White.copy(alpha = 0.05f))
            .border(1.dp, Color.White.copy(alpha = 0.1f), RoundedCornerShape(16.dp))
            .clickable { 
                val intent = Intent(Intent.ACTION_VIEW, Uri.parse(paymentUrl))
                context.startActivity(intent)
            }
            .padding(16.dp)
    ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.fillMaxWidth()) {
            Text(plan.title, color = Color.White, fontWeight = FontWeight.Bold)
            Spacer(modifier = Modifier.height(8.dp))
            Text(plan.price, color = Color(0xFF50FFB1), fontSize = 20.sp)
            Spacer(modifier = Modifier.height(4.dp))
            Text(plan.duration, color = Color.Gray, fontSize = 12.sp)
        }
    }
}

@Composable
fun AdRewardSection() {
    val context = LocalContext.current
    Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.fillMaxWidth()) {
        Text("احصل على 3 ساعات مجانية", color = Color.White, fontSize = 18.sp)
        Spacer(modifier = Modifier.height(16.dp))
        
        // عداد الفيديوهات (5 دوائر صغيرة)
        Row {
            repeat(5) { index ->
                Box(
                    modifier = Modifier
                        .size(20.dp)
                        .padding(4.dp)
                        .clip(CircleShape)
                        .background(if (index < MirageBillingManager.videoCount.value) Color(0xFF50FFB1) else Color.Gray.copy(alpha = 0.3f))
                )
            }
        }
        
        Spacer(modifier = Modifier.height(20.dp))

        Button(
            onClick = {
                if (context is android.app.Activity) {
                    com.mirage.app.ads.MirageAdsEngine.showVideo(context) {
                        MirageBillingManager.addVideoView() 
                    }
                } else {
                    // Fallback in compose previews or non-activity contexts
                    MirageBillingManager.addVideoView()
                }
            },
            colors = ButtonDefaults.buttonColors(containerColor = Color.White.copy(alpha = 0.1f)),
            modifier = Modifier.fillMaxWidth(0.8f).height(50.dp)
        ) {
            Text("مشاهدة فيديو (Reward Ad)", color = Color.White)
        }
    }
}
