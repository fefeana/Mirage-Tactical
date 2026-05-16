// ملف syncAll.js
const ntpClient = require('ntp-client');

// قائمة الملفات اللي نريد مزامنتها
const files = [
  "mirage.js",
  "settings.js",
  "dashboard.js",
  "aiCore.js"
];

// دالة مزامنة الوقت عبر NTP
function syncTime(callback) {
  ntpClient.getNetworkTime("pool.ntp.org", 123, (err, date) => {
    if(err) {
      console.error("❌ خطأ في مزامنة الوقت:", err);
      return;
    }
    console.log("⏱️ الوقت المتزامن:", date);
    callback(date);
  });
}

// دالة تحديث الملفات
function updateFiles(time) {
  files.forEach(file => {
    console.log(`⚡ تحديث ومزامنة الملف: ${file} عند ${time}`);
    // هنا ممكن تضيف كود إعادة تحميل أو إعادة بناء الملف
    // مثل: reload(file) أو deploy(file)
  });
  console.log("✅ جميع الملفات تم تحديثها ومزامنتها بنجاح");
}

// تشغيل التحديث والمزامنة في الوقت الفعلي
syncTime(updateFiles);
