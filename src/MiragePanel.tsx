import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { collection, addDoc, serverTimestamp, doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import { Activity, Shield, Wifi, Zap, Settings, CreditCard, ChevronLeft, Globe, Satellite, Terminal, Gamepad2, Gift, Link as LinkIcon, ShieldAlert, Share2, PlaySquare, Users, MessageSquare, Send, Languages } from 'lucide-react';
import './MirageStyle.css';

const BalanceData = [
    { day: 'Day 1', balance: 200 },
    { day: 'Day 2', balance: 220 },
    { day: 'Day 3', balance: 240 },
    { day: 'Day 4', balance: 260 },
    { day: 'Day 5', balance: 250 },
];

const PieData = [
    { name: 'Daily', value: 20, color: '#3b82f6' },
    { name: 'Weekly', value: 30, color: '#10b981' },
    { name: 'Monthly', value: 40, color: '#a855f7' },
    { name: 'Yearly', value: 10, color: '#f59e0b' },
];

const GlowingCircle = ({ value, label, color }: { value: number, label: string, color: string }) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div 
                style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    backgroundColor: `${color}33`,
                    boxShadow: `0 0 20px ${color}80, inset 0 0 10px ${color}80`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '10px',
                    border: `2px solid ${color}80`,
                    transition: 'all 0.5s ease',
                }}
            >
                <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '0.9rem' }}>{value.toFixed(1)}</span>
            </div>
            <span style={{ fontSize: '0.7rem', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '1px' }}>{label}</span>
        </div>
    );
};

export default function MiragePanel() {
    const [view, setView] = useState<'main' | 'dashboard' | 'finance' | 'settings' | 'ai'>('main');
    const [status, setStatus] = useState('Standby');
    const [isConnected, setIsConnected] = useState(false);
    
    // Live metrics
    const [ping, setPing] = useState(0);
    const [dlSpeed, setDlSpeed] = useState(0.0);
    const [ulSpeed, setUlSpeed] = useState(0.0);
    const [serverIndex, setServerIndex] = useState(0);
    const [balanceHistory, setBalanceHistory] = useState(BalanceData);
    
    // Settings States
    const [ghostMode, setGhostMode] = useState(false);
    const [emergencyMode, setEmergencyMode] = useState(false);
    const rewards = 75;
    const referralLink = "https://miragevpn.com/ref/ABC123";
    
    // AI State
    const [aiLogs, setAiLogs] = useState<string[]>(['[SYSTEM] Ready for network diagnostic...']);
    const [analyzing, setAnalyzing] = useState(false);
    const [autoHealActive, setAutoHealActive] = useState(false);

    const triggerAIAnalysis = async () => {
        if (analyzing) return;
        setAnalyzing(true);
        setAutoHealActive(false);
        setAiLogs(['[SYSTEM] Initializing AI Sentinel...']);
        
        setTimeout(() => setAiLogs(prev => [...prev, '[SYSTEM] Waiting for anomaly detection...']), 1000);
        setTimeout(() => setAiLogs(prev => [...prev, '[REQUEST] Requesting global node analysis...']), 2000);
        setTimeout(() => setAiLogs(prev => [...prev, '[AI] No API key found → Switching to local inference.']), 3000);
        setTimeout(() => setAiLogs(prev => [...prev, '[AI] Anomaly detected in EU-West routing tables → Re-routing recommended.']), 4000);
        setTimeout(() => setAiLogs(prev => [...prev, '[AI] XTLS-Reality handshakes stable.']), 5000);
        setTimeout(() => setAiLogs(prev => [...prev, '[AI] Latency optimization standing by.']), 6000);
        setTimeout(async () => {
            setAutoHealActive(true);
            setAiLogs(prev => [...prev, '[AI] Auto-Heal protocol activated → Routing tables restored ✅']);
            setAnalyzing(false);

            try {
                await addDoc(collection(db, 'supportLogs'), {
                    event: 'Network Diagnostic',
                    status: 'Completed',
                    timestamp: serverTimestamp()
                });
            } catch (err) {
                console.error('Log save error:', err);
            }
        }, 7000);
    };
    
    const popularGames = [
        { name: "PUBG Mobile", link: "https://pubgmobile.com" },
        { name: "Free Fire", link: "https://ff.garena.com" },
        { name: "Fortnite", link: "https://fortnite.com" },
        { name: "FIFA", link: "https://www.ea.com/fifa" },
        { name: "Call of Duty", link: "https://www.callofduty.com" },
    ];

    const subscriptions = [
        { label: "Daily", price: "0.99 USD" },
        { label: "Weekly", price: "3.99 USD" },
        { label: "Monthly", price: "9.99 USD" },
        { label: "Yearly", price: "49.5 USD" },
    ];
    
    const customers = [
        { name: "Ali", email: "ali@example.com", plan: "Monthly", status: "Paid" },
        { name: "Sara", email: "sara@example.com", plan: "Yearly", status: "Pending" },
    ];

    const [chatMessages, setChatMessages] = useState<Array<{ sender: string, text: string }>>([
        { sender: 'AI', text: 'Welcome! How can I help you today?' }
    ]);
    const [chatInput, setChatInput] = useState('');
    const [sendingChat, setSendingChat] = useState(false);

    const [currentLanguage, setCurrentLanguage] = useState('en');
    const [supportedLanguages, setSupportedLanguages] = useState<string[]>(['en', 'ar', 'fr', 'tr']);

    useEffect(() => {
        const fetchLanguage = async () => {
            try {
                const docRef = doc(db, 'languages', 'default');
                const snap = await getDoc(docRef);
                if (snap.exists()) {
                    const data = snap.data();
                    if (data.supported) setSupportedLanguages(data.supported);
                    if (data.fallback) setCurrentLanguage(data.fallback);
                } else {
                    await setDoc(docRef, {
                        supported: ['en', 'ar', 'fr', 'tr'],
                        fallback: 'en',
                        timestamp: serverTimestamp()
                    });
                }
            } catch (e) {
                console.log('Language fetch error', e);
            }
        };
        fetchLanguage();
    }, []);

    const handleChangeLanguage = async (lang: string) => {
        setCurrentLanguage(lang);
        try {
            const docRef = doc(db, 'languages', 'default');
            await updateDoc(docRef, {
                fallback: lang,
                timestamp: serverTimestamp()
            });
        } catch (e) {
            console.error('Error updating language', e);
        }
    };

    const handleSendMessage = async () => {
        if (!chatInput.trim() || sendingChat) return;
        const msg = chatInput.trim();
        setChatInput('');
        setChatMessages(prev => [...prev, { sender: 'You', text: msg }]);
        setSendingChat(true);

        try {
            const ai = new GoogleGenAI({ apiKey: (import.meta as any).env.VITE_GEMINI_API_KEY || 'fake_key' });
            if (!(import.meta as any).env.VITE_GEMINI_API_KEY) {
                setTimeout(() => {
                    setChatMessages(prev => [...prev, { sender: 'AI', text: 'I detected an issue, fixing it now... (Simulated)' }]);
                    setSendingChat(false);
                }, 1000);
                return;
            }

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: msg + ' (You are a helpful customer support AI for Mirage Tactical VPN. Keep responses short.)'
            });
            const reply = response.text || 'I encountered an error processing your query.';
            setChatMessages(prev => [...prev, { sender: 'AI', text: reply }]);
            
            try {
                await addDoc(collection(db, 'supportChats'), {
                    message: msg,
                    response: reply,
                    timestamp: serverTimestamp()
                });
            } catch (err) {
                console.error('Firebase save error:', err);
            }
        } catch (e) {
            setChatMessages(prev => [...prev, { sender: 'AI', text: 'Network connection lost. Using cached support responses.' }]);
        } finally {
            setSendingChat(false);
        }
    };
    
    const [tick, setTick] = useState(0);

    const servers = ["Satellite - Saudi", "Global Array - EU West", "Tactical Relay - US East"];

    const handleConnect = async () => {
        setStatus('Initializing God Mode...');
        setIsConnected(true);
        
        setTimeout(() => {
            setStatus('Mirage Sentinel: Active');
            setPing(24);
            setDlSpeed(40.5);
            setUlSpeed(8.4);
        }, 1500);
    };

    useEffect(() => {
        if (!isConnected) return;
        const interval = setInterval(() => {
            setTick(t => t + 1);
            setPing(50 + Math.floor(Math.random() * 20));
            setDlSpeed(30 + (Math.random() * 30));
            setUlSpeed(5 + (Math.random() * 10));
        }, 3000);
        return () => clearInterval(interval);
    }, [isConnected]);

    useEffect(() => {
        if (!isConnected || tick % 3 !== 0) return;
        setServerIndex(s => (s + 1) % servers.length);
        
        const lastBal = balanceHistory[balanceHistory.length - 1].balance;
        const newBal = lastBal + (Math.random() * 10 - 3);
        const newHistory = [...balanceHistory.slice(1), { day: `Day ${tick + 5}`, balance: newBal }];
        setBalanceHistory(newHistory);
    }, [tick, isConnected]);

    const renderMainContent = () => (
        <>
            <h2 style={{ color: '#a78bfa', marginBottom: '5px', fontWeight: '800', letterSpacing: '4px' }}>MIRAGE TACTICAL</h2>
            <p style={{ opacity: 0.5, fontSize: '0.75rem', letterSpacing: '2px', textTransform: 'uppercase' }}>God Mode / Sentinel VPN</p>
            
            <div style={{ margin: '40px 0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className={`neon-status ${isConnected ? 'status-online' : ''}`}></div>
                <span style={{ fontWeight: 500, letterSpacing: '1px', fontSize: '0.95rem' }}>{status}</span>
            </div>

            <div style={{ marginBottom: '30px' }}>
                <div className="data-row">
                    <span className="data-label">Security Protocol</span>
                    <span className="data-value" style={{ color: isConnected ? '#10b981' : '#64748b' }}>
                        {isConnected ? 'XTLS-Reality' : 'Standby'}
                    </span>
                </div>
                <div className="data-row">
                    <span className="data-label">AI Routing</span>
                    <span className="data-value" style={{ color: isConnected ? '#a855f7' : '#64748b' }}>
                        {isConnected ? 'ACTIVE' : 'OFFLINE'}
                    </span>
                </div>
            </div>

            <button 
                className={`connect-btn ${isConnected ? 'active' : ''}`}
                onClick={handleConnect}
                disabled={isConnected}
                style={{ width: '100%', marginBottom: '15px' }}
            >
                {isConnected ? 'System Live' : 'Establish Link'}
            </button>
            
            {isConnected && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '20px' }}>
                    <button 
                        onClick={() => setView('dashboard')}
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '10px 5px', borderRadius: '12px', color: '#fff', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.7rem', transition: 'background 0.3s' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                    >
                        <Activity size={18} color="#3b82f6" />
                        METRICS
                    </button>
                    <button 
                        onClick={() => setView('finance')}
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '10px 5px', borderRadius: '12px', color: '#fff', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.7rem', transition: 'background 0.3s' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                    >
                        <CreditCard size={18} color="#10b981" />
                        FINANCE
                    </button>
                    <button 
                        onClick={() => setView('settings')}
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '10px 5px', borderRadius: '12px', color: '#fff', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.7rem', transition: 'background 0.3s' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                    >
                        <Settings size={18} color="#a855f7" />
                        SETTINGS
                    </button>
                    <button 
                        onClick={() => setView('ai')}
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '10px 5px', borderRadius: '12px', color: '#fff', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.7rem', transition: 'background 0.3s' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                    >
                        <Terminal size={18} color="#ef4444" />
                        AI SENTINEL
                    </button>
                </div>
            )}
        </>
    );

    const renderDashboard = () => (
        <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingBottom: '15px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <button onClick={() => setView('main')} style={{ background: 'none', border: 'none', color: '#a78bfa', cursor: 'pointer', padding: 0 }}>
                    <ChevronLeft size={24} />
                </button>
                <h3 style={{ margin: 0, color: '#fff', fontSize: '1.1rem', letterSpacing: '1px' }}>CONTROL DASHBOARD</h3>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', background: 'rgba(0,0,0,0.3)', padding: '15px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                {servers[serverIndex].includes('Satellite') ? <Satellite color="#a855f7" size={30} /> : <Globe color="#3b82f6" size={30} />}
                <div>
                    <h4 style={{ margin: '0 0 5px 0', fontSize: '0.8rem', opacity: 0.6, textTransform: 'uppercase' }}>Active Node</h4>
                    <p style={{ margin: 0, fontWeight: 600, color: '#fff' }}>{servers[serverIndex]}</p>
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-around', margin: '10px 0' }}>
                <GlowingCircle value={ping} label="Ping (ms)" color="#10b981" />
                <GlowingCircle value={dlSpeed} label="DL (Mbps)" color="#3b82f6" />
                <GlowingCircle value={ulSpeed} label="UL (Mbps)" color="#a855f7" />
            </div>

            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', opacity: 0.8, marginBottom: '8px' }}>
                    <span>Network Latency Trend</span>
                    <span>{ping} ms</span>
                </div>
                <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px', overflow: 'hidden' }}>
                    <div style={{ width: `${Math.min((ping / 150) * 100, 100)}%`, height: '100%', background: ping < 100 ? '#10b981' : ping < 150 ? '#f59e0b' : '#ef4444', transition: 'all 0.3s ease' }} />
                </div>
            </div>
            
        </div>
    );

    const renderFinance = () => (
        <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingBottom: '15px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <button onClick={() => setView('main')} style={{ background: 'none', border: 'none', color: '#10b981', cursor: 'pointer', padding: 0 }}>
                    <ChevronLeft size={24} />
                </button>
                <h3 style={{ margin: 0, color: '#fff', fontSize: '1.1rem', letterSpacing: '1px' }}>FINANCE CENTER</h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '15px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <span style={{ fontSize: '0.7rem', opacity: 0.6, textTransform: 'uppercase' }}>Balance</span>
                    <p style={{ margin: '5px 0 0', fontWeight: 'bold', fontSize: '1.2rem', color: '#10b981' }}>${balanceHistory[balanceHistory.length-1].balance.toFixed(2)}</p>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '15px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <span style={{ fontSize: '0.7rem', opacity: 0.6, textTransform: 'uppercase' }}>Plan</span>
                    <p style={{ margin: '5px 0 0', fontWeight: 'bold', fontSize: '1.2rem', color: '#f59e0b' }}>GOLD</p>
                </div>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '16px', padding: '15px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <h4 style={{ margin: '0 0 15px', fontSize: '0.8rem', opacity: 0.8 }}>BALANCE HISTORY</h4>
                <div style={{ height: '140px', width: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={balanceHistory} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <Area type="monotone" dataKey="balance" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorBalance)" />
                            <Tooltip contentStyle={{ backgroundColor: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', background: 'rgba(0,0,0,0.2)', padding: '10px 15px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ width: '80px', height: '80px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={PieData} cx="50%" cy="50%" innerRadius={20} outerRadius={40} paddingAngle={5} dataKey="value">
                                {PieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <span style={{ fontSize: '0.8rem', opacity: 0.8, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '3px' }}>Distribution</span>
                    {PieData.map(d => (
                        <div key={d.name} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><div style={{ width: 6, height: 6, borderRadius: '50%', background: d.color }}/>{d.name}</span>
                            <span style={{ opacity: 0.7 }}>{d.value}%</span>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );

    const renderSettings = () => (
        <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '20px', height: '100%', maxHeight: '500px', overflowY: 'auto', paddingRight: '5px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingBottom: '15px', borderBottom: '1px solid rgba(255,255,255,0.1)', position: 'sticky', top: 0, background: 'rgba(15,23,42,0.95)', zIndex: 10, backdropFilter: 'blur(5px)' }}>
                <button onClick={() => setView('main')} style={{ background: 'none', border: 'none', color: '#a855f7', cursor: 'pointer', padding: 0 }}>
                    <ChevronLeft size={24} />
                </button>
                <h3 style={{ margin: 0, color: '#fff', fontSize: '1.1rem', letterSpacing: '1px' }}>SYSTEM SETTINGS</h3>
            </div>

            {/* Language Settings */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <h4 style={{ margin: 0, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px', color: '#fff', opacity: 0.8 }}>
                    <Languages size={16} color="#a855f7" /> 🌐 Global Language
                </h4>
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '15px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '0.9rem', flex: 1 }}>Select Region Language:</span>
                        <select 
                            value={currentLanguage}
                            onChange={(e) => handleChangeLanguage(e.target.value)}
                            style={{ background: 'rgba(0,0,0,0.5)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', padding: '8px 12px', borderRadius: '8px', outline: 'none', cursor: 'pointer', fontSize: '0.8rem' }}
                        >
                            {supportedLanguages.map(lang => (
                                <option key={lang} value={lang} style={{ background: '#0f172a' }}>{lang.toUpperCase()}</option>
                            ))}
                        </select>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Zap size={12} /> Active Language Profile: {currentLanguage.toUpperCase()}
                    </div>
                </div>
            </div>

            {/* Subscriptions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                <h4 style={{ margin: 0, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px', color: '#fff', opacity: 0.8 }}>
                    <Shield size={16} color="#a855f7" /> 💳 Subscriptions
                </h4>
                {subscriptions.map(sub => (
                    <div key={sub.label} style={{ background: 'rgba(0,0,0,0.3)', padding: '12px 15px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.9rem' }}>{sub.label} Plan</span>
                        <span style={{ color: '#10b981', fontWeight: 'bold', fontSize: '0.9rem' }}>{sub.price}</span>
                    </div>
                ))}
            </div>

            {/* Customer Management */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                <h4 style={{ margin: 0, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px', color: '#fff', opacity: 0.8 }}>
                    <Users size={16} color="#a855f7" /> 👥 Customer Management
                </h4>
                {customers.map(customer => (
                    <div key={customer.email} style={{ background: 'rgba(0,0,0,0.3)', padding: '12px 15px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{customer.name}</span>
                            <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>{customer.email} | Plan: {customer.plan}</span>
                        </div>
                        <span style={{ color: customer.status === 'Paid' ? '#10b981' : '#f59e0b', fontSize: '0.8rem', fontWeight: 'bold' }}>{customer.status}</span>
                    </div>
                ))}
            </div>

            {/* AI Support Chat */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                <h4 style={{ margin: 0, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px', color: '#fff', opacity: 0.8 }}>
                    <MessageSquare size={16} color="#a855f7" /> 💬 AI Support Chat
                </h4>
                <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', padding: '10px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ height: '150px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', fontFamily: '"JetBrains Mono", monospace' }}>
                        {chatMessages.map((msg, i) => (
                            <div key={i} style={{ fontSize: '0.75rem', color: msg.sender === 'You' ? '#3b82f6' : '#10b981', lineHeight: 1.4 }}>
                                [{msg.sender}]: {msg.text}
                            </div>
                        ))}
                        {sendingChat && <div style={{ fontSize: '0.75rem', color: '#a78bfa' }}>[SYSTEM] Awaiting neural response... <span className="blink-cursor">_</span></div>}
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <input 
                            type="text" 
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                            placeholder="Type your issue..." 
                            style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '8px 12px', borderRadius: '8px', color: '#fff', fontSize: '0.8rem', outline: 'none' }}
                        />
                        <button 
                            onClick={handleSendMessage}
                            disabled={sendingChat || !chatInput.trim()}
                            style={{ background: 'rgba(168,85,247,0.2)', border: '1px solid #a855f7', padding: '0 15px', borderRadius: '8px', color: '#fff', cursor: (sendingChat || !chatInput.trim()) ? 'not-allowed' : 'pointer', opacity: (sendingChat || !chatInput.trim()) ? 0.5 : 1 }}
                        >
                            <Send size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Games Section */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                <h4 style={{ margin: 0, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px', color: '#fff', opacity: 0.8 }}>
                    <Gamepad2 size={16} color="#a855f7" /> 🎮 Popular Games
                </h4>
                {popularGames.map(game => (
                    <div key={game.name} style={{ background: 'rgba(0,0,0,0.3)', padding: '10px 15px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.9rem' }}>{game.name}</span>
                        <button style={{ background: 'rgba(168,85,247,0.2)', border: '1px solid #a855f7', padding: '6px 15px', borderRadius: '8px', color: '#fff', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <PlaySquare size={12} /> Play
                        </button>
                    </div>
                ))}
            </div>

            {/* Rewards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                <h4 style={{ margin: 0, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px', color: '#fff', opacity: 0.8 }}>
                    <Gift size={16} color="#a855f7" /> 🏆 Rewards
                </h4>
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '15px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '8px' }}>
                        <span>Progress</span>
                        <span style={{ color: '#10b981', fontWeight: 'bold' }}>{rewards} pts</span>
                    </div>
                    <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px', overflow: 'hidden', marginBottom: '15px' }}>
                        <div style={{ width: `${rewards}%`, height: '100%', background: '#a855f7' }} />
                    </div>
                    <button style={{ width: '100%', background: 'rgba(112,0,255,0.2)', border: '1px solid #7000ff', padding: '10px', borderRadius: '8px', color: '#fff', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <Globe size={16} /> Watch Video
                    </button>
                </div>
            </div>

            {/* Referral */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                <h4 style={{ margin: 0, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px', color: '#fff', opacity: 0.8 }}>
                    <LinkIcon size={16} color="#a855f7" /> 🔗 Referral
                </h4>
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '15px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div style={{ fontSize: '0.9rem', marginBottom: '4px' }}>Share your link</div>
                        <div style={{ fontSize: '0.7rem', color: '#10b981', fontFamily: 'monospace' }}>{referralLink}</div>
                    </div>
                    <button style={{ background: 'rgba(168,85,247,0.2)', border: '1px solid #a855f7', padding: '8px', borderRadius: '8px', color: '#fff', cursor: 'pointer' }}>
                        <Share2 size={16} />
                    </button>
                </div>
            </div>

            {/* Security Control */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                <h4 style={{ margin: 0, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px', color: '#fff', opacity: 0.8 }}>
                    <ShieldAlert size={16} color="#ef4444" /> 🔒 Security Control
                </h4>
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '15px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.9rem' }}>Ghost Mode</span>
                        <button 
                            onClick={() => setGhostMode(!ghostMode)}
                            style={{ background: ghostMode ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.1)', border: `1px solid ${ghostMode ? '#10b981' : 'rgba(255,255,255,0.2)'}`, padding: '4px 12px', borderRadius: '20px', color: '#fff', fontSize: '0.75rem', cursor: 'pointer' }}>
                            {ghostMode ? 'ON' : 'OFF'}
                        </button>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.9rem', color: emergencyMode ? '#ef4444' : '#fff' }}>Emergency Mode</span>
                        <button 
                            onClick={() => setEmergencyMode(!emergencyMode)}
                            style={{ background: emergencyMode ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.1)', border: `1px solid ${emergencyMode ? '#ef4444' : 'rgba(255,255,255,0.2)'}`, padding: '4px 12px', borderRadius: '20px', color: '#fff', fontSize: '0.75rem', cursor: 'pointer' }}>
                            {emergencyMode ? 'ON' : 'OFF'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Customer Management */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                <h4 style={{ margin: 0, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px', color: '#fff', opacity: 0.8 }}>
                    <Shield size={16} color="#a855f7" /> 👥 Customer Management
                </h4>
                {customers.map(customer => (
                    <div key={customer.email} style={{ background: 'rgba(0,0,0,0.3)', padding: '12px 15px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{customer.name}</span>
                            <span style={{ color: customer.status === 'Paid' ? '#10b981' : '#f59e0b', fontSize: '0.8rem', fontWeight: 'bold' }}>{customer.status}</span>
                        </div>
                        <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>{customer.email} | Plan: {customer.plan}</span>
                    </div>
                ))}
            </div>

            {/* AI Support Chat */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px', marginBottom: '20px' }}>
                <h4 style={{ margin: 0, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px', color: '#fff', opacity: 0.8 }}>
                    <Terminal size={16} color="#a855f7" /> 💬 AI Support Chat
                </h4>
                <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ height: '180px', overflowY: 'auto', padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {chatMessages.map((msg, idx) => (
                            <div key={idx} style={{ alignSelf: msg.sender === 'You' ? 'flex-end' : 'flex-start', background: msg.sender === 'You' ? 'rgba(112,0,255,0.3)' : 'rgba(255,255,255,0.05)', padding: '8px 12px', borderRadius: '12px', maxWidth: '85%', fontSize: '0.8rem', lineHeight: 1.4, border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ fontSize: '0.65rem', opacity: 0.6, marginBottom: '2px', fontWeight: 'bold', color: msg.sender === 'You' ? '#a78bfa' : '#10b981' }}>{msg.sender}</div>
                                <div>{msg.text}</div>
                            </div>
                        ))}
                        {sendingChat && (
                            <div style={{ alignSelf: 'flex-start', fontSize: '0.7rem', color: '#10b981', padding: '5px' }}>
                                Typing<span className="blink-cursor">...</span>
                            </div>
                        )}
                    </div>
                    <div style={{ display: 'flex', borderTop: '1px solid rgba(255,255,255,0.05)', padding: '8px', gap: '8px', background: 'rgba(0,0,0,0.2)' }}>
                        <input 
                            value={chatInput}
                            onChange={e => setChatInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                            placeholder="Type your issue..."
                            style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px 12px', color: '#fff', fontSize: '0.8rem', outline: 'none' }}
                        />
                        <button 
                            onClick={handleSendMessage}
                            disabled={sendingChat || !chatInput.trim()}
                            style={{ background: '#7000ff', border: 'none', borderRadius: '8px', padding: '0 15px', color: '#fff', cursor: (sendingChat || !chatInput.trim()) ? 'not-allowed' : 'pointer', opacity: (sendingChat || !chatInput.trim()) ? 0.5 : 1, transition: 'all 0.2s', fontSize: '0.8rem', fontWeight: 'bold' }}>
                            Send
                        </button>
                    </div>
                </div>
            </div>
            
        </div>
    );

    const renderAI = () => (
        <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '20px', height: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingBottom: '15px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <button onClick={() => setView('main')} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 0 }}>
                    <ChevronLeft size={24} />
                </button>
                <h3 style={{ margin: 0, color: '#fff', fontSize: '1.1rem', letterSpacing: '1px' }}>A.I. SENTINEL CORE</h3>
            </div>
            
            <div style={{ flex: 1, background: 'rgba(0,0,0,0.4)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', padding: '15px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', fontFamily: '"JetBrains Mono", monospace' }}>
                {aiLogs.map((log, i) => (
                    <div key={i} style={{ fontSize: '0.8rem', color: log.includes('ERROR') ? '#ef4444' : log.includes('AI') ? '#10b981' : '#a855f7', lineHeight: 1.4 }}>
                        {log}
                    </div>
                ))}
                {analyzing && <div style={{ fontSize: '0.8rem', color: '#a78bfa' }}>[SYSTEM] Diagnostic in progress... <span className="blink-cursor">_</span></div>}
            </div>

            <button 
                onClick={triggerAIAnalysis}
                disabled={analyzing}
                style={{ width: '100%', background: 'rgba(239,68,68,0.15)', border: '1px solid #ef4444', padding: '12px', borderRadius: '12px', color: '#fca5a5', fontSize: '0.8rem', cursor: analyzing ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.3s' }}>
                <Activity size={16} />
                RUN NETWORK DIAGNOSTIC
            </button>

            <div style={{ textAlign: 'center', fontSize: '0.8rem', color: autoHealActive ? '#10b981' : '#f59e0b', fontWeight: 'bold' }}>
                {autoHealActive ? "✅ Auto-Heal Active – System Stable" : "🧠 Awaiting Diagnostic..."}
            </div>
        </div>
    );

    return (
        <div className="mirage-container">
            <div className="glass-panel" style={{ minHeight: '480px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                {view === 'main' && renderMainContent()}
                {view === 'dashboard' && renderDashboard()}
                {view === 'finance' && renderFinance()}
                {view === 'settings' && renderSettings()}
                {view === 'ai' && renderAI()}
            </div>
        </div>
    );
}
