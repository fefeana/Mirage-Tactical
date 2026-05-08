const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.getMirageConfig = functions.https.onCall(async (data, context) => {
    // 1. التحقق من أن المستخدم مسجل دخول
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'يجب تسجيل الدخول أولاً');
    }

    const uid = context.auth.uid;
    
    try {
        // 2. جلب بيانات المستخدم من Firestore
        const userDoc = await admin.firestore().collection('users').doc(uid).get();
        const userData = userDoc.data();

        // 3. التمييز بين الخطة المجانية والمدفوعة
        if (userData && userData.plan === 'premium') {
            // إرجاع إعدادات سيرفرات GCP القوية (Hysteria2/VLESS)
            return {
                server: "premium-node-01.mirage.sh",
                protocol: "Hysteria2",
                port: 443,
                auth: userData.premium_key, // مفتاح خاص بالمشترك
                obfs: "shadow-tls"
            };
        } else {
            // إرجاع إعدادات السيرفر المجاني
            return {
                server: "free-node.mirage.sh",
                protocol: "VLESS",
                port: 8080,
                uuid: "free-access-id-123",
                reality: true
            };
        }
    } catch (error) {
        throw new functions.https.HttpsError('internal', 'حدث خطأ في جلب البيانات');
    }
});
