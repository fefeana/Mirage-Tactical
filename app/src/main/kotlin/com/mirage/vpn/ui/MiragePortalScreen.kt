package com.mirage.vpn.ui

import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Build
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.mirage.vpn.SecurityProvider
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

import com.mirage.vpn.core.PortalEngine
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.foundation.Image

@Composable
fun MiragePortalScreen() {
    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()
    
    // محرك تحويل الواقع المستند إلى Gemini
    val portalEngine = remember { PortalEngine(context) }
    
    // مراقب حالة المحرك (The State Watcher)
    var portalStatus by remember { mutableStateOf("IDLE") } // IDLE, SCANNING, TRANSFORMING, READY, LOCKED
    
    // الصورة الناتجة بعد التحويل
    var transformedImage by remember { mutableStateOf<androidx.compose.ui.graphics.ImageBitmap?>(null) }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF000500)) // أسود عميق
    ) {
        // تأثير النيون الخلفي (Emerald Glow)
        Box(
            modifier = Modifier
                .size(300.dp)
                .align(Alignment.Center)
                .background(
                    Brush.radialGradient(
                        colors = listOf(Color(0xFF50C878).copy(alpha = 0.3f), Color.Transparent)
                    )
                )
        )

        // حاوية Glassmorphism
        Column(
            modifier = Modifier
                .align(Alignment.Center)
                .padding(24.dp)
                .clip(RoundedCornerShape(24.dp))
                .background(Color.White.copy(alpha = 0.05f))
                .border(1.dp, Color(0xFF50C878).copy(alpha = 0.5f), RoundedCornerShape(24.dp))
                .padding(32.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(
                text = "MIRAGE PORTAL",
                style = TextStyle(
                    color = Color(0xFF50C878),
                    fontSize = 24.sp,
                    fontWeight = FontWeight.Bold,
                    letterSpacing = 4.sp
                )
            )
            
            Spacer(modifier = Modifier.height(30.dp))

            // التبديل الدؤوب المستند إلى حالة المحرك
            when (portalStatus) {
                "IDLE" -> {
                    IconButton(
                        onClick = { 
                            coroutineScope.launch {
                                portalStatus = "SCANNING"
                                delay(800) // وهم بصري لعملية الفحص وبدء الربط

                                val secretKey = SecurityProvider.getVoucherSecret(context)
                                
                                if (secretKey == "ACCESS_DENIED_TAMPERING_DETECTED") {
                                    portalStatus = "LOCKED" // إغلاق البوابة عند استشعار الهندسة العكسية
                                } else {
                                    portalStatus = "TRANSFORMING"
                                    
                                    // تصنيع صورة وهمية فارغة لأجل العرض (سيتم استبدالها بصورة من كاميرا أو معرض المستخدم لاحقاً)
                                    val dummyBitmap = Bitmap.createBitmap(400, 400, Bitmap.Config.ARGB_8888)
                                    val canvas = android.graphics.Canvas(dummyBitmap)
                                    canvas.drawColor(android.graphics.Color.DKGRAY)
                                    val paint = android.graphics.Paint().apply { color = android.graphics.Color.WHITE; textSize = 40f }
                                    canvas.drawText("RAW REALITY", 50f, 200f, paint)

                                    // بدء الدمج السيبراني عبر محرك الذكاء الاصطناعي (Gemini) ومصفوفة الزمرد
                                    val resultBitmap = portalEngine.transformImage(dummyBitmap)
                                    
                                    if(resultBitmap != null) {
                                        transformedImage = resultBitmap.asImageBitmap()
                                    }

                                    portalStatus = "READY"
                                }
                            }
                        },
                        modifier = Modifier
                            .size(80.dp)
                            .clip(CircleShape)
                            .background(Color(0xFF50C878))
                    ) {
                        Icon(Icons.Filled.Build, contentDescription = "Activate Portal", tint = Color.Black)
                    }
                }
                "SCANNING" -> {
                    CircularProgressIndicator(color = Color(0xFF50C878))
                    Spacer(modifier = Modifier.height(16.dp))
                    Text("Initiating Handshake...", color = Color.White.copy(alpha = 0.7f))
                }
                "TRANSFORMING" -> {
                    Box(contentAlignment = Alignment.Center) {
                        PortalProcessingEffect() 
                        Text("جارِ إعادة تشفير الواقع...", color = Color(0xFF50C878), fontWeight = FontWeight.Bold)
                    }
                }
                "READY" -> {
                    if (transformedImage != null) {
                        Image(
                            bitmap = transformedImage!!,
                            contentDescription = "Cyber-Samurai Transformed Reality",
                            modifier = Modifier
                                .size(240.dp)
                                .clip(RoundedCornerShape(16.dp))
                                .border(2.dp, Color(0xFF50C878), RoundedCornerShape(16.dp))
                        )
                        Spacer(modifier = Modifier.height(16.dp))
                        Text(
                            text = "CYBER-SAMURAI\nPROJECTION READY", 
                            color = Color(0xFF50C878), 
                            fontWeight = FontWeight.Bold,
                            textAlign = TextAlign.Center,
                            letterSpacing = 2.sp
                        )
                    } else {
                        ResultDisplayWithGlow() // Fallback
                    }
                }
                "LOCKED" -> {
                    Text(
                        text = "ACCESS DENIED\nTAMPERING DETECTED", 
                        color = Color.Red, 
                        fontWeight = FontWeight.Bold, 
                        textAlign = TextAlign.Center
                    )
                }
            }
        }
    }
}

@Composable
fun PortalProcessingEffect() {
    val infiniteTransition = rememberInfiniteTransition()
    val alpha by infiniteTransition.animateFloat(
        initialValue = 0.2f,
        targetValue = 0.8f,
        animationSpec = infiniteRepeatable(
            animation = tween(1000),
            repeatMode = RepeatMode.Reverse
        )
    )

    Box(
        modifier = Modifier
            .size(200.dp)
            .graphicsLayer(alpha = alpha)
            .border(2.dp, Color(0xFF50C878), CircleShape) // توهج الزمرد النبضي
    )
}

@Composable
fun ResultDisplayWithGlow() {
    Box(
        modifier = Modifier
            .size(200.dp)
            .clip(RoundedCornerShape(16.dp))
            .border(2.dp, Color(0xFF50C878), RoundedCornerShape(16.dp))
            .background(Color.White.copy(alpha = 0.1f)),
        contentAlignment = Alignment.Center
    ) {
        Text(
            text = "CYBER-SAMURAI\nPROJECTION READY", 
            color = Color.White, 
            fontWeight = FontWeight.Bold,
            textAlign = TextAlign.Center,
            letterSpacing = 2.sp
        )
    }
}
