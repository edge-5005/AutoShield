import React, { useState, useEffect } from 'react';
import { Sparkles, ShieldCheck, Zap } from 'lucide-react';

/**
 * AutoShield Pro Animated Boot Screen
 * Runs a 3.0-second cinematic startup sequence animating the precision
 * Automotive Detailing & PPF Suite crest emblem, metallic typography,
 * and high-gloss ceramic initialization progress.
 */
export default function BootScreen({ onComplete, duration = 3000 }) {
  const [progress, setProgress] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const [statusText, setStatusText] = useState('INITIALIZING STUDIO OPERATING SYSTEM...');

  useEffect(() => {
    const startTime = Date.now();

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const currentPct = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(currentPct);

      if (currentPct < 28) {
        setStatusText('INITIALIZING AUTOSHIELD KERNEL...');
      } else if (currentPct < 60) {
        setStatusText('CALIBRATING 360° VEHICLE INSPECTION MATRIX...');
      } else if (currentPct < 88) {
        setStatusText('SYNCING SAC 9987 GST & BILLING ENGINE...');
      } else {
        setStatusText('AUTOSHIELD PRO ONLINE • WELCOME');
      }
    }, 40);

    const exitTimer = setTimeout(() => {
      setIsExiting(true);
      setProgress(100);
      setStatusText('AUTOSHIELD PRO ONLINE • WELCOME');
    }, duration);

    const completeTimer = setTimeout(() => {
      if (onComplete) onComplete();
    }, duration + 400);

    return () => {
      clearInterval(interval);
      clearTimeout(exitTimer);
      clearTimeout(completeTimer);
    };
  }, [duration, onComplete]);

  const handleSkip = () => {
    setIsExiting(true);
    setTimeout(() => {
      if (onComplete) onComplete();
    }, 200);
  };

  return (
    <div 
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-carbon-950 select-none overflow-hidden transition-all duration-500 ease-out ${
        isExiting ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
      style={{ backgroundColor: '#060709' }}
      aria-label="AutoShield Pro Startup Boot Screen"
    >
      {/* Background Radial Glow Aura */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center -z-10">
        <div className="w-[500px] h-[500px] sm:w-[700px] sm:h-[700px] bg-gradient-to-r from-amber-500/15 via-amber-600/10 to-transparent rounded-full blur-3xl animate-boot-aura"></div>
        <div className="absolute w-[300px] h-[300px] bg-cyan-500/10 rounded-full blur-2xl"></div>
      </div>

      {/* Subtle Grid Blueprint Matrix Pattern */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.035] -z-10"
        style={{
          backgroundImage: `radial-gradient(rgba(245, 158, 11, 0.4) 1px, transparent 1px)`,
          backgroundSize: '32px 32px'
        }}
      />

      {/* Skip Button in Top-Right Corner */}
      <button
        onClick={handleSkip}
        className="absolute top-5 right-6 px-3 py-1 rounded-full bg-carbon-900/80 hover:bg-carbon-800 text-[11px] font-bold text-slate-400 hover:text-amber-400 border border-carbon-800 backdrop-blur-md transition-all touch-press"
      >
        Skip Launch ➔
      </button>

      {/* Central Animated Logo Container */}
      <div className="relative flex flex-col items-center text-center px-6 max-w-lg mx-auto space-y-7">
        
        {/* Crest Shield Emblem & Logo Horizontal Layout */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
          
          {/* Animated Automotive Shield Crest */}
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 shrink-0 transition-transform duration-700 ease-out hover:scale-105">
            {/* Ambient Shield Rim Glow */}
            <div className="absolute inset-0 rounded-2xl bg-amber-500/20 blur-xl animate-boot-aura"></div>

            <svg 
              viewBox="0 0 100 100" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full relative z-10 drop-shadow-[0_4px_24px_rgba(245,158,11,0.45)]"
            >
              <defs>
                {/* Metallic Liquid Ceramic Gold Gradient */}
                <linearGradient id="bootGoldLiquid" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFFBEB" />
                  <stop offset="25%" stopColor="#FDE047" />
                  <stop offset="50%" stopColor="#F59E0B" />
                  <stop offset="85%" stopColor="#D97706" />
                  <stop offset="100%" stopColor="#78350F" />
                </linearGradient>

                {/* Titanium Carbon Shield Body */}
                <linearGradient id="bootCarbon" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#252B3A" />
                  <stop offset="50%" stopColor="#12151D" />
                  <stop offset="100%" stopColor="#07080B" />
                </linearGradient>

                {/* Hydrophobic Nano Neon Glow */}
                <linearGradient id="bootHydroNeon" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#38BDF8" />
                  <stop offset="50%" stopColor="#06B6D4" />
                  <stop offset="100%" stopColor="#2563EB" />
                </linearGradient>
              </defs>

              {/* Outer Hexagonal Automotive Shield Matrix */}
              <path 
                d="M50 4 L88 20 C88 56 68 84 50 96 C32 84 12 56 12 20 Z" 
                fill="url(#bootCarbon)" 
                stroke="url(#bootGoldLiquid)" 
                strokeWidth="4"
                strokeLinejoin="round"
              />

              {/* Inner Carbon Fiber Bevel */}
              <path 
                d="M50 12 L80 25 C80 52 64 76 50 86 C36 76 20 52 20 25 Z" 
                fill="#0A0C12" 
                stroke="#1E2330" 
                strokeWidth="1.8"
              />

              {/* Supercar Aerodynamic Roofline Arc */}
              <path 
                d="M28 48 C34 40 42 34 50 34 C58 34 66 40 72 48 L76 53 C76 53 66 51 50 51 C34 51 24 53 24 53 Z" 
                fill="url(#bootGoldLiquid)"
              />

              {/* Hydrophobic Nano-Ceramic Water Droplet with Pulse Glow */}
              <path 
                d="M50 42 C50 42 58 54 58 60 C58 64.5 54.5 68 50 68 C45.5 68 42 64.5 42 60 C42 54 50 42 50 42 Z" 
                fill="url(#bootHydroNeon)"
                className="animate-boot-droplet"
              />

              {/* Specular Starburst Diamond Glint (Rotating & Twinkling) */}
              <g className="animate-boot-glint">
                <polygon 
                  points="50,21 52.5,27 58.5,29.5 52.5,32 50,38 47.5,32 41.5,29.5 47.5,27" 
                  fill="#FFFFFF"
                />
                <circle cx="50" cy="29.5" r="1.5" fill="#FFFBEB" />
              </g>

              {/* Bottom Gold Precision Chevron Wings */}
              <path 
                d="M36 72 L50 82 L64 72" 
                stroke="url(#bootGoldLiquid)" 
                strokeWidth="3" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
              />
            </svg>
          </div>

          {/* Typography: AUTOSHIELD PRO & Subtitle */}
          <div className="flex flex-col items-center sm:items-start text-center sm:text-left space-y-1">
            <div className="relative inline-flex items-center gap-2.5 overflow-hidden py-1">
              
              {/* Brand Name Text: AUTO (Pure White) + SHIELD (Ceramic Gold) */}
              <span className="text-3xl sm:text-4xl font-black tracking-tight text-white font-sans">
                AUTO<span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500">SHIELD</span>
              </span>

              {/* Golden PRO Badge */}
              <span className="px-2.5 py-0.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 text-carbon-950 font-black text-xs sm:text-sm tracking-wide shadow-md shadow-amber-500/30">
                PRO
              </span>

              {/* Luxury Light Sweep Shimmer Beam across Logo */}
              <div 
                className="absolute inset-y-0 w-16 bg-gradient-to-r from-transparent via-white/35 to-transparent pointer-events-none animate-boot-gleam"
              />
            </div>

            {/* Tagline / Subtitle */}
            <p className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.26em] text-slate-400 font-mono">
              Automotive Detailing & PPF Suite
            </p>
          </div>
        </div>

        {/* 3-Second Precision Progress Initialization Bar */}
        <div className="w-full max-w-sm space-y-2.5 pt-2">
          {/* Status Label & Percentage Counter */}
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="text-amber-400 font-bold flex items-center gap-1.5 tracking-wider truncate">
              <Zap className="w-3 h-3 text-amber-400 animate-pulse shrink-0" />
              <span>{statusText}</span>
            </span>
            <span className="text-slate-300 font-black shrink-0 pl-2">
              {progress}%
            </span>
          </div>

          {/* Progress Bar Track */}
          <div className="relative w-full h-1.5 rounded-full bg-carbon-900 border border-carbon-800 overflow-hidden shadow-inner">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.8)] transition-all duration-75 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Micro Telemetry Badges */}
          <div className="flex items-center justify-between text-[9px] font-mono text-slate-500 uppercase tracking-widest pt-1">
            <span>Core v2.5 Online</span>
            <span>•</span>
            <span>9H Hydrophobic Core</span>
            <span>•</span>
            <span>Pan-India RTO</span>
          </div>
        </div>

      </div>
    </div>
  );
}
