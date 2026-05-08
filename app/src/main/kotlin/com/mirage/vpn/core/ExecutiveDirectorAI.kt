package com.mirage.vpn.core

import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlin.random.Random

data class FanComment(
    val id: Long,
    val fanName: String,
    val text: String,
    var sentimentScore: Int = 0,
    val timestamp: Long = System.currentTimeMillis()
)

object ExecutiveDirectorAI {
    
    // محرك تحليل المشاعر اللحظي (Sentiment Analysis Simulation)
    private val hypeKeywords = listOf("fast", "🔥", "love", "insane", "🚀", "amazing", "viral", "🤯", "wow")
    private val chillKeywords = listOf("wait", "hmm", "slow")

    private val _liveGlowIntensity = MutableStateFlow(0.5f)
    val liveGlowIntensity = _liveGlowIntensity.asStateFlow()

    private val _managedComments = MutableStateFlow<List<FanComment>>(emptyList())
    val managedComments = _managedComments.asStateFlow()

    private val _securityStatus = MutableStateFlow("SECURE")
    val securityStatus = _securityStatus.asStateFlow()

    fun updateSecurityStatusUI(status: String) {
        _securityStatus.value = status
    }

    /**
     * يقوم السينسور الذكي بقراءة التعليق وتحليل المشاعر
     * وإعطاء النقاط الإيجابية أو السلبية 
     */
    fun analyzeSentiment(text: String): Int {
        var score = 0
        val lower = text.lowercase()
        hypeKeywords.forEach { if (lower.contains(it)) score += 15 }
        chillKeywords.forEach { if (lower.contains(it)) score -= 5 }
        return score
    }

    /**
     * الإدارة التلقائية (Executive Director)
     * تستقبل التدفق الخام من الشبكة، تصنف، ترتب، ثم تضرم النيون!
     */
    fun processIncomingFeedback(fanName: String, text: String) {
        val score = analyzeSentiment(text)
        val newComment = FanComment(
            id = System.nanoTime(),
            fanName = fanName,
            text = text,
            sentimentScore = score
        )

        var currentList = _managedComments.value.toMutableList()
        currentList.add(newComment)
        
        // الأولوية دائماً للتعليقات المحمسة والإيجابية (Viral Sort)
        currentList = currentList.sortedByDescending { it.sentimentScore }.take(10).toMutableList()

        _managedComments.value = currentList

        // تعديل شدة توهج النيون في الواجهة بناءً على مستوى تفاعل الجمهور
        val totalHype = currentList.sumOf { it.sentimentScore }
        val newIntensity = (0.5f + (totalHype * 0.005f)).coerceIn(0.5f, 2.0f)
        _liveGlowIntensity.value = newIntensity
    }

    fun resetStandby() {
        _managedComments.value = listOf(
            FanComment(System.nanoTime(), "System", "Waiting for story to go live...")
        )
        _liveGlowIntensity.value = 0.5f
    }
}
