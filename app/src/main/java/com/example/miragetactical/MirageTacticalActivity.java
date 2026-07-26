package com.example.miragetactical;

import android.content.Context;
import android.content.res.Configuration;
import android.os.Bundle;
import android.util.Log;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatDelegate;

import org.xmlpull.v1.XmlPullParser;
import org.xmlpull.v1.XmlPullParserFactory;

import java.io.StringReader;
import java.util.HashMap;
import java.util.Map;

import io.flutter.embedding.android.FlutterActivity;
import io.flutter.embedding.engine.FlutterEngine;
import io.flutter.plugin.common.MethodChannel;

/**
 * النشاط الرئيسي لتطبيق ميراج (الجسر بين Flutter ونظام أندرويد)
 * يدير الاتصالات مع MirageVpnManager عبر MethodChannel.
 */
public class MirageTacticalActivity extends FlutterActivity {

    // ============================================================
    // 1. الثوابت والمتغيرات
    // ============================================================
    private static final String CHANNEL = "com.mirage.vpn";
    private static final String TAG = "MirageVpn";

    private MethodChannel methodChannel;
    private final Map<String, String> configMap = new HashMap<>();

    // ============================================================
    // 2. دورة الحياة
    // ============================================================
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // تحميل الإعدادات من remote_config_defaults.xml
        loadRemoteConfig();
    }

    @Override
    public void configureFlutterEngine(FlutterEngine flutterEngine) {
        super.configureFlutterEngine(flutterEngine);

        // إنشاء قناة MethodChannel للتواصل مع Flutter
        methodChannel = new MethodChannel(
            flutterEngine.getDartExecutor().getBinaryMessenger(),
            CHANNEL
        );

        methodChannel.setMethodCallHandler((call, result) -> {
            switch (call.method) {
                case "getConfig":
                    String key = call.argument("key");
                    String value = getConfig(key);
                    result.success(value);
                    break;

                case "connectVpn":
                    String server = call.argument("server");
                    String sessionId = call.argument("sessionId");
                    String tempKey = call.argument("tempKey");
                    connectVpn(server, sessionId, tempKey);
                    result.success("Connecting to " + server);
                    break;

                case "disconnectVpn":
                    disconnectVpn();
                    result.success("Disconnected");
                    break;

                case "activateFallbackMode":
                    activateFallbackMode();
                    result.success("Fallback activated");
                    break;

                case "deactivateFallbackMode":
                    deactivateFallbackMode();
                    result.success("Fallback deactivated");
                    break;

                default:
                    result.notImplemented();
                    break;
            }
        });
    }

    // ============================================================
    // 3. قراءة الإعدادات من remote_config_defaults.xml
    // ============================================================
    private void loadRemoteConfig() {
        try {
            // الحصول على موارد XML من مجلد res/xml/
            int resourceId = getResources().getIdentifier(
                "remote_config_defaults",
                "xml",
                getPackageName()
            );

            if (resourceId == 0) {
                Log.e(TAG, "لم يتم العثور على ملف remote_config_defaults.xml");
                return;
            }

            XmlPullParser parser = getResources().getXml(resourceId);
            int eventType = parser.getEventType();
            String currentKey = null;

            while (eventType != XmlPullParser.END_DOCUMENT) {
                String tagName = parser.getName();
                switch (eventType) {
                    case XmlPullParser.START_TAG:
                        if ("key".equals(tagName)) {
                            currentKey = parser.nextText();
                        } else if ("value".equals(tagName) && currentKey != null) {
                            String value = parser.nextText();
                            configMap.put(currentKey, value);
                            currentKey = null;
                        }
                        break;
                }
                eventType = parser.next();
            }

            Log.d(TAG, "✅ تم تحميل " + configMap.size() + " إعداد من remote_config_defaults.xml");

        } catch (Exception e) {
            Log.e(TAG, "❌ فشل تحميل الإعدادات: " + e.getMessage());
        }
    }

    // ============================================================
    // 4. دالة الحصول على الإعدادات (تُستدعى من Flutter)
    // ============================================================
    private String getConfig(String key) {
        String value = configMap.get(key);
        if (value == null) {
            // محاولة قراءة من Firebase Remote Config كخيار ثانوي
            try {
                // يمكن إضافة Firebase Remote Config هنا إذا لزم الأمر
                // return FirebaseRemoteConfig.getInstance().getString(key);
            } catch (Exception ignored) {
            }
            return ""; // قيمة افتراضية
        }
        return value;
    }

    // ============================================================
    // 5. دوال VPN (تُستدعى من Flutter)
    // ============================================================
    private void connectVpn(String server, String sessionId, String tempKey) {
        // هنا يتم تفعيل الـ VPN الفعلي (سيتم ربطه مع خدمة VPN لاحقاً)
        Log.d(TAG, "🔗 الاتصال بـ " + server + " (المفتاح: " + tempKey + ")");
        Toast.makeText(this, "🔗 جارٍ الاتصال بـ " + server, Toast.LENGTH_SHORT).show();

        // يمكن إرسال أمر إلى BaseActivity أو AlBarqHub إذا كانا موجودين
        // مثل: hubClient.sendCommand("vpn_connected", mapOf(...))
    }

    private void disconnectVpn() {
        Log.d(TAG, "❌ قطع الاتصال");
        Toast.makeText(this, "❌ تم قطع الاتصال", Toast.LENGTH_SHORT).show();
    }

    private void activateFallbackMode() {
        Log.d(TAG, "🌊 تفعيل وضع الطوارئ (كابل بحري/ساتل)");
        Toast.makeText(this, "🌊 تفعيل وضع الطوارئ", Toast.LENGTH_LONG).show();
    }

    private void deactivateFallbackMode() {
        Log.d(TAG, "🌍 إلغاء وضع الطوارئ");
        Toast.makeText(this, "🌍 إلغاء وضع الطوارئ", Toast.LENGTH_SHORT).show();
    }
            }
