// backend/src/albarq/SSEHub.js
const admin = require('firebase-admin');

class SSEHub {
  constructor() {
    this.clients = new Map();
    this.eventListeners = new Map();
  }

  createConnection(userId, res) {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    });

    this.clients.set(userId, {
      res,
      connectedAt: Date.now(),
      lastEventId: 0,
      heartbeatInterval: setInterval(() => {
        this.sendHeartbeat(userId);
      }, 30000),
    });

    this.sendEvent(userId, 'connected', {
      message: 'SSE connection established',
      timestamp: Date.now(),
    });

    req.on('close', () => {
      this.closeConnection(userId);
    });

    console.log(`✅ SSE connection established for user: ${userId}`);
  }

  sendEvent(userId, eventType, data) {
    const client = this.clients.get(userId);
    if (!client) return false;

    const eventId = ++client.lastEventId;
    const payload = {
      id: eventId,
      type: eventType,
      data: data,
      timestamp: Date.now(),
    };

    try {
      client.res.write(`id: ${eventId}\n`);
      client.res.write(`event: ${eventType}\n`);
      client.res.write(`data: ${JSON.stringify(payload)}\n\n`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to send event to ${userId}:`, error);
      this.closeConnection(userId);
      return false;
    }
  }

  sendHeartbeat(userId) {
    this.sendEvent(userId, 'heartbeat', {
      timestamp: Date.now(),
      status: 'alive',
    });
  }

  broadcast(eventType, data) {
    const results = [];
    for (const [userId, client] of this.clients) {
      const success = this.sendEvent(userId, eventType, data);
      results.push({ userId, success });
    }
    return results;
  }

  closeConnection(userId) {
    const client = this.clients.get(userId);
    if (client) {
      clearInterval(client.heartbeatInterval);
      try {
        client.res.end();
      } catch (e) {}
      this.clients.delete(userId);
      console.log(`🔌 SSE connection closed for user: ${userId}`);
    }
  }

  getStats() {
    return {
      totalConnections: this.clients.size,
      users: Array.from(this.clients.keys()),
    };
  }
}

module.exports = new SSEHub();
