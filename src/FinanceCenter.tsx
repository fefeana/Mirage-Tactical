import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';

export default function FinanceCenter() {
    const navigate = useNavigate();

    return (
        <div className="relative w-full min-h-screen bg-[#07070F] text-white font-sans overflow-y-auto p-6">
            <div className="w-full max-w-sm mx-auto flex flex-col h-full py-8">
                
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <button onClick={() => navigate('/')} className="text-[#00FF9D] hover:scale-110 transition-transform">
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <h1 className="text-[16px] font-medium tracking-[2px] uppercase">Finance Center</h1>
                </div>

                {/* Top Cards */}
                <div className="flex gap-4 mb-6">
                    <div className="flex-1 bg-[#11131A] border border-[#1C1E2B] rounded-2xl p-5">
                        <p className="text-[11px] text-gray-500 uppercase tracking-widest mb-2">Balance</p>
                        <p className="text-[24px] font-bold text-[#00FF9D]">$289.54</p>
                    </div>
                    <div className="flex-1 bg-[#11131A] border border-[#1C1E2B] rounded-2xl p-5 border-t-2 border-t-[#FFC107]">
                        <p className="text-[11px] text-gray-500 uppercase tracking-widest mb-2">Plan</p>
                        <p className="text-[24px] font-bold text-[#FFC107]">GOLD</p>
                    </div>
                </div>

                {/* Balance History */}
                <div className="bg-[#11131A] border border-[#1C1E2B] rounded-2xl p-5 mb-6">
                    <p className="text-[11px] text-gray-400 uppercase tracking-widest mb-6 border-b border-[#1C1E2B] pb-2">Balance History</p>
                    <div className="w-full h-32 relative overflow-hidden rounded-b-lg flex items-end">
                        <div className="w-full h-full" style={{
                            background: 'linear-gradient(180deg, rgba(0, 255, 157, 0.2) 0%, rgba(0, 0, 0, 0) 100%)',
                            borderTop: '2px solid #00FF9D'
                        }}></div>
                    </div>
                </div>

                {/* Distribution */}
                <div className="bg-[#11131A] border border-[#1C1E2B] rounded-2xl p-5 flex items-center justify-between">
                    <div className="relative w-20 h-20">
                        {/* Fake Donut Chart */}
                        <svg viewBox="0 0 36 36" className="w-20 h-20">
                            <path stroke="#A020F0" fill="none" strokeWidth="6"
                                strokeDasharray="40, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                            <path stroke="#00FF9D" fill="none" strokeWidth="6"
                                strokeDasharray="30, 100" strokeDashoffset="-40" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                            <path stroke="#4D8CFF" fill="none" strokeWidth="6"
                                strokeDasharray="20, 100" strokeDashoffset="-70" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                            <path stroke="#FF9800" fill="none" strokeWidth="6"
                                strokeDasharray="10, 100" strokeDashoffset="-90" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                            <circle cx="18" cy="18" r="10" fill="#11131A" />
                        </svg>
                    </div>
                    
                    <div className="flex flex-col gap-2 w-32 border-l border-[#1C1E2B] pl-4">
                        <p className="text-[12px] text-gray-300 border-b border-[#1C1E2B] pb-1 font-medium">Distribution</p>
                        <div className="flex items-center justify-between text-[11px]"><span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#4D8CFF]"></span>Daily</span><span className="text-gray-400">20%</span></div>
                        <div className="flex items-center justify-between text-[11px]"><span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#00FF9D]"></span>Weekly</span><span className="text-gray-400">30%</span></div>
                        <div className="flex items-center justify-between text-[11px]"><span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#A020F0]"></span>Monthly</span><span className="text-gray-400">40%</span></div>
                        <div className="flex items-center justify-between text-[11px]"><span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#FF9800]"></span>Yearly</span><span className="text-gray-400">10%</span></div>
                    </div>
                </div>

            </div>
        </div>
    );
}
