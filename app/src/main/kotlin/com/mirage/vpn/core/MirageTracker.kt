package com.mirage.vpn.core

import com.google.firebase.analytics.FirebaseAnalytics
import com.google.firebase.analytics.ktx.analytics
import com.google.firebase.analytics.logEvent
import com.google.firebase.ktx.Firebase

object MirageTracker {
    private val analytics: FirebaseAnalytics by lazy { Firebase.analytics }

    fun trackFeatureUsed(featureName: String) {
        analytics.logEvent("feature_usage") {
            param("feature_id", featureName)
            param("timestamp", System.currentTimeMillis().toString())
        }
    }
}
