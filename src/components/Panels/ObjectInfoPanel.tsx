'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ZenithSatellite } from '@/workers/orbitalWorker';
import { useRadarStore } from '@/store/useRadarStore';
import { Info, Target, Compass, Navigation, Satellite as SatelliteIcon, Share2 } from 'lucide-react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import Link from 'next/link';
import { DynamicSatellite } from '@/components/3D/DynamicSatellite';

interface ObjectInfoPanelProps {
  satellites: ZenithSatellite[];
}

export default function ObjectInfoPanel({ satellites }: ObjectInfoPanelProps) {
  const { selectedObjectId, setSelectedObject } = useRadarStore();
  const selectedSat = satellites.find(s => s.id === selectedObjectId);
  const isDebris = selectedSat?.type === 'DEBRIS' || selectedSat?.type === 'ROCKET BODY';

  const [scrambleId, setScrambleId] = useState('');
  useEffect(() => {
    if (selectedSat) {
      let iteration = 0;
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      const interval = setInterval(() => {
        setScrambleId(
          selectedSat.id.split('').map((char, index) => {
            if (index < iteration) return char;
            return chars[Math.floor(Math.random() * chars.length)];
          }).join('')
        );
        if (iteration >= selectedSat.id.length) clearInterval(interval);
        iteration += 1 / 3;
      }, 30);
      return () => clearInterval(interval);
    }
  }, [selectedSat]);

  return (
    <div className="w-full h-full min-h-[250px] glass-panel hud-border relative overflow-hidden flex flex-col">
      <AnimatePresence mode="wait">
        {selectedSat ? (
          <motion.div
            key="selected"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col h-full"
          >
            <div className="relative h-48 border-b border-white/10 bg-[#0a0a0f] overflow-hidden flex-shrink-0">
               <div className="absolute top-4 left-4 z-10 flex items-center space-x-2 text-cyan-400">
                 <SatelliteIcon size={16} />
                 <span className="font-mono text-xs uppercase tracking-widest font-bold">3D Profile Analysis</span>
               </div>
               
               <div className="absolute inset-0">
                 <Canvas camera={{ position: [2, 1.5, 2], fov: 45 }}>
                   <ambientLight intensity={1.5} />
                   <directionalLight position={[10, 10, 5]} intensity={2.0} />
                   <directionalLight position={[-10, 10, -5]} intensity={1.0} color="#60a5fa" />
                   <pointLight position={[-10, -10, -10]} intensity={1.0} color="#22d3ee" />
                   <OrbitControls autoRotate autoRotateSpeed={2} enableZoom={true} enablePan={false} />
                   
                   <Suspense fallback={<Html center><div className="text-[10px] text-cyan-500 font-mono animate-pulse">LOADING MESH...</div></Html>}>
                     {isDebris ? (
                        <DynamicSatellite name={selectedSat.name} isDebris={true} dashboardMode={true} />
                     ) : (
                        <group position={[0, -0.2, 0]}>
                           <DynamicSatellite name={selectedSat.name} isDebris={false} dashboardMode={true} />
                        </group>
                     )}
                   </Suspense>
                 </Canvas>
               </div>
               
               <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black to-transparent pointer-events-none">
                 <div className={`text-xs font-mono font-bold uppercase tracking-widest ${isDebris ? 'text-red-400' : 'text-green-400'} flex items-center`}>
                   <span className={`w-2 h-2 rounded-full mr-2 ${isDebris ? 'bg-red-500 shadow-[0_0_8px_red]' : 'bg-green-500 shadow-[0_0_8px_#22c55e]'}`} />
                   {isDebris ? 'DECAYING DEBRIS' : 'NOMINAL PAYLOAD'}
                 </div>
                 <h2 className="text-xl font-bold text-white uppercase tracking-wider mt-1 truncate">{selectedSat.name}</h2>
               </div>
            </div>

            <div className="p-4 space-y-4 overflow-y-auto custom-scrollbar flex-1">
              <div className="text-sm text-cyan-400 font-mono tracking-widest">
                ID: {scrambleId}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gradient-to-br from-white/5 to-transparent p-3 rounded-xl border border-white/10 shadow-inner">
                  <div className="flex items-center text-[10px] text-white/50 mb-1 uppercase tracking-widest">
                    <Navigation size={12} className="mr-2 text-[var(--theme-400)]" /> Elevation
                  </div>
                  <div className="text-xl font-mono text-white font-light">
                    {selectedSat.elevation.toFixed(2)}<span className="text-[var(--theme-500)]">°</span>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-white/5 to-transparent p-3 rounded-xl border border-white/10 shadow-inner">
                  <div className="flex items-center text-[10px] text-white/50 mb-1 uppercase tracking-widest">
                    <Compass size={12} className="mr-2 text-[var(--theme-400)]" /> Azimuth
                  </div>
                  <div className="text-xl font-mono text-white font-light">
                    {selectedSat.azimuth.toFixed(2)}<span className="text-[var(--theme-500)]">°</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-white/5 to-transparent p-3 rounded-xl border border-white/10 shadow-inner w-full">
                <div className="flex items-center text-[10px] text-white/50 mb-1 uppercase tracking-widest">
                  <Target size={12} className="mr-2 text-[var(--theme-400)]" /> Range / Distance
                </div>
                <div className="text-xl font-mono text-white font-light">
                  {selectedSat.range.toFixed(2)} <span className="text-[var(--theme-500)] text-sm">km</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 border-t border-white/10 bg-black/20">
              <button 
                onClick={() => setSelectedObject(null)}
                className="text-xs text-red-400 hover:text-red-300 transition-colors uppercase tracking-widest font-mono flex items-center group"
              >
                <span className="w-4 h-[1px] bg-red-400 mr-2 group-hover:w-6 transition-all" />
                Disengage
              </button>
              
              <Link 
                href={`/solar-system?target=${selectedSat.id}`}
                className="text-xs text-black bg-[var(--theme-400)] hover:bg-[var(--theme-300)] px-4 py-2 rounded-full uppercase tracking-widest font-mono font-bold transition-colors shadow-[0_0_15px_rgba(var(--theme-rgb),0.4)]"
              >
                Engage 3D
              </Link>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center h-[200px] text-center relative z-10"
          >
            <div className="w-16 h-16 rounded-full border border-dashed border-cyan-500/30 animate-[spin_10s_linear_infinite] flex items-center justify-center mb-4">
              <div className="w-2 h-2 rounded-full bg-cyan-500/50 animate-ping" />
            </div>
            <p className="text-sm text-cyan-100/50 font-mono tracking-widest uppercase">
              Awaiting Target Lock<br/>
              <span className="text-[10px] text-cyan-500/50">Select anomaly on radar</span>
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
