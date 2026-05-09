<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/bcb453ba-6aee-456b-bfd3-e2c49efa1fb0

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
⚡ AlBarq_2026

لوحة تحكم موحدة تجمع بين التقنية والخيال، حيث البرق يضيء الطريق والذكاء يصنع الانسجام.  

---

🌍 Overview
Mirage Tactical هو مشروع حديث يهدف إلى بناء Dashboard عالمي يشمل:
- VPN مع اختيار خوادم ذكي مدعوم بالذكاء الاصطناعي.
- دعم اللغات العالمية (العربية، الإنجليزية، التركية، الفرنسية).
- قسم ألعاب شبابية (PUBG, Free Fire, Fortnite, FIFA, Call of Duty).
- إدارة الاشتراكات والدفع مع رسوم سنوية تنافسية ($49.5).
- fallback عبر الأقمار الصناعية (اليابانية، السعودية، الروسية، التركية، الصينية).
- قسم إدارة العملاء مع دردشة مباشرة مدعومة بالذكاء الاصطناعي.
- إنشاء صور بالذكاء الاصطناعي (Gemini/Google AI Studio) مرتبط بالمكافآت ومشاهدة الفيديوهات.
- تكامل مع GitHub, Firebase, Google AI Studio.
- نشر عالمي متعدد المناطق لضمان الأداء العالي وانخفاض زمن الاستجابة.

---

🛠 Components
- Frontend: Firebase Hosting (Glass/Neon UI).
- Backend: Cloud Run (خدمات ذكية).
- Database: Firestore (مزامنة عالمية).
- CI/CD: خطوط نشر آلية موحدة عبر GitHub Actions و Cloud Build.
- Gamification: ساعات مجانية عبر مشاهدة الفيديو + مكافآت الصور.
- Customer Management: دردشة مباشرة + إصلاح تلقائي.

---

🚀 Usage
1. استنسخ المستودع:
   `bash
   git clone https://github.com/AlBarq_2026.git
   cd AlBarq_2026
   `
2. إعداد المتغيرات السرية (Secrets) في GitHub:
   - FIREBASE_TOKEN
   - GOOGLECLOUDKEY
   - GITHUB_TOKEN
3. تشغيل الـ CI/CD عبر push:
   `bash
   git add .
   git commit -m "Initial commit for AlBarq_2026"
   git push origin main
   `
4. متابعة النشر عبر Firebase Hosting و Cloud Run.

---

📦 Dependencies
- Node.js (v18+)
- Firebase CLI
- Google Cloud SDK
- WireGuard (VPN integration)
- GitHub Actions
- Cloud Build

---

🔄 CI/CD Workflow

Frontend (Firebase Hosting)
- بناء المشروع.
- نشر تلقائي عند كل push.

Backend (Cloud Run)
- بناء Docker image.
- نشر الخدمة عالميًا.

Database (Firestore)
- ترحيل البيانات.
- مزامنة متعددة المناطق.

Global Publishing
- نشر تلقائي عبر مناطق متعددة (US, Europe, Asia).
- تحسين الأداء وزمن الاستجابة.

---

📉 Current Gaps
- تحسين هيكل الملفات لتفادي الأخطاء المتكررة.
- إضافة وحدة اختبار آلي (Unit Tests).
- تحسين تجربة المستخدم في قسم الألعاب.
- دعم إضافي للغات مستقبلًا (مثلاً الإسبانية).
- تكامل أوسع مع أنظمة دفع عالمية.

---

🌟 Future Requirements
- إضافة رسوم بيانية مالية (Line/Pie) داخل لوحة التحكم.
- دعم الذكاء الاصطناعي في اختيار الخوادم بشكل أوسع.
- تحسين fallback عبر الأقمار الصناعية.
- تطوير قسم الصور بالذكاء الاصطناعي ليكون أكثر تفاعلية.
- تعزيز التكامل مع أنظمة دعم العملاء.

---

🎶 خاتمة موسيقية – Twinkle Star

Twinkle, twinkle, little star,  
How I wonder what you are!  
Up above the world so high,  
Like a diamond in the sky.  

✨ تلألئي يا نجمة صغيرة،  
كم أتساءل ما أنتِ يا منيرة!  
فوق العالم عاليًا في السماء،  
كألماسة تتلألأ بالضياء.  

⚡ كل ومضة نشر هي نغمة، وكل كلمة نجمة… معًا نصنع السيمفونية.
`
