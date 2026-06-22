'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ZenithSatellite } from '@/workers/orbitalWorker';
import { useRadarStore } from '@/store/useRadarStore';
import { Database, Activity, Calendar, Zap, Server } from 'lucide-react';

interface CosmicHistoryCardsProps {
  satellites: ZenithSatellite[];
}

export default function CosmicHistoryCards({ satellites }: CosmicHistoryCardsProps) {
  const { selectedObjectId } = useRadarStore();
  const selectedSat = satellites.find(s => s.id === selectedObjectId);

  if (!selectedSat) return null;

  // Generate deterministic "fake" historical data based on NORAD ID for the hackathon
  // In a real app, this would fetch from an API like space-track.org
  const launchYear = 1950 + (parseInt(selectedSat.id) % 74);
  const orbitalPeriod = 85 + (parseInt(selectedSat.id) % 40); // mins
  const velocity = 7.1 + ((parseInt(selectedSat.id) % 100) / 100); // km/s
  const lastPassOffset = -(parseInt(selectedSat.id) % 12); // hours ago

  const isDebris = selectedSat.type === 'DEBRIS' || selectedSat.type === 'ROCKET BODY';
  const themeColor = isDebris ? 'text-red-400' : 'text-cyan-400';
  const bgTheme = isDebris ? 'bg-red-500/10' : 'bg-cyan-500/10';

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="glass-panel hud-border rounded-2xl p-6 mt-6"
    >
      <div className="flex items-center space-x-3 mb-6">
        <div className={`p-2 rounded-lg ${bgTheme} ${themeColor}`}>
          <Database size={20} />
        </div>
        <h2 className="text-xl font-bold tracking-wider text-white">COSMIC HISTORY</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: Origin */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors">
          <div className="flex items-center text-xs text-white/50 mb-2 uppercase tracking-widest font-mono">
            <Calendar size={14} className="mr-2" /> Origin Record
          </div>
          <div className={`text-2xl font-black ${themeColor} font-mono glitch-text`}>
            EST. {launchYear}
          </div>
          <div className="text-xs text-white/40 mt-1">NORAD Registry Entry</div>
        </div>

        {/* Card 2: Kinetic Data */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors">
          <div className="flex items-center text-xs text-white/50 mb-2 uppercase tracking-widest font-mono">
            <Activity size={14} className="mr-2" /> Kinematics
          </div>
          <div className="flex justify-between items-end">
            <div>
              <div className={`text-2xl font-black ${themeColor} font-mono`}>
                {velocity.toFixed(2)}
              </div>
              <div className="text-xs text-white/40 mt-1">Velocity (km/s)</div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-white font-mono">{orbitalPeriod}m</div>
              <div className="text-xs text-white/40 mt-1">Orbital Period</div>
            </div>
          </div>
        </div>

        {/* Card 3: System Status */}
        <div className="md:col-span-2 bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center text-xs text-white/50 uppercase tracking-widest font-mono">
              <Server size={14} className="mr-2" /> Telemetry Status
            </div>
            <div className={`text-xs px-2 py-1 rounded bg-white/10 font-mono ${isDebris ? 'text-red-400' : 'text-green-400'}`}>
              {isDebris ? 'INACTIVE / DECAYING' : 'ACTIVE / NOMINAL'}
            </div>
          </div>
          
          {/* Faux Data Stream */}
          <div className="h-12 overflow-hidden relative opacity-50">
            <motion.div
              animate={{ y: [0, -100] }}
              transition={{ repeat: Infinity, duration: 5, ease: "linear" }}
              className="text-[10px] font-mono text-cyan-500/70 leading-relaxed"
            >
              {[...Array(10)].map((_, i) => (
                <div key={i}>
                  {Math.random().toString(36).substring(2, 15).toUpperCase()} - 
                  {Math.random().toString(16).substring(2, 8).toUpperCase()} -
                  OK
                </div>
              ))}
            </motion.div>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#1a1a1a]" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
