import React from 'react';
import { ChevronLeft, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, ResponsiveContainer, XAxis, Tooltip } from 'recharts';

export default function CloudDashboard() {
    const navigate = useNavigate();
    const data = [
        { day: 'Mon', latency: 45 },
        { day: 'Tue', latency: 50 },
        { day: 'Wed', latency: 40 },
        { day: 'Thu', latency: 70, fill: '#00FF9D' },
        { day: 'Fri', latency: 55 },
        { day: 'Sat', latency: 48 },
        { day: 'Sun', latency: 60 }
    ];

    return (
        <div className="relative w-full min-h-screen bg-[#07070F] text-white font-sans overflow-y-auto p-6 pb-20">
            <div className="w-full max-w-sm mx-auto flex flex-col h-full py-4">
                
                {/* Header */}
                <div className="flex items-center gap-4 border-b border-white/5 pb-4 mb-6 bg-[#11131A] px-4 py-3 rounded-lg">
                    <button onClick={() => navigate('/')} className="text-[#00FF9D] hover:scale-110 transition-transform">
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <h1 className="text-[16px] font-medium tracking-[2px] uppercase">Control Dashboard</h1>
                </div>

                {/* Active Node */}
                <div className="bg-[#11131A] border border-white/5 rounded-2xl p-5 flex justify-between items-center mb-8 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-[#00FF9D]" />
                    <div className="z-10 relative">
                        <p className="text-sm text-gray-500 mb-1">ACTIVE NODE</p>
                        <p className="text-lg font-bold text-white tracking-widest">Satellite - Saudi</p>
                    </div>
                </div>

                {/* Metrics Circles */}
                <div className="flex justify-between items-center mb-8 gap-3">
                    <div className="flex flex-col items-center">
                        <div className="relative w-[80px] h-[80px] rounded-full border-[4px] border-[#38BDF8]/20 flex items-center justify-center mb-2">
                           <svg className="absolute inset-0 w-full h-full -rotate-90">
                              <circle cx="50%" cy="50%" r="38" fill="transparent" stroke="#38BDF8" strokeWidth="4" strokeDasharray="238" strokeDashoffset="50" strokeLinecap="round" />
                           </svg>
                           <span className="text-lg font-bold">59.0</span>
                        </div>
                        <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Ping ms</span>
                    </div>

                    <div className="flex flex-col items-center">
                        <div className="relative w-[80px] h-[80px] rounded-full border-[4px] border-[#4285F4]/20 flex items-center justify-center mb-2">
                           <svg className="absolute inset-0 w-full h-full -rotate-90">
                              <circle cx="50%" cy="50%" r="38" fill="transparent" stroke="#4285F4" strokeWidth="4" strokeDasharray="238" strokeDashoffset="120" strokeLinecap="round" />
                           </svg>
                           <span className="text-lg font-bold">38.0</span>
                        </div>
                        <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">DL Mbps</span>
                    </div>

                    <div className="flex flex-col items-center">
                        <div className="relative w-[80px] h-[80px] rounded-full border-[4px] border-[#A020F0]/20 flex items-center justify-center mb-2">
                           <svg className="absolute inset-0 w-full h-full -rotate-90">
                              <circle cx="50%" cy="50%" r="38" fill="transparent" stroke="#A020F0" strokeWidth="4" strokeDasharray="238" strokeDashoffset="180" strokeLinecap="round" />
                           </svg>
                           <span className="text-lg font-bold">14.3</span>
                        </div>
                        <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">UL Mbps</span>
                    </div>
                </div>

                {/* Trend Chart */}
                <div className="bg-[#11131A] border border-[#1C1E2B] rounded-2xl p-5 mb-8">
                    <p className="text-[12px] text-gray-400 uppercase tracking-widest mb-6">Network Latency Trend</p>
                    <div className="w-full h-40">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data}>
                                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 10}} />
                                <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{backgroundColor: '#000', border: 'none', color: '#fff'}} />
                                <Bar dataKey="latency" fill="#2d3748" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Bottom Banner */}
                <div className="bg-[#11131A] border border-white/5 rounded-2xl p-5 flex justify-between items-center group cursor-pointer hover:bg-[#151D36] transition-colors">
                    <div className="flex items-center gap-3">
                        <Zap className="w-5 h-5 text-[#00FF9D]" />
                        <span className="text-sm font-medium tracking-wide">Quantum Encryption ACTIVE</span>
                    </div>
                    <span className="text-[#00FF9D] font-mono">&gt;</span>
                </div>
            </div>
        </div>
    );
}
