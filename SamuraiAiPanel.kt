package com.ufoalbarq.vpn

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Send
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import androidx.lifecycle.viewmodel.compose.viewModel
import com.google.ai.client.generativeai.GenerativeModel
import kotlinx.coroutines.launch

class SamuraiAiViewModel : ViewModel() {
    // إعداد النموذج - استخدم المفتاح الخاص بك من Google AI Studio
    private val generativeModel = GenerativeModel(
        modelName = "gemini-1.5-flash",
        apiKey = "YOUR_GEMINI_API_KEY" // استبدل هذا بمفتاحك الحقيقي
    )

    // قائمة الرسائل لعرضها في الواجهة
    val chatMessages = mutableStateListOf<Pair<String, Boolean>>() // String: النص, Boolean: هل هو من المستخدم؟

    fun sendOrder(order: String) {
        chatMessages.add(order to true)
        viewModelScope.launch {
            try {
                val response = generativeModel.generateContent(order)
                response.text?.let { 
                    chatMessages.add(it to false) 
                }
            } catch (e: Exception) {
                chatMessages.add("Error in Protocol: ${e.message}" to false)
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SamuraiAiPanel(viewModel: SamuraiAiViewModel = viewModel()) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF000D07)) // خلفية داكنة جداً تليق بالسايبربانك
            .padding(16.dp)
    ) {
        // منطقة عرض الرسائل
        LazyColumn(
            modifier = Modifier.weight(1f),
            reverseLayout = true
        ) {
            items(viewModel.chatMessages.reversed()) { message ->
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 4.dp),
                    contentAlignment = if (message.second) Alignment.CenterEnd else Alignment.CenterStart
                ) {
                    Text(
                        text = message.first,
                        color = if (message.second) Color.White else Color(0xFF00FF9D), // أخضر زمردي للـ AI
                        modifier = Modifier
                            .background(
                                Color.White.copy(alpha = 0.05f), // تأثير الزجاج الشفاف
                                shape = RoundedCornerShape(12.dp)
                            )
                            .border(
                                1.dp, 
                                if (message.second) Color.Gray else Color(0xFF00FF9D).copy(alpha = 0.5f),
                                RoundedCornerShape(12.dp)
                            )
                            .padding(12.dp)
                    )
                }
            }
        }

        // حقل إدخال الأوامر (Command Input)
        var textState by remember { mutableStateOf("") }
        OutlinedTextField(
            value = textState,
            onValueChange = { textState = it },
            modifier = Modifier.fillMaxWidth(),
            label = { Text("أدخل أمر الساموراي...", color = Color(0xFF00FF9D)) },
            colors = TextFieldDefaults.outlinedTextFieldColors(
                focusedBorderColor = Color(0xFF00FF9D),
                unfocusedBorderColor = Color(0xFF00FF9D).copy(alpha = 0.3f),
                textColor = Color.White
            ),
            trailingIcon = {
                IconButton(onClick = {
                    if (textState.isNotBlank()) {
                        viewModel.sendOrder(textState)
                        textState = ""
                    }
                }) {
                    Icon(Icons.Default.Send, contentDescription = "Send", tint = Color(0xFF00FF9D))
                }
            }
        )
    }
}
