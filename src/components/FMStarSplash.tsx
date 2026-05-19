import React, { useEffect, useState } from 'react';

export default function FMStarSplash({ onClose }: { onClose: () => void }) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
      onClose();
    }, 6000);
    return () => clearTimeout(timer);
  }, [onClose]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[10000] bg-black flex flex-col items-center justify-center overflow-hidden">
      {/* Cinematic intro elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,255,204,0.3)_0%,rgba(0,0,0,1)_80%)] animate-pulse"></div>
      
      <div className="z-10 text-center animate-[floatUpDown_3s_ease-in-out_infinite]">
        <div className="text-8xl mb-6 drop-shadow-[0_0_40px_#00ffcc] hover:scale-110 transition-transform cursor-pointer">✨😉</div>
        <div className="text-6xl mb-6 drop-shadow-[0_0_30px_#A855F7]">🌿🚀</div>
        <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#00ffcc] via-[#A855F7] to-[#ffffff] drop-shadow-[0_0_25px_rgba(0,255,204,0.8)] font-['Orbitron',sans-serif] tracking-widest uppercase">
          FMStar chanall
        </h1>
        <p className="mt-8 text-2xl text-[#00ffcc] tracking-widest font-mono drop-shadow-[0_0_10px_#00ffcc] animate-pulse">
          الإعلان الافتتاحي وبس ⚡
        </p>
      </div>

      <div className="absolute bottom-10 flex gap-4">
        <div className="w-3 h-3 bg-[#00ffcc] rounded-full animate-ping"></div>
        <div className="w-3 h-3 bg-purple-500 rounded-full animate-ping delay-100"></div>
        <div className="w-3 h-3 bg-[#00ffcc] rounded-full animate-ping delay-200"></div>
      </div>
    </div>
  );
}
