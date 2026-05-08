package com.mirage.app.core

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

class MirageGameController(private val scope: CoroutineScope) {
    var isTurboActive by mutableStateOf(false)
    var gamePing by mutableStateOf("--")

    fun toggleTurbo() {
        isTurboActive = !isTurboActive
        if (isTurboActive) {
            startLowLatencyPulse()
        }
    }

    private fun startLowLatencyPulse() {
        scope.launch {
            while (isTurboActive) {
                // محاكاة تحديث الـ Ping الفعلي للسيرفر المخصص للألعاب
                gamePing = (30..60).random().toString() 
                delay(2000) // تحديث كل ثانيتين
            }
        }
    }
}
