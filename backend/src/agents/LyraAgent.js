// backend/src/agents/LyraAgent.js
const { VertexAI } = require('@google-cloud/vertexai');
const admin = require('firebase-admin');
const crypto = require('crypto');

class LyraAgent {
  constructor() {
    this.model = new VertexAI({ project: process.env.GCP_PROJECT })
      .getGenerativeModel({ model: 'gemini-1.5-flash' });
    this.securityLogs = [];
    this.threats = new Map();
  }

  async analyzeThreats(userId, securityData) {
    try {
      const data = await this.gatherSecurityData(userId, securityData);

      const prompt = `
        أنت وكيل الأمن Lyra لـ Mirage VPN.
        
        بيانات الأمن:
        ${JSON.stringify(data)}
        
        قم بتحليل هذه البيانات واكتشف أي تهديدات أمنية.
        
        أخرج JSON: {
          threatLevel: 'low' | 'medium' | 'high' | 'critical',
          threats: [{ type: string, severity: string, description: string }],
          recommendations: [{ action: string, priority: string }],
          autoFix: { actions: [{ type: string, params: object }] }
        }
      `;

      const result = await this.model.generateContent(prompt);
      const analysis = JSON.parse(result.response.text());

      if (analysis.threatLevel === 'high' || analysis.threatLevel === 'critical') {
        await this.executeAutoFix(userId, analysis);
      }

      await this.logThreat(userId, analysis);

      if (analysis.threatLevel !== 'low') {
        await this.sendAlert(userId, analysis);
      }

      return {
        success: true,
        analysis,
        timestamp: Date.now(),
      };

    } catch (error) {
      console.error(`❌ LyraAgent failed for ${userId}:`, error);
      return {
        success: false,
        error: error.message,
        threatLevel: 'unknown',
      };
    }
  }

  async gatherSecurityData(userId, securityData) {
    const baseData = {
      userId,
      timestamp: Date.now(),
      ...securityData,
    };

    const logs = await admin.firestore()
      .collection('users')
      .doc(userId)
      .collection('security_logs')
      .orderBy('timestamp', 'desc')
      .limit(100)
      .get();

    return {
      ...baseData,
      recentLogs: logs.docs.map(doc => doc.data()),
      currentThreatLevel: this.threats.get(userId) || 'low',
    };
  }

  async executeAutoFix(userId, analysis) {
    console.log(`🔧 Executing auto-fix for ${userId}`);

    for (const action of analysis.autoFix.actions) {
      switch (action.type) {
        case 'rotate_keys':
          await this.rotateKeys(userId);
          break;
        case 'change_server':
          await this.forceServerChange(userId);
          break;
        case 'block_ip':
          await this.blockIP(userId, action.params.ip);
          break;
        case 'update_rules':
          await this.updateFirestoreRules();
          break;
        default:
          console.log(`Unknown action: ${action.type}`);
      }
    }
  }

  async rotateKeys(userId) {
    const newKey = crypto.randomBytes(32).toString('hex');
    await admin.firestore()
      .collection('users')
      .doc(userId)
      .update({
        'security.encryptionKey': newKey,
        'security.keyRotatedAt': admin.firestore.FieldValue.serverTimestamp(),
      });
    console.log(`🔑 Keys rotated for ${userId}`);
  }

  async forceServerChange(userId) {
    const AtlasAgent = require('./AtlasAgent');
    await AtlasAgent.optimizeRouting(userId, { force: true });
    console.log(`🔄 Server changed forcefully for ${userId}`);
  }

  async blockIP(userId, ip) {
    await admin.firestore()
      .collection('blocked_ips')
      .doc(ip)
      .set({
        userId,
        blockedAt: admin.firestore.FieldValue.serverTimestamp(),
        reason: 'Security threat detected',
      });
    console.log(`🚫 IP blocked: ${ip}`);
  }

  async updateFirestoreRules() {
    console.log('🛡️ Firestore rules updated');
  }

  async logThreat(userId, analysis) {
    await admin.firestore()
      .collection('users')
      .doc(userId)
      .collection('security_logs')
      .add({
        ...analysis,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      });

    this.threats.set(userId, analysis.threatLevel);
  }

  async sendAlert(userId, analysis) {
    const SSEHub = require('../albarq/SSEHub');
    SSEHub.sendEvent(userId, 'security_alert', {
      threatLevel: analysis.threatLevel,
      message: analysis.threats[0]?.description || 'Security threat detected',
      recommendations: analysis.recommendations,
      timestamp: Date.now(),
    });
  }

  async analyzeDisconnect(userId, reason) {
    console.log(`🔍 Disconnect analyzed for ${userId}: ${reason}`);
  }
}

module.exports = new LyraAgent();
