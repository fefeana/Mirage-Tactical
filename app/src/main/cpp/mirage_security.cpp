#include <jni.h>
#include <string>

// دالة لتجميع المفتاح من أجزاء مشتتة (Obfuscation) لمنع التعرف عليه بالـ Strings
std::string assembleKey() {
    std::string p1 = "EMER";
    std::string p2 = "ALD_";
    std::string p3 = "FIRE";
    std::string p4 = "WALL_X2026";
    return p1 + p2 + p3 + p4;
}

extern "C" JNIEXPORT jstring JNICALL
Java_com_mirage_vpn_core_SecurityProvider_getShieldedKey(JNIEnv* env, jobject clazz) {
    return env->NewStringUTF(assembleKey().c_str());
}
