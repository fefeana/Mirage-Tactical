import React, { useState } from 'react';
import { Fingerprint, Lock, ShieldAlert, Terminal as TerminalIcon, ShieldCheck, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';

const CyberLogin: React.FC = () => {
  const [token, setToken] = useState('');
  const [status, setStatus] = useState<'idle' | 'authenticating' | 'success' | 'error'>('idle');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    
    setStatus('authenticating');
    
    // Simulate the Universal Handshake delay
    setTimeout(() => {
      if (token === 'RONIN_2026') {
        setStatus('success');
      } else {
        setStatus('error');
        setTimeout(() => setStatus('idle'), 2000);
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4 relative overflow-hidden font-mono selection:bg-emerald-500/30">
      {/* Background Grid & Scanlines */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px] pointer-events-none opacity-20" />
      
      {/* Central Glitch Sphere / Logo */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Samurai-style sharp edge container */}
        <div className="relative bg-[#050505]/80 backdrop-blur-xl border border-emerald-500/20 shadow-[0_0_50px_-12px_rgba(16,185,129,0.2)] p-1 overflow-hidden"
             style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%)' }}>
          
          {/* Top accent line */}
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-50" />

          <div className="p-8">
            <div className="flex flex-col items-center mb-10 text-center">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="relative w-16 h-16 flex items-center justify-center mb-4 border border-emerald-500/30 rounded-full"
              >
                <div className="absolute inset-2 border border-emerald-500/10 rounded-full border-t-emerald-400" />
                <Fingerprint className="text-emerald-400 w-8 h-8" />
              </motion.div>
              <h1 className="text-white text-2xl font-bold tracking-[0.2em] uppercase mb-1">Mirage<span className="text-emerald-500">_OS</span></h1>
              <p className="text-emerald-500/50 text-[10px] tracking-[0.3em] font-mono">UNIVERSAL SSO GATEWAY</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/0 via-emerald-500/20 to-emerald-500/0 opacity-0 group-hover:opacity-100 transition duration-500 blur" />
                <div className="relative flex items-center bg-[#0a0a0a] border border-[#222] group-hover:border-emerald-500/50 transition-colors">
                  <span className="pl-4 text-emerald-500/50">
                    <TerminalIcon size={16} />
                  </span>
                  <input
                    type="password"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="ENTER_ACCESS_TOKEN"
                    className="w-full bg-transparent border-none text-emerald-400 placeholder-emerald-500/30 px-4 py-4 text-sm tracking-widest focus:outline-none focus:ring-0 uppercase"
                    disabled={status === 'authenticating' || status === 'success'}
                  />
                  {/* Blinking cursor effect on focus */}
                  <div className="absolute right-4 w-2 h-4 bg-emerald-500 animate-pulse opacity-0 group-focus-within:opacity-100" />
                </div>
              </div>

              <div className="flex justify-between items-center text-[10px] text-emerald-500/40 tracking-widest px-1">
                <span>ENCRYPTION: AES-256-GCM</span>
                <span>NODE: OFFLINE</span>
              </div>

              <button
                type="submit"
                disabled={!token || status === 'authenticating' || status === 'success'}
                className="relative w-full group overflow-hidden"
              >
                {/* Slanted button design typical of cyberpunk interfaces */}
                <div className="absolute inset-0 bg-emerald-500/10 transition-transform duration-300 group-hover:bg-emerald-500/20" />
                <div className={`relative border flex items-center justify-center gap-2 py-4 px-6 text-sm tracking-[0.2em] font-bold transition-all duration-300
                  ${status === 'error' ? 'border-red-500/50 text-red-500' : 
                    status === 'success' ? 'border-emerald-500 text-emerald-400 bg-emerald-500/20' : 
                    'border-emerald-500/30 text-emerald-500 group-hover:text-emerald-400 group-hover:border-emerald-500'}
                `}>
                  {status === 'idle' && (
                    <>
                      INITIATE_UPLINK <ChevronRight size={16} />
                    </>
                  )}
                  {status === 'authenticating' && (
                    <>
                      <Lock size={14} className="animate-pulse" /> VERIFYING_SIGNATURE...
                    </>
                  )}
                  {status === 'success' && (
                    <>
                      <ShieldCheck size={16} /> AUTHORIZED_ACCESS
                    </>
                  )}
                  {status === 'error' && (
                    <>
                      <ShieldAlert size={16} /> ACCESS_DENIED
                    </>
                  )}
                </div>
                {/* Horizontal scanline over button */}
                <div className="absolute top-0 left-[-100%] w-full h-[2px] bg-emerald-400 shadow-[0_0_10px_#34d399] transition-all duration-700 ease-out group-hover:left-[100%]" />
              </button>
            </form>

          </div>

          {/* Bottom decor line */}
          <div className="absolute bottom-0 right-0 w-1/3 h-[2px] bg-gradient-to-l from-emerald-500 to-transparent opacity-50" />
        </div>
        
        {/* Helper subtle text */}
        <p className="text-center text-[#333] text-[10px] font-mono mt-6 tracking-widest">
          USE 'RONIN_2026' TO TEST THE GATEWAY
        </p>
      </motion.div>
    </div>
  );
};

export default CyberLogin;
