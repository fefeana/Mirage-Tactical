package com.mirage.vpn.ui

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Person
import androidx.compose.runtime.Composable
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.rememberVectorPainter
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.text.TextStyle

@Composable
fun MirageProfileScreen(onBack: () -> Unit) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF0F0F0F))
            .padding(16.dp)
    ) {
        Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.fillMaxWidth().padding(bottom = 24.dp)) {
            IconButton(onClick = onBack) {
                Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = EmeraldNeon)
            }
            Text("TACTICAL PROFILE", color = EmeraldNeon, fontSize = 20.sp, fontWeight = FontWeight.Black)
        }

        // صورة البروفايل مع تأثير النيون
        Box(modifier = Modifier.size(100.dp).align(Alignment.CenterHorizontally)) {
            Image(
                painter = rememberVectorPainter(image = Icons.Default.Person),
                contentDescription = null,
                modifier = Modifier
                    .fillMaxSize()
                    .clip(CircleShape)
                    .background(Color.DarkGray)
                    .border(2.dp, EmeraldNeon, CircleShape)
                    .padding(16.dp)
            )
        }
        
        Spacer(modifier = Modifier.height(24.dp))

        // معلومات المستخدم
        OutlinedTextField(
            value = "Emerald_Samurai_01",
            onValueChange = {},
            label = { Text("Display Name", color = EmeraldNeon) },
            modifier = Modifier.fillMaxWidth(),
            colors = TextFieldDefaults.outlinedTextFieldColors(
                textColor = Color.White,
                focusedBorderColor = EmeraldNeon,
                unfocusedBorderColor = Color.DarkGray,
                cursorColor = EmeraldNeon
            ),
            readOnly = true
        )

        Spacer(modifier = Modifier.height(20.dp))

        // حالة الاشتراك (Subscription Status)
        Card(
            backgroundColor = Color(0xFF004D36),
            shape = RoundedCornerShape(12.dp),
            elevation = 4.dp,
            modifier = Modifier.fillMaxWidth()
        ) {
            Row(modifier = Modifier.padding(16.dp), horizontalArrangement = Arrangement.SpaceBetween) {
                Text("Tier: Institutional (B2B)", color = Color.White, fontWeight = FontWeight.Medium)
                Text("Status: ACTIVE", color = EmeraldNeon, fontWeight = FontWeight.Bold)
            }
        }
        
        Spacer(modifier = Modifier.height(32.dp))
        
        // إدارة المهام التكتيكية
        Text(
            "TACTICAL DEPLOYMENT TASKS", 
            color = EmeraldNeon, 
            fontSize = 14.sp, 
            fontWeight = FontWeight.Bold,
            letterSpacing = 1.sp,
            modifier = Modifier.padding(bottom = 12.dp)
        )
        
        TaskManager()
    }
}

@Composable
fun TaskManager() {
    val tasks = remember {
        mutableStateListOf(
            TaskItem("Secure Node Alpha", false),
            TaskItem("Update Protocols", false),
            TaskItem("Check Latency", true)
        )
    }

    LazyColumn(
        verticalArrangement = Arrangement.spacedBy(8.dp),
        modifier = Modifier.fillMaxSize()
    ) {
        items(tasks.size) { index ->
            val task = tasks[index]
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(8.dp))
                    .background(Color(0xFF1A1A1A))
                    .border(1.dp, if(task.isCompleted) EmeraldNeon.copy(alpha = 0.5f) else Color.DarkGray, RoundedCornerShape(8.dp))
                    .padding(8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Checkbox(
                    checked = task.isCompleted,
                    onCheckedChange = { isChecked ->
                        tasks[index] = task.copy(isCompleted = isChecked)
                    },
                    colors = CheckboxDefaults.colors(
                        checkedColor = EmeraldNeon,
                        uncheckedColor = Color.Gray,
                        checkmarkColor = Color.Black
                    )
                )
                Text(
                    text = task.name, 
                    color = if (task.isCompleted) Color.Gray else Color.White, 
                    modifier = Modifier.padding(start = 8.dp)
                )
            }
        }
    }
}

data class TaskItem(val name: String, val isCompleted: Boolean)
