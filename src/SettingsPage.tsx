import React from 'react';
import { ChevronLeft, Share2, Shield, Users, Gamepad2, Gift, Play, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SettingsPage() {
  const navigate = useNavigate();

  return (
    <div className="relative w-full min-h-screen bg-[#07070F] text-white font-sans overflow-y-auto p-6 pb-20">
      <div className="w-full max-w-sm mx-auto flex flex-col h-full py-4">
        
        {/* Header */}
        <div className="flex items-center gap-4 border-b border-white/5 pb-4 mb-6 bg-[#11131A] px-4 py-3 rounded-lg">
          <button onClick={() => navigate('/')} className="text-[#B280FF] hover:scale-110 transition-transform">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-[16px] font-medium tracking-[2px]">SYSTEM SETTINGS</h1>
        </div>

        {/* Share Link */}
        <div className="flex items-center gap-2 mb-3 px-2">
            <Share2 className="w-4 h-4 text-[#B280FF]" />
            <h2 className="text-sm">Referral</h2>
        </div>
        <div className="bg-[#11131A] border border-white/5 rounded-2xl p-4 flex justify-between items-center mb-8 relative">
           <div>
              <p className="text-sm mb-1 text-white">Share your link</p>
              <p className="text-[12px] text-[#00FF9D] font-mono">https://miragevpn.com/ref/ABC123</p>
           </div>
           <button className="bg-[#8A2BE2] p-2 rounded-lg absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/4">
               <Share2 className="w-4 h-4 text-white" />
           </button>
        </div>

        {/* Security Control */}
        <div className="flex items-center gap-2 mb-3 px-2">
            <ShieldAlert className="w-4 h-4 text-red-500" />
            <Shield className="w-4 h-4 text-[#FFD700]" />
            <h2 className="text-sm">Security Control</h2>
        </div>
        <div className="bg-[#11131A] border border-white/5 rounded-2xl p-4 flex flex-col gap-4 mb-8">
            <div className="flex justify-between items-center">
                <span className="text-white text-sm">Ghost Mode</span>
                <button className="px-4 py-1.5 rounded-full border border-white/20 text-white/70 text-xs">OFF</button>
            </div>
            <div className="flex justify-between items-center">
                <span className="text-white text-sm">Emergency Mode</span>
                <button className="px-4 py-1.5 rounded-full border border-white/20 text-white/70 text-xs">OFF</button>
            </div>
        </div>

        {/* Subscriptions */}
        <div className="flex items-center gap-2 mb-3 px-2">
            <Shield className="w-4 h-4 text-[#B280FF]" />
            <div className="w-4 h-4 bg-[#FFD700] rounded-sm flex items-center justify-center text-black text-[8px] font-bold">VIP</div>
            <h2 className="text-sm">Subscriptions</h2>
        </div>
        <div className="flex flex-col gap-3 mb-8">
            <div className="bg-[#11131A] border border-white/5 rounded-xl p-4 flex justify-between items-center">
                <span className="text-white text-sm">Daily Plan</span>
                <span className="text-[#00FF9D] font-bold text-sm">0.99 USD</span>
            </div>
            <div className="bg-[#11131A] border border-white/5 rounded-xl p-4 flex justify-between items-center">
                <span className="text-white text-sm">Weekly Plan</span>
                <span className="text-[#00FF9D] font-bold text-sm">3.99 USD</span>
            </div>
            <div className="bg-[#11131A] border border-white/5 rounded-xl p-4 flex justify-between items-center">
                <span className="text-white text-sm">Monthly Plan</span>
                <span className="text-[#00FF9D] font-bold text-sm">9.99 USD</span>
            </div>
            <div className="bg-[#11131A] border border-white/5 rounded-xl p-4 flex justify-between items-center">
                <span className="text-white text-sm">Yearly Plan</span>
                <span className="text-[#00FF9D] font-bold text-sm">49.5 USD</span>
            </div>
        </div>

        {/* Customer Management */}
        <div className="flex items-center gap-2 mb-3 px-2">
            <Shield className="w-4 h-4 text-[#B280FF]" />
            <Users className="w-4 h-4 text-[#38BDF8]" />
            <h2 className="text-sm">Customer Management</h2>
        </div>
        <div className="flex flex-col gap-3 mb-8">
            <div className="bg-[#11131A] border border-white/5 rounded-xl p-4 flex justify-between items-center">
                <div>
                   <p className="text-white font-bold mb-1">Ali</p>
                   <p className="text-white/50 text-[11px]">ali@example.com <span className="mx-1">|</span> Plan: Monthly</p>
                </div>
                <span className="text-[#00FF9D] font-bold text-xs">Paid</span>
            </div>
            <div className="bg-[#11131A] border border-white/5 rounded-xl p-4 flex justify-between items-center">
                <div>
                   <p className="text-white font-bold mb-1">Sara</p>
                   <p className="text-white/50 text-[11px]">sara@example.com <span className="mx-1">|</span> Plan: Yearly</p>
                </div>
                <span className="text-[#FF9800] font-bold text-xs">Pending</span>
            </div>
        </div>

        {/* Popular Games */}
        <div className="flex items-center gap-2 mb-3 px-2">
            <Gamepad2 className="w-4 h-4 text-[#B280FF]" />
            <Gamepad2 className="w-4 h-4 text-gray-400" />
            <h2 className="text-sm">Popular Games</h2>
        </div>
        <div className="flex flex-col gap-3 mb-8">
            {['PUBG Mobile', 'Free Fire', 'Fortnite', 'FIFA', 'Call of Duty'].map((game) => (
                <div key={game} className="bg-[#11131A] border border-white/5 rounded-xl p-4 flex justify-between items-center">
                    <span className="text-white text-sm">{game}</span>
                    <button className="flex items-center gap-2 px-4 py-1.5 rounded-lg border border-[#B280FF] text-white text-xs hover:bg-[#B280FF]/20 transition-colors">
                        <Play className="w-3 h-3" /> Play
                    </button>
                </div>
            ))}
        </div>

        {/* Rewards */}
        <div className="flex items-center gap-2 mb-3 px-2">
            <Gift className="w-4 h-4 text-[#B280FF]" />
            <span className="text-[#FFD700]">🏆</span>
            <h2 className="text-sm">Rewards</h2>
        </div>
        <div className="bg-[#11131A] border border-white/5 rounded-2xl p-5 mb-8">
            <div className="flex justify-between items-center mb-3">
                <span className="text-white text-sm">Progress</span>
                <span className="text-[#00FF9D] font-bold text-sm">75 pts</span>
            </div>
            <div className="w-full bg-[#1C1E2B] h-2 rounded-full overflow-hidden">
                <div className="bg-[#B280FF] h-full" style={{ width: '75%' }}></div>
            </div>
        </div>

      </div>
    </div>
  );
}
