import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, BarChart, Bar, Legend, PieChart, Pie, Cell, ComposedChart, Line } from 'recharts';
import { Activity, Clock, AlertTriangle, ShieldCheck, Zap, Globe, Satellite, Terminal, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CloudDashboard() {
    const navigate = useNavigate();
    const [data, setData] = useState(Array.from({ length: 20 }, (_, i) => ({ time: i, bandwidth: 50 + Math.random() * 20 })));
    const [alerts, setAlerts] = useState([
        { id: 1, type: '⚡', msg: 'Quantum link established', time: 'Just now' },
        { id: 2, type: '🌌', msg: 'GCP sync active', time: '2m ago' },
        { id: 3, type: '🛰️', msg: 'Satellite failover standby', time: '1h ago' }
    ]);
    const [uptime] = useState('99.98%');
    const [disconnections, setDisconnections] = useState(2);
    const [failovers, setFailovers] = useState(1);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'overview' | 'quickfix' | 'reports' | 'ai-core'>('overview');
    const [quickFixView, setQuickFixView] = useState<'list' | 'timeline' | 'chart'>('list');
    const [activeArtifact, setActiveArtifact] = useState<'java' | 'js' | 'kotlin' | 'css' | 'xml'>('js');
    const [showDigest, setShowDigest] = useState(false);

    const handleCategoryClick = (category: string) => {
        setSelectedCategory(prev => prev === category ? null : category);
    };

    const errorBarData = [
        { day: 'Mon', connection: 2, database: 1, github: 0, cloud: 3 },
        { day: 'Tue', connection: 1, database: 0, github: 1, cloud: 2 },
        { day: 'Wed', connection: 3, database: 2, github: 0, cloud: 1 },
        { day: 'Thu', connection: 0, database: 1, github: 2, cloud: 0 },
        { day: 'Fri', connection: 4, database: 0, github: 1, cloud: 2 },
        { day: 'Sat', connection: 1, database: 0, github: 0, cloud: 1 },
        { day: 'Sun', connection: 2, database: 3, github: 1, cloud: 0 },
    ];

    const errorPieData = [
        { name: '🛰️ Connection', value: 13, color: '#EAB308' },
        { name: '🗄️ Database', value: 7, color: '#38BDF8' },
        { name: '🧑‍💻 GitHub-Code', value: 5, color: '#A855F7' },
        { name: '☁️ Cloud-API', value: 9, color: '#F43F5E' },
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setData(prev => [...prev.slice(1), { time: prev[prev.length - 1].time + 1, bandwidth: 50 + Math.random() * 30 + (Math.random() > 0.8 ? 50 : 0) }]);
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    const quickFixChartData = [
        { time: '10:00', resolved: 2, pending: 1, failed: 0 },
        { time: '12:00', resolved: 4, pending: 0, failed: 1 },
        { time: '14:00', resolved: 3, pending: 2, failed: 0 },
        { time: '16:00', resolved: 6, pending: 0, failed: 0 },
        { time: '18:00', resolved: 1, pending: 0, failed: 2 },
        { time: '20:00', resolved: 5, pending: 1, failed: 1 },
    ];

    const QuickFixCustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-[#0F172A] border border-[#1E293B] p-4 rounded-xl shadow-2xl font-mono text-xs">
                    <p className="text-[#E2E8F0] font-bold mb-2 border-b border-[#1E293B] pb-1">{label} Overview</p>
                    {payload.map((entry: any, index: number) => (
                        <div key={index} className="mb-3 last:mb-0">
                            <div className="flex items-center gap-2 font-bold" style={{ color: entry.color }}>
                                {entry.dataKey === 'resolved' ? '✅' : entry.dataKey === 'pending' ? '⚠️' : '❌'} {entry.name}: {entry.value}
                            </div>
                            <div className="text-[#94A3B8] text-[10px] mt-1 pl-6 line-clamp-2">
                                {entry.dataKey === 'resolved' ? (
                                    <>
                                        <span className="text-[#10B981]">Fix:</span> Auto-resolved via Load Balancer.<br/>
                                        <span className="text-[#10B981]">Status:</span> Stable.
                                    </>
                                ) : entry.dataKey === 'pending' ? (
                                    <>
                                        <span className="text-[#EAB308]">Fix:</span> Requires admin verification.<br/>
                                        <span className="text-[#EAB308]">Status:</span> Waiting.
                                    </>
                                ) : (
                                    <>
                                        <span className="text-[#F43F5E]">Fix:</span> Manual intervention needed.<br/>
                                        <span className="text-[#F43F5E]">Status:</span> Failed.
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="relative w-full min-h-screen bg-gradient-to-br from-[#0B0F19] to-[#04060A] text-[#F8FAFC] font-sans overflow-x-hidden p-6 md:p-12">
            
            {/* Header */}
            <header className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 mb-10 pb-6 border-b border-[#1E293B] relative">
                <div className="flex items-center gap-4 cursor-pointer" onClick={() => navigate('/')}>
                    <Globe className="w-8 h-8 text-[#38BDF8]" />
                    <div>
                        <h1 className="text-2xl font-bold tracking-widest text-[#E2E8F0]">CLOUD DASHBOARD</h1>
                        <p className="text-xs tracking-[0.2em] text-[#94A3B8] mt-1">UFO ALBARQ ⚡ MASTER NODE</p>
                    </div>
                </div>
                
                {/* Tabs */}
                <div className="flex bg-[#0F172A] p-1 rounded-xl border border-[#1E293B]">
                    <button 
                        onClick={() => setActiveTab('overview')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold tracking-widest transition-colors ${activeTab === 'overview' ? 'bg-[#1E293B] text-[#E2E8F0]' : 'text-[#94A3B8] hover:text-[#E2E8F0]'}`}
                    >
                        <Activity className="w-4 h-4" /> OVERVIEW
                    </button>
                    <button 
                        onClick={() => setActiveTab('quickfix')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold tracking-widest transition-colors ${activeTab === 'quickfix' ? 'bg-[#1E293B] text-[#E2E8F0]' : 'text-[#94A3B8] hover:text-[#E2E8F0]'}`}
                    >
                        <Zap className="w-4 h-4" /> QUICK FIX LOG
                    </button>
                    <button 
                        onClick={() => setActiveTab('reports')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold tracking-widest transition-colors ${activeTab === 'reports' ? 'bg-[#1E293B] text-[#E2E8F0]' : 'text-[#94A3B8] hover:text-[#E2E8F0]'}`}
                    >
                        <span className="text-[14px]">⚡</span> WEEKLY HARVEST
                    </button>
                    <button 
                        onClick={() => setActiveTab('ai-core')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold tracking-widest transition-colors ${activeTab === 'ai-core' ? 'bg-[#1E293B] text-[#10B981]' : 'text-[#94A3B8] hover:text-[#10B981]'}`}
                    >
                        <Satellite className="w-4 h-4" /> AI CORE
                    </button>
                </div>
                
                <div className="flex gap-4 relative">
                    <button 
                        onClick={() => setShowDigest(!showDigest)}
                        className="bg-[#0F172A] p-2 hover:bg-[#1E293B] transition-colors rounded-lg border border-[#1E293B] flex items-center justify-center relative shadow-[0_0_15px_rgba(234,179,8,0.3)] hover:shadow-[0_0_20px_rgba(234,179,8,0.5)]"
                    >
                        <span className="text-[18px] leading-none drop-shadow-[0_0_8px_rgba(255,215,0,0.8)]">⚡</span>
                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#EAB308] opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-[#EAB308]"></span>
                        </span>
                    </button>
                    <div className="bg-[#0F172A] px-4 py-2 rounded-lg border border-[#1E293B] flex items-center gap-2">
                         <div className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></div>
                         <span className="text-sm font-medium tracking-wide">SYSTEM ONLINE</span>
                    </div>
                    <div className="bg-[#10B981]/10 px-4 py-2 rounded-lg border border-[#10B981]/30 flex items-center gap-2">
                         <div className="w-2 h-2 rounded-full bg-[#10B981] shadow-[0_0_8px_#10B981] animate-pulse"></div>
                         <span className="text-sm font-bold tracking-widest text-[#10B981]">AUTO-FIX: ON</span>
                    </div>
                    
                    {/* Daily Digest Notification Panel */}
                    {showDigest && (
                        <div className="absolute top-14 right-0 w-80 bg-[#0F172A] border border-[#1E293B] rounded-2xl shadow-2xl z-50 overflow-hidden">
                            <div className="p-4 border-b border-[#1E293B] flex justify-between items-center bg-[#1E293B]/30">
                                <h3 className="text-sm font-bold tracking-widest flex items-center gap-2 text-[#E2E8F0]">
                                    <span className="text-[14px] drop-shadow-[0_0_8px_rgba(255,215,0,0.8)]">⚡</span> DAILY DIGEST <span className="text-[10px] text-[#EAB308] ml-2 font-mono drop-shadow-[0_0_5px_rgba(234,179,8,0.5)]">23:59</span>
                                </h3>
                                <button onClick={() => setShowDigest(false)} className="text-[#94A3B8] hover:text-white">✕</button>
                            </div>
                            <div className="p-4 space-y-4 font-mono text-xs">
                                <div className="flex justify-between items-center p-2 rounded bg-black/20 border border-[#1E293B]">
                                    <span className="text-[#94A3B8]">Recorded Errors:</span>
                                    <span className="text-[#F43F5E] font-bold text-sm">4</span>
                                </div>
                                <div className="flex justify-between items-center p-2 rounded bg-[#10B981]/10 border border-[#10B981]/30 mt-2">
                                    <span className="text-[#10B981] font-bold">Auto-Resolved:</span>
                                    <span className="text-[#10B981] font-bold text-sm">4</span>
                                </div>
                                <div className="space-y-3 mt-2">
                                    <div className="border-l-2 border-[#10B981] pl-3 py-1">
                                        <div className="text-[#F8FAFC] font-bold mb-1">GCP Timeout &amp; RTDB Delay</div>
                                        <div className="text-[#94A3B8] flex justify-between">
                                            <span>Fallback &amp; Reconnect</span>
                                            <span className="text-[#10B981]">✅ Fixed</span>
                                        </div>
                                    </div>
                                    <div className="border-l-2 border-[#10B981] pl-3 py-1">
                                        <div className="text-[#F8FAFC] font-bold mb-1">High CPU &amp; CI Conflict</div>
                                        <div className="text-[#94A3B8] flex flex-col gap-1">
                                            <div className="flex justify-between">
                                                <span className="truncate mr-2">Multi-Server Load Balancing</span>
                                                <span className="text-[#10B981] shrink-0">✅ Fixed</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="truncate mr-2">Smart Merge &amp; Rollback</span>
                                                <span className="text-[#10B981] shrink-0">✅ Fixed</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => { setShowDigest(false); setActiveTab('quickfix'); }}
                                    className="w-full text-center mt-2 py-2 rounded bg-[#38BDF8]/10 text-[#38BDF8] hover:bg-[#38BDF8]/20 transition-colors tracking-widest font-bold"
                                >
                                    OPEN QUICK FIX LOG
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </header>

            {activeTab === 'overview' && (
            <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Live Graph & Indicators */}
                <div className="lg:col-span-2 space-y-8">
                    
                    {/* Live Graph */}
                    <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl p-6 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#38BDF8] opacity-5 blur-[100px] pointer-events-none"></div>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-semibold tracking-wide text-[#E2E8F0] flex items-center gap-2">
                                <Activity className="w-5 h-5 text-[#38BDF8]" /> Network Telemetry
                            </h2>
                            <span className="text-xs font-mono bg-[#1E293B] px-3 py-1 rounded text-[#38BDF8]">LIVE</span>
                        </div>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorBandwidth" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#38BDF8" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                                    <XAxis dataKey="time" hide />
                                    <YAxis stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: '#0B0F19', borderColor: '#1E293B', borderRadius: '8px' }}
                                        itemStyle={{ color: '#38BDF8' }}
                                        labelStyle={{ display: 'none' }}
                                    />
                                    <Area type="monotone" dataKey="bandwidth" stroke="#38BDF8" strokeWidth={2} fillOpacity={1} fill="url(#colorBandwidth)" isAnimationActive={false} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Daily Indicators (Summary) */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl p-6 shadow-lg flex flex-col justify-between hover:border-[#38BDF8] transition-colors">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-[#10B981]/10 rounded-xl">
                                    <Clock className="w-6 h-6 text-[#10B981]" />
                                </div>
                                <span className="text-[#94A3B8] text-xs font-mono uppercase">24h Uptime</span>
                            </div>
                            <h3 className="text-3xl font-bold">{uptime}</h3>
                        </div>

                        <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl p-6 shadow-lg flex flex-col justify-between hover:border-[#F43F5E] transition-colors">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-[#F43F5E]/10 rounded-xl">
                                    <AlertTriangle className="w-6 h-6 text-[#F43F5E]" />
                                </div>
                                <span className="text-[#94A3B8] text-xs font-mono uppercase">Disconnections</span>
                            </div>
                            <h3 className="text-3xl font-bold text-[#F43F5E]">{disconnections}</h3>
                        </div>

                        <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl p-6 shadow-lg flex flex-col justify-between hover:border-[#EAB308] transition-colors">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-[#EAB308]/10 rounded-xl">
                                    <Satellite className="w-6 h-6 text-[#EAB308]" />
                                </div>
                                <span className="text-[#94A3B8] text-xs font-mono uppercase">Satellite Failovers</span>
                            </div>
                            <h3 className="text-3xl font-bold text-[#EAB308]">{failovers}</h3>
                        </div>
                    </div>

                </div>

                {/* Right Column - Alerts & Logs */}
                <div className="space-y-8">
                    
                    {/* Control Panel Alerts */}
                    <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl p-6 shadow-lg">
                        <h2 className="text-sm font-bold tracking-widest text-[#E2E8F0] mb-6 flex items-center gap-2">
                            <Zap className="w-4 h-4 text-[#FFD700]" /> ACTIVE ALERTS
                        </h2>
                        <div className="space-y-4">
                            {alerts.map(a => (
                                <div key={a.id} className="flex items-center gap-4 p-3 rounded-xl bg-[#1E293B]/50 border border-[#334155]/50 backdrop-blur-sm">
                                    <div className="text-2xl drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]">
                                        {a.type}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">{a.msg}</p>
                                        <p className="text-[10px] text-[#94A3B8] mt-1 uppercase tracking-wider">{a.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Event Log */}
                    <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl shadow-lg flex flex-col h-[350px]">
                        <div className="p-6 border-b border-[#1E293B]">
                             <h2 className="text-sm font-bold tracking-widest text-[#E2E8F0] flex items-center gap-2">
                                <Terminal className="w-4 h-4 text-[#A855F7]" /> EVENT LOG (LZMA-ZIP)
                             </h2>
                        </div>
                        <div className="p-6 flex-1 overflow-y-auto space-y-3 font-mono text-xs">
                             <div className="text-[#94A3B8] flex gap-2"><span className="text-[#38BDF8]">[14:00:21]</span><span>Sys initialization complete.</span></div>
                             <div className="text-[#94A3B8] flex gap-2"><span className="text-[#38BDF8]">[14:02:44]</span><span>Handshake w/ GCP Node-3.</span></div>
                             <div className="text-[#94A3B8] flex gap-2"><span className="text-[#10B981]">[14:02:48]</span><span>XTLS-Reality tunnel Armed.</span></div>
                             <div className="text-[#94A3B8] flex gap-2"><span className="text-[#38BDF8]">[15:10:05]</span><span>Log compression: event_log_2026-05-12.zip created.</span></div>
                             <div className="text-[#94A3B8] flex gap-2"><span className="text-[#EAB308]">[16:45:12]</span><span>High latency detected via Primary line.</span></div>
                             <div className="text-[#94A3B8] flex gap-2"><span className="text-[#EAB308]">[16:45:15]</span><span>Triggering failover to Satellite Hysteria2...</span></div>
                             <div className="text-[#94A3B8] flex gap-2"><span className="text-[#10B981]">[16:45:19]</span><span>Satellite link established.</span></div>
                             <div className="text-[#94A3B8] flex gap-2"><span className="text-[#38BDF8]">[18:22:10]</span><span>Telemetry snapshot mapped.</span></div>
                        </div>
                    </div>

                </div>
            </div>

            {/* Error Analytics Charts */}
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Bar Chart: Daily Errors by Category */}
                <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl p-6 shadow-lg">
                    <h2 className="text-sm font-bold tracking-widest text-[#E2E8F0] mb-6 flex items-center gap-2">
                        📊 DAILY ERROR TRENDS
                    </h2>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={errorBarData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                                <XAxis dataKey="day" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip cursor={{fill: '#1E293B', opacity: 0.4}} contentStyle={{ backgroundColor: '#0B0F19', borderColor: '#1E293B', borderRadius: '8px', color: '#F8FAFC' }} />
                                <Legend wrapperStyle={{ fontSize: '12px', color: '#94A3B8' }} />
                                <Bar dataKey="connection" name="🛰️ Connection" stackId="a" fill="#EAB308" radius={[0, 0, 0, 0]} onClick={() => handleCategoryClick('🛰️ Connection')} cursor="pointer" />
                                <Bar dataKey="database" name="🗄️ Database" stackId="a" fill="#38BDF8" radius={[0, 0, 0, 0]} onClick={() => handleCategoryClick('🗄️ Database')} cursor="pointer" />
                                <Bar dataKey="github" name="🧑‍💻 GitHub-Code" stackId="a" fill="#A855F7" radius={[0, 0, 0, 0]} onClick={() => handleCategoryClick('🧑‍💻 GitHub-Code')} cursor="pointer" />
                                <Bar dataKey="cloud" name="☁️ Cloud-API" stackId="a" fill="#F43F5E" radius={[4, 4, 0, 0]} onClick={() => handleCategoryClick('☁️ Cloud-API')} cursor="pointer" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Pie Chart: Error Distribution */}
                <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl p-6 shadow-lg">
                    <h2 className="text-sm font-bold tracking-widest text-[#E2E8F0] mb-6 flex items-center gap-2">
                        🎯 ERROR DISTRIBUTION
                    </h2>
                    <div className="h-[250px] w-full flex justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={errorPieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={90}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {errorPieData.map((entry, index) => (
                                        <Cell 
                                            key={`cell-${index}`} 
                                            fill={entry.color} 
                                            onClick={() => handleCategoryClick(entry.name)}
                                            style={{ cursor: 'pointer', outline: 'none' }}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: '#0B0F19', borderColor: '#1E293B', borderRadius: '8px', color: '#F8FAFC' }} itemStyle={{ color: '#E2E8F0' }} />
                                <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: '12px', color: '#94A3B8' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Error Monitor & Auto-Fix */}
            <div className="mt-8 bg-[#0F172A] border border-[#1E293B] rounded-2xl shadow-lg flex flex-col h-[350px]">
                <div className="p-6 border-b border-[#1E293B] flex justify-between items-center">
                    <h2 className="text-sm font-bold tracking-widest text-[#E2E8F0] flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#F43F5E]" /> {selectedCategory ? `${selectedCategory.toUpperCase()} ERRORS` : 'ERROR MONITOR & AUTO-FIX'}
                    </h2>
                    <button className="text-[10px] font-bold tracking-widest bg-[#1E293B] hover:bg-[#334155] px-4 py-2 rounded-lg text-[#E2E8F0] transition-colors border border-[#334155]">
                    WEEKLY REPORT
                    </button>
                </div>
                <div className="p-6 flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 font-mono text-xs">
                    {/* Collected Errors */}
                    {(!selectedCategory || selectedCategory === '☁️ Cloud-API') && (
                    <div className="p-4 border border-[#F43F5E]/30 bg-[#F43F5E]/5 rounded-xl flex flex-col justify-between cursor-default hover:bg-[#F43F5E]/10 transition-colors">
                        <div>
                            <div className="flex justify-between items-start mb-3">
                                <span className="text-[#F43F5E] font-bold text-sm flex items-center gap-2">☁️ Cloud-API [ERR-01]</span>
                                <span className="text-[#94A3B8] text-[10px]">10:45 AM</span>
                            </div>
                            <p className="text-[#94A3B8] text-[11px] mb-4 leading-relaxed"><strong className="text-[#F8FAFC]">Error:</strong> Connection dropped during GitHub MCP sync. The GCP API stream was interrupted by regional networking issues.</p>
                        </div>
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2 text-[#10B981] text-[11px] font-bold tracking-wide bg-[#10B981]/10 px-3 py-2 rounded-lg">
                                <Zap className="w-4 h-4" /> <span><strong className="text-[#10B981]">Fix:</strong> Switched to fallback GCP mirror.</span>
                            </div>
                            <div className="text-[10px] text-[#94A3B8] flex justify-end font-bold uppercase tracking-wider">
                                Status: <span className="text-[#10B981] ml-1">Fixed ✅</span>
                            </div>
                        </div>
                    </div>
                    )}

                    {(!selectedCategory || selectedCategory === '🗄️ Database') && (
                    <div className="p-4 border border-[#F43F5E]/30 bg-[#F43F5E]/5 rounded-xl flex flex-col justify-between cursor-default hover:bg-[#F43F5E]/10 transition-colors">
                        <div>
                            <div className="flex justify-between items-start mb-3">
                                <span className="text-[#F43F5E] font-bold text-sm flex items-center gap-2">🗄️ Database [ERR-02]</span>
                                <span className="text-[#94A3B8] text-[10px]">02:15 PM</span>
                            </div>
                            <p className="text-[#94A3B8] text-[11px] mb-4 leading-relaxed"><strong className="text-[#F8FAFC]">Error:</strong> Latency {'>'} 500ms detected on Firebase Realtime Database node stream.</p>
                        </div>
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2 text-[#10B981] text-[11px] font-bold tracking-wide bg-[#10B981]/10 px-3 py-2 rounded-lg">
                                <Zap className="w-4 h-4" /> <span><strong className="text-[#10B981]">Fix:</strong> Force-reconnected listener.</span>
                            </div>
                            <div className="text-[10px] text-[#94A3B8] flex justify-end font-bold uppercase tracking-wider">
                                Status: <span className="text-[#10B981] ml-1">Fixed ✅</span>
                            </div>
                        </div>
                    </div>
                    )}

                    {(!selectedCategory || selectedCategory === '🛰️ Connection') && (
                    <div className="p-4 border border-[#EAB308]/30 bg-[#EAB308]/5 rounded-xl flex flex-col justify-between cursor-default hover:bg-[#EAB308]/10 transition-colors">
                        <div>
                            <div className="flex justify-between items-start mb-3">
                                <span className="text-[#EAB308] font-bold text-sm flex items-center gap-2">🛰️ Connection [WARN-01]</span>
                                <span className="text-[#94A3B8] text-[10px]">05:30 PM</span>
                            </div>
                            <p className="text-[#94A3B8] text-[11px] mb-4 leading-relaxed"><strong className="text-[#F8FAFC]">Error:</strong> Satellite failover module consuming {'>'} 80% CPU during route computation.</p>
                        </div>
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2 text-[#10B981] text-[11px] font-bold tracking-wide bg-[#10B981]/10 px-3 py-2 rounded-lg cursor-default">
                                <Terminal className="w-4 h-4" /> <span><strong className="text-[#10B981]">Auto-Fix:</strong> Rebalanced load to multi-server cluster & restarted NetGuard.</span>
                            </div>
                            <div className="text-[10px] text-[#94A3B8] flex justify-end font-bold uppercase tracking-wider">
                                Status: <span className="text-[#10B981] ml-1">Fixed ✅</span>
                            </div>
                        </div>
                    </div>
                    )}
                    
                    {(!selectedCategory || selectedCategory === '🧑‍💻 GitHub-Code') && (
                    <div className="p-4 border border-[#F43F5E]/30 bg-[#F43F5E]/5 rounded-xl flex flex-col justify-between cursor-default hover:bg-[#F43F5E]/10 transition-colors">
                        <div>
                            <div className="flex justify-between items-start mb-3">
                                <span className="text-[#F43F5E] font-bold text-sm flex items-center gap-2">🧑‍💻 GitHub-Code [ERR-03]</span>
                                <span className="text-[#94A3B8] text-[10px]">06:12 PM</span>
                            </div>
                            <p className="text-[#94A3B8] text-[11px] mb-4 leading-relaxed"><strong className="text-[#F8FAFC]">Error:</strong> CI/CD sync failed due to merge conflict during auto-sync algorithm adjustment.</p>
                        </div>
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2 text-[#10B981] text-[11px] font-bold tracking-wide bg-[#10B981]/10 px-3 py-2 rounded-lg cursor-default">
                                <Zap className="w-4 h-4" /> <span><strong className="text-[#10B981]">Auto-Fix:</strong> Smart-merged conflicts & rolled back to stable commit.</span>
                            </div>
                            <div className="text-[10px] text-[#94A3B8] flex justify-end font-bold uppercase tracking-wider">
                                Status: <span className="text-[#10B981] ml-1">Fixed ✅</span>
                            </div>
                        </div>
                    </div>
                    )}
                </div>
            </div>
            </>
            )}

            {activeTab === 'quickfix' && (
            <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl shadow-lg flex flex-col h-[calc(100vh-200px)]">
                <div className="p-6 border-b border-[#1E293B] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                     <h2 className="text-sm font-bold tracking-widest text-[#E2E8F0] flex items-center gap-2">
                        <Terminal className="w-4 h-4 text-[#38BDF8]" /> QUICK FIX ACTION LOG
                     </h2>
                     <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                         <div className="flex bg-[#1E293B] rounded-lg p-1">
                             <button
                               onClick={() => setQuickFixView('list')}
                               className={`px-3 py-1 text-[10px] font-bold tracking-widest rounded ${quickFixView === 'list' ? 'bg-[#334155] text-white' : 'text-[#94A3B8] hover:text-white'}`}
                             >
                                 LIST
                             </button>
                             <button
                               onClick={() => setQuickFixView('timeline')}
                               className={`px-3 py-1 text-[10px] font-bold tracking-widest rounded ${quickFixView === 'timeline' ? 'bg-[#334155] text-white' : 'text-[#94A3B8] hover:text-white'}`}
                             >
                                 TIMELINE
                             </button>
                             <button
                               onClick={() => setQuickFixView('chart')}
                               className={`px-3 py-1 text-[10px] font-bold tracking-widest rounded ${quickFixView === 'chart' ? 'bg-[#334155] text-white' : 'text-[#94A3B8] hover:text-white'}`}
                             >
                                 CHART
                             </button>
                         </div>
                         <span className="text-[10px] sm:text-xs font-mono text-[#94A3B8] flex items-center">
                            GCS Export: <span className="text-[#38BDF8] ml-2">Shighy_EventLogs/QuickFixLog</span> 
                         </span>
                         <button className="text-[10px] font-bold tracking-widest bg-[#1E293B] hover:bg-[#334155] px-4 py-2 rounded-lg text-[#E2E8F0] transition-colors border border-[#334155]">
                            ZIP CSV DIRECT
                         </button>
                     </div>
                </div>
                <div className="p-6 flex-1 overflow-y-auto space-y-2 font-mono text-xs">
                     {quickFixView === 'list' && (
                     <>
                     {/* Log Header */}
                     <div className="grid grid-cols-12 gap-4 text-[#94A3B8] items-center p-2 border-b border-[#1E293B] font-bold uppercase tracking-widest text-[10px]">
                        <div className="col-span-3 md:col-span-2">Time</div>
                        <div className="col-span-4 md:col-span-3">Error</div>
                        <div className="col-span-3 md:col-span-4">Fix Action</div>
                        <div className="col-span-1 md:col-span-1 hidden md:block">Status</div>
                        <div className="col-span-2 md:col-span-2 text-right">Trigger</div>
                     </div>
                     {/* Log rows */}
                     <div className="grid grid-cols-12 gap-4 text-[#94A3B8] items-center p-2 hover:bg-[#1E293B]/30 rounded transition-colors">
                        <div className="col-span-3 md:col-span-2 text-[#38BDF8]">[05-12 14:02:11]</div>
                        <div className="col-span-4 md:col-span-3 text-[#F43F5E] truncate">GCP API Timeout</div>
                        <div className="col-span-3 md:col-span-4 text-[#10B981] truncate">Switched to fallback mirror</div>
                        <div className="col-span-1 md:col-span-1 hidden md:block text-[#10B981]">✅ OK</div>
                        <div className="col-span-2 md:col-span-2 text-[#A855F7] text-right truncate">auto-action</div>
                     </div>
                     <div className="grid grid-cols-12 gap-4 text-[#94A3B8] items-center p-2 hover:bg-[#1E293B]/30 rounded transition-colors">
                        <div className="col-span-3 md:col-span-2 text-[#38BDF8]">[05-12 14:15:43]</div>
                        <div className="col-span-4 md:col-span-3 text-[#F43F5E] truncate">RTDB Sync Delay</div>
                        <div className="col-span-3 md:col-span-4 text-[#10B981] truncate">Force-reconnect config</div>
                        <div className="col-span-1 md:col-span-1 hidden md:block text-[#10B981]">✅ OK</div>
                        <div className="col-span-2 md:col-span-2 text-[#38BDF8] text-right truncate">user-action</div>
                     </div>
                     <div className="grid grid-cols-12 gap-4 text-[#94A3B8] items-center p-2 hover:bg-[#1E293B]/30 rounded transition-colors bg-[#10B981]/5">
                        <div className="col-span-3 md:col-span-2 text-[#38BDF8]">[05-12 16:45:01]</div>
                        <div className="col-span-4 md:col-span-3 text-[#EAB308] truncate">High CPU Usage</div>
                        <div className="col-span-3 md:col-span-4 text-[#10B981] truncate">Auto Load-Balance & Restart</div>
                        <div className="col-span-1 md:col-span-1 hidden md:block text-[#10B981]">✅ OK</div>
                        <div className="col-span-2 md:col-span-2 text-[#10B981] text-right truncate">auto-fix</div>
                     </div>
                     <div className="grid grid-cols-12 gap-4 text-[#94A3B8] items-center p-2 hover:bg-[#1E293B]/30 rounded transition-colors bg-[#10B981]/5">
                        <div className="col-span-3 md:col-span-2 text-[#38BDF8]">[05-12 18:12:59]</div>
                        <div className="col-span-4 md:col-span-3 text-[#F43F5E] truncate">GitHub CI Conflict</div>
                        <div className="col-span-3 md:col-span-4 text-[#10B981] truncate">Smart-Merge & Rollback</div>
                        <div className="col-span-1 md:col-span-1 hidden md:block text-[#10B981]">✅ OK</div>
                        <div className="col-span-2 md:col-span-2 text-[#10B981] text-right truncate">auto-fix</div>
                     </div>
                     </>
                     )}

                     {quickFixView === 'timeline' && (
                         <div className="relative border-l border-[#1E293B] ml-4 pl-6 space-y-8 pb-8 pt-4">
                             <div className="relative">
                                 <div className="absolute -left-[31px] top-1 w-3 h-3 rounded-full bg-[#10B981] border-2 border-[#0F172A]"></div>
                                 <div className="text-[#38BDF8] text-[10px] mb-1">05-12 14:02:11</div>
                                 <div className="text-sm font-bold text-[#F8FAFC]">GCP API Timeout</div>
                                 <div className="text-[#94A3B8] mt-1 space-y-1">
                                     <div><span className="text-[#F43F5E]">Error:</span> Connection dropped during GitHub MCP sync.</div>
                                     <div><span className="text-[#10B981]">Fix Action:</span> Switched to fallback mirror <span className="text-[10px] px-2 py-0.5 rounded bg-[#A855F7]/10 text-[#A855F7] ml-2">auto-action</span></div>
                                 </div>
                                 <div className="mt-2 text-[10px] uppercase font-bold text-[#10B981]">✅ Status: Fixed</div>
                             </div>

                             <div className="relative">
                                 <div className="absolute -left-[31px] top-1 w-3 h-3 rounded-full bg-[#10B981] border-2 border-[#0F172A]"></div>
                                 <div className="text-[#38BDF8] text-[10px] mb-1">05-12 14:15:43</div>
                                 <div className="text-sm font-bold text-[#F8FAFC]">RTDB Sync Delay</div>
                                 <div className="text-[#94A3B8] mt-1 space-y-1">
                                     <div><span className="text-[#F43F5E]">Error:</span> Latency &gt; 500ms detected on Firebase Realtime stream.</div>
                                     <div><span className="text-[#10B981]">Fix Action:</span> Force-reconnect config <span className="text-[10px] px-2 py-0.5 rounded bg-[#38BDF8]/10 text-[#38BDF8] ml-2">user-action</span></div>
                                 </div>
                                 <div className="mt-2 text-[10px] uppercase font-bold text-[#10B981]">✅ Status: Fixed</div>
                             </div>

                             <div className="relative">
                                 <div className="absolute -left-[31px] top-1 w-3 h-3 rounded-full bg-[#10B981] border-2 border-[#0F172A]"></div>
                                 <div className="text-[#38BDF8] text-[10px] mb-1">05-12 16:45:01</div>
                                 <div className="text-sm font-bold text-[#F8FAFC] flex items-center gap-2">High CPU Usage <span className="text-[10px] px-2 py-0.5 rounded bg-[#10B981]/10 text-[#10B981]">AUTO-RESOLVED</span></div>
                                 <div className="text-[#94A3B8] mt-1 space-y-1">
                                     <div><span className="text-[#EAB308]">Warning:</span> Satellite failover module consuming &gt; 80% CPU.</div>
                                     <div><span className="text-[#10B981]">Auto-Fix:</span> Rebalanced load to multi-server cluster & restarted NetGuard <span className="text-[10px] px-2 py-0.5 rounded bg-[#10B981]/10 text-[#10B981] ml-2">auto-balance</span></div>
                                 </div>
                                 <div className="mt-2 text-[10px] uppercase font-bold text-[#10B981] flex items-center gap-2">✅ Status: Fixed via Auto-Fix policy</div>
                             </div>

                             <div className="relative">
                                 <div className="absolute -left-[31px] top-1 w-3 h-3 rounded-full bg-[#10B981] border-2 border-[#0F172A]"></div>
                                 <div className="text-[#38BDF8] text-[10px] mb-1">05-12 18:12:59</div>
                                 <div className="text-sm font-bold text-[#F8FAFC] flex items-center gap-2">GitHub CI Conflict <span className="text-[10px] px-2 py-0.5 rounded bg-[#10B981]/10 text-[#10B981]">AUTO-RESOLVED</span></div>
                                 <div className="text-[#94A3B8] mt-1 space-y-1">
                                     <div><span className="text-[#F43F5E]">Error:</span> CI/CD sync failed due to merge conflict.</div>
                                     <div><span className="text-[#10B981]">Auto-Fix:</span> Smart-merged conflicts & rolled back to stable commit <span className="text-[10px] px-2 py-0.5 rounded bg-[#10B981]/10 text-[#10B981] ml-2">auto-resolve</span></div>
                                 </div>
                                 <div className="mt-2 text-[10px] uppercase font-bold text-[#10B981] flex items-center gap-2">✅ Status: Fixed via Auto-Fix policy</div>
                             </div>
                         </div>
                     )}

                     {quickFixView === 'chart' && (
                         <div className="h-[250px] w-full mt-4">
                             <ResponsiveContainer width="100%" height="100%">
                                 <ComposedChart data={quickFixChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                     <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                                     <XAxis dataKey="time" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                                     <YAxis stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                                     <Tooltip content={<QuickFixCustomTooltip />} cursor={{ fill: '#1E293B', opacity: 0.4 }} />
                                     <Legend wrapperStyle={{ fontSize: '12px', color: '#94A3B8' }} />
                                     <Bar dataKey="resolved" name="Resolved" fill="#10B981" radius={[4, 4, 0, 0]} barSize={20} />
                                     <Bar dataKey="pending" name="Pending" fill="#EAB308" radius={[4, 4, 0, 0]} barSize={20} />
                                     <Bar dataKey="failed" name="Failed" fill="#F43F5E" radius={[4, 4, 0, 0]} barSize={20} />
                                     <Line type="monotone" dataKey="resolved" stroke="#10B981" strokeWidth={3} dot={{ r: 4, fill: '#0F172A', strokeWidth: 2 }} activeDot={{ r: 6 }} />
                                 </ComposedChart>
                             </ResponsiveContainer>
                         </div>
                     )}
                </div>
            </div>
            )}
            {activeTab === 'ai-core' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-200px)]">
                    {/* Knowledge Base Live Feed */}
                    <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl shadow-lg flex flex-col h-full overflow-hidden">
                        <div className="p-6 border-b border-[#1E293B] flex justify-between items-center bg-[#1E293B]/10">
                            <h2 className="text-sm font-bold tracking-widest text-[#10B981] flex items-center gap-2">
                                <span className="animate-pulse">🌌</span> GLOBAL ADAPTIVE AI
                            </h2>
                            <span className="text-[10px] sm:text-xs font-mono text-[#94A3B8]">
                                Status: <span className="text-[#10B981]">Linked & Active</span>
                            </span>
                        </div>
                        <div className="p-6 flex-1 overflow-y-auto font-mono text-[11px] space-y-4">
                            <div className="border-l border-[#1E293B] ml-2 pl-4 relative">
                                <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-[#10B981] shadow-[0_0_8px_#10B981] animate-pulse"></div>
                                <div className="text-[#10B981] mb-1">🛡️ [SHIELD] Anti-Yellow Protocol</div>
                                <div className="text-[#94A3B8]">Any attempt to return the yellow line is recorded as an attack and automatically countered.</div>
                            </div>
                            <div className="border-l border-[#1E293B] ml-2 pl-4 relative">
                                <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-[#A855F7]"></div>
                                <div className="text-[#A855F7] mb-1">👻 [CLOAK] External Code Blocked</div>
                                <div className="text-[#94A3B8]">Obfuscation active. External codes prevented from reactivating it.</div>
                            </div>
                            <div className="border-l border-[#1E293B] ml-2 pl-4 relative">
                                <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-[#10B981]"></div>
                                <div className="text-[#10B981] mb-1">🟩 [RESOLVE] Auto-Replacement</div>
                                <div className="text-[#94A3B8]">Unwanted elements automatically swapped to official green box.</div>
                            </div>
                            <div className="border-l border-[#1E293B] ml-2 pl-4 relative">
                                <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-[#38BDF8]"></div>
                                <div className="text-[#38BDF8] mb-1">👁️ [MONITOR] Smart Overseer</div>
                                <div className="text-[#94A3B8]">DOM monitored for #yellowBox injections. Removed instantly upon detection.</div>
                            </div>
                            <div className="border-l border-[#1E293B] ml-2 pl-4 relative">
                                <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-[#38BDF8]"></div>
                                <div className="text-[#38BDF8] mb-1">[SYS] System Evolving globally...</div>
                                <div className="text-[#94A3B8]">Adaptive protection enabled.</div>
                            </div>
                            <div className="border-l border-[#1E293B] ml-2 pl-4 relative">
                                <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-[#10B981]"></div>
                                <div className="text-[#10B981] mb-1">[UPDATE] globalFeed</div>
                                <div className="text-[#94A3B8]">Latest VPN + Security Data synced.</div>
                            </div>
                            <div className="border-l border-[#1E293B] ml-2 pl-4 relative">
                                <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-[#EAB308]"></div>
                                <div className="text-[#EAB308] mb-1">[STORE] newThreat</div>
                                <div className="text-[#94A3B8]">Zero-Day Exploit intercepted and isolated.</div>
                            </div>
                            <div className="border-l border-[#1E293B] ml-2 pl-4 relative">
                                <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-[#F43F5E] shadow-[0_0_8px_#F43F5E] animate-pulse"></div>
                                <div className="text-[#F43F5E] mb-1">🔮 [PREDICT] sys_threat</div>
                                <div className="text-[#94A3B8]">Possible DDoS within 5 mins.</div>
                            </div>
                            <div className="border-l border-[#1E293B] ml-2 pl-4 relative">
                                <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-[#F43F5E] shadow-[0_0_8px_#F43F5E] animate-pulse"></div>
                                <div className="text-[#F43F5E] mb-1">🔮 [PREDICT] sys_threat</div>
                                <div className="text-[#94A3B8]">Suspicious SQL Injection attempt.</div>
                            </div>
                            <div className="border-l border-[#1E293B] ml-2 pl-4 relative">
                                <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-[#A855F7]"></div>
                                <div className="text-[#A855F7] mb-1">[UPDATE] protocol</div>
                                <div className="text-[#94A3B8]">WireGuard + TLS 1.3 optimization complete.</div>
                            </div>
                            <div className="border-l border-[#1E293B] ml-2 pl-4 relative">
                                <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-[#10B981]"></div>
                                <div className="text-[#10B981] mb-1">[UPDATE] encryption</div>
                                <div className="text-[#94A3B8]">ChaCha20 + AES-256 Hybrid deployed.</div>
                            </div>
                            <div className="border-l border-[#1E293B] ml-2 pl-4 relative">
                                <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-[#38BDF8] shadow-[0_0_8px_#38BDF8] animate-pulse"></div>
                                <div className="text-[#38BDF8] mb-1">[UPDATE] traffic</div>
                                <div className="text-[#94A3B8]">Balanced via Satellite + MCP.</div>
                            </div>
                            <div className="mt-6 flex justify-center">
                                <div className="px-4 py-2 rounded bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/30 font-bold uppercase tracking-widest text-[10px] animate-pulse">
                                    Knowledge Base: Synchronized & Predicting
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Source Artifact */}
                    <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl shadow-lg flex flex-col h-full overflow-hidden">
                        <div className="p-6 border-b border-[#1E293B] flex justify-between items-center bg-[#1E293B]/10">
                            <h2 className="text-sm font-bold tracking-widest text-[#E2E8F0] flex items-center gap-2">
                                ⚡ SHABAH NET
                                <div className="ml-4 flex gap-2">
                                    <button 
                                        onClick={() => setActiveArtifact('java')}
                                        className={`px-3 py-1 text-[10px] rounded transition-colors ${activeArtifact === 'java' ? 'bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/50' : 'bg-[#1E293B] text-[#94A3B8] hover:text-white border border-transparent'}`}
                                    >
                                        ShabahNetAI.java
                                    </button>
                                    <button 
                                        onClick={() => setActiveArtifact('kotlin')}
                                        className={`px-3 py-1 text-[10px] rounded transition-colors ${activeArtifact === 'kotlin' ? 'bg-[#A855F7]/20 text-[#A855F7] border border-[#A855F7]/50' : 'bg-[#1E293B] text-[#94A3B8] hover:text-white border border-transparent'}`}
                                    >
                                        DashboardActivity.kt
                                    </button>
                                    <button 
                                        onClick={() => setActiveArtifact('js')}
                                        className={`px-3 py-1 text-[10px] rounded transition-colors ${activeArtifact === 'js' ? 'bg-[#38BDF8]/20 text-[#38BDF8] border border-[#38BDF8]/50' : 'bg-[#1E293B] text-[#94A3B8] hover:text-white border border-transparent'}`}
                                    >
                                        AntiYellowShield.js
                                    </button>
                                    <button 
                                        onClick={() => setActiveArtifact('css')}
                                        className={`px-3 py-1 text-[10px] rounded transition-colors ${activeArtifact === 'css' ? 'bg-[#F43F5E]/20 text-[#F43F5E] border border-[#F43F5E]/50' : 'bg-[#1E293B] text-[#94A3B8] hover:text-white border border-transparent'}`}
                                    >
                                        animations.css
                                    </button>
                                    <button 
                                        onClick={() => setActiveArtifact('xml')}
                                        className={`px-3 py-1 text-[10px] rounded transition-colors ${activeArtifact === 'xml' ? 'bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/50' : 'bg-[#1E293B] text-[#94A3B8] hover:text-white border border-transparent'}`}
                                    >
                                        layout.xml
                                    </button>
                                </div>
                            </h2>
                            <button className="text-[10px] bg-[#1E293B] text-[#94A3B8] px-3 py-1 rounded hover:text-white transition-colors">
                                COPY
                            </button>
                        </div>
                        <div className="p-6 flex-1 overflow-y-auto bg-[#04060A] text-[#94A3B8] font-mono text-[10px] sm:text-[11px] leading-relaxed whitespace-pre font-medium">
{activeArtifact === 'xml' ? `<!-- 🧩 مثال مبسط داخل لوحة التحكم -->
<LinearLayout
    android:id="@+id/dashboardContainer"
    android:layoutwidth="matchparent"
    android:layoutheight="matchparent"
    android:orientation="horizontal">

    <!-- غرفة الدردشة -->
    <LinearLayout
        android:id="@+id/aiChatRoom"
        android:layout_width="0dp"
        android:layout_weight="2"
        android:layoutheight="matchparent"
        android:orientation="vertical"
        android:background="#FFFFFF">

        <TextView
            android:id="@+id/chatHeader"
            android:text="⚡ غرفة الدردشة مع AI"
            android:textSize="18sp"
            android:textColor="#444"
            android:gravity="center"
            android:layoutwidth="matchparent"
            android:layout_height="48dp"
            android:background="#EEE"/>
        
        <!-- باقي عناصر الغرفة (ScrollView + صندوق كتابة) -->
        <ScrollView
            android:id="@+id/chatScroll"
            android:layoutwidth="matchparent"
            android:layout_height="0dp"
            android:layout_weight="1">
            <LinearLayout
                android:id="@+id/chatMessages"
                android:orientation="vertical"
                android:layoutwidth="matchparent"
                android:layoutheight="wrapcontent"/>
        </ScrollView>

        <LinearLayout
            android:orientation="horizontal"
            android:layoutwidth="matchparent"
            android:layoutheight="wrapcontent">
            <EditText
                android:id="@+id/commandInput"
                android:hint="اكتب رسالتك أو الأمر..."
                android:layout_width="0dp"
                android:layout_weight="1"
                android:layoutheight="wrapcontent"/>
            <Button
                android:id="@+id/sendButton"
                android:text="إرسال"
                android:layoutwidth="wrapcontent"
                android:layoutheight="wrapcontent"/>
        </LinearLayout>
    </LinearLayout>

    <!-- السجل الجانبي -->
    <LinearLayout
        android:id="@+id/activityLog"
        android:layout_width="0dp"
        android:layout_weight="1"
        android:layoutheight="matchparent"
        android:orientation="vertical"
        android:background="#F5F5F5">
        <TextView
            android:text="سجل النشاطات"
            android:textSize="16sp"
            android:textColor="#333"
            android:gravity="center"
            android:layoutwidth="matchparent"
            android:layout_height="48dp"
            android:background="#E0E0E0"/>
        <ScrollView
            android:layoutwidth="matchparent"
            android:layoutheight="matchparent">
            <LinearLayout
                android:id="@+id/logItems"
                android:orientation="vertical"
                android:layoutwidth="matchparent"
                android:layoutheight="wrapcontent"/>
        </ScrollView>
    </LinearLayout>
</LinearLayout>` : activeArtifact === 'css' ? `.error-line {
  position: absolute;
  bottom: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(90deg, #ff4d4d, #ff8080);
  border-radius: 4px;
  box-shadow: 0 0 8px rgba(255, 80, 80, 0.6);
  animation: fadeOut 4s forwards;
}

@keyframes fadeOut {
  0% { opacity: 1; }
  100% { opacity: 0; }
}` : activeArtifact === 'js' ? `// ⚡ منع الخط الأصفر من العودة مع إنذار مبكر ⚡

// مراقبة أي محاولة لإضافة العنصر الأصفر
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    mutation.addedNodes.forEach((node) => {
      // @ts-ignore
      if (node.id === "yellowBox") {
        // @ts-ignore
        node.remove(); // حذف مباشر
        console.warn("🚨 محاولة لإرجاع الخط الأصفر تم منعها!");
        showGreenBox("النظام مستقر – الخط الأصفر ممنوع نهائيًا");
      }
    });
  });
});

// تفعيل المراقبة على كامل الصفحة
observer.observe(document.body, { childList: true, subtree: true });

// قفل برمجي يمنع إنشاء العنصر من الأساس
try {
  // @ts-ignore
  delete window.yellowBox;
} catch (e) {}

Object.defineProperty(window, "yellowBox", {
  get: () => null,
  set: () => {
    throw new Error("🛡️ ممنوع إنشاء الخط الأصفر!");
  },
  configurable: false
});

// بديل رسمي: المربع الأخضر
function showGreenBox(status) {
  const greenBox = document.getElementById("greenBox");
  if(greenBox) {
    greenBox.innerHTML = \`⚡ الحالة: \${status}\`;
    greenBox.style.opacity = '1';
  }
}
` : activeArtifact === 'kotlin' ? `// 🧩 كود Kotlin المحدث للوحة تحكم غرف المحادثة
class DashboardActivity : AppCompatActivity() {

    private lateinit var chatMessages: LinearLayout
    private lateinit var logItems: LinearLayout
    private lateinit var commandInput: EditText
    private lateinit var sendButton: Button

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.dashboard_container) // لازم يطابق اسم ملف XML

        chatMessages = findViewById(R.id.chatMessages)
        logItems = findViewById(R.id.logItems)
        commandInput = findViewById(R.id.commandInput)
        sendButton = findViewById(R.id.sendButton)

        sendButton.setOnClickListener {
            val command = commandInput.text.toString()
            if (command.isNotEmpty()) {
                addMessage(command, true)
                simulateAIResponse(command)
                commandInput.text.clear()
            }
        }
    }

    private fun addMessage(text: String, isUser: Boolean) {
        val messageView = TextView(this)
        messageView.text = text
        messageView.setPadding(16, 8, 16, 8)
        messageView.setTextColor(if (isUser) Color.parseColor("#FFD700") else Color.parseColor("#6A5ACD"))
        messageView.background = ContextCompat.getDrawable(this,
            if (isUser) R.drawable.bubbleuser else R.drawable.bubbleai)
        chatMessages.addView(messageView)
    }

    private fun simulateAIResponse(command: String) {
        Handler(Looper.getMainLooper()).postDelayed({
            val response = "تم تنفيذ الأمر: $command بنجاح ⚡"
            addMessage(response, false)
            addLogItem("تنفيذ الأمر: $command", "نجاح")
        }, 1000)
    }

    private fun addLogItem(action: String, status: String) {
        val logView = TextView(this)
        logView.text = "$action - الحالة: $status"
        logView.setPadding(8, 4, 8, 4)
        logView.setTextColor(Color.parseColor("#333333"))
        logItems.addView(logView)
    }
}` : `// ⚡ شبح النت – الكود الشامل مع AI التنبؤ ⚡
// الذكاء الاصطناعي والإدارة الذكية (درع البرق المرتد)

import android.net.VpnService;
import android.os.ParcelFileDescriptor;
import android.util.Log;
import java.util.*;

public class ShabahNetAI extends VpnService {
    private ParcelFileDescriptor vpnInterface;
    private GlobalAdaptiveAI ai;

    @Override
    public void onCreate() {
        Builder builder = new Builder();

        // 🏠 إعدادات الخوادم المحلية والعالمية
        builder.addAddress("10.0.0.2", 24);
        builder.addRoute("0.0.0.0", 0);

        // 🔐 إعدادات البروتوكولات والشهادات
        builder.addDnsServer("10.0.0.1");
        builder.setBlocking(true);
        System.setProperty("javax.net.ssl.keyStore", "keystore.jks");
        System.setProperty("javax.net.ssl.keyStorePassword", "securePass123");
        System.setProperty("javax.net.ssl.trustStore", "truststore.jks");

        // 🛰️ تفعيل الستالايت لتوزيع الأحمال
        System.setProperty("satellite.load.balance", "active");

        vpnInterface = builder.establish();
        activateInstantConnection();

        // 🌌 تفعيل الذكاء الاصطناعي العالمي مع التنبؤ
        ai = new GlobalAdaptiveAI(new KnowledgeBase());
        ai.evolveSystem();
        ai.predictThreats();
    }

    private void activateInstantConnection() {
        new Thread(() -> {
            try {
                System.setProperty("network.obfuscation", "enabled");
                System.setProperty("satellite.load.balance", "active");
                System.out.println("⚡ الاتصال مفعل – درع البرق المرتد جاهز!");
            } catch (Exception e) {
                e.printStackTrace();
            }
        }).start();
    }

    @Override
    public void onDestroy() {
        try {
            if (vpnInterface != null) vpnInterface.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}

// ⚡ طبقة الذكاء الاصطناعي العالمي مع التنبؤ ⚡
class GlobalAdaptiveAI {
    private KnowledgeBase kb;

    public GlobalAdaptiveAI(KnowledgeBase kb) {
        this.kb = kb;
    }

    public void evolveSystem() {
        fetchGlobalUpdates();
        analyzeNewThreats();
        refreshProtocols();
        refreshCertificates();
        optimizeEncryption();
        balanceTraffic();
        System.out.println("🌌 النظام يتطور عالميًا – الحماية التكيفية مفعّلة!");
    }

    public void predictThreats() {
        // التنبؤ بالهجمات قبل حدوثها
        kb.store("predictedThreat", "Possible DDoS within 5 mins");
        kb.store("predictedThreat", "Suspicious SQL Injection attempt");
        System.out.println("🔮 التنبؤ الاستباقي مفعل – الدفاع جاهز قبل الهجوم!");
    }

    private void fetchGlobalUpdates() {
        kb.update("globalFeed", "Latest VPN + Security Data");
    }

    private void analyzeNewThreats() {
        kb.store("newThreat", "Zero-Day Exploit");
    }

    private void refreshProtocols() {
        kb.update("protocol", "WireGuard + TLS 1.3");
    }

    private void refreshCertificates() {
        kb.update("certificate", "Updated PKI");
    }

    private void optimizeEncryption() {
        kb.update("encryption", "ChaCha20 + AES-256 Hybrid");
    }

    private void balanceTraffic() {
        kb.update("traffic", "Balanced via Satellite + MCP");
    }
}

// ⚡ شبح النت – AI التكيفي ⚡
class AdaptiveAIProtection {
    private KnowledgeBase kb;

    public AdaptiveAIProtection(KnowledgeBase kb) {
        this.kb = kb;
    }

    public void defendSystem() {
        kb.store("attackPattern", "DDoS + SQL Injection");
        kb.update("protocol", "WireGuard");
        kb.update("certificate", "TLS 1.3");
        kb.update("encryption", "AES-256");
        kb.update("traffic", "Balanced");
        System.out.println("🛡️ الحماية التكيفية مفعلّة – النظام يتطور باستمرار!");
    }
}

// ⚡ شبح النت – الإدارة الذكية عبر المستودعات ⚡
class ShabahAIManager {
    private List<String> localServers = List.of("192.168.1.1", "192.168.1.2");
    private List<String> globalServers = List.of("203.0.113.5", "198.51.100.7");
    private Map<String, Integer> protocols = Map.of("WireGuard", 1, "IKEv2", 2, "OpenVPN", 3);
    private List<String> certificates = List.of("X.509", "SSL/TLS", "PKI");
    private List<String> satellites = List.of("SAT-Alpha", "SAT-Beta");
    private List<String> encryption = List.of("AES-256", "ChaCha20", "TLS");
    private List<String> trafficRules = List.of("No-Logs", "Anti-Leak", "Obfuscation");

    public void activateConnection() {
        System.out.println("🏠 اختيار الخادم المحلي أو العالمي حسب الحمل");
        System.out.println("🔐 البروتوكول المختار: WireGuard (الأسرع)");
        System.out.println("🗝️ تطبيق شهادات X.509 + TLS");
        System.out.println("🛰️ الستالايت موزع الحمل مفعل");
        System.out.println("🔒 التشفير AES-256 + ChaCha20 مفعل");
        System.out.println("🌍 مراقبة حركة المرور + سياسة No-Logs");
        System.out.println("⚡ الاتصال مفعل – درع البرق المرتد جاهز!");
    }
}

// ⚡ قاعدة المعرفة – مستودعات AI ⚡
class KnowledgeBase {
    private Map<String, String> repo = new HashMap<>();

    public void update(String key, String value) {
        repo.put(key, value);
        System.out.println("🔄 تحديث المستودع: " + key + " → " + value);
    }

    public void store(String key, String value) {
        repo.put(key, value);
        System.out.println("📦 تخزين جديد: " + key + " → " + value);
    }
}

// ⚡ التشغيل والإصلاح التلقائي ⚡
class SystemAutoHeal {
    public void startSystem() {
        try {
            // تشغيل النظام الأساسي
            runCoreModules();
        } catch (Exception e) {
            Log.e("SystemAuto", "تم اكتشاف خطأ: " + e.getMessage());
            // إصلاح تلقائي أو تجاوز الخطأ
            autoHealModule();
        } finally {
            // ضمان استمرار التشغيل
            keepSystemRunning();
        }
    }

    private void runCoreModules() throws Exception {
        System.out.println("🚀 تشغيل النظام الأساسي...");
    }

    private void autoHealModule() {
        System.out.println("🛠️ معالجة الخطأ وإصلاحه تلقائيًا...");
    }

    private void keepSystemRunning() {
        System.out.println("🔄 النظام يستمر في العمل بلا توقف!");
    }
}

// ⚡ شبح النت – اقتصاد ذاتي ⚡
class SelfSustainedApp {
    private double revenue;
    private double expenses;

    public void generateRevenue() {
        // أرباح من الألعاب والإعلانات
        revenue += Math.random() * 100; 
        System.out.println("💰 أرباح جديدة: " + revenue);
    }

    public void payExpenses() {
        // تسديد المستحقات تلقائيًا
        expenses = 50; 
        revenue -= expenses;
        System.out.println("🧾 تم تسديد المستحقات: " + expenses);
    }

    public void transferBalance() {
        // تحويل الباقي للمستخدم
        double balance = revenue;
        System.out.println("✨ الرصيد المتبقي لك: " + balance);
    }

    public void runCycle() {
        generateRevenue();
        payExpenses();
        transferBalance();
    }
}`}
                        </div>
                   </div>
                </div>
            )}

            {activeTab === 'reports' && (
            <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl shadow-lg flex flex-col h-[calc(100vh-200px)]">
                <div className="p-6 border-b border-[#1E293B] flex justify-between items-center bg-[#1E293B]/10">
                     <h2 className="text-sm font-bold tracking-widest text-[#E2E8F0] flex items-center gap-2">
                        <span className="text-[18px] drop-shadow-[0_0_8px_rgba(255,215,0,0.8)]">⚡</span> WEEKLY HARVEST
                     </h2>
                     <span className="text-[10px] sm:text-xs font-mono text-[#94A3B8]">
                        GCS Archive: <span className="text-[#38BDF8]">Shighy_EventLogs/WeeklyHarvest</span> 
                     </span>
                </div>
                <div className="p-6 flex-1 overflow-y-auto space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-[#1E293B]/30 p-6 rounded-xl border border-[#334155]/50 flex flex-col justify-center items-center">
                            <span className="text-3xl font-bold text-[#10B981] mb-2">31</span>
                            <span className="text-xs font-mono text-[#94A3B8] uppercase tracking-wider">Resolved Errors</span>
                        </div>
                        <div className="bg-[#1E293B]/30 p-6 rounded-xl border border-[#334155]/50 flex flex-col justify-center items-center">
                            <span className="text-3xl font-bold text-[#EAB308] mb-2">0</span>
                            <span className="text-xs font-mono text-[#94A3B8] uppercase tracking-wider">Pending Reviews</span>
                        </div>
                        <div className="bg-[#1E293B]/30 p-6 rounded-xl border border-[#334155]/50 flex flex-col justify-center items-center">
                            <span className="text-3xl font-bold text-[#38BDF8] mb-2">100%</span>
                            <span className="text-xs font-mono text-[#94A3B8] uppercase tracking-wider">Auto-Recoveries</span>
                        </div>
                    </div>
                    
                    <div>
                        <h3 className="text-xs font-bold tracking-widest text-[#E2E8F0] mb-4 border-b border-[#1E293B] pb-2">TOP INCIDENTS (THIS WEEK)</h3>
                        <div className="space-y-3 font-mono text-xs">
                            <div className="flex justify-between items-center bg-[#1E293B]/20 p-3 rounded-lg border border-[#334155]/30">
                                <span className="text-[#F43F5E] font-bold">☁️ Cloud-API [ERR-01]</span>
                                <span className="text-[#94A3B8]">Occurred <span className="text-[#F8FAFC]">12</span> times</span>
                            </div>
                            <div className="flex justify-between items-center bg-[#1E293B]/20 p-3 rounded-lg border border-[#334155]/30">
                                <span className="text-[#EAB308] font-bold">🛰️ Connection [WARN-01]</span>
                                <span className="text-[#94A3B8]">Occurred <span className="text-[#F8FAFC]">8</span> times</span>
                            </div>
                            <div className="flex justify-between items-center bg-[#1E293B]/20 p-3 rounded-lg border border-[#334155]/30">
                                <span className="text-[#38BDF8] font-bold">🗄️ Database [ERR-02]</span>
                                <span className="text-[#94A3B8]">Occurred <span className="text-[#F8FAFC]">5</span> times</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            )}

            {/* Ambient Background Glows */}
            <div className="fixed top-20 left-10 w-[500px] h-[500px] bg-[#38BDF8] opacity-[0.02] blur-[150px] pointer-events-none rounded-full"></div>
            <div className="fixed bottom-10 right-10 w-[600px] h-[600px] bg-[#A855F7] opacity-[0.03] blur-[200px] pointer-events-none rounded-full"></div>

        </div>
    );
}
