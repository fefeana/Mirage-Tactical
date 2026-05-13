import { db } from '../firebase';
import { collection, onSnapshot, doc, setDoc, query } from 'firebase/firestore';

export interface TranslationModel {
  input: string;
  lang: string;
}

export class AIEngine {
  updateTranslation(input: string, lang: string) {
    console.log(`[AI Engine] يتعامل مع النص: "${input}" للغة: "${lang}"`);
    // Here we can perform translation or real-time update logic
  }
}

export class AppDatabaseManager {
  private aiEngine: AIEngine;
  private unsubscribe: (() => void) | null = null;

  constructor(aiEngine: AIEngine) {
    this.aiEngine = aiEngine;
  }

  // تغذية البيانات للـ AI بشكل مستمر
  startRealtimeFeed() {
    const q = query(collection(db, 'translations'));
    
    this.unsubscribe = onSnapshot(q, (snapshots) => {
      snapshots.forEach((doc) => {
        if (doc.exists()) {
          const data = doc.data() as TranslationModel;
          if (data.input && data.lang) {
            // إرسال البيانات مباشرة للـ AI
            this.aiEngine.updateTranslation(data.input, data.lang);
          }
        }
      });
    }, (error) => {
      console.error("خطأ في التحديث:", error);
    });
  }

  stopRealtimeFeed() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
  }

  // إضافة أو تعديل البيانات بشكل تلقائي
  async addOrUpdateData(input: string, lang: string) {
    try {
      const docRef = doc(db, 'translations', input);
      await setDoc(docRef, {
        input,
        lang
      });
      console.log(`[Database] تم تحديث: ${input} -> ${lang}`);
    } catch (e) {
      console.error("[Database] Error updating data: ", e);
    }
  }
}

// إنشاء نسخة واحدة عالمية للاستخدام في التطبيق
export const globalAIEngine = new AIEngine();
export const globalDBManager = new AppDatabaseManager(globalAIEngine);
