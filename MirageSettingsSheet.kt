package com.ufoalbarq.vpn.ui.components

import android.util.Log
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.google.firebase.firestore.ktx.firestore
import com.google.firebase.ktx.Firebase

// قائمة البروتوكولات المتقدمة
val protocols = listOf("VLESS", "Hysteria2", "XTLS-Reality", "ShadowTLS", "Trojan")

// هيكل بيانات اللغات لدعم القائمة العالمية
data class Language(val name: String = "", val code: String = "", val flag: String = "")

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MirageSettingsSheet(
    onProtocolSelected: (String) -> Unit,
    onLanguageSelected: (Language) -> Unit,
    onDismiss: () -> Unit
) {
    val sheetState = rememberModalBottomSheetState()
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
                    Log.e("MirageSettingsSheet", "Error getting languages", exception)
                    isLoading = false
                }
        } catch (e: Exception) {
            Log.e("MirageSettingsSheet", "Firebase not initialized or error", e)
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

    ModalBottomSheet(
        onDismissRequest = onDismiss,
        sheetState = sheetState,
        containerColor = Color(0xFF0B1010).copy(alpha = 0.92f), // خلفية داكنة جداً
        scrimColor = Color.Black.copy(alpha = 0.7f),
        shape = RoundedCornerShape(topStart = 24.dp, topEnd = 24.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp)
        ) {
            // قسم اختيار البروتوكول
            Text(
                text = "Protocol Configuration",
                color = Color(0xFF00FF9D), // أخضر نيون (Emerald)
                style = MaterialTheme.typography.titleMedium
            )
            
            Spacer(modifier = Modifier.height(12.dp))
            
            LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                items(protocols) { protocol ->
                    FilterChip(
                        selected = false, // يمكن ربطه بحالة الـ ViewModel
                        onClick = { onProtocolSelected(protocol) },
                        label = { Text(protocol, color = Color.White) },
                        colors = FilterChipDefaults.filterChipColors(
                            containerColor = Color.White.copy(alpha = 0.05f),
                            selectedContainerColor = Color(0xFF00FF9D).copy(alpha = 0.2f)
                        ),
                        border = BorderStroke(1.dp, Color(0xFF00FF9D).copy(alpha = 0.3f))
                    )
                }
            }

            HorizontalDivider(
                modifier = Modifier.padding(vertical = 20.dp),
                color = Color.White.copy(alpha = 0.1f)
            )

            // قسم اختيار اللغة (القائمة العالمية)
            Text(
                text = "Global Language Selection",
                color = Color(0xFF00FF9D),
                style = MaterialTheme.typography.titleMedium
            )

            Spacer(modifier = Modifier.height(12.dp))

            if (isLoading) {
                Box(modifier = Modifier.fillMaxWidth().height(100.dp), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator(color = Color(0xFF00FF9D))
                }
            } else {
                LazyColumn(modifier = Modifier.heightIn(max = 300.dp)) {
                    items(languages) { lang ->
                        ListItem(
                            headlineContent = { Text(lang.name, color = Color.White) },
                            leadingContent = { Text(lang.flag, fontSize = 20.sp) },
                            modifier = Modifier.clickable { onLanguageSelected(lang) },
                            colors = ListItemDefaults.colors(containerColor = Color.Transparent)
                        )
                    }
                }
            }
            
            Spacer(modifier = Modifier.height(24.dp))
        }
    }
}
