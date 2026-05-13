import React from 'react';

export default function FloatingGold() {
  return (
    <div className="flex flex-col items-center text-[#ffd700] drop-shadow-[0_0_10px_#ffcc00] animate-[floatUpDown_4s_ease-in-out_infinite]">
      <div className="w-[130px] h-[130px] border-[3px] border-[#ffd700] rounded-full flex justify-center items-center shadow-[0_0_25px_#ffcc00,inset_0_0_50px_#ffcc00] animate-[pulseGlow_3s_infinite_ease-in-out]">
        <div className="text-[70px] text-[#ffd700] drop-shadow-[0_0_15px_#ffcc00]">⚡</div>
      </div>
      <h2 className="mt-[15px] font-bold tracking-[2px] text-[#ffcc00] uppercase font-['Orbitron',sans-serif]">GOD MODE</h2>
    </div>
  );
}
