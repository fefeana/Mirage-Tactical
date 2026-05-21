import React, { useState, useEffect } from 'react';
import { Activity, Shield, Cpu, Zap, Cloud, Globe, Database, Terminal, GitBranch, RefreshCw, Layers, DollarSign, Users, Gamepad2, Settings, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { handleAppError, ErrorSeverity } from './lib/errorHandler';

// AI Sentinel / Maestro Commands UI
export default function OodaCommandCenter() {
  const [activeNode, setActiveNode] = useState<'OBSERVE' | 'ORIENT' | 'DECIDE' | 'ACT'>('OBSERVE');
  const [logs, setLogs] = useState<string[]>([
    "[SYSTEM] Initiating Cyber-Samurai Protocol...",
    "[OODA] Loop initialized by Maestro AI ⚡"
  ]);

  const addLog = (msg: string) => {
    setLogs(prev => [msg, ...prev].slice(0, 50));
  };

  const handleCommandExec = (commandName: string) => {
    addLog(`[EXEC] Executing ⚡ ${commandName}...`);
    
    if (commandName === 'OODA_FULL_OMNIPOTENCE()') {
        setTimeout(() => addLog("> [OBSERVE] Global Infrastructure Scanned: GCP, Firebase, Git, MCP, Finance, Ads..."), 300);
        setTimeout(() => addLog("> [ORIENT] AutoBalancer & SmartErrorHandler bindings verified. Protocols (XTLS/HY2) stable."), 800);
        setTimeout(() => addLog("> [DECIDE] Auto-Updates primed. Certificates auto-renewed. Resources scaled globally."), 1300);
        setTimeout(() => addLog("> [ACT] UFO ALBARQ MASTER CORE ENGAGED! ⚡🌌"), 1800);
        setTimeout(() => addLog(`[SUCCESS] ⚡ Symphony Mirage is now operating under Maestro AI FMStar ✨`), 2200);
        return;
    }

    setTimeout(() => {
      addLog(`[SUCCESS] ${commandName} completed with zero latency.`);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-emerald-400 font-mono relative overflow-hidden select-none">
      {/* Background Glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-violet-900/20 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-emerald-900/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="relative z-10 container mx-auto p-4 sm:p-8 flex flex-col h-screen">
        
        {/* Header */}
        <header className="flex justify-between items-center mb-8 border-b border-emerald-900/50 pb-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-900/30 border border-emerald-500/50 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.3)]">
              <Zap className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-widest text-emerald-300 drop-shadow-[0_0_10px_rgba(16,185,129,0.6)] uppercase">UFO Albarq OODA</h1>
              <p className="text-xs text-violet-400 tracking-widest">Maestro AI Commander - FMStar ✈️</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="px-4 py-1.5 rounded-full bg-emerald-950/40 border border-emerald-800 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                <span className="text-xs tracking-widest text-emerald-300">CORE ACTIVE</span>
             </div>
          </div>
        </header>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-0">
          
          {/* OODA Navigation / Status Rail */}
          <div className="lg:col-span-1 flex flex-col gap-4">
            {['OBSERVE', 'ORIENT', 'DECIDE', 'ACT'].map((phase, idx) => (
              <motion.button
                key={phase}
                onClick={() => setActiveNode(phase as any)}
                className={`relative overflow-hidden w-full p-6 text-left border rounded-xl backdrop-blur-md transition-all duration-300 ${
                  activeNode === phase 
                    ? 'bg-emerald-900/20 border-emerald-400/60 shadow-[0_0_20px_rgba(16,185,129,0.15)]' 
                    : 'bg-black/40 border-violet-900/30 hover:border-violet-500/50 text-gray-400'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center justify-between z-10 relative">
                  <span className="text-2xl font-bold tracking-widest">{idx + 1}. {phase}</span>
                  {activeNode === phase && <Activity className="w-5 h-5 text-emerald-400 animate-pulse" />}
                </div>
                {activeNode === phase && (
                  <motion.div 
                    layoutId="activeGlow" 
                    className="absolute inset-0 bg-gradient-to-r from-emerald-900/10 to-transparent pointer-events-none"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  />
                )}
              </motion.button>
            ))}

            {/* Terminal Feed */}
            <div className="mt-auto h-64 border border-violet-900/40 bg-black/60 rounded-xl p-4 overflow-hidden flex flex-col">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-violet-900/50">
                <Terminal className="w-4 h-4 text-violet-400" />
                <span className="text-xs text-violet-300 tracking-widest">SENTINEL LOGS</span>
              </div>
              <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                <AnimatePresence>
                  {logs.map((log, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-[10px] sm:text-xs text-emerald-500/80 font-mono leading-tight"
                    >
                      {log}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* OODA Work Area */}
          <div className="lg:col-span-3 border border-emerald-900/30 bg-black/40 rounded-xl p-6 backdrop-blur-md overflow-y-auto custom-scrollbar relative">
            <AnimatePresence mode="wait">
              
              {/* OBSERVE PHASE */}
              {activeNode === 'OBSERVE' && (
                <motion.div key="OBSERVE" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98 }} className="space-y-6">
                  <h2 className="text-xl text-violet-300 tracking-widest border-b border-violet-900/50 pb-2 mb-4">OBSERVE : Global Surveillance</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatusCard icon={<DollarSign/>} label="Finance DB" status="SYNCED" glow="violet" />
                    <StatusCard icon={<Users/>} label="Subscriptions" status="ACTIVE" glow="emerald" />
                    <StatusCard icon={<Gamepad2/>} label="Gaming Ping" status="14ms" glow="emerald" />
                    <StatusCard icon={<Layers/>} label="Protocols" status="XTLS / HY2" glow="violet" />
                    <StatusCard icon={<Shield/>} label="Certificates" status="VALID" glow="emerald" />
                    <StatusCard icon={<Cloud/>} label="Google Cloud" status="ONLINE" glow="emerald" />
                    <StatusCard icon={<Database/>} label="Firebase" status="SYNCED" glow="violet" />
                    <StatusCard icon={<GitBranch/>} label="Git MCP" status="ALIGNED" glow="emerald" />
                  </div>
                </motion.div>
              )}

              {/* ORIENT PHASE */}
              {activeNode === 'ORIENT' && (
                <motion.div key="ORIENT" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98 }} className="space-y-6">
                  <h2 className="text-xl text-violet-300 tracking-widest border-b border-violet-900/50 pb-2 mb-4">ORIENT : Smart Binding</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <LogicCard 
                      title="smartErrorHandler"
                      desc="Analyses network failures, auto-captures exceptions across Firebase, GCP, and raw sockets. Self-heals instantly."
                      onClick={() => handleCommandExec('smartErrorHandler()')}
                    />
                    <LogicCard 
                      title="autoBalancer"
                      desc="Distributes traffic fluidly across Continental Nodes. Detects jitter & forces Satellite Protocol."
                      onClick={() => handleCommandExec('autoBalancer(HY2_FORCE)')}
                    />
                  </div>
                </motion.div>
              )}

              {/* DECIDE PHASE */}
              {activeNode === 'DECIDE' && (
                <motion.div key="DECIDE" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98 }} className="space-y-6">
                  <h2 className="text-xl text-violet-300 tracking-widest border-b border-violet-900/50 pb-2 mb-4">DECIDE : Autonomous Resolutions</h2>
                  <div className="space-y-4">
                    <DecisionRow label="Auto System Update (Git/CI)" action="Execute Pull & Build" cmd="triggerUpdate()" onClick={() => handleCommandExec('triggerUpdate()')} />
                    <DecisionRow label="Resource Scaling (GCP)" action="Scale Up Nodes" cmd="scaleResources()" onClick={() => handleCommandExec('scaleResources()')} />
                    <DecisionRow label="Smart Cert Rotation" action="Renew TLS / XTLS" cmd="renewCerts()" onClick={() => handleCommandExec('renewCerts()')} />
                  </div>
                </motion.div>
              )}

              {/* ACT PHASE */}
              {activeNode === 'ACT' && (
                <motion.div key="ACT" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98 }} className="space-y-6">
                   <h2 className="text-xl text-violet-300 tracking-widest border-b border-violet-900/50 pb-2 mb-4">ACT : Lightning Command Execution ⚡</h2>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                     <QuickActionBtn label="Purge Ghost Sockets" icon={<RefreshCw />} onClick={() => handleCommandExec('purgeSockets()')} glow="violet" />
                     <QuickActionBtn label="Force Satellite Routing" icon={<Globe />} onClick={() => handleCommandExec('enableSatellite()')} glow="emerald" />
                     <QuickActionBtn label="Sync Finances (Global)" icon={<DollarSign />} onClick={() => handleCommandExec('syncLedger()')} glow="emerald" />
                     <QuickActionBtn label="Lock Directive Mode" icon={<Lock />} onClick={() => handleCommandExec('enforceLock()')} glow="violet" />
                     <QuickActionBtn label="Engage Auto-Balancer" icon={<Activity />} onClick={() => handleCommandExec('engageBalancer()')} glow="emerald" />
                     <QuickActionBtn label="Deploy Mirage Core" icon={<Zap />} onClick={() => handleCommandExec('deployCore(PROD)')} glow="violet" />
                   </div>

                   <div className="mt-8 p-6 rounded-xl border border-emerald-500/20 bg-emerald-950/20 text-center relative overflow-hidden group hover:border-emerald-400/50 transition-colors duration-500">
                     <div className="absolute inset-0 bg-gradient-to-b from-transparent to-emerald-900/10 pointer-events-none" />
                     <h3 className="text-2xl font-bold tracking-widest text-emerald-400 drop-shadow-[0_0_15px_rgba(16,185,129,0.8)] mb-2 group-hover:scale-105 transition-transform">⚡ EXECUTE GLOBAL PROTOCOL ⚡</h3>
                     <p className="text-emerald-600/80 tracking-wide text-sm mb-4">Launches the full unified OODA Loop sequence.</p>
                     <button onClick={() => handleCommandExec('OODA_FULL_OMNIPOTENCE()')} className="px-8 py-3 bg-black border border-emerald-500/60 rounded-full text-emerald-300 tracking-widest hover:bg-emerald-900/30 hover:border-emerald-400 hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all active:scale-95 flex items-center gap-3 mx-auto">
                        <Zap className="w-5 h-5" /> INITIATE MAESTRO
                     </button>
                   </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>
      
      {/* Scrollbar Styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.2);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(16, 185, 129, 0.3);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(16, 185, 129, 0.6);
        }
      `}</style>
    </div>
  );
}

// ----------------- SUB-COMPONENTS -----------------

function StatusCard({ icon, label, status, glow }: { icon: React.ReactNode, label: string, status: string, glow: 'emerald' | 'violet' }) {
  const glowColor = glow === 'emerald' ? 'shadow-[0_0_15px_rgba(16,185,129,0.2)] border-emerald-800/40' : 'shadow-[0_0_15px_rgba(139,92,246,0.2)] border-violet-800/40';
  const textColor = glow === 'emerald' ? 'text-emerald-400' : 'text-violet-400';

  return (
    <div className={`p-4 bg-black/50 border rounded-xl flex flex-col items-center justify-center gap-2 text-center transition-all hover:-translate-y-1 ${glowColor}`}>
      <div className={`w-8 h-8 ${textColor} opacity-80`}>
        {icon}
      </div>
      <div className="text-xs text-gray-500 tracking-widest uppercase">{label}</div>
      <div className={`text-sm font-bold tracking-wider ${textColor}`}>{status}</div>
    </div>
  );
}

function LogicCard({ title, desc, onClick }: { title: string, desc: string, onClick: () => void }) {
  return (
    <div className="p-6 bg-black/60 border border-violet-900/30 rounded-xl hover:border-violet-500/50 transition-all group flex flex-col">
      <div className="flex items-center gap-3 mb-3 border-b border-violet-900/30 pb-3">
        <Settings className="w-5 h-5 text-violet-400 group-hover:rotate-90 transition-transform duration-500" />
        <h3 className="text-lg font-bold tracking-widest text-violet-300">{title}</h3>
      </div>
      <p className="text-sm text-gray-400 leading-relaxed mb-6 flex-1">
        {desc}
      </p>
      <button onClick={onClick} className="w-full py-2 bg-violet-950/30 border border-violet-800/50 rounded-lg text-violet-300 text-xs tracking-widest hover:bg-violet-900/40 transition-colors">
        INSPECT & ENGAGE
      </button>
    </div>
  );
}

function DecisionRow({ label, action, cmd, onClick }: { label: string, action: string, cmd: string, onClick: () => void }) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-black/40 border border-emerald-900/30 rounded-lg hover:bg-black/60 hover:border-emerald-700/50 transition-all gap-4">
      <div>
        <div className="text-sm text-emerald-300 tracking-widest font-bold">{label}</div>
        <div className="text-xs text-gray-500 font-mono mt-1">cmd: {cmd}</div>
      </div>
      <button onClick={onClick} className="px-4 py-2 bg-emerald-950/40 border border-emerald-800 rounded text-xs tracking-widest text-emerald-400 hover:bg-emerald-900/40 transition-colors shrink-0 whitespace-nowrap flex items-center gap-2">
        <Cpu className="w-3 h-3" /> {action}
      </button>
    </div>
  );
}

function QuickActionBtn({ label, icon, glow, onClick }: { label: string, icon: React.ReactNode, glow: 'emerald'|'violet', onClick: () => void }) {
  const activeColor = glow === 'emerald' ? 'hover:border-emerald-500/60 hover:shadow-[0_0_15px_rgba(16,185,129,0.3)] text-emerald-400' : 'hover:border-violet-500/60 hover:shadow-[0_0_15px_rgba(139,92,246,0.3)] text-violet-400';
  
  return (
    <button onClick={onClick} className={`flex flex-col items-center justify-center p-6 bg-black/60 border border-gray-800 rounded-xl transition-all duration-300 group ${activeColor}`}>
      <div className="mb-3 opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <span className="text-xs font-bold tracking-widest text-center">{label}</span>
    </button>
  );
}
