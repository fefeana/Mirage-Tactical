import React, { useState } from 'react';
import AiHub from './AiHub';
import { Shield, LayoutDashboard, Sparkles, User } from 'lucide-react';
// import SettingsPage from '../SettingsPage';
// import AdminDashboard from '../AdminDashboard';

export default function AlBarqHub() {
  const [activeTab, setActiveTab] = useState('ai-hub');

  return (
    <div className="flex h-screen bg-[#09090b] text-white overflow-hidden font-sans" dir="rtl">
      
      {/* Sidebar */}
      <aside className="w-[280px] bg-white/[0.02] border-l border-white/5 flex flex-col p-[30px_20px] backdrop-blur-[20px] shrink-0">
        <div className="flex items-center gap-2 mb-10">
          <span className="text-2xl text-yellow-500">⚡</span>
          <h2 className="text-xl font-semibold m-0 text-white">البرق AI</h2>
        </div>
        
        <nav className="flex flex-col gap-2.5 grow">
          <button 
            onClick={() => setActiveTab('ai-hub')}
            className={`w-full p-[14px_15px] bg-transparent border-none rounded-[10px] text-right text-[15px] cursor-pointer flex items-center gap-3 transition-all duration-200 ${
              activeTab === 'ai-hub' 
                ? 'bg-white/5 text-white border-r-[3px] border-r-emerald-500 rounded-r-none' 
                : 'text-zinc-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <span className="text-lg">✨</span> قسم الـ AI المتكامل
          </button>
          
          <button 
            onClick={() => setActiveTab('vpn-settings')}
            className={`w-full p-[14px_15px] bg-transparent border-none rounded-[10px] text-right text-[15px] cursor-pointer flex items-center gap-3 transition-all duration-200 ${
              activeTab === 'vpn-settings' 
                ? 'bg-white/5 text-white border-r-[3px] border-r-emerald-500 rounded-r-none' 
                : 'text-zinc-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <span className="text-lg">🛡️</span> إعدادات اتصال التطبيق
          </button>
          
          <button 
            onClick={() => setActiveTab('control-panel')}
            className={`w-full p-[14px_15px] bg-transparent border-none rounded-[10px] text-right text-[15px] cursor-pointer flex items-center gap-3 transition-all duration-200 ${
              activeTab === 'control-panel' 
                ? 'bg-white/5 text-white border-r-[3px] border-r-emerald-500 rounded-r-none' 
                : 'text-zinc-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <span className="text-lg">📊</span> لوحة التحكم والإدارة
          </button>
        </nav>
        
        {/* User Profile */}
        <div className="flex items-center gap-3 p-[15px] mt-auto rounded-xl bg-white/[0.02] border border-white/5">
          <div className="text-2xl opacity-80">👤</div>
          <div className="flex flex-col">
            <span className="text-[14px] text-white">الساموراي Seniorita</span>
            <span className="text-[11px] text-emerald-500 font-semibold mt-0.5">حساب مفعّل</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-10">
        {activeTab === 'ai-hub' && (
           <section className="animate-in fade-in slide-in-from-bottom-2 duration-400">
             <AiHub />
           </section>
        )}
        
        {activeTab === 'vpn-settings' && (
           <section className="animate-in fade-in slide-in-from-bottom-2 duration-400 max-w-4xl">
             <h2 className="text-2xl font-semibold mb-[30px]">إعدادات الاتصال والخصوصية</h2>
             <div className="bg-white/[0.02] border border-white/5 p-[30px] rounded-[16px] backdrop-blur-[10px]">
               <p className="text-gray-400 text-lg mb-6">تخصيص بروتوكولات التشفير والوضع المتخفي لحسابك.</p>
               {/*  Placeholder for VPN Settings UI */}
               <div className="h-64 border-2 border-dashed border-white/10 rounded-xl flex items-center justify-center text-gray-500">
                  واجهة الإعدادات سيتم دمجها هنا
               </div>
             </div>
           </section>
        )}

        {activeTab === 'control-panel' && (
           <section className="animate-in fade-in slide-in-from-bottom-2 duration-400 max-w-4xl">
             <h2 className="text-2xl font-semibold mb-[30px]">لوحة التحكم والمراقبة (Dashboard)</h2>
             <div className="bg-white/[0.02] border border-white/5 p-[30px] rounded-[16px] backdrop-blur-[10px]">
               <p className="text-gray-400 text-lg mb-6">إدارة الخوادم، متابعة حركة الميزانية والتمويل الذاتي، وإحصائيات المشتركين.</p>
               {/* Placeholder for Admin Panel */}
               <div className="h-64 border-2 border-dashed border-white/10 rounded-xl flex items-center justify-center text-gray-500">
                  لوحة التحكم سيتم دمجها هنا
               </div>
             </div>
           </section>
        )}
      </main>

    </div>
  );
}
