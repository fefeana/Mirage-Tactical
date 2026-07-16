// backend/src/albarq/TranslationRouter.js
const { VertexAI } = require('@google-cloud/vertexai');

class TranslationRouter {
  constructor() {
    this.vertexAI = new VertexAI({ 
      project: process.env.GCP_PROJECT || 'mirage-project',
    });
    this.model = this.vertexAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
    });
  }

  async translate(request) {
    const { userId, command, payload, timestamp, context } = request;

    try {
      const intent = await this.analyzeIntent(command, payload, context);
      const agent = this.selectAgent(intent);
      const translatedCommand = await this.translateCommand(intent, payload, agent);

      await this.logTranslation(userId, {
        original: { command, payload },
        intent,
        agent,
        translated: translatedCommand,
        timestamp,
      });

      return {
        success: true,
        intent,
        agent,
        command: translatedCommand,
        timestamp: Date.now(),
      };

    } catch (error) {
      console.error(`❌ Translation failed for ${userId}:`, error);
      return {
        success: false,
        error: error.message,
        fallback: this.getFallbackCommand(command, payload),
      };
    }
  }

  async analyzeIntent(command, payload, context) {
    const prompt = `
      أنت جهاز توجيه ترجمة AlBarqHub.
      
      الأمر الأصلي: ${command}
      البيانات: ${JSON.stringify(payload)}
      السياق: ${JSON.stringify(context || {})}
      
      قم بتحليل نية المستخدم واختر من القائمة التالية:
      - ui_update: تغيير الواجهة
      - network_optimize: تحسين الشبكة
      - security_check: فحص أمني
      - config_change: تغيير إعدادات
      - analytics: تحليل بيانات
      - support: دعم فني
      
      أخرج JSON فقط: { intent: string, confidence: number, reasoning: string }
    `;

    const result = await this.model.generateContent(prompt);
    const response = result.response.text();
    
    try {
      return JSON.parse(response);
    } catch {
      return {
        intent: 'unknown',
        confidence: 0,
        reasoning: 'Failed to parse AI response, using fallback',
      };
    }
  }

  selectAgent(intent) {
    const agentMap = {
      'ui_update': 'VegaAgent',
      'network_optimize': 'AtlasAgent',
      'security_check': 'LyraAgent',
      'config_change': 'MasterKernel',
      'analytics': 'NexusAgent',
      'support': 'NexusAgent',
      'unknown': 'MasterKernel',
    };

    return agentMap[intent.intent] || 'MasterKernel';
  }

  async translateCommand(intent, payload, agent) {
    const prompt = `
      أنت مترجم أوامر AlBarqHub.
      
      النية: ${intent.intent}
      البيانات: ${JSON.stringify(payload)}
      الوكيل المستهدف: ${agent}
      
      قم بترجمة هذا الأمر إلى صيغة مفهومة للوكيل.
      الصيغة المطلوبة: { action: string, params: object, priority: string }
    `;

    const result = await this.model.generateContent(prompt);
    const response = result.response.text();
    
    try {
      return JSON.parse(response);
    } catch {
      return {
        action: intent.intent,
        params: payload || {},
        priority: 'normal',
      };
    }
  }

  getFallbackCommand(command, payload) {
    return {
      action: command,
      params: payload || {},
      priority: 'low',
      fallback: true,
    };
  }

  async logTranslation(userId, log) {
    try {
      const admin = require('firebase-admin');
      await admin.firestore()
        .collection('translations')
        .add({
          userId,
          ...log,
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
        });
    } catch (error) {
      console.error('Failed to log translation:', error);
    }
  }
}

module.exports = new TranslationRouter();
