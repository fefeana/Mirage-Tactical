// backend/src/agents/VegaAgent.js
const { VertexAI } = require('@google-cloud/vertexai');
const admin = require('firebase-admin');

class VegaAgent {
  constructor() {
    this.model = new VertexAI({ project: process.env.GCP_PROJECT })
      .getGenerativeModel({ model: 'gemini-1.5-flash' });
    this.uiMemory = new Map();
  }

  async adaptUI(userId, context) {
    try {
      const preferences = await this.getUserPreferences(userId);
      
      const prompt = `
        أنت وكيل الواجهة Vega لـ Mirage VPN.
        
        سياق المستخدم:
        - الوقت: ${context.timeOfDay || 'unknown'}
        - سرعة الشبكة: ${context.networkSpeed || 'unknown'} Mbps
        - نوع الجهاز: ${context.deviceType || 'unknown'}
        - التفضيلات السابقة: ${JSON.stringify(preferences)}
        
        قم بتصميم واجهة Glassmorphism مثالية لهذا المستخدم.
        أخرج JSON: { 
          glassOpacity: number,
          primaryColor: string,
          secondaryColor: string,
          borderRadius: string,
          shadows: string,
          fontSize: string,
          layoutStyle: 'compact' | 'spacious' | 'dynamic',
          animationSpeed: 'fast' | 'normal' | 'slow'
        }
      `;

      const result = await this.model.generateContent(prompt);
      const design = JSON.parse(result.response.text());

      await this.saveDesign(userId, design);

      await admin.firestore()
        .collection('users')
        .doc(userId)
        .update({
          'ui.preferences': design,
          'ui.lastUpdated': admin.firestore.FieldValue.serverTimestamp(),
        });

      await this.pushUIUpdate(userId, design);

      return {
        success: true,
        design,
        applied: true,
      };

    } catch (error) {
      console.error(`❌ VegaAgent failed for ${userId}:`, error);
      return {
        success: false,
        error: error.message,
        fallback: this.getFallbackDesign(),
      };
    }
  }

  async getUserPreferences(userId) {
    try {
      const doc = await admin.firestore()
        .collection('users')
        .doc(userId)
        .get();
      return doc.data()?.ui?.preferences || {};
    } catch {
      return {};
    }
  }

  async saveDesign(userId, design) {
    this.uiMemory.set(userId, {
      ...design,
      timestamp: Date.now(),
    });
  }

  async pushUIUpdate(userId, design) {
    const SSEHub = require('../albarq/SSEHub');
    SSEHub.sendEvent(userId, 'ui_update', {
      design,
      timestamp: Date.now(),
    });
  }

  getFallbackDesign() {
    return {
      glassOpacity: 0.8,
      primaryColor: '#6C63FF',
      secondaryColor: '#00D4FF',
      borderRadius: '24px',
      shadows: '0 8px 32px rgba(0,0,0,0.18)',
      fontSize: '16px',
      layoutStyle: 'dynamic',
      animationSpeed: 'normal',
    };
  }

  async analyzeInteraction(userId, interaction) {
    await admin.firestore()
      .collection('users')
      .doc(userId)
      .collection('ui_interactions')
      .add({
        ...interaction,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      });
  }
}

module.exports = new VegaAgent();
