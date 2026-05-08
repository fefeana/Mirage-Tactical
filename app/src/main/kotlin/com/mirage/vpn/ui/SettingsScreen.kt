package com.mirage.vpn.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.Switch
import androidx.compose.material.SwitchDefaults
import androidx.compose.material.Icon
import androidx.compose.material.IconButton
import androidx.compose.material.Text
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.VisibilityOff
import androidx.compose.material.icons.filled.Build
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun SettingsScreen(viewModel: VpnViewModel, onBack: () -> Unit) {
    val servers by viewModel.availableServers.collectAsState()
    val selectedServer by viewModel.selectedServer.collectAsState()
    val isCloudConnected by viewModel.isCloudConnected.collectAsState()
    
    val selectedRegion by viewModel.selectedRegion.collectAsState()
    val selectedProtocol by viewModel.selectedProtocol.collectAsState()

    // Filter Logic
    val filteredServers = servers.filter { server ->
        (selectedRegion == "All" || server.region == selectedRegion) &&
        (selectedProtocol == "All" || server.protocol == selectedProtocol)
    }

    // Tactical Toggles State
    val isAdBlockEnabled by viewModel.isAdBlockEnabled.collectAsState()
    val isGhostModeEnabled by viewModel.isGhostModeEnabled.collectAsState()
    val useEmeraldTheme by viewModel.useEmeraldTheme.collectAsState()

    Column(modifier = Modifier.fillMaxSize().background(Color(0xFF0F0F0F))) {
        
        // شريط التنقل (Header) مع علامة الكلاود
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(onClick = onBack) {
                Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = EmeraldNeon)
            }
            Spacer(modifier = Modifier.width(8.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    "Cloud Control Tower", // تمويه للسيرفرات
                    style = TextStyle(color = EmeraldNeon, fontSize = 20.sp, fontWeight = FontWeight.Black)
                )
                Text(
                    "Select routing node for analytics priority",
                    style = TextStyle(color = Color.Gray, fontSize = 12.sp)
                )
            }
            
            // مؤشر السحابة الأزرق (Cloud Center Icon)
            androidx.compose.foundation.Canvas(modifier = Modifier.size(24.dp).padding(4.dp)) {
                val cloudColor = if (isCloudConnected) Color(0xFF00E5FF) else Color.DarkGray
                val alphaVal = if (isCloudConnected) 0.8f else 0.4f
                
                // رسم مبسط لشكل السحابة
                drawCircle(color = cloudColor, radius = size.width * 0.3f, center = Offset(size.width * 0.3f, size.height * 0.6f), alpha = alphaVal)
                drawCircle(color = cloudColor, radius = size.width * 0.4f, center = Offset(size.width * 0.6f, size.height * 0.5f), alpha = alphaVal)
                drawCircle(color = cloudColor, radius = size.width * 0.25f, center = Offset(size.width * 0.8f, size.height * 0.7f), alpha = alphaVal)
                drawRoundRect(color = cloudColor, size = androidx.compose.ui.geometry.Size(size.width * 0.6f, size.height * 0.3f), topLeft = Offset(size.width * 0.2f, size.height * 0.6f), cornerRadius = androidx.compose.ui.geometry.CornerRadius(10f), alpha = alphaVal)
            }
        }

        // فلاتر الواجهة
        Row(
            modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 8.dp),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            val regions = listOf("All", "Asia", "Europe", "Americas")
            androidx.compose.foundation.lazy.LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                items(regions) { region ->
                    FilterChipUi(text = region, isSelected = selectedRegion == region) {
                        viewModel.selectedRegion.value = region
                    }
                }
            }
        }

        LazyColumn(
            modifier = Modifier.fillMaxSize().padding(horizontal = 16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            item {
                Text(
                    "TACTICAL OPERATIONS",
                    color = EmeraldNeon,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold,
                    letterSpacing = 2.sp,
                    modifier = Modifier.padding(top = 8.dp, bottom = 4.dp)
                )
            }
            
            item {
                SettingItem(
                    title = "Ad-Blocking Shield",
                    subtitle = "Purify your connection from tracers",
                    icon = Icons.Default.Lock,
                    checked = isAdBlockEnabled,
                    onCheckedChange = { viewModel.isAdBlockEnabled.value = it }
                )
            }
            item {
                SettingItem(
                    title = "Ghost Mode",
                    subtitle = "Complete obfuscation of your digital footprint",
                    icon = Icons.Default.VisibilityOff,
                    checked = isGhostModeEnabled,
                    onCheckedChange = { viewModel.isGhostModeEnabled.value = it }
                )
            }
            item {
                SettingItem(
                    title = "Neon Theme",
                    subtitle = "Switch between Emerald and Violet aesthetics",
                    icon = Icons.Default.Build,
                    checked = useEmeraldTheme,
                    onCheckedChange = { viewModel.useEmeraldTheme.value = it }
                )
            }

            item {
                Spacer(modifier = Modifier.height(16.dp))
                Text(
                    "AVAILABLE ROUTING NODES",
                    color = Color.Gray,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold,
                    letterSpacing = 2.sp,
                    modifier = Modifier.padding(bottom = 4.dp)
                )
            }

            items(filteredServers) { server ->
                ServerItem(
                    server = server,
                    isSelected = selectedServer?.id == server.id,
                    onSelect = { viewModel.selectServerManually(server) }
                )
            }
            item { 
                Spacer(modifier = Modifier.height(30.dp))
            }
        }
    }
}

@Composable
fun ServerItem(server: ServerNode, isSelected: Boolean, onSelect: () -> Unit) {
    // تنسيق النيون حسب اللون
    val borderColor = if (isSelected) NeonViolet else Color.DarkGray
    val glowModifier = if (isSelected) Modifier.background(NeonViolet.copy(alpha = 0.1f)) else Modifier
    
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(12.dp))
            .then(glowModifier)
            .border(1.dp, borderColor, RoundedCornerShape(12.dp))
            .clickable { onSelect() }
            .padding(20.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Column(modifier = Modifier.weight(1f)) {
            Text(
                server.name.uppercase(), 
                color = Color.White, 
                fontSize = 16.sp,
                fontWeight = FontWeight.Bold,
                letterSpacing = 1.sp
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                "IP: ${server.ipAddress}", 
                color = Color.Gray, 
                fontSize = 12.sp,
                fontFamily = FontFamily.Monospace
            )
        }
        
        // عرض حالة السيرفر، سرعة التحميل والرفع
        Column(horizontalAlignment = Alignment.End) {
            val statusColor = if (server.isOnline) EmeraldNeon else Color.DarkGray
            val statusText = if (server.isOnline) "ONLINE" else "OFFLINE"
            
            Text(
                statusText,
                color = statusColor,
                fontSize = 10.sp,
                fontWeight = FontWeight.Bold,
                letterSpacing = 1.sp
            )
            Spacer(modifier = Modifier.height(6.dp))

            // DL/UL Indicators
            if (server.isOnline) {
                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    Column(horizontalAlignment = Alignment.End) {
                        Text("DL", color = Color.Gray, fontSize = 8.sp)
                        Text("${String.format("%.1f", server.downSpeed)}", color = Color.White, fontSize = 10.sp, fontFamily = FontFamily.Monospace)
                    }
                    Column(horizontalAlignment = Alignment.End) {
                        Text("UL", color = Color.Gray, fontSize = 8.sp)
                        Text("${String.format("%.1f", server.upSpeed)}", color = Color.White, fontSize = 10.sp, fontFamily = FontFamily.Monospace)
                    }
                }
            }
            
            Spacer(modifier = Modifier.height(6.dp))

            val pingColor = if (server.currentPing < 80) EmeraldNeon 
                            else if (server.currentPing < 150) Color(0xFFFF9100) 
                            else Color(0xFFFF0033)

            Text(
                "${server.currentPing} MS",
                color = pingColor,
                fontSize = 16.sp,
                fontWeight = FontWeight.Black,
                fontFamily = FontFamily.Monospace
            )
            if (isSelected) {
                Spacer(modifier = Modifier.height(4.dp))
                Icon(Icons.Default.CheckCircle, contentDescription = "Active", tint = NeonViolet, modifier = Modifier.size(16.dp))
            }
        }
    }
}

@Composable
fun FilterChipUi(text: String, isSelected: Boolean, onClick: () -> Unit) {
    Box(
        modifier = Modifier
            .clip(RoundedCornerShape(16.dp))
            .background(if (isSelected) NeonViolet.copy(alpha = 0.2f) else Color.DarkGray.copy(alpha = 0.3f))
            .border(1.dp, if (isSelected) NeonViolet else Color.DarkGray, RoundedCornerShape(16.dp))
            .clickable { onClick() }
            .padding(horizontal = 16.dp, vertical = 6.dp)
    ) {
        Text(
            text = text,
            color = if (isSelected) Color.White else Color.Gray,
            fontSize = 12.sp,
            fontWeight = FontWeight.Bold
        )
    }
}

@Composable
fun SettingItem(title: String, subtitle: String, icon: ImageVector, checked: Boolean, onCheckedChange: (Boolean) -> Unit) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp)
            .clip(RoundedCornerShape(12.dp))
            .background(Color(0xFF1A1A1A)) // خلفية العناصر
            .border(1.dp, if (checked) Color(0xFF50FFB0).copy(alpha = 0.5f) else Color.DarkGray, RoundedCornerShape(12.dp))
            .clickable { onCheckedChange(!checked) }
            .padding(16.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Icon(icon, contentDescription = null, tint = Color(0xFF50FFB0))
        Spacer(modifier = Modifier.width(16.dp))
        Column(modifier = Modifier.weight(1f)) {
            Text(text = title, color = Color.White, fontWeight = FontWeight.Bold, fontSize = 14.sp)
            Text(text = subtitle, color = Color.Gray, fontSize = 12.sp)
        }
        Switch(
            checked = checked,
            onCheckedChange = { onCheckedChange(it) },
            colors = SwitchDefaults.colors(
                checkedThumbColor = Color(0xFF50FFB0),
                checkedTrackColor = Color(0xFF004D36),
                uncheckedThumbColor = Color.Gray,
                uncheckedTrackColor = Color.DarkGray
            )
        )
    }
}
