'use client';

import React, { useEffect, useState, useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Line, Sphere, Html } from '@react-three/drei';
import * as THREE from 'three';
import * as satellite from 'satellite.js';
import Link from 'next/link';
import { ChevronLeft, Camera, Navigation, Zap } from 'lucide-react';
import { useRadarStore } from '@/store/useRadarStore';
import { useSearchParams } from 'next/navigation';

const EARTH_RADIUS_KM = 6371;
const SCALE = 1 / 1000;

function Earth() {
  const earthRef = useRef<THREE.Mesh>(null);
  useFrame((state, delta) => {
    if (earthRef.current) earthRef.current.rotation.y += delta * 0.05;
  });

  return (
    <mesh ref={earthRef}>
      <sphereGeometry args={[EARTH_RADIUS_KM * SCALE, 64, 64]} />
      {/* High-Res textures would be applied here using useTexture if available, falling back to blue marble style colors */}
      <meshStandardMaterial color="#0b3d91" roughness={0.7} metalness={0.1} />
      {/* Atmosphere */}
      <mesh>
        <sphereGeometry args={[EARTH_RADIUS_KM * SCALE * 1.03, 32, 32]} />
        <meshBasicMaterial color="var(--theme-400, #22d3ee)" transparent opacity={0.1} side={THREE.BackSide} />
      </mesh>
    </mesh>
  );
}

function CelestialBodies() {
  const moonDistance = 384400 * SCALE * 0.1; // Scaled down distance for visibility
  const marsDistance = 800000 * SCALE * 0.1; 
  const jupiterDistance = 1500000 * SCALE * 0.1;
  const saturnDistance = 2500000 * SCALE * 0.1;
  const uranusDistance = 3500000 * SCALE * 0.1;
  const neptuneDistance = 4500000 * SCALE * 0.1;
  
  return (
    <>
      <mesh position={[moonDistance, 20, moonDistance]}>
        <sphereGeometry args={[1737 * SCALE, 32, 32]} />
        <meshStandardMaterial color="#d1d5db" roughness={0.9} />
      </mesh>
      <mesh position={[-marsDistance, 0, marsDistance]}>
        <sphereGeometry args={[3389 * SCALE, 32, 32]} />
        <meshStandardMaterial color="#b91c1c" roughness={0.8} />
      </mesh>
      <mesh position={[jupiterDistance, 50, -jupiterDistance]}>
        <sphereGeometry args={[69911 * SCALE * 0.2, 64, 64]} />
        <meshStandardMaterial color="#d97706" roughness={0.6} />
      </mesh>
      <mesh position={[-saturnDistance, -50, -saturnDistance]}>
        <sphereGeometry args={[58232 * SCALE * 0.2, 64, 64]} />
        <meshStandardMaterial color="#fcd34d" roughness={0.5} />
        <mesh rotation={[Math.PI / 2.5, 0, 0]}>
          <ringGeometry args={[58232 * SCALE * 0.25, 58232 * SCALE * 0.45, 64]} />
          <meshBasicMaterial color="#fde68a" transparent opacity={0.6} side={THREE.DoubleSide} />
        </mesh>
      </mesh>
      <mesh position={[uranusDistance, 100, uranusDistance]}>
        <sphereGeometry args={[25362 * SCALE * 0.2, 32, 32]} />
        <meshStandardMaterial color="#bae6fd" roughness={0.4} />
      </mesh>
      <mesh position={[-neptuneDistance, -100, neptuneDistance]}>
        <sphereGeometry args={[24622 * SCALE * 0.2, 32, 32]} />
        <meshStandardMaterial color="#2563eb" roughness={0.4} />
      </mesh>
    </>
  );
}

function GlobalConstellation({ tles, timeOffset }: { tles: {satrec: satellite.SatRec, type: string}[], timeOffset: number }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame(() => {
    if (!meshRef.current || tles.length === 0) return;
    const d = new Date(Date.now() + timeOffset * 60000);
    
    let idx = 0;
    for (let i = 0; i < tles.length; i++) {
      const { satrec } = tles[i];
      try {
        const positionAndVelocity = satellite.propagate(satrec, d);
        const pos = positionAndVelocity.position as satellite.EciVec3<number>;
        if (pos) {
          dummy.position.set(pos.x * SCALE, pos.z * SCALE, -pos.y * SCALE);
          dummy.updateMatrix();
          meshRef.current.setMatrixAt(idx++, dummy.matrix);
        }
      } catch (e) {
        // Propagation fail
      }
    }
    meshRef.current.count = idx;
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  if (tles.length === 0) return null;

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, tles.length]}>
      {/* Box shaped satellite body representing a real satellite rather than a dot */}
      <boxGeometry args={[0.2, 0.05, 0.15]} />
      <meshStandardMaterial color="var(--theme-400, #22d3ee)" roughness={0.2} metalness={0.8} emissive="var(--theme-500, #06b6d4)" emissiveIntensity={0.5} />
    </instancedMesh>
  );
}

function OrbitPath({ satrec }: { satrec: satellite.SatRec }) {
  const points = [];
  const now = new Date();
  for (let i = 0; i < 120; i++) {
    const d = new Date(now.getTime() + i * 60000);
    const pv = satellite.propagate(satrec, d);
    const pos = pv.position as satellite.EciVec3<number>;
    if (pos) points.push(new THREE.Vector3(pos.x * SCALE, pos.z * SCALE, -pos.y * SCALE));
  }
  if (points.length === 0) return null;

  return (
    <Line points={points} color="var(--theme-400, #22d3ee)" lineWidth={2} dashed dashSize={0.5} gapSize={0.2} opacity={0.8} transparent closed />
  );
}

function TargetSatellite({ satrec, timeOffset, isRideMode, velocity }: { satrec: satellite.SatRec, timeOffset: number, isRideMode: boolean, velocity: (v: number) => void }) {
  const groupRef = useRef<THREE.Group>(null);
  const { camera } = useThree();

  useFrame(() => {
    const d = new Date(Date.now() + timeOffset * 60000);
    const pv = satellite.propagate(satrec, d);
    const pos = pv.position as satellite.EciVec3<number>;
    const vel = pv.velocity as satellite.EciVec3<number>;

    if (pos && vel && groupRef.current) {
      const x = pos.x * SCALE;
      const y = pos.z * SCALE;
      const z = -pos.y * SCALE;
      const satPos = new THREE.Vector3(x, y, z);
      
      groupRef.current.position.copy(satPos);
      
      const target = new THREE.Vector3(x + vel.x, y + vel.z, z - vel.y);
      groupRef.current.lookAt(target);

      const speed = Math.sqrt(vel.x*vel.x + vel.y*vel.y + vel.z*vel.z);
      velocity(speed);
    }
  });

  return (
    <group ref={groupRef}>
      <mesh>
        <boxGeometry args={[0.3, 0.3, 0.8]} />
        <meshStandardMaterial color="#fff" emissive="var(--theme-500, #06b6d4)" emissiveIntensity={2} />
      </mesh>
      {/* Directional Cone */}
      <mesh position={[0, 0, 0.6]} rotation={[-Math.PI/2, 0, 0]}>
        <coneGeometry args={[0.2, 0.6, 8]} />
        <meshBasicMaterial color="var(--theme-300, #67e8f9)" transparent opacity={0.8} />
      </mesh>
      <pointLight color="var(--theme-400, #22d3ee)" intensity={3} distance={10} />
    </group>
  );
}

function CameraController({ isRideMode, targetSatrec, timeOffset, controlsRef }: { isRideMode: boolean, targetSatrec: satellite.SatRec | null, timeOffset: number, controlsRef: any }) {
  useFrame((state) => {
    if (!controlsRef.current) return;
    
    if (isRideMode && targetSatrec) {
      const d = new Date(Date.now() + timeOffset * 60000);
      const pv = satellite.propagate(targetSatrec, d);
      const pos = pv.position as satellite.EciVec3<number>;
      if (pos) {
        const satPos = new THREE.Vector3(pos.x * SCALE, pos.z * SCALE, -pos.y * SCALE);
        // Smoothly track the target
        controlsRef.current.target.lerp(satPos, 0.05);
        
        // Gently pull camera closer if far away
        const dist = state.camera.position.distanceTo(satPos);
        if (dist > 3) {
          const desiredPos = satPos.clone().add(new THREE.Vector3(1, 1, 1).normalize().multiplyScalar(2));
          state.camera.position.lerp(desiredPos, 0.02);
        }
      }
    } else {
      // Return to Earth center
      controlsRef.current.target.lerp(new THREE.Vector3(0, 0, 0), 0.05);
    }
  });

  return null;
}

export default function SolarSystemViewer() {
  const searchParams = useSearchParams();
  const targetId = searchParams.get('target');
  const { timeOffset, setTimeOffset } = useRadarStore();
  
  const [tles, setTles] = useState<{satrec: satellite.SatRec, type: string, id: string, name: string}[]>([]);
  const [targetSatrec, setTargetSatrec] = useState<satellite.SatRec | null>(null);
  const [satName, setSatName] = useState('GLOBAL CONSTELLATION');
  const [isRideMode, setIsRideMode] = useState(false);
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const controlsRef = useRef<any>(null);

  useEffect(() => {
    fetch('/active.txt')
      .then(r => r.text())
      .then(text => {
        const lines = text.split('\n').map(l => l.trim());
        const all: {satrec: satellite.SatRec, type: string, id: string, name: string}[] = [];
        for (let i = 0; i < lines.length - 2; i += 3) {
          const name = lines[i];
          const tle1 = lines[i+1];
          const tle2 = lines[i+2];
          if (tle1 && tle2 && tle1.startsWith('1 ')) {
            const id = tle1.substring(2, 7).trim();
            const type = (name.includes('DEB') || name.includes('R/B')) ? 'DEBRIS' : 'PAYLOAD';
            try {
              const rec = satellite.twoline2satrec(tle1, tle2);
              all.push({ satrec: rec, type, id, name });
              if (targetId && id === targetId) {
                setTargetSatrec(rec);
                setSatName(name);
                setIsRideMode(true);
              }
            } catch (e) {}
          }
        }
        setTles(all);
      });
  }, [targetId]);

  return (
    <div className="w-full h-screen bg-black overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full p-6 z-10 flex justify-between items-start pointer-events-none">
        <div>
          <Link href="/radar" className="inline-flex items-center space-x-2 text-[var(--theme-400)] hover:text-white transition-colors bg-black/50 px-4 py-2 rounded-full border border-[var(--theme-500)]/30 backdrop-blur-md pointer-events-auto shadow-[0_0_15px_rgba(var(--theme-rgb),0.2)]">
            <ChevronLeft size={20} />
            <span className="font-mono uppercase tracking-widest text-xs">Return to Radar</span>
          </Link>
          <div className="mt-6 ml-2">
            <h1 className="text-3xl md:text-5xl font-black text-white tracking-[0.2em] uppercase glitch-text">
              {satName}
            </h1>
            <p className="text-[var(--theme-400)] font-mono tracking-widest uppercase text-xs mt-1">
              Live 3D Orbital Tracking Matrix
            </p>
          </div>
          
          {/* NASA Eyes Sidebar: Featured Targets */}
          <div className="mt-8 ml-2 pointer-events-auto">
             <div className="text-[10px] text-white/50 uppercase tracking-widest font-mono mb-3">Featured Targets</div>
             <div className="flex flex-col space-y-2 max-h-[50vh] overflow-y-auto scrollbar-hide pr-4">
                {tles.filter(t => t.name.includes('ISS') || t.name.includes('HUBBLE') || t.name.includes('NOAA') || t.name.includes('STARLINK')).slice(0, 15).map(sat => (
                   <button
                     key={sat.id}
                     onClick={() => {
                        setTargetSatrec(sat.satrec);
                        setSatName(sat.name);
                        setIsRideMode(true);
                     }}
                     className="glass-panel px-4 py-3 rounded-xl border border-white/10 hover:border-[var(--theme-500)]/50 hover:bg-[var(--theme-500)]/10 text-left transition-all group"
                   >
                     <div className="text-white font-bold text-sm truncate">{sat.name}</div>
                     <div className="text-[10px] text-[var(--theme-400)] font-mono uppercase tracking-widest mt-1 group-hover:animate-pulse">Track Object</div>
                   </button>
                ))}
             </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-4 pointer-events-auto">
           {targetSatrec && (
             <button 
               onClick={() => setIsRideMode(!isRideMode)}
               className={`flex items-center space-x-2 px-6 py-3 rounded-full border transition-all shadow-[0_0_15px_rgba(var(--theme-rgb),0.3)] ${isRideMode ? 'bg-red-500/20 border-red-500/50 text-red-400' : 'bg-[var(--theme-500)]/20 border-[var(--theme-500)]/50 text-[var(--theme-400)] hover:bg-[var(--theme-500)]/40'}`}
             >
               <Camera size={18} />
               <span className="font-mono uppercase tracking-widest text-xs font-bold">
                 {isRideMode ? 'Disengage Ride Mode' : 'Cinematic Flyby'}
               </span>
             </button>
           )}
           
           <div className="glass-panel border border-white/10 rounded-xl p-4 w-64 backdrop-blur-md">
             <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/10">
               <div className="text-[10px] text-white/50 uppercase tracking-widest font-mono flex items-center">
                 <Zap size={12} className="mr-1 text-[var(--theme-400)]" /> Velocity
               </div>
               <div className="text-lg font-mono font-bold text-white">{currentSpeed.toFixed(2)} <span className="text-[10px] text-[var(--theme-400)]">km/s</span></div>
             </div>
             
             <div className="text-[10px] text-white/50 uppercase tracking-widest font-mono mb-2">Temporal Shift (Mins)</div>
             <input
                type="range"
                min="-1440"
                max="1440"
                value={timeOffset}
                onChange={(e) => setTimeOffset(parseInt(e.target.value))}
                className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer outline-none"
              />
              <div className="text-right text-xs font-mono text-[var(--theme-400)] mt-2 font-bold">
                 T{timeOffset >= 0 ? '+' : ''}{timeOffset}
              </div>
           </div>
        </div>
      </div>

      <Canvas camera={{ position: [0, 0, 25], fov: 45 }}>
        <color attach="background" args={['#020205']} />
        <ambientLight intensity={0.2} />
        <directionalLight position={[50, 20, 10]} intensity={1.5} />
        
        <Stars radius={150} depth={50} count={8000} factor={4} saturation={0} fade speed={1} />
        
        <Earth />
        <CelestialBodies />
        
        <GlobalConstellation tles={tles} timeOffset={timeOffset} />
        
        {targetSatrec && (
          <>
            <OrbitPath satrec={targetSatrec} />
            <TargetSatellite satrec={targetSatrec} timeOffset={timeOffset} isRideMode={isRideMode} velocity={setCurrentSpeed} />
          </>
        )}
        <CameraController isRideMode={isRideMode} targetSatrec={targetSatrec} timeOffset={timeOffset} controlsRef={controlsRef} />
        <OrbitControls ref={controlsRef} enablePan={true} enableZoom={true} minDistance={0.5} maxDistance={200} />
      </Canvas>
    </div>
  );
}
