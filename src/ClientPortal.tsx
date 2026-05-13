import React, { useState, useEffect, useRef } from 'react';
import { Shield, Globe, Lock, Zap, Settings, X, Activity, ArrowDown, ArrowUp, User, Terminal, ChevronRight, Server, Star, Crown, Gamepad2, Share2, MessageSquare, Bot, CloudUpload, Cpu, Signal, AlertTriangle, Trash2, Moon, Sun, Menu, PlaySquare, Image as ImageIcon } from 'lucide-react';
import FloatingGold from './FloatingGold';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslations } from './useTranslations';
import { mirageCloudEngine } from './services/MirageCloudEngine';
import { collection, addDoc, query, orderBy, onSnapshot, doc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { handleAppError, ErrorSeverity } from './lib/errorHandler';

type NodeStatus = 'ACTIVE' | 'BUSY' | 'OFFLINE' | 'REROUTING';

interface MirageNode {
  id: string;
  name: string;
  status: NodeStatus;
  ping: number;
  loadPercentage: number;
  encryptionLevel: string;
  uploadSpeed: string;
  downloadSpeed: string;
}

const AutoScrollingVerticalChat = () => {
  const pages = ["جاري فحص النطاق...", "Ali_Gamer: البنج أسطوري!", "Mirage: حماية 100%"];
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPage((prev) => (prev + 1) % pages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [pages.length]);

  return (
    <div className="w-[160px] h-[45px] bg-[#00FFDD]/10 border border-[#00FFDD]/40 rounded-lg px-2 flex items-center shadow-[0_0_10px_rgba(0,255,221,0.1)] overflow-hidden relative pointer-events-auto backdrop-blur-sm" dir="rtl">
      {/* Content wrapper */}
      <div className="flex-1 relative h-full flex items-center pr-1">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={currentPage}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="absolute w-full truncate text-[11px] font-medium text-[#00FFDD] leading-tight"
          >
             {pages[currentPage]}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dots Indicator */}
      <div className="flex flex-col justify-center items-center h-full gap-1 pl-1 border-r border-[#00FFDD]/20 mr-1 shrink-0 w-2">
        {pages.map((_, i) => {
          const active = currentPage === i;
          return (
            <motion.div 
              key={i}
              animate={{ 
                height: active ? 5 : 3, 
                width: active ? 5 : 3, 
                backgroundColor: active ? '#9D00FF' : 'rgba(156, 163, 175, 0.5)'
              }}
              className="rounded-full"
            />
          );
        })}
      </div>
    </div>
  );
};

class ErrorHandler extends React.Component<React.PropsWithChildren<{}>, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) return <div style={{color: '#00ffcc', textAlign: 'center', marginTop: '20vh', fontFamily: 'monospace', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '2px'}}>System Stabilizing...<br/>Auto-Healing Protocol Initiated.</div>;
    return this.props.children;
  }
}

function ClientPortalInner() {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [showConnectedText, setShowConnectedText] = useState(false);
  const [isGhostPilotActive, setIsGhostPilotActive] = useState(false);
  // BG removed
  
  // Protocol Selection State - Fetched and synced via Cloud Engine
  const [selectedProtocol, setSelectedProtocol] = useState('AUTO'); // Defaulted to cloud sync logic
  const [isSyncingProtocol, setIsSyncingProtocol] = useState(false);

  const [isSettingsSheetOpen, setIsSettingsSheetOpen] = useState(false);
  const [settingsView, setSettingsView] = useState<'MAIN' | 'PROTOCOL' | 'SUBSCRIPTIONS' | 'GAMING' | 'REFERRAL' | 'SERVERS' | 'LANGUAGE' | 'REVIEWS' | 'CHAT'>('MAIN');

  // GitHub Modal State
  const [isGithubModalOpen, setIsGithubModalOpen] = useState(false);
  const [githubToken, setGithubToken] = useState('');
  const [githubRepo, setGithubRepo] = useState('UFO-Albarq');
  const [isRepoPrivate, setIsRepoPrivate] = useState(false);
  const [githubStatus, setGithubStatus] = useState<'IDLE'|'PUSHING'|'SUCCESS'|'ERROR'>('IDLE');
  const [githubMessage, setGithubMessage] = useState('');



  // --- Integrated Features requested by User ---
  const [messages, setMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [darkMode, setDarkMode] = useState(true); // Default to dark (Mirage standard)
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);

  const speedData = [
    { name: '1s', download: 45, upload: 12, ping: 15 },
    { name: '2s', download: 52, upload: 15, ping: 12 },
    { name: '3s', download: 48, upload: 10, ping: 18 },
    { name: '4s', download: 50, upload: 14, ping: 16 },
    { name: '5s', download: 53, upload: 18, ping: 11 },
  ];

  // --- Firebase Chat Logic ---
  useEffect(() => {
    const q = query(collection(db, "chats"), orderBy("timestamp", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => doc.data()));
    }, (error) => {
      console.error("Chat sync error:", error);
    });
    return () => unsubscribe();
  }, []);

  const sendMessage = async () => {
    if (chatInput.trim()) {
      const userMessage = chatInput;
      setChatInput(''); // Clear immediately for UX
      try {
        await addDoc(collection(db, "chats"), {
          text: userMessage,
          timestamp: Date.now(),
          sender: "Client"
        });

        // Simulating Mirage AI Auto-Reply
        setTimeout(async () => {
             const aiResponses = [
                 "I operate in the shadows. Your connection is secured.",
                 "Routing metrics optimal. How else can I assist?",
                 "Quantum encryption keys rotated successfully.",
                 "Detecting zero anomalies on the current tunnel.",
                 "Hysteria2 link maintaining velocity.",
                 "Mission acknowledged.",
             ];
             const randomReply = aiResponses[Math.floor(Math.random() * aiResponses.length)];
             try {
                await addDoc(collection(db, "chats"), {
                  text: randomReply,
                  timestamp: Date.now(),
                  sender: "AI"
                });
             } catch (e) {
                 console.error("AI Reply failed: ", e);
             }
        }, 1500); // 1.5 second delay

      } catch (err) {
        handleAppError(err, "Failed to send message", ErrorSeverity.ERROR);
      }
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };
  // ------------------------------------------
  
  const detectSystemLanguage = () => {
    try {
      const navLang = navigator.language.toLowerCase();
      if (navLang.startsWith('ar')) return 'Arabic (العربية)';
      if (navLang.startsWith('zh')) return 'Chinese (中文)';
      if (navLang.startsWith('es')) return 'Spanish (Español)';
      if (navLang.startsWith('fr')) return 'French (Français)';
      if (navLang.startsWith('de')) return 'German (Deutsch)';
      if (navLang.startsWith('ru')) return 'Russian (Русский)';
      if (navLang.startsWith('ja')) return 'Japanese (日本語)';
      if (navLang.startsWith('tr')) return 'Turkish (Türkçe)';
      if (navLang.startsWith('hi')) return 'Hindi (हिन्दी)';
      if (navLang.startsWith('it')) return 'Italian (Italiano)';
      if (navLang.startsWith('pt')) return 'Portuguese (Português)';
      if (navLang.startsWith('ko')) return 'Korean (한국어)';
      if (navLang.startsWith('vi')) return 'Vietnamese (Tiếng Việt)';
      if (navLang.startsWith('pl')) return 'Polish (Polski)';
      if (navLang.startsWith('nl')) return 'Dutch';
      if (navLang.startsWith('id')) return 'Indonesian';
      if (navLang.startsWith('th')) return 'Thai';
      if (navLang.startsWith('fa')) return 'Persian';
      if (navLang.startsWith('ur')) return 'Urdu';
      if (navLang.startsWith('bn')) return 'Bengali';
      return 'English';
    } catch {
      return 'English';
    }
  };

  const langCodeToName: Record<string, string> = {
    'ar': 'Arabic (العربية)', 'en': 'English', 'fr': 'French (Français)',
    'tr': 'Turkish (Türkçe)', 'zh': 'Chinese (中文)', 'es': 'Spanish (Español)',
    'de': 'German (Deutsch)', 'ru': 'Russian (Русский)', 'ja': 'Japanese (日本語)',
    'hi': 'Hindi (हिन्दी)', 'it': 'Italian (Italiano)', 'pt': 'Portuguese (Português)',
    'nl': 'Dutch', 'sv': 'Swedish', 'no': 'Norwegian', 'fi': 'Finnish',
    'pl': 'Polish', 'cs': 'Czech', 'el': 'Greek', 'ko': 'Korean (한국어)',
    'id': 'Indonesian', 'ms': 'Malay', 'th': 'Thai', 'vi': 'Vietnamese (Tiếng Việt)',
    'uk': 'Ukrainian', 'ro': 'Romanian', 'bg': 'Bulgarian', 'sr': 'Serbian',
    'hr': 'Croatian', 'sk': 'Slovak', 'hu': 'Hungarian', 'fa': 'Persian',
    'ur': 'Urdu', 'bn': 'Bengali', 'ta': 'Tamil', 'te': 'Telugu',
    'ml': 'Malayalam', 'sw': 'Swahili', 'he': 'Hebrew', 'az': 'Azerbaijani'
  };

  const getFlag = (code: string) => {
      const flags: Record<string, string> = {
        'ar': '🇸🇦', 'en': '🇬🇧', 'fr': '🇫🇷', 'tr': '🇹🇷', 'zh': '🇨🇳', 'es': '🇪🇸',
        'de': '🇩🇪', 'ru': '🇷🇺', 'ja': '🇯🇵', 'hi': '🇮🇳', 'it': '🇮🇹', 'pt': '🇵🇹',
        'nl': '🇳🇱', 'sv': '🇸🇪', 'no': '🇳🇴', 'fi': '🇫🇮', 'pl': '🇵🇱', 'cs': '🇨🇿',
        'el': '🇬🇷', 'ko': '🇰🇷', 'id': '🇮🇩', 'ms': '🇲🇾', 'th': '🇹🇭', 'vi': '🇻🇳',
        'uk': '🇺🇦', 'ro': '🇷🇴', 'bg': '🇧🇬', 'sr': '🇷🇸', 'hr': '🇭🇷', 'sk': '🇸🇰',
        'hu': '🇭🇺', 'fa': '🇮🇷', 'ur': '🇵🇰', 'bn': '🇧🇩', 'ta': '🇮🇳', 'te': '🇮🇳',
        'ml': '🇮🇳', 'sw': '🇰🇪', 'he': '🇮🇱', 'az': '🇦🇿'
      };
      return flags[code] || '🌐';
  };

  const [availableLanguages, setAvailableLanguages] = useState<any[]>([{ name: 'English', code: 'en', flag: '🇬🇧' }]);
  const [isLoadingLanguages, setIsLoadingLanguages] = useState(true);
  const [appLanguage, setAppLanguage] = useState(detectSystemLanguage());

  useEffect(() => {
    const docRef = doc(db, "languages", "default");
    const unsubscribe = onSnapshot(docRef, (snapshot) => {
      if (snapshot && snapshot.exists()) {
        const data = snapshot.data();
        
        // Parse supported languages
        const supported = data?.supported || ['en'];
        const mappedLangs = supported.map((code: string) => ({
           name: langCodeToName[code] || 'English',
           code: code,
           flag: getFlag(code)
        }));
        setAvailableLanguages(mappedLangs);

        // Parse fallback/current global language
        const fallback = data?.fallback || 'en';
        const nameFallback = langCodeToName[fallback] || 'English';
        console.log(`Global language updated from cloud: ${fallback}`);
        setAppLanguage(nameFallback);
      } else {
        console.log("No global languages found, applying fallback...");
        setAvailableLanguages(Object.keys(langCodeToName).map(code => ({
            name: langCodeToName[code],
            code: code,
            flag: getFlag(code)
        })));
      }
      setIsLoadingLanguages(false);
    }, (error) => {
       console.error(`Error fetching global languages: ${error.message}`);
       setIsLoadingLanguages(false);
    });

    return () => unsubscribe();
  }, []);

  const handleChangeLanguage = async (code: string, name: string) => {
    setAppLanguage(name);
    try {
        const docRef = doc(db, 'languages', 'default');
        await updateDoc(docRef, {
            fallback: code,
            timestamp: serverTimestamp()
        });
    } catch (e) {
        console.error('Error updating global language', e);
    }
  };


  const isRTL = ['Arabic (العربية)', 'Hebrew', 'Persian', 'Urdu'].includes(appLanguage);

  const { getTranslation, getLocalizedReviewsData, syncToCloud, isAdmin } = useTranslations(appLanguage);
  
  const t = getTranslation(appLanguage);
  const localizedReviews = getLocalizedReviewsData(appLanguage);

  // --- Auto-Pricing & AI Wallet States ---
  const [walletBalance, setWalletBalance] = useState(0);
  const [isProcessingTx, setIsProcessingTx] = useState(false);
  const [txType, setTxType] = useState<'DEPOSIT' | 'WITHDRAW' | 'SUBSCRIPTION' | null>(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [activePlan, setActivePlan] = useState<string | null>(null);
  const [walletError, setWalletError] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [pendingPlanSub, setPendingPlanSub] = useState<{name: string, cost: number} | null>(null);

  // --- Ad Watch States ---
  const [adsWatched, setAdsWatched] = useState(0);
  const [isWatchingAd, setIsWatchingAd] = useState(false);

  // --- Reviews Slider State ---
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);

  // --- Real-time Servers Speeds ---
  const initialBaseServers = [
    { id: 'auto', name: 'Auto-Select (Best)', ping: 12 },
    { id: 'sa-ruh', name: 'Saudi Arabia - Riyadh', ping: 25 },
    { id: 'us-nyi', name: 'United States - New York', ping: 110 },
    { id: 'de-fra', name: 'Germany - Frankfurt', ping: 80 },
    { id: 'ae-dxb', name: 'UAE - Dubai', ping: 35 },
    { id: 'jp-tyo', name: 'Japan - Tokyo', ping: 190 },
    { id: 'gb-lon', name: 'UK - London', ping: 75 },
    { id: 'sg-sin', name: 'Singapore', ping: 150 },
    { id: 'fr-par', name: 'France - Paris', ping: 82 },
    { id: 'ca-tor', name: 'Canada - Toronto', ping: 120 },
    { id: 'au-syd', name: 'Australia - Sydney', ping: 210 },
    { id: 'in-mum', name: 'India - Mumbai', ping: 140 },
    { id: 'br-sao', name: 'Brazil - São Paulo', ping: 180 }
  ];
  const [serverList, setServerList] = useState(initialBaseServers);
  const [selectedServer, setSelectedServer] = useState('auto');

  // Server Ping Dynamic Fluctuations
  useEffect(() => {
    if (settingsView !== 'SERVERS') return;
    const interval = setInterval(() => {
      setServerList(prev => prev.map(s => {
        if (s.id === 'auto') return { ...s, ping: Math.max(10, s.ping + Math.floor(Math.random() * 5) - 2) };
        return { ...s, ping: Math.max(20, s.ping + Math.floor(Math.random() * 11) - 5) };
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, [settingsView]);

  // Review Slider Auto-Rotate
  useEffect(() => {
    if (!isSettingsSheetOpen) return;
    const reviewInterval = setInterval(() => {
      setCurrentReviewIndex(prev => (prev + 1) % localizedReviews.length);
    }, 4000);
    return () => clearInterval(reviewInterval);
  }, [isSettingsSheetOpen, localizedReviews.length]);

  // AI Wallet Processor
  const processAITransaction = (type: 'DEPOSIT' | 'WITHDRAW', amountStr: string, isFromModal = false) => {
    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount <= 0) return;
    
    setIsProcessingTx(true);
    setTxType(type);
    if (isFromModal) {
      setShowPaymentModal(false);
    }

    // Simulate AI securely processing via Cloud nodes
    setTimeout(() => {
      if (type === 'DEPOSIT') {
        const aiFee = +(amount * 0.015).toFixed(2); // 1.5% network fee
        setWalletBalance(prev => prev + (amount - aiFee));
        
        // If they had a pending subscription, try to process it now
        if (pendingPlanSub && (walletBalance + (amount - aiFee)) >= pendingPlanSub.cost) {
          setTimeout(() => {
            processAISubscription(pendingPlanSub.name, pendingPlanSub.cost);
            setPendingPlanSub(null);
          }, 500);
        } else {
          setPendingPlanSub(null);
        }
      } else if (type === 'WITHDRAW') {
        const aiFee = +(amount * 0.02).toFixed(2); // 2% exit network fee
        if (walletBalance >= amount) {
          setWalletBalance(prev => prev - amount);
        }
      }
      setIsProcessingTx(false);
      setTxType(null);
      setDepositAmount('');
    }, 2500);
  };

  const processAISubscription = (planName: string, cost: number) => {
    setWalletError(null);
    if (walletBalance >= cost) {
      setIsProcessingTx(true);
      setTxType('SUBSCRIPTION');
      setTimeout(() => {
        setWalletBalance(prev => prev - cost);
        setActivePlan(planName);
        setIsProcessingTx(false);
        setTxType(null);
      }, 2000);
    } else {
      setWalletError(isRTL ? 'الرصيد غير كافٍ. يرجى إيداع أموال.' : 'Insufficient balance. Please deposit funds.');
      setPendingPlanSub({ name: planName, cost });
      setTimeout(() => setWalletError(null), 3000);
      setTimeout(() => setShowPaymentModal(true), 500);
    }
  };

  const processWatchAd = () => {
    if (isWatchingAd) return;
    setIsWatchingAd(true);
    setTimeout(() => {
      setIsWatchingAd(false);
      setAdsWatched(prev => {
        const newCount = prev + 1;
        if (newCount >= 5) {
          setActivePlan('daily-pass');
        }
        return newCount;
      });
    }, 3000); // simulate a 3s ad for testing
  };

  const [nodeData, setNodeData] = useState<MirageNode>({
    id: 'mirage-alpha-1',
    name: 'Mirage Quantum Node',
    status: 'OFFLINE',
    ping: 0,
    loadPercentage: 0,
    encryptionLevel: 'Quantum-256bit',
    uploadSpeed: '0.0',
    downloadSpeed: '0.0'
  });

  // BG loading removed

  // Heartbeat & Ghost Pilot
  const [commanderAlert, setCommanderAlert] = useState<string | null>(null);

  // === SmartConnector (FlexibleConnection with HTTP Fallback) ===
  useEffect(() => {
    let socket: WebSocket | null = null;
    let fallbackInterval: NodeJS.Timeout | null = null;
    let retryCount = 0;
    const maxRetries = 5;

    function startPollingFallback() {
      console.warn("فشل WebSocket تماماً. الانتقال إلى وضع HTTP Polling لضمان الاستمرارية.");
      if (fallbackInterval) return;
      
      fallbackInterval = setInterval(async () => {
        try {
          const res = await fetch('/api/telemetry-fallback');
          if (res.ok) {
            const data = await res.json();
            if (data.type === 'TELEMETRY') {
              updateTelemetry(data);
            }
          }
        } catch (e) {
            // Ignore fetch errors during fallback
        }
      }, 3000);
    }

    function updateTelemetry(data: any) {
        setNodeData(prev => ({
          ...prev,
          ping: data.ping,
          uploadSpeed: data.ul,
          downloadSpeed: data.dl,
          status: 'ONLINE',
          loadPercentage: Math.floor(Math.random() * (45 - 30 + 1)) + 30,
        }));
        
        // تحديث الواجهة وتدقيق الـ Ping - تصحيح ذكي
        if (data.ping > 80 && !isGhostPilotActive) {
            console.log("تحسين المسار تلقائياً..."); // إجراء صامت للحفاظ على جودة الـ 54ms
            setIsGhostPilotActive(true);
            setCommanderAlert("HIGH LATENCY DETECTED. AI SENTINEL REROUTING SILENTLY (Mesh/Satellite)...");
        }
    }

    function connect() {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      socket = new WebSocket(`${protocol}//${window.location.host}/api/telemetry`);

      socket.onopen = () => {
        console.log("✅ [Mirage Bridge]: المزامنة مع Google Cloud & Firebase نشطة (WebSocket)");
        retryCount = 0; // تصفير العداد عند النجاح
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'TELEMETRY') {
            updateTelemetry(data);
          }
        } catch (e) {
          // Silently handle parse errors
        }
      };

      socket.onerror = (error) => {
        console.error("⚠️ [Mirage Bridge]: خطأ في WebSocket، يتم الآن تفعيل وضع المرونة...");
      };

      socket.onclose = () => {
        // إذا أغلق بدون سبب واضح، حاول مجدداً
        if (retryCount < maxRetries) {
            retryCount++;
            let delay = Math.pow(2, retryCount) * 1000; 
            console.log(`إعادة محاولة خلال ${delay/1000} ثانية...`);
            setTimeout(() => connect(), delay);
        } else {
            startPollingFallback();
        }
      };
    }

    if (isConnected) {
      connect();
    } else {
      setNodeData(prev => ({ ...prev, status: 'OFFLINE', ping: 0, loadPercentage: 0, uploadSpeed: '0.0', downloadSpeed: '0.0' }));
    }

    return () => {
      if (socket) {
        socket.onclose = null; // Prevent reconnect loop on unmount
        socket.onerror = null;
        if (socket.readyState === 1 || socket.readyState === 0) { // OPEN or CONNECTING
            socket.close();
        }
      }
      if (fallbackInterval) {
        clearInterval(fallbackInterval);
      }
    };
  }, [isConnected, isGhostPilotActive]);

  useEffect(() => {
    // Sync telemetry to Firestore
    if (!isConnected) return;
    try {
      const connRef = doc(db, 'connections', 'user_live_session');
      setDoc(connRef, {
        uploadSpeed: nodeData.uploadSpeed,
        downloadSpeed: nodeData.downloadSpeed,
        ping: nodeData.ping,
        status: nodeData.status,
        ghostMode: isGhostPilotActive,
        timestamp: new Date().toISOString()
      }, { merge: true }).catch(console.warn);
    } catch (e) {
      console.warn('Error syncing telemetry to Firestore: ', e);
    }
  }, [nodeData, isConnected, isGhostPilotActive]);

  const [buttonState, setButtonState] = useState<'IDLE' | 'DISSOLVE' | 'PERFECT' | 'STEALTH'>('IDLE');

  const requestCloudAction = async (actionType: string) => {
    if (isConnecting) return;
    setIsConnecting(true);

    try {
      if (actionType === 'CONNECT') {
        const cloudResponse = await mirageCloudEngine.execute(actionType);
        
        if (cloudResponse.action === 'ERROR') {
          handleAppError(cloudResponse.reason, isRTL ? 'الرجاء المحاولة مرة أخرى' : 'Connection Error', ErrorSeverity.ERROR);
          setButtonState('IDLE');
          setIsConnecting(false);
          setIsConnected(false);
          return;
        }

        setIsConnected(true);
        setShowConnectedText(true);
        
        // Logic Gate: Check Protocol from response
        if (cloudResponse.protocol === 'VLESS' || cloudResponse.action === 'REROUTE') {
           setButtonState('STEALTH');
        } else {
           setButtonState('PERFECT');
        }

        const serverName = serverList.find(s => s.id === selectedServer)?.name || 'Mirage Cloud Node';
        setNodeData(prev => ({ 
          ...prev, 
          name: serverName, 
          encryptionLevel: cloudResponse.protocol || 'HYSTERIA2',
          status: 'ACTIVE',
          ping: cloudResponse.latency || Math.floor(Math.random() * 50) + 15
        }));
        
        setTimeout(() => setShowConnectedText(false), 3000);
      } else if (actionType === 'DISCONNECT') {
        setIsConnected(false);
        setButtonState('IDLE');
        setShowConnectedText(false);
        setIsGhostPilotActive(false);
        setNodeData(prev => ({ ...prev, status: 'OFFLINE', ping: 0, loadPercentage: 0, uploadSpeed: '0.0', downloadSpeed: '0.0' }));
      }
    } catch (error) {
       handleAppError(error, "Failed to communicate with Mirage Cloud", ErrorSeverity.CRITICAL);
       setButtonState('IDLE');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleConnect = () => {
    if (!isConnected) {
      setButtonState('DISSOLVE');
      // Adding a slight delay to show the dissolve effect clearly before network resolves
      setTimeout(() => {
        requestCloudAction('CONNECT');
        if (typeof (window as any).startVpnTunnel === 'function') {
           (window as any).startVpnTunnel();
        } else if ((window as any).Android && typeof (window as any).Android.startVpnTunnel === 'function') {
           (window as any).Android.startVpnTunnel();
        }
      }, 800);
    } else {
      requestCloudAction('DISCONNECT');
    }
  };

  const handleProtocolSelect = async (protocol: string) => {
    setIsSyncingProtocol(true);
    
    try {
      const response = await mirageCloudEngine.execute('SYNC_CONFIG', { protocol });
      
      if (response.action === 'SYNC_CONFIG') {
        setSelectedProtocol(protocol);
        if (isConnected) {
          setNodeData(prev => ({ ...prev, encryptionLevel: protocol === 'AUTO' ? 'Quantum-256bit' : protocol }));
        }
      } else {
        handleAppError(new Error("Cloud response validation failed"), isRTL ? 'فشل المزامنة مع السحابة' : 'Failed to sync with cloud', ErrorSeverity.ERROR);
      }
    } catch (e) {
      handleAppError(e, isRTL ? 'خطأ في الاتصال بسحابة ميراج' : 'Error connecting to Mirage Cloud', ErrorSeverity.CRITICAL);
    } finally {
      setIsSyncingProtocol(false);
      setIsSettingsSheetOpen(false);
    }
  };

  const [secretTapCount, setSecretTapCount] = useState(0);
  const handleSecretTap = () => {
    setSecretTapCount(prev => {
      const newCount = prev + 1;
      if (newCount >= 7) {
        const key = prompt("MIRAGE SECURITY: Enter Command Key");
        if (key) {
           window.open(`/hq/${key}`, '_blank');
        }
        return 0;
      }
      return newCount;
    });
  };

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className={`relative w-full h-screen ${darkMode ? 'bg-[#050B14]' : 'bg-gray-100'} overflow-hidden flex flex-col items-center font-sans transition-colors duration-500`}>
      
      {/* Dynamic Background */}
      <div 
        className="absolute inset-0 w-full h-full z-0 flex flex-col items-center justify-center pointer-events-none"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#00FFDD]/5 via-[#050B14] to-[#050B14]"></div>
      </div>

      {/* Minimal Top Bar */}
      <div className="absolute top-4 right-4 flex gap-2 z-50">
        <button 
          onClick={() => setIsSettingsSheetOpen(true)}
          className="w-10 h-10 bg-black/40 rounded-full text-[#00FFDD] flex items-center justify-center backdrop-blur-sm border border-[#00FFDD]/30 hover:bg-[#00FFDD]/20 transition-colors shadow-[0_0_10px_rgba(0,255,221,0.2)]"
        >
          <Settings className="w-5 h-5" />
        </button>
        <button 
          onClick={toggleDarkMode}
          className="w-10 h-10 bg-black/40 rounded-full text-purple-400 flex items-center justify-center backdrop-blur-sm border border-purple-500/30 hover:bg-purple-500/20 transition-colors"
        >
          {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>

      <div className="absolute top-4 left-4 z-50 flex gap-2">
        <button 
          onClick={() => {
              setIsGithubModalOpen(true);
              setGithubStatus('IDLE');
              setGithubMessage('');
          }}
          className="w-10 h-10 bg-black/40 rounded-full text-[#00FFDD] flex items-center justify-center backdrop-blur-sm border border-[#00FFDD]/30 hover:bg-[#00FFDD]/20 transition-colors shadow-[0_0_10px_rgba(0,255,221,0.2)]"
          title="Upload to GitHub"
        >
          <CloudUpload className="w-5 h-5" />
        </button>
        <button 
          onClick={() => {
            const a = document.createElement('a');
            a.href = '/api/v1/download-source';
            a.download = 'UFO_ALBARQ_MIRAGE.zip';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          }}
          className="w-10 h-10 bg-black/40 rounded-full text-[#FFE58F] flex items-center justify-center backdrop-blur-sm border border-[#FFE58F]/30 hover:bg-[#FFE58F]/20 transition-colors shadow-[0_0_10px_rgba(255,229,143,0.2)]"
          title="Download Zip"
        >
          <ArrowDown className="w-5 h-5" />
        </button>
      </div>

      {/* Auto Scrolling Live Telemetry Chat (Like Jetpack Compose) */}
      <div className="absolute top-[90px] right-4 z-[45]">
        <AutoScrollingVerticalChat />
      </div>

      {/* COMMANDER CRITICAL ALERT OVERLAY (Manual triggers) */}
      {commanderAlert && (
         <div className="absolute top-16 left-4 right-4 z-[60] bg-black/90 border-2 border-[#ff003c] rounded-xl p-4 shadow-[0_0_30px_rgba(255,0,60,0.5)] animate-in slide-in-from-top-10 fade-in duration-300 pointer-events-auto">
           <div className="flex items-start justify-between">
             <div className="flex items-center gap-2 text-[#ff003c] mb-2">
               <AlertTriangle className="w-5 h-5 animate-pulse" />
               <h3 className="font-bold text-sm tracking-widest uppercase">Safety Protocol Triggered</h3>
             </div>
             <button onClick={() => setCommanderAlert(null)} className="text-white/50 hover:text-white">
               <X className="w-5 h-5" />
             </button>
           </div>
           <p className="text-white/90 text-xs font-mono leading-relaxed">
             {commanderAlert}
           </p>
         </div>
      )}

      {/* Main Content Container - Unified Mirage Version 2 */}
      <div className="absolute inset-0 z-20 w-full h-full pointer-events-none flex flex-col items-center justify-between px-6 pt-12 pb-6 font-sans">
          <div className="pointer-events-auto flex flex-col items-center text-center w-full max-w-sm mt-8">
             
             {/* العنوان الرئيسي (احتفظنا به كعنوان للبراند) */}
             <h3 className="text-[#B280FF] font-bold text-xl tracking-widest mb-10">
               MIRAGE TACTICAL
             </h3>
             
             {/* منطقة الأيقونة المركزية المرتبطة بحالة الاتصال */}
             <div className="flex justify-center items-center mb-10 relative">
               {/* المؤشر الذكي (Quantum Aura) */}
               <motion.div 
                 className={`absolute w-[180px] h-[180px] rounded-full blur-2xl z-0 transition-opacity duration-700 ${isConnecting ? 'opacity-80' : isConnected ? 'opacity-50' : 'opacity-20'}`}
                 animate={{ 
                   backgroundColor: isConnecting ? '#FFD700' : isGhostPilotActive ? '#A020F0' : isConnected ? '#50C878' : '#6600FF',
                   scale: isConnecting ? [1, 1.1, 1] : isGhostPilotActive ? [1, 1.2, 0.9, 1] : 1
                 }}
                 transition={{ 
                   duration: isConnecting ? 1.5 : isGhostPilotActive ? 3 : 0.5,
                   repeat: isConnecting || isGhostPilotActive ? Infinity : 0
                 }}
               />
               <div className="relative z-10 flex items-center justify-center p-2 rounded-full transition-colors duration-500">
                  <FloatingGold online={isConnected || isConnecting} signalStrength={isConnected ? 'strong' : 'weak'} size={150} ariaLabel={isGhostPilotActive ? "Ghost Mode Active" : "GOD MODE Active"} />
               </div>
             </div>
             
             {/* معلومات البروتوكول النشط */}
             <div className="flex items-center gap-3 mb-8 w-full justify-center">
                <span className="text-white/60 font-bold">Protocol:</span>
                <span className="text-[#00FFB2] font-bold">XTLS-Reality</span>
             </div>

             {/* زر التحكم الرئيسي */}
             <div className="relative w-[85%] flex justify-center mb-8">
               {/* SignalWave Ripples */}
               <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                  {(isConnected || isConnecting) && [0, 1].map((i) => (
                      <motion.div
                          key={i}
                          className="absolute rounded-[30px]"
                          style={{
                              width: '100%',
                              height: '60px',
                              border: `2px solid ${isConnecting ? '#FFD700' : '#00FF80'}`,
                          }}
                          animate={{
                              scaleX: [1, 1.3],
                              scaleY: [1, 1.8],
                              opacity: [0.6, 0]
                          }}
                          transition={{
                              duration: 2.5,
                              repeat: Infinity,
                              ease: 'easeOut',
                              delay: i * 1.25
                          }}
                      />
                  ))}
               </div>
               
               <button
                 onClick={handleConnect}
                 className="relative z-10 w-full h-[60px] rounded-[30px] font-bold text-[20px] text-white transition-all active:scale-95 duration-500"
                 style={{ 
                   backgroundColor: isConnecting ? 'rgba(255, 178, 0, 1)' : isConnected ? 'rgba(0, 255, 128, 1)' : 'rgba(102, 0, 255, 1)',
                   boxShadow: `0 0 15px ${isConnecting ? 'rgba(255, 178, 0, 0.4)' : isConnected ? 'rgba(0, 255, 128, 0.4)' : 'rgba(102, 0, 255, 0.4)'}`
                 }}
               >
                 {isConnecting ? 'CONNECTING...' : isConnected ? 'SYSTEM LIVE' : 'START SYSTEM'}
               </button>
             </div>
          </div>

          <div className="pointer-events-auto w-full max-w-sm flex flex-col items-center">
             {/* Live Activity Monitor */}
             <div className="flex justify-evenly w-full text-center font-mono mb-6 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] px-4">
                <div className="flex flex-col items-center bg-black/40 px-3 py-2 rounded-lg border border-white/10 w-[30%]">
                  <span className="text-[#2ECC71] text-[10px] font-bold mb-1 tracking-widest leading-none">UL MB/s</span>
                  <span className="text-white text-[16px] font-bold mt-1">{isConnected ? nodeData.uploadSpeed : '--'}</span>
                </div>
                <div className="flex flex-col items-center bg-black/40 px-3 py-2 rounded-lg border border-white/10 w-[30%]">
                  <span className="text-[#00BFFF] text-[10px] font-bold mb-1 tracking-widest leading-none">PING</span>
                  <span id="ping-val" className="text-white text-[16px] font-bold mt-1">{isConnected ? `${nodeData.ping}ms` : '--'}</span>
                </div>
                <div className="flex flex-col items-center bg-black/40 px-3 py-2 rounded-lg border border-white/10 w-[30%]">
                  <span className="text-[#F1C40F] text-[10px] font-bold mb-1 tracking-widest leading-none">DL MB/s</span>
                  <span className="text-white text-[16px] font-bold mt-1">{isConnected ? nodeData.downloadSpeed : '--'}</span>
                </div>
             </div>

             {/* شبكة الأزرار السفلية (Dashboard) */}
             <div className="w-full grid grid-cols-2 gap-4 h-[120px]">
               <button className="bg-[#1A1A33] rounded-md font-bold text-white hover:bg-[#2A2A4D] transition-colors shadow-[0_4px_10px_rgba(0,0,0,0.5)] flex items-center justify-center">
                  METRICS
               </button>
               <button onClick={() => setShowPaymentModal(true)} className="bg-[#1A1A33] rounded-md font-bold text-white hover:bg-[#2A2A4D] transition-colors shadow-[0_4px_10px_rgba(0,0,0,0.5)] flex items-center justify-center">
                  FINANCE
               </button>
               <button onClick={() => setIsSettingsSheetOpen(true)} className="bg-[#1A1A33] rounded-md font-bold text-white hover:bg-[#2A2A4D] transition-colors shadow-[0_4px_10px_rgba(0,0,0,0.5)] flex items-center justify-center">
                  SETTINGS
               </button>
               <button onClick={() => setCommanderAlert("AI SENTINEL ONLINE. OVERSEEING NETWORK.")} className="bg-[#1A1A33] rounded-md font-bold text-white hover:bg-[#2A2A4D] transition-colors shadow-[0_4px_10px_rgba(0,0,0,0.5)] flex items-center justify-center">
                  AI SENTINEL
               </button>
             </div>
          </div>
      </div>




      {/* GitHub Export Modal */}
      {isGithubModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsGithubModalOpen(false)}></div>
          <div className="relative w-full max-w-sm bg-[#050B14] border-2 border-[#00FFDD]/50 rounded-2xl p-6 shadow-[0_0_50px_rgba(0,255,221,0.2)] animate-in zoom-in-95 duration-200">
            <h3 className="text-[#00FFDD] font-space font-bold text-xl mb-2 flex items-center gap-2">
              <CloudUpload className="w-5 h-5" />
              DEPLOY TO GITHUB
            </h3>
            <p className="text-white/60 text-xs mb-6 font-mono leading-relaxed">
              Export UFO ALBARQ directly to your repositories. Enter your Personal Access Token (PAT) with "repo" scope.
            </p>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] text-[#00FFDD] uppercase tracking-wider font-bold mb-1 block">GitHub PAT Token</label>
                <input 
                  type="password" 
                  value={githubToken}
                  onChange={e => setGithubToken(e.target.value.trim())}
                  placeholder="ghp_xxxxxxxxxxxx"
                  className="w-full bg-black/40 border border-white/20 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-[#00FFDD]/50 transition-colors"
                />
                {githubToken && !githubToken.startsWith('ghp_') && !githubToken.startsWith('github_pat_') && (
                  <div className="text-[10px] text-[#FFE58F] mt-1 font-mono">
                    Token format may be unusual. Should usually start with "ghp_".
                  </div>
                )}
              </div>

              <div>
                <label className="text-[10px] text-[#00FFDD] uppercase tracking-wider font-bold mb-1 block">Repository Name</label>
                <input 
                  type="text" 
                  value={githubRepo}
                  onChange={e => setGithubRepo(e.target.value)}
                  className="w-full bg-black/40 border border-white/20 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-[#00FFDD]/50 transition-colors"
                />
              </div>

              <div className="flex items-center gap-2 mt-2">
                <input 
                  type="checkbox" 
                  id="repoVisibility"
                  checked={isRepoPrivate}
                  onChange={e => setIsRepoPrivate(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-600 bg-black/40 text-[#00FFDD] focus:ring-[#00FFDD] focus:ring-offset-black"
                />
                <label htmlFor="repoVisibility" className="text-xs text-white/80 font-mono cursor-pointer">
                  Make repository private
                </label>
              </div>

              {githubMessage && (
                <div className={`text-xs p-3 rounded-lg border ${
                  githubStatus === 'SUCCESS' ? 'bg-[#00FFDD]/10 border-[#00FFDD]/30 text-[#00FFDD]' :
                  githubStatus === 'ERROR' ? 'bg-red-500/10 border-red-500/30 text-red-500' :
                  'bg-[#FFE58F]/10 border-[#FFE58F]/30 text-[#FFE58F]'
                }`}>
                  {githubMessage}
                </div>
              )}

              <div className="flex gap-2 mt-6">
                <button 
                  onClick={() => setIsGithubModalOpen(false)}
                  className="flex-1 py-3 rounded-lg border border-white/10 text-white/50 hover:text-white hover:bg-white/5 transition-colors text-sm font-bold"
                >
                  CANCEL
                </button>
                <button 
                  disabled={githubStatus === 'PUSHING' || !githubToken || !githubRepo}
                  onClick={() => {
                    setGithubStatus('PUSHING');
                    setGithubMessage('Authenticating and compiling source code... Please wait.');
                    fetch("/api/v1/github-export", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ token: githubToken, repoName: githubRepo, isPrivate: isRepoPrivate })
                    })
                    .then(res => res.json())
                    .then(data => {
                        if (data.success) {
                          setGithubStatus('SUCCESS');
                          setGithubMessage(`Mission Accomplished! Exported to: ${data.url}`);
                        } else {
                          setGithubStatus('ERROR');
                          setGithubMessage(`Failed: ${data.error}`);
                        }
                    })
                    .catch(err => {
                      setGithubStatus('ERROR');
                      setGithubMessage(`Error: ${err.message}`);
                    });
                  }}
                  className="flex-1 py-3 rounded-lg bg-[#00FFDD]/20 text-[#00FFDD] border border-[#00FFDD]/50 hover:bg-[#00FFDD]/40 transition-colors text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                >
                  {githubStatus === 'PUSHING' && <div className="w-4 h-4 border-2 border-[#00FFDD] border-t-transparent rounded-full animate-spin"></div>}
                  {githubStatus === 'PUSHING' ? 'PUSHING...' : 'INITIATE UPLOAD'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Sheet */}
      {isSettingsSheetOpen && (
        <div className="absolute inset-0 z-[100] flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => { setIsSettingsSheetOpen(false); setSettingsView('MAIN'); }}></div>
          
          {/* Stable Customer Reviews Slider */}
          <div className="absolute top-24 w-full bg-black/60 backdrop-blur-md border-y border-[#00FFDD]/20 py-2 z-[101] h-[80px] flex items-center justify-center overflow-hidden">
             <div className="flex items-center justify-between w-full max-w-md mx-auto px-4 relative h-full">
               
               <button 
                  onClick={() => setCurrentReviewIndex(prev => prev === 0 ? localizedReviews.length - 1 : prev - 1)}
                  className="z-10 p-2 text-white/50 hover:text-[#00FFDD] hover:bg-white/5 rounded-full transition-colors hidden sm:flex shrink-0"
                >
                  <ArrowUp className="w-4 h-4" />
               </button>

               <div className="flex-1 relative h-full flex items-center justify-center overflow-hidden mx-2">
                 <AnimatePresence mode="popLayout" initial={false}>
                   <motion.div
                     key={currentReviewIndex}
                     initial={{ y: 30, opacity: 0 }}
                     animate={{ y: 0, opacity: 1 }}
                     exit={{ y: -30, opacity: 0 }}
                     transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} // custom spring/ease
                     className="absolute w-full flex items-center gap-3"
                   >
                     <Star className="w-4 h-4 text-[#FFE58F] flex-shrink-0" />
                     <div className="text-[11px] sm:text-xs flex-1">
                       <div className="text-white font-bold leading-tight mb-0.5">{localizedReviews[currentReviewIndex]?.user}</div>
                       <div className="text-white/80 leading-snug line-clamp-1 truncate hover:line-clamp-none hover:whitespace-normal transition-all">"{localizedReviews[currentReviewIndex]?.text}"</div>
                       {localizedReviews[currentReviewIndex]?.aiReply && (
                         <div className="mt-1 text-[#00FFDD]/90 text-[10px] border-l border-[#00FFDD]/40 pl-2 flex items-center gap-1.5 line-clamp-1 truncate">
                           <Bot className="w-3 h-3 shrink-0" />
                           {localizedReviews[currentReviewIndex]?.aiReply}
                         </div>
                       )}
                     </div>
                   </motion.div>
                 </AnimatePresence>
               </div>

               <div className="flex flex-col sm:hidden gap-2 mr-2">
                   <button onClick={() => setCurrentReviewIndex(prev => prev === 0 ? localizedReviews.length - 1 : prev - 1)} className="p-1 text-white/50 active:text-[#00FFDD] rounded-full"><ArrowUp className="w-3 h-3" /></button>
                   <button onClick={() => setCurrentReviewIndex(prev => (prev + 1) % localizedReviews.length)} className="p-1 text-white/50 active:text-[#00FFDD] rounded-full"><ArrowDown className="w-3 h-3" /></button>
               </div>

               <button 
                  onClick={() => setCurrentReviewIndex(prev => (prev + 1) % localizedReviews.length)}
                  className="z-10 p-2 text-white/50 hover:text-[#00FFDD] hover:bg-white/5 rounded-full transition-colors hidden sm:flex shrink-0"
                >
                  <ArrowDown className="w-4 h-4" />
               </button>

             </div>
          </div>

          <div className="relative w-full max-h-[85vh] overflow-y-auto neon-scrollbar-rtl bg-[#050B14]/90 backdrop-blur-xl border-t border-[#00FFDD]/30 rounded-t-[24px] p-6 pb-10 animate-in slide-in-from-bottom-full duration-300 shadow-[0_-10px_40px_rgba(0,0,0,0.8)]">
            
            {settingsView === 'MAIN' && (
              <>
                <div className="flex justify-between items-center mb-6 sticky top-0 bg-[#050B14]/90 backdrop-blur-xl z-10 py-2">
                  <h3 className="text-[#00FFDD] font-bold text-lg tracking-wider">{t.settings}</h3>
                  <button onClick={() => setIsSettingsSheetOpen(false)} className="text-white/50 hover:text-white">
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="space-y-3">
                  {/* AI Chat Link */}
                  <button 
                    onClick={() => setSettingsView('CHAT')}
                    className="w-full flex items-center justify-between p-4 rounded-xl bg-black/40 border border-purple-500/30 hover:border-purple-500/80 transition-all group shadow-[0_0_15px_rgba(168,85,247,0.1)]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400 group-hover:scale-110 transition-transform">
                        <MessageSquare className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <div className="text-white font-bold text-sm">Mirage AI Chat</div>
                        <div className="text-purple-400 text-[10px] font-mono mt-1">Live support & Assistance</div>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-white/30 group-hover:text-purple-400" />
                  </button>

                  <div className="w-full bg-black/40 border border-white/10 rounded-xl p-4 mt-2">
                    <h4 className="text-[#00FFDD] text-xs font-bold mb-3 uppercase tracking-wider font-mono flex items-center gap-2">
                      <Activity className="w-4 h-4" /> Live Network Speed (Recharts)
                    </h4>
                    <div className="h-[150px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={speedData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#444" opacity={0.5} />
                          <XAxis dataKey="name" stroke="#888" fontSize={10} tickLine={false} axisLine={false} />
                          <Tooltip contentStyle={{ backgroundColor: '#050B14', borderColor: '#00FFDD', borderRadius: '8px' }} />
                          <Line type="monotone" dataKey="download" stroke="#00FFDD" strokeWidth={2} dot={false} />
                          <Line type="monotone" dataKey="upload" stroke="#FF9800" strokeWidth={2} dot={false} />
                          <Line type="monotone" dataKey="ping" stroke="#E91E63" strokeDasharray="5 5" strokeWidth={1} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Subscriptions */}
                  <button 
                    onClick={() => setSettingsView('SUBSCRIPTIONS')}
                    className="w-full flex items-center justify-between p-4 rounded-xl bg-black/40 border border-white/10 hover:border-[#00FFDD]/50 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-[#00FFDD]/10 rounded-lg text-[#00FFDD] group-hover:scale-110 transition-transform">
                        <Crown className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <div className="text-white font-bold text-sm">{t.subs}</div>
                        <div className="text-[#00FFDD] text-[10px] font-mono mt-1">{t.subsDesc}</div>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-white/30 group-hover:text-[#00FFDD]" />
                  </button>

                  {/* Gaming Hub */}
                  <button 
                    onClick={() => setSettingsView('GAMING')}
                    className="w-full flex items-center justify-between p-4 rounded-xl bg-black/40 border border-white/10 hover:border-[#00FFDD]/50 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-[#00FFDD]/10 rounded-lg text-[#00FFDD] group-hover:scale-110 transition-transform">
                        <Gamepad2 className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <div className="text-white font-bold text-sm">{t.gaming}</div>
                        <div className="text-white/50 text-xs font-mono">{t.gamingDesc}</div>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-white/30 group-hover:text-[#00FFDD]" />
                  </button>

                  {/* Refer & Earn */}
                  <button 
                    onClick={() => setSettingsView('REFERRAL')}
                    className="w-full flex items-center justify-between p-4 rounded-xl bg-black/40 border border-white/10 hover:border-[#00FFDD]/50 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-[#00FFDD]/10 rounded-lg text-[#00FFDD] group-hover:scale-110 transition-transform">
                        <Share2 className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <div className="text-white font-bold text-sm">{t.refer}</div>
                        <div className="text-[#00FFDD] text-xs font-mono">{t.referDesc}</div>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-white/30 group-hover:text-[#00FFDD]" />
                  </button>

                  {/* Servers */}
                  <button 
                    onClick={() => setSettingsView('SERVERS')}
                    className="w-full flex items-center justify-between p-4 rounded-xl bg-black/40 border border-white/10 hover:border-[#00FFDD]/50 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-[#00FFDD]/10 rounded-lg text-[#00FFDD] group-hover:scale-110 transition-transform">
                        <Server className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <div className="text-white font-bold text-sm">{t.servers}</div>
                        <div className="text-[#00FFDD] text-xs font-mono">{t.serversDesc} - {serverList.find(s => s.id === selectedServer)?.name || 'Auto-Select'}</div>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-white/30 group-hover:text-[#00FFDD]" />
                  </button>

                  {/* Protocol Settings */}
                  <button 
                    onClick={() => setSettingsView('PROTOCOL')}
                    className="w-full flex items-center justify-between p-4 rounded-xl bg-black/40 border border-white/10 hover:border-[#00FFDD]/50 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-[#00FFDD]/10 rounded-lg text-[#00FFDD] group-hover:scale-110 transition-transform">
                        <Shield className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <div className="text-white font-bold text-sm">{t.protocol}</div>
                        <div className="text-white/50 text-xs font-mono">{t.protocolDesc} {selectedProtocol}</div>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-white/30 group-hover:text-[#00FFDD]" />
                  </button>

                  {/* Language */}
                  <button 
                    onClick={() => setSettingsView('LANGUAGE')}
                    className="w-full flex items-center justify-between p-4 rounded-xl bg-black/40 border border-white/10 hover:border-[#00FFDD]/50 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-[#00FFDD]/10 rounded-lg text-[#00FFDD] group-hover:scale-110 transition-transform">
                        <Globe className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <div className="text-white font-bold text-sm">{t.lang}</div>
                        <div className="text-white/50 text-xs font-mono">{t.langDesc}</div>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-white/30 group-hover:text-[#00FFDD]" />
                  </button>
                </div>
              </>
            )}

            {settingsView === 'PROTOCOL' && (
              <>
                <div className="flex justify-between items-center mb-6 sticky top-0 bg-[#050B14]/90 backdrop-blur-xl z-10 py-2">
                  <div className="flex items-center gap-3">
                    <button onClick={() => setSettingsView('MAIN')} className="text-white/50 hover:text-[#00FFDD] transition-colors">
                      <ChevronRight className="w-6 h-6 rotate-180" />
                    </button>
                    <h3 className="text-[#00FFDD] font-bold text-lg tracking-wider uppercase">{t.protocol}</h3>
                  </div>
                  <button onClick={() => { setIsSettingsSheetOpen(false); setSettingsView('MAIN'); }} className="text-white/50 hover:text-white">
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="space-y-3">
                  {['AUTO', 'VLESS', 'HYSTERIA2', 'TROJAN_GFW'].map((protocol) => (
                    <button
                      key={protocol}
                      onClick={() => handleProtocolSelect(protocol)}
                      disabled={isSyncingProtocol}
                      className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                        selectedProtocol === protocol 
                          ? 'bg-[#00FFDD]/10 border-[#00FFDD] shadow-[0_0_15px_rgba(0,255,221,0.2)]' 
                          : 'bg-black/40 border-white/10 hover:border-white/30'
                      }`}
                    >
                      <span className={`font-mono font-bold ${selectedProtocol === protocol ? 'text-[#00FFDD]' : 'text-white/70'}`}>
                        {protocol}
                      </span>
                      {selectedProtocol === protocol && !isSyncingProtocol && (
                        <div className="w-3 h-3 rounded-full bg-[#00FFDD] shadow-[0_0_10px_#00FFDD]"></div>
                      )}
                      {isSyncingProtocol && (
                        <Activity className="w-4 h-4 text-[#00FFDD] animate-spin" />
                      )}
                    </button>
                  ))}
                  <div className="mt-4 pt-4 border-t border-white/10 text-center text-xs text-[#00FFDD]/60 font-mono flex items-center justify-center gap-2">
                    <CloudUpload className="w-3 h-3" />
                    {isRTL ? 'تتم مزامنة الإعدادات وتخزينها عبر السحابة مباشرة' : 'Configurations synced & managed strictly via Cloud'}
                  </div>
                </div>
              </>
            )}

            {settingsView === 'SUBSCRIPTIONS' && (
              <>
                <div className="flex justify-between items-center mb-6 sticky top-0 bg-[#050B14]/90 backdrop-blur-xl z-10 py-2">
                  <div className="flex items-center gap-3">
                    <button onClick={() => setSettingsView('MAIN')} className="text-white/50 hover:text-[#00FFDD] transition-colors">
                      <ChevronRight className={isRTL ? '' : 'rotate-180'} />
                    </button>
                    <h3 className="text-[#00FFDD] font-bold text-lg tracking-wider uppercase">{t.subs}</h3>
                  </div>
                  <button onClick={() => { setIsSettingsSheetOpen(false); setSettingsView('MAIN'); }} className="text-white/50 hover:text-white">
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                {/* AI Wallet Section */}
                <div className="mb-6 p-4 rounded-xl bg-black/40 border border-[#00FFDD]/30 relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-[#00FFDD]/10 text-[#00FFDD] text-[10px] font-bold px-2 py-1 rounded-bl-lg flex items-center gap-1">
                    <Cpu className="w-3 h-3" /> AI WALLET
                  </div>
                  <h4 className="text-white/60 text-xs font-bold mb-1 uppercase tracking-wider">{isRTL ? 'الرصيد المتاح' : 'Available Balance'}</h4>
                  <div className="text-3xl font-bold text-white mb-4 flex items-center gap-2">
                    <span className="text-[#00FFDD]">$</span>
                    {walletBalance.toFixed(2)}
                  </div>
                  
                  {isProcessingTx ? (
                    <div className="bg-[#00FFDD]/10 border border-[#00FFDD]/30 rounded-lg p-3 flex flex-col items-center justify-center animate-pulse">
                      <Activity className="w-6 h-6 text-[#00FFDD] mb-2 animate-spin-slow" />
                      <span className="text-[#00FFDD] text-xs font-bold text-center">
                        {txType === 'DEPOSIT' && (isRTL ? 'الذكاء الاصطناعي يعالج الإيداع... (يخصم 1.5% رسوم)' : 'AI Processing Deposit... (Deducting 1.5% Fee)')}
                        {txType === 'WITHDRAW' && (isRTL ? 'الذكاء الاصطناعي يعالج السحب... (يخصم 2% رسوم)' : 'AI Processing Withdrawal... (Deducting 2% Fee)')}
                        {txType === 'SUBSCRIPTION' && (isRTL ? 'الذكاء الاصطناعي يطبق الاشتراك...' : 'AI Applying Subscription...')}
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input 
                          type="number" 
                          placeholder="Amount ($)" 
                          value={depositAmount}
                          onChange={(e) => setDepositAmount(e.target.value)}
                          className="flex-1 bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-[#00FFDD]/50 transition-colors"
                        />
                        <button 
                          onClick={() => processAITransaction('DEPOSIT', depositAmount)}
                          className="px-4 py-2 bg-[#00FFDD]/20 text-[#00FFDD] rounded-lg text-xs font-bold border border-[#00FFDD]/30 hover:bg-[#00FFDD]/40 transition-colors"
                        >
                          {isRTL ? 'إيداع صامت' : 'DEPOSIT'}
                        </button>
                      </div>
                      <button 
                        onClick={() => processAITransaction('WITHDRAW', depositAmount)}
                        className="w-full py-2 bg-red-500/10 text-red-400 rounded-lg text-xs font-bold border border-red-500/20 hover:bg-red-500/20 transition-colors"
                      >
                        {isRTL ? 'سحب فوري (AI)' : 'WITHDRAW TO BANK'}
                      </button>
                      
                      {walletError && (
                        <div className="text-red-400 text-[10px] text-center mt-2 font-bold animate-pulse">
                          {walletError}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <h4 className="text-white/80 font-bold mb-3 uppercase tracking-widest text-sm">{isRTL ? 'باقات ميراج الذكية' : 'Mirage Smart Plans'}</h4>
                <div className="space-y-4 max-h-[45vh] overflow-y-auto neon-scrollbar-rtl pr-2 pb-6">
                  {/* Daily / Free */}
                  <div className="p-4 rounded-xl bg-black/40 border border-white/10">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-white font-bold">{isRTL ? 'الباقة اليومية' : 'Daily Pass'}</span>
                      <span className="text-[#00FFDD] font-bold">{isRTL ? 'مجاني' : 'FREE'}</span>
                    </div>
                    <p className="text-white/50 text-xs mb-3">{isRTL ? 'شاهد 5 إعلانات لتحصل على ساعتين.' : 'Watch 5 ads to unlock 2 hours of premium access.'}</p>
                    <button 
                      onClick={processWatchAd}
                      disabled={isWatchingAd || activePlan === 'daily-pass'}
                      className={`w-full py-2 rounded-lg text-sm font-bold border transition-colors ${
                        activePlan === 'daily-pass' ? 'bg-[#00FFDD] text-black border-[#00FFDD]' : 'bg-[#00FFDD]/10 text-[#00FFDD] border-[#00FFDD]/30 hover:bg-[#00FFDD]/20'
                      }`}
                    >
                      {activePlan === 'daily-pass' 
                        ? (isRTL ? 'نشط حالياً' : 'ACTIVE')
                        : isWatchingAd 
                          ? (isRTL ? 'جاري العرض...' : 'Playing Ad...') 
                          : (isRTL ? `شاهد (${adsWatched}/5)` : `Watch Ad (${adsWatched}/5)`)}
                    </button>
                  </div>
                  
                  {[
                    { id: 'weekly', name: isRTL ? 'الأسبوعية' : 'Weekly Pro', price: 2.99, popular: false },
                    { id: 'monthly', name: isRTL ? 'الشهرية (النخبة)' : 'Monthly Elite', price: 8.99, popular: true },
                    { id: 'yearly', name: isRTL ? 'السنوية (القصوى)' : 'Yearly Ultimate', price: 49.99, popular: false }
                  ].map(plan => (
                    <div key={plan.id} className={`p-4 rounded-xl relative overflow-hidden ${activePlan === plan.id ? 'bg-[#00FFDD]/20 border-[#00FFDD]' : 'bg-black/40 border-white/10'} border transition-colors`}>
                      {plan.popular && (
                        <div className="absolute top-0 right-0 bg-[#00FFDD] text-black text-[10px] font-bold px-2 py-1 rounded-bl-lg">POPULAR</div>
                      )}
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-white font-bold">{plan.name}</span>
                        <span className="text-[#00FFDD] font-bold">${plan.price}</span>
                      </div>
                      <button 
                        onClick={() => processAISubscription(plan.id, plan.price)}
                        disabled={isProcessingTx || activePlan === plan.id}
                        className={`w-full py-2 rounded-lg text-sm font-bold transition-all ${
                          activePlan === plan.id 
                            ? 'bg-[#00FFDD] text-black opacity-100 cursor-default' 
                            : 'bg-[#00FFDD]/20 text-[#00FFDD] hover:bg-[#00FFDD]/40 border border-[#00FFDD]/30'
                        }`}
                      >
                        {activePlan === plan.id 
                          ? (isRTL ? 'نشط હાલيا' : 'ACTIVE') 
                          : (isRTL ? 'تفعيل (خصم آلي)' : 'SUBSCRIBE (Auto-Deduct)')}
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}

            {settingsView === 'GAMING' && (
              <>
                <div className="flex justify-between items-center mb-6 sticky top-0 bg-[#050B14]/90 backdrop-blur-xl z-10 py-2">
                  <div className="flex items-center gap-3">
                    <button onClick={() => setSettingsView('MAIN')} className="text-white/50 hover:text-[#00FFDD] transition-colors">
                      <ChevronRight className="w-6 h-6 rotate-180" />
                    </button>
                    <h3 className="text-[#00FFDD] font-bold text-lg tracking-wider uppercase">{t.gaming}</h3>
                  </div>
                  <button onClick={() => { setIsSettingsSheetOpen(false); setSettingsView('MAIN'); }} className="text-white/50 hover:text-white">
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between hover:border-[#00FFDD]/50 transition-colors">
                    <div>
                      <div className="text-white font-bold text-lg">Middle East (DXB)</div>
                      <div className="text-[#2ECC71] text-sm font-mono font-bold mt-1">15ms - Ultra Low Latency</div>
                    </div>
                    <button onClick={() => { requestCloudAction('CONNECT'); setIsSettingsSheetOpen(false); }} className="px-6 py-2 bg-[#2ECC71]/20 text-[#2ECC71] rounded-lg text-sm font-bold border border-[#2ECC71]/30 hover:bg-[#2ECC71]/40 transition-colors shadow-[0_0_10px_rgba(46,204,113,0.3)]">Connect</button>
                  </div>
                  <div className="p-4 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between hover:border-[#00FFDD]/50 transition-colors">
                    <div>
                      <div className="text-white font-bold text-lg">Europe (FRA)</div>
                      <div className="text-[#F1C40F] text-sm font-mono font-bold mt-1">45ms - Low Latency</div>
                    </div>
                    <button onClick={() => { requestCloudAction('CONNECT'); setIsSettingsSheetOpen(false); }} className="px-6 py-2 bg-[#00FFDD]/20 text-[#00FFDD] rounded-lg text-sm font-bold border border-[#00FFDD]/30 hover:bg-[#00FFDD]/40 transition-colors">Connect</button>
                  </div>
                  <div className="p-4 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between hover:border-[#00FFDD]/50 transition-colors">
                    <div>
                      <div className="text-white font-bold text-lg">Asia (SGP)</div>
                      <div className="text-[#E67E22] text-sm font-mono font-bold mt-1">85ms - Stable</div>
                    </div>
                    <button onClick={() => { requestCloudAction('CONNECT'); setIsSettingsSheetOpen(false); }} className="px-6 py-2 bg-[#00FFDD]/20 text-[#00FFDD] rounded-lg text-sm font-bold border border-[#00FFDD]/30 hover:bg-[#00FFDD]/40 transition-colors">Connect</button>
                  </div>
                  <div className="p-4 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between hover:border-[#00FFDD]/50 transition-colors">
                    <div>
                      <div className="text-white font-bold text-lg">North America (EST)</div>
                      <div className="text-[#E74C3C] text-sm font-mono font-bold mt-1">120ms - Standard</div>
                    </div>
                    <button onClick={() => { requestCloudAction('CONNECT'); setIsSettingsSheetOpen(false); }} className="px-6 py-2 bg-[#00FFDD]/20 text-[#00FFDD] rounded-lg text-sm font-bold border border-[#00FFDD]/30 hover:bg-[#00FFDD]/40 transition-colors">Connect</button>
                  </div>
                </div>
              </>
            )}

            {settingsView === 'REFERRAL' && (
              <>
                <div className="flex justify-between items-center mb-6 sticky top-0 bg-[#050B14]/90 backdrop-blur-xl z-10 py-2">
                  <div className="flex items-center gap-3">
                    <button onClick={() => setSettingsView('MAIN')} className="text-white/50 hover:text-[#00FFDD] transition-colors">
                      <ChevronRight className="w-6 h-6 rotate-180" />
                    </button>
                    <h3 className="text-[#00FFDD] font-bold text-lg tracking-wider uppercase">{t.refer}</h3>
                  </div>
                  <button onClick={() => { setIsSettingsSheetOpen(false); setSettingsView('MAIN'); }} className="text-white/50 hover:text-white">
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <div className="space-y-4 text-center">
                  <div className="p-6 rounded-xl bg-[#00FFDD]/5 border border-[#00FFDD]/20">
                    <Share2 className="w-12 h-12 text-[#00FFDD] mx-auto mb-4" />
                    <h4 className="text-white font-bold mb-2">Invite Friends, Get Free Time</h4>
                    <p className="text-white/60 text-sm mb-6">For every friend who joins using your link, you both get 3 hours of Premium!</p>
                    <div className="flex items-center gap-2 bg-black/50 p-3 rounded-lg border border-white/10">
                      <span className="text-[#00FFDD] text-xs font-mono truncate flex-1 text-left">https://mirage.vpn/ref/ahmed99</span>
                      <button className="text-white hover:text-[#00FFDD] text-sm font-bold px-2 border-l border-white/20 pl-4">Copy</button>
                    </div>
                  </div>
                </div>
              </>
            )}

            {settingsView === 'SERVERS' && (
              <>
                <div className="flex justify-between items-center mb-6 sticky top-0 bg-[#050B14]/90 backdrop-blur-xl z-10 py-2">
                  <div className="flex items-center gap-3">
                    <button onClick={() => setSettingsView('MAIN')} className="text-white/50 hover:text-[#00FFDD] transition-colors">
                      <ChevronRight className={isRTL ? '' : 'rotate-180'} />
                    </button>
                    <h3 className="text-[#00FFDD] font-bold text-lg tracking-wider">{t.servers}</h3>
                  </div>
                  <button onClick={() => { setIsSettingsSheetOpen(false); setSettingsView('MAIN'); }} className="text-white/50 hover:text-white">
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="mb-4">
                  <input 
                    type="text" 
                    placeholder="Search Servers by Country or ID..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-[#00FFDD]/50 transition-colors"
                  />
                </div>

                <div className="space-y-2 max-h-[50vh] overflow-y-auto neon-scrollbar-rtl pr-2 pb-6">
                  {serverList.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.id.toLowerCase().includes(searchTerm.toLowerCase())).map((server, idx) => {
                    const isSelected = selectedServer === server.id;
                    return (
                      <div key={server.id} className="relative flex gap-2 w-full group/item">
                        <button 
                          onClick={() => {
                            setSelectedServer(server.id);
                            setSettingsView('MAIN');
                          }}
                          className={`flex-1 p-4 rounded-xl border transition-all flex justify-between items-center group ${
                            isSelected ? 'bg-[#00FFDD]/20 border-[#00FFDD] shadow-[0_0_15px_rgba(0,255,221,0.2)]' : 'bg-black/40 border-white/10 hover:border-[#00FFDD]/50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Globe className={`w-5 h-5 ${isSelected ? 'text-[#00FFDD]' : 'text-white/40 group-hover:text-[#00FFDD]/60'}`} />
                            <span className={`text-sm font-bold ${isSelected ? 'text-[#00FFDD]' : 'text-white'}`}>{isRTL && idx === 0 && server.id === 'auto' ? 'اختيار تلقائي (موجَّه سحابياً)' : server.name}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            {isSelected && <span className="text-[#00FFDD] text-[10px] font-bold border border-[#00FFDD]/30 px-2 py-1 rounded hidden sm:inline-block">CLOUD-SYNCED</span>}
                            <div className="flex items-center gap-1 min-w-[50px] justify-end">
                              <span className={`text-xs font-mono font-bold ${server.ping < 100 ? 'text-[#00FFDD]' : server.ping < 160 ? 'text-yellow-400' : 'text-red-400'}`}>
                                {server.ping}
                              </span>
                              <span className="text-white/30 text-[10px]">ms</span>
                            </div>
                          </div>
                        </button>
                        <button 
                          onClick={() => setShowDeleteModal(server.id)}
                          className="w-14 items-center justify-center bg-red-500/20 border border-red-500/30 rounded-xl hover:bg-red-500/40 text-red-400 transition-colors flex shrink-0"
                          title="Delete Server"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    );
                  })}
                  
                  {showDeleteModal && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                      <div className="bg-[#050B14] p-6 rounded-xl border-2 border-red-500 max-w-sm w-full text-center shadow-[0_0_30px_rgba(239,68,68,0.3)] animate-in zoom-in-95 duration-200">
                        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                        <h3 className="text-red-500 font-bold text-lg mb-2">Delete Server?</h3>
                        <p className="text-white/70 text-sm mb-6">Are you sure you want to permanently remove this server from the list?</p>
                        <div className="flex justify-between gap-3">
                          <button onClick={() => setShowDeleteModal(null)} className="flex-1 py-2 text-white/50 hover:bg-white/10 rounded-lg transition-colors border border-white/10">Cancel</button>
                          <button 
                            onClick={() => {
                              setServerList(prev => prev.filter(s => s.id !== showDeleteModal));
                              if (selectedServer === showDeleteModal) setSelectedServer('auto');
                              setShowDeleteModal(null);
                            }} 
                            className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-bold shadow-[0_0_15px_rgba(239,68,68,0.6)]"
                          >
                            Confirm Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mt-4 pt-4 border-t border-white/10 text-center text-xs text-[#00FFDD]/60 font-mono flex items-center justify-center gap-2">
                    <CloudUpload className="w-3 h-3" />
                    {isRTL ? 'يُدار ذكاء التوجية والتشفير وتخزين الخوادم آلياً عبر محرك السحابة الخاص بنا' : 'Routing intel, encryption & server config dynamically handled via Mirage Cloud'}
                  </div>
                </div>
              </>
            )}

            {settingsView === 'LANGUAGE' && (
              <>
                <div className="flex justify-between items-center mb-6 sticky top-0 bg-[#050B14]/90 backdrop-blur-xl z-10 py-2">
                  <div className="flex items-center gap-3">
                    <button onClick={() => setSettingsView('MAIN')} className="text-white/50 hover:text-[#00FFDD] transition-colors">
                      <ChevronRight className="w-6 h-6 rotate-180" />
                    </button>
                    <h3 className="text-[#00FFDD] font-bold text-lg tracking-wider">{t.lang}</h3>
                  </div>
                    <button onClick={() => { setIsSettingsSheetOpen(false); setSettingsView('MAIN'); }} className="text-white/50 hover:text-white">
                      <X className="w-6 h-6" />
                    </button>
                </div>
                <div className="flex flex-col gap-2 max-h-[60vh] overflow-y-auto neon-scrollbar-rtl pr-2 pb-4">
                  {isLoadingLanguages ? (
                    <div className="flex justify-center items-center py-8">
                       <div className="w-8 h-8 rounded-full border-t-2 border-b-2 border-[#00FFDD] animate-spin"></div>
                    </div>
                  ) : (
                    availableLanguages.map((lang) => {
                      const isSelected = appLanguage === lang.name;
                      return (
                        <button 
                          key={lang.code} 
                          onClick={async () => {
                            await handleChangeLanguage(lang.code, lang.name);
                            try { localStorage.setItem('mirage_lang', lang.name); } catch {}
                            
                            // Simulate passing back to central cloud config
                            try {
                              await mirageCloudEngine.execute('SYNC_CONFIG', { lang: lang.name });
                            } catch (e) {}

                            setSettingsView('MAIN');
                          }}
                          className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                            isSelected 
                              ? 'bg-[#00FFDD]/10 border-[#00FFDD] shadow-[0_0_15px_rgba(0,255,221,0.2)]' 
                              : 'bg-black/40 border-white/10 text-white hover:border-[#00FFDD]/50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{lang.flag}</span>
                            <span className="truncate pr-2 text-left text-lg font-bold">{lang.name}</span>
                          </div>
                          {isSelected && <div className="w-2 h-2 rounded-full bg-[#00FFDD] shadow-[0_0_5px_#00FFDD] shrink-0"></div>}
                        </button>
                      );
                    })
                  )}
                </div>
              </>
            )}

            {settingsView === 'CHAT' && (
              <div className="flex flex-col h-full max-h-[60vh] text-left" dir="ltr">
                <div className="flex justify-between items-center mb-4 sticky top-0 bg-[#050B14]/90 backdrop-blur-xl z-10 py-2 border-b border-purple-500/20">
                  <div className="flex items-center gap-3">
                    <button onClick={() => setSettingsView('MAIN')} className="w-8 h-8 flex items-center justify-center bg-black/40 rounded-full border border-white/10 text-white/50 hover:text-purple-400 hover:bg-purple-500/20 transition-all active:scale-95">
                      <ChevronRight className="w-5 h-5 rotate-180" />
                    </button>
                    <h3 className="text-purple-400 font-bold text-base tracking-wider flex items-center gap-2">
                       <Bot className="w-5 h-5" /> Mirage AI
                    </h3>
                  </div>
                  <button onClick={() => { setIsSettingsSheetOpen(false); setSettingsView('MAIN'); }} className="text-white/50 hover:text-red-400 transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="flex-1 overflow-y-auto scroll-smooth mb-4 p-4 rounded-xl bg-black/40 border border-white/10 flex flex-col gap-4 min-h-[350px] neon-scrollbar">
                  {messages.length === 0 ? (
                    <div className="m-auto text-center flex flex-col items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
                            <Bot className="w-6 h-6 text-purple-400" />
                        </div>
                        <span className="text-white/40 text-xs font-mono">Connection established. Mirage AI is ready.</span>
                    </div>
                  ) : (
                    messages.map((msg, i) => (
                      <div key={i} className={`flex w-full ${msg.sender === 'Client' ? 'justify-end' : 'justify-start'}`}>
                         <div className={`flex flex-col gap-1 max-w-[85%] ${msg.sender === 'Client' ? 'items-end' : 'items-start'}`}>
                             <span className="text-[10px] text-white/30 font-mono flex items-center gap-1">
                                 {msg.sender === 'Client' ? <User className="w-3 h-3"/> : <Bot className="w-3 h-3"/>}
                                 {msg.sender === 'Client' ? 'You' : 'Mirage AI'}
                             </span>
                             <div className={`p-3 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-lg ${
                               msg.sender === 'Client' 
                                 ? 'bg-gradient-to-br from-purple-600 to-purple-800 text-white rounded-tr-sm border border-purple-500/50' 
                                 : 'bg-[#050B14]/80 text-[#00FFDD] rounded-tl-sm border border-[#00FFDD]/30'
                             }`}>
                               {msg.text}
                             </div>
                         </div>
                      </div>
                    ))
                  )}
                </div>
                
                <div className="flex gap-2 relative">
                  <input 
                    value={chatInput} 
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                    className="flex-grow p-3 pl-4 pr-12 rounded-xl bg-black/60 border border-white/20 text-white placeholder-white/40 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all font-mono text-xs sm:text-sm shadow-inner"
                    placeholder="Ask Mirage AI..."
                  />
                  <button 
                    onClick={sendMessage} 
                    disabled={!chatInput.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-purple-600 disabled:bg-purple-600/30 hover:bg-purple-500 rounded-lg flex items-center justify-center text-white transition-all shadow-[0_0_10px_rgba(147,51,234,0.4)] disabled:shadow-none active:scale-90"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Payment Resource Modal (Auto triggered for insufficient balance) */}
      {showPaymentModal && (
        <div className="absolute inset-0 z-[110] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setShowPaymentModal(false)}></div>
          <div className="relative w-full max-w-sm bg-[#050B14] border border-[#00FFDD]/30 rounded-2xl p-6 shadow-[0_0_40px_rgba(0,255,221,0.15)] animate-in zoom-in-95 duration-300">
            <button onClick={() => setShowPaymentModal(false)} className="absolute top-4 right-4 text-white/50 hover:text-white">
               <X className="w-5 h-5" />
            </button>
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-red-400 font-bold">$!</span>
              </div>
              <h3 className="text-white font-bold text-lg mb-1">{isRTL ? 'إيداع مطلوب' : 'Deposit Required'}</h3>
              <p className="text-white/60 text-xs">
                {isRTL 
                  ? `أنت بحاجة لدفع الفاتورة لتفعيل باقة ${pendingPlanSub?.name || ''}.` 
                  : `You need to fund your AI wallet to activate the ${pendingPlanSub?.name || ''} plan.`}
              </p>
              <div className="text-[#00FFDD] font-bold text-xl mt-3">${pendingPlanSub?.cost || 0}</div>
            </div>
            
            <div className="space-y-3">
              <button 
                onClick={() => processAITransaction('DEPOSIT', pendingPlanSub?.cost.toString() || '10', true)}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-[#00FFDD]/10 border border-[#00FFDD]/30 hover:bg-[#00FFDD]/20 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="text-xl">💳</div>
                  <div className="text-left">
                    <div className="text-white font-bold text-sm">{isRTL ? 'بطاقة الائتمان' : 'Credit Card'}</div>
                    <div className="text-white/50 text-[10px]">Visa, Mastercard, Amex</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#00FFDD] group-hover:translate-x-1 transition-transform" />
              </button>

              <button 
                onClick={() => processAITransaction('DEPOSIT', pendingPlanSub?.cost.toString() || '10', true)}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 hover:bg-purple-500/20 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="text-xl">💰</div>
                  <div className="text-left">
                    <div className="text-white font-bold text-sm">Crypto (USDT / BTC)</div>
                    <div className="text-white/50 text-[10px]">{isRTL ? 'دفع لا مركزي' : 'Decentralized Payment'}</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-purple-400 group-hover:translate-x-1 transition-transform" />
              </button>

              <button 
                onClick={() => processAITransaction('DEPOSIT', pendingPlanSub?.cost.toString() || '10', true)}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="text-xl">🍏</div>
                  <div className="text-left">
                    <div className="text-white font-bold text-sm">Apple Pay / GPay</div>
                    <div className="text-white/50 text-[10px]">{isRTL ? 'بنقرة واحدة' : 'One-tap checkout'}</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-white/50 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
            {isProcessingTx && (
                <div className="mt-4 text-[#00FFDD] text-xs text-center animate-pulse">
                  {isRTL ? 'جاري المعالجة...' : 'Processing Payment...'}
                </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

export default function ClientPortal() {
  return (
    <ErrorHandler>
      <ClientPortalInner />
    </ErrorHandler>
  );
}
