package com.ufoalbarq.vpn.ui.screens

import android.app.Activity
import android.content.Context
import android.content.Intent
import androidx.compose.animation.animateContentSize
import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.Language
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalLayoutDirection
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.LayoutDirection
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.google.firebase.firestore.ktx.firestore
import com.google.firebase.ktx.Firebase
import com.ufoalbarq.vpn.core.LocaleHelper

// --- النماذج (Models) ---
data class Language(
    val name: String = "",
    val code: String = "",
    val flag: String = "",
    val isBeta: Boolean = false
)

// --- مساعد السنتينل الذكي (Sentinel AI Logic) ---
class UnifiedSentinelAI(val langCode: String) {
    fun processSupport(input: String): String {
        return if (langCode == "ar") {
            "سنتينل: تم استلام طلبك. جاري فحص استقرار البروتوكول ونظام الـ Ghost Mode..."
        } else {
            "Sentinel: Request received. Analyzing protocol stability and Ghost Mode status..."
        }
    }
}

@Composable
fun LanguageSelectionScreen(context: Context) {
    var languages by remember { mutableStateOf<List<Language>>(emptyList()) }
    var isLoading by remember { mutableStateOf(true) }
    
    // جلب اللغة الحالية
    val currentLangCode = remember { 
        context.getSharedPreferences("Settings", Context.MODE_PRIVATE)
            .getString("Locale.Helper.Selected.Language", "ar") ?: "ar" 
    }

    // تهيئة السنتينل بناءً على اللغة الحالية
    val sentinel = remember { UnifiedSentinelAI(currentLangCode) }

    LaunchedEffect(Unit) {
        Firebase.firestore.collection("languages").get()
            .addOnSuccessListener { result ->
                languages = result.documents.mapNotNull { it.toObject(Language::class.java) }
                isLoading = false
            }
            .addOnFailureListener {
                languages = listOf(Language("العربية", "ar", "🇾🇪"), Language("English", "en", "🇺🇸"))
                isLoading = false
            }
    }

    val layoutDirection = if (currentLangCode == "ar") LayoutDirection.Rtl else LayoutDirection.Ltr

    CompositionLocalProvider(LocalLayoutDirection provides layoutDirection) {
        Box(modifier = Modifier.fillMaxSize().background(Color(0xFF0B0E11)).padding(16.dp)) {
            Column {
                // هيدر النظام
                HeaderSection()

                Spacer(modifier = Modifier.height(20.dp))

                // بطاقة السنتينل الذكية (Sentinel AI Card)
                SentinelStatusCard(sentinel)

                Spacer(modifier = Modifier.height(20.dp))

                // قائمة اللغات العالمية (Glass Card)
                Text(
                    text = if(currentLangCode == "ar") "اختر اللغة العالمية" else "Global Language",
                    color = Color(0xFF9C27B0),
                    fontSize = 14.sp,
                    modifier = Modifier.padding(bottom = 8.dp)
                )

                if (isLoading) {
                    LinearProgressIndicator(modifier = Modifier.fillMaxWidth(), color = Color(0xFF00FF9D))
                } else {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .weight(1f)
                            .background(Color(0x12FFFFFF), RoundedCornerShape(20.dp))
                            .border(0.5.dp, Color(0x26FFFFFF), RoundedCornerShape(20.dp))
                            .padding(8.dp)
                    ) {
                        LazyColumn {
                            items(languages) { lang ->
                                LanguageRow(
                                    lang = lang,
                                    isSelected = lang.code == currentLangCode
                                ) {
                                    applyGlobalChange(context, lang.code)
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun SentinelStatusCard(sentinel: UnifiedSentinelAI) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .background(Color(0x1A00FF9D), RoundedCornerShape(15.dp))
            .border(1.dp, Color(0x4D00FF9D), RoundedCornerShape(15.dp))
            .padding(16.dp)
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Icon(Icons.Default.AutoAwesome, contentDescription = null, tint = Color(0xFF00FF9D))
            Spacer(modifier = Modifier.width(12.dp))
            Column {
                Text("Sentinel AI Active", color = Color(0xFF00FF9D), fontWeight = FontWeight.Bold, fontSize = 14.sp)
                Text(sentinel.processSupport(""), color = Color.White.copy(alpha = 0.7f), fontSize = 11.sp)
            }
        }
    }
}

@Composable
fun LanguageRow(lang: Language, isSelected: Boolean, onClick: () -> Unit) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() }
            .padding(12.dp)
            .background(if (isSelected) Color(0x1A00FF9D) else Color.Transparent, RoundedCornerShape(10.dp))
            .padding(8.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(lang.flag, fontSize = 24.sp)
        Spacer(modifier = Modifier.width(16.dp))
        Text(lang.name, color = if (isSelected) Color(0xFF00FF9D) else Color.White, fontSize = 16.sp)
        if (isSelected) {
            Spacer(modifier = Modifier.weight(1f))
            Text("SELECTED", color = Color(0xFF00FF9D), fontSize = 10.sp, fontWeight = FontWeight.Black)
        }
    }
}

@Composable
fun HeaderSection() {
    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
        Text("MIRAGE UFO v3", color = Color.White, fontWeight = FontWeight.Black, fontSize = 18.sp)
        Icon(Icons.Default.Language, contentDescription = null, tint = Color.Gray)
    }
}

private fun applyGlobalChange(context: Context, langCode: String) {
    LocaleHelper.setLocale(context, langCode)
    val intent = context.packageManager.getLaunchIntentForPackage(context.packageName)
    intent?.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK)
    context.startActivity(intent)
    (context as? Activity)?.let {
        it.finish()
        it.overridePendingTransition(android.R.anim.fade_in, android.R.anim.fade_out)
    }
}