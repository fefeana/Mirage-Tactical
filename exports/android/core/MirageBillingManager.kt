package com.mirage.app.core

import androidx.compose.runtime.mutableStateOf

object MirageBillingManager {
    // أنواع الاشتراكات
    enum class Plan(val durationDays: Int) {
        DAILY(1), WEEKLY(7), MONTHLY(30), YEARLY(365)
    }

    // منطق "مشاهدة 5 فيديوهات = 3 ساعات"
    var videoCount = mutableStateOf(0)
    var remainingBonusTime = mutableStateOf(0L) // بالدقائق

    fun addVideoView() {
        videoCount.value++
        if (videoCount.value >= 5) {
            activateThreeHourBonus()
            videoCount.value = 0 // إعادة العداد
        }
    }

    private fun activateThreeHourBonus() {
        remainingBonusTime.value += 180 // إضافة 180 دقيقة (3 ساعات)
    }

    fun isBonusTimeActive(): Boolean {
        return remainingBonusTime.value > 0
    }
}
