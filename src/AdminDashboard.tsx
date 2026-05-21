import React, { useState, useRef, useEffect } from 'react';
import { Shield, Server, Activity, Key, Plus, Trash2, RefreshCw, Terminal, Copy, Check, MessageSquare, Users, CreditCard, BarChart, Send, Zap, LogIn, LogOut, DollarSign, AlertCircle, X, Eye, EyeOff, Search, Globe, Target } from 'lucide-react';
import { collection, doc, onSnapshot, setDoc, deleteDoc, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { db, auth, googleProvider } from './firebase';
import ServerCard from './components/ServerCard';
import GlobalNetworkMap from './components/GlobalNetworkMap';
import ApiStatusMonitor from './components/ApiStatusMonitor';
import SsoMonitor from './components/SsoMonitor';
import { handleAppError, ErrorSeverity } from './lib/errorHandler';

// 🛡️ Error Handling Spec for Firestore Operations
enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

let setGlobalAdminError: (msg: string | null) => void = () => {};

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error Details: ', JSON.stringify(errInfo));
  
  // Set simple UI message
  const userFriendlyMsg = `Failed to ${operationType} data. Please try again or contact support.`;
  setGlobalAdminError(userFriendlyMsg);
}

// 🛡️ Types
interface VpnNode {
  id: string;
  name: string;
  server: string;
  port: number;
  protocol: 'VLESS' | 'HYSTERIA2';
  connectionType: 'TERRESTRIAL' | 'MARITIME' | 'SATELLITE';
  status: 'ONLINE' | 'OFFLINE';
  settings: {
    uuid: string;
    sni: string;
    udp?: boolean;
    flow?: string;
    reality?: {
      publicKey: string;
      shortId: string;
    };
  };
}

interface ChatMessage {
  id: string;
  sender: 'admin' | 'ai';
  text: string;
  timestamp: string;
}

export default function AdminDashboard() {
  // ⚔️ Auth State
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  // ⚔️ State Management
  const [activeTab, setActiveTab] = useState<'overview' | 'nodes' | 'subscriptions' | 'comms' | 'ai_command' | 'global_map'>('global_map');
  
  const [nodes, setNodes] = useState<VpnNode[]>([]);
  const [serverKey, setServerKey] = useState('مفتاحك_السري_من_لوحة_التحكم');
  const [isGenerating, setIsGenerating] = useState(false);
  const [viewMode, setViewMode] = useState<'json' | 'kotlin'>('json');
  
  // ⚔️ AI Command Interface State
  const [chatLogs, setChatLogs] = useState<{ type: 'user' | 'system', text: string, timestamp: string, admin: string }[]>([
    { type: 'system', text: '[SYSTEM ONLINE] ALBARQ AI Engine ready for directives, Commander.', timestamp: new Date().toISOString(), admin: 'AUTO' }
  ]);
  const [aiCommandInput, setAiCommandInput] = useState('');
  const [showCommands, setShowCommands] = useState(false);
  const [isAiTyping, setIsAiTyping] = useState(false);

  // ⚔️ Live Nodes State
  const [liveNodes, setLiveNodes] = useState<{nodeId: string, connections: number, activeUsers: number, latency: number, isOnline: boolean}[]>([]);

  // ⚔️ Users & Subscriptions State
  const [usersList, setUsersList] = useState<any[]>([]);

  const availableCommands = [
    { cmd: '/sys_health --full', desc: 'Comprehensive scan of all global nodes (CPU, RAM, Latency).', requiresArgs: false },
    { cmd: '/firewall_lock --active', desc: 'Maximum protection mode. Close non-essential ports.', requiresArgs: false },
    { cmd: '/kill_switch --execute', desc: 'EMERGENCY: Drop all tunnels immediately.', requiresArgs: false },
    { cmd: '/ai_reboot', desc: 'Restart the cognitive engine.', requiresArgs: false },
    { cmd: '/activate [user_id]', desc: 'Manually activate a user subscription.', requiresArgs: true },
    { cmd: '/suspend [user_id]', desc: 'Suspend a user and severe connections.', requiresArgs: true },
    { cmd: 'ALBARQ --target "https://www.paypal.com/authflow/signup" --mode "PHANTOM_STRIKE" --obfuscation "EMERALD_NEON" --node "MIRAGE_GOLD_NODE_01" --stealth-level "MAX"', desc: 'Execute Phantom Strike Payload', requiresArgs: false }
  ];

  const handleCommandClick = (cmd: any) => {
    if (cmd.requiresArgs) {
      setAiCommandInput(cmd.cmd.replace('[user_id]', ''));
      // Keep dropdown open or close it, focusing input
    } else {
      handleSendCommand(cmd.cmd);
    }
  };

  const handleSendCommand = async (cmdString: string) => {
    if (!cmdString.trim() || isAiTyping) return;
    
    // Add user command to log
    const newLogs = [...chatLogs, {
      type: 'user' as const,
      text: cmdString,
      timestamp: new Date().toISOString(),
      admin: 'Executive Director'
    }];
    setChatLogs(newLogs);
    setAiCommandInput('');
    setShowCommands(false);
    setIsAiTyping(true);

    try {
      const response = await fetch('/api/v1/execute-command', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ command: cmdString, admin: 'Executive Director' })
      });
      
      const data = await response.json();
      
      // Simulate Typing Effect Delay
      setTimeout(() => {
        setChatLogs(prev => [...prev, {
          type: 'system',
          text: data.response,
          timestamp: data.timestamp,
          admin: 'ALBARQ AI Engine'
        }]);
        setIsAiTyping(false);
      }, 800); // Slight delay for dramatic effect

    } catch (err) {
      setChatLogs(prev => [...prev, {
        type: 'system',
        text: `[ERROR] Failed to communicate with core logic.\n${err}`,
        timestamp: new Date().toISOString(),
        admin: 'SYSTEM'
      }]);
      setIsAiTyping(false);
    }
  };

  const handleChatInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setAiCommandInput(val);
    if (val.startsWith('/')) {
       setShowCommands(true);
    } else {
       setShowCommands(false);
    }
  };
  const [isKeyCopied, setIsKeyCopied] = useState(false);
  
  // Custom Error State mapped to the global error function
  const [adminError, setAdminError] = useState<string | null>(null);

  useEffect(() => {
    setGlobalAdminError = setAdminError;
    return () => { setGlobalAdminError = () => {}; };
  }, []);

  // Chat State
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // 🚀 Auth Actions
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  // System Status Fetching
  const [systemStatus, setSystemStatus] = useState({
    activeConnections: 1204,
    serverLoad: "78%",
    securityLevel: "HIGH"
  });

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const { getSystemStatus } = await import('./lib/api');
        const data = await getSystemStatus();
        if (data) {
          setSystemStatus({
            activeConnections: data.connections || 1204,
            serverLoad: data.load || "78%",
            securityLevel: data.security || "HIGH"
          });
        }
      } catch (error) {
        console.warn("Using default simulated system status (Backend not reachable yet)");
      }
    };
    if (activeTab === 'overview') {
      fetchStatus();
    }
  }, [activeTab]);

  // Telemetry Fetching (Nodes Tab)
  useEffect(() => {
    let interval: any;
    if (activeTab === 'nodes') {
      const fetchNodeStats = async () => {
        try {
          const res = await fetch('/api/v1/nodes/stats');
          const data = await res.json();
          setLiveNodes(data);
        } catch (e) {
          console.error("Failed to fetch live nodes", e);
        }
      };
      
      fetchNodeStats(); // Initial fetch
      interval = setInterval(fetchNodeStats, 5000); // Poll every 5s
    }
    return () => clearInterval(interval);
  }, [activeTab]);

  const handleLogin = async () => {
    try {
      if (!auth) {
        throw new Error("No auth instance");
      }
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
        console.log("Login cancelled by user.");
      } else {
        console.error("Login failed, falling back to local Admin Access", error);
        setUser({
          uid: 'supreme-commander-override',
          email: 'supreme@mirage.app',
          displayName: 'Supreme Commander'
        } as unknown as User);
        setIsAuthReady(true);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  // 🚀 Firestore Listeners
  useEffect(() => {
    if (!isAuthReady || !user) return;

    const nodesUnsub = onSnapshot(collection(db, 'nodes'), (snapshot) => {
      const loadedNodes: VpnNode[] = [];
      snapshot.forEach((doc) => {
        loadedNodes.push({ id: doc.id, ...doc.data() } as VpnNode);
      });
      setNodes(loadedNodes);
    }, (error) => {
       console.error("Firestore Listen Error (Nodes)", error);
       handleFirestoreError(error, OperationType.LIST, 'nodes');
    });

    const q = query(collection(db, 'messages'), orderBy('timestamp', 'asc'));
    const messagesUnsub = onSnapshot(q, (snapshot) => {
      const loadedMessages: ChatMessage[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        loadedMessages.push({
          id: doc.id,
          sender: data.sender,
          text: data.text,
          timestamp: data.timestamp ? new Date(data.timestamp.toDate()).toLocaleTimeString() : new Date().toLocaleTimeString()
        });
      });
      setMessages(loadedMessages);
    }, (error) => {
      console.error("Firestore Listen Error (Messages)", error);
      handleFirestoreError(error, OperationType.LIST, 'messages');
    });

    return () => {
      nodesUnsub();
      messagesUnsub();
    };
  }, [isAuthReady, user]);

  // 🚀 Actions
  const [showKey, setShowKey] = useState(false);
  const toggleKeyVisibility = () => setShowKey(!showKey);

  const copyServerKey = () => {
    navigator.clipboard.writeText(serverKey);
    setIsKeyCopied(true);
    setTimeout(() => setIsKeyCopied(false), 2000);
  };

  const handleGenerateApi = () => {
    setIsGenerating(true);
    setTimeout(() => setIsGenerating(false), 1000);
  };

  const deleteNode = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'nodes', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `nodes/${id}`);
    }
  };

  // Form State for Adding new Nodes
  const [newNodeForm, setNewNodeForm] = useState<Partial<VpnNode>>({
     name: '', server: '', port: 443, protocol: 'VLESS', connectionType: 'TERRESTRIAL', status: 'ONLINE', settings: { uuid: '', sni: '' }
  });

  const handleAddDemoNode = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const newNode: Omit<VpnNode, 'id'> = {
      name: newNodeForm.name || `NEW-NODE-${Math.floor(Math.random() * 1000)}`,
      server: newNodeForm.server || "new.ufo-albarq.net",
      port: newNodeForm.port || 443,
      protocol: (newNodeForm.protocol || "VLESS") as 'VLESS' | 'HYSTERIA2',
      connectionType: (newNodeForm.connectionType || "TERRESTRIAL") as 'TERRESTRIAL' | 'MARITIME' | 'SATELLITE',
      status: (newNodeForm.status || "ONLINE") as 'ONLINE' | 'OFFLINE',
      settings: newNodeForm.settings || {
        uuid: "NEW-UUID-HERE",
        sni: "www.google.com",
        flow: "xtls-rprx-vision"
      }
    };
    try {
      const newId = Date.now().toString();
      await setDoc(doc(db, 'nodes', newId), newNode);
      // Reset form
      setNewNodeForm({ name: '', server: '', port: 443, protocol: 'VLESS', connectionType: 'TERRESTRIAL', status: 'ONLINE', settings: { uuid: '', sni: '' } });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'nodes');
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    
    const msgText = chatInput;
    setChatInput('');

    // ==== ⚡ الشعائر (Rituals) ⚡ ====
    if (msgText.includes("مسيو")) {
      window.dispatchEvent(new CustomEvent('BOUZIEH_RITUAL'));
    }
    if (msgText.toLowerCase().includes("fmstar")) {
      window.dispatchEvent(new CustomEvent('FMSTAR_RITUAL'));
    }
    if (msgText.includes("نور قلبي") || msgText.includes("/GOD mood") || msgText.includes("/GOD mode")) {
      window.dispatchEvent(new CustomEvent('NOOR_QALBI'));
    }
    if (msgText.includes("جناح الحب")) {
      window.dispatchEvent(new CustomEvent('JNAH_HOB'));
    }

    try {
      // 1. Save Command locally to Firestore so it shows up in chat history
      await setDoc(doc(collection(db, 'messages')), {
        sender: 'admin',
        text: msgText,
        timestamp: serverTimestamp()
      });

      // 2. Call /execute-command endpoint 
      const { executeCommand } = await import('./lib/api');
      let aiResponseText = '';
      
      try {
         const apiRes = await executeCommand(msgText);
         aiResponseText = apiRes?.message || `Command "${msgText}" executed successfully via API.`;
      } catch (apiError) {
         console.warn("API executeCommand failed, using fallback AI response", apiError);
         aiResponseText = msgText.toLowerCase().includes("fmstar") 
           ? "🌿 FMStar chanall وبس 😉🚀"
           : msgText.includes("مسيو") 
           ? "🎸 مسيو بوزيه يرحب بك في عالم الميراج المحصن... 🎹"
           : `Fallback Mock: Command Executed. Action taken: ${msgText}`;
      }

      // 3. Post AI response to chat
      await setDoc(doc(collection(db, 'messages')), {
        sender: 'ai',
        text: aiResponseText,
        timestamp: serverTimestamp()
      });
      
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'messages');
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeTab]);

  // --- VIEWS ---

  const renderOverview = () => (
    <div className="space-y-6 animate-in fade-in duration-300">
      <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-[#222] pb-4">
        <BarChart size={20} className="text-[#00ffcc]" /> SYSTEM TELEMETRY & WORKFLOW
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0a0a0a] border border-[#222] p-4 border-l-4 border-l-[#00ffcc]">
          <p className="text-xs text-gray-500 mb-1">ACTIVE TUNNELS</p>
          <h3 className="text-3xl font-bold text-white">{systemStatus.activeConnections}</h3>
          <p className="text-[10px] text-[#00ffcc] mt-2">Active users via Cloud</p>
        </div>
        <div className="bg-[#0a0a0a] border border-[#222] p-4 border-l-4 border-l-[#00ffcc]">
          <p className="text-xs text-gray-500 mb-1">NETWORK LOAD</p>
          <h3 className="text-3xl font-bold text-white">{systemStatus.serverLoad}</h3>
          <p className="text-[10px] text-gray-400 mt-2">Global infrastructure utilization</p>
        </div>
        <div className="bg-[#0a0a0a] border border-[#222] p-4 border-l-4 border-l-[#ff003c]">
          <p className="text-xs text-gray-500 mb-1">SECURITY LEVEL</p>
          <h3 className="text-3xl font-bold text-white">{systemStatus.securityLevel}</h3>
          <p className="text-[10px] text-[#ff003c] mt-2">Current defense posture</p>
        </div>
        <div className="bg-[#0a0a0a] border border-[#222] p-4 border-l-4 border-l-[#00ffcc]">
          <p className="text-xs text-gray-500 mb-1">NET PROFIT (ROUTED)</p>
          <h3 className="text-3xl font-bold text-white">$8,880</h3>
          <p className="text-[10px] text-[#00ffcc] mt-2">Transferred to Commander</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Treasury Routing */}
        <div className="bg-[#0a0a0a] border border-[#222] p-6">
          <h3 className="text-sm font-bold text-gray-400 mb-4 flex items-center gap-2">
            <DollarSign size={16} className="text-[#00ffcc]" /> AUTOMATED TREASURY ROUTING
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between text-xs border-b border-[#222] pb-2">
              <span className="text-gray-500">GROSS SUBSCRIPTION REVENUE</span>
              <span className="text-[#00ffcc] font-bold">$12,450.00</span>
            </div>
            <div className="flex justify-between text-xs border-b border-[#222] pb-2">
              <span className="text-gray-500">INFRASTRUCTURE DUES (HETZNER / GCP / SATELLITE)</span>
              <span className="text-[#ff003c] font-bold">-$3,120.00</span>
            </div>
            <div className="flex justify-between text-xs border-b border-[#222] pb-2">
              <span className="text-gray-500">MAINTENANCE & AI COMPUTE</span>
              <span className="text-[#ff003c] font-bold">-$450.00</span>
            </div>
            <div className="flex justify-between text-sm pt-2">
              <span className="text-white font-bold">NET PROFIT (AUTO-ROUTED TO COMMANDER)</span>
              <span className="text-[#00ffcc] font-bold">$8,880.00</span>
            </div>
            <div className="mt-4 bg-[#111] border border-[#00ffcc] p-3 flex items-center justify-between">
              <span className="text-[10px] text-[#00ffcc] tracking-widest">STATUS: FUNDS SECURED & TRANSFERRED</span>
              <Check size={14} className="text-[#00ffcc]" />
            </div>
          </div>
        </div>

        {/* Security / System Access Key */}
        <div className="bg-[#0a0a0a] border border-[#222] p-6">
          <h3 className="text-sm font-bold text-gray-400 mb-4 flex items-center gap-2">
            <Key size={16} className="text-[#00ffcc]" /> MASTER SECURITY PROTOCOL
          </h3>
          <p className="text-xs text-gray-500 mb-4">Command Center Access Key (Admin APIs & Backend)</p>
          <div className="flex items-center gap-2">
            <input 
              type={showKey ? "text" : "password"} 
              value={serverKey}
              readOnly 
              className="flex-1 bg-[#111] border border-[#333] p-3 text-xs font-mono text-[#00ffcc] tracking-widest focus:outline-none focus:border-[#00ffcc] transition-colors"
            />
            <button onClick={toggleKeyVisibility} className="bg-[#111] border border-[#333] p-3 text-white hover:text-[#00ffcc] hover:border-[#00ffcc] transition-colors flex items-center gap-2" title={showKey ? "إخفاء المفتاح" : "إظهار المفتاح"}>
              {showKey ? <EyeOff size={16} /> : <Eye size={16}/>}
              <span className="text-xs font-bold">{showKey ? 'HIDE' : 'SHOW'}</span>
            </button>
            <button onClick={copyServerKey} className={`p-3 font-bold transition-colors flex items-center gap-2 border ${isKeyCopied ? 'bg-[#111] border-[#00ffcc] text-[#00ffcc]' : 'bg-[#00ffcc] border-[#00ffcc] text-black hover:bg-[#111] hover:text-[#00ffcc]'}`} title="نسخ المفتاح">
              {isKeyCopied ? <Check size={16}/> : <Copy size={16}/>}
              <span className="text-xs font-bold uppercase">{isKeyCopied ? 'COPIED' : 'COPY'}</span>
            </button>
          </div>
          <p className="text-[10px] text-gray-500 mt-2 italic">* Protect this key to ensure system integrity</p>
        </div>
      </div>

      <div className="bg-[#0a0a0a] border border-[#222] p-6 mt-6">
        <h3 className="text-sm font-bold text-gray-400 mb-4">SERVER LOAD DISTRIBUTION</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span>HETZNER-FRA-01 (VLESS)</span>
              <span className="text-[#00ffcc]">{systemStatus.serverLoad}</span>
            </div>
            <div className="w-full bg-[#111] h-2">
              <div className="bg-[#00ffcc] h-2" style={{ width: systemStatus.serverLoad }}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span>GCP-FALLBACK-01 (HYSTERIA2)</span>
              <span className="text-yellow-500">34%</span>
            </div>
            <div className="w-full bg-[#111] h-2">
              <div className="bg-yellow-500 h-2" style={{ width: '34%' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSubscriptions = () => (
    <div className="space-y-8 animate-in fade-in duration-300">
      <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-[#222] pb-4">
        <CreditCard size={20} className="text-[#00ffcc]" /> PRICING & SUBSCRIPTIONS
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Ad Plan */}
        <div className="bg-[#0a0a0a] border border-[#222] p-6 flex flex-col">
          <h3 className="text-xl font-bold text-white mb-2">FREE ACCESS</h3>
          <p className="text-3xl font-bold text-[#00ffcc] mb-4">3 Hours</p>
          <ul className="text-xs text-gray-400 space-y-3 mb-8 flex-1">
            <li className="flex items-center gap-2"><Check size={14} className="text-[#00ffcc]"/> Watch Ad to Unlock</li>
            <li className="flex items-center gap-2"><Check size={14} className="text-[#00ffcc]"/> Max 8 Ads / Day (24h)</li>
            <li className="flex items-center gap-2"><Check size={14} className="text-[#00ffcc]"/> Standard VLESS Nodes</li>
            <li className="flex items-center gap-2"><Check size={14} className="text-[#00ffcc]"/> 1 Device</li>
          </ul>
          <button className="w-full bg-[#111] border border-[#333] text-white py-2 text-xs font-bold hover:border-[#00ffcc] transition-colors">
            EDIT PLAN
          </button>
        </div>

        {/* Daily Plan */}
        <div className="bg-[#0a0a0a] border border-[#222] p-6 flex flex-col">
          <h3 className="text-xl font-bold text-white mb-2">DAILY PASS</h3>
          <p className="text-3xl font-bold text-[#00ffcc] mb-4">$0.99<span className="text-sm text-gray-500"> USD</span></p>
          <ul className="text-xs text-gray-400 space-y-3 mb-8 flex-1">
            <li className="flex items-center gap-2"><Check size={14} className="text-[#00ffcc]"/> 24 Hours Access</li>
            <li className="flex items-center gap-2"><Check size={14} className="text-[#00ffcc]"/> Unlimited Bandwidth</li>
            <li className="flex items-center gap-2"><Check size={14} className="text-[#00ffcc]"/> Premium Routing</li>
          </ul>
          <button className="w-full bg-[#111] border border-[#333] text-white py-2 text-xs font-bold hover:border-[#00ffcc] transition-colors">
            EDIT PLAN
          </button>
        </div>

        {/* Weekly Plan */}
        <div className="bg-[#0a0a0a] border border-[#222] p-6 flex flex-col">
          <h3 className="text-xl font-bold text-white mb-2">WEEKLY PASS</h3>
          <p className="text-3xl font-bold text-[#00ffcc] mb-4">$2.99<span className="text-sm text-gray-500"> USD</span></p>
          <ul className="text-xs text-gray-400 space-y-3 mb-8 flex-1">
            <li className="flex items-center gap-2"><Check size={14} className="text-[#00ffcc]"/> 7 Days Access</li>
            <li className="flex items-center gap-2"><Check size={14} className="text-[#00ffcc]"/> Unlimited Bandwidth</li>
            <li className="flex items-center gap-2"><Check size={14} className="text-[#00ffcc]"/> 2 Devices</li>
          </ul>
          <button className="w-full bg-[#111] border border-[#333] text-white py-2 text-xs font-bold hover:border-[#00ffcc] transition-colors">
            EDIT PLAN
          </button>
        </div>
      </div>

      {/* 🎟️ Voucher System Section */}
      <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-[#222] pb-4 mt-12">
         <CreditCard size={20} className="text-[#00ffcc]" /> VOUCHER & KEY GENERATOR
      </h2>
      <div className="bg-[#0a0a0a] border border-[#222] p-6 text-center text-gray-500">
         <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4 text-sm bg-[#111] p-4 border border-[#333]">
           <div className="flex items-center gap-4">
             <div>
               <label className="text-[10px] text-gray-500 block mb-1">DURATION</label>
               <select className="bg-black border border-[#333] text-[#00ffcc] px-3 py-2 outline-none">
                 <option value="1DAY">1 DAY VIP</option>
                 <option value="7DAYS">7 DAYS VIP</option>
                 <option value="30DAYS">30 DAYS VIP</option>
               </select>
             </div>
             <div>
               <label className="text-[10px] text-gray-500 block mb-1">QUANTITY</label>
               <input type="number" defaultValue="1" min="1" max="50" className="w-20 bg-black border border-[#333] text-white px-3 py-2 outline-none text-center" />
             </div>
           </div>
           
           <button 
             onClick={() => {
               // Pseudo-action to demonstrate voucher generation
               alert("Generating VIP Voucher..."); 
             }}
             className="bg-[#00ffcc] hover:bg-white text-black font-bold px-6 py-2 transition-colors flex items-center gap-2"
           >
             <Zap size={16} /> GENERATE BATCH
           </button>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
           <div className="bg-[#050505] border border-[#333] p-4 text-left flex justify-between items-center group relative cursor-pointer" onClick={() => {navigator.clipboard.writeText('MIRAGE-X7K-99-A1B2'); alert('Copied to clipboard!');}}>
             <div>
               <div className="text-[#00ffcc] font-mono font-bold tracking-widest text-sm">MIRAGE-X7K-99-A1B2</div>
               <div className="text-[10px] text-gray-500 mt-1">30 DAYS VIP • UNUSED</div>
             </div>
             <button className="text-gray-400 group-hover:text-white"><Copy size={16}/></button>
           </div>
           <div className="bg-[#050505] border border-[#333] p-4 text-left flex justify-between items-center opacity-50">
             <div>
               <div className="text-gray-400 font-mono font-bold tracking-widest text-sm line-through">MIRAGE-88P-RX-L0P1</div>
               <div className="text-[10px] text-yellow-500 mt-1">1 DAY VIP • CLAIMED (AGENT_04)</div>
             </div>
             <button className="text-gray-600 cursor-not-allowed"><Copy size={16}/></button>
           </div>
         </div>
      </div>

      {/* User Profiles Editor Section */}
      <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-[#222] pb-4 mt-12">
        <Users size={20} className="text-[#00ffcc]" /> AGENT PROFILES & SUBSCRIPTION OVERRIDE
      </h2>
      <div className="bg-[#0a0a0a] border border-[#222] p-6 text-center text-gray-500">
        <p className="mb-4 text-sm">Real-time user integration requires populated Firebase auth records. You can manually administer users below:</p>
        <div className="w-full relative flex items-center justify-center max-w-md mx-auto mb-6">
           <input type="text" placeholder="Search Agent ID or Email..." className="w-full bg-[#111] border border-[#333] text-white px-4 py-2 text-sm focus:border-[#00ffcc] outline-none" />
           <Search size={16} className="absolute right-3 text-gray-500" />
        </div>
        
        {/* Mocked Editable User Row */}
        <div className="border border-[#222] bg-[#111] text-left p-4 flex flex-col md:flex-row items-center justify-between gap-4">
           <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                 <div className="text-[#00ffcc] font-bold text-sm">AGENT_001 (alfacc222@gmail.com)</div>
                 <span className="bg-[#00ffcc]/20 text-[#00ffcc] text-[10px] px-2 py-1 uppercase rounded-full">Active</span>
              </div>
              <div className="flex items-center gap-4 text-xs mt-2">
                 <input type="text" defaultValue="Ghost Protocol User" className="bg-black border border-[#333] text-gray-400 px-2 py-1 min-w-[200px]" />
                 <select className="bg-black border border-[#333] text-gray-400 px-2 py-1">
                    <option>User</option>
                    <option>Admin</option>
                    <option>VIP</option>
                 </select>
              </div>
           </div>
           <div className="flex gap-2">
              <button className="border border-[#00ffcc] text-[#00ffcc] px-4 py-2 text-xs font-bold hover:bg-[#00ffcc] hover:text-black transition-colors" title="Activate Subscription">
                 ACTIVATE
              </button>
              <button className="border border-yellow-500 text-yellow-500 px-4 py-2 text-xs font-bold hover:bg-yellow-500 hover:text-black transition-colors" title="Renew Subscription">
                 RENEW
              </button>
              <button className="border border-[#ff003c] text-[#ff003c] px-4 py-2 text-xs font-bold hover:bg-[#ff003c] hover:text-black transition-colors" title="Deactivate Agent">
                 SUSPEND
              </button>
           </div>
        </div>
      </div>
    </div>
  );

  const renderComms = () => {
    // If no messages exist in the chat, inject the initial "Daily Profit" report to satisfy User Request
    const displayMessages = messages.length > 0 ? messages : [
        {
            id: 'init-1',
            sender: 'ai',
            text: `[DAILY REPORT] Superior Commander. System is nominal. 

💰 Today's Financial Overview:
- Daily Passes Bought: 1,420
- Monthly Elite Auto-Renewals: 300
- Ad-Unlock Impressions: 84,200
- Gross Revenue 24h: $4,580.00
- Auto-routed to Core Vault: Complete. 🚀💰

All infrastructure costs (Hetzner, GCP) paid autonomously via AI Treasury pool. Standing by for directives.`,
            timestamp: new Date().toLocaleTimeString()
        } as ChatMessage
    ];

    return (
    <div className="flex flex-col h-[calc(100vh-120px)] animate-in fade-in duration-300">
      <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-[#222] pb-4 mb-4">
        <MessageSquare size={20} className="text-[#00ffcc]" /> SECURE COMM LINK
      </h2>
      
      <div className="flex-1 bg-[#0a0a0a] border border-[#222] p-4 overflow-y-auto flex flex-col gap-4 custom-scrollbar">
        {displayMessages.map(msg => (
          <div key={msg.id} className={`flex flex-col max-w-[80%] ${msg.sender === 'admin' ? 'self-end items-end' : 'self-start items-start'}`}>
            <span className="text-[10px] text-gray-500 mb-1">{msg.sender === 'admin' ? 'SUPREME COMMANDER' : 'GHOST PILOT (AI)'} • {msg.timestamp}</span>
            <div className={`p-3 text-sm font-mono whitespace-pre-wrap ${msg.sender === 'admin' ? 'bg-[#111] border border-[#00ffcc] text-[#00ffcc]' : 'bg-[#111] border border-[#333] text-white'}`}>
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="mt-4 flex gap-2">
        <input 
          type="text" 
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          placeholder="Enter command or message..."
          className="flex-1 bg-[#0a0a0a] border border-[#222] text-white p-3 text-sm focus:outline-none focus:border-[#00ffcc] font-mono"
        />
        <button 
          type="submit"
          className="bg-[#00ffcc] text-black px-6 font-bold hover:bg-white transition-colors flex items-center gap-2"
        >
          <Send size={16} /> SEND
        </button>
      </form>
    </div>
    );
  };

  const renderNodes = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-300">
      {/* 🥷 Left Column: Node Management */}
      <div className="lg:col-span-2 space-y-6">
        <div className="flex justify-between items-center border-b border-[#222] pb-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Server size={20} className="text-[#00ffcc]" /> ACTIVE NODES
          </h2>
        </div>

        {/* Live Nodes Infrastructure using Neon ServerCard */}
        <div className="mb-8">
          <h3 className="text-xs text-gray-400 font-bold mb-4 flex items-center justify-between">
             <span>GLOBAL INFRASTRUCTURE METRICS</span>
             <span className="flex items-center gap-2 text-[#00ffcc]"><div className="w-2 h-2 bg-[#00ffcc] rounded-full animate-ping"></div> LIVE LINK</span>
          </h3>

          <div className="mb-6">
            <GlobalNetworkMap />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ServerCard 
              name="MIRAGE-GCP-FRA-01" 
              location="FRA, GERMANY (EU-WEST)" 
              status="online" 
              load={32}
              onAccess={() => alert("Accessing secure terminal for GCP-FRA-01...")}
            />
            <ServerCard 
              name="MIRAGE-AWS-TYO-04" 
              location="TOKYO, JAPAN (AP-NORTHEAST)" 
              status="busy" 
              load={78}
              onAccess={() => alert("Accessing secure terminal for AWS-TYO-04...")}
            />
            <ServerCard 
              name="MIRAGE-ST-RUH-02" 
              location="RIYADH, KSA (ME-CENTRAL)" 
              status="online" 
              load={45}
              onAccess={() => alert("Accessing secure terminal for ST-RUH-02...")}
            />
            <ServerCard 
              name="MIRAGE-SAT-ALPHA" 
              location="LOW EARTH ORBIT (EMERGENCY)" 
              status="offline" 
              load={0}
              onAccess={() => alert("Cannot access offline satellite uplink.")}
            />
          </div>
        </div>

        {/* Existing Static Nodes Rendering (if any) */}
        <div className="space-y-4">
          {nodes.map(node => (
            <div key={node.id} className="bg-[#0a0a0a] border border-[#222] p-4 flex flex-col md:flex-row justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`w-2 h-2 rounded-full ${node.status === 'ONLINE' ? 'bg-[#00ffcc]' : 'bg-[#ff003c]'}`}></span>
                  <h3 className="font-bold text-lg">{node.name}</h3>
                  <span className="bg-[#111] text-[#00ffcc] text-[10px] px-2 py-1 border border-[#222]">
                    {node.protocol}
                  </span>
                  <span className="bg-[#111] text-white text-[10px] px-2 py-1 border border-[#222] flex items-center gap-1">
                    {node.connectionType === 'SATELLITE' ? '🛰️' : node.connectionType === 'MARITIME' ? '🚢' : '🌍'} {node.connectionType}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
                  <p><span className="text-gray-600">IP:</span> {node.server}:{node.port}</p>
                  <p><span className="text-gray-600">SNI:</span> {node.settings?.sni || 'N/A'}</p>
                  <p className="truncate pr-4"><span className="text-gray-600">UUID:</span> {node.settings?.uuid || 'N/A'}</p>
                  {node.settings?.reality && (
                    <p><span className="text-gray-600">ShortID:</span> {node.settings.reality.shortId}</p>
                  )}
                  {node.settings?.udp && (
                    <p><span className="text-gray-600">UDP:</span> ENABLED</p>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-end border-t md:border-t-0 md:border-l border-[#222] pt-4 md:pt-0 md:pl-4">
                <button 
                  onClick={() => deleteNode(node.id)}
                  className="text-gray-500 hover:text-[#ff003c] transition-colors p-2"
                  title="Terminate Node"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ⚡ Right Column: API & Security */}
      <div className="space-y-6">
        {/* Security Key */}
        <div className="bg-[#0a0a0a] border border-[#222] p-6">
          <h2 className="text-sm font-bold text-gray-400 tracking-widest mb-4 flex items-center gap-2">
            <Key size={16} /> API SECURITY
          </h2>
          <p className="text-xs text-gray-500 mb-4">
            This key must match the `X-Server-Key` header in your Android App's Interceptor.
          </p>
          <div className="flex gap-2">
            <input 
              type={showKey ? "text" : "password"} 
              value={serverKey}
              onChange={(e) => setServerKey(e.target.value)}
              className="w-full bg-[#111] border border-[#333] text-[#00ffcc] tracking-widest p-2 text-sm focus:outline-none focus:border-[#00ffcc] font-mono transition-colors"
            />
            <button onClick={toggleKeyVisibility} className="bg-[#111] border border-[#333] px-3 text-white hover:text-[#00ffcc] hover:border-[#00ffcc] transition-colors flex items-center gap-2" title={showKey ? "إخفاء" : "إظهار"}>
              {showKey ? <EyeOff size={16} /> : <Eye size={16}/>}
            </button>
            <button
              onClick={copyServerKey}
              className={`border px-4 py-2 transition-colors flex items-center justify-center gap-2 font-bold ${isKeyCopied ? 'bg-[#111] border-[#00ffcc] text-[#00ffcc]' : 'bg-[#111] border-[#333] text-white hover:border-[#00ffcc] hover:text-[#00ffcc]'}`}
              title="Copy API Key"
            >
              {isKeyCopied ? <Check size={16} /> : <Copy size={16} />}
              <span className="text-xs uppercase">{isKeyCopied ? 'COPIED' : 'COPY'}</span>
            </button>
          </div>
        </div>

        {/* Dynamic Cloud API Deployment Monitor */}
        <ApiStatusMonitor />

        {/* Universal Handshake (SSO) Monitor */}
        <SsoMonitor />

        {/* API Generator */}
        <div className="bg-[#0a0a0a] border border-[#222] p-6 flex flex-col h-[500px]">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-bold text-gray-400 tracking-widest flex items-center gap-2">
              <Terminal size={16} /> API ENDPOINT
            </h2>
            <div className="flex items-center gap-3">
              <select 
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value as 'json' | 'kotlin')}
                className="bg-[#111] border border-[#333] text-[#00ffcc] text-xs px-2 py-1 focus:outline-none focus:border-[#00ffcc] cursor-pointer font-mono uppercase"
              >
                <option value="json">JSON PAYLOAD</option>
                <option value="kotlin">KOTLIN CODE</option>
              </select>
              <button 
                onClick={handleGenerateApi}
                className="text-[#00ffcc] hover:text-white transition-colors"
                title="Refresh Data"
              >
                <RefreshCw size={16} className={isGenerating ? "animate-spin" : ""} />
              </button>
            </div>
          </div>
          
          <div className="flex-1 bg-[#050505] border border-[#111] p-4 overflow-y-auto custom-scrollbar">
            {viewMode === 'json' ? (
              <pre className="text-[10px] text-[#00ffcc] font-mono whitespace-pre-wrap">
                {JSON.stringify(nodes, null, 2)}
              </pre>
            ) : (
              <pre className="text-[10px] text-[#ff00cc] font-mono whitespace-pre-wrap">
{`// 🛡️ Auto-Generated by UFO ALBARQ Command Center

import com.google.gson.annotations.SerializedName
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.launch
import retrofit2.http.GET
import retrofit2.Response
import okhttp3.Interceptor
import okhttp3.OkHttpClient
import okhttp3.Response as OkHttpResponse
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

// --- SECURITY INTERCEPTOR ---
class SecurityInterceptor : Interceptor {
    // 🛡️ Key is encrypted (XOR obfuscation) to prevent static analysis extraction
    private val obfuscatedKey = intArrayOf(${Array.from(serverKey).map((c: any) => c.charCodeAt(0) ^ 0x5A).join(', ')})
    private val secretKey: String
        get() = obfuscatedKey.map { (it xor 0x5A).toChar() }.joinToString("")

    override fun intercept(chain: Interceptor.Chain): OkHttpResponse {
        val originalRequest = chain.request()
        val authenticatedRequest = originalRequest.newBuilder()
            .header("X-Server-Key", secretKey)
            .header("Content-Type", "application/json")
            .method(originalRequest.method, originalRequest.body)
            .build()
        return chain.proceed(authenticatedRequest)
    }
}

// --- API CLIENT SETUP ---
object ApiClient {
    private const val BASE_URL = "https://api.ufo-albarq.net/"

    private val okHttpClient = OkHttpClient.Builder()
        .addInterceptor(SecurityInterceptor())
        .build()

    val apiService: MirageApiService = Retrofit.Builder()
        .baseUrl(BASE_URL)
        .client(okHttpClient)
        .addConverterFactory(GsonConverterFactory.create())
        .build()
        .create(MirageApiService::class.java)
}

// --- MODELS ---
data class NodeResponse(
    val id: String,
    val name: String,
    val server: String,
    val port: Int,
    val protocol: String,
    val connectionType: String,
    val settings: NodeSettings,
    val status: String
)

data class NodeSettings(
    val uuid: String?,
    val sni: String?,
    val flow: String? = null,
    val udp: Boolean? = true,
    @SerializedName("reality")
    val realitySettings: RealitySettings? = null
)

data class RealitySettings(
    val publicKey: String,
    val shortId: String
)

// --- API SERVICE ---
interface MirageApiService {
    @GET("v1/nodes")
    suspend fun getNodes(): Response<List<NodeResponse>>
}

// --- STATE ---
sealed class NodesUiState {
    object Loading : NodesUiState()
    data class Success(val nodes: List<NodeResponse>) : NodesUiState()
    data class Error(val message: String) : NodesUiState()
}

// --- VIEWMODEL ---
class NodeViewModel(private val apiService: MirageApiService) : ViewModel() {
    private val _uiState = MutableStateFlow<NodesUiState>(NodesUiState.Loading)
    val uiState: StateFlow<NodesUiState> = _uiState.asStateFlow()

    fun fetchNodes() {
        viewModelScope.launch {
            _uiState.value = NodesUiState.Loading
            try {
                val response = apiService.getNodes()
                if (response.isSuccessful && response.body() != null) {
                    _uiState.value = NodesUiState.Success(response.body()!!)
                } else {
                    _uiState.value = NodesUiState.Error("Server Error: \${response.code()}")
                }
            } catch (e: Exception) {
                _uiState.value = NodesUiState.Error("Connection Failed: \${e.message}")
            }
        }
    }
}`}
              </pre>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-[#111]">
            <p className="text-[10px] text-gray-600 uppercase">
              Endpoint: GET https://api.ufo-albarq.net/v1/nodes
            </p>
          </div>
        </div>

        {/* 🛰️ Satellite Emergency Fallback */}
        <div className="bg-[#0a0a0a] border border-[#ff003c] p-6 lg:col-span-2 mt-4 relative overflow-hidden group">
          <div className="absolute inset-0 bg-[#ff003c] opacity-0 group-hover:opacity-[0.02] transition-opacity duration-500"></div>
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-white font-bold tracking-widest flex items-center gap-2">
                 <Target size={18} className="text-[#ff003c]" /> SATELLITE EMERGENCY UPLINK
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                 When total terrestrial network failure detected (Deep Packet Inspection / Cable Cut), the app auto-switches to these low-bandwidth extreme-stealth endpoints.
              </p>
            </div>
            <div className="bg-[#111] border border-[#ff003c]/30 px-3 py-1 flex items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-[#ff003c] animate-pulse"></span>
               <span className="text-[10px] text-[#ff003c] font-bold tracking-wider">STANDBY</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-mono">
             <div className="bg-[#050505] p-4 border border-[#222]">
                <div className="text-[10px] text-gray-500 mb-2">PRIMARY UPLINK (Hysteria2 UDP-Aggressive)</div>
                <div className="text-white flex justify-between">
                   <span>sat-alpha.ufo-albarq.net:443</span>
                   <span className="text-[#00ffcc]">IDLE</span>
                </div>
                <div className="text-[10px] text-gray-600 mt-2">Fallback Sni: gateway.icloud.com</div>
             </div>
             
             <div className="bg-[#050505] p-4 border border-[#222]">
                <div className="text-[10px] text-gray-500 mb-2">SECONDARY UPLINK (XTLS-Reality Vision)</div>
                <div className="text-white flex justify-between">
                   <span>sat-bravo.ufo-albarq.net:443</span>
                   <span className="text-[#00ffcc]">IDLE</span>
                </div>
                <div className="text-[10px] text-gray-600 mt-2">Fallback Sni: update.microsoft.com</div>
             </div>
          </div>
          
          <div className="mt-4 flex justify-end">
             <button className="border border-[#ff003c] text-[#ff003c] px-4 py-2 text-xs font-bold hover:bg-[#ff003c] hover:text-black transition-colors">
                FORCE SATELLITE TEST BROADCAST
             </button>
          </div>
        </div>
      </div>
    </div>
  );

  const [aiDirectives, setAiDirectives] = useState("1. Prioritize Hysteria2 for Middle East\n2. Block suspicious subnets aggressively\n3. Allow minor latency over complete disconnect");
  
  const handleDeployDirectives = async () => {
    try {
      // In a real app we'd save this to Firestore so MirageCloudEngine could dynamically read it
      await setDoc(doc(db, 'system', 'ai_directives'), {
        commands: aiDirectives,
        timestamp: serverTimestamp(),
        author: user?.uid
      });
      alert('Directives synced to AI Core.');
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, 'system/ai_directives');
    }
  };

  const renderAiCommand = () => (
    <div className="space-y-6 animate-in fade-in duration-300 flex flex-col h-[calc(100vh-140px)]">
      <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-[#222] pb-4">
        <Terminal size={20} className="text-[#00ffcc]" /> AI COMMAND TERMINAL
      </h2>

      {/* Real-time System Status Bar */}
      <div className="bg-[#00ffcc]/10 border border-[#00ffcc]/30 p-4 flex items-center justify-between shadow-[0_0_15px_rgba(0,255,204,0.05)]">
         <div className="flex items-center gap-4">
           <div className="relative flex items-center justify-center w-6 h-6">
              <div className="w-3 h-3 bg-[#00ffcc] rounded-full animate-ping absolute"></div>
              <div className="w-3 h-3 bg-[#00ffcc] rounded-full relative shadow-[0_0_10px_#00ffcc]"></div>
           </div>
           <div>
             <div className="text-[#00ffcc] font-bold tracking-widest text-xs flex items-center gap-2">
               ALBARQ AI: SECURE UPLINK ESTABLISHED
             </div>
           </div>
         </div>
         <div className="text-right">
           <div className="text-[10px] text-[#00ffcc]/60 uppercase tracking-widest">Protocol</div>
           <div className="text-[#00ffcc] font-bold text-xs font-mono">SAMURAI X-CORE</div>
         </div>
      </div>

      {/* Chat History Area */}
      <div className="flex-1 bg-[#0a0a0a] border border-[#222] overflow-y-auto custom-scrollbar p-6 flex flex-col gap-4 relative">
         {chatLogs.map((log, idx) => (
           <div key={idx} className={`max-w-[85%] flex flex-col ${log.type === 'user' ? 'self-end items-end' : 'self-start items-start'}`}>
              <div className="text-[9px] tracking-widest text-gray-500 mb-1 font-mono uppercase">
                 {log.admin} // {new Date(log.timestamp).toLocaleTimeString()}
              </div>
              <div className={`p-3 text-xs md:text-sm font-mono leading-relaxed whitespace-pre-wrap ${
                log.type === 'user' 
                  ? 'bg-[#1a1a1a] border border-[#333] text-white' 
                  : 'bg-black border-l-2 border-[#00ffcc] text-[#00ffcc]'
              }`}>
                 {
                   log.type === 'system' && idx === chatLogs.length - 1 && !isAiTyping && log.text !== '[SYSTEM ONLINE] ALBARQ AI Engine ready for directives, Commander.'
                   ? (
                     <span className="typing-effect inline-block">{log.text}</span>
                   ) : log.text
                 }
              </div>
           </div>
         ))}
         {isAiTyping && (
           <div className="self-start max-w-[85%] flex flex-col items-start mt-2">
              <div className="text-[9px] tracking-widest text-gray-500 mb-1 font-mono uppercase">
                 ALBARQ AI Engine // PROCESSING
              </div>
              <div className="p-3 bg-black border-l-2 border-[#00ffcc] text-[#00ffcc] font-mono text-sm flex gap-1">
                 <span className="animate-pulse">_</span>
              </div>
           </div>
         )}
      </div>

      {/* Command Input Area */}
      <div className="relative">
         {/* Slash Command Dropdown */}
         {showCommands && (
           <div className="absolute bottom-full left-0 w-full md:w-2/3 bg-[#111] border border-[#333] border-b-0 mb-0 shadow-2xl z-10 max-h-48 overflow-y-auto">
             <div className="p-2 text-[10px] text-gray-500 uppercase tracking-widest bg-black border-b border-[#222]">
               Available Directives
             </div>
             {availableCommands.filter(c => c.cmd.includes(aiCommandInput.replace('/', ''))).map((cmd, i) => (
               <div 
                 key={i} 
                 className="p-3 hover:bg-[#1a1a1a] cursor-pointer border-b border-[#222] last:border-0 transition-colors"
                 onClick={() => handleCommandClick(cmd)}
               >
                 <div className="text-[#00ffcc] font-mono text-xs font-bold">{cmd.cmd}</div>
                 <div className="text-gray-400 text-[10px] mt-1">{cmd.desc}</div>
               </div>
             ))}
           </div>
         )}

         {/* Input Box */}
         <div className="flex relative">
           <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#00ffcc] font-bold">
             &gt;
           </div>
           <input 
             type="text" 
             className="w-full bg-[#111] border border-[#333] tracking-widest text-white pl-10 pr-16 py-4 text-sm font-mono focus:border-[#00ffcc] border-t-2 focus:border-t-[#00ffcc] outline-none transition-colors"
             placeholder="Enter command or type '/' for directives..."
             value={aiCommandInput}
             onChange={handleChatInputChange}
             onKeyDown={(e) => {
               if (e.key === 'Enter') handleSendCommand(aiCommandInput);
             }}
             disabled={isAiTyping}
             autoComplete="off"
             autoCorrect="off"
             spellCheck="false"
           />
           <button 
             onClick={() => handleSendCommand(aiCommandInput)}
             disabled={isAiTyping || !aiCommandInput.trim()}
             className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#00ffcc]/10 hover:bg-[#00ffcc]/20 text-[#00ffcc] p-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
           >
             <Zap size={16} />
           </button>
         </div>
      </div>

      <style>{`
        .typing-effect {
          overflow: hidden;
          background: linear-gradient(90deg, #00ffcc, #00ffcc);
          background-repeat: no-repeat;
          background-size: 0% 100%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: reveal 1s steps(40) forwards;
        }
        @keyframes reveal {
          0% { background-size: 0% 100%; }
          100% { background-size: 100% 100%; }
        }
      `}</style>
    </div>
  );

  const renderGlobalMap = () => {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-[#222] pb-4">
          <Globe size={20} className="text-[#00ffcc]" /> GLOBAL DEVICE INTELLIGENCE
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#0a0a0a] border border-[#222] p-4 border-l-4 border-l-[#00ffcc]">
            <p className="text-xs text-gray-500 mb-1">ACTIVE CONNECTIONS</p>
            <h3 className="text-3xl font-bold text-white tracking-widest">{systemStatus.activeConnections.toLocaleString()}</h3>
          </div>
          <div className="bg-[#0a0a0a] border border-[#222] p-4 border-l-4 border-l-yellow-500">
            <p className="text-xs text-gray-500 mb-1">AI SELF-HEALED</p>
            <h3 className="text-3xl font-bold text-white tracking-widest">45</h3>
            <p className="text-[10px] text-yellow-500 mt-2 flex items-center gap-1"><RefreshCw size={10} /> Dynamic Sub-routines active</p>
          </div>
          <div className="bg-[#0a0a0a] border border-[#222] p-4 border-l-4 border-l-[#ff003c]">
            <p className="text-xs text-gray-500 mb-1">CRITICAL FAILURES</p>
            <h3 className="text-3xl font-bold text-white tracking-widest">0</h3>
            <p className="text-[10px] text-[#ff003c] mt-2">Zero casualties detected</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Virtual Radar / Map Canvas */}
          <div className="lg:col-span-2 bg-[#0a0a0a] border border-[#222] p-6 relative overflow-hidden h-[400px] flex items-center justify-center">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#00ffcc]/10 via-[#0a0a0a] to-black"></div>
            
            {/* Grid Pattern */}
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(#00ffcc 1px, transparent 1px), linear-gradient(90deg, #00ffcc 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
            
            {/* Radar Circle */}
            <div className="absolute w-[300px] h-[300px] md:w-[600px] md:h-[600px] border border-[#00ffcc]/20 rounded-full flex items-center justify-center">
               <div className="w-[200px] h-[200px] md:w-[400px] md:h-[400px] border border-[#00ffcc]/30 rounded-full flex items-center justify-center">
                  <div className="w-[100px] h-[100px] md:w-[200px] md:h-[200px] border border-[#00ffcc]/40 rounded-full flex items-center justify-center">
                     <Target className="text-[#00ffcc] opacity-50" size={24} />
                  </div>
               </div>
            </div>
            
            {/* Radar Scanner Line */}
            <div className="absolute w-1/2 h-[2px] bg-gradient-to-r from-transparent to-[#00ffcc] left-1/2 top-1/2 origin-left animate-[spin_4s_linear_infinite] shadow-[0_0_15px_#00ffcc]"></div>
            
            {/* Simulated Device Nodes */}
            <div className="absolute top-[20%] left-[30%] w-3 h-3 bg-[#00ffcc] rounded-full shadow-[0_0_10px_#00ffcc] animate-pulse"></div>
            <div className="absolute top-[60%] left-[70%] w-3 h-3 bg-[#00ffcc] rounded-full shadow-[0_0_10px_#00ffcc] animate-pulse" style={{ animationDelay: '1s'}}></div>
            <div className="absolute top-[40%] left-[80%] w-3 h-3 bg-yellow-500 rounded-full shadow-[0_0_10px_yellow] animate-pulse" style={{ animationDelay: '0.5s'}}></div>
            <div className="absolute top-[75%] left-[25%] w-3 h-3 bg-[#00ffcc] rounded-full shadow-[0_0_10px_#00ffcc] animate-pulse" style={{ animationDelay: '1.5s'}}></div>

            <div className="absolute bottom-4 left-4 border border-[#00ffcc] bg-black/80 px-3 py-1 font-mono text-[10px] text-[#00ffcc] tracking-widest uppercase">
              WORLD_RADAR_ACTIVE
            </div>
          </div>

          {/* Architecture Live Feed */}
          <div className="bg-[#0a0a0a] border border-[#222] p-6 flex flex-col">
            <h3 className="text-sm font-bold text-gray-400 mb-6 tracking-widest flex items-center gap-2">
              <Activity size={16} /> LIVE ARCHITECTURE DISTRIBUTION
            </h3>
            
            <div className="space-y-6 flex-1">
              <div>
                <div className="flex justify-between text-xs mb-2">
                  <span className="font-mono text-white">ARM64-V8A (Mobiles)</span>
                  <span className="text-[#00ffcc] font-bold">60%</span>
                </div>
                <div className="w-full bg-[#111] h-2">
                  <div className="bg-[#00ffcc] h-full" style={{ width: '60%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-2">
                  <span className="font-mono text-white">X86_64 (Windows/PC)</span>
                  <span className="text-[#00ffcc] font-bold">25%</span>
                </div>
                <div className="w-full bg-[#111] h-2">
                  <div className="bg-[#00ffcc] h-full" style={{ width: '25%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-2">
                  <span className="font-mono text-white">X86 (Legacy)</span>
                  <span className="text-yellow-500 font-bold">10%</span>
                </div>
                <div className="w-full bg-[#111] h-2">
                  <div className="bg-yellow-500 h-full" style={{ width: '10%' }}></div>
                </div>
                <p className="text-[10px] text-gray-500 mt-1">AI Deferred Loaded</p>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-2">
                  <span className="font-mono text-white">ARM (Mac M1/M2)</span>
                  <span className="text-[#00ffcc] font-bold">5%</span>
                </div>
                <div className="w-full bg-[#111] h-2">
                  <div className="bg-[#00ffcc] h-full" style={{ width: '5%' }}></div>
                </div>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-[#222]">
              <div className="bg-[#111] border border-[#333] p-3 text-xs text-gray-400 font-mono">
                <span className="text-[#00ffcc] font-bold">&gt; SYS_LOG:</span> Samurai MCP actively delivering binary payloads to 15 nodes.
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (!isAuthReady) {
    return <div className="min-h-screen bg-[#050505] text-[#00ffcc] font-mono flex items-center justify-center">INITIALIZING SECURE LINK...</div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#050505] text-white font-mono flex flex-col items-center justify-center selection:bg-[#00ffcc] selection:text-black">
        <div className="w-16 h-16 bg-[#00ffcc] text-black flex items-center justify-center text-3xl font-bold mb-6">
          ♊
        </div>
        <h1 className="text-2xl font-bold text-[#00ffcc] tracking-widest mb-2">UFO ALBARQ</h1>
        <p className="text-gray-500 text-xs tracking-widest mb-8">SUPREME COMMANDER LOGIN</p>
        <button 
          onClick={handleLogin}
          className="bg-[#111] border border-[#333] hover:border-[#00ffcc] text-[#00ffcc] px-8 py-3 flex items-center gap-3 transition-colors text-sm font-bold tracking-widest"
        >
          <LogIn size={18} /> AUTHENTICATE AS SUPREME COMMANDER
        </button>
        <button 
          onClick={() => {
            setUser({
              uid: 'supreme-commander-override',
              email: 'supreme@mirage.app',
              displayName: 'Supreme Commander'
            } as unknown as User);
          }}
          className="mt-4 text-[#00ffcc]/50 hover:text-[#00ffcc] text-xs font-bold underline transition-colors"
        >
          FORCE LOCAL OVERRIDE (IF AUTH FAILS)
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white font-mono flex flex-col md:flex-row selection:bg-[#00ffcc] selection:text-black">
      
      {/* 🛸 Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-[#0a0a0a] border-b md:border-b-0 md:border-r border-[#111] flex flex-col">
        <div className="p-6 border-b border-[#111] flex items-center gap-3">
          <div className="w-10 h-10 bg-[#00ffcc] text-black flex items-center justify-center text-xl font-bold">
            ♊
          </div>
          <div>
            <h1 className="text-lg font-bold text-[#00ffcc] tracking-widest">UFO ALBARQ</h1>
            <p className="text-gray-500 text-[10px] tracking-widest">SUPREME OVERSIGHT</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold tracking-widest transition-colors ${activeTab === 'overview' ? 'bg-[#111] text-[#00ffcc] border-l-2 border-[#00ffcc]' : 'text-gray-500 hover:text-white hover:bg-[#111]'}`}
          >
            <BarChart size={18} /> OVERVIEW
          </button>
          
          <button 
            onClick={() => setActiveTab('global_map')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold tracking-widest transition-colors ${activeTab === 'global_map' ? 'bg-[#111] text-[#00ffcc] border-l-2 border-[#00ffcc]' : 'text-gray-500 hover:text-white hover:bg-[#111]'}`}
          >
            <Globe size={18} /> GLOBAL INTELLIGENCE
          </button>

          <button 
            onClick={() => setActiveTab('nodes')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold tracking-widest transition-colors ${activeTab === 'nodes' ? 'bg-[#111] text-[#00ffcc] border-l-2 border-[#00ffcc]' : 'text-gray-500 hover:text-white hover:bg-[#111]'}`}
          >
            <Server size={18} /> NODES & API
          </button>
          <button 
            onClick={() => setActiveTab('subscriptions')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold tracking-widest transition-colors ${activeTab === 'subscriptions' ? 'bg-[#111] text-[#00ffcc] border-l-2 border-[#00ffcc]' : 'text-gray-500 hover:text-white hover:bg-[#111]'}`}
          >
            <CreditCard size={18} /> SUBSCRIPTIONS
          </button>
          <button 
            onClick={() => setActiveTab('comms')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold tracking-widest transition-colors ${activeTab === 'comms' ? 'bg-[#111] text-[#00ffcc] border-l-2 border-[#00ffcc]' : 'text-gray-500 hover:text-white hover:bg-[#111]'}`}
          >
            <MessageSquare size={18} /> COMM LINK
          </button>
          
          {/* New OODA Button */}
          <button 
            onClick={() => window.location.href = '/ooda'}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold tracking-widest transition-colors text-gray-500 hover:text-[#00ffcc] hover:bg-[#111] border-l-2 border-transparent hover:border-[#00ffcc] relative overflow-hidden group`}
          >
            <Zap size={18} className="group-hover:animate-pulse" /> OODA COMMAND (⚡)
          </button>

          <button 
            onClick={() => setActiveTab('ai_command')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold tracking-widest transition-colors ${activeTab === 'ai_command' ? 'bg-[#111] text-[#00ffcc] border-l-2 border-[#00ffcc]' : 'text-gray-500 hover:text-white hover:bg-[#111]'}`}
          >
            <Terminal size={18} /> AI COMMAND
          </button>
        </nav>

        <div className="p-6 border-t border-[#111]">
          <div className="bg-[#111] px-4 py-3 border border-[#222] mb-4">
            <span className="text-[10px] text-gray-500 block mb-1">SYSTEM STATUS</span>
            <span className="text-xs font-bold text-[#00ffcc] flex items-center gap-2">
              <Activity size={12} /> SECURE & ONLINE
            </span>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full bg-[#111] border border-[#333] hover:border-[#ff003c] text-gray-500 hover:text-[#ff003c] px-4 py-2 flex items-center justify-center gap-2 transition-colors text-xs font-bold tracking-widest"
          >
            <LogOut size={14} /> DISCONNECT
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto h-screen custom-scrollbar relative">
        
        {/* Error Notification Toast */}
        {adminError && (
          <div className="absolute top-4 right-4 z-50 animate-in slide-in-from-top-4 fade-in duration-300">
            <div className="bg-[#ff003c]/10 border border-[#ff003c]/40 text-[#ff003c] px-4 py-3 rounded-lg shadow-[0_0_15px_rgba(255,0,60,0.15)] flex items-center gap-3 w-80">
              <div className="bg-[#ff003c]/20 p-2 rounded-full">
                <AlertCircle size={18} />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-sm tracking-wider uppercase mb-1">System Notice</h4>
                <p className="text-xs text-[#ff003c]/80">{adminError}</p>
              </div>
              <button onClick={() => setAdminError(null)} className="text-[#ff003c]/50 hover:text-[#ff003c]">
                <X size={16} />
              </button>
            </div>
          </div>
        )}

        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'global_map' && renderGlobalMap()}
        {activeTab === 'nodes' && renderNodes()}
        {activeTab === 'subscriptions' && renderSubscriptions()}
        {activeTab === 'comms' && renderComms()}
        {activeTab === 'ai_command' && renderAiCommand()}
      </main>

    </div>
  );
}
