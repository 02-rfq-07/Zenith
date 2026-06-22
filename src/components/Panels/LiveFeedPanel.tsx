'use client';

import React from 'react';
import { Video } from 'lucide-react';

export default function LiveFeedPanel() {
  return (
    <div className="glass-panel hud-border p-6 mt-6 rounded-2xl relative overflow-hidden">
      <div className="flex items-center space-x-3 mb-4 relative z-10">
        <div className="p-2 bg-orange-500/20 rounded-lg text-orange-400 shadow-[0_0_10px_rgba(249,115,22,0.2)]">
          <Video size={20} />
        </div>
        <h2 className="text-xl font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white to-orange-500 uppercase">
          Live Orbital Feed
        </h2>
        <div className="ml-auto flex items-center space-x-2">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_red]" />
            <span className="text-[10px] text-red-400 font-mono tracking-widest uppercase">REC</span>
        </div>
      </div>

      <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-white/10 bg-black/50 z-10 shadow-inner">
        {/* Official NASA ISS Stream via IBM Cloud Video (No YouTube branding) */}
        <iframe 
          className="w-full h-full object-cover scale-105"
          src="https://video.ibm.com/embed/17074538?autoplay=1" 
          title="NASA Live Stream" 
          frameBorder="0" 
          allowFullScreen
          style={{ border: 'none' }}
        ></iframe>
        
        {/* HUD Overlays on top of the video */}
        <div className="absolute top-4 left-4 text-[10px] text-white/70 font-mono tracking-widest uppercase bg-black/50 px-2 py-1 rounded backdrop-blur-sm pointer-events-none border border-white/10">
          UPLINK: NASA HDEV
        </div>
        
        {/* Target crosshair overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
            <div className="w-16 h-16 border border-white rounded-full flex items-center justify-center">
                <div className="w-1 h-1 bg-white rounded-full" />
            </div>
            <div className="absolute w-full h-px bg-white/50" />
            <div className="absolute h-full w-px bg-white/50" />
        </div>
      </div>
    </div>
  );
}
