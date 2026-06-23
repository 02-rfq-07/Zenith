'use client';

import React from 'react';
import { ZenithSatellite } from '@/workers/orbitalWorker';
import { useRadarStore } from '@/store/useRadarStore';

interface LiveZenithRadarProps {
  satellites: ZenithSatellite[];
}

export default function LiveZenithRadar({ satellites }: LiveZenithRadarProps) {
  const { selectedObjectId, setSelectedObject, latitude, longitude, timeOffset, showDebris, showConstellations } = useRadarStore();

  const filteredSatellites = satellites.filter((sat) => {
    const isDeb = sat.type === 'DEBRIS' || sat.type === 'ROCKET BODY';
    if (showDebris) return true; // Show both payloads and debris
    return !isDeb; // Show only payloads
  });

  return (
    <div className="relative w-full max-w-[550px] aspect-square flex items-center justify-center p-4 mx-auto">
      {/* Decorative Outer Rings and Grids */}
      <div className="absolute inset-0 pointer-events-none rounded-full border-[1px] border-[var(--theme-500)]/20 border-dashed animate-[spin_60s_linear_infinite]" />
      <div className="absolute inset-4 pointer-events-none rounded-full border-[1px] border-[var(--theme-400)]/10" />
      <div className="absolute inset-8 pointer-events-none rounded-full border-t border-[var(--theme-300)]/30 animate-[spin_20s_linear_infinite_reverse]" />
      
      {/* Sci-fi data streams on corners */}
      <div className="absolute top-2 left-2 text-[8px] text-[var(--theme-400)]/40 font-mono text-left leading-tight hidden md:block z-40 pointer-events-none">
         [SYS.OP.01] NORMAL<br/>
         AZ_OFFSET: {(Math.random() * 0.5).toFixed(4)}<br/>
         EL_REF: {(Math.random() * 90).toFixed(4)}
      </div>
      <div className="absolute bottom-2 right-2 text-[8px] text-[var(--theme-400)]/40 font-mono text-right leading-tight hidden md:block z-40 pointer-events-none">
         T_OFFSET: {timeOffset}s<br/>
         ORBIT_SYNC: OK<br/>
         LAT: {latitude.toFixed(2)}
      </div>

      <div className="relative w-full h-full rounded-full border border-[var(--theme-500)]/40 bg-black/60 shadow-[0_0_80px_rgba(var(--theme-rgb),0.15)] overflow-hidden flex items-center justify-center p-4 backdrop-blur-md">
        {/* Outer Glow Ring */}
        <div className="absolute inset-2 rounded-full border border-[var(--theme-500)]/20 shadow-[inset_0_0_50px_rgba(var(--theme-rgb),0.1)]" />

        {/* Radar Grid Circles */}
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="absolute rounded-full border border-[var(--theme-500)]/20"
            style={{ width: `${i * 20}%`, height: `${i * 20}%` }}
          >
            {/* Degree markers on outer ring */}
            {i === 5 && [0, 90, 180, 270].map(deg => (
               <div key={deg} className="absolute w-full h-full flex justify-center" style={{ transform: `rotate(${deg}deg)` }}>
                  <div className="w-1 h-3 bg-[var(--theme-500)]/50 -mt-1.5" />
               </div>
            ))}
          </div>
        ))}

        {/* Crosshairs */}
        <div className="absolute w-full h-px bg-[var(--theme-500)]/30" />
        <div className="absolute h-full w-px bg-[var(--theme-500)]/30" />

        {/* Constellations Overlay */}
        {showConstellations && (
          <svg 
            className="absolute inset-0 w-full h-full pointer-events-none z-10 opacity-40 transition-transform duration-1000 ease-in-out"
            style={{ transform: `rotate(${longitude}deg) translateY(${-(latitude / 90) * 20}%)` }}
          >
            <g className="animate-[spin_240s_linear_infinite]" style={{ transformOrigin: 'center' }}>
              <path d="M 60 90 L 105 75 L 120 120 L 90 150 Z" fill="none" stroke="#a855f7" strokeWidth="1" strokeDasharray="4 4" />
              <circle cx="60" cy="90" r="2" fill="#a855f7" />
              <circle cx="105" cy="75" r="2" fill="#a855f7" />
              <circle cx="120" cy="120" r="2" fill="#a855f7" />
              <circle cx="90" cy="150" r="2" fill="#a855f7" />
              <text x="105" y="65" fill="#a855f7" fontSize="10" fontFamily="monospace">ORION</text>

              <path d="M 210 180 L 240 150 L 255 195 L 225 225 L 195 210" fill="none" stroke="#a855f7" strokeWidth="1" strokeDasharray="4 4" />
              <circle cx="210" cy="180" r="2" fill="#a855f7" />
              <circle cx="240" cy="150" r="2" fill="#a855f7" />
              <circle cx="255" cy="195" r="2" fill="#a855f7" />
              <circle cx="225" cy="225" r="2" fill="#a855f7" />
              <circle cx="195" cy="210" r="2" fill="#a855f7" />
              <text x="245" y="140" fill="#a855f7" fontSize="10" fontFamily="monospace">URSA MAJOR</text>

              <path d="M 150 240 L 180 255 L 165 285" fill="none" stroke="#a855f7" strokeWidth="1" strokeDasharray="4 4" />
              <circle cx="150" cy="240" r="2" fill="#a855f7" />
              <circle cx="180" cy="255" r="2" fill="#a855f7" />
              <circle cx="165" cy="285" r="2" fill="#a855f7" />
              <text x="185" y="260" fill="#a855f7" fontSize="10" fontFamily="monospace">CASSIOPEIA</text>
              
              <path d="M 250 50 L 280 80 L 300 60 L 270 40 Z" fill="none" stroke="#a855f7" strokeWidth="1" strokeDasharray="4 4" />
              <circle cx="250" cy="50" r="2" fill="#a855f7" />
              <circle cx="280" cy="80" r="2" fill="#a855f7" />
              <circle cx="300" cy="60" r="2" fill="#a855f7" />
              <circle cx="270" cy="40" r="2" fill="#a855f7" />
              <text x="285" y="30" fill="#a855f7" fontSize="10" fontFamily="monospace">CYGNUS</text>
            </g>
          </svg>
        )}

        {/* Center observer point */}
        <div className="absolute w-3 h-3 rounded-full bg-[var(--theme-300)] z-20 shadow-[0_0_15px_var(--theme-300)]">
          <div className="absolute inset-0 rounded-full bg-[var(--theme-300)] animate-ping" />
        </div>

        {/* Sweeper Cone (CSS Animation) */}
        <div className="absolute inset-0 radar-sweep-cone z-10 pointer-events-none" />

        {/* Satellites */}
        {filteredSatellites.map((sat) => {
          // Elevation 90 is center (radius 0), Elevation 0 is edge (radius 50%)
          const maxRadius = 50; 
          const normalizedRadius = ((90 - sat.elevation) / 90) * maxRadius;
          
          // Convert azimuth (degrees) and radius (%) to left/top (%)
          const rad = (sat.azimuth - 90) * (Math.PI / 180);
          const x = 50 + normalizedRadius * Math.cos(rad);
          const y = 50 + normalizedRadius * Math.sin(rad);

          const isSelected = selectedObjectId === sat.id;
          const isDebris = sat.type === 'DEBRIS' || sat.type === 'ROCKET BODY';
          const colorClass = isDebris ? 'bg-red-500' : 'bg-[var(--theme-400)]';
          const shadowClass = isDebris ? 'shadow-[0_0_15px_red]' : 'shadow-[0_0_15px_rgba(var(--theme-rgb),1)]';

          return (
            <button
              key={sat.id}
              onClick={() => setSelectedObject(sat.id)}
              className={`absolute flex items-center justify-center w-6 h-6 -ml-3 -mt-3 z-50 group cursor-crosshair`}
              style={{
                left: `${x}%`,
                top: `${y}%`,
              }}
            >
              {/* The actual dot */}
              <div className={`w-2.5 h-2.5 rounded-full ${colorClass} ${shadowClass} group-hover:scale-150 transition-transform`} />
              
              {/* Tooltip for hover */}
              <div className="absolute bottom-full mb-2 hidden group-hover:block bg-black/80 border border-[var(--theme-500)]/50 px-2 py-1 rounded text-[10px] text-white whitespace-nowrap pointer-events-none">
                {sat.name}
              </div>
              
              {/* Selection Ring */}
              {isSelected && (
                <div className="absolute inset-0 rounded-full border border-white animate-[spin_3s_linear_infinite]" />
              )}
            </button>
          );
        })}
      </div>
      
      {/* Decorative Corner Borders */}
      <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[var(--theme-500)]/50 rounded-tl-xl pointer-events-none" />
      <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[var(--theme-500)]/50 rounded-tr-xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[var(--theme-500)]/50 rounded-bl-xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[var(--theme-500)]/50 rounded-br-xl pointer-events-none" />
    </div>
  );
}
