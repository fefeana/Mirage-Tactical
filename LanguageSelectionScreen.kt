package com.ufoalbarq.vpn.ui.screens

import android.app.Activity
import android.content.Context
import android.content.Intent
import android.util.Log
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.google.firebase.firestore.ktx.firestore
import com.google.firebase.ktx.Firebase
import com.ufoalbarq.vpn.core.LocaleHelper

// موديل البيانات
data class Language(
    val name: String = "",
    val code: String = "",
    val flag: String = ""
)

@Composable
fun LanguageSelectionScreen(context: Context) {
    var languages by remember { mutableStateOf<List<Language>>(emptyList()) }
    var isLoading by remember { mutableStateOf(true) }

    // جلب كود اللغة الحالية من الإعدادات المحفوظة
    val sharedPrefs = context.getSharedPreferences("Settings", Context.MODE_PRIVATE)
    val currentLangCode = sharedPrefs.getString("Locale.Helper.Selected.Language", "ar") ?: "ar"

    // جلب اللغات من Firebase
    LaunchedEffect(Unit) {
        try {
            Firebase.firestore.collection("languages")
                .get()
                .addOnSuccessListener { result ->
                    val fetched = result.documents.mapNotNull { it.toObject(Language::class.java) }
                    languages = if (fetched.isNotEmpty()) fetched.sortedBy { it.name } else getDefaultLanguages()
                    isLoading = false
                }
                .addOnFailureListener {
                    languages = getDefaultLanguages()
                    isLoading = false
                }
        } catch (e: Exception) {
            languages = getDefaultLanguages()
            isLoading = false
        }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF0B0E11)) // خلفية Mirage UFO الداكنة
            .padding(16.dp)
    ) {
        Column {
            // العنوان العلوي
            Text(
                text = "SYSTEM SETTINGS",
                color = Color.White,
                fontSize = 22.sp,
                fontWeight = FontWeight.Bold,
                modifier = Modifier.padding(vertical = 20.dp)
            )

            Text(
                text = "🌐 Global Language",
                color = Color(0xFF9C27B0),
                fontSize = 14.sp,
                modifier = Modifier.padding(bottom = 12.dp)
            )

            if (isLoading) {
                CircularProgressIndicator(
                    modifier = Modifier.align(Alignment.CenterHorizontally),
                    color = Color(0xFF00FF9D)
                )
            } else {
                // البطاقة الزجاجية (Glass Card)
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(Color(0x1AFFFFFF), RoundedCornerShape(16.dp))
                        .border(0.5.dp, Color(0x33FFFFFF), RoundedCornerShape(16.dp))
                        .padding(16.dp)
                ) {
                    Column {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text("Select Language:", color = Color.LightGray)
                            
                            // عرض رمز اللغة الحالي (مثل AR أو HI)
                            Box(
                                modifier = Modifier
                                    .border(1.dp, Color(0xFF00FF9D), RoundedCornerShape(8.dp))
                                    .padding(horizontal = 8.dp, vertical = 4.dp)
                            ) {
                                Text(currentLangCode.uppercase(), color = Color(0xFF00FF9D), fontSize = 12.sp)
                            }
                        }

                        Spacer(modifier = Modifier.height(16.dp))

                        // قائمة اللغات العالمية
                        LazyColumn(modifier = Modifier.heightIn(max = 450.dp)) {
                            items(languages) { lang ->
                                LanguageListItem(
                                    language = lang,
                                    isSelected = lang.code == currentLangCode
                                ) {
                                    // تنفيذ التغيير الشامل
                                    performGlobalLanguageChange(context, lang.code)
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
fun LanguageListItem(language: Language, isSelected: Boolean, onClick: () -> Unit) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp)
            .clickable { onClick() }
            .background(
                if (isSelected) Color(0x1A00FF9D) else Color.Transparent,
                RoundedCornerShape(10.dp)
            )
            .padding(15.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(text = language.flag, fontSize = 22.sp)
        Spacer(modifier = Modifier.width(15.dp))
        Text(
            text = language.name,
            color = if (isSelected) Color(0xFF00FF9D) else Color.White,
            fontSize = 17.sp,
            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal
        )
        if (isSelected) {
            Spacer(modifier = Modifier.weight(1f))
            Text("ACTIVE", color = Color(0xFF00FF9D), fontSize = 10.sp, fontWeight = FontWeight.Black)
        }
    }
}

// الدالة المسؤولة عن التغيير الفوري والشامل
private fun performGlobalLanguageChange(context: Context, langCode: String) {
    // 1. تحديث الـ Locale وحفظه
    LocaleHelper.setLocale(context, langCode)

    // 2. عمل ريستارت كامل للتطبيق لضمان تطبيق اللغة في كل مكان
    val intent = context.packageManager.getLaunchIntentForPackage(context.packageName)
    intent?.let {
        it.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK)
        context.startActivity(it)
    }
    
    // إنهاء الأكتيفيتي الحالية
    (context as? Activity)?.finish()
}

// لغات احتياطية (تظهر إذا كان Firebase فارغاً)
private fun getDefaultLanguages() = listOf(
    Language("العربية", "ar", "🇾🇪"),
    Language("English", "en", "🇺🇸"),
    Language("हिन्दी", "hi", "🇮🇳"),
    Language("Türkçe", "tr", "🇹🇷"),
    Language("Français", "fr", "🇫🇷")
)