import React, { useState, useEffect } from 'react';
import { Fingerprint, Smartphone, Monitor, ShieldCheck, Activity } from 'lucide-react';

const SsoMonitor: React.FC = () => {
  const [sessions, setSessions] = useState([
    { id: 'usr_neo_991', platform: 'windows', status: 'active', latency: '12ms' },
    { id: 'usr_trinity_12', platform: 'android', status: 'active', latency: '45ms' },
    { id: 'usr_morpheus_X', platform: 'macos', status: 'authenticating', latency: '--' },
  ]);

  useEffect(() => {
    // محاكاة دخول جهاز جديد عبر الـ SSO
    const timer = setTimeout(() => {
      setSessions(prev => [
        { id: 'usr_cipher_00', platform: 'ios', status: 'active', latency: '32ms' },
        ...prev.map(s => s.id === 'usr_morpheus_X' ? { ...s, status: 'active', latency: '18ms' } : s)
      ]);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  const getPlatformIcon = (platform: string) => {
    switch(platform) {
      case 'android':
      case 'ios':
        return <Smartphone size={14} className="text-emerald-400" />;
      default:
        return <Monitor size={14} className="text-emerald-400" />;
    }
  };

  return (
    <div className="bg-[#0a0a0a] border border-[#222] p-6 relative overflow-hidden">
      {/* Visual Glitch/Cyber line */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>

      <div className="flex justify-between items-center mb-6 border-b border-[#222] pb-4">
        <h2 className="text-sm font-bold text-gray-400 tracking-widest flex items-center gap-2">
          <Fingerprint size={16} className="text-emerald-400 animate-pulse" />
          UNIVERSAL HANDSHAKE (SSO)
        </h2>
        <div className="flex items-center gap-2 text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded font-mono border border-emerald-500/20">
          <ShieldCheck size={12} />
          GLOBAL_AUTH_SYNCED
        </div>
      </div>

      <div className="space-y-3">
        {sessions.map((session, i) => (
          <div key={i} className="flex items-center justify-between p-3 bg-[#111] border border-[#333] hover:border-emerald-500/50 transition-colors group">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-[#050505] border border-[#222] rounded-md group-hover:bg-emerald-500/10 transition-colors">
                {getPlatformIcon(session.platform)}
              </div>
              <div>
                <div className="text-xs font-mono font-bold text-gray-200">{session.id}</div>
                <div className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">{session.platform} OS</div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="flex items-center justify-end gap-2 mb-1 text-[10px] font-mono">
                {session.status === 'active' ? (
                  <span className="text-emerald-400 flex items-center gap-1"><div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" /> SECURE_LINK</span>
                ) : (
                  <span className="text-yellow-500 flex items-center gap-1"><Activity size={10} className="animate-spin" /> HANDSHAKING...</span>
                )}
              </div>
              <div className="text-[10px] text-gray-600 font-mono">PING: <span className="text-gray-400">{session.latency}</span></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SsoMonitor;
