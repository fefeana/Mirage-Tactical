package com.ufoalbarq.vpn.ui.screens

import android.app.Activity
import android.content.Context
import android.util.Log
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.google.firebase.firestore.ktx.firestore
import com.google.firebase.ktx.Firebase
import com.ufoalbarq.vpn.core.LocaleHelper

data class Language(val name: String = "", val code: String = "", val flag: String = "")

@Composable
fun LanguageSelectionScreen(context: Context) {
    var languages by remember { mutableStateOf<List<Language>>(emptyList()) }
    var isLoading by remember { mutableStateOf(true) }

    LaunchedEffect(Unit) {
        try {
            val db = Firebase.firestore
            db.collection("languages")
                .get()
                .addOnSuccessListener { result ->
                    val fetchedLanguages = result.documents.mapNotNull { doc ->
                        doc.toObject(Language::class.java)
                    }.sortedBy { it.name }
                    languages = fetchedLanguages
                    isLoading = false
                }
                .addOnFailureListener { exception ->
                    Log.e("LanguageSelection", "Error getting languages", exception)
                    isLoading = false
                }
        } catch (e: Exception) {
            Log.e("LanguageSelection", "Firebase not initialized or error", e)
            isLoading = false
            // Fallback to default languages if Firebase fails
            languages = listOf(
                Language("العربية", "ar", "🇾🇪"),
                Language("English", "en", "🇺🇸"),
                Language("Français", "fr", "🇫🇷"),
                Language("Español", "es", "🇪🇸"),
                Language("Deutsch", "de", "🇩🇪"),
                Language("Türkçe", "tr", "🇹🇷")
            )
        }
    }

    Box(modifier = Modifier.fillMaxSize().background(Color(0xFF0B0E11))) {
        if (isLoading) {
            CircularProgressIndicator(
                modifier = Modifier.align(Alignment.Center),
                color = Color(0xFF00FF9D)
            )
        } else {
            LazyColumn(modifier = Modifier.fillMaxSize()) {
                items(languages) { language ->
                    LanguageItem(language = language) {
                        // 1. تطبيق اللغة الجديدة
                        LocaleHelper.applyLanguage(context, language.code)
                        
                        // 2. إعادة تشغيل الأكتيفيتي لتحديث الواجهات فوراً (بلمسة Mirage الأنيقة)
                        val activity = context as? Activity
                        if (activity != null) {
                            val intent = activity.intent
                            activity.finish()
                            activity.overridePendingTransition(android.R.anim.fade_in, android.R.anim.fade_out)
                            activity.startActivity(intent)
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun LanguageItem(language: Language, onClick: () -> Unit) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() }
            .padding(16.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(
            text = language.flag,
            fontSize = 24.sp,
            modifier = Modifier.padding(end = 16.dp)
        )
        Text(
            text = language.name,
            color = Color.White,
            fontSize = 18.sp
        )
    }
}
