package com.mirage.vpn.ui

import androidx.compose.animation.*
import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.Icon
import androidx.compose.material.Text
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Security
import androidx.compose.material.icons.filled.Speed
import androidx.compose.material.icons.filled.VpnKey
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.delay

@Composable
fun MirageOnboardingScreen(onFinish: () -> Unit) {
    var currentStep by remember { mutableStateOf(0) }

    val stations = listOf(
        OnboardingStation(
            title = "الظل الرقمي",
            description = "ميراژ ليس مجرد تطبيق، إنه عباءة الإخفاء الخاصة بك في عالم الإنترنت.",
            icon = Icons.Default.Security
        ),
        OnboardingStation(
            title = "السيف القاطع",
            description = "بروتوكولات تم تصميمها لتخترق أقوى القيود، تماماً كما يقطع الكاتانا الفولاذ.",
            icon = Icons.Default.Speed
        ),
        OnboardingStation(
            title = "الانطلاق",
            description = "الحرية ليست مجرد كسر القيود، بل هي أن تعيش بطريقة تحترم وتعزز حرية الآخرين.",
            icon = Icons.Default.VpnKey
        )
    )

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.Black),
        contentAlignment = Alignment.Center
    ) {
        AnimatedContent(
            targetState = currentStep,
            transitionSpec = {
                (slideInHorizontally { width -> width } + fadeIn()).togetherWith(
                    slideOutHorizontally { width -> -width } + fadeOut())
            }, label = "Onboarding Transition"
        ) { step ->
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(32.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Center
            ) {
                // أيقونة المحطة (بدلاً من الصور في الوقت الحالي)
                Box(
                    modifier = Modifier
                        .size(120.dp)
                        .background(
                            Brush.linearGradient(listOf(Color(0xFF50C878), Color(0xFFB026FF))),
                            CircleShape
                        )
                        .padding(2.dp)
                        .background(Color.Black, CircleShape),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = stations[step].icon,
                        contentDescription = stations[step].title,
                        tint = Color(0xFF50C878),
                        modifier = Modifier.size(60.dp)
                    )
                }

                Spacer(modifier = Modifier.height(40.dp))

                Text(
                    text = stations[step].title,
                    color = Color.White,
                    fontSize = 24.sp,
                    fontWeight = FontWeight.Bold
                )

                Spacer(modifier = Modifier.height(16.dp))

                Text(
                    text = stations[step].description,
                    color = Color.LightGray,
                    fontSize = 16.sp,
                    textAlign = TextAlign.Center,
                    lineHeight = 24.sp
                )

                Spacer(modifier = Modifier.height(60.dp))

                // النقاط السفلية
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    for (i in stations.indices) {
                        Box(
                            modifier = Modifier
                                .size(if (i == step) 12.dp else 8.dp)
                                .clip(CircleShape)
                                .background(if (i == step) Color(0xFF50C878) else Color.DarkGray)
                        )
                    }
                }

                Spacer(modifier = Modifier.height(40.dp))

                // زر المتابعة
                Box(
                    modifier = Modifier
                        .fillMaxWidth(0.8f)
                        .height(50.dp)
                        .clip(RoundedCornerShape(25.dp))
                        .background(Brush.linearGradient(listOf(Color(0xFF50C878), Color(0xFFB026FF))))
                        .clickable {
                            if (currentStep < stations.size - 1) {
                                currentStep++
                            } else {
                                onFinish()
                            }
                        },
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = if (step == stations.size - 1) "ابدأ كساموراي" else "التالي",
                        color = Color.White,
                        fontWeight = FontWeight.Bold,
                        fontSize = 16.sp
                    )
                }
            }
        }
    }
}

data class OnboardingStation(val title: String, val description: String, val icon: ImageVector)
