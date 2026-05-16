// ملف cosmicApp.js

import translations from "./translations.json" with { type: "json" };

// النظام المالي الذاتي
let adsRevenue = 50;
let gamesRevenue = 30;
let subsRevenue = 20;
let serverCost = 60;
let cloudCost = 20;
let wallet = 0;

// الترجمة العالمية
function t(lang, key) {
  return translations[lang]?.[key] || translations["en"][key];
}

// تشغيل النظام المالي
function runFinance() {
  let totalRevenue = adsRevenue + gamesRevenue + subsRevenue;
  let totalCost = serverCost + cloudCost;
  wallet += (totalRevenue - totalCost);

  console.log(`🚀 تشغيل النظام`);
  console.log(`💰 إجمالي الدخل: ${totalRevenue}$`);
  console.log(`🧾 إجمالي المصاريف: ${totalCost}$`);
  console.log(`👛 الرصيد في المحفظة: ${wallet}$`);
}

// الاتصال المباشر مع السحابة
let alwaysOn = true;

function connectCloud() {
  if(alwaysOn) {
    console.log("🌐 اتصال مباشر مع السحابة – التطبيق يعمل 24/7.");
    keepAlive();
  }
}

function keepAlive() {
  setInterval(() => {
    console.log("📡 Ping: الاتصال حي ومستمر.");
    setBroadcastStatus("online");
  }, 5000);
}

// مؤشر البث
function setBroadcastStatus(status) {
  const indicator = document.getElementById("broadcastIndicator");
  if (!indicator) return;
  indicator.className = "indicator " + status;

  if(status === "online") {
    indicator.style.background = "green";
    indicator.textContent = "📡 الاتصال مباشر – يعمل 24/7";
  } else if(status === "stealth") {
    indicator.style.background = "blue";
    indicator.textContent = "🛩️ الاتصال مستمر – وضع التخفي";
  } else if(status === "offline") {
    indicator.style.background = "red";
    indicator.textContent = "❌ انقطاع الاتصال";
  }
}

// زر الطائرة الشبح (تأثير التلاشي الذري)
function activateStealthJet(mode = "medium") {
  console.log("🛩️ زر الطائرة الشبح مفعل – الجهاز يشوش على الرادارات.");
  atomicFadeIn();
  spoofRadarSignals(mode);
  changeDigitalIdentity();
  setBroadcastStatus("stealth");
}

function atomicFadeIn() {
  console.log("✨ تأثير التلاشي الذري – الذرات تتجمع لتشكّل الطائرة.");
}

function spoofRadarSignals(mode) {
  console.log(`📡 إرسال إشارات وهمية – مستوى التشويش: ${mode}`);
}

function changeDigitalIdentity() {
  console.log("👤 تغيير البصمة الرقمية – IP و Device ID متجددة.");
}

// زر الطوارئ الذكي
function userEmergencyPress(batteryLevel, threatDetected) {
  console.log("🚨 المستخدم ضغط زر الطوارئ!");

  // أول خطوة: زر الطائرة الشبح
  activateStealthJet();

  if(batteryLevel <= 1 || threatDetected) {
    shutdownDevice();
  } else {
    console.log("🔌 إغلاق محلي فقط – الجهاز طُفي بدون إنذار عالمي.");
    shutdownDevice();
  }
}

function shutdownDevice() {
  console.log("🔌 الجهاز مغلق – كأنه تلفون طُفي.");
}

// زر الطوارئ بالرسائل المباشرة والأقمار الصناعية
function emergencySOS(userNumbers, customMessage) {
  console.log("🚨 زر الطوارئ مفعل – فتح خط مباشر مع الأقمار الصناعية.");

  // تحديد الموقع
  const location = getSatelliteLocation();

  // رقم الأمن
  const securityNumber = "+967123456789"; 
  sendDistressSignal(securityNumber, customMessage, location);

  // إرسال إلى الأرقام اللي يختارها الشخص
  userNumbers.forEach(num => {
    sendDistressSignal(num, customMessage, location);
  });

  // تفعيل التخفي
  activateStealthJet("strong");

  // إشارة بصرية
  showGoldenShield();
}

function getSatelliteLocation() {
  return "15.3694°N, 44.1910°E"; // مثال: صنعاء
}

function sendDistressSignal(phoneNumber, message, location) {
  console.log(`📡 إرسال إلى ${phoneNumber}: ${message} – موقعي: ${location}`);
}

function showGoldenShield() {
  console.log("✨ درع ذهبي ظهر على الشاشة – الرسائل أُرسلت.");
}

// قسط مود – تقسيم الموارد
function qistMode(batteryLevel, processes) {
  console.log("⚡ قسط مود مفعل – تقسيم الموارد الذكي");

  if(batteryLevel <= 5) {
    console.log("🔋 البطارية منخفضة – تقليل استهلاك العمليات");
    processes.forEach(p => p.reduceLoad());
  } else {
    console.log("🚀 النظام يعمل بكامل الطاقة – توزيع متوازن");
  }
}
