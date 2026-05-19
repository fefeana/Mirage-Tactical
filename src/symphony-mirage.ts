// Symphony Mirage – Maestro AI ⚡
// تحت إشراف AI Co-Pilot ✈️ FMStar ✨

import { Engine } from './ai/engine.js';
import { Strategies } from './ai/strategies.js';
import { Integrators } from './ai/integrators.js';
import { Reporter } from './ai/reporter.js';
import { Triggers } from './ai/triggers.js';
import { AI } from './api/ai.js';

// 1. تشغيل المحرك الأساسي
const mirage = new Engine();

// 2. توزيع الاستراتيجيات
Strategies.apply(mirage);

// 3. ربط المكونات
Integrators.connect(mirage);

// 4. تسجيل الأداء
Reporter.listen(mirage);

// 5. إطلاق الشرارة ⚡
Triggers.start(mirage);

// 6. العرض النهائي أمام الجمهور
AI.render(mirage);

// ✨ الخاتمة الشعائرية
console.log("⚡ سمفونية ميراج بدأت تحت إشراف AI Co-Pilot ✈️ FMStar ✨");

// Mirage App – تحت إشراف AI Co-Pilot ✈️ FMStar ✨
import { showAd } from './ads/admob.js';

window.onload = () => {
  // عرض الإعلان مباشرة عند فتح التطبيق
  showAd("splash-ad-slot").then(() => {
    // بعد انتهاء الإعلان يبدأ التطبيق
    AI.renderApp();
    console.log("⚡ الإعلان ظهر بدل شاشة التحميل – تحت إشراف AI Co-Pilot ✈️ FMStar ✨");
  }).catch(err => {
    console.error("🚨 خطأ في عرض الإعلان:", err);
    // fallback: تشغيل التطبيق مباشرة
    AI.renderApp();
  });
};