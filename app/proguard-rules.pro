# ===============================================
# Mirage Cyber Edition - ProGuard Protection Rules
# ===============================================

# 1. إخفاء وإزالة السجلات (Strip Debug Logs)
-assumenosideeffects class android.util.Log {
    public static boolean isLoggable(java.lang.String, int);
    public static int v(...);
    public static int i(...);
    public static int w(...);
    public static int d(...);
    public static int e(...);
}

# 2. حماية النواة وملفات الجسر (Protect JNI Bridge)
-keep class com.mirage.vpn.core.NativeEngine {
    # الاحتفاظ بدوال الـ JNI حتى يتمكن الكود الأصل (C++) من استدعاءها
    native <methods>;
    public static void onNativeSpeedUpdate(long, long);
}

-keep class com.mirage.vpn.SecurityProvider {
    native <methods>;
}

# 3. الحفاظ على المكونات الأساسية للـ Android
-keep public class * extends android.app.Activity
-keep public class * extends android.app.Application
-keep public class * extends android.app.Service {
    public <init>();
}

# 4. قواعد الـ Xray/Kotlin الافتراضية
-dontwarn kotlinx.coroutines.**
-keep class kotlinx.coroutines.** { *; }
