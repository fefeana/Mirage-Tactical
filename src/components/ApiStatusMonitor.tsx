import React, { useState } from 'react';
import { Send, CheckCircle2 } from 'lucide-react';

const ApiStatusMonitor: React.FC = () => {
  const [deployStatus, setDeployStatus] = useState<'idle' | 'deploying' | 'success'>('idle');

  const handleDeploy = () => {
    setDeployStatus('deploying');
    
    // محاكاة إرسال الأوامر للسحابة (Cloud Function Deployment Sync)
    setTimeout(() => {
      setDeployStatus('success');
      
      // العودة لحالة الخمول بعد 3 ثواني
      setTimeout(() => setDeployStatus('idle'), 3000);
    }, 1500);
  };

  return (
    <div className="p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl backdrop-blur-sm relative overflow-hidden group">
      {/* تأثير نبض الخلفية السريالي */}
      <div className="absolute inset-0 bg-emerald-500/5 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 bg-emerald-400 rounded-full animate-ping shadow-[0_0_10px_#34d399]" />
              <h3 className="font-mono text-emerald-400 text-sm tracking-widest font-bold">CLOUD_GATEWAY_ACTIVE</h3>
            </div>
            {deployStatus === 'success' && <CheckCircle2 size={16} className="text-emerald-400" />}
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-[10px] font-mono mb-6">
          <div className="p-3 bg-slate-900/80 border border-emerald-500/10 rounded-lg flex flex-col justify-center">
            <span className="text-emerald-500/50 block mb-1">LAST_KEY_ROTATION</span>
            <span className="text-emerald-300 font-bold">SUCCESS: 120ms ago</span>
          </div>
          <div className="p-3 bg-slate-900/80 border border-emerald-500/10 rounded-lg flex flex-col justify-center">
            <span className="text-emerald-500/50 block mb-1">ENCRYPTION_MODE</span>
            <span className="text-emerald-300 font-bold">AES-256-CBC_DYNAMIC</span>
          </div>
        </div>
        
        {/* زر النشر السحابي السريع */}
        <button 
            onClick={handleDeploy}
            disabled={deployStatus !== 'idle'}
            className="w-full py-3 bg-emerald-600/10 hover:bg-emerald-500 hover:text-slate-950 border border-emerald-500/40 text-emerald-400 transition-all duration-300 font-mono text-xs uppercase tracking-widest font-bold flex items-center justify-center gap-2 group-hover:border-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {deployStatus === 'idle' && (
             <>Deploy_Update_To_Cloud <Send size={14} className="opacity-70" /></>
          )}
          {deployStatus === 'deploying' && (
             <span className="animate-pulse">SYNCING_TO_GCP_FUNCTIONS...</span>
          )}
          {deployStatus === 'success' && (
             <span>SYSTEM_SYNCED_SUCCESSFULLY</span>
          )}
        </button>
      </div>
    </div>
  );
};

export default ApiStatusMonitor;
