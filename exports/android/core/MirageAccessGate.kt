package com.mirage.app.core

object MirageAccessGate {
    /**
     * تفعيل الوصول للمسار السحابي للجميع
     */
    fun canAccessCloudRoute(): Boolean {
        return MirageBillingManager.isBonusTimeActive() || // مفعل عبر الفيديوهات
               MirageIdentityManager.hasActiveSubscription() // مفعل عبر اشتراك (يومي/أسبوعي/إلخ)
    }
}
