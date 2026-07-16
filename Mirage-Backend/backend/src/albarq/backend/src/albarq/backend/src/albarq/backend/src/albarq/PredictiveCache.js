// backend/src/albarq/PredictiveCache.js
const admin = require('firebase-admin');
const { VertexAI } = require('@google-cloud/vertexai');

class PredictiveCache {
  constructor() {
    this.cache = new Map();
    this.model = new VertexAI({ project: process.env.GCP_PROJECT })
      .getGenerativeModel({ model: 'gemini-1.5-flash' });
    this.CACHE_TTL = 300000;
  }

  async get(userId, key) {
    const cacheKey = `${userId}:${key}`;
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() < cached.expires) {
      console.log(`✅ Cache hit for ${cacheKey}`);
      return cached.data;
    }

    return null;
  }

  set(userId, key, data, ttl = this.CACHE_TTL) {
    const cacheKey = `${userId}:${key}`;
    this.cache.set(cacheKey, {
      data,
      expires: Date.now() + ttl,
      confidence: 0.8,
    });
  }

  setWithConfidence(userId, key, data, confidence, ttl = this.CACHE_TTL) {
    const cacheKey = `${userId}:${key}`;
    this.cache.set(cacheKey, {
      data,
      expires: Date.now() + ttl,
      confidence: Math.min(confidence, 1),
    });
  }

  async predictNextRequest(userId) {
    try {
      const history = await this.getUserHistory(userId);

      const prompt = `
        أنت نظام تخزين تنبؤي لـ AlBarqHub.
        
        تاريخ المستخدم (آخر 10 أحداث):
        ${JSON.stringify(history)}
        
        قم بتوقع الطلب التالي الذي سيطلبه المستخدم خلال 10 ثوانٍ.
        اختر من القائمة: switch_server, change_ui, check_speed, view_dashboard, change_settings
        
        أخرج JSON: { predictedCommand: string, confidence: number, reasoning: string }
      `;

      const result = await this.model.generateContent(prompt);
      const prediction = JSON.parse(result.response.text());

      if (prediction.confidence > 0.7) {
        const predictedData = await this.generatePredictedData(userId, prediction.predictedCommand);
        this.setWithConfidence(
          userId,
          `predicted:${prediction.predictedCommand}`,
          predictedData,
          prediction.confidence,
          this.CACHE_TTL
        );
        console.log(`🔮 Predicted ${prediction.predictedCommand} for ${userId}`);
      }

      return prediction;

    } catch (error) {
      console.error(`❌ Prediction failed for ${userId}:`, error);
      return null;
    }
  }

  async getUserHistory(userId) {
    try {
      const snapshot = await admin.firestore()
        .collection('users')
        .doc(userId)
        .collection('history')
        .orderBy('timestamp', 'desc')
        .limit(10)
        .get();

      return snapshot.docs.map(doc => doc.data());
    } catch (error) {
      return [];
    }
  }

  async generatePredictedData(userId, command) {
    switch (command) {
      case 'switch_server':
        return {
          servers: [
            { id: 'server-1', location: 'US', latency: 45, load: 60 },
            { id: 'server-2', location: 'EU', latency: 78, load: 40 },
            { id: 'server-3', location: 'ASIA', latency: 120, load: 20 },
          ],
          recommended: 'server-1',
        };
      case 'change_ui':
        return {
          themes: ['glass', 'dark', 'light', 'neon'],
          current: 'glass',
          available: true,
        };
      case 'check_speed':
        return {
          download: 85.5,
          upload: 12.3,
          ping: 34,
          timestamp: Date.now(),
        };
      default:
        return { message: 'No prediction available' };
    }
  }

  cleanExpired() {
    const now = Date.now();
    let count = 0;
    for (const [key, value] of this.cache) {
      if (now > value.expires) {
        this.cache.delete(key);
        count++;
      }
    }
    if (count > 0) {
      console.log(`🧹 Cleaned ${count} expired cache entries`);
    }
  }

  getStats() {
    const total = this.cache.size;
    const expired = Array.from(this.cache.values())
      .filter(v => Date.now() > v.expires).length;
    
    return {
      totalEntries: total,
      expiredEntries: expired,
      activeEntries: total - expired,
    };
  }
}

module.exports = new PredictiveCache();
