import axios from 'axios';

// إعدادات الاتصال بالسيرفر السحابي (Google Cloud)
// في بيئة التطوير المحلية، نستخدم مسار الـ API المباشر
const API_BASE_URL = "/api/v1";
// هذا المفتاح يجب أن يتطابق مع ما تم تشفيره في الباك إند
const SENTINEL_KEY = "Mirage_Samurai_Execute_2026_Secure"; 

const mirageAPI = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'X-Admin-Sentinel-Key': SENTINEL_KEY // إرسال المفتاح في الهيدر لتجاوز الحماية
  }
});

// وظيفة استدعاء "أمر التصفير الشامل"
export const triggerKillSwitch = async () => {
  try {
    // نستخدم المسار الصحيح الذي قمنا بتعريفه في الباك إند
    const response = await mirageAPI.post('/admin/kill-switch');
    return response.data;
  } catch (error) {
    console.error("فشل في تنفيذ الأمر: وصول غير مصرح به أو خطأ في السيرفر", error);
    throw error;
  }
};

// وظيفة استدعاء حالة النظام
export const getSystemStatus = async () => {
  try {
    const response = await mirageAPI.get('/admin/status');
    return response.data;
  } catch (error) {
    console.error("فشل في جلب حالة النظام", error);
    throw error;
  }
};

// وظيفة أوامر الذكاء الاصطناعي 
export const executeCommand = async (command: string) => {
  try {
    const response = await mirageAPI.post('/execute-command', { command });
    return response.data;
  } catch (error) {
    console.error("فشل في إرسال الأمر للذكاء الاصطناعي", error);
    throw error;
  }
};
