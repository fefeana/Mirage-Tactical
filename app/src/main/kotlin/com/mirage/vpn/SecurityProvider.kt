package com.mirage.vpn

import android.content.Context

object SecurityProvider {
    init {
        // يجب أن يتطابق هذا الاسم مع اسم المكتبة في CMakeLists.txt
        System.loadLibrary("mirage_security")
    }

    // تمرير الـ Context للنواة للتحقق من التوقيع (Signature Shield)
    external fun getVoucherSecret(context: Context): String
}
