package com.mirage.app.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AccountBalanceWallet
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun FinanceDashboard() {
    Column(modifier = Modifier.padding(16.dp)) {
        // بطاقة الرصيد الحالي
        Box(modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(20.dp))
            .background(Color.White.copy(alpha = 0.05f))
            .padding(20.dp)
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(Icons.Default.AccountBalanceWallet, contentDescription = null, tint = Color(0xFF50FFB1))
                Spacer(modifier = Modifier.width(12.dp))
                Column {
                    Text("حالة الحساب", color = Color.Gray, fontSize = 12.sp)
                    Text("نشط - فئة الساموراي", color = Color.White, fontSize = 18.sp)
                }
            }
        }

        Spacer(modifier = Modifier.height(24.dp))
        Text("اختر خطة الحماية", color = Color.White, fontSize = 16.sp)
        Spacer(modifier = Modifier.height(16.dp))
        
        // عرض الخطط (يومي، أسبوعي، شهري، سنوي)
        SubscriptionPlans() 
    }
}
