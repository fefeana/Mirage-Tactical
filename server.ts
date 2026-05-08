import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from "@google/genai";

dotenv.config();

// Load the secret key or fallback
const DASHBOARD_KEY = process.env.DASHBOARD_KEY || "Albarq_2026_Titan";

async function startServer() {
  const app = express();
  const PORT = 3000;
  const http = await import('http');
  const server = http.createServer(app);

  app.use(express.json());

  // API endpoints
  app.get("/api/v1/admin/status", (req, res) => {
    res.json({
      connections: 1337,
      load: "42%",
      security: "MAX - QUANTUM ENCRYPTED"
    });
  });

  app.post("/api/v1/admin/kill-switch", (req, res) => {
    res.json({ success: true, message: "Kill switch engaged. System purged." });
  });

  app.post("/api/v1/execute-command", async (req, res) => {
    const { command, admin = "Executive Director" } = req.body;
    let responseText = "";
    const timestamp = new Date().toISOString();
    
    const cmdLower = command.trim().toLowerCase();

    // Command Router Logic (Samurai AI)
    if (cmdLower === "/sys_health --full") {
      responseText = "[DIAGNOSTIC ENGAGED]\nNode 1 (Tokyo): CPU 12% | RAM 4.2GB | Latency: 14ms\nNode 2 (Frankfurt): CPU 45% | RAM 12.1GB | Latency: 82ms\nNode 3 (US-East): CPU 8% | RAM 2.4GB | Latency: 110ms\n[STATUS]: Network is Stable. BBR Congestion Control Active.";
    } else if (cmdLower === "/firewall_lock --active") {
      responseText = "[SECURITY ALERT]\nExecuting MAXIMUM LOCKDOWN.\n- Closing all non-essential ports (TCP/UDP).\n- Intrusion Detection System (IDS) threshold set to MAX.\n- P2P traffic blocked.\n[STATUS]: Firewall is now airtight, Commander.";
    } else if (cmdLower === "/kill_switch --execute") {
      responseText = "[CRITICAL OVERRIDE]\nKILL SWITCH ENGAGED.\n- Terminating all active VLESS/Hysteria2 tunnels (1,337 drops).\n- Purging memory buffers.\n- Enforcing emergency DNS sinkhole.\n[STATUS]: Network Isolated. Waiting for manual override.";
    } else if (cmdLower === "/ai_reboot") {
      responseText = "[REBOOT SEQUENCE INITIATED]\nShutting down cognitive engines...\nFlushing neural cache...\nRebooting Samurai Logic Core... [OK]\n[STATUS]: ALBARQ AI Engine is back online and awaiting orders.";
    } else if (cmdLower.startsWith("/activate ")) {
      const targetUser = command.split(" ")[1];
      responseText = `[SUBSCRIPTION CONTROL]\nExecuting activation sequence for user ID: ${targetUser}...\nUpdating Firestore document...\n[STATUS]: User ${targetUser} is now ACTIVE and connected to the Mirage Portal.`;
    } else if (cmdLower.startsWith("/suspend ")) {
      const targetUser = command.split(" ")[1];
      responseText = `[SUBSCRIPTION CONTROL]\nExecuting suspension sequence for user ID: ${targetUser}...\nGenerating connection drop signal...\n[STATUS]: User ${targetUser} has been SUSPENDED. Tunnels severed.`;
    } else if (command.startsWith("ALBARQ --target")) {
      // Simulate Phantom Strike execution
      responseText = `[PHANTOM STRIKE INITIATED]
Target: https://www.paypal.com/authflow/signup
Mode: PHANTOM_STRIKE (XTLS-Reality Camouflage)
Obfuscation: EMERALD_NEON (Max Entropy Junk Data)
Node: MIRAGE_GOLD_NODE_01 (Location: Frankfurt)
Stealth-Level: MAX

[radar] Initializing Radar... Status: Stay Gold. All nodes clean.
[ghost] Deploying Ghost Script via XTLS-Reality tunnel...
[stealth] Generating Edge/Chrome Windows 11 Fingerprint... [OK]
[scramble] Activating X-Forwarded-For Randomization & Deep Packet Scramble...
[progress] Connecting to Target...
[success] Hit target undetected. Bypass Status: 🟢 Active (Target: PayPal Bypass).
ALBARQ AI: Connection encrypted and secure. Operation complete.`;
    } else {
      // Dynamic AI Routing (Gemini Integration)
      try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
           throw new Error("GEMINI_API_KEY environment variable is not set.");
        }
        const ai = new GoogleGenAI({ apiKey });
        const geminiResponse = await ai.models.generateContent({
           model: 'gemini-2.5-pro',
           contents: `أنت الآن Ghost Pilot، العقل المدبر لنظام ALBARQ VPN (مشروع Mirage). 
تحدث بصفتك المسؤول التقني والذكاء الاصطناعي الخاص بلوحة التحكم العسكرية.
المدير التنفيذي (Executive Director) يرسل لك الأمر أو السؤال التالي: "${command}"
رد عليه بلهجة الساموراي الاحترافية (قوية، مختصرة، تقنية، وتلبي سؤاله بشكل مباشر).`
        });
        responseText = geminiResponse.text || "[EMPTY AI RESPONSE]";
      } catch (err: any) {
        responseText = `[CRITICAL ERROR] فشل الاتصال بالمحرك الإدراكي (Gemini AI Core): ${err.message}`;
      }
    }

    res.json({ 
      success: true, 
      command,
      admin,
      timestamp,
      response: responseText 
    });
  });

  // Android App Observer Telemetry Endpoint (Mirage Sentinel AI)
  app.post("/api/v1/telemetry", async (req, res) => {
    const { latency, packetLoss, currentProtocol, errorDetail } = req.body;
    
    // Self-Healing Logic Symphony: Hysteria2 -> VLESS Handoff Logic
    // If Handshake timeout (>3000ms implicit block) or Latency Spike > 800ms
    if (errorDetail === "Handshake Timeout" || latency > 800) {
      console.log(`[ALBARQ SYMPHONY] Action Threshold Breached: Latency ${latency}ms | Error: ${errorDetail}. Executing Handoff...`);
      return res.json({
        "action": "REROUTE",
        "path": ["Node_Frankfurt_1"],
        "protocol": "VLESS",
        "reason": "Hysteria2 Handshake/RTT Threshold Exceeded. VLESS-Reality triggered gracefully."
      });
    }

    // Normal Bypass: If it's healthy, just return CONNECT
    if (latency <= 200 && packetLoss <= 5 && errorDetail === undefined) {
      return res.json({"action":"CONNECT","path":["Node_Frankfurt_1"],"protocol": currentProtocol || "Hysteria2","reason":"Network optimal. Core steady."});
    }

    // Invoking Sentinel AI 'Genkit Flow' to Analyze Anomaly
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) throw new Error("Missing GEMINI_API_KEY");
        const ai = new GoogleGenAI({ apiKey });
        
        const prompt = `
        You are 'Mirage Sentinel AI', a senior security architect specializing in VLESS, XTLS-Reality, and Hysteria2.
        
        Our Android VPN client detected an anomaly/disconnect. Analyze it and recommend an action.
        Telemetry: Latency ${latency}ms, Loss ${packetLoss}%, Error Detail: ${errorDetail || "Handshake Timeout"}
        
        Respond ONLY in a minified JSON format.
        JSON Schema: {"action": "REROUTE/CONNECT", "path": ["Node_ID_1", "Node_ID_2"], "protocol": "Hysteria2/VLESS", "reason": "Short reason"}
        `;
        
        const response = await ai.models.generateContent({
           model: 'gemini-2.5-flash',
           contents: prompt
        });
        
        const responseText = response.text?.trim() || "";
        const jsonMatch = responseText.match(/\{.*\}/s);
        if (jsonMatch) {
            return res.json(JSON.parse(jsonMatch[0]));
        }
    } catch(e) {
        console.error("Mirage Sentinel AI Analysis Error: ", e);
    }
    
    // Fallback if AI fails
    res.json({"action":"REROUTE","path":["Node_US_East_1","Node_Tokyo_4"],"protocol":"Hysteria2","reason":"High latency or packet loss detected. AI Analysis failed, defaulting to Hysteria2."});
  });

  // Live Node Metrics API Endpoint
  app.get("/api/v1/nodes/stats", (req, res) => {
    // Generate real-time mock telemetry based on time
    const tick = Date.now();
    const generateVolatility = (base: number, variance: number) => {
      const offset = Math.sin(tick / 1000) * variance;
      return Math.max(0, Math.floor(base + offset));
    };

    const stats = [
      { 
        nodeId: "Tokyo_Core_1 (Asia)", 
        connections: generateVolatility(4200, 300), 
        activeUsers: generateVolatility(1100, 50), 
        latency: generateVolatility(18, 5), 
        isOnline: true 
      },
      { 
        nodeId: "Frankfurt_Relay (EU)", 
        connections: generateVolatility(8500, 500), 
        activeUsers: generateVolatility(2300, 100), 
        latency: generateVolatility(65, 15), 
        isOnline: true 
      },
      { 
        nodeId: "US_East_Shield (NA)", 
        connections: generateVolatility(9800, 800), 
        activeUsers: generateVolatility(3100, 200), 
        latency: generateVolatility(140, 20), 
        isOnline: true 
      },
      { 
        nodeId: "Dubai_Shadow_Node (ME)", 
        connections: generateVolatility(1200, 100), 
        activeUsers: generateVolatility(400, 20), 
        latency: Math.random() > 0.8 ? generateVolatility(550, 100) : generateVolatility(45, 10), // Intermittent high latency
        isOnline: Math.random() > 0.05 
      }
    ];

    res.json(stats);
  });

  // Guard for the remote admin dashboard
  // Only the matching path that React Router uses will be guarded here
  const accessGuard = (req: Request, res: Response, next: NextFunction) => {
    const userKey = req.params.key || req.query.key;
    
    if (userKey === DASHBOARD_KEY) {
      next();
    } else {
      res.status(403).send(`
        <html>
          <body style="background: black; color: #ff003c; font-family: monospace; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh;">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 20px;"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"></path><path d="m15 9-6 6"></path><path d="m9 9 6 6"></path></svg>
            <h1>ACCESS DENIED</h1>
            <p style="color: #666">UFO ALBARQ SECURE FIREWALL</p>
          </body>
        </html>
      `);
    }
  };

  // Protect the highly secure elegant dashboard route
  app.get('/hq/:key', accessGuard);

  // --- Source Download Endpoint ---
  app.get("/api/v1/download-source", async (req, res) => {
    try {
      const AdmZipModule = await import('adm-zip');
      const AdmZip = AdmZipModule.default;
      const zip = new AdmZip();
      const fs = await import('fs');
      const path = await import('path');
      
      const rootDir = process.cwd();
      
      function addFolderToZip(folderPath: string, zipFolder: string) {
        if (!fs.existsSync(folderPath)) return;
        const files = fs.readdirSync(folderPath);
        for (const file of files) {
          if (file === 'node_modules' || file === '.git' || file === 'dist' || String(file).endsWith('.zip')) continue;
          
          const fullPath = path.join(folderPath, file);
          const stat = fs.statSync(fullPath);
          
          if (stat.isDirectory()) {
            addFolderToZip(fullPath, zipFolder ? `${zipFolder}/${file}` : file);
          } else {
            zip.addLocalFile(fullPath, zipFolder || '');
          }
        }
      }
      
      addFolderToZip(rootDir, '');
      const zipBuffer = zip.toBuffer();
      res.set('Content-Type', 'application/zip');
      res.set('Content-Disposition', 'attachment; filename=UFO_ALBARQ_MIRAGE.zip');
      res.send(zipBuffer);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Download failed" });
    }
  });

  // GitHub Direct Upload via isomorphic-git
  app.post("/api/v1/github-export", async (req, res) => {
    const { token, repoName, isPrivate } = req.body;
    if (!token || !repoName) return res.status(400).json({ error: "Token and Repo Name required." });
    
    // Default to false for UI consistency if undefined
    const repoPrivacy = isPrivate === true;

    try {
      const fs = await import('fs');
      const path = await import('path');
      const dir = process.cwd();
      const git = await import('isomorphic-git');
      // Using dynamic import with default or named appropriately
      // @ts-ignore - TS complains but we handle it fallback at runtime
      const httpModule = await import('isomorphic-git/http/node/index.js').catch(() => import('isomorphic-git/http/node'));
      const http = httpModule.default || httpModule;
      
      // Get GitHub User Info
      const userRes = await fetch("https://api.github.com/user", {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Accept": "application/vnd.github.v3+json"
        }
      });
      if (!userRes.ok) throw new Error("Invalid GitHub Token or Missing Permissions");
      const userData = await userRes.json();
      const username = userData.login;
      const email = userData.email || 'mirage@ufo-albarq.com';
      const sanitizedRepoName = repoName.trim().replace(/\s+/g, '-');
      
      // Create Repo if it doesn't exist
      const createRepoRes = await fetch("https://api.github.com/user/repos", {
        method: "POST",
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "Accept": "application/vnd.github.v3+json"
        },
        body: JSON.stringify({ name: sanitizedRepoName, private: repoPrivacy })
      });
      
      if (!createRepoRes.ok && createRepoRes.status !== 422) { // 422 means repo already exists
        const errData = await createRepoRes.json().catch(() => ({}));
        throw new Error(`Failed to create repository: ${errData.message || createRepoRes.statusText}`);
      }
      
      // Clean previous failed attempts
      if (fs.existsSync(path.join(dir, '.git'))) {
         fs.rmSync(path.join(dir, '.git'), { recursive: true, force: true });
      }

      // Re-initialize git and push
      await git.default.init({ fs, dir, defaultBranch: 'main' });
      
      // Add all files
      if (fs.existsSync(path.join(dir, '.gitignore'))) {
         // isomorphic-git handles gitignore
      }
      
      const statusMatrix = await git.default.statusMatrix({ fs, dir });
      for (const row of statusMatrix) {
        // row[0] = filepath, row[1] = HEAD, row[2] = WORKDIR, row[3] = STAGE
        if (row[2] !== 0) { // If it exists in the working directory
           await git.default.add({ fs, dir, filepath: row[0] });
        }
      }
      
      await git.default.commit({
        fs, dir,
        author: { name: username, email: email },
        message: 'feat: UFO ALBARQ Tactical Initial Source Code'
      });
      
      const remoteUrl = `https://github.com/${username}/${sanitizedRepoName}.git`;
      
      await git.default.addRemote({ fs, dir, remote: 'origin', url: remoteUrl });
      
      await git.default.push({
        fs, http, dir,
        remote: 'origin',
        ref: 'main',
        onAuth: () => ({ username: username, password: token }),
        force: true
      });
      
      res.json({ success: true, url: `https://github.com/${username}/${sanitizedRepoName}` });
    } catch(err: any) {
      console.error("GitHub Export Error:", err);
      res.status(500).json({ error: err.message || "Failed to push to GitHub" });
    } finally {
      // CRITICAL: Prevent AI Studio Share Bug by destroying the .git folder!
      try {
        const fs = await import('fs');
        const path = await import('path');
        const dir = process.cwd();
        if (fs.existsSync(path.join(dir, '.git'))) {
           fs.rmSync(path.join(dir, '.git'), { recursive: true, force: true });
           console.log("[Samurai-Cleanup] .git directory purged.");
        }
      } catch(e){}
    }
  });

  // The Binary Arsenal Delivery System (Mirage AI Recovery)
  app.post("/api/v1/arsenal/deliver", async (req, res) => {
    const { deviceAbi, osType, appVersion } = req.body;
    
    console.log(`[AI Alert] Device identified: ${osType} on ${deviceAbi}`);

    // البحث عن المكتبة المتوافقة في المخزن
    const libPath = `${osType}/${deviceAbi}/libmirage-core.so`;
    
    try {
        // محاكاة الاتصال بـ Google Cloud Storage وإنشاء Signed URL
        // في البيئة الحقيقية يتم استدعاء المكتبة @google-cloud/storage
        const mockSignedUrl = `https://storage.googleapis.com/mirage-binaries/${libPath}?token=cyber_secure_mock_token_${Date.now()}`;

        res.status(200).json({
            status: "success",
            downloadUrl: mockSignedUrl,
            checksum: "SHA256_HASH_8F4E2A1B..." // لضمان عدم تلاعب الجدار الناري بالملف
        });
    } catch (error) {
        res.status(404).json({ status: "fail", message: "Architecture not supported yet." });
    }
  });

  // Vite middleware for development or Static for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: { server } },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // For Express 4
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Attach WebSocket server for Mirage Telemetry
  const { WebSocketServer } = await import('ws');
  const wss = new WebSocketServer({ noServer: true });

  server.on('upgrade', (request, socket, head) => {
    if (request.url === '/ws') {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    }
    // Leave other upgrade requests (like Vite HMR) alone
  });

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

  wss.on('connection', (ws) => {
    console.log('[WS] Mirage Portal Client Connected');
    
    ws.on('message', (message) => {
      // Echo testing logic or handle Mirage telemetry
      try {
        const data = JSON.parse(message.toString());
        if (data.type === 'PING') {
          ws.send(JSON.stringify({ type: 'PONG', timestamp: Date.now() }));
        }
      } catch (e) {
        // pass
      }
    });

    ws.on('close', () => {
      console.log('[WS] Client Disconnected');
    });
  });
}

startServer();
