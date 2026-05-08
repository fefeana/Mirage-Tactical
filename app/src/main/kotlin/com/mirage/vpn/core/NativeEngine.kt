package com.mirage.vpn.core

import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow

object NativeEngine {
    init {
        // تحميل المكتبة الديناميكية المكتوبة بالـ C++
        System.loadLibrary("mirage-engine")
    }

    // قناة تبث التحديثات من الـ C++ مباشرة، ليوفر موارد الواجهة
    private val _nativeTrafficFlow = MutableStateFlow<Pair<Long, Long>>(Pair(0L, 0L))
    val nativeTrafficFlow = _nativeTrafficFlow.asStateFlow()

    @JvmStatic
    fun onNativeSpeedUpdate(rxBytes: Long, txBytes: Long) {
        // يتم استدعاء هذه الدالة حصرياً من الـ C++ Thread عند حدوث نقل لافت
        _nativeTrafficFlow.value = Pair(rxBytes, txBytes)
    }

    /**
     * تفعيل المحرك الأصلي (Native Engine) عبر تمرير ملف الـ TUN (File Descriptor)
     * @param tunFd: الـ FileDescriptor الخاص بواجهة الـ VPN
     * @param secretKey: المفتاح الآمن المستخرج من درع التوقيع
     * @return Boolean: يحدد نجاح تفعيل المحرك أو الفشل (بحالة العبث)
     */
    external fun startEngine(tunFd: Int, secretKey: String): Boolean

    /**
     * إغلاق النفق وتدمير مفاتيح الجلسة من الذاكرة
     */
    external fun stopEngine()

    /**
     * جلب كمية البيانات المحملة (لترجمتها إلى حركة ضوئية في الواجهة)
     * @return Long: إجمالي البايتات المستلمة
     */
    external fun getRxBytes(): Long

    /**
     * جلب كمية البيانات المرسلة (لعبور جدار الحماية)
     * @return Long: إجمالي البايتات المرسلة
     */
    external fun getTxBytes(): Long
}
