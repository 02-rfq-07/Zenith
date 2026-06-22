'use client';

import React from 'react';
import { useRadarStore } from '@/store/useRadarStore';
import { Clock, Rewind, FastForward } from 'lucide-react';

export default function ZenithTimeMachine() {
  const { timeOffset, setTimeOffset } = useRadarStore();

  const handleReset = () => setTimeOffset(0);

  const formatOffset = (mins: number) => {
    if (mins === 0) return 'T-ZERO (LIVE)';
    const sign = mins > 0 ? '+' : '-';
    const abs = Math.abs(mins);
    const h = Math.floor(abs / 60);
    const m = abs % 60;
    return `T${sign}${h}h ${m}m`;
  };

  return (
    <div className="glass-panel hud-border rounded-2xl p-6 relative">
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.2)]">
            <Clock size={20} />
          </div>
          <h2 className="text-xl font-bold tracking-widest uppercase text-transparent bg-clip-text bg-gradient-to-r from-white to-purple-500">
            Temporal Shift
          </h2>
        </div>
        <div className="text-right">
          <span className={`text-lg font-mono font-black tracking-widest ${timeOffset === 0 ? 'text-cyan-400' : 'text-purple-400'}`}>
            {formatOffset(timeOffset)}
          </span>
        </div>
      </div>

      <div className="flex items-center space-x-4 relative z-10 bg-white/5 p-3 rounded-xl border border-white/10">
        <button onClick={() => setTimeOffset(Math.max(-1440, timeOffset - 60))} className="p-2 hover:bg-white/10 rounded-lg text-white/50 hover:text-white transition-colors">
          <Rewind size={16} />
        </button>
        
        <div className="relative flex-1 flex items-center">
          <input
            type="range"
            min="-1440"
            max="1440"
            value={timeOffset}
            onChange={(e) => setTimeOffset(parseInt(e.target.value))}
            className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-purple-500 hover:accent-purple-400 transition-all"
            style={{ WebkitAppearance: 'none' }}
          />
        </div>
        
        <button onClick={() => setTimeOffset(Math.min(1440, timeOffset + 60))} className="p-2 hover:bg-white/10 rounded-lg text-white/50 hover:text-white transition-colors">
          <FastForward size={16} />
        </button>
      </div>

      {timeOffset !== 0 && (
        <div className="mt-4 text-center relative z-10">
          <button onClick={handleReset} className="text-[10px] text-purple-400 hover:text-white uppercase tracking-widest font-mono px-4 py-1.5 border border-purple-500/30 rounded-full bg-purple-500/10 hover:bg-purple-500/30 transition-colors">
            Resynchronize to Present
          </button>
        </div>
      )}
    </div>
  );
}
