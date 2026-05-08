package com.mirage.app.core

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue

enum class SubscriptionTier {
    FREE, PRO, SAMURAI_ELITE
}

object MirageIdentityManager {
    // حالة الاشتراك الحالية (تُحدث عند تسجيل الدخول أو التجديد)
    var currentTier by mutableStateOf(SubscriptionTier.FREE)
    var samuraiId by mutableStateOf("USER-XXXX-XXXX")
    var expiryDate by mutableStateOf("---")

    /**
     * التحقق الصامت من السيرفر لتحديث حالة الدرع
     */
    fun refreshSubscriptionStatus() {
        // هنا يتم الربط مع API السيرفر الخاص بك
        // إذا نجح التحقق، يتم ترقية الـ Tier وفتح ميزات التمويه المتقدمة
    }

    fun isFeatureAccessAllowed(tierRequired: SubscriptionTier): Boolean {
        return currentTier.ordinal >= tierRequired.ordinal
    }

    fun hasActiveSubscription(): Boolean {
        return currentTier != SubscriptionTier.FREE
    }
}
