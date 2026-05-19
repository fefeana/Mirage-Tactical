import React from 'react';

interface Props {
  online?: boolean;
  signalStrength?: 'strong' | 'weak';
  size?: number;
  ariaLabel?: string;
}

export default function FloatingGold({ online = true, signalStrength = 'strong', size = 150, ariaLabel = "GOD MODE Active" }: Props) {
  const dynamicSize = `${size}px`;
  const iconSize = `${size * 0.55}px`;

  return (
    <div className="flex flex-col items-center text-[#ffd700] drop-shadow-[0_0_10px_#ffcc00] animate-[floatUpDown_4s_ease-in-out_infinite]" aria-label={ariaLabel}>
      <div 
        style={{ width: dynamicSize, height: dynamicSize }}
        className={`border-[3px] border-[#ffd700] rounded-full flex justify-center items-center ${online ? 'shadow-[0_0_25px_#ffcc00,inset_0_0_50px_#ffcc00] animate-[pulseGlow_3s_infinite_ease-in-out]' : 'shadow-[0_0_10px_#ffcc00] opacity-50'}`}
      >
        <div style={{ fontSize: iconSize }} className="text-[#ffd700] drop-shadow-[0_0_15px_#ffcc00]">
          {online ? '⚡' : '⛔'}
        </div>
      </div>
      <h2 className="mt-[15px] font-bold tracking-[2px] text-[#ffcc00] uppercase font-['Orbitron',sans-serif]">
        {ariaLabel.replace(' Active', '')}
      </h2>
    </div>
  );
}
