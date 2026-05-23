import React, { useState, useEffect } from 'react';
import { Terminal, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AiHub from './components/AiHub';

export default function AiSentinel() {
    const navigate = useNavigate();
    const [lines, setLines] = useState<string[]>([]);
    
    const sequence = [
        "Secure boot sequence initiated...",
        "Loading Quantum Cryptography module... [OK]",
        "Initializing Neural Routing Logic... [OK]",
        "Standby for Commander Protocol... [READY]",
        "> Awaiting Command...",
        "> Analyzing Network Topology...",
        "> Scanning for intrusons...",
        "Sys checks complete. All nodes operational."
    ];

    useEffect(() => {
        let currentLine = 0;
        const interval = setInterval(() => {
            if (currentLine < sequence.length) {
                setLines(prev => [...prev, sequence[currentLine]]);
                currentLine++;
            } else {
                clearInterval(interval);
            }
        }, 800);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="relative w-full min-h-screen bg-[#07070F] text-white font-mono overflow-y-auto p-6 pb-20">
            <div className="w-full max-w-sm mx-auto flex flex-col h-full py-4">
                
                {/* Header */}
                <div className="flex items-center gap-4 border-b border-[#FF00FF]/30 pb-4 mb-6 px-4 py-3 bg-[#11131A] rounded-lg">
                    <button onClick={() => navigate('/')} className="text-[#FF00FF] hover:scale-110 transition-transform">
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <div className="flex items-center gap-2">
                        <Terminal className="w-5 h-5 text-[#FF00FF]" />
                        <h1 className="text-[16px] font-bold text-[#FF00FF] tracking-[2px]">A.I. SENTINEL CORE</h1>
                    </div>
                </div>

                {/* Terminal Window */}
                <div className="bg-black border border-[#FF00FF]/50 rounded-lg p-4 h-[40vh] overflow-y-auto mb-10">
                     {lines.map((line, index) => (
                         <div key={index} className="text-[#00FF9D] text-xs mb-2">
                             <span className="opacity-50 select-none mr-2">[{new Date().toISOString().split('T')[1].substring(0, 8)}]</span>
                             {line}
                         </div>
                     ))}
                     <div className="animate-pulse w-2 h-4 bg-[#00FF9D] mt-2 inline-block"></div>
                </div>
            </div>

            {/* AI Hub Section */}
            <div className="mt-8 border-t border-white/10 pt-8 w-full max-w-7xl mx-auto">
                <AiHub />
            </div>
        </div>
    );
}
