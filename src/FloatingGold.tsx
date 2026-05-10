import React from 'react';
import { motion } from 'motion/react';

interface FloatingGoldProps {
  online?: boolean;
  size?: number;
  className?: string;
  ariaLabel?: string;
  signalStrength?: 'weak' | 'strong' | 'none';
}

export default function FloatingGold({ online = true, size = 128, className = '', ariaLabel, signalStrength = online ? 'strong' : 'weak' }: FloatingGoldProps) {
  const stateClass = online ? 'online' : 'offline';
  const sizeClass = size <= 72 ? 'small' : (size >= 160 ? 'large' : '');
  const style = { width: size + 'px', height: size + 'px' };
  const label = ariaLabel || (online ? 'God Mode: Active' : 'Offline');

  // قوة التوهج تعتمد على إشارة الستالايت (ضعيفة = خافت، قوية = مشع)
  const glowIntensity = signalStrength === 'weak' ? '0 0 15px #FFD700' : '0 0 40px #FFD700';

  return (
    <div
      className={`floating-wrapper ${stateClass} ${sizeClass} ${className} relative`}
      style={style}
      role="status"
      aria-label={label}
    >
      {online && (
        <div className="absolute inset-0 pointer-events-none overflow-visible z-0" style={{ transform: 'scale(1.2)' }}>
          {/* جزيئات الذهب العائمة */}
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute bg-gradient-to-tr from-yellow-400 to-yellow-700 rounded-full"
              style={{
                width: Math.random() * 6 + 'px',
                height: Math.random() * 6 + 'px',
                boxShadow: '0 0 10px #FFD700',
                left: Math.random() * 100 + '%',
                top: Math.random() * 100 + '%',
              }}
              animate={{
                y: [0, -100, 0],
                opacity: [0, 0.8, 0],
                scale: [0.5, 1.2, 0.5],
              }}
              transition={{
                duration: Math.random() * 5 + 5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: Math.random() * 5
              }}
            />
          ))}
          
          {/* هالة الذهب المركزية حول زر النظام */}
          <motion.div
            animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 3, repeat: Infinity }}
            style={{
              boxShadow: glowIntensity,
              border: '1px solid rgba(255, 215, 0, 0.3)',
              width: size * 1.5,
              height: size * 1.5
            }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full blur-2xl"
          />
        </div>
      )}

      {/* رسمة الصاعقة الذهبية برمجياً لضمان نفس الشكل */}
      <svg className="relative z-10 w-full h-full" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="45" stroke="#FFD700" strokeWidth="2" strokeDasharray="5 5" />
        <path 
          d="M55 10L30 55H50L45 90L70 45H50L55 10Z" 
          fill={online ? "url(#goldGradient)" : "#444"} 
          stroke="#FFD700" 
          strokeWidth="1"
        />
        <defs>
          <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFF9C4" />
            <stop offset="50%" stopColor="#FFD700" />
            <stop offset="100%" stopColor="#FFA000" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
