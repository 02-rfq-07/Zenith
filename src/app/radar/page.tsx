'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRadarStore } from '@/store/useRadarStore';
import { fetchActiveTLEs } from '@/services/api';
import { SatelliteData, ZenithSatellite, WorkerMessage } from '@/workers/orbitalWorker';

import LiveZenithRadar from '@/components/Radar/LiveZenithRadar';
import LocationPicker from '@/components/Location/LocationPicker';
import LiveLocationTracker from '@/components/Location/LiveLocationTracker';
import ObjectInfoPanel from '@/components/Panels/ObjectInfoPanel';
import ZenithTimeMachine from '@/components/Controls/ZenithTimeMachine';
import DebrisLens from '@/components/Lenses/DebrisLens';
import SkyVisibilityScore from '@/components/Panels/SkyVisibilityScore';
import GlobalPreviewPanel from '@/components/Panels/GlobalPreviewPanel';
import CosmicHistoryCards from '@/components/Panels/CosmicHistoryCards';
import LiveFeedPanel from '@/components/Panels/LiveFeedPanel';
import ThemePicker from '@/components/Controls/ThemePicker';
import { ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function RadarDashboard() {
  const { latitude, longitude, timeOffset, showDebris, showConstellations, toggleConstellations, ambientAudioEnabled, toggleAudio } = useRadarStore();
  const [tles, setTles] = useState<SatelliteData[]>([]);
  const [satellites, setSatellites] = useState<ZenithSatellite[]>([]);
  const workerRef = useRef<Worker | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [loading, setLoading] = useState(true);

  // Loading Sequence
  const [loadingText, setLoadingText] = useState('INITIALIZING SECURE CONNECTION...');

  useEffect(() => {
    const texts = [
      'INITIALIZING SECURE CONNECTION...',
      'BYPASSING MAINFRAME FIREWALLS...',
      'DOWNLOADING ORBITAL MATRICES...',
      'CALIBRATING SGP4 PROPAGATOR...',
      'ESTABLISHING SATELLITE UPLINK...'
    ];
    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % texts.length;
      setLoadingText(texts[i]);
    }, 800);
    return () => clearInterval(interval);
  }, []);

  // Initialize Data and Worker
  useEffect(() => {
    fetchActiveTLEs().then((data) => {
      setTles(data);
      setTimeout(() => setLoading(false), 2000); // Artificial delay to show cool loading screen
      
      workerRef.current = new Worker(new URL('../../workers/orbitalWorker.ts', import.meta.url));
      workerRef.current.onmessage = (e: MessageEvent<{ overhead: ZenithSatellite[] }>) => {
        setSatellites(e.data.overhead);
      };
      workerRef.current.postMessage({ type: 'START', tles: data });
    });
    return () => workerRef.current?.terminate();
  }, []);

  // Update Worker when params change
  useEffect(() => {
    if (workerRef.current && !loading) {
      const updateWorker = () => {
        workerRef.current?.postMessage({ type: 'UPDATE', latitude, longitude, timeOffset });
      };
      updateWorker();
      let interval = setInterval(updateWorker, 1000);
      return () => clearInterval(interval);
    }
  }, [latitude, longitude, timeOffset, loading]);

  // Ambient Audio Logic
  useEffect(() => {
    if (!audioRef.current) {
      // Create a synthesized space hum using Web Audio API if no file is present
      // For simplicity, we just use a placeholder data URI or a public space hum url
      // Because we can't easily synthesize looping audio in a generic <audio> tag without an AudioContext component,
      // we'll load a very subtle looping base64 audio snippet or rely on a remote asset.
      audioRef.current = new Audio('https://cdn.pixabay.com/download/audio/2022/03/15/audio_247ce11e3b.mp3?filename=space-hum-1-105156.mp3');
      audioRef.current.loop = true;
      audioRef.current.volume = 0.15;
    }

    if (ambientAudioEnabled) {
      audioRef.current.play().catch(e => console.log("Audio playback prevented by browser:", e));
    } else {
      audioRef.current.pause();
    }
  }, [ambientAudioEnabled]);

  const handleLocateISS = async () => {
    const satellite = await import('satellite.js');
    const issTle = tles.find(t => t.name.includes('ISS (ZARYA)') || t.name.includes('ISS'));
    if (issTle) {
      const satrec = satellite.twoline2satrec(issTle.tle1, issTle.tle2);
      const d = new Date(Date.now() + timeOffset * 60000);
      const pv = satellite.propagate(satrec, d);
      if (pv && typeof pv !== 'boolean' && pv.position && typeof pv.position !== 'boolean') {
        const gmst = satellite.gstime(d);
        const gd = satellite.eciToGeodetic(pv.position, gmst);
        const lat = satellite.degreesLat(gd.latitude);
        const lng = satellite.degreesLong(gd.longitude);
        const store = useRadarStore.getState();
        store.setCoordinates(lat, lng);
        store.setSelectedObject(issTle.id);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center font-mono selection:bg-cyan-500/30">
         <div className="relative w-32 h-32 mb-8">
            <div className="absolute inset-0 border-2 border-cyan-500/20 rounded-full animate-[spin_4s_linear_infinite]" />
            <div className="absolute inset-2 border-2 border-t-cyan-400 border-r-transparent border-b-cyan-500 border-l-transparent rounded-full animate-[spin_2s_linear_infinite]" />
            <div className="absolute inset-8 bg-cyan-500/20 rounded-full animate-pulse blur-md" />
         </div>
         <div className="text-cyan-400 text-sm tracking-widest glitch-text uppercase">
            {loadingText}
         </div>
         <div className="w-64 h-1 bg-white/10 mt-6 rounded-full overflow-hidden">
            <div className="h-full bg-cyan-400 animate-[scanline_2s_ease-in-out_infinite]" />
         </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020202] text-white p-4 md:p-8 font-sans selection:bg-cyan-500/30 overflow-x-hidden relative">
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-900/5 via-black to-black pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between mb-8 border-b border-white/10 pb-4">
        <div className="flex items-center space-x-4 mb-4 md:mb-0">
          <Link href="/" className="p-3 hover:bg-white/10 rounded-full transition-colors border border-white/5 bg-white/5 backdrop-blur-md">
            <ChevronLeft size={20} className="text-cyan-400" />
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-black tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-white to-purple-500 uppercase">
              Project Zenith
            </h1>
            <div className="text-[10px] text-cyan-400/50 font-mono tracking-widest uppercase mt-1 flex items-center">
              <span className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse" />
              Live Orbital Telemetry Uplink Established
            </div>
          </div>
        </div>
        
        <div className="flex flex-col items-end space-y-3">
          <div className="flex items-center space-x-3">
            <button 
              onClick={toggleAudio}
              className={`px-3 py-1.5 rounded-md font-mono text-[10px] uppercase tracking-widest whitespace-nowrap transition-colors border ${ambientAudioEnabled ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.2)]' : 'bg-white/5 text-white/50 border-white/10 hover:bg-white/10'}`}
            >
              AUDIO: {ambientAudioEnabled ? 'ON' : 'OFF'}
            </button>
            <ThemePicker />
          </div>
          <div className="px-4 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 backdrop-blur-md flex items-center shadow-[0_0_15px_rgba(0,255,255,0.1)]">
             <div className="w-2 h-2 bg-cyan-400 rounded-full mr-2 shadow-[0_0_8px_cyan] animate-pulse" />
             <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest">Global Scan Active</span>
          </div>
        </div>
      </header>

      {/* Main Grid Layout */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-[1600px] mx-auto">
        
        {/* Left Column: Map & Controls */}
        <motion.div 
          className="lg:col-span-3 flex flex-col gap-6"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.div layout className="w-full relative z-50"><LocationPicker /></motion.div>
          <motion.div layout className="w-full relative z-40"><LiveLocationTracker /></motion.div>
          <motion.div layout className="w-full relative z-30"><GlobalPreviewPanel /></motion.div>
          <motion.div layout className="w-full"><SkyVisibilityScore /></motion.div>
          <motion.div layout className="w-full"><DebrisLens /></motion.div>
        </motion.div>

        {/* Center Column: Radar View */}
        <motion.div 
          className="lg:col-span-5 flex flex-col items-center justify-center glass-panel rounded-3xl p-8 min-h-[500px] lg:min-h-[700px]"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          layout
        >
          {latitude === 0 && longitude === 0 ? (
            <div className="text-center">
              <TargetIcon />
              <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-2 tracking-widest uppercase">
                Awaiting Coordinates
              </h3>
              <p className="text-white/40 font-mono text-xs max-w-xs mx-auto leading-relaxed">
                Please select your location on the terrestrial globe to initialize the zenith radar array.
              </p>
            </div>
          ) : (
            <div className="w-full h-full flex flex-col relative">
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-row items-center space-x-2">
                <div className="text-[10px] text-orange-500/70 font-mono uppercase tracking-widest">Anomalies Detected:</div>
                <div className="text-xl font-black text-orange-400 font-mono">
                  {satellites.filter(s => showDebris ? true : !(s.type === 'DEBRIS' || s.type === 'ROCKET BODY')).length}
                </div>
              </div>
              <div className="flex-1 flex items-center justify-center">
                 <LiveZenithRadar satellites={satellites} />
              </div>
            </div>
          )}
          
          <motion.div layout className="w-full mt-6 flex justify-center space-x-4 z-20 relative">
            <button 
              onClick={handleLocateISS}
              className="flex-1 py-3 px-4 rounded-xl border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 font-mono text-sm tracking-widest uppercase shadow-[0_0_15px_rgba(6,182,212,0.1)] transition-all flex items-center justify-center space-x-2"
            >
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
              <span>Locate ISS</span>
            </button>
            
            <button 
              onClick={toggleConstellations}
              className={`flex-1 py-3 px-4 rounded-xl border font-mono text-sm tracking-widest uppercase transition-all flex items-center justify-center space-x-2 ${showConstellations ? 'border-purple-500/50 bg-purple-500/20 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.2)]' : 'border-white/10 bg-white/5 text-white/50 hover:bg-white/10'}`}
            >
              <span>Constellations</span>
              <span className={`text-[10px] ${showConstellations ? 'text-purple-300' : 'text-gray-500'}`}>
                {showConstellations ? 'ON' : 'OFF'}
              </span>
            </button>
          </motion.div>

          <motion.div layout className="w-full mt-6">
            <LiveFeedPanel />
          </motion.div>
        </motion.div>

        {/* Right Column: Telemetry & Time */}
        <motion.div 
          className="lg:col-span-4 flex flex-col gap-6"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
        >
          <motion.div layout className="w-full">
            <ObjectInfoPanel satellites={satellites} />
          </motion.div>
          
          <AnimatePresence>
             <motion.div layout className="w-full">
                <CosmicHistoryCards satellites={satellites} />
             </motion.div>
          </AnimatePresence>
          
          <motion.div layout className="w-full mt-auto">
             <ZenithTimeMachine />
          </motion.div>
        </motion.div>

      </div>
    </div>
  );
}

function TargetIcon() {
  return (
    <div className="relative w-20 h-20 mx-auto mb-8 opacity-50">
      <div className="absolute inset-0 border-2 border-dashed border-cyan-500 rounded-full animate-[spin_15s_linear_infinite]" />
      <div className="absolute inset-3 border border-cyan-400 rounded-full animate-[spin_10s_linear_infinite_reverse]" />
      <div className="absolute top-1/2 left-1/2 w-1.5 h-1.5 bg-cyan-300 rounded-full transform -translate-x-1/2 -translate-y-1/2 shadow-[0_0_10px_cyan]" />
      <div className="absolute top-0 bottom-0 left-1/2 w-px bg-cyan-500/50 transform -translate-x-1/2" />
      <div className="absolute left-0 right-0 top-1/2 h-px bg-cyan-500/50 transform -translate-y-1/2" />
    </div>
  );
}
