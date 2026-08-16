import React from 'react';

const BrandLogo = ({ size = 'md', showSubtitle = true, animated = true }) => {
  const sizeMap = {
    sm: { box: 'w-8 h-8', icon: 'w-4 h-4', text: 'text-sm', sub: 'text-[8px]' },
    md: { box: 'w-10 h-10', icon: 'w-5 h-5', text: 'text-base', sub: 'text-[9px]' },
    lg: { box: 'w-12 h-12', icon: 'w-6 h-6', text: 'text-xl', sub: 'text-[10px]' }
  };

  const s = sizeMap[size] || sizeMap.md;

  return (
    <div className="flex items-center space-x-3 group cursor-pointer select-none">
      
      {/* Dynamic Gradient Badge Icon */}
      <div className="relative">
        <div className={`${s.box} rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 p-[1.5px] shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/35 group-hover:scale-105 transition-all duration-300`}>
          <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center relative overflow-hidden">
            
            {/* Ambient Background Gradient Aura */}
            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 to-cyan-500/20 opacity-70 group-hover:opacity-100 transition-opacity"></div>

            {/* Custom SVG Transit Telematics Emblem */}
            <svg
              className={`${s.icon} text-emerald-400 relative z-10 transform group-hover:translate-x-0.5 transition-transform duration-300`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {/* Bus Silhouette & Aerodynamic Curve */}
              <path d="M4 6c0-1.1.9-2 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6z" />
              <path d="M4 11h16" />
              <path d="M9 4v7" />
              <path d="M15 4v7" />
              {/* Headlights / Wheels */}
              <circle cx="7.5" cy="15.5" r="1.5" fill="currentColor" />
              <circle cx="16.5" cy="15.5" r="1.5" fill="currentColor" />
              {/* Front bumper speedline */}
              <path d="M7 18h10" />
            </svg>
          </div>
        </div>

        {/* Pulsing RTK GPS Telemetry Dot */}
        {animated && (
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-white dark:border-slate-950"></span>
          </span>
        )}
      </div>

      {/* Typography & System Label */}
      <div>
        <div className="flex items-center space-x-1.5 leading-tight">
          <span className={`font-extrabold tracking-tight text-slate-900 dark:text-white ${s.text}`}>
            Smart<span className="bg-gradient-to-r from-emerald-500 to-cyan-500 bg-clip-text text-transparent">Transit</span>
          </span>
          <span className="px-1.5 py-0.5 text-[8px] font-mono font-bold tracking-wider uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-md shadow-2xs">
            LIVE
          </span>
        </div>
        {showSubtitle && (
          <span className={`${s.sub} text-slate-500 dark:text-slate-400 font-mono tracking-widest uppercase block -mt-0.5 font-semibold`}>
            Guardian Fleet AI
          </span>
        )}
      </div>

    </div>
  );
};

export default BrandLogo;