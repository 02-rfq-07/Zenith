'use client';

import React, { useEffect, useState, useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Line, Sphere, Html, useTexture, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import * as satellite from 'satellite.js';
import Link from 'next/link';
import { ChevronLeft, Camera, Navigation, Zap } from 'lucide-react';
import { useRadarStore } from '@/store/useRadarStore';
import { useSearchParams } from 'next/navigation';

const EARTH_RADIUS_KM = 6371;
const SCALE = 1 / 1000;

const PLANET_DATA = [
  { name: 'Mercury', orbitRadius: 77, radius: 2.4, color: '#a8a29e', angle: 1.2, tex: 'mercury.jpg' },
  { name: 'Venus', orbitRadius: 144, radius: 6, color: '#fcd34d', angle: 2.5, tex: 'venus_surface.jpg' },
  { name: 'Mars', orbitRadius: 300, radius: 3.3, color: '#b91c1c', angle: 4.1, tex: 'mars_1024.jpg' },
  { name: 'Jupiter', orbitRadius: 1040, radius: 15, color: '#d97706', angle: 0.5, tex: 'jupiter_1024.jpg' },
  { name: 'Saturn', orbitRadius: 1900, radius: 12, color: '#fde047', angle: 5.2, tex: 'saturn_1024.jpg' },
  { name: 'Uranus', orbitRadius: 3800, radius: 10, color: '#38bdf8', angle: 3.1, tex: 'uranus.jpg' },
  { name: 'Neptune', orbitRadius: 6000, radius: 10, color: '#1d4ed8', angle: 1.8, tex: 'neptune.jpg' },
  { name: 'Pluto', orbitRadius: 7800, radius: 1.5, color: '#e5e7eb', angle: 2.2, tex: 'pluto.jpg' },
];

function Model({ url, scale }: { url: string, scale: number }) {
  const { scene } = useGLTF(url);
  // Clone to allow multiple instances (e.g. multiple starlinks)
  const clonedScene = useMemo(() => scene.clone(), [scene]);
  return <primitive object={clonedScene} scale={scale} />;
}

function Earth({ activeLayer, epicTextureUrl, onDoubleClick }: { activeLayer: string, epicTextureUrl: string | null, onDoubleClick: (e: any) => void }) {
  const earthRef = useRef<THREE.Mesh>(null);
  const colorMap = useTexture('https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg');
  
  useFrame((state, delta) => {
    if (earthRef.current) earthRef.current.rotation.y += delta * 0.05;
  });

  // Interpret NASA Vital Signs (mock overlays for now, utilizing API key conceptually)
  let earthColor = '#ffffff';
  if (activeLayer === 'Air Temperature') earthColor = '#ff4444';
  if (activeLayer === 'Carbon Dioxide') earthColor = '#aa44ff';
  if (activeLayer === 'Carbon Monoxide') earthColor = '#ffaa44';
  if (activeLayer === 'Chlorophyll') earthColor = '#22cc44';
  if (activeLayer === 'Sea Level') earthColor = '#4488ff';
  if (activeLayer === 'Sea Surface Temperature') earthColor = '#4444ff';
  if (activeLayer === 'Soil Moisture') earthColor = '#44aa44';

  const [epicTexture, setEpicTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    if (epicTextureUrl) {
      new THREE.TextureLoader().load(epicTextureUrl, (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        setEpicTexture(tex);
      });
    }
  }, [epicTextureUrl]);

  return (
    <group onDoubleClick={onDoubleClick}>
      <mesh ref={earthRef}>
        <sphereGeometry args={[EARTH_RADIUS_KM * SCALE, 64, 64]} />
        <meshStandardMaterial 
          map={activeLayer === 'Visible Earth' && epicTexture ? epicTexture : (activeLayer === 'Satellites Now' ? colorMap : undefined)}
          color={activeLayer === 'Satellites Now' || activeLayer === 'Visible Earth' ? '#ffffff' : earthColor} 
          roughness={0.7} 
          metalness={0.1} 
        />
        {/* Atmosphere */}
        <mesh>
          <sphereGeometry args={[EARTH_RADIUS_KM * SCALE * 1.03, 32, 32]} />
          <meshBasicMaterial color="#22d3ee" transparent opacity={0.1} side={THREE.BackSide} />
        </mesh>
      </mesh>
    </group>
  );
}

function Planet({ data, sunPos, isSelected, onClick, onDoubleClick }: any) {
  const pos = new THREE.Vector3(
    sunPos.x + data.orbitRadius * Math.cos(data.angle),
    0,
    sunPos.z + data.orbitRadius * Math.sin(data.angle)
  );

  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  useEffect(() => {
    new THREE.TextureLoader().load(`https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/${data.tex}`, (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      setTexture(tex);
    }, undefined, () => {
      // Texture not found, fallback to color
    });
  }, [data.tex]);

  const orbitPoints = useMemo(() => {
    const pts = [];
    for (let i = 0; i <= 128; i++) {
      const a = (i / 128) * Math.PI * 2;
      pts.push(new THREE.Vector3(
        sunPos.x + data.orbitRadius * Math.cos(a),
        0,
        sunPos.z + data.orbitRadius * Math.sin(a)
      ));
    }
    return pts;
  }, [sunPos, data.orbitRadius]);

  return (
    <group>
      <mesh position={pos} onClick={(e) => { e.stopPropagation(); onClick(data.name); }} onDoubleClick={onDoubleClick}>
        <sphereGeometry args={[data.radius, 32, 32]} />
        <meshStandardMaterial map={texture} color={texture ? '#ffffff' : data.color} roughness={0.7} />
        <Html position={[0, data.radius + 5, 0]} center style={{ pointerEvents: 'none' }}>
          <div className={`font-mono text-[10px] uppercase tracking-[0.3em] px-2 py-1 rounded backdrop-blur-sm transition-colors ${isSelected ? 'bg-[var(--theme-500)]/80 text-white shadow-[0_0_10px_var(--theme-400)]' : 'bg-black/50 text-white/50 border border-white/10'}`}>{data.name}</div>
        </Html>
      </mesh>
      
      {data.name === 'Saturn' && (
        <mesh rotation={[Math.PI / 2, 0, 0]} position={pos}>
          <ringGeometry args={[data.radius * 1.5, data.radius * 2.2, 64]} />
          <meshBasicMaterial color="#fde68a" transparent opacity={0.6} side={THREE.DoubleSide} />
        </mesh>
      )}

      <Line 
        points={orbitPoints} 
        color={isSelected ? data.color : '#ffffff'} 
        opacity={isSelected ? 0.8 : 0.05} 
        lineWidth={isSelected ? 3 : 1}
        transparent 
      />
    </group>
  );
}

function AsteroidBelt({ sunPos, isSelected, onClick, onDoubleClick }: any) {
  const count = 3000;
  const meshRef = useRef<THREE.InstancedMesh>(null);
  
  useEffect(() => {
    if (!meshRef.current) return;
    const dummy = new THREE.Object3D();
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = 400 + Math.random() * 500;
      dummy.position.set(
        sunPos.x + r * Math.cos(angle),
        (Math.random() - 0.5) * 50,
        sunPos.z + r * Math.sin(angle)
      );
      dummy.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
      const s = 0.5 + Math.random() * 1.5;
      dummy.scale.set(s, s, s);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [sunPos]);

  return (
    <group>
      <instancedMesh ref={meshRef} args={[undefined, undefined, count]} onClick={(e) => { e.stopPropagation(); onClick('Asteroid Belt'); }} onDoubleClick={onDoubleClick}>
        <dodecahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color={isSelected ? '#f97316' : '#888888'} roughness={0.9} emissive={isSelected ? '#ea580c' : '#000000'} emissiveIntensity={isSelected ? 0.5 : 0} />
      </instancedMesh>
      {isSelected && (
        <mesh position={[sunPos.x, 0, sunPos.z]} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[400, 900, 64]} />
          <meshBasicMaterial color="#f97316" transparent opacity={0.1} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
}

function CelestialBodies({ onDoubleClick, selectedPlanet, setSelectedPlanet }: { onDoubleClick: (e: any) => void, selectedPlanet: string | null, setSelectedPlanet: (v: string) => void }) {
  const sunPos = new THREE.Vector3(-200, 0, 0);
  const earthOrbitRadius = 200;
  const moonDistance = 15;
  
  const moonMap = useTexture('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/moon_1024.jpg');

  const earthOrbitPoints = useMemo(() => {
    const pts = [];
    for (let i = 0; i <= 128; i++) {
      const a = (i / 128) * Math.PI * 2;
      pts.push(new THREE.Vector3(sunPos.x + earthOrbitRadius * Math.cos(a), 0, sunPos.z + earthOrbitRadius * Math.sin(a)));
    }
    return pts;
  }, [sunPos]);

  return (
    <>
      <mesh position={sunPos} onDoubleClick={onDoubleClick}>
        <sphereGeometry args={[15, 64, 64]} />
        <meshBasicMaterial color="#ffcc00" />
        <pointLight intensity={3} distance={10000} color="#ffeedd" />
        <Html position={[0, 20, 0]} center style={{ pointerEvents: 'none' }}>
          <div className="text-yellow-400/80 font-black text-2xl uppercase tracking-[0.5em] glow">SUN</div>
        </Html>
      </mesh>

      <Line points={earthOrbitPoints} color={selectedPlanet === 'Earth' ? '#38bdf8' : '#ffffff'} opacity={selectedPlanet === 'Earth' ? 0.8 : 0.05} lineWidth={selectedPlanet === 'Earth' ? 3 : 1} transparent />

      <mesh position={[moonDistance, 0, 0]} onDoubleClick={onDoubleClick}>
        <sphereGeometry args={[1737 * SCALE * 2, 32, 32]} />
        <meshStandardMaterial map={moonMap} roughness={0.9} />
      </mesh>

      {PLANET_DATA.map(p => (
        <Planet key={p.name} data={p} sunPos={sunPos} isSelected={selectedPlanet === p.name} onClick={setSelectedPlanet} onDoubleClick={onDoubleClick} />
      ))}

      <AsteroidBelt sunPos={sunPos} isSelected={selectedPlanet === 'Asteroid Belt'} onClick={setSelectedPlanet} onDoubleClick={onDoubleClick} />
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
        if (!positionAndVelocity || typeof positionAndVelocity === 'boolean') continue;
        const pos = positionAndVelocity.position as satellite.EciVec3<number>;
        if (pos && typeof pos !== 'boolean') {
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
      <meshStandardMaterial color="#22d3ee" roughness={0.2} metalness={0.8} emissive="#06b6d4" emissiveIntensity={0.5} />
    </instancedMesh>
  );
}

function OrbitPath({ satrec }: { satrec: satellite.SatRec }) {
  const points = [];
  const now = new Date();
  for (let i = 0; i < 120; i++) {
    const d = new Date(now.getTime() + i * 60000);
    const pv = satellite.propagate(satrec, d);
    if (!pv || typeof pv === 'boolean') continue;
    const pos = pv.position as satellite.EciVec3<number>;
    if (pos && typeof pos !== 'boolean') points.push(new THREE.Vector3(pos.x * SCALE, pos.z * SCALE, -pos.y * SCALE));
  }
  if (points.length === 0) return null;

  return (
    <Line points={points} color="#22d3ee" lineWidth={2} dashed dashSize={0.5} gapSize={0.2} opacity={0.8} transparent />
  );
}

function TargetSatellite({ satrec, timeOffset, isRideMode, velocity, name, onDoubleClick }: { satrec: satellite.SatRec, timeOffset: number, isRideMode: boolean, velocity: (v: number) => void, name?: string, onDoubleClick?: (e: any) => void }) {
  const groupRef = useRef<THREE.Group>(null);
  const { camera } = useThree();
  const [localSpeed, setLocalSpeed] = useState(0);

  useFrame(() => {
    const d = new Date(Date.now() + timeOffset * 60000);
    const pv = satellite.propagate(satrec, d);
    if (!pv || !pv.position || !pv.velocity) return;
    const pos = pv.position as satellite.EciVec3<number>;
    const vel = pv.velocity as satellite.EciVec3<number>;

    if (groupRef.current) {
      const x = pos.x * SCALE;
      const y = pos.z * SCALE;
      const z = -pos.y * SCALE;
      const satPos = new THREE.Vector3(x, y, z);
      
      groupRef.current.position.copy(satPos);
      
      const target = new THREE.Vector3(x + vel.x, y + vel.z, z - vel.y);
      groupRef.current.lookAt(target);

      const speed = Math.sqrt(vel.x*vel.x + vel.y*vel.y + vel.z*vel.z);
      setLocalSpeed(speed);
      velocity(speed);
    }
  });

  const upperName = name?.toUpperCase() || '';
  const isSmap = upperName.includes('SMAP');
  const isHubble = upperName.includes('HUBBLE');
  const isStarlink = upperName.includes('STARLINK');

  return (
    <group ref={groupRef} onDoubleClick={onDoubleClick}>
      {isSmap ? (
        <Model url="/models/SMAP.glb" scale={0.5} />
      ) : isHubble ? (
        <Model url="/models/Hubble-1.glb" scale={0.01} />
      ) : isStarlink ? (
        <Model url="/models/starlink_spacex_satellite.glb" scale={0.2} />
      ) : (
        <mesh>
          <boxGeometry args={[0.3, 0.3, 0.8]} />
          <meshStandardMaterial color="#fff" emissive="#06b6d4" emissiveIntensity={2} />
        </mesh>
      )}
      
      {/* Real-time Velocity readout floating near satellite */}
      <Html position={[0, 0.5, 0]} center style={{ pointerEvents: 'none' }}>
        <div className="text-[10px] font-mono text-[var(--theme-400)] bg-black/50 px-1 py-0.5 rounded border border-[var(--theme-500)]/30 backdrop-blur-sm whitespace-nowrap">
          v: {Math.round(localSpeed * 10) / 10} km/s
        </div>
      </Html>
    </group>
  );
}

function SMAPModel() {
  return (
    <group scale={0.5}>
      {/* Bus / Main Body */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.4, 0.4, 0.8]} />
        <meshStandardMaterial color="#ffffff" metalness={0.5} roughness={0.5} />
      </mesh>
      
      {/* Solar Panel */}
      <mesh position={[-0.6, 0, 0]} rotation={[0, 0, -Math.PI / 8]}>
        <boxGeometry args={[0.8, 0.05, 0.4]} />
        <meshStandardMaterial color="#1e3a8a" metalness={0.8} roughness={0.2} emissive="#1e40af" emissiveIntensity={0.2} />
      </mesh>

      {/* Boom Arm */}
      <mesh position={[0, 0.6, 0.2]} rotation={[Math.PI / 8, 0, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 1.2]} />
        <meshStandardMaterial color="#eab308" metalness={0.8} roughness={0.4} /> {/* Golden boom */}
      </mesh>

      {/* Large Spinning Antenna Reflector */}
      <mesh position={[0, 1.2, 0.4]} rotation={[Math.PI / 2 + Math.PI/8, 0, 0]}>
        <cylinderGeometry args={[1.5, 1.5, 0.05, 32]} />
        <meshStandardMaterial color="#d4d4d8" metalness={0.6} roughness={0.7} wireframe={true} />
      </mesh>
      
      {/* Solid dish backing */}
      <mesh position={[0, 1.2, 0.4]} rotation={[Math.PI / 2 + Math.PI/8, 0, 0]}>
        <cylinderGeometry args={[1.48, 1.48, 0.04, 32]} />
        <meshStandardMaterial color="#a1a1aa" metalness={0.5} roughness={0.8} transparent opacity={0.5} />
      </mesh>
    </group>
  );
}

function CameraController({ isRideMode, targetSatrec, timeOffset, controlsRef, manualTarget }: { isRideMode: boolean, targetSatrec: satellite.SatRec | null, timeOffset: number, controlsRef: any, manualTarget: THREE.Vector3 | null }) {
  useFrame((state) => {
    if (!controlsRef.current) return;
    
    if (manualTarget) {
      controlsRef.current.target.lerp(manualTarget, 0.05);
    } else if (isRideMode && targetSatrec) {
      const d = new Date(Date.now() + timeOffset * 60000);
      const pv = satellite.propagate(targetSatrec, d);
      if (!pv || typeof pv === 'boolean') return;
      const pos = pv.position as satellite.EciVec3<number>;
      if (pos && typeof pos !== 'boolean') {
        const satPos = new THREE.Vector3(pos.x * SCALE, pos.z * SCALE, -pos.y * SCALE);
        controlsRef.current.target.lerp(satPos, 0.05);
        
        const dist = state.camera.position.distanceTo(satPos);
        if (dist > 3) {
          const desiredPos = satPos.clone().add(new THREE.Vector3(1, 1, 1).normalize().multiplyScalar(2));
          state.camera.position.lerp(desiredPos, 0.02);
        }
      }
    } else {
      controlsRef.current.target.lerp(new THREE.Vector3(0, 0, 0), 0.05);
    }

    // Prevent camera from clipping inside the Earth
    const minDistance = (EARTH_RADIUS_KM * SCALE) + 0.2;
    if (state.camera.position.length() < minDistance) {
      state.camera.position.setLength(minDistance);
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
  const [selectedPlanet, setSelectedPlanet] = useState<string | null>(null);
  const [activeLayer, setActiveLayer] = useState('Satellites Now');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [manualTarget, setManualTarget] = useState<THREE.Vector3 | null>(null);
  const [epicTextureUrl, setEpicTextureUrl] = useState<string | null>(null);
  const controlsRef = useRef<any>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (activeLayer === 'Visible Earth' && !epicTextureUrl) {
      fetch(`https://epic.gsfc.nasa.gov/api/natural`)
        .then(res => {
          if (!res.ok) throw new Error('NASA API Failed');
          return res.json();
        })
        .then(data => {
           if (data && data.length > 0) {
             const latest = data[0];
             const date = new Date(latest.date);
             const year = date.getFullYear();
             const month = String(date.getMonth() + 1).padStart(2, '0');
             const day = String(date.getDate()).padStart(2, '0');
             const imgName = latest.image;
             // Use JPG for faster loading of massive EPIC images
             const url = `https://epic.gsfc.nasa.gov/archive/natural/${year}/${month}/${day}/jpg/${imgName}.jpg`;
             setEpicTextureUrl(url);
           }
        })
        .catch(console.error);
    }
  }, [activeLayer, epicTextureUrl]);

  // Smooth timeline
  const [localTimeOffset, setLocalTimeOffset] = useState(timeOffset);
  useEffect(() => {
    let animationFrameId: number;
    const updateLocalTime = () => {
      setLocalTimeOffset(prev => {
        const diff = timeOffset - prev;
        if (Math.abs(diff) > 0.1) {
          return prev + diff * 0.1;
        }
        return timeOffset;
      });
      animationFrameId = requestAnimationFrame(updateLocalTime);
    };
    animationFrameId = requestAnimationFrame(updateLocalTime);
    return () => cancelAnimationFrame(animationFrameId);
  }, [timeOffset]);

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
          <div className="mt-6 ml-2 flex items-start gap-4 pointer-events-auto">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="mt-2 text-cyan-400 hover:text-white transition-colors">
               <ChevronLeft size={24} className={`transform transition-transform ${sidebarOpen ? '' : 'rotate-180'}`} />
            </button>
            <div>
              <h1 className="text-3xl md:text-5xl font-black text-white tracking-[0.2em] uppercase glitch-text">
                {satName}
              </h1>
              <p className="text-[var(--theme-400)] font-mono tracking-widest uppercase text-xs mt-1">
                Live 3D Orbital Tracking Matrix
              </p>
            </div>
          </div>
          
          {/* NASA Eyes Sidebar: Featured Targets */}
          {sidebarOpen && (
            <div className="mt-8 ml-2 pointer-events-auto w-80">
             <div className="text-[10px] text-white/50 uppercase tracking-widest font-mono mb-3">Featured Stories and Events</div>
             <div className="flex flex-col space-y-3 max-h-[60vh] overflow-y-auto scrollbar-hide pr-4">
                {tles.filter(t => t.name.includes('ISS') || t.name.includes('HUBBLE') || t.name.includes('SMAP') || t.name.includes('NOAA') || t.name.includes('STARLINK')).slice(0, 10).map((sat, idx) => (
                   <button
                     key={sat.id}
                     onClick={() => {
                        setTargetSatrec(sat.satrec);
                        setSatName(sat.name);
                        setIsRideMode(true);
                     }}
                     className="glass-panel rounded-xl overflow-hidden border border-white/10 hover:border-[var(--theme-500)]/50 hover:bg-[var(--theme-500)]/10 text-left transition-all group relative bg-[#111115]"
                   >
                     <div className="p-4">
                       <h3 className="text-white font-bold text-lg leading-tight w-3/4">{sat.name}</h3>
                       <div className="text-[10px] text-[var(--theme-400)] font-mono uppercase tracking-widest mt-2">
                         ORBITAL INSERTION RECORD
                       </div>
                       <div className="text-[10px] text-[var(--theme-300)] opacity-70 font-mono mt-1">
                         TRACK LIVE TRAJECTORY
                       </div>
                     </div>
                     
                     {/* Thumbnail Placeholder graphic on the right side of the card */}
                     <div className="absolute top-0 right-0 h-full w-1/3 opacity-30 group-hover:opacity-60 transition-opacity flex items-center justify-center">
                       <svg className="w-16 h-16 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                          <circle cx="12" cy="12" r="10" />
                          <line x1="2" y1="12" x2="22" y2="12" />
                          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                       </svg>
                     </div>
                   </button>
                ))}
             </div>
          </div>
          )}
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
        </div>
      </div>
           
      {/* NASA Eyes Bottom Timeline UI */}
      <div className="absolute bottom-0 left-0 w-full p-4 z-20 flex justify-center pointer-events-none">
        <div className="flex flex-col items-center max-w-4xl w-full">
          {/* Top row of timeline text */}
          <div className="flex justify-between w-full text-white font-mono text-sm tracking-widest px-4 mb-2">
             <div className="flex items-center space-x-2 text-green-400">
               <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
               <span>LIVE</span>
             </div>
             <div>
               {mounted ? new Date(Date.now() + timeOffset * 60000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase() : ''}
             </div>
             <div className="text-green-400 font-bold">REAL RATE</div>
             <div>
               {mounted ? new Date(Date.now() + timeOffset * 60000).toLocaleTimeString('en-US') : ''}
             </div>
          </div>
          
          {/* Elliptical timeline slider mimicking NASA Eyes */}
          <div className="relative w-full h-8 flex items-center pointer-events-auto">
             {/* Curved background line */}
             <div className="absolute inset-0 border-t border-white/20 rounded-[50%] h-16 pointer-events-none" style={{ marginTop: '16px' }} />
             
             {/* Flat slider input */}
             <input
                type="range"
                min="-1440"
                max="1440"
                value={timeOffset}
                onChange={(e) => setTimeOffset(parseInt(e.target.value))}
                className="w-full h-1 bg-transparent appearance-none cursor-pointer outline-none relative z-10 custom-eyes-slider"
                style={{
                  background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.2) 20%, rgba(255,255,255,0.2) 80%, transparent)'
                }}
              />
              
              {/* Center thumb indicator */}
              <div 
                className="absolute w-8 h-8 rounded-full border-2 border-white/30 bg-green-500/20 flex items-center justify-center pointer-events-none z-0"
                style={{ left: `calc(${((timeOffset + 1440) / 2880) * 100}% - 16px)` }}
              >
                 <div className="w-3 h-3 rounded-full bg-green-400 shadow-[0_0_10px_#4ade80]" />
              </div>
          </div>
          
          {/* Bottom Nav Bar matching NASA Eyes "Vital Signs" */}
          <div className="w-screen bg-[#05050a]/90 backdrop-blur-md border-t border-white/10 mt-6 -mx-4 -mb-4 px-8 py-3 flex items-center justify-center space-x-6 text-xs text-white/50 tracking-wide pointer-events-auto overflow-x-auto whitespace-nowrap scrollbar-hide">
            {['Satellites Now', 'Visible Earth', 'Air Temperature', 'Carbon Dioxide', 'Carbon Monoxide', 'Chlorophyll', 'Sea Level', 'Sea Surface Temperature', 'Soil Moisture'].map(layer => (
              <button 
                key={layer}
                onClick={() => setActiveLayer(layer)}
                className={`hover:text-white cursor-pointer transition-colors ${activeLayer === layer ? 'text-[var(--theme-400)] font-bold' : ''}`}
              >
                {layer}
              </button>
            ))}
          </div>
        </div>
      </div>

      <Canvas camera={{ position: [0, 0, 25], fov: 45 }}>
        <color attach="background" args={['#020205']} />
        <ambientLight intensity={0.2} />
        <directionalLight position={[50, 20, 10]} intensity={1.5} />
        
        <Stars radius={150} depth={50} count={8000} factor={4} saturation={0} fade speed={1} />
        
        <Earth activeLayer={activeLayer} epicTextureUrl={epicTextureUrl} onDoubleClick={(e) => { e.stopPropagation(); setManualTarget(e.point); setIsRideMode(false); setSelectedPlanet('Earth'); }} />
        <CelestialBodies onDoubleClick={(e) => { e.stopPropagation(); setManualTarget(e.point); setIsRideMode(false); }} selectedPlanet={selectedPlanet} setSelectedPlanet={setSelectedPlanet} />
        
        {activeLayer === 'Satellites Now' && <GlobalConstellation tles={tles} timeOffset={localTimeOffset} />}
        
        {activeLayer === 'Satellites Now' && tles.filter(t => t.name.includes('ISS') || t.name.includes('SMAP') || t.name.includes('HUBBLE')).map(t => (
          <OrbitPath key={t.id} satrec={t.satrec} />
        ))}
        
        {targetSatrec && activeLayer === 'Satellites Now' && (
          <TargetSatellite satrec={targetSatrec} timeOffset={localTimeOffset} isRideMode={isRideMode} velocity={setCurrentSpeed} name={satName} onDoubleClick={(e) => { e.stopPropagation(); setManualTarget(e.point); setIsRideMode(false); }} />
        )}
        <CameraController isRideMode={isRideMode} targetSatrec={targetSatrec} timeOffset={localTimeOffset} controlsRef={controlsRef} manualTarget={manualTarget} />
        <OrbitControls ref={controlsRef} enablePan={true} enableZoom={true} minDistance={0.5} maxDistance={200} />
      </Canvas>
    </div>
  );
}
