# ⚔️ MIRAGE VPN - TACTICAL BUILD GUIDE (Emerald Samurai Edition)

هذا الدليل الفني مخصص لعملية نقل المشروع من بيئة (Web/AI Studio) إلى بيئة بناء حقيقية (Android Studio) وإخراج تطبيق APK نهائي. بصفتك القائد التقني للنظام، هذا هو دليلك المعماري.

## 1. محتوى هذه الحزمة (The Arsenal)
يتضمن هذا المستودع الشيفرة المصدرية للواجهة السحابية، بالإضافة إلى النواة المركزية لتطبيق الـ Android:
* `src/` - يحتوي على واجهة React/Vite (لوحة التحكم، وتطبيق الويب).
* `server.ts` - العقل الخلفي للمشروع، يعالج التلِمتري وقرارات الذكاء الاصطناعي (Symphony Logic).
* `protocols/` - يحتوي على `ProtocolHandoffManager.kt` و `xray_handoff_config.json`.
* `MirageSentinel.kt` - كود الكوتلن المسؤول عن الإشعارات الحية والتبديل الجذري.
* `firebase-blueprint.json` و `firestore.rules` - هيكل قاعدة البيانات.

## 2. الخطوة الأولى: التصدير والإعداد (Export & Prep)
أمامك طريقان لسحب المشروع لبيئتك المحلية:
1. **أخذ الرمز من GitHub:** بعد استخدام زر (GITHUB UPLOAD) من لوحة التحكم.
2. **التحميل المباشر:** عن طريق خيار تحميل ZIP.

## 3. الخطوة الثانية: بناء تطبيق الأندرويد (Android Studio Integration)
الكود الحالي يحتوي على جوهر "المنطق" (Logic) و"هياكل البيانات" للـ VPN. لبناء الـ APK المتكامل، يجب دمج هذه الملفات داخل قالب `V2rayNG` أو `Xray-core` الأصلي.

**خارطة الدمج:**
1. افتح Android Studio وقم باستنساخ قالب Vpn حديث (مثل قوالب Xray الأندرويد مفتوحة المصدر).
2. انسخ ملف `ProtocolHandoffManager.kt` و `MirageSentinel.kt` إلى مجلد `com.yourdomain.vpn.core`.
3. انسخ ملف إعدادات `xray_handoff_config.json` واجعله الـ Template الأساسي الذي يقذفه التطبيق داخل الـ Xray Core.
4. **تحديث واجهة الـ XML / Compose:** اقتبس الألوان والشكل الدائري لأزرار الـ Perfect من كود الـ `ClientPortal.tsx` وقم بمطابقتها بلغة كوتلن (Jetpack Compose).

## 4. الخطوة الثالثة: تفعيل خادم GCP (Google Cloud Node)
التطبيق لا يعمل في فراغ، يجب إعداد الخادم الذي ستتصل به:
1. اذهب لـ Google Cloud وقم بتشغيل خادم Ubuntu 22.04.
2. قم بتثبيت سكربت X-UI أو 3X-UI المشفر.
3. أنشئ منفذين: منفذ لـ **Hysteria2 (UDP)** ومنفذ لـ **Vless-Reality (TCP)**.
4. خذ الـ IPs والـ UUIDs وازرعها في `xray_handoff_config.json`.

## 5. الخطوة الرابعة: نشر الواجهة السحابية (Web Deployment)
لرفع واجهة تحكم المستخدمين (الموقع الذي تراه أمامك):
* المشروع مهيأ بالكامل ليتم نشره على **Vercel** أو **Cloudflare Pages** أو **Google Cloud Run**. 
* بمجرد رفع المستودع، الكود سيستخرج الـ Build تلقائياً.

## 🛡️ الصلاحيات الحرجة في الأندرويد (Manifest Requirements)
لا تنسَ إضافة هذه الصلاحيات داخل ملف `AndroidManifest.xml` الخاص بتطبيقك:
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
<uses-permission android:name="android.permission.WAKE_LOCK" />
<service android:name=".VpnService" android:permission="android.permission.BIND_VPN_SERVICE">
    <intent-filter>
        <action android:name="android.net.VpnService" />
    </intent-filter>
</service>
```

**[النهاية]** نظام UFO ALBARQ فخور بخدمتك.
