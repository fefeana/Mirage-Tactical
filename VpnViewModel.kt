package com.ufoalbarq.vpn.presentation.viewmodel

import android.util.Log
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.ufoalbarq.vpn.domain.model.VpnConfig
import com.ufoalbarq.vpn.domain.repository.VpnRepository
import com.ufoalbarq.vpn.domain.repository.VpnStatus
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.launch
import javax.inject.Inject

enum class UserPlan { FREE, PREMIUM }

data class UserProfile(
    val id: String,
    val plan: UserPlan,
    val expiryDate: Long? = null // للمشتركين فقط
)

/**
 * ⚔️ UFO ALBARQ - VpnViewModel (The General)
 * يدير حالة الواجهة (UI State) ويتخذ قرارات تكتيكية (مثل الإصلاح الذاتي) بناءً على ردود المحرك.
 */
@HiltViewModel
class VpnViewModel @Inject constructor(
    private val vpnRepository: VpnRepository
) : ViewModel() {

    private val tag = "SamuraiViewModel"

    // حالة الاتصال التي تراقبها واجهة المستخدم (Compose UI)
    private val _connectionState = MutableStateFlow(VpnStatus.DISCONNECTED)
    val connectionState: StateFlow<VpnStatus> = _connectionState.asStateFlow()

    // حالة الاتصال الحالية
    var connectionStatus by mutableStateOf<VpnStatus>(VpnStatus.DISCONNECTED)

    private var isSelfHealingActive = false
    private var lastConfig: VpnConfig? = null

    init {
        // مراقبة نبض المحرك (Repository Flow)
        viewModelScope.launch {
            vpnRepository.getConnectionStatus().collectLatest { status ->
                _connectionState.value = status
                connectionStatus = status
                
                // تفعيل بروتوكول الإصلاح الذاتي إذا سقط الخادم
                if (status == VpnStatus.ERROR && !isSelfHealingActive) {
                    Log.w(tag, "[!] Connection Failed. Initiating Self-Healing Protocol...")
                    initiateSelfHealing()
                }
            }
        }
    }

    fun handleConnectTap(user: UserProfile? = null) {
        viewModelScope.launch {
            val currentState = _connectionState.value
            if (currentState == VpnStatus.CONNECTED || currentState == VpnStatus.CONNECTING) {
                // أمر الانسحاب (Disconnect)
                Log.d(tag, "[-] User requested disconnection.")
                isSelfHealingActive = false // إيقاف الإصلاح الذاتي عند الإغلاق اليدوي
                vpnRepository.disconnect()
            } else {
                _connectionState.value = VpnStatus.CONNECTING
                connectionStatus = VpnStatus.CONNECTING
                
                // جلب الإعدادات من Firebase Cloud Functions عبر الـ Repository
                val result = vpnRepository.fetchVpnConfig()
                
                result.onSuccess { config ->
                    lastConfig = config
                    // إرسال الإعدادات لمحرك الـ VPN (Mirage Engine)
                    startVpnEngine(config)
                }.onFailure {
                    _connectionState.value = VpnStatus.ERROR
                    connectionStatus = VpnStatus.ERROR
                    Log.e(tag, "فشل جلب الإعدادات: ${it.message}")
                }
            }
        }
    }

    private fun startVpnEngine(config: VpnConfig) {
        // إعدادات الـ Stealth Mode بناءً على نوع الاشتراك
        val stealthLevel = if (config.isPremium) "Aggressive" else "Standard"
        
        Log.d(tag, "Connecting to ${config.serverIp} using ${config.protocol} with Stealth Level: $stealthLevel")
        
        // محرك الميراج يبدأ العمل هنا
        viewModelScope.launch {
            vpnRepository.connect(config)
        }
    }

    /**
     * 🔄 بروتوكول الإصلاح الذاتي (Autonomous Self-Healing)
     * يحاول إعادة الاتصال بآخر إعدادات تم جلبها.
     */
    private fun initiateSelfHealing() {
        viewModelScope.launch {
            isSelfHealingActive = true
            
            Log.w(tag, "[-] Attempting to reconnect...")
            
            // تأخير تكتيكي (Tactical Delay) لتجنب إغراق النظام بالطلبات
            delay(1500) 
            
            lastConfig?.let {
                startVpnEngine(it)
            } ?: run {
                _connectionState.value = VpnStatus.DISCONNECTED
                connectionStatus = VpnStatus.DISCONNECTED
                isSelfHealingActive = false
            }
        }
    }
}
