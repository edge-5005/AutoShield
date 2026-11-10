import React from 'react';

export default function AutoShieldLogo({ size = 40, showText = true, className = '', textClassName = '' }) {
  const iconSize = size;
  
  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* Precision Automotive Crest Emblem */}
      <div 
        className="relative flex items-center justify-center shrink-0 transition-transform duration-300 hover:scale-105"
        style={{ width: iconSize, height: iconSize }}
      >
        <svg 
          viewBox="0 0 100 100" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-[0_4px_16px_rgba(245,158,11,0.35)]"
        >
          <defs>
            {/* Metallic Liquid Ceramic Gold Gradient */}
            <linearGradient id="goldLiquid" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFBEB" />
              <stop offset="25%" stopColor="#FDE047" />
              <stop offset="50%" stopColor="#F59E0B" />
              <stop offset="85%" stopColor="#D97706" />
              <stop offset="100%" stopColor="#78350F" />
            </linearGradient>

            {/* Specular Carbon Frame Gradient */}
            <linearGradient id="carbonTitanium" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#2D3446" />
              <stop offset="50%" stopColor="#151822" />
              <stop offset="100%" stopColor="#07080B" />
            </linearGradient>

            {/* Hydrophobic Cyan Neon Glow */}
            <linearGradient id="hydroNeon" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#06B6D4" />
              <stop offset="100%" stopColor="#3B82F6" />
            </linearGradient>

            {/* Specular Top Rim Reflection */}
            <linearGradient id="specularRim" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#F59E0B" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </linearGradient>

            {/* Subtle Drop Shadow */}
            <filter id="crestGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#F59E0B" floodOpacity="0.4" />
            </filter>
          </defs>

          {/* Outer Hexagonal Shield Matrix (Aerodynamic Automotive Crest) */}
          <path 
            d="M50 4 L88 20 C88 56 68 84 50 96 C32 84 12 56 12 20 Z" 
            fill="url(#carbonTitanium)" 
            stroke="url(#goldLiquid)" 
            strokeWidth="3.5"
            strokeLinejoin="round"
          />

          {/* Inner Inverted Carbon Fiber Bevel */}
          <path 
            d="M50 12 L80 25 C80 52 64 76 50 86 C36 76 20 52 20 25 Z" 
            fill="#0A0C12" 
            stroke="#1F2432" 
            strokeWidth="1.5"
          />

          {/* Dynamic Aerodynamic Car Silhouette (Stylized Supercar Roofline & Hood) */}
          <path 
            d="M28 48 C34 40 42 34 50 34 C58 34 66 40 72 48 L76 53 C76 53 66 51 50 51 C34 51 24 53 24 53 Z" 
            fill="url(#goldLiquid)"
          />

          {/* Hydrophobic Nano-Droplet / Diamond Paint Protection Core */}
          <path 
            d="M50 42 C50 42 58 54 58 60 C58 64.5 54.5 68 50 68 C45.5 68 42 64.5 42 60 C42 54 50 42 50 42 Z" 
            fill="url(#hydroNeon)"
            opacity="0.95"
          />

          {/* Specular Starburst / Glint Reflection (Mirror Gloss) */}
          <polygon 
            points="50,22 52,28 58,30 52,32 50,38 48,32 42,30 48,28" 
            fill="#FFFFFF"
            opacity="0.9"
          />
          <circle cx="50" cy="30" r="1.5" fill="#FFFBEB" />

          {/* Bottom Precision Accent Wings */}
          <path 
            d="M36 72 L50 82 L64 72" 
            stroke="url(#goldLiquid)" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />
        </svg>

        {/* Ambient Pulsing Nano-Glow Halo */}
        <div className="absolute inset-0 rounded-full bg-amber-500/10 blur-xl pointer-events-none -z-10 animate-pulse"></div>
      </div>

      {/* Brand Typography */}
      {showText && (
        <div className={`flex flex-col leading-none ${textClassName}`}>
          <div className="flex items-center gap-1.5">
            <span className="font-black text-white tracking-tight text-lg sm:text-xl font-sans uppercase">
              Auto<span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500">Shield</span>
            </span>
            <span className="text-[10px] uppercase font-mono font-black tracking-widest px-1.5 py-0.5 rounded bg-gradient-to-r from-amber-500 to-amber-600 text-carbon-950 shadow-sm">
              PRO
            </span>
          </div>
          <span className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase mt-1">
            Automotive Detailing & PPF Suite
          </span>
        </div>
      )}
    </div>
  );
}
