package com.mirage.vpn.core

import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow

data class NetworkMetrics(
    val latency: Int,
    val packetLoss: Int
)

class SentinelObserver {
    val metricsFlow: Flow<NetworkMetrics> = flow {
        while (true) {
            delay(3000)
            // محاكاة قراءة المقاييس للـ Sentinel
            val latency = (20..150).random()
            val packetLoss = if (latency > 100) (0..10).random() else 0
            emit(NetworkMetrics(latency, packetLoss))
        }
    }
}
