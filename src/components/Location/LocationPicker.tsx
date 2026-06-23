'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useRadarStore } from '@/store/useRadarStore';
import { Crosshair, Maximize, Minimize } from 'lucide-react';
import * as satellite from 'satellite.js';

const Globe = dynamic(() => import('react-globe.gl'), { ssr: false });

export default function LocationPicker() {
  const { latitude, longitude, setCoordinates, timeOffset } = useRadarStore();
  const globeRef = useRef<any>(null);
  const fullGlobeRef = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [tles, setTles] = useState<satellite.SatRec[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [globeSize, setGlobeSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      setGlobeSize({
        width: entries[0].contentRect.width,
        height: entries[0].contentRect.height
      });
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    fetch('/active.txt')
      .then(r => r.text())
      .then(text => {
        const lines = text.split('\n').map(l => l.trim());
        const recs = [];
        for (let i = 0; i < lines.length - 2; i += 3) {
          if (lines[i+1]?.startsWith('1 ')) {
            try {
              recs.push(satellite.twoline2satrec(lines[i+1], lines[i+2]));
            } catch (e) {}
          }
        }
        setTles(recs.slice(0, 300));
      });
  }, []);

  const satelliteData = useMemo(() => {
    const d = new Date(Date.now() + timeOffset * 60000);
    const gmst = satellite.gstime(d);
    return tles.map(satrec => {
      try {
        const pv = satellite.propagate(satrec, d);
        if (!pv || typeof pv === 'boolean' || typeof pv.position === 'boolean' || !pv.position) return null;
        const gd = satellite.eciToGeodetic(pv.position, gmst);
        return {
          lat: satellite.degreesLat(gd.latitude),
          lng: satellite.degreesLong(gd.longitude)
        };
      } catch { return null; }
    }).filter(Boolean) as {lat: number, lng: number}[];
  }, [tles, timeOffset]);

  useEffect(() => {
    if (globeRef.current) {
      globeRef.current.controls().autoRotate = true;
      globeRef.current.controls().autoRotateSpeed = 0.5;
    }
  }, [isReady]);

  const handleGlobeClick = ({ lat, lng }: { lat: number, lng: number }) => {
    setCoordinates(lat, lng);
  };

  const markerData = latitude !== 0 && longitude !== 0 ? [{ isMarker: true, lat: latitude, lng: longitude }] : [];
  const combinedData = [...markerData, ...satelliteData];

  return (
    <>
      <div className="glass-panel hud-border p-4 rounded-2xl h-[300px] flex flex-col z-10 relative">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-[var(--theme-400)] font-mono tracking-widest uppercase text-xs font-bold flex items-center">
            <Crosshair size={14} className="mr-2" /> Global Positioning
          </h2>
          <button 
            onClick={() => setIsFullscreen(true)}
            className="text-white/50 hover:text-[var(--theme-400)] transition-colors"
            title="Expand Map"
          >
            <Maximize size={16} />
          </button>
        </div>

        <div ref={containerRef} className="relative flex-1 rounded-xl overflow-hidden cursor-crosshair border border-white/10 w-full">
          {typeof window !== 'undefined' && globeSize.width > 0 && (
            <Globe
              ref={globeRef}
              showGlobe={true}
              showAtmosphere={true}
              atmosphereColor="#22d3ee"
              atmosphereAltitude={0.2}
              globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
              bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
              hexPolygonColor={() => 'rgba(34, 211, 238, 0.4)'}
              backgroundColor="rgba(0,0,0,0)"
              width={globeSize.width}
              height={globeSize.height}
              onGlobeClick={handleGlobeClick}
              onGlobeReady={() => setIsReady(true)}
              htmlElementsData={combinedData}
              htmlElement={(d: any) => {
                const el = document.createElement('div');
                if (d.isMarker) {
                   el.innerHTML = `
                    <div class="relative flex items-center justify-center">
                      <div class="absolute w-4 h-4 bg-red-400 rounded-full animate-ping opacity-75"></div>
                      <div class="relative w-2 h-2 bg-red-500 rounded-full shadow-[0_0_10px_red]"></div>
                    </div>
                  `;
                } else {
                   el.innerHTML = `<div style="width: 4px; height: 4px; background-color: var(--theme-400, #22d3ee); border-radius: 50%; box-shadow: 0 0 10px var(--theme-400, #22d3ee);"></div>`;
                }
                return el;
              }}
            />
          )}
        </div>
        <div className="absolute bottom-6 left-6 z-10 bg-black/50 backdrop-blur-md px-3 py-1 rounded-md text-xs text-white/80 font-mono border border-white/10 pointer-events-none">
          {latitude !== 0 ? `${latitude.toFixed(4)}°, ${longitude.toFixed(4)}°` : 'Click to select location'}
        </div>
      </div>

      {/* Fullscreen Popup Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex flex-col p-8">
           <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-black text-white tracking-[0.2em] uppercase glitch-text">Tactical Global View</h2>
                <p className="text-[var(--theme-400)] font-mono tracking-widest uppercase text-xs mt-1">Select operating coordinates</p>
              </div>
              <button 
                onClick={() => setIsFullscreen(false)}
                className="bg-white text-black hover:bg-[var(--theme-500)] px-6 py-3 rounded-full font-mono uppercase tracking-widest font-bold shadow-[0_0_20px_rgba(255,255,255,0.5)] transition-colors"
              >
                Confirm & Return to Radar
              </button>
           </div>
           
           <div className="flex-1 relative rounded-3xl overflow-hidden border border-[var(--theme-500)]/30 shadow-[0_0_50px_rgba(var(--theme-rgb),0.2)]">
             {typeof window !== 'undefined' && (
                <Globe
                  ref={fullGlobeRef}
                  showGlobe={true}
                  showAtmosphere={true}
                  atmosphereColor="#22d3ee"
                  atmosphereAltitude={0.15}
                  globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
                  bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
                  // Fallback styling
                  hexPolygonColor={() => 'rgba(34, 211, 238, 0.4)'}
                  backgroundColor="#000000"
                  onGlobeClick={handleGlobeClick}
                  htmlElementsData={combinedData}
                  htmlElement={(d: any) => {
                    const el = document.createElement('div');
                    if (d.isMarker) {
                       el.innerHTML = `
                        <div class="relative flex items-center justify-center">
                          <div class="absolute w-8 h-8 bg-red-400 rounded-full animate-ping opacity-75"></div>
                          <div class="relative w-4 h-4 bg-red-500 rounded-full shadow-[0_0_20px_red]"></div>
                        </div>
                      `;
                    } else {
                       el.innerHTML = `<div style="width: 6px; height: 6px; background-color: var(--theme-400, #22d3ee); border-radius: 50%; box-shadow: 0 0 15px var(--theme-400, #22d3ee);"></div>`;
                    }
                    return el;
                  }}
                />
              )}
           </div>
        </div>
      )}
    </>
  );
}
