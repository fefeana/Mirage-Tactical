const functions = require('@google-cloud/functions-framework');
const crypto = require('crypto');
// استدعاء وحدة التشفير التي قمنا ببنائها مسبقاً
const { encryptConfig, generateVLESSConfig } = require('../services/configSigner');

// بيئة العمل السحابية (Environment Variables)
const SECRET_HANDSHAKE = process.env.SECRET_HANDSHAKE || 'mirage_development_token';
const ENCRYPTION_SECRET = process.env.ENCRYPTION_SECRET || 'MIRAGE_SECURE_ENCLAVE_KEY_2026';

/**
 * ⚡ Google Cloud Function: dynamicConfigProvider
 * المحطة السحابية لتوزيع إعدادات الـ VPN بطريقة مشفرة ولحظية.
 */
functions.http('getSecureConfig', (req, res) => {
  // 1. التحقق من مفتاح الوصول (Handshake) من طرف تطبيق الأندرويد
  const clientToken = req.headers['x-mirage-token'];
  if (clientToken !== SECRET_HANDSHAKE) {
    console.warn(`[WARNING] Phantom request intercepted from IP: ${req.ip}`);
    return res.status(403).send('ACCESS_DENIED_NODE_UNTRUSTED');
  }

  const nodeId = req.query.nodeId || "global_relay_node";

  // 2. توليد الإعدادات اللحظية (Ephemeral Config) والمكانية (Dynamic)
  const ephemeralConfig = generateVLESSConfig(
      "de-01.mirage.network", // IP السيرفر الحقيقي
      crypto.randomUUID(),    // تزويد المعرف بشكل ديناميكي (UUID)
      "MIRAGE_X25519_PUB_KEY"
  );

  // هيكل البيانات الشاملة المرسلة للعميل
  const fullPayload = {
    config: ephemeralConfig,
    meta: {
      directive: "EXECUTE_VLESS_REALITY",
      shortId: crypto.randomBytes(4).toString('hex'), // معرّف قصير لمرة واحدة لمنع تتبع الجلسات
      timestamp: Date.now(),
      target_node: nodeId
    }
  };

  // 3. التشفير العميق (AES-256-CBC) لضمان عدم كشف الإعدادات برمجياً أو شبكياً
  const encryptedPayload = encryptConfig(fullPayload, ENCRYPTION_SECRET);

  // إرسال الرد العسكري (Payload)
  res.json({
    status: 200,
    message: "SECURE_LINK_ESTABLISHED",
    payload: encryptedPayload,
    // (Optional) توقيع إضافي (HMAC) لضمان عدم التلاعب (Tamper-proofing) 
    signature: crypto.createHmac('sha256', ENCRYPTION_SECRET).update(encryptedPayload).digest('hex')
  });
});
