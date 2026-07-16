// backend/src/albarq/WebRTCServer.js
const wrtc = require('wrtc');
const admin = require('firebase-admin');

class WebRTCServer {
  constructor() {
    this.peerConnections = new Map();
    this.dataChannels = new Map();
    this.pendingMessages = new Map();
  }

  async createConnection(userId, offer) {
    try {
      const pc = new wrtc.RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
        ],
      });

      this.peerConnections.set(userId, pc);

      const dataChannel = pc.createDataChannel('albarq-channel', {
        ordered: true,
      });

      dataChannel.onopen = () => {
        console.log(`✅ Data channel opened for user: ${userId}`);
        this.dataChannels.set(userId, dataChannel);
        this.flushPendingMessages(userId);
      };

      dataChannel.onmessage = (event) => {
        this.handleMessage(userId, event.data);
      };

      dataChannel.onclose = () => {
        console.log(`🔌 Data channel closed for user: ${userId}`);
        this.dataChannels.delete(userId);
      };

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          this.sendCandidate(userId, event.candidate);
        }
      };

      await pc.setRemoteDescription(new wrtc.RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      return {
        sdp: pc.localDescription.sdp,
        type: pc.localDescription.type,
      };

    } catch (error) {
      console.error(`❌ WebRTC connection failed for ${userId}:`, error);
      throw error;
    }
  }

  sendMessage(userId, command, payload) {
    const dataChannel = this.dataChannels.get(userId);
    
    if (dataChannel && dataChannel.readyState === 'open') {
      const message = JSON.stringify({
        command,
        payload,
        timestamp: Date.now(),
      });
      dataChannel.send(message);
      return true;
    } else {
      if (!this.pendingMessages.has(userId)) {
        this.pendingMessages.set(userId, []);
      }
      this.pendingMessages.get(userId).push({ command, payload, timestamp: Date.now() });
      return false;
    }
  }

  flushPendingMessages(userId) {
    const pending = this.pendingMessages.get(userId) || [];
    const dataChannel = this.dataChannels.get(userId);
    
    if (dataChannel && dataChannel.readyState === 'open') {
      for (const msg of pending) {
        dataChannel.send(JSON.stringify(msg));
      }
      this.pendingMessages.delete(userId);
    }
  }

  handleMessage(userId, data) {
    try {
      const message = JSON.parse(data);
      console.log(`📨 Received message from ${userId}:`, message);

      switch (message.command) {
        case 'ping':
          this.sendMessage(userId, 'pong', { timestamp: Date.now() });
          break;
        case 'get_status':
          this.sendMessage(userId, 'status', {
            connected: true,
            timestamp: Date.now(),
          });
          break;
        default:
          this.routeCommand(userId, message);
      }
    } catch (error) {
      console.error(`❌ Error handling message from ${userId}:`, error);
    }
  }

  async routeCommand(userId, message) {
    const TranslationRouter = require('./TranslationRouter');
    const result = await TranslationRouter.translate({
      userId,
      command: message.command,
      payload: message.payload,
      timestamp: message.timestamp,
    });
    
    this.sendMessage(userId, 'command_result', result);
  }

  async sendCandidate(userId, candidate) {
    await admin.firestore()
      .collection('webrtc')
      .doc(userId)
      .collection('candidates')
      .add({
        candidate: candidate,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      });
  }

  closeConnection(userId) {
    const pc = this.peerConnections.get(userId);
    if (pc) {
      pc.close();
      this.peerConnections.delete(userId);
    }
    this.dataChannels.delete(userId);
    this.pendingMessages.delete(userId);
    console.log(`🔌 WebRTC connection closed for user: ${userId}`);
  }

  getStats() {
    return {
      totalConnections: this.peerConnections.size,
      activeChannels: this.dataChannels.size,
      pendingMessages: this.pendingMessages.size,
      users: Array.from(this.peerConnections.keys()),
    };
  }
}

module.exports = new WebRTCServer();
