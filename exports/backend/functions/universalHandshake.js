const functions = require('@google-cloud/functions-framework');
const crypto = require('crypto');
const { encryptConfig, generateVLESSConfig } = require('../services/configSigner');

const ENCRYPTION_SECRET = process.env.ENCRYPTION_SECRET || 'MIRAGE_SECURE_ENCLAVE_KEY_2026';

/**
 * 🌍 The Universal Handshake (SSO & Device Profiling Gateway)
 * يستقبل طلبات الدخول الموحد من جميع المنصات (Desktop, Mobile, Web)
 * يتعرف على نوع الجهاز ويرسل المفتاح المخصص وبيانات الـ Xray-core الأمثل.
 */
functions.http('universalHandshake', (req, res) => {
  // 1. استخلاص بيانات الهوية والجهاز
  const { ssoToken, platform, deviceId } = req.body;

  if (!ssoToken) {
    return res.status(401).json({ error: "UNAUTHORIZED_NO_SSO_TOKEN" });
  }

  // (محاكاة التحقق من التوكن السحابي - Firebase Auth أو JWT)
  const userValid = true; // يفترض أن يتم التحقق هنا
  if (!userValid) return res.status(403).json({ error: "INVALID_IDENTITY" });

  console.log(`[MIRAGE_SSO] Authenticating Device: ${deviceId} | OS: ${platform.toUpperCase()}`);

  // 2. تكييف بيانات الـ Xray-core بناءً على نوع النظام (OS Awareness)
  let baseConfig = generateVLESSConfig("global-gw.mirage.network", crypto.randomUUID(), "MIRAGE_X25519_PUB");
  let tuningMeta = {};

  switch(platform.toLowerCase()) {
    case 'android':
    case 'ios':
      // Mobile Profile: توفير البطارية (Mux)، وتقليل عدد الروابط المتزامنة
      baseConfig.outbounds[0].mux = { enabled: true, concurrency: 8 };
      tuningMeta = { profile: "MOBILE_BATTERY_SAVER", maxConnections: 32 };
      break;

    case 'windows':
    case 'macos':
    case 'linux':
      // Desktop Profile: سرعة قصوى (No Mux limitations)، تحميل بيانات ضخمة
      baseConfig.outbounds[0].mux = { enabled: false };
      tuningMeta = { profile: "DESKTOP_BLAZING_SPEED", maxConnections: 512 };
      break;

    default:
      tuningMeta = { profile: "STANDARD_UPLINK", maxConnections: 128 };
      break;
  }

  // 3. بناء هيكل الإجابة السحابية وتشفيرها
  const handShakePayload = {
    sessionTimestamp: Date.now(),
    device: deviceId,
    os: platform,
    tuning: tuningMeta,
    xrayConfig: baseConfig
  };

  // تشفير معقد لضمان وصول الـ JSON بسلام
  const secureHandshake = encryptConfig(handShakePayload, ENCRYPTION_SECRET);

  // 4. تسليم مفتاح الدخول العالمي
  res.json({
    status: "AUTHORIZED",
    authNode: "SSO_GATEWAY_HQ",
    encryptedPayload: secureHandshake,
    signature: crypto.createHmac('sha256', ENCRYPTION_SECRET).update(secureHandshake).digest('hex')
  });
});
