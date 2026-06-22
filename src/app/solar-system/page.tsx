'use client';

import React, { useEffect, useState, useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Line, Html, useTexture, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import * as satellite from 'satellite.js';
import Link from 'next/link';
import { ChevronLeft, Camera, Navigation, Zap, Globe } from 'lucide-react';
import { useRadarStore } from '@/store/useRadarStore';
import { useSearchParams } from 'next/navigation';
import { DynamicSatellite, getSatelliteModelInfo } from '@/components/3D/DynamicSatellite';

const EARTH_RADIUS_KM = 6371;
const SCALE = 1 / 1000;

const PLANET_DATA = [
  { name: 'Mercury', orbitRadius: 77, radius: 2.4, color: '#a8a29e', angle: 1.2, speed: 0.004, tilt: 0.034 * Math.PI / 180 },
  { name: 'Venus', orbitRadius: 144, radius: 6, color: '#fcd34d', angle: 2.5, speed: 0.0015, tilt: 177.36 * Math.PI / 180 },
  { name: 'Mars', orbitRadius: 300, radius: 3.3, color: '#b91c1c', angle: 4.1, speed: 0.0008, tilt: 25.19 * Math.PI / 180 },
  { name: 'Jupiter', orbitRadius: 1040, radius: 15, color: '#d97706', angle: 0.5, speed: 0.0002, tilt: 3.13 * Math.PI / 180 },
  { name: 'Saturn', orbitRadius: 1900, radius: 12, color: '#fde047', angle: 5.2, speed: 0.0001, tilt: 26.73 * Math.PI / 180 },
  { name: 'Uranus', orbitRadius: 3800, radius: 10, color: '#38bdf8', angle: 3.1, speed: 0.00005, tilt: 97.77 * Math.PI / 180 },
  { name: 'Neptune', orbitRadius: 6000, radius: 10, color: '#1d4ed8', angle: 1.8, speed: 0.00003, tilt: 28.32 * Math.PI / 180 },
  { name: 'Pluto', orbitRadius: 7800, radius: 1.5, color: '#e5e7eb', angle: 2.2, speed: 0.00001, tilt: 122.53 * Math.PI / 180 },
];



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
      {activeLayer === 'Satellites Now' ? (
        <group ref={earthRef as any}>
          <CustomPlanetModel name="earth" radius={EARTH_RADIUS_KM * SCALE} />
        </group>
      ) : (
        <mesh ref={earthRef as any}>
          <sphereGeometry args={[EARTH_RADIUS_KM * SCALE, 64, 64]} />
          <meshStandardMaterial 
            map={activeLayer === 'Visible Earth' && epicTexture ? epicTexture : undefined}
            color={activeLayer === 'Visible Earth' ? '#ffffff' : earthColor} 
            roughness={0.7} 
            metalness={0.1} 
          />
          {/* Atmosphere */}
          <mesh>
            <sphereGeometry args={[EARTH_RADIUS_KM * SCALE * 1.03, 32, 32]} />
            <meshBasicMaterial color="#22d3ee" transparent opacity={0.1} side={THREE.BackSide} />
          </mesh>
        </mesh>
      )}
    </group>
  );
}

function CustomPlanetModel({ name, radius, tilt = 0 }: { name: string, radius: number, tilt?: number }) {
  const { scene } = useGLTF(`/models/planets/${name.toLowerCase()}.glb`);
  const clonedScene = useMemo(() => {
    const clone = scene.clone();
    const box = new THREE.Box3().setFromObject(clone);
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    if (maxDim > 0) clone.scale.set(1/maxDim, 1/maxDim, 1/maxDim);
    
    // Apply axial tilt
    clone.rotation.x = tilt;
    
    return clone;
  }, [scene, tilt]);

  return (
    <group scale={radius * 2}>
      <primitive object={clonedScene} />
    </group>
  );
}

function Planet({ data, sunPos, isSelected, onClick, onDoubleClick, timeOffset }: any) {
  const meshRef = useRef<THREE.Group>(null);
  
  useFrame(() => {
    if (meshRef.current) {
      // Tie planet orbit directly to the Zenith Time Machine!
      const currentAngle = data.angle + (timeOffset * data.speed);
      meshRef.current.position.set(
        sunPos.x + data.orbitRadius * Math.cos(currentAngle),
        0,
        sunPos.z + data.orbitRadius * Math.sin(currentAngle)
      );
    }
  });

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
      <group ref={meshRef}>
        <group onClick={(e) => { e.stopPropagation(); onClick(data.name); }} onDoubleClick={onDoubleClick}>
          <CustomPlanetModel name={data.name} radius={data.radius} tilt={data.tilt} />
          
          {/* Invisible hit-box sphere to make clicking easier */}
          <mesh visible={false}>
            <sphereGeometry args={[data.radius * 1.5, 16, 16]} />
            <meshBasicMaterial />
          </mesh>

          <Html position={[0, data.radius + 5, 0]} center style={{ pointerEvents: 'none' }}>
            <div className={`font-mono text-[10px] uppercase tracking-[0.3em] px-2 py-1 rounded backdrop-blur-sm transition-colors ${isSelected ? 'bg-[var(--theme-500)]/80 text-white shadow-[0_0_10px_var(--theme-400)]' : 'bg-black/50 text-white/50 border border-white/10'}`}>{data.name}</div>
          </Html>
        </group>
      </group>

      <Line 
        points={orbitPoints} 
        color={isSelected ? data.color : data.orbitColor} 
        opacity={isSelected ? 0.8 : 0.4} 
        lineWidth={isSelected ? 3 : 1}
        transparent 
      />
    </group>
  );
}

function AsteroidBelt({ sunPos, seed, count = 1000 }: { sunPos: THREE.Vector3, seed: number, count?: number }) {
  const meshRefs = useRef<THREE.InstancedMesh[]>([]);
  
  const asteroidUrls = useMemo(() => [
    '/models/asteroids/asteroid_with_lava.glb',
    '/models/asteroids/asteroid_with_minerals.glb',
    '/models/asteroids/coral_stone.glb',
    '/models/asteroids/small_asteroid.glb',
    '/models/asteroids/small_stone_asteroid.glb',
    '/models/asteroids/stoney_asteroids.glb',
    '/models/asteroids/wandering_asteroids_of_andromeda.glb'
  ], []);

  const gltfs = useGLTF(asteroidUrls) as any[];
  const [geometries, setGeometries] = useState<THREE.BufferGeometry[]>([]);

  useEffect(() => {
    const geoms: THREE.BufferGeometry[] = [];
    gltfs.forEach((gltf) => {
      if (gltf.scene) {
        gltf.scene.traverse((c: any) => {
          if (c.isMesh && c.geometry) {
             const geom = c.geometry.clone();
             geom.center(); // Center vertices at 0,0,0 to fix offsets
             geom.computeBoundingBox();
             if (geom.boundingBox) {
                 const size = new THREE.Vector3();
                 geom.boundingBox.getSize(size);
                 const max = Math.max(size.x, size.y, size.z);
                 if (max > 0) {
                     geom.scale(1/max, 1/max, 1/max); // Normalize to 1 unit diameter
                 }
             }
             geoms.push(geom);
          }
        });
      }
    });
    if (geoms.length > 0) setGeometries(geoms);
  }, [gltfs]);

  useEffect(() => {
    if (geometries.length === 0) return;
    const dummy = new THREE.Object3D();
    
    let currentSeed = seed * 12345;
    const random = () => {
      currentSeed = (currentSeed * 9301 + 49297) % 233280;
      return currentSeed / 233280;
    };

    for (let i = 0; i < count; i++) {
      const angle = random() * Math.PI * 2;
      const r = 400 + random() * 600; 
      const ySpread = (random() - 0.5) * (150 * (1 - Math.abs(r - 700) / 400));
      dummy.position.set(
        sunPos.x + r * Math.cos(angle),
        ySpread,
        sunPos.z + r * Math.sin(angle)
      );
      dummy.rotation.set(random() * Math.PI, random() * Math.PI, 0);
      const s = (0.5 + random() * 1.5) * 5.0; // Restored to 5.0 since geometries are now strictly 1 unit diameter natively
      dummy.scale.set(s, s, s);
      dummy.updateMatrix();
      
      const meshIdx = Math.floor(random() * geometries.length);
      if (meshRefs.current[meshIdx]) {
        const localIdx = Math.floor(i / geometries.length);
        meshRefs.current[meshIdx].setMatrixAt(localIdx, dummy.matrix);
      }
    }
    
    meshRefs.current.forEach(m => {
      if (m) m.instanceMatrix.needsUpdate = true;
    });
  }, [sunPos, count, seed, geometries]);

  return (
    <group>
      {geometries.map((geom, idx) => (
        <instancedMesh key={idx} ref={(el) => { if (el) meshRefs.current[idx] = el; }} args={[geom, undefined, Math.ceil(count / geometries.length)]}>
          <meshStandardMaterial color="#888888" />
        </instancedMesh>
      ))}
    </group>
  );
}

function CelestialBodies({ onDoubleClick, selectedPlanet, setSelectedPlanet, timeOffset }: { onDoubleClick: (e: any) => void, selectedPlanet: string | null, setSelectedPlanet: (v: string) => void, timeOffset: number }) {
  const sunPos = new THREE.Vector3(-200, 0, 0);
  const earthOrbitRadius = 200;
  const moonDistance = 30; // Moved further away
  
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
          <div className="text-yellow-400/80 font-black text-2xl uppercase tracking-[0.5em]">SUN</div>
        </Html>
      </mesh>

      <Line points={earthOrbitPoints} color={selectedPlanet === 'Earth' ? '#38bdf8' : '#38bdf8'} opacity={selectedPlanet === 'Earth' ? 0.8 : 0.4} lineWidth={selectedPlanet === 'Earth' ? 3 : 1} transparent />

      <group position={[moonDistance, 0, 0]} onDoubleClick={onDoubleClick}>
        <CustomPlanetModel name="moon" radius={1737 * SCALE} tilt={1.54 * Math.PI / 180} />
      </group>

      {PLANET_DATA.map(p => (
        <Planet key={p.name} data={p} sunPos={sunPos} isSelected={selectedPlanet === p.name} onClick={setSelectedPlanet} onDoubleClick={onDoubleClick} timeOffset={timeOffset} />
      ))}

      <AsteroidBelt sunPos={sunPos} seed={0} count={60} />
    </>
  );
}

function Torchlight() {
  const { camera } = useThree();
  const lightRef = useRef<THREE.PointLight>(null);
  useFrame(() => {
    if (lightRef.current) {
       lightRef.current.position.copy(camera.position);
    }
  });
  return <pointLight ref={lightRef} intensity={10.0} distance={2000} decay={1.5} color="#ffffff" />;
}

function FlyingModel({ satrec, name, timeOffset, showOrbit }: { satrec: satellite.SatRec, name: string, timeOffset: number, showOrbit: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  
  const orbitPoints = useMemo(() => {
     const pts = [];
     for(let i=0; i<=90; i++) {
        const d = new Date(Date.now() + i * 60000);
        const pv = satellite.propagate(satrec, d);
        if(pv && pv.position && typeof pv.position !== 'boolean') {
           const pos = pv.position as satellite.EciVec3<number>;
           pts.push(new THREE.Vector3(pos.x * SCALE, pos.z * SCALE, -pos.y * SCALE));
        }
     }
     return pts;
  }, [satrec]);

  useFrame(() => {
    if (groupRef.current) {
      const d = new Date(Date.now() + timeOffset * 60000);
      const pv = satellite.propagate(satrec, d);
      if (pv && pv.position && typeof pv.position !== 'boolean') {
        const pos = pv.position as satellite.EciVec3<number>;
        groupRef.current.position.set(pos.x * SCALE, pos.z * SCALE, -pos.y * SCALE);
        
        if (pv.velocity && typeof pv.velocity !== 'boolean') {
          const vel = pv.velocity as satellite.EciVec3<number>;
          const target = new THREE.Vector3(pos.x * SCALE + vel.x, pos.z * SCALE + vel.z, -pos.y * SCALE - vel.y);
          groupRef.current.lookAt(target);
        }
      }
    }
  });

  return (
    <>
      <group ref={groupRef}>
        <DynamicSatellite name={name} isDebris={false} />
      </group>
      {showOrbit && orbitPoints.length > 0 && (
         <Line points={orbitPoints} color="#22d3ee" lineWidth={1} opacity={0.3} transparent />
      )}
    </>
  );
}

function GenericInstancedMesh({ tles, timeOffset, isDebris }: { tles: {satrec: satellite.SatRec}[], timeOffset: number, isDebris: boolean }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const currentIdx = useRef(0);

  const { scene } = useGLTF('/models/other_satellites/CubeSat - 1 RU Generic.glb');
  const [cubesatGeom, setCubesatGeom] = useState<THREE.BufferGeometry | null>(null);
  
  useEffect(() => {
    if (!isDebris && scene) {
       let geom: THREE.BufferGeometry | null = null;
       scene.traverse((c) => {
         if ((c as THREE.Mesh).isMesh && !geom) geom = (c as THREE.Mesh).geometry;
       });
       if (geom) setCubesatGeom(geom);
    }
  }, [scene, isDebris]);

  useFrame((state) => {
    if (!meshRef.current || tles.length === 0) return;
    
    const d = new Date(Date.now() + timeOffset * 60000);
    const CHUNK_SIZE = 150;
    const end = Math.min(currentIdx.current + CHUNK_SIZE, tles.length);
    
    for (let i = currentIdx.current; i < end; i++) {
      try {
        const pv = satellite.propagate(tles[i].satrec, d);
        if (pv && pv.position && typeof pv.position !== 'boolean') {
          const pos = pv.position as satellite.EciVec3<number>;
          dummy.position.set(pos.x * SCALE, pos.z * SCALE, -pos.y * SCALE);
          
          if (pv.velocity && typeof pv.velocity !== 'boolean') {
            const vel = pv.velocity as satellite.EciVec3<number>;
            const target = new THREE.Vector3(pos.x * SCALE + vel.x, pos.z * SCALE + vel.z, -pos.y * SCALE - vel.y);
            dummy.lookAt(target);
          }
          
          // Extracted GLB geometries lack parent node scale down, so we forcefully scale them down
          const s = isDebris ? 0.02 : 0.002;
          dummy.scale.set(s, s, s);
          dummy.updateMatrix();
          meshRef.current.setMatrixAt(i, dummy.matrix);
        }
      } catch(e) {}
    }
    
    meshRef.current.instanceMatrix.needsUpdate = true;
    currentIdx.current = end;
    if (currentIdx.current >= tles.length) {
      currentIdx.current = 0;
    }
  });

  if (tles.length === 0) return null;

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, tles.length]}>
      {isDebris ? (
         <dodecahedronGeometry args={[1, 0]} />
      ) : cubesatGeom ? (
         <primitive object={cubesatGeom} attach="geometry" />
      ) : (
         <boxGeometry args={[1, 1, 2]} />
      )}
      <meshStandardMaterial color={isDebris ? "#ef4444" : "#e5e7eb"} roughness={0.4} metalness={0.6} emissive={isDebris ? "#ef4444" : "#06b6d4"} emissiveIntensity={isDebris ? 0.5 : 0.2} />
    </instancedMesh>
  );
}

function GlobalConstellation({ tles, timeOffset, showOrbitPaths }: { tles: {satrec: satellite.SatRec, type: string, id: string, name: string}[], timeOffset: number, showOrbitPaths: boolean }) {
  // Render max 150 complex models to save FPS. Use generic cubesats for the rest.
  const allPayloads = useMemo(() => tles.filter(t => t.type !== 'DEBRIS'), [tles]);
  const specificModels = useMemo(() => allPayloads.slice(0, 150), [allPayloads]);
  const genericPayloads = useMemo(() => allPayloads.slice(150), [allPayloads]);
  const debris = useMemo(() => tles.filter(t => t.type === 'DEBRIS'), [tles]);

  return (
    <group>
      <GenericInstancedMesh tles={genericPayloads} timeOffset={timeOffset} isDebris={false} />
      <GenericInstancedMesh tles={debris} timeOffset={timeOffset} isDebris={true} />
      
      {specificModels.map(t => (
         <FlyingModel key={t.id} satrec={t.satrec} name={t.name} timeOffset={timeOffset} showOrbit={showOrbitPaths} />
      ))}
    </group>
  );
}

function OrbitPath({ satrec, isDebris }: { satrec: satellite.SatRec, isDebris: boolean }) {
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
    <Line points={points} color={isDebris ? '#ef4444' : '#22d3ee'} lineWidth={2} dashed dashSize={0.5} gapSize={0.2} opacity={0.8} transparent />
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

  return (
    <group ref={groupRef} onDoubleClick={onDoubleClick}>
      <DynamicSatellite name={name || ''} isDebris={false} />
      
      <Html position={[0, 0.5, 0]} center style={{ pointerEvents: 'none' }}>
        <div className="text-[10px] font-mono text-[var(--theme-400)] bg-black/50 px-1 py-0.5 rounded border border-[var(--theme-500)]/30 backdrop-blur-sm whitespace-nowrap">
          v: {Math.round(localSpeed * 10) / 10} km/s
        </div>
      </Html>
    </group>
  );
}

function CameraController({ isRideMode, targetSatrec, timeOffset, controlsRef, manualTarget, selectedPlanet }: any) {
  const { camera } = useThree();
  
  useEffect(() => {
    const light = new THREE.PointLight(0xffffff, 1.5, 100);
    camera.add(light);
    return () => { camera.remove(light); };
  }, [camera]);

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
    } else if (selectedPlanet && selectedPlanet !== 'Earth') {
      const p = PLANET_DATA.find(x => x.name === selectedPlanet);
      if (p) {
         const currentAngle = p.angle + (timeOffset * p.speed);
         const target = new THREE.Vector3(
           -200 + p.orbitRadius * Math.cos(currentAngle),
           0,
           p.orbitRadius * Math.sin(currentAngle)
         );
         controlsRef.current.target.lerp(target, 0.05);
         
         const dist = state.camera.position.distanceTo(target);
         if (dist > p.radius * 4) {
           const desiredPos = target.clone().add(new THREE.Vector3(1, 0.5, 1).normalize().multiplyScalar(p.radius * 3));
           state.camera.position.lerp(desiredPos, 0.02);
         }
      }
    } else {
      const target = new THREE.Vector3(0, 0, 0);
      controlsRef.current.target.lerp(target, 0.05);
      
      if (selectedPlanet === 'Earth') {
         const dist = state.camera.position.distanceTo(target);
         const earthRadius = EARTH_RADIUS_KM * SCALE;
         if (dist > earthRadius * 5) {
           const desiredPos = target.clone().add(new THREE.Vector3(1, 0.5, 1).normalize().multiplyScalar(earthRadius * 4));
           state.camera.position.lerp(desiredPos, 0.02);
         }
      }
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
  const [showTorchlight, setShowTorchlight] = useState(false);
  const [showOrbitPaths, setShowOrbitPaths] = useState(true);
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
  const [showPlanetsMenu, setShowPlanetsMenu] = useState(false);
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
        if (Math.abs(diff) > 0.05) {
          // Clamp interpolation speed so dragging large distances doesn't snap violently
          const step = Math.sign(diff) * Math.min(Math.abs(diff * 0.05), 2.0);
          return prev + step;
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

  const displayDate = mounted ? new Date(Date.now() + localTimeOffset * 60000).toLocaleString() : '';
  const formatOffset = (val: number) => {
    const mins = Math.round(val);
    if (mins === 0) return 'NOW';
    const h = Math.floor(Math.abs(mins) / 60);
    const m = Math.abs(mins) % 60;
    return `${mins < 0 ? '-' : '+'}${h > 0 ? h + 'H ' : ''}${m}M`;
  };

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
              <h1 className="text-3xl md:text-5xl font-black text-white tracking-[0.2em] uppercase drop-shadow-md">
                {satName}
              </h1>
              <p className="text-[var(--theme-400)] font-mono tracking-widest uppercase text-xs mt-1">
                Live 3D Orbital Tracking Matrix
              </p>
            </div>
          </div>
          
          <button 
             onClick={() => {
               setTargetSatrec(null);
               setSatName('GLOBAL CONSTELLATION');
               setIsRideMode(false);
               setSelectedPlanet(null);
               setManualTarget(new THREE.Vector3(0, 0, 0));
             }} 
             className="pointer-events-auto mt-4 ml-14 flex items-center space-x-2 px-4 py-2 rounded border border-[var(--theme-500)]/50 bg-black/50 text-[var(--theme-400)] hover:bg-[var(--theme-500)]/20 transition-all font-mono tracking-widest text-xs uppercase"
          >
             <Globe size={16} />
             <span>Back to Earth</span>
          </button>
          
          {/* NASA Eyes Sidebar: Featured Targets */}
          {sidebarOpen && (
            <div className="mt-8 ml-2 pointer-events-auto w-80">
             <div className="text-[10px] text-white/50 uppercase tracking-widest font-mono mb-3">Featured Stories and Events</div>
             <div className="flex flex-col space-y-3 h-[calc(100vh-200px)] overflow-y-auto scrollbar-hide pr-4 pb-20 pointer-events-auto">
                {/* 4 New Static Featured Stories */}
                {[
                  { name: 'Psyche Mars Gravity Assist', date: 'MARS FLYBY ON MAY 15TH, 2026', img: 'planet' },
                  { name: 'Artemis II Launch', date: 'MISSION LAUNCH APRIL 1ST, 2026', img: 'rocket' },
                  { name: 'Comet 31/ATLAS Jupiter Flyby', date: 'MARCH 15TH, 2026', img: 'comet' },
                  { name: 'Voyager\'s Grand Tour', date: '1977 - TODAY', img: 'voyager' }
                ].map((story, idx) => (
                   <button
                     key={`story-${idx}`}
                     onClick={() => {
                        const target = tles[idx + 10] || tles[0]; // Temporary target
                        if (target) setTargetSatrec(target.satrec);
                        setSatName(story.name);
                        setIsRideMode(true);
                        setManualTarget(null);
                     }}
                     className="glass-panel rounded-xl flex-shrink-0 overflow-hidden border border-[var(--theme-500)]/30 hover:border-[var(--theme-500)]/70 hover:bg-[var(--theme-500)]/20 text-left transition-all group relative bg-[#111115]"
                   >
                     <div className="p-4">
                       <h3 className="text-white font-bold text-lg leading-tight w-3/4">{story.name}</h3>
                       <div className="text-[10px] text-[#fcd34d] font-mono uppercase tracking-widest mt-2">
                         {story.date}
                       </div>
                     </div>
                     <div className="absolute top-0 right-0 h-full w-1/3 opacity-30 group-hover:opacity-60 transition-opacity flex items-center justify-center">
                       <svg className="w-16 h-16 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                          <circle cx="12" cy="12" r="10" />
                          <line x1="12" y1="8" x2="12" y2="16" />
                          <line x1="8" y1="12" x2="16" y2="12" />
                       </svg>
                     </div>
                   </button>
                ))}

                {tles.filter(t => (t.name.includes('ISS') && !t.name.includes('NAUKA') && !t.name.includes('OBJECT')) || t.name.includes('HUBBLE') || t.name.includes('HST') || t.name.includes('SMAP') || t.name.includes('NOAA') || t.name.includes('STARLINK')).slice(0, 10).map((sat, idx) => (
                   <button
                     key={sat.id}
                     onClick={() => {
                        setTargetSatrec(sat.satrec);
                        setSatName(sat.name);
                        setIsRideMode(true);
                        setManualTarget(null);
                     }}
                     className="glass-panel rounded-xl flex-shrink-0 overflow-hidden border border-white/10 hover:border-[var(--theme-500)]/50 hover:bg-[var(--theme-500)]/10 text-left transition-all group relative bg-[#111115]"
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
          {/* Top row of timeline text and buttons */}
          <div className="flex justify-between items-center w-full text-white font-mono text-sm tracking-widest px-4 mb-2 pointer-events-auto">
             <div className="flex items-center space-x-2 text-green-400">
               <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
               <span>{timeOffset === 0 ? 'LIVE' : 'SIM'}</span>
             </div>
             
             <div className="flex items-center space-x-3 bg-black/50 px-4 py-1 rounded-full border border-white/10">
               <button onClick={() => setTimeOffset(Math.max(-1440, timeOffset - 60))} className="hover:text-[var(--theme-400)] transition-colors">-1H</button>
               <button onClick={() => setTimeOffset(Math.max(-1440, timeOffset - 1))} className="hover:text-[var(--theme-400)] transition-colors">-1M</button>
               <button onClick={() => setTimeOffset(0)} className={`px-3 py-0.5 rounded text-xs font-bold transition-colors ${timeOffset === 0 ? 'bg-green-500 text-black' : 'hover:text-white text-white/50'}`}>LIVE</button>
               <button onClick={() => setTimeOffset(Math.min(1440, timeOffset + 1))} className="hover:text-[var(--theme-400)] transition-colors">+1M</button>
               <button onClick={() => setTimeOffset(Math.min(1440, timeOffset + 60))} className="hover:text-[var(--theme-400)] transition-colors">+1H</button>
             </div>
             
             <div className="text-right">
               <div>{mounted ? new Date(Date.now() + timeOffset * 60000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase() : ''}</div>
               <div className="text-xs opacity-70">{mounted ? new Date(Date.now() + timeOffset * 60000).toLocaleTimeString('en-US') : ''}</div>
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

      {/* WebGL Canvas */}
      <Canvas camera={{ position: [0, 0, 50], fov: 45, near: 0.1, far: 50000 }} gl={{ antialias: true }}>
        <color attach="background" args={['#000000']} />
        <ambientLight intensity={0.1} />
        
        {/* Torchlight attached to camera */}
        {showTorchlight && <Torchlight />}
        <directionalLight position={[50, 20, 10]} intensity={1.5} />
        
        <Stars radius={150} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
        
        <OrbitControls 
          ref={controlsRef} 
          enablePan={false} 
          enableDamping 
          dampingFactor={0.05} 
          minDistance={EARTH_RADIUS_KM * SCALE + 0.5} 
          maxDistance={20000} 
        />
        {/* Massive background sphere to catch raycasting for empty space navigation */}
        <mesh visible={false} onDoubleClick={(e) => { 
          e.stopPropagation(); 
          // Extract point and normalize to prevent massive jumps into the void, 
          // lerping a percentage of the way instead of infinitely far
          const safePoint = e.point.clone().normalize().multiplyScalar(50);
          setManualTarget(safePoint); 
          setIsRideMode(false); 
          setSelectedPlanet(null); 
        }}>
          <sphereGeometry args={[10000, 32, 32]} />
          <meshBasicMaterial side={THREE.BackSide} />
        </mesh>
        
        <Earth activeLayer={activeLayer} epicTextureUrl={epicTextureUrl} onDoubleClick={(e) => { e.stopPropagation(); setManualTarget(e.point); setIsRideMode(false); setSelectedPlanet('Earth'); }} />
        <CelestialBodies onDoubleClick={(e) => { e.stopPropagation(); setManualTarget(e.point); setIsRideMode(false); }} selectedPlanet={selectedPlanet} setSelectedPlanet={setSelectedPlanet} timeOffset={localTimeOffset} />
        
        {activeLayer === 'Satellites Now' && <GlobalConstellation tles={tles} timeOffset={localTimeOffset} showOrbitPaths={showOrbitPaths} />}
        
        {activeLayer === 'Satellites Now' && showOrbitPaths && tles.filter(t => t.name.includes('ISS') || t.name.includes('SMAP') || t.name.includes('HUBBLE')).map(t => (
          <OrbitPath key={t.id} satrec={t.satrec} isDebris={t.type === 'DEBRIS'} />
        ))}
        
        {targetSatrec && activeLayer === 'Satellites Now' && (
          <TargetSatellite satrec={targetSatrec} timeOffset={localTimeOffset} isRideMode={isRideMode} velocity={setCurrentSpeed} name={satName} onDoubleClick={(e) => { e.stopPropagation(); setManualTarget(e.point.clone().normalize().multiplyScalar(50)); setIsRideMode(false); }} />
        )}
        <CameraController isRideMode={isRideMode} targetSatrec={targetSatrec} timeOffset={localTimeOffset} controlsRef={controlsRef} manualTarget={manualTarget} selectedPlanet={selectedPlanet} />
        <OrbitControls ref={controlsRef} enablePan={true} enableZoom={true} minDistance={0.5} maxDistance={200} rotateSpeed={0.4} zoomSpeed={0.4} panSpeed={0.4} />
        
      </Canvas>

      {/* Bottom Right Toggles & Menus */}
      <div className="absolute bottom-24 right-6 flex flex-col items-end space-y-4 pointer-events-auto z-20">
         
         <div className="relative">
           {showPlanetsMenu && (
             <div className="absolute bottom-full right-0 mb-4 w-48 glass-panel border border-[var(--theme-500)]/30 rounded-xl overflow-hidden bg-black/80 backdrop-blur-md shadow-[0_0_20px_rgba(var(--theme-rgb),0.3)] transform origin-bottom animate-in fade-in slide-in-from-bottom-4 duration-200">
               <div className="text-[10px] uppercase font-mono tracking-widest text-[var(--theme-400)] border-b border-white/10 px-4 py-2 bg-white/5">Select Target</div>
               <div className="flex flex-col max-h-60 overflow-y-auto scrollbar-hide">
                 <button 
                   onClick={() => { setSelectedPlanet('Earth'); setShowPlanetsMenu(false); setManualTarget(new THREE.Vector3(0,0,0)); setIsRideMode(false); }}
                   className="text-left px-4 py-2 text-xs font-mono tracking-widest hover:bg-[var(--theme-500)]/20 hover:text-white transition-colors border-b border-white/5 flex items-center space-x-2"
                 >
                   <div className="w-2 h-2 rounded-full bg-[#38bdf8]" />
                   <span>EARTH</span>
                 </button>
                 {PLANET_DATA.map(p => (
                   <button 
                     key={p.name}
                     onClick={() => { setSelectedPlanet(p.name); setShowPlanetsMenu(false); setManualTarget(null); setIsRideMode(false); }}
                     className="text-left px-4 py-2 text-xs font-mono tracking-widest hover:bg-[var(--theme-500)]/20 hover:text-white transition-colors border-b border-white/5 flex items-center space-x-2"
                   >
                     <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                     <span className="uppercase">{p.name}</span>
                   </button>
                 ))}
               </div>
             </div>
           )}
           <button 
             onClick={() => setShowPlanetsMenu(!showPlanetsMenu)}
             className={`w-full px-4 py-2 rounded-full font-mono text-xs uppercase tracking-widest border transition-all flex items-center space-x-2 justify-center ${showPlanetsMenu ? 'border-[var(--theme-500)] bg-[var(--theme-500)]/20 text-white shadow-[0_0_10px_rgba(var(--theme-rgb),0.3)]' : 'border-white/10 bg-black/50 text-white/50 hover:bg-white/10 hover:text-white'}`}
           >
             <Globe size={14} />
             <span>Planets</span>
           </button>
         </div>

         <button 
           onClick={() => setShowOrbitPaths(!showOrbitPaths)}
           className={`px-4 py-2 rounded-full font-mono text-xs uppercase tracking-widest border transition-all flex items-center space-x-2 ${showOrbitPaths ? 'border-[var(--theme-500)] bg-[var(--theme-500)]/20 text-white shadow-[0_0_10px_rgba(var(--theme-rgb),0.3)]' : 'border-white/10 bg-black/50 text-white/50'}`}
         >
           <div className={`w-2 h-2 rounded-full ${showOrbitPaths ? 'bg-[var(--theme-400)] shadow-[0_0_8px_var(--theme-400)]' : 'bg-white/20'}`} />
           <span>Orbit Paths</span>
         </button>
         
         <button 
           onClick={() => setShowTorchlight(!showTorchlight)}
           className={`px-4 py-2 rounded-full font-mono text-xs uppercase tracking-widest border transition-all flex items-center space-x-2 ${showTorchlight ? 'border-[var(--theme-500)] bg-[var(--theme-500)]/20 text-white shadow-[0_0_10px_rgba(var(--theme-rgb),0.3)]' : 'border-white/10 bg-black/50 text-white/50'}`}
         >
           <div className={`w-2 h-2 rounded-full ${showTorchlight ? 'bg-yellow-400 shadow-[0_0_8px_#facc15]' : 'bg-white/20'}`} />
           <span>Torchlight</span>
         </button>
      </div>

    </div>
  );
}
