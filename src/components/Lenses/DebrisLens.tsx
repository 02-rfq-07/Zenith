'use client';

import React from 'react';
import { useRadarStore } from '@/store/useRadarStore';
import { AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DebrisLens() {
  const { showDebris, toggleDebris } = useRadarStore();

  return (
    <div className="glass-panel hud-border p-6 flex items-center justify-between">
      <div className="flex items-center space-x-4 relative z-10">
        <div className={`p-2 rounded-lg transition-all duration-500 shadow-lg ${showDebris ? 'bg-red-500/20 text-red-400 shadow-red-500/20' : 'bg-white/5 text-white/40'}`}>
          <AlertTriangle size={20} className={showDebris ? 'animate-pulse' : ''} />
        </div>
        <div>
          <h2 className="text-base font-bold tracking-widest uppercase text-white">Debris Lens</h2>
          <p className="text-[10px] text-cyan-400/50 font-mono uppercase tracking-widest mt-1">
            {showDebris ? 'HAZARDS VISIBLE' : 'FILTERING CLUTTER'}
          </p>
        </div>
      </div>

      <button 
        onClick={toggleDebris}
        className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors duration-300 focus:outline-none border border-white/10 z-10 ${showDebris ? 'bg-red-500/30' : 'bg-black/50'}`}
      >
        <span className="sr-only">Toggle Debris</span>
        <motion.span
          layout
          className={`inline-flex items-center justify-center h-6 w-6 transform rounded-full shadow-lg transition-transform ${showDebris ? 'translate-x-9 bg-red-400' : 'translate-x-1 bg-white/50'}`}
        >
           {showDebris && <div className="w-2 h-2 bg-white rounded-full animate-ping" />}
        </motion.span>
      </button>
    </div>
  );
}
