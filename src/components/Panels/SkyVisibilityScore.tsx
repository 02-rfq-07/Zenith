'use client';

import React, { useEffect, useState } from 'react';
import { useRadarStore } from '@/store/useRadarStore';
import { Cloud, Star } from 'lucide-react';
import { fetchSkyVisibility } from '@/services/api';
import { motion } from 'framer-motion';

export default function SkyVisibilityScore() {
  const { latitude, longitude } = useRadarStore();
  const [cloudCover, setCloudCover] = useState<number | null>(null);

  useEffect(() => {
    if (latitude !== 0 && longitude !== 0) {
      fetchSkyVisibility(latitude, longitude).then(setCloudCover);
    }
  }, [latitude, longitude]);

  const getBortle = (clouds: number | null) => {
    if (clouds === null) return '-';
    if (clouds < 10) return '1';
    if (clouds < 30) return '3';
    if (clouds < 60) return '5';
    if (clouds < 85) return '7';
    return '9';
  };

  const bortle = getBortle(cloudCover);

  return (
    <div className="glass-panel hud-border p-6 flex flex-col justify-between h-full min-h-[200px] relative">
      <div className="flex items-center space-x-3 mb-4 relative z-10">
        <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.2)]">
          <Star size={20} />
        </div>
        <h2 className="text-xl font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-500 uppercase">
          Sky Condition
        </h2>
      </div>

      <div className="flex-1 grid grid-cols-2 gap-4 relative z-10">
        <div className="flex flex-col items-center justify-center p-4 bg-white/5 rounded-xl border border-white/10 shadow-inner relative overflow-hidden group">
          <motion.div 
            key={cloudCover}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-black text-white mb-1 font-mono tracking-tighter"
          >
            {cloudCover !== null ? `${cloudCover}%` : '--'}
          </motion.div>
          <div className="text-[10px] text-white/50 font-mono uppercase tracking-widest flex items-center">
            <Cloud size={10} className="mr-1 text-blue-400" /> Cloud Cover
          </div>
          
          {/* Progress bar background */}
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${cloudCover || 0}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-blue-600 to-cyan-400" 
          />
        </div>

        <div className="flex flex-col items-center justify-center p-4 bg-white/5 rounded-xl border border-white/10 shadow-inner">
          <motion.div 
            key={bortle}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-br from-purple-400 to-blue-500 mb-1 font-mono"
          >
            {bortle}
          </motion.div>
          <div className="text-[10px] text-white/50 font-mono uppercase tracking-widest">
            Bortle Class
          </div>
        </div>
      </div>
    </div>
  );
}
