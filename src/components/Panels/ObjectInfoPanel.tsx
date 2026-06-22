'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ZenithSatellite } from '@/workers/orbitalWorker';
import { useRadarStore } from '@/store/useRadarStore';
import { Info, Target, Compass, Navigation, Cuboid } from 'lucide-react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Wireframe } from '@react-three/drei';
import Link from 'next/link';

// Simple 3D Mesh Component for the anomaly
function AnomalyMesh({ isDebris }: { isDebris: boolean }) {
  const meshRef = React.useRef<any>();
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.5;
      meshRef.current.rotation.y += delta * 0.8;
    }
  });

  return (
    <mesh ref={meshRef}>
      {isDebris ? (
        <octahedronGeometry args={[1.5, 0]} />
      ) : (
        <boxGeometry args={[1.2, 1.2, 2]} />
      )}
      <meshStandardMaterial 
        color={isDebris ? '#ef4444' : '#06b6d4'} 
        wireframe={true} 
        emissive={isDebris ? '#ef4444' : '#06b6d4'}
        emissiveIntensity={0.5}
      />
    </mesh>
  );
}

interface ObjectInfoPanelProps {
  satellites: ZenithSatellite[];
}

export default function ObjectInfoPanel({ satellites }: ObjectInfoPanelProps) {
  const { selectedObjectId, setSelectedObject } = useRadarStore();
  const selectedSat = satellites.find(s => s.id === selectedObjectId);

  // Animated scrambling text effect for the ID
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
    <div className="w-full h-full min-h-[250px] glass-panel hud-border p-6 relative">
      <div className="absolute top-0 right-0 p-4 opacity-5">
        <Target size={150} className="animate-[spin_20s_linear_infinite]" />
      </div>

      <div className="flex items-center space-x-3 mb-6 relative z-10">
        <div className="p-2 bg-cyan-500/20 rounded-lg text-cyan-400 shadow-[0_0_10px_rgba(0,255,255,0.2)]">
          <Info size={20} />
        </div>
        <h2 className="text-xl font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white to-cyan-500 uppercase">
          Object Telemetry
        </h2>
      </div>

      <AnimatePresence mode="wait">
        {selectedSat ? (
          <motion.div
            key="selected"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-5 relative z-10"
          >
            <div>
              <div className="text-xs text-cyan-400/50 mb-1 font-mono uppercase tracking-widest flex items-center">
                <span className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse" />
                Live Tracking Lock
              </div>
              <div className="text-2xl font-black text-white break-words uppercase tracking-wider">{selectedSat.name}</div>
              <div className="text-sm text-cyan-400 mt-1 font-mono tracking-widest">
                ID: {scrambleId}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-white/5 to-transparent p-4 rounded-xl border border-white/10 shadow-inner">
                <div className="flex items-center text-[10px] text-white/50 mb-2 uppercase tracking-widest">
                  <Navigation size={12} className="mr-2 text-cyan-400" /> Elevation
                </div>
                <div className="text-2xl font-mono text-white font-light">
                  {selectedSat.elevation.toFixed(2)}<span className="text-cyan-500">°</span>
                </div>
              </div>
              <div className="bg-gradient-to-br from-white/5 to-transparent p-4 rounded-xl border border-white/10 shadow-inner">
                <div className="flex items-center text-[10px] text-white/50 mb-2 uppercase tracking-widest">
                  <Compass size={12} className="mr-2 text-cyan-400" /> Azimuth
                </div>
                <div className="text-2xl font-mono text-white font-light">
                  {selectedSat.azimuth.toFixed(2)}<span className="text-cyan-500">°</span>
                </div>
              </div>
              
              {/* 3D Anomaly Viewer */}
              <div className="col-span-2 h-[150px] bg-black/40 rounded-xl border border-white/10 relative overflow-hidden group">
                <div className="absolute top-2 left-2 z-10 flex items-center text-[10px] text-white/50 uppercase tracking-widest">
                  <Cuboid size={12} className="mr-2 text-cyan-400" /> 3D Profile Analysis
                </div>
                <div className="absolute inset-0 cursor-move">
                  <Canvas camera={{ position: [0, 0, 4] }}>
                    <ambientLight intensity={0.5} />
                    <pointLight position={[10, 10, 10]} />
                    <AnomalyMesh isDebris={selectedSat.type === 'DEBRIS' || selectedSat.type === 'ROCKET BODY'} />
                    <OrbitControls enableZoom={false} autoRotate={true} />
                  </Canvas>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-4">
              <button 
                onClick={() => setSelectedObject(null)}
                className="text-xs text-red-400 hover:text-red-300 transition-colors uppercase tracking-widest font-mono flex items-center group"
              >
                <span className="w-4 h-[1px] bg-red-400 mr-2 group-hover:w-6 transition-all" />
                Disengage Lock
              </button>
              
              <Link 
                href={`/solar-system?target=${selectedSat.id}`}
                className="text-xs text-black bg-cyan-400 hover:bg-cyan-300 px-4 py-2 rounded-full uppercase tracking-widest font-mono font-bold transition-colors shadow-[0_0_15px_rgba(0,255,255,0.4)]"
              >
                Engage 3D Tracking
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
