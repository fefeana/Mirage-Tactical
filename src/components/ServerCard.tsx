import React from 'react';

interface ServerCardProps {
  name: string;
  status: 'online' | 'offline' | 'busy';
  load: number;
  location: string;
  onAccess?: () => void;
}

const ServerCard: React.FC<ServerCardProps> = ({ name, status, load, location, onAccess }) => {
  return (
    <div className="relative group p-[2px] rounded-xl bg-gradient-to-br from-emerald-500/20 to-transparent hover:from-emerald-400 transition-all duration-500 overflow-hidden">
      {/* تأثير التوهج الخلفي */}
      <div className="absolute inset-0 bg-emerald-500/5 blur-xl group-hover:bg-emerald-500/10 transition-all" />
      
      <div className="relative bg-[#020617]/90 backdrop-blur-md p-6 rounded-xl border border-emerald-500/30">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-emerald-400 font-mono text-lg tracking-wider uppercase font-bold">
              {name}
            </h3>
            <span className="text-[10px] text-emerald-500/60 font-mono">{location}</span>
          </div>
          <div className={`h-3 w-3 rounded-full animate-pulse ${status === 'online' ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : status === 'offline' ? 'bg-red-500' : 'bg-yellow-500 shadow-[0_0_10px_#eab308]'}`} />
        </div>

        {/* مؤشر الحمل (Server Load) - تصميم سريالي */}
        <div className="mt-6">
          <div className="flex justify-between text-[10px] text-emerald-500/80 mb-1 font-mono">
            <span>CORE_LOAD</span>
            <span>{load}%</span>
          </div>
          <div className="h-[4px] w-full bg-slate-800 rounded-full overflow-hidden">
            <div 
              className={`h-full bg-emerald-400 shadow-[0_0_15px_#34d399] transition-all duration-1000 ${load > 85 ? 'bg-red-500 shadow-[0_0_15px_#ef4444]' : load > 60 ? 'bg-yellow-400 shadow-[0_0_15px_#facc15]' : ''}`}
              style={{ width: `${load}%` }}
            />
          </div>
        </div>

        <button 
          onClick={onAccess}
          className="mt-6 w-full py-2 bg-emerald-500/10 border border-emerald-500/50 text-emerald-400 hover:bg-emerald-500 hover:text-slate-900 transition-all font-mono text-sm uppercase tracking-tighter"
        >
          System_Access
        </button>
      </div>
    </div>
  );
};

export default ServerCard;
