import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ShieldAlert, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  errorInfo: any | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    try {
      const parsed = JSON.parse(error.message);
      return { hasError: true, errorInfo: parsed };
    } catch (e) {
      return { hasError: true, errorInfo: { error: error.message } };
    }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      const errorMsg = this.state.errorInfo?.error || "Unknown Error String";
      const isPermissionError = String(errorMsg).includes('Missing or insufficient permissions');
      
      return (
        <div className="min-h-screen bg-[#050505] text-white font-mono flex flex-col items-center justify-center p-6 text-center selection:bg-[#00ffcc] selection:text-black">
          <ShieldAlert size={64} className={isPermissionError ? "text-[#ff003c] mb-6" : "text-yellow-500 mb-6"} />
          <h1 className="text-3xl font-bold mb-4 tracking-widest text-[#00ffcc]">
            {isPermissionError ? 'ACCESS DENIED' : 'SYSTEM ERROR'}
          </h1>
          <p className="text-gray-400 max-w-md mb-8">
             Commander, the system encountered an anomaly and halted to protect integrity.
          </p>
          <div className="bg-[#111] border border-[#aa0000] p-4 rounded text-left text-xs text-gray-500 mb-8 max-w-lg w-full overflow-auto">
             <p className="text-white font-bold mb-2">RAW EXCEPTION:</p>
             <p className="text-[#ff003c] mb-4">{errorMsg}</p>
             {this.state.errorInfo?.path && (
               <>
                <p><span className="text-[#00ffcc]">TARGET:</span> {this.state.errorInfo.path}</p>
                <p><span className="text-[#00ffcc]">OPERATION:</span> {this.state.errorInfo.operationType}</p>
                <p><span className="text-[#00ffcc]">USER:</span> {this.state.errorInfo.authInfo?.email || 'UNKNOWN'}</p>
               </>
             )}
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => {
                window.location.href = '/';
              }}
              className="bg-[#111] border border-[#333] hover:border-[#00ffcc] text-[#00ffcc] px-6 py-3 flex items-center gap-2 transition-colors text-sm font-bold tracking-widest"
            >
              <Home size={16} /> RELOAD SYSTEM
            </button>
            <button 
              onClick={() => {
                // Ignore is not possible here without clearing the state. Handled as refresh.
                window.location.reload();
              }}
              className="bg-[#111] border border-[#aa0000] hover:border-[#ff003c] text-white px-6 py-3 flex items-center gap-2 transition-colors text-sm font-bold tracking-widest"
            >
              FORCE BYPASS (IGNORE)
            </button>
          </div>
        </div>
      );
    }

    return (this as any).props.children;
  }
}
