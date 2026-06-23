'use client';

import React, { useState } from 'react';
import { Video } from 'lucide-react';

const FEEDS = [
  { id: 'nasa', name: 'NASA TV', url: 'https://www.youtube.com/embed/KG6SL6Mf7ak?autoplay=1&mute=1&controls=1&modestbranding=1' },
  { id: 'iss', name: 'ISS Live', url: 'https://www.youtube.com/embed/FuuC4dpSQ1M?autoplay=1&mute=1&controls=1&modestbranding=1' },
  { id: 'roscosmos', name: 'Roscosmos Orbital', url: '' },
  { id: 'isro', name: 'ISRO Telemetry', url: 'https://www.youtube.com/embed/KG6SL6Mf7ak?autoplay=1&mute=1&controls=1&modestbranding=1' },
];

export default function LiveFeedPanel() {
  const [activeFeed, setActiveFeed] = useState(FEEDS[0]);
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
            <span className={`w-2 h-2 rounded-full ${activeFeed.url ? 'bg-red-500 animate-pulse shadow-[0_0_8px_red]' : 'bg-gray-500'}`} />
            <span className={`text-[10px] font-mono tracking-widest uppercase ${activeFeed.url ? 'text-red-400' : 'text-gray-400'}`}>
              {activeFeed.url ? 'REC' : 'OFFLINE'}
            </span>
        </div>
      </div>
      <div className="flex space-x-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
        {FEEDS.map(feed => (
          <button
            key={feed.id}
            onClick={() => setActiveFeed(feed)}
            className={`px-3 py-1.5 rounded-md font-mono text-[10px] uppercase tracking-widest whitespace-nowrap transition-colors border ${
              activeFeed.id === feed.id 
                ? 'bg-orange-500/20 text-orange-400 border-orange-500/50 shadow-[0_0_10px_rgba(249,115,22,0.2)]' 
                : 'bg-white/5 text-white/50 border-white/10 hover:bg-white/10'
            }`}
          >
            {feed.name}
          </button>
        ))}
      </div>

      <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-white/10 bg-black/50 z-10 shadow-inner flex flex-col items-center justify-center">
        {activeFeed.url ? (
          <iframe 
            key={activeFeed.id}
            className="absolute inset-0 w-full h-full object-cover scale-105"
            src={activeFeed.url}
            title="Live Orbital Feed" 
            frameBorder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen" 
            allowFullScreen
            style={{ border: 'none' }}
          ></iframe>
        ) : (
          <div className="text-center p-6 relative z-20 flex flex-col items-center justify-center">
            <Video size={32} className="text-orange-500/40 mb-3" />
            <h3 className="text-sm text-orange-400 font-mono tracking-widest uppercase mb-1">No Active Feed</h3>
            <p className="text-white/40 text-[10px] font-mono tracking-wider max-w-[200px] leading-relaxed">
              There are no current live events. Please check back later!
            </p>
          </div>
        )}
        
        {/* HUD Overlays on top of the video */}
        <div className="absolute top-4 left-4 text-[10px] text-white/70 font-mono tracking-widest uppercase bg-black/50 px-2 py-1 rounded backdrop-blur-sm pointer-events-none border border-white/10">
          UPLINK: {activeFeed.name}
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
