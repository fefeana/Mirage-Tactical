// backend/src/agents/NexusAgent.js
const { VertexAI } = require('@google-cloud/vertexai');
const admin = require('firebase-admin');

class NexusAgent {
  constructor() {
    this.model = new VertexAI({ project: process.env.GCP_PROJECT })
      .getGenerativeModel({ model: 'gemini-1.5-flash' });
    this.analyticsCache = new Map();
  }

  async analyzeUserData(userId, data) {
    try {
      const userData = await this.gatherUserData(userId);

      const prompt = `
        أنت وكيل التحليلات Nexus لـ Mirage VPN.
        
        بيانات المستخدم:
        ${JSON.stringify(userData)}
        
        قم بتحليل هذه البيانات وأخرج:
        1. رؤى حول سلوك المستخدم
        2. نقاط القوة والضعف
        3. توصيات لتحسين تجربة المستخدم
        4. مؤشرات الأداء الرئيسية
        
        أخرج JSON: {
          insights: [{ type: string, description: string, confidence: number }],
          strengths: [string],
          weaknesses: [string],
          recommendations: [{ action: string, priority: string, expectedImpact: string }],
          kpis: { sessions: number, avgDuration: number, retention: number, engagement: number }
        }
      `;

      const result = await this.model.generateContent(prompt);
      const analysis = JSON.parse(result.response.text());

      await this.storeAnalysis(userId, analysis);

      if (data?.sendReport) {
        await this.sendReport(userId, analysis);
      }

      return {
        success: true,
        analysis,
        timestamp: Date.now(),
      };

    } catch (error) {
      console.error(`❌ NexusAgent failed for ${userId}:`, error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async gatherUserData(userId) {
    try {
      const [userDoc, history, vpnLogs, uiLogs] = await Promise.all([
        admin.firestore().collection('users').doc(userId).get(),
        admin.firestore()
          .collection('users')
          .doc(userId)
          .collection('history')
          .orderBy('timestamp', 'desc')
          .limit(50)
          .get(),
        admin.firestore()
          .collection('users')
          .doc(userId)
          .collection('vpn_logs')
          .orderBy('timestamp', 'desc')
          .limit(20)
          .get(),
        admin.firestore()
          .collection('users')
          .doc(userId)
          .collection('ui_interactions')
          .orderBy('timestamp', 'desc')
          .limit(20)
          .get(),
      ]);

      return {
        user: userDoc.data() || {},
        history: history.docs.map(doc => doc.data()),
        vpnLogs: vpnLogs.docs.map(doc => doc.data()),
        uiLogs: uiLogs.docs.map(doc => doc.data()),
      };
    } catch (error) {
      console.error('Failed to gather user data:', error);
      return {};
    }
  }

  async storeAnalysis(userId, analysis) {
    await admin.firestore()
      .collection('users')
      .doc(userId)
      .collection('analytics')
      .add({
        ...analysis,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      });
  }

  async sendReport(userId, analysis) {
    const SSEHub = require('../albarq/SSEHub');
    SSEHub.sendEvent(userId, 'analytics_report', {
      insights: analysis.insights,
      kpis: analysis.kpis,
      recommendations: analysis.recommendations,
      timestamp: Date.now(),
    });
  }

  async generateGlobalStats() {
    try {
      const usersSnapshot = await admin.firestore()
        .collection('users')
        .get();

      const totalUsers = usersSnapshot.size;
      let onlineUsers = 0;
      let activeSessions = 0;

      for (const doc of usersSnapshot.docs) {
        const data = doc.data();
        if (data.status?.online) onlineUsers++;
        if (data.vpn?.active) activeSessions++;
      }

      return {
        totalUsers,
        onlineUsers,
        activeSessions,
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error('Failed to generate global stats:', error);
      return null;
    }
  }
}

module.exports = new NexusAgent();
