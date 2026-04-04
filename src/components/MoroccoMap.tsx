import React from 'react';
import { motion } from 'framer-motion';

export const MoroccoMap = ({ activeCity }: { activeCity?: string }) => {
  // Simplified SVG representation of Morocco for the dashboard
  return (
    <div className="relative w-full h-full min-h-[400px] flex items-center justify-center bg-slate-50/50 rounded-3xl border border-white/40 overflow-hidden shadow-inner">
      {/* Neural Links Background */}
      <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
        <path d="M100 100 Q 200 50 300 150 T 500 200" fill="none" stroke="var(--color-majorelle)" strokeWidth="2" className="neural-link" />
        <path d="M150 300 Q 250 250 350 350 T 550 400" fill="none" stroke="var(--color-saffron)" strokeWidth="2" className="neural-link" style={{ animationDelay: '2s' }} />
        <path d="M50 200 Q 150 300 250 200 T 450 100" fill="none" stroke="var(--color-majorelle)" strokeWidth="2" className="neural-link" style={{ animationDelay: '4s' }} />
      </svg>

      {/* Simplified Map Shape */}
      <svg viewBox="0 0 400 500" className="w-full max-w-md h-auto drop-shadow-2xl z-10">
        <path 
          d="M200 50 L250 80 L280 150 L260 250 L200 350 L150 450 L100 400 L120 300 L80 200 L120 100 Z" 
          fill="white" 
          stroke="var(--color-majorelle)" 
          strokeWidth="2"
          className="opacity-90"
        />
        
        {/* Data Nodes (Cities) */}
        <g>
          {/* Tanger */}
          <circle cx="200" cy="50" r="6" fill={activeCity === 'tanger' ? 'var(--color-saffron)' : 'var(--color-majorelle)'} className={activeCity === 'tanger' ? 'pulse-glow' : ''} />
          <text x="215" y="55" fontSize="12" fontWeight="bold" fill="var(--color-majorelle-dark)">Tanger</text>

          {/* Rabat */}
          <circle cx="220" cy="120" r="8" fill={activeCity === 'rabat' ? 'var(--color-saffron)' : 'var(--color-majorelle)'} className={activeCity === 'rabat' ? 'pulse-glow' : ''} />
          <text x="235" y="125" fontSize="12" fontWeight="bold" fill="var(--color-majorelle-dark)">Rabat</text>

          {/* Casablanca */}
          <circle cx="200" cy="150" r="10" fill={activeCity === 'casablanca' ? 'var(--color-saffron)' : 'var(--color-majorelle)'} className={activeCity === 'casablanca' ? 'pulse-glow' : ''} />
          <text x="220" y="155" fontSize="12" fontWeight="bold" fill="var(--color-majorelle-dark)">Casablanca</text>

          {/* Marrakech */}
          <circle cx="150" cy="250" r="8" fill={activeCity === 'marrakech' ? 'var(--color-saffron)' : 'var(--color-majorelle)'} className={activeCity === 'marrakech' ? 'pulse-glow' : ''} />
          <text x="165" y="255" fontSize="12" fontWeight="bold" fill="var(--color-majorelle-dark)">Marrakech</text>

          {/* Agadir */}
          <circle cx="120" cy="320" r="6" fill={activeCity === 'agadir' ? 'var(--color-saffron)' : 'var(--color-majorelle)'} className={activeCity === 'agadir' ? 'pulse-glow' : ''} />
          <text x="135" y="325" fontSize="12" fontWeight="bold" fill="var(--color-majorelle-dark)">Agadir</text>
        </g>
      </svg>

      {/* Floating Particles */}
      <motion.div 
        animate={{ y: [0, -20, 0], opacity: [0, 1, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 left-1/4 w-2 h-2 bg-[var(--color-majorelle)] rounded-full blur-[1px]"
      />
      <motion.div 
        animate={{ y: [0, -30, 0], opacity: [0, 1, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute top-1/2 right-1/4 w-3 h-3 bg-[var(--color-saffron)] rounded-full blur-[2px]"
      />
    </div>
  );
};
