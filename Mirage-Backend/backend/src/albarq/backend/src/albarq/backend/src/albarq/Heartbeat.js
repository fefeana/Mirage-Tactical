// backend/src/albarq/Heartbeat.js
const admin = require('firebase-admin');

class HeartbeatSystem {
  constructor() {
    this.heartbeats = new Map();
    this.MAX_MISSED_PINGS = 3;
    this.CHECK_INTERVAL = 10000;
    this.startMonitoring();
  }

  startMonitoring() {
    setInterval(() => {
      this.checkHeartbeats();
    }, this.CHECK_INTERVAL);
  }

  registerHeartbeat(userId) {
    const heartbeat = this.heartbeats.get(userId) || {
      userId,
      lastHeartbeat: Date.now(),
      status: 'online',
      missedPings: 0,
      onlineSince: Date.now(),
      offlineSince: null,
    };

    heartbeat.lastHeartbeat = Date.now();
    heartbeat.status = 'online';
    heartbeat.missedPings = 0;
    heartbeat.offlineSince = null;

    this.heartbeats.set(userId, heartbeat);
    this.updateUserStatus(userId, 'online');
    console.log(`💓 Heartbeat received from ${userId}`);
  }

  checkHeartbeats() {
    const now = Date.now();
    const timeout = 30000;

    for (const [userId, heartbeat] of this.heartbeats) {
      const timeSinceLastHeartbeat = now - heartbeat.lastHeartbeat;
      
      if (timeSinceLastHeartbeat > timeout) {
        heartbeat.missedPings++;
        heartbeat.status = 'offline';
        heartbeat.offlineSince = now;

        if (heartbeat.missedPings >= this.MAX_MISSED_PINGS) {
          console.log(`🔴 User ${userId} is offline (${heartbeat.missedPings} missed pings)`);
          this.updateUserStatus(userId, 'offline');
          this.handleUserOffline(userId);
        } else {
          console.log(`⚠️ User ${userId} missed ping ${heartbeat.missedPings}`);
        }
      }
    }
  }

  async updateUserStatus(userId, status) {
    try {
      await admin.firestore()
        .collection('users')
        .doc(userId)
        .update({
          'status.online': status === 'online',
          'status.lastSeen': admin.firestore.FieldValue.serverTimestamp(),
          'status.lastHeartbeat': admin.firestore.FieldValue.serverTimestamp(),
        });
    } catch (error) {
      console.error(`❌ Failed to update status for ${userId}:`, error);
    }
  }

  async handleUserOffline(userId) {
    const vpnStatus = await this.getVPNStatus(userId);
    if (vpnStatus?.active) {
      await admin.firestore()
        .collection('users')
        .doc(userId)
        .collection('vpn_sessions')
        .doc('current')
        .update({
          endedAt: admin.firestore.FieldValue.serverTimestamp(),
          reason: 'connection_lost',
        });
    }

    const SecurityAgent = require('../agents/LyraAgent');
    await SecurityAgent.analyzeDisconnect(userId, 'connection_lost');
  }

  async getVPNStatus(userId) {
    try {
      const doc = await admin.firestore()
        .collection('users')
        .doc(userId)
        .get();
      return doc.data()?.vpn;
    } catch {
      return null;
    }
  }

  getStats() {
    const online = Array.from(this.heartbeats.values())
      .filter(h => h.status === 'online');
    const offline = Array.from(this.heartbeats.values())
      .filter(h => h.status === 'offline');

    return {
      totalUsers: this.heartbeats.size,
      online: online.length,
      offline: offline.length,
      users: {
        online: online.map(h => h.userId),
        offline: offline.map(h => h.userId),
      },
    };
  }
}

module.exports = new HeartbeatSystem();
