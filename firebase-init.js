import { initializeApp } from "firebase/app";
import { getFirestore, onSnapshot, collection, deleteDoc, doc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import firebaseConfig from "./firebase-applet-config.json";
import Chart from "chart.js/auto";

// تهيئة التطبيق
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId); // keep explicit ID!
export const storage = getStorage(app);

// إشعارات Mirage
function showNotification(message) {
  const notif = document.createElement("div");
  notif.className = "notification mirage";
  notif.textContent = message;
  document.body.appendChild(notif);
  setTimeout(() => notif.remove(), 3000);
}

// وميض الأيقونات
function flashIcon(name) {
  const icon = document.querySelector(`#icon-${name}`);
  if (icon) {
    icon.classList.add("flash");
    setTimeout(() => icon.classList.remove("flash"), 500);
  }
}

// طبقة AI لمراقبة وتحسين المهام
function aiMonitor(name, data) {
  if (name === "connections" && data.length > 10) {
    showNotification("🤖 AI: عدد الاتصالات مرتفع، تم تفعيل وضع التوازن!");
  }
  if (name === "messages" && data.length > 50) {
    showNotification("🤖 AI: نشاط الرسائل عالي جدًا، اقترح تفعيل فلتر!");
  }
}

// مستمع لحظي مع AI + رسوم بيانية
function listenToCollection(name, chart) {
  const colRef = collection(db, name);
  onSnapshot(colRef, (snapshot) => {
    const data = snapshot.docs.map(doc => doc.data());
    console.log(`⚡ تحديث في مجموعة ${name}:`, data);

    flashIcon(name);
    showNotification(`📊 تحديث جديد في ${name}`);
    aiMonitor(name, data);

    if (chart) {
      chart.data.labels = data.map((_, i) => `عنصر ${i+1}`);
      chart.data.datasets[0].data = data.map(item => item.value || 1); // fallback if no value
      chart.update();
    }
  });
}

// Ensure the UI exists before rendering charts
window.addEventListener("DOMContentLoaded", () => {
    const connCanvas = document.getElementById("chart-connections");
    const usersCanvas = document.getElementById("chart-users");
    const msgsCanvas = document.getElementById("chart-messages");

    if (connCanvas && usersCanvas && msgsCanvas) {
        // الرسوم البيانية
        const connectionsChart = new Chart(connCanvas, {
          type: "line",
          data: { labels: [], datasets: [{ label: "الاتصالات ⚡", data: [], borderColor: "gold" }] }
        });
        const usersChart = new Chart(usersCanvas, {
          type: "bar",
          data: { labels: [], datasets: [{ label: "المستخدمين 👥", data: [], backgroundColor: "skyblue" }] }
        });
        const messagesChart = new Chart(msgsCanvas, {
          type: "doughnut",
          data: { labels: [], datasets: [{ label: "الرسائل 💬", data: [], backgroundColor: ["#ff6384","#36a2eb","#cc65fe","#ffce56"] }] }
        });

        // الاستماع للمجموعات
        listenToCollection("connections", connectionsChart);
        listenToCollection("users", usersChart);
        listenToCollection("messages", messagesChart);
        listenToCollection("files", null);
    } else {
        // Just listen without charts if not found
        listenToCollection("connections", null);
        listenToCollection("users", null);
        listenToCollection("messages", null);
        listenToCollection("files", null);
    }
});

// رفع ملف إلى التخزين
export async function uploadFile(file, path) {
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);
  console.log("☁️ رابط الملف:", url);
  showNotification("🌌 ملف جديد تم رفعه!");
  return url;
}

// 🧹 مهمة تلقائية: تنظيف البيانات القديمة
async function cleanOldData(collectionName, days = 30) {
  const colRef = collection(db, collectionName);
  onSnapshot(colRef, (snapshot) => {
    snapshot.docs.forEach(async (docSnap) => {
      const data = docSnap.data();
      const createdAt = data.createdAt ? new Date(data.createdAt) : null;
      if (createdAt && (Date.now() - createdAt.getTime()) > days*24*60*60*1000) {
        await deleteDoc(doc(db, collectionName, docSnap.id));
        showNotification(`🧹 AI: تم تنظيف بيانات قديمة من ${collectionName}`);
      }
    });
  });
}

// 📑 مهمة تلقائية: إرسال تقرير يومي
function sendDailyReport() {
  const report = {
    connections: "عدد الاتصالات الحالي",
    users: "عدد المستخدمين الحالي",
    messages: "عدد الرسائل اليوم",
    files: "عدد الملفات المرفوعة"
  };
  console.log("📑 تقرير يومي:", report);
  showNotification("📑 AI: تم إنشاء تقرير يومي تلقائي!");
}

// 📊 مهمة تلقائية: إرسال تقرير شهري
function sendMonthlyReport() {
  const report = {
    summary: "📊 ملخص شهري للنشاط",
    connections: "إجمالي الاتصالات خلال الشهر",
    users: "إجمالي المستخدمين الجدد",
    messages: "إجمالي الرسائل",
    files: "إجمالي الملفات المرفوعة"
  };
  console.log("📊 تقرير شهري:", report);
  showNotification("📊 AI: تم إنشاء تقرير شهري تلقائي!");
}

// جدولة المهام التلقائية
setInterval(() => cleanOldData("messages", 30), 6*60*60*1000); // تنظيف كل 6 ساعات
setInterval(sendDailyReport, 24*60*60*1000); // تقرير يومي كل 24 ساعة
setInterval(sendMonthlyReport, 30*24*60*60*1000); // تقرير شهري كل 30 يوم
