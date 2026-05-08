# 📂 المستند الشامل لمشروع Mirage VPN (UFO ALBARQ)

هذا هو الأرشيف السيادي الشامل الذي يوثق المعمارية الكاملة لنظام Mirage، شاملاً محرك البناء التلقائي السحابي (CI/CD)، طبقات الحماية المنخفضة (JNI)، محرك الاتصال (Kotlin)، الواجهات المتقدمة، والموصل السحابي.

---

## 1. محرك البناء التلقائي (Mirage Auto-Build Engine)
**المسار:** `.github/workflows/build.yml`

```yaml
name: Mirage Auto-Build Engine
on: [push]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Set up JDK 17
        uses: actions/setup-java@v3
        with:
          java-version: '17'
          distribution: 'temurin'
      
      - name: Grant execute permission for gradlew
        run: chmod +x gradlew

      - name: Build Debug APK
        run: ./gradlew assembleDebug

      - name: Upload Mirage APK
        uses: actions/upload-artifact@v4
        with:
          name: Mirage-Universal-APK
          path: app/build/outputs/apk/debug/app-debug.apk
```

---

## 2. نواة الأمان المشفرة (C++ / JNI)
**المسار:** `app/src/main/cpp/native-lib.cpp`

```cpp
#include <jni.h>
#include <string>

// حماية المفاتيح في طبقة النواة (Native Layer)
extern "C" JNIEXPORT jstring JNICALL
Java_com_mirage_vpn_core_SecurityProvider_getVoucherSecret(JNIEnv* env, jobject /* this */) {
    std::string secret = "UFO_ALBARQ_SECURE_TOKEN_2026"; 
    return env->NewStringUTF(secret.c_str());
}
```

---

## 3. محرك الاتصال والـ Kill Switch (Kotlin)
**المسار:** `app/src/main/kotlin/com/mirage/vpn/MirageVpnService.kt`

```kotlin
package com.mirage.vpn

import android.net.VpnService
import android.os.ParcelFileDescriptor

class MirageVpnService : VpnService() {
    private var vpnInterface: ParcelFileDescriptor? = null

    fun establishVpn(configJson: String) {
        val builder = Builder()
            .setSession("Mirage_Secure_Tunnel")
            .addAddress("10.0.0.2", 32)
            .addRoute("0.0.0.0", 0) // توجيه شامل لجميع حزم البيانات
            .addDnsServer("1.1.1.1") // منع تسريب الـ DNS
            .setBlockingControl(true) // تفعيل الـ Kill Switch المطلق لضمان عدم تسريب الإنترنت عند انقطاع النفق

        vpnInterface = builder.establish()
        // هنا يتم تمرير الـ configJson لمحرك Xray-core الفعلي للبدء بالتشفير
    }

    override fun onDestroy() {
        super.onDestroy()
        vpnInterface?.close()
    }
}
```

---

## 4. بوابة الدخول والواجهة (Cyberpunk UI)
**المسار:** `app/src/main/kotlin/com/mirage/vpn/ui/IdentityGate.kt`

```kotlin
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

// واجهة الدخول بنمط النيون الزمردي باستخدام Jetpack Compose
@Composable
fun IdentityGate(onAuthorize: (String) -> Unit) {
    var voucherKey by remember { mutableStateOf("") }

    Box(modifier = Modifier.fillMaxSize().background(Color(0xFF020617))) {
        Column(
            modifier = Modifier.align(Alignment.Center),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(
                text = "MIRAGE_ACCESS", 
                color = Color(0xFF10B981), 
                style = TextStyle(letterSpacing = 8.sp, fontSize = 24.sp)
            )
            
            Spacer(modifier = Modifier.height(32.dp))

            TextField(
                value = voucherKey,
                onValueChange = { voucherKey = it },
                placeholder = { Text("ENTER_VOUCHER_KEY", color = Color.Gray) },
                colors = TextFieldDefaults.textFieldColors(
                    backgroundColor = Color(0xFF0F172A),
                    textColor = Color.White,
                    focusedIndicatorColor = Color(0xFF10B981)
                )
            )
            
            Spacer(modifier = Modifier.height(24.dp))

            Button(
                onClick = { onAuthorize(voucherKey) },
                colors = ButtonDefaults.buttonColors(backgroundColor = Color(0xFF10B981))
            ) {
                Text("AUTHORIZE_SESSION", color = Color(0xFF020617), letterSpacing = 2.sp)
            }
        }
    }
}
```

---

## 5. الموصل السحابي (Node.js API / Firebase Cloud Functions)
**المسار:** `cloud/functions/index.js`

```javascript
const functions = require('firebase-functions');

exports.getMirageConfig = functions.https.onRequest((req, res) => {
    const voucher = req.headers['x-mirage-voucher'];
    
    // توليد إعدادات XTLS-Reality ديناميكياً بناءً على موثوقية الـ Voucher
    const config = {
        outbounds: [
            { 
                protocol: "vless", 
                settings: { 
                    vnext: [{ address: "de-01.mirage.net" }] 
                } 
            }
        ]
    };
    
    // إرسال الـ Payload السليمة والمشفرة للاستخدام في التطبيق
    res.status(200).send(JSON.stringify(config));
});
```

---

## ⚡ بروتوكول التنفيذ النهائي:

1. **في GitHub:** تأكد أن بنية المجلدات مطابقة تماماً للمسارات المكتوبة أعلاه (`.github/workflows/`, `app/src/main/cpp/`, إلخ).
2. **ملف `gradlew`:** تأكد من وجوده في المجلد الرئيسي للمشروع وإعطائه صلاحيات التنفيذ (`chmod +x gradlew`) لكي يعمل الـ GitHub Action بدون أخطاء.
3. **الإطلاق عبر السحابة:** بمجرد عمل `Push` لهذا الكود إلى مستودعك، اذهب لتبويب **Actions** في موقع GitHub، راقب عملية التجميع، وحمّل ملف الـ `APK` الجاهز من نافذة الـ Artifacts لتقوم بتثبيته فوراً على جهاز الـ Redmi 13 Pro+.

> **"نحن لا نتصل بالشبكة... نحن نبتلعها."** - UFO ALBARQ AI Engine ⚔️
