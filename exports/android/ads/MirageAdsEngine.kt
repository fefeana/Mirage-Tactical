package com.mirage.app.ads

import android.app.Activity
import android.content.Context
import com.google.android.gms.ads.AdRequest
import com.google.android.gms.ads.rewarded.RewardedAd
import com.google.android.gms.ads.rewarded.RewardedAdLoadCallback

object MirageAdsEngine {
    private var rewardedAd: RewardedAd? = null

    /**
     * تحميل الفيديو في الخلفية (صمت) ليكون جاهزاً عند طلب المستخدم
     */
    fun loadRewardedVideo(context: Context) {
        val adRequest = AdRequest.Builder().build()
        RewardedAd.load(context, "AD_UNIT_ID_HERE", adRequest, object : RewardedAdLoadCallback() {
            override fun onAdLoaded(ad: RewardedAd) {
                rewardedAd = ad
            }
        })
    }

    /**
     * عرض الفيديو ومنح المكافأة بعد الانتهاء
     */
    fun showVideo(activity: Activity, onRewardEarned: () -> Unit) {
        rewardedAd?.let { ad ->
            ad.show(activity) { _ ->
                // الساموراي أكمل المهمة! امنحه المكافأة
                onRewardEarned() 
                loadRewardedVideo(activity) // تحميل الفيديو التالي
            }
        } ?: run {
            // إذا لم يتوفر فيديو، يمكن إبلاغ المستخدم بالمحاولة لاحقاً
        }
    }
}
