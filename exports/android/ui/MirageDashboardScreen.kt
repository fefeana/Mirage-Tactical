package com.mirage.vpn.ui

import androidx.compose.animation.core.*
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Shadow
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.mirage.vpn.core.ServerViewModel
import android.content.Intent
import android.net.Uri
import android.widget.Toast
import androidx.compose.ui.platform.LocalContext
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.runtime.rememberCoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.io.File
import com.mirage.vpn.core.network.GitHubClient

@Composable
fun FilterSection(onFilterChange: (String) -> Unit) {
    Row(
        modifier = Modifier.fillMaxWidth().padding(8.dp),
        horizontalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        val filters = listOf("VLESS", "HYSTERIA2", "ACTIVE", "ALL")
        filters.forEach { filter ->
            Button(
                onClick = { onFilterChange(filter) },
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF1A1A1A)),
                shape = RoundedCornerShape(20.dp),
                border = BorderStroke(1.dp, Color(0xFF50C878))
            ) {
                Text(filter, color = Color.White, fontSize = 10.sp)
            }
        }
    }
}

@Composable
fun MirageAiStatusHeader(isConnected: Boolean, serverName: String) {
    // إعداد تأثير الوميض (Flicker) الكهربائي عند بداية الاتصال
    val infiniteTransition = rememberInfiniteTransition(label = "ElectricFlicker")
    val alpha by infiniteTransition.animateFloat(
        initialValue = 0.8f,
        targetValue = 1f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 150, easing = LinearEasing),
            repeatMode = RepeatMode.Reverse
        ), label = "Alpha"
    )

    Row(
        verticalAlignment = Alignment.CenterVertically,
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(12.dp))
            .background(if (isConnected) Color(0xFF50C878).copy(alpha = 0.05f) else Color.Transparent)
            .border(
                width = 1.dp,
                color = if (isConnected) Color(0xFF50C878).copy(alpha = alpha) else Color.Gray.copy(alpha = 0.3f),
                shape = RoundedCornerShape(12.dp)
            )
            .padding(horizontal = 16.dp, vertical = 12.dp)
    ) {
        // نقطة الإضاءة الخضراء (النبضية)
        Box(
            modifier = Modifier
                .size(8.dp)
                .background(if (isConnected) Color(0xFF50C878) else Color.Red, CircleShape)
                .shadow(if (isConnected) 12.dp else 0.dp, CircleShape, spotColor = Color(0xFF50C878))
        )
        
        Spacer(modifier = Modifier.width(12.dp))

        // اسم السيرفر بتصميم نيون
        Text(
            text = if (isConnected) serverName.uppercase() else "SYSTEM DISCONNECTED",
            color = if (isConnected) Color.White else Color.Gray,
            style = TextStyle(
                fontWeight = FontWeight.Bold,
                fontSize = 14.sp,
                letterSpacing = 2.sp,
                shadow = if (isConnected) Shadow(Color(0xFF50C878), blurRadius = 10f) else null
            )
        )
    }
}

@Composable
fun MirageDashboardScreen(viewModel: ServerViewModel = viewModel()) {
    val servers by viewModel.filteredServers.collectAsState()
    
    // Find active server or just take the first
    val activeServer = servers.firstOrNull { it.status == "ACTIVE" }
    
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    var isUploading by remember { mutableStateOf(false) }
    
    Column(modifier = Modifier.fillMaxSize().background(Color.Black).padding(horizontal = 16.dp)) {
        Spacer(modifier = Modifier.height(16.dp))
        
        // 1. شريط الحالة العلوي مع الوميض
        MirageAiStatusHeader(
            isConnected = activeServer != null,
            serverName = activeServer?.name ?: ""
        )
        
        Spacer(modifier = Modifier.height(16.dp))

        // أزرار التحكم (رفع إلى GitHub وتحميل)
        ActionControlButtons(
            isUploading = isUploading,
            onDownloadClick = {
                // فتح رابط التحميل المباشر للمشروع بصيغة ZIP
                val intent = Intent(Intent.ACTION_VIEW, Uri.parse("https://github.com/USERNAME/Mirage/archive/refs/heads/main.zip"))
                context.startActivity(intent)
                Toast.makeText(context, "بدأ التحميل من GitHub...", Toast.LENGTH_SHORT).show()
            },
            onGitHubClick = { 
                scope.launch(Dispatchers.IO) {
                    isUploading = true
                    withContext(Dispatchers.Main) { 
                        Toast.makeText(context, "جاري رفع تطبيق Mirage إلى منصة GitHub 🚀...", Toast.LENGTH_SHORT).show() 
                    }
                    
                    try {
                        // استخراج الملف الفعلي (هنا سنسحب الـ APK الخاص بالتطبيق نفسه، لكن يمكنك تعديل المسار لأي ملف آخر)
                        val apkPath = context.applicationInfo.sourceDir
                        val fileData = File(apkPath).readBytes()
                        
                        // بدء عملية الرفع
                        val repository = GitHubClient.repository
                        val success = repository.uploadProjectFile(
                            token = "REPLACE_WITH_YOUR_GITHUB_TOKEN", // ⚠️ ضع التوكن الخاص بك (ghp_...)
                            owner = "REPLACE_WITH_GITHUB_USERNAME",   // ⚠️ ضع اسم الحساب
                            repo = "Mirage",                          // ⚠️ ضع اسم المستودع
                            remotePath = "builds/mirage_latest.apk",
                            fileBytes = fileData
                        )
                        
                        withContext(Dispatchers.Main) {
                            isUploading = false
                            if (success) {
                                Toast.makeText(context, "✅ تمت عملية الرفع بنجاح!", Toast.LENGTH_LONG).show()
                            } else {
                                Toast.makeText(context, "❌ فشل الرفع. تأكد من التوكن (Token) أو الصلاحيات.", Toast.LENGTH_LONG).show()
                            }
                        }
                    } catch (e: Exception) {
                        e.printStackTrace()
                        withContext(Dispatchers.Main) {
                            isUploading = false
                            Toast.makeText(context, "❌ حدث خطأ: ${e.localizedMessage}", Toast.LENGTH_LONG).show()
                        }
                    }
                }
            }
        )
        
        Spacer(modifier = Modifier.height(16.dp))
        
        // 2. خيارات الفلترة
        FilterSection { selectedFilter ->
            viewModel.applyFilter(selectedFilter)
        }
        
        Spacer(modifier = Modifier.height(8.dp))
        
        // 3. قائمة السيرفرات مع ميزات النقر والتوهج
        LazyColumn(contentPadding = PaddingValues(bottom = 20.dp)) {
            items(servers) { server ->
                ServerListItem(server)
            }
        }
    }
}
