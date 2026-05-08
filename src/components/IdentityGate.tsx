import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Lock, Fingerprint, Activity } from 'lucide-react';

const IdentityGate: React.FC = () => {
  const [voucher, setVoucher] = useState('');
  const [status, setStatus] = useState<'idle' | 'authorizing' | 'success'>('idle');

  const handleAuthorize = () => {
    if (!voucher) return;
    setStatus('authorizing');
    setTimeout(() => {
      setStatus('success');
    }, 2000);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#020617] text-emerald-400 relative overflow-hidden font-mono">
      {/* Background grids */}
      <div className="absolute inset-0 bg-[#020617] bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:40px_40px] opacity-[0.03]"></div>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="z-10 p-8 border-2 border-emerald-500/30 bg-slate-900/80 backdrop-blur-2xl rounded-3xl shadow-[0_0_50px_-12px_rgba(16,185,129,0.3)] w-full max-w-md relative"
      >
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#020617] px-4">
           {status === 'success' ? (
              <Fingerprint className="text-emerald-400 shadow-emerald-500/50 drop-shadow-md w-8 h-8" />
           ) : (
              <Lock className="text-emerald-500/50 w-8 h-8" />
           )}
        </div>

        <h1 className="text-2xl font-mono tracking-[0.5em] mt-4 mb-8 text-center uppercase font-bold">Mirage<span className="text-emerald-500/50">_Access</span></h1>
        
        <div className="relative group mb-6">
          <input 
            type="password" 
            placeholder="ENTER_VOUCHER_KEY" 
            value={voucher}
            onChange={(e) => setVoucher(e.target.value)}
            disabled={status !== 'idle'}
            className="w-full p-4 bg-slate-950 border border-emerald-500/20 rounded-xl focus:border-emerald-400 outline-none font-mono text-center tracking-widest uppercase transition-all shadow-inner disabled:opacity-50"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-focus-within:opacity-100 transition-opacity">
            <div className="w-2 h-4 bg-emerald-500 animate-pulse"></div>
          </div>
        </div>
        
        <button 
          onClick={handleAuthorize}
          disabled={!voucher || status !== 'idle'}
          className="relative w-full py-4 bg-emerald-500 text-slate-950 font-bold uppercase tracking-widest hover:bg-emerald-400 transition-all shadow-[0_0_20px_rgba(16,185,129,0.5)] disabled:opacity-50 disabled:cursor-not-allowed group overflow-hidden rounded-xl"
        >
          {status === 'idle' && <span>Authorize_Session</span>}
          {status === 'authorizing' && <span className="flex items-center justify-center gap-2"><Activity size={18} className="animate-spin" /> SYNCING...</span>}
          {status === 'success' && <span>SESSION_GRANTED</span>}

          <div className="absolute top-0 left-[-100%] w-full h-full bg-white/20 transition-all duration-500 group-hover:left-[100%]"></div>
        </button>
        
        <div className="mt-6 flex flex-col gap-1 text-[10px] text-center opacity-50 font-mono italic">
          <span>System_Encryption: AES-256-GCM / 2FA_SATELLITE_READY</span>
          <span>PLATFORM: DEVICE_AGNOSTIC</span>
        </div>
      </motion.div>
    </div>
  );
};

export default IdentityGate;
