'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Compass } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function GlobalPreviewPanel() {
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    // Show popup every 1 minute
    const interval = setInterval(() => {
      setShowPopup(true);
      // Hide after 8 seconds
      setTimeout(() => setShowPopup(false), 8000);
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass-panel hud-border p-4 rounded-2xl flex flex-col z-10 relative !overflow-visible h-[200px]">
      
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-[var(--theme-400)] font-mono tracking-widest uppercase text-xs font-bold flex items-center">
          <Compass size={14} className="mr-2" /> Solar System Preview
        </h2>
      </div>

      <div className="relative flex-1 rounded-xl overflow-hidden border border-[var(--theme-500)]/20 bg-black flex items-center justify-center">
        {/* Reminder Popup */}
        <AnimatePresence>
          {showPopup && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute top-3 left-1/2 -translate-x-1/2 w-11/12 max-w-[220px] bg-cyan-950/90 border border-cyan-500/50 text-cyan-200 p-2 rounded-lg text-[10px] font-mono shadow-[0_0_15px_rgba(6,182,212,0.4)] z-50 text-center pointer-events-none backdrop-blur-sm"
            >
              <strong>Tip:</strong> Click below to explore the interactive 3D Solar System Tracking Matrix!
            </motion.div>
          )}
        </AnimatePresence>

        {/* Fake Starfield Background */}
        <div className="absolute inset-0 opacity-50" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
        
        {/* Fake Sun and Planets */}
        <div className="absolute w-16 h-16 bg-yellow-500 rounded-full blur-[2px] shadow-[0_0_50px_yellow]" style={{ left: '-10px', top: '50%', transform: 'translateY(-50%)' }} />
        <div className="absolute w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_10px_blue]" style={{ left: '40%', top: '40%' }} />
        <div className="absolute w-1.5 h-1.5 bg-red-500 rounded-full shadow-[0_0_10px_red]" style={{ left: '60%', top: '60%' }} />
        <div className="absolute w-4 h-4 bg-orange-300 rounded-full shadow-[0_0_15px_orange]" style={{ left: '80%', top: '30%' }}>
            <div className="absolute top-1/2 left-1/2 w-8 h-1 border-t-2 border-b-2 border-orange-500/50 rounded-[50%] -translate-x-1/2 -translate-y-1/2 transform -rotate-12" />
        </div>

        <Link href="/solar-system" className="relative z-10 bg-black/80 backdrop-blur-md px-6 py-3 rounded-full border border-[var(--theme-500)]/50 flex items-center space-x-3 text-white hover:bg-[var(--theme-500)]/20 transition-all shadow-[0_0_20px_rgba(var(--theme-rgb),0.5)] group">
          <div className="w-3 h-3 bg-[var(--theme-400)] rounded-full animate-ping group-hover:scale-150 transition-all" />
          <span className="font-mono uppercase tracking-widest text-xs font-bold text-[var(--theme-400)] whitespace-nowrap">Enter Tracking Matrix</span>
        </Link>
      </div>
    </div>
  );
}
