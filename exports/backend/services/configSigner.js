const crypto = require('crypto');

/**
 * 🛡️ Mirage Dynamic Config Provider & Signer
 * Service to generate and encrypt Xray-core configurations dynamically.
 */

// وظيفة لتشفير الـ JSON قبل إرساله (لزيادة الحماية)
const encryptConfig = (configData, secretKey) => {
    // Ensuring the secret key is 32 bytes for aes-256-cbc
    const key = crypto.createHash('sha256').update(String(secretKey)).digest('base64').substring(0, 32);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
    
    let encrypted = cipher.update(JSON.stringify(configData));
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    
    // إرجاع الـ IV مع النص المشفر لفك التشفير لاحقاً
    return iv.toString('hex') + ':' + encrypted.toString('hex');
};

// توليد إعدادات Xray-core ديناميكياً
const generateVLESSConfig = (serverIp, uuid, publicKey) => {
    return {
        log: {
            loglevel: "warning"
        },
        inbounds: [{
            port: 10808,
            protocol: "socks",
            listen: "127.0.0.1",
            settings: {
                udp: true
            }
        }],
        outbounds: [{
            protocol: "vless",
            settings: {
                vnext: [{
                    address: serverIp,
                    port: 443,
                    users: [{ id: uuid, encryption: "none", flow: "xtls-rprx-vision" }]
                }]
            },
            streamSettings: {
                network: "grpc",
                security: "reality",
                realitySettings: {
                    show: false,
                    fingerprint: "chrome",
                    serverName: "google.com", // التمويه والهروب من الـ DPI
                    publicKey: publicKey,
                    shortId: "mirage",
                    spiderX: ""
                },
                grpcSettings: {
                    multiMode: true,
                    idle_timeout: 60
                }
            }
        }]
    };
};

module.exports = {
    encryptConfig,
    generateVLESSConfig
};
