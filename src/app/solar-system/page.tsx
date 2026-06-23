'use client';

import React, { useEffect, useState, useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Line, Html, useTexture, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import * as satellite from 'satellite.js';
import Link from 'next/link';
import { ChevronLeft, Camera, Navigation, Zap, Globe, Info, ZoomIn, ZoomOut, RotateCcw, Sun } from 'lucide-react';
import { useRadarStore } from '@/store/useRadarStore';
import { useSearchParams } from 'next/navigation';
import { DynamicSatellite, getSatelliteModelInfo } from '@/components/3D/DynamicSatellite';
import { DeepSpaceMissions, MarsRoverSurface } from './DeepSpace';

const EARTH_RADIUS_KM = 6371;
const SCALE = 1 / 1000;

const PLANET_DATA = [
  { name: 'Mercury', orbitRadius: 77, radius: 2.4, color: '#a8a29e', angle: 1.2, speed: 0.004, tilt: 0.034 * Math.PI / 180, orbitColor: '#888888' },
  { name: 'Venus', orbitRadius: 144, radius: 6, color: '#fcd34d', angle: 2.5, speed: 0.0015, tilt: 177.36 * Math.PI / 180, orbitColor: '#fef08a' },
  { name: 'Mars', orbitRadius: 300, radius: 3.3, color: '#b91c1c', angle: 4.1, speed: 0.0008, tilt: 25.19 * Math.PI / 180, orbitColor: '#ef4444' },
  { name: 'Jupiter', orbitRadius: 1040, radius: 15, color: '#d97706', angle: 0.5, speed: 0.0002, tilt: 3.13 * Math.PI / 180, orbitColor: '#f97316' },
  { name: 'Saturn', orbitRadius: 1900, radius: 12, color: '#fde047', angle: 5.2, speed: 0.0001, tilt: 26.73 * Math.PI / 180, orbitColor: '#fde047' },
  { name: 'Uranus', orbitRadius: 3800, radius: 10, color: '#38bdf8', angle: 3.1, speed: 0.00005, tilt: 97.77 * Math.PI / 180, orbitColor: '#7dd3fc' },
  { name: 'Neptune', orbitRadius: 6000, radius: 10, color: '#1d4ed8', angle: 1.8, speed: 0.00003, tilt: 28.32 * Math.PI / 180, orbitColor: '#3b82f6' },
  { name: 'Pluto', orbitRadius: 7800, radius: 1.5, color: '#e5e7eb', angle: 2.2, speed: 0.00001, tilt: 122.53 * Math.PI / 180, orbitColor: '#d1d5db' },
];

const SAT_GROUP_COLORS: Record<string, string> = {
  'Space Stations': '#38bdf8', // Light blue
  'Earth Observation': '#4ade80', // Green
  'Communications': '#facc15', // Yellow
  'Telescopes': '#c084fc', // Purple
  'Debris': '#f87171', // Red
  'Others': '#94a3b8' // Slate
};

function getSatGroup(name: string, type: string) {
  const upper = name.toUpperCase();
  if (type === 'DEBRIS' || upper.includes('DEB ') || upper.includes('ROCKET') || upper.includes('OBJ')) return 'Debris';
  if (upper.includes('ISS ') || upper.includes('ZARYA') || upper.includes('TIANGONG')) return 'Space Stations';
  if (upper.includes('NOAA') || upper.includes('GOES') || upper.includes('SMAP') || upper.includes('METEOR') || upper.includes('LANDSAT') || upper.includes('AQUA') || upper.includes('TERRA') || upper.includes('SUOMI')) return 'Earth Observation';
  if (upper.includes('STARLINK') || upper.includes('ONEWEB') || upper.includes('IRIDIUM') || upper.includes('NAVSTAR') || upper.includes('GALILEO') || upper.includes('GLONASS')) return 'Communications';
  if (upper.includes('HUBBLE') || upper.includes('HST ') || upper.includes('CHANDRA')) return 'Telescopes';
  return 'Others';
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
  const [gibsTexture, setGibsTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    if (epicTextureUrl) {
      new THREE.TextureLoader().load(epicTextureUrl, (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        setEpicTexture(tex);
      });
    }
  }, [epicTextureUrl]);

  useEffect(() => {
    if (activeLayer === 'Satellites Now' || activeLayer === 'Visible Earth') {
      setGibsTexture(null);
      return;
    }

    const GIBS_LAYERS: Record<string, string> = {
      'Visible Earth': '',
      'Air Temperature': 'MERRA2_2m_Air_Temperature_Monthly',
      'Carbon Dioxide': 'OCO-2_Carbon_Dioxide_Total_Column_Average',
      'Carbon Monoxide': 'AIRS_L2_Carbon_Monoxide_500hPa_Volume_Mixing_Ratio_Day',
      'Chlorophyll': 'MODIS_Aqua_L2_Chlorophyll_A',
      'Sea Level': 'TOPEX-Poseidon_JASON_Sea_Surface_Height_Anomalies_GDR_Cycles',
      'Sea Surface Temperature': 'GHRSST_L4_MUR_Sea_Surface_Temperature',
      'Soil Moisture': 'SMAP_L4_Analyzed_Root_Zone_Soil_Moisture'
    };

    const layerName = GIBS_LAYERS[activeLayer];
    if (layerName) {
      const url = `https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi?SERVICE=WMS&REQUEST=GetMap&LAYERS=${layerName}&VERSION=1.3.0&FORMAT=image/png&TRANSPARENT=true&WIDTH=1024&HEIGHT=512&CRS=EPSG:4326&BBOX=-90,-180,90,180&TIME=2022-01-01`;
      new THREE.TextureLoader().load(url, (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        setGibsTexture(tex);
      });
    }
  }, [activeLayer]);

  return (
    <group onDoubleClick={onDoubleClick} ref={earthRef as any}>
      <CustomPlanetModel name="earth" radius={EARTH_RADIUS_KM * SCALE} />
      
      {/* Atmosphere / Data Layer Overlay */}
      {activeLayer !== 'Satellites Now' ? (
        <mesh>
          <sphereGeometry args={[EARTH_RADIUS_KM * SCALE * 1.01, 64, 64]} />
          <meshStandardMaterial 
            map={activeLayer === 'Visible Earth' ? epicTexture || undefined : gibsTexture || undefined}
            color={activeLayer === 'Visible Earth' ? '#ffffff' : (gibsTexture ? '#ffffff' : earthColor)}
            transparent 
            opacity={activeLayer === 'Visible Earth' ? (epicTexture ? 1.0 : 0.0) : (gibsTexture ? 0.8 : 0.4)}
            roughness={0.7}
          />
        </mesh>
      ) : (
        <mesh>
          <sphereGeometry args={[EARTH_RADIUS_KM * SCALE * 1.03, 32, 32]} />
          <meshBasicMaterial color="#22d3ee" transparent opacity={0.1} side={THREE.BackSide} />
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
          
          {data.name === 'Mars' && (
            <MarsRoverSurface radius={data.radius} />
          )}

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

function MoonOrbiter({ onDoubleClick, timeOffset }: { onDoubleClick: (e: any) => void, timeOffset: number }) {
  const meshRef = useRef<THREE.Group>(null);
  const moonDistance = 30;
  const speed = 0.05; // Orbit speed
  const rotationSpeed = 0.01; // Rotation speed
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      // Combine continuous time with timeOffset for time travel
      const t = state.clock.elapsedTime * speed + (timeOffset * 0.01);
      meshRef.current.position.set(
        Math.cos(t) * moonDistance,
        0,
        Math.sin(t) * moonDistance
      );
      meshRef.current.rotation.y += delta * rotationSpeed;
    }
  });

  const orbitPoints = useMemo(() => {
    const pts = [];
    for (let i = 0; i <= 128; i++) {
      const a = (i / 128) * Math.PI * 2;
      pts.push(new THREE.Vector3(moonDistance * Math.cos(a), 0, moonDistance * Math.sin(a)));
    }
    return pts;
  }, []);

  return (
    <group>
      <group ref={meshRef} onDoubleClick={onDoubleClick}>
        <CustomPlanetModel name="moon" radius={1737 * SCALE} tilt={1.54 * Math.PI / 180} />
        
        {/* Invisible hit-box */}
        <mesh visible={false}>
          <sphereGeometry args={[1737 * SCALE * 1.5, 16, 16]} />
          <meshBasicMaterial />
        </mesh>
        
        <Html position={[0, 1737 * SCALE + 2, 0]} center style={{ pointerEvents: 'none' }}>
          <div className="font-mono text-[8px] uppercase tracking-[0.3em] px-2 py-1 rounded backdrop-blur-sm bg-black/50 text-white/50 border border-white/10">MOON</div>
        </Html>
      </group>
      <Line points={orbitPoints} color="#d1d5db" opacity={0.2} lineWidth={1} transparent />
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
      <group position={sunPos} onDoubleClick={onDoubleClick}>
        <CustomPlanetModel name="sun" radius={15} />
        <pointLight intensity={3} distance={10000} color="#ffeedd" />
        <Html position={[0, 20, 0]} center style={{ pointerEvents: 'none' }}>
          <div className="text-yellow-400/80 font-black text-2xl uppercase tracking-[0.5em]">SUN</div>
        </Html>
      </group>

      <Line points={earthOrbitPoints} color={selectedPlanet === 'Earth' ? '#38bdf8' : '#38bdf8'} opacity={selectedPlanet === 'Earth' ? 0.8 : 0.4} lineWidth={selectedPlanet === 'Earth' ? 3 : 1} transparent />

      <MoonOrbiter onDoubleClick={onDoubleClick} timeOffset={timeOffset} />

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

function GenericInstancedMesh({ tles, timeOffset, isDebris, color }: { tles: {satrec: satellite.SatRec}[], timeOffset: number, isDebris: boolean, color: string }) {
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
      <meshStandardMaterial color={color} roughness={0.4} metalness={0.6} emissive={color} emissiveIntensity={0.2} />
    </instancedMesh>
  );
}

function GlobalConstellation({ tles, timeOffset, showOrbitPaths, visibleGroups }: { tles: {satrec: satellite.SatRec, type: string, id: string, name: string}[], timeOffset: number, showOrbitPaths: boolean, visibleGroups: Record<string, boolean> }) {
  const visibleTles = useMemo(() => tles.filter(t => visibleGroups[getSatGroup(t.name, t.type)]), [tles, visibleGroups]);
  const specificModels = useMemo(() => visibleTles.slice(0, 150), [visibleTles]);
  const genericPayloads = useMemo(() => visibleTles.slice(150), [visibleTles]);

  const groupedPayloads = useMemo(() => {
     const groups: Record<string, any[]> = {};
     genericPayloads.forEach((t: any) => {
        const g = getSatGroup(t.name, t.type);
        if (!groups[g]) groups[g] = [];
        groups[g].push(t);
     });
     return groups;
  }, [genericPayloads]);

  return (
    <group>
      {Object.entries(groupedPayloads).map(([g, items]) => (
         <GenericInstancedMesh key={g} tles={items} timeOffset={timeOffset} isDebris={g === 'Debris'} color={SAT_GROUP_COLORS[g]} />
      ))}
      
      {specificModels.map(t => (
         <FlyingModel key={t.id} satrec={t.satrec} name={t.name} timeOffset={timeOffset} showOrbit={showOrbitPaths} />
      ))}
    </group>
  );
}

function OrbitPath({ satrec, color }: { satrec: satellite.SatRec, color: string }) {
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
    <Line points={points} color={color} lineWidth={1.5} dashed dashSize={0.5} gapSize={0.2} opacity={0.5} transparent />
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
    const light = new THREE.PointLight(0xffffff, 5.0, 150); // Increased torchlight intensity
    camera.add(light);
    return () => { camera.remove(light); };
  }, [camera]);

  useFrame((state) => {
    if (!controlsRef.current) return;
    
    if (manualTarget) {
      controlsRef.current.target.lerp(manualTarget, 0.05);
      const dist = state.camera.position.distanceTo(manualTarget);
      if (dist > 20) {
        const desiredPos = manualTarget.clone().add(new THREE.Vector3(1, 0.2, 1).normalize().multiplyScalar(15));
        state.camera.position.lerp(desiredPos, 0.05);
      }
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
          state.camera.position.lerp(desiredPos, 0.05);
        }
      }
    } else if (selectedPlanet === 'Sun') {
      const target = new THREE.Vector3(-200, 0, 0);
      controlsRef.current.target.lerp(target, 0.05);
      const dist = state.camera.position.distanceTo(target);
      if (dist > 40) {
        const desiredPos = target.clone().add(new THREE.Vector3(1, 0.2, 1).normalize().multiplyScalar(30));
        state.camera.position.lerp(desiredPos, 0.05);
      }
    } else if (selectedPlanet === 'Moon') {
      const t = state.clock.elapsedTime * 0.05 + (timeOffset * 0.01);
      const target = new THREE.Vector3(Math.cos(t) * 30, 0, Math.sin(t) * 30);
      controlsRef.current.target.lerp(target, 0.05);
      const dist = state.camera.position.distanceTo(target);
      if (dist > 5) {
        const desiredPos = target.clone().add(new THREE.Vector3(1, 0.2, 1).normalize().multiplyScalar(4));
        state.camera.position.lerp(desiredPos, 0.05);
      }
    } else if (selectedPlanet === 'Perseverance Mars Rover') {
        const tracking = (window as any).roverTracking;
        if (tracking) {
           const target = tracking.pos;
           controlsRef.current.target.lerp(target, 0.1);
           const dist = state.camera.position.distanceTo(target);
           if (dist > 0.1) {
             const desiredPos = target.clone()
               .add(tracking.up.clone().multiplyScalar(0.08))
               .sub(tracking.forward.clone().multiplyScalar(0.15));
             state.camera.position.lerp(desiredPos, 0.05);
           }
        }
    } else if (selectedPlanet === 'Voyager 1') {
       const t = Math.max(0, state.clock.elapsedTime * 0.1 + (timeOffset * 0.1));
       const target = new THREE.Vector3(100 + t * 10, t * 2, t * 5);
       controlsRef.current.target.lerp(target, 0.05);
       const desiredPos = target.clone().add(new THREE.Vector3(5, 5, 10));
       state.camera.position.lerp(desiredPos, 0.05);
    } else if (selectedPlanet === 'James Webb Space Telescope') {
       const ht = state.clock.elapsedTime * 0.5 + (timeOffset * 0.01);
       const target = new THREE.Vector3(50, Math.sin(ht)*5, Math.cos(ht)*5);
       controlsRef.current.target.lerp(target, 0.05);
       const desiredPos = target.clone().add(new THREE.Vector3(10, 5, 10));
       state.camera.position.lerp(desiredPos, 0.05);
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
           state.camera.position.lerp(desiredPos, 0.05);
         }
      }
    } else {
      const target = new THREE.Vector3(0, 0, 0);
      controlsRef.current.target.lerp(target, 0.05);
      
      if (selectedPlanet === 'Earth') {
         const dist = state.camera.position.distanceTo(target);
         const earthRadius = EARTH_RADIUS_KM * SCALE;
         if (dist > earthRadius * 2) {
           const desiredPos = target.clone().add(new THREE.Vector3(1, 0.2, 1).normalize().multiplyScalar(earthRadius * 1.5));
           state.camera.position.lerp(desiredPos, 0.05);
         }
      }
    }
    
    // Crucial: Update orbit controls explicitly if we manually moved the camera position
    controlsRef.current.update();

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
  const [targetSatrec, setTargetSatrec] = useState<any>(null);
  const [satName, setSatName] = useState('GLOBAL CONSTELLATION');
  const [isRideMode, setIsRideMode] = useState(false);
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [selectedPlanet, setSelectedPlanet] = useState<string | null>(null);
  const [activeLayer, setActiveLayer] = useState('Satellites Now');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [satPanelOpen, setSatPanelOpen] = useState(true);
  const [infoPanelOpen, setInfoPanelOpen] = useState(true);
  const [visibleGroups, setVisibleGroups] = useState<Record<string, boolean>>({
    'Space Stations': true,
    'Earth Observation': true,
    'Communications': true,
    'Telescopes': true,
    'Debris': true,
    'Others': true
  });
  const [mounted, setMounted] = useState(false);
  const [manualTarget, setManualTarget] = useState<THREE.Vector3 | null>(null);
  const [epicTextureUrl, setEpicTextureUrl] = useState<string | null>(null);
  const [showPlanetsMenu, setShowPlanetsMenu] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const controlsRef = useRef<any>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (tles.length > 0) setInitialLoading(false);
  }, [tles]);

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

  return (
    <div className="w-full h-screen bg-black overflow-hidden relative">
      {initialLoading && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black">
          <div className="text-4xl font-black text-white tracking-[0.5em] animate-pulse">INITIATING</div>
          <div className="text-[var(--theme-400)] font-mono text-xs tracking-widest mt-4">Connecting to Orbital Data Network...</div>
        </div>
      )}
      
      {/* Satellite Groups Panel (Top Right) */}
      <div className="absolute top-6 right-6 z-20 pointer-events-none flex flex-col items-end gap-4">
        {/* Categories Panel Row */}
        <div className="flex items-start gap-4">
          {satPanelOpen && (
            <div className="glass-panel border border-[var(--theme-500)]/30 bg-[#05050a]/90 backdrop-blur-md rounded-xl p-4 w-72 shadow-[0_0_20px_rgba(var(--theme-rgb),0.3)] pointer-events-auto transition-all">
              <h2 className="text-[var(--theme-400)] font-mono tracking-widest uppercase text-xs mb-4 border-b border-white/10 pb-2">Satellite Categories</h2>
              
              <div className="space-y-2 mb-4">
                 {Object.keys(SAT_GROUP_COLORS).map(g => (
                   <div key={g} className="flex items-center justify-between text-xs font-mono">
                      <div className="flex items-center space-x-2">
                         <div className="w-2 h-2 rounded-full" style={{ backgroundColor: SAT_GROUP_COLORS[g] }} />
                         <span className={visibleGroups[g] ? 'text-white' : 'text-white/30 transition-colors'}>{g}</span>
                      </div>
                      <button 
                        onClick={() => setVisibleGroups(prev => ({...prev, [g]: !prev[g]}))}
                        className={`px-2 py-1 rounded transition-colors ${visibleGroups[g] ? 'bg-[var(--theme-500)]/20 text-white hover:bg-[var(--theme-500)]/40' : 'bg-white/5 text-white/30 hover:bg-white/10'}`}
                      >
                         {visibleGroups[g] ? 'SHOW' : 'HIDE'}
                      </button>
                   </div>
                 ))}
              </div>
              
              <div className="flex space-x-2 pt-2 border-t border-white/10">
                 <button 
                   onClick={() => {
                     const allOn = Object.keys(visibleGroups).reduce((acc, key) => ({...acc, [key]: true}), {});
                     setVisibleGroups(allOn);
                   }}
                   className="flex-1 px-2 py-1.5 text-[10px] font-mono tracking-widest uppercase rounded border border-white/20 hover:bg-white/10 transition-colors"
                 >
                   Show All
                 </button>
                 <button 
                   onClick={() => {
                     const allOff = Object.keys(visibleGroups).reduce((acc, key) => ({...acc, [key]: false}), {});
                     setVisibleGroups(allOff);
                   }}
                   className="flex-1 px-2 py-1.5 text-[10px] font-mono tracking-widest uppercase rounded border border-white/20 hover:bg-white/10 transition-colors"
                 >
                   Hide All
                 </button>
              </div>
            </div>
          )}
          <button onClick={() => setSatPanelOpen(!satPanelOpen)} className="mt-2 text-[var(--theme-400)] hover:text-white transition-colors bg-black/50 p-2 pointer-events-auto rounded-full border border-[var(--theme-500)]/30 backdrop-blur-md shadow-[0_0_15px_rgba(var(--theme-rgb),0.2)]">
             <ChevronLeft size={20} className={`transform transition-transform ${satPanelOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* General / Target Info Panel */}
        <div className="flex items-start gap-4">
          {infoPanelOpen && (
            <div className="glass-panel border border-[var(--theme-500)]/30 bg-[#05050a]/90 backdrop-blur-md rounded-xl p-4 w-72 shadow-[0_0_20px_rgba(var(--theme-rgb),0.3)] pointer-events-auto transition-all text-white">
              {targetSatrec && satName !== 'GLOBAL CONSTELLATION' ? (
                 <>
                   <h2 className="text-[var(--theme-400)] font-mono tracking-widest uppercase text-xs mb-2 border-b border-white/10 pb-2">Target Telemetry</h2>
                   <div className="font-bold text-lg leading-tight mb-2 uppercase tracking-wide truncate">{satName}</div>
                   
                   <div className="space-y-3 font-mono text-[10px] uppercase text-white/70">
                     <div className="flex justify-between">
                       <span className="text-white/40">Status</span>
                       <span className="text-green-400 animate-pulse">Active Tracking</span>
                     </div>
                     <div className="flex justify-between">
                       <span className="text-white/40">Class</span>
                       <span className="text-[var(--theme-400)]">{getSatGroup(satName, targetSatrec.type || 'PAYLOAD')}</span>
                     </div>
                     <div className="flex justify-between">
                       <span className="text-white/40">Velocity</span>
                       <span>{currentSpeed ? (Math.round(currentSpeed * 10) / 10).toFixed(1) : '--'} km/s</span>
                     </div>
                     <div className="flex justify-between">
                       <span className="text-white/40">Orbit Period</span>
                       <span>{targetSatrec ? Math.round(1440 / targetSatrec.no) : '--'} mins</span>
                     </div>
                     <div className="flex justify-between">
                       <span className="text-white/40">Inclination</span>
                       <span>{targetSatrec ? (targetSatrec.inclo * 180 / Math.PI).toFixed(2) : '--'}°</span>
                     </div>
                   </div>
                 </>
              ) : selectedPlanet === 'Voyager 1' ? (
                 <>
                   <h2 className="text-[var(--theme-400)] font-mono tracking-widest uppercase text-xs mb-2 border-b border-white/10 pb-2">Deep Space Network</h2>
                   <div className="font-bold text-lg leading-tight mb-2 uppercase tracking-wide truncate">Voyager 1</div>
                   <div className="space-y-3 font-mono text-[10px] uppercase text-white/70">
                     <div className="flex justify-between"><span className="text-white/40">Status</span><span className="text-green-400 animate-pulse">Interstellar Space</span></div>
                     <div className="flex justify-between"><span className="text-white/40">Distance</span><span className="text-[var(--theme-400)]">~24.3B km</span></div>
                     <div className="flex justify-between"><span className="text-white/40">Velocity</span><span>17.0 km/s</span></div>
                     <div className="flex justify-between"><span className="text-white/40">Launched</span><span>Sep 5, 1977</span></div>
                   </div>
                 </>
              ) : selectedPlanet === 'James Webb Space Telescope' ? (
                 <>
                   <h2 className="text-[var(--theme-400)] font-mono tracking-widest uppercase text-xs mb-2 border-b border-white/10 pb-2">Deep Space Network</h2>
                   <div className="font-bold text-lg leading-tight mb-2 uppercase tracking-wide truncate">James Webb Space Telescope</div>
                   <div className="space-y-3 font-mono text-[10px] uppercase text-white/70">
                     <div className="flex justify-between"><span className="text-white/40">Status</span><span className="text-green-400 animate-pulse">Active Science</span></div>
                     <div className="flex justify-between"><span className="text-white/40">Orbit</span><span className="text-[var(--theme-400)]">Sun-Earth L2</span></div>
                     <div className="flex justify-between"><span className="text-white/40">Distance</span><span>1.5M km</span></div>
                     <div className="flex justify-between"><span className="text-white/40">Launched</span><span>Dec 25, 2021</span></div>
                   </div>
                 </>
              ) : selectedPlanet === 'Perseverance Mars Rover' ? (
                 <>
                   <h2 className="text-[var(--theme-400)] font-mono tracking-widest uppercase text-xs mb-2 border-b border-white/10 pb-2">Deep Space Network</h2>
                   <div className="font-bold text-lg leading-tight mb-2 uppercase tracking-wide truncate">Perseverance Rover</div>
                   <div className="space-y-3 font-mono text-[10px] uppercase text-white/70">
                     <div className="flex justify-between"><span className="text-white/40">Status</span><span className="text-green-400 animate-pulse">Exploring Jezero Crater</span></div>
                     <div className="flex justify-between"><span className="text-white/40">Location</span><span className="text-[var(--theme-400)]">Mars Surface</span></div>
                     <div className="flex justify-between"><span className="text-white/40">Mission Day</span><span>Sol 1100+</span></div>
                     <div className="flex justify-between"><span className="text-white/40">Landed</span><span>Feb 18, 2021</span></div>
                   </div>
                 </>
              ) : (
                 <>
                   <h2 className="text-[var(--theme-400)] font-mono tracking-widest uppercase text-xs mb-2 border-b border-white/10 pb-2">Global Network</h2>
                   <div className="font-bold text-lg leading-tight mb-2 uppercase tracking-wide truncate">Orbital Array</div>
                   
                   <div className="space-y-3 font-mono text-[10px] uppercase text-white/70">
                     <div className="flex justify-between">
                       <span className="text-white/40">Total Objects</span>
                       <span className="text-cyan-400">{tles.length.toLocaleString()}</span>
                     </div>
                     <div className="flex justify-between">
                       <span className="text-white/40">Active Payloads</span>
                       <span className="text-[var(--theme-400)]">{tles.filter(t => t.type === 'PAYLOAD').length.toLocaleString()}</span>
                     </div>
                     <div className="flex justify-between">
                       <span className="text-white/40">Tracked Debris</span>
                       <span className="text-red-400">{tles.filter(t => t.type === 'DEBRIS').length.toLocaleString()}</span>
                     </div>
                     <div className="flex justify-between">
                       <span className="text-white/40">Network Status</span>
                       <span className="text-green-400 animate-pulse">ONLINE</span>
                     </div>
                     <div className="flex justify-between">
                       <span className="text-white/40">Last Epoch</span>
                       <span>{mounted ? new Date().toLocaleDateString() : '--'}</span>
                     </div>
                   </div>
                 </>
              )}
            </div>
          )}
          <button onClick={() => setInfoPanelOpen(!infoPanelOpen)} className="mt-2 text-[var(--theme-400)] hover:text-white transition-colors bg-black/50 p-2 pointer-events-auto rounded-full border border-[var(--theme-500)]/30 backdrop-blur-md shadow-[0_0_15px_rgba(var(--theme-rgb),0.2)]">
             <ChevronLeft size={20} className={`transform transition-transform ${infoPanelOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>
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
            {sidebarOpen && (
              <div>
                <h1 className="text-xl md:text-2xl font-black text-white tracking-[0.2em] uppercase drop-shadow-md">
                  {satName}
                </h1>
                <p className="text-[var(--theme-400)] font-mono tracking-widest uppercase text-xs mt-1">
                  Live 3D Orbital Tracking Matrix
                </p>
              </div>
            )}
          </div>
          
          
          {/* NASA Eyes Sidebar: Featured Targets */}
          {sidebarOpen && (
            <div className="mt-8 ml-2 pointer-events-auto w-80">
             <div className="text-[10px] text-white/50 uppercase tracking-widest font-mono mb-3">Featured Stories and Events</div>
             <div className="flex flex-col space-y-3 h-[calc(100vh-200px)] overflow-y-auto scrollbar-hide pr-4 pb-20 pointer-events-auto">                 {[
                  { name: 'Perseverance Mars Rover', date: 'LANDED FEB 18TH, 2021', img: 'https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?w=200&q=80' },
                  { name: 'Voyager 1', date: 'LAUNCHED SEP 5TH, 1977', img: 'https://images.unsplash.com/photo-1614729939124-032f0b56c9ce?w=200&q=80' },
                  { name: 'James Webb Space Telescope', date: 'LAUNCHED DEC 25TH, 2021', img: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=200&q=80' }
                 ].map((story, idx) => (
                    <button
                      key={`story-${idx}`}
                      onClick={() => {
                         setTargetSatrec(null);
                         setSatName(story.name);
                         setIsRideMode(false);
                         setSelectedPlanet(story.name);
                         setManualTarget(null);
                      }}
                      className="glass-panel rounded-xl flex-shrink-0 overflow-hidden border border-[var(--theme-500)]/30 hover:border-[var(--theme-500)]/70 hover:bg-[var(--theme-500)]/20 text-left transition-all group relative bg-[#111115]"
                    >
                     <div className="p-4 z-10 relative">
                       <h3 className="text-white font-bold text-lg leading-tight w-3/4 drop-shadow-md">{story.name}</h3>
                       <div className="text-[10px] text-[#fcd34d] font-mono uppercase tracking-widest mt-2 drop-shadow-md">
                         {story.date}
                       </div>
                     </div>
                     <div className="absolute top-0 right-0 h-full w-1/2 opacity-50 group-hover:opacity-80 transition-opacity">
                        <div className="absolute inset-0 bg-gradient-to-r from-[#111115] to-transparent z-10"></div>
                        <img src={story.img} className="w-full h-full object-cover" alt="" />
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
                     
                     <div className="absolute top-0 right-0 h-full w-1/2 opacity-50 group-hover:opacity-80 transition-opacity">
                        <div className="absolute inset-0 bg-gradient-to-r from-[#111115] to-transparent z-10"></div>
                        <img src="https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=200&q=80" className="w-full h-full object-cover grayscale hover:grayscale-0" alt="" />
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
          <div className="relative flex justify-center items-center w-full text-white font-mono text-sm tracking-widest px-4 mb-2 pointer-events-auto">
             <div className="absolute left-4 flex items-center space-x-2 text-green-400">
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
             
             <div className="absolute right-4 text-right">
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
          <div className="w-screen bg-[#05050a]/90 backdrop-blur-md border-t border-white/10 mt-6 -mx-4 -mb-4 px-8 py-3 flex items-center relative pointer-events-auto">
           <div className="flex space-x-6 text-[10px] font-mono tracking-widest text-white/50 uppercase w-full justify-center overflow-x-auto whitespace-nowrap scrollbar-hide px-12">
             {['Satellites Now', 'Visible Earth', 'Air Temperature', 'Carbon Dioxide', 'Carbon Monoxide', 'Chlorophyll', 'Sea Level', 'Sea Surface Temperature', 'Soil Moisture'].map((layer) => (
               <button 
                 key={layer}
                 onClick={() => setActiveLayer(layer)}
                 className={`hover:text-white transition-colors ${activeLayer === layer ? 'text-white font-bold' : ''}`}
               >
                 {layer}
               </button>
             ))}
           </div>

           {/* Info Tooltip OUTSIDE overflow container */}
           <div className="absolute right-8 top-1/2 -translate-y-1/2 group cursor-pointer flex items-center z-50">
             <Info size={14} className="text-[var(--theme-400)] hover:text-white transition-colors" />
             <div className="absolute bottom-full right-0 mb-4 w-64 p-3 bg-[#05050a]/95 backdrop-blur-md border border-[var(--theme-500)]/30 text-[var(--theme-400)] text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-[0_0_15px_rgba(var(--theme-rgb),0.2)] whitespace-normal leading-relaxed text-left">
               If the filter isn't rendering clearly, try toggling the TORCHLIGHT to reveal the data overlay!
             </div>
           </div>
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
        
        <Stars radius={300} depth={200} count={1000} factor={6} saturation={0} fade speed={1} />
        
        {/* Massive background sphere to catch raycasting for empty space navigation */}
        <mesh visible={false} onDoubleClick={(e) => { 
          e.stopPropagation(); 
          // Move target 100 units forward from the camera's CURRENT position in the direction clicked
          const dir = e.point.clone().sub(e.camera.position).normalize();
          const safePoint = e.camera.position.clone().add(dir.multiplyScalar(100));
          setManualTarget(safePoint); 
          setIsRideMode(false); 
          setSelectedPlanet(null); 
        }}>
          <sphereGeometry args={[10000, 32, 32]} />
          <meshBasicMaterial side={THREE.BackSide} />
        </mesh>
        
        <Earth activeLayer={activeLayer} epicTextureUrl={epicTextureUrl} onDoubleClick={(e) => { e.stopPropagation(); setManualTarget(e.point); setIsRideMode(false); setSelectedPlanet('Earth'); }} />
        <CelestialBodies onDoubleClick={(e) => { e.stopPropagation(); setManualTarget(e.point); setIsRideMode(false); }} selectedPlanet={selectedPlanet} setSelectedPlanet={setSelectedPlanet} timeOffset={localTimeOffset} />
        
        <DeepSpaceMissions timeOffset={localTimeOffset} selectedPlanet={selectedPlanet} />
        
        {activeLayer === 'Satellites Now' && <GlobalConstellation tles={tles} timeOffset={localTimeOffset} showOrbitPaths={showOrbitPaths} visibleGroups={visibleGroups} />}
        
        {activeLayer === 'Satellites Now' && showOrbitPaths && tles.filter(t => visibleGroups[getSatGroup(t.name, t.type)]).slice(0, 100).map(t => (
          <OrbitPath key={t.id} satrec={t.satrec} color={SAT_GROUP_COLORS[getSatGroup(t.name, t.type)]} />
        ))}
        
        {targetSatrec && activeLayer === 'Satellites Now' && (
          <TargetSatellite satrec={targetSatrec} timeOffset={localTimeOffset} isRideMode={isRideMode} velocity={setCurrentSpeed} name={satName} onDoubleClick={(e) => { e.stopPropagation(); setManualTarget(e.point.clone().normalize().multiplyScalar(500)); setIsRideMode(false); }} />
        )}
        <CameraController isRideMode={isRideMode} targetSatrec={targetSatrec} timeOffset={localTimeOffset} controlsRef={controlsRef} manualTarget={manualTarget} selectedPlanet={selectedPlanet} />
        <OrbitControls ref={controlsRef} enablePan={true} enableZoom={true} enableDamping dampingFactor={0.05} minDistance={0.01} maxDistance={20000} rotateSpeed={0.4} zoomSpeed={0.4} panSpeed={0.4} />
        
      </Canvas>

      {/* Bottom Right Toggles & Menus */}
      <div className="absolute bottom-24 right-6 flex flex-col items-end space-y-4 pointer-events-auto z-20">
         
         <div className="relative">
           {showPlanetsMenu && (
             <div className="absolute bottom-full right-0 mb-4 w-48 glass-panel border border-[var(--theme-500)]/30 rounded-xl overflow-hidden bg-black/80 backdrop-blur-md shadow-[0_0_20px_rgba(var(--theme-rgb),0.3)] transform origin-bottom animate-in fade-in slide-in-from-bottom-4 duration-200">
               <div className="text-[10px] uppercase font-mono tracking-widest text-[var(--theme-400)] border-b border-white/10 px-4 py-2 bg-white/5">Select Target</div>
               <div className="flex flex-col max-h-60 overflow-y-auto scrollbar-hide">
                 <button 
                   onClick={() => { setSelectedPlanet('Sun'); setShowPlanetsMenu(false); setManualTarget(new THREE.Vector3(-200,0,0)); setIsRideMode(false); }}
                   className="text-left px-4 py-2 text-xs font-mono tracking-widest hover:bg-[var(--theme-500)]/20 hover:text-white transition-colors border-b border-white/5 flex items-center space-x-2"
                 >
                   <div className="w-2 h-2 rounded-full bg-[#fcd34d]" />
                   <span>SUN</span>
                 </button>
                 <button 
                   onClick={() => { setSelectedPlanet('Moon'); setShowPlanetsMenu(false); setManualTarget(null); setIsRideMode(false); }}
                   className="text-left px-4 py-2 text-xs font-mono tracking-widest hover:bg-[var(--theme-500)]/20 hover:text-white transition-colors border-b border-white/5 flex items-center space-x-2"
                 >
                   <div className="w-2 h-2 rounded-full bg-[#cbd5e1]" />
                   <span>MOON</span>
                 </button>
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
           onClick={() => {
             setTargetSatrec(null);
             setSatName('GLOBAL CONSTELLATION');
             setIsRideMode(false);
             setSelectedPlanet(null);
             setManualTarget(new THREE.Vector3(0, 0, 0));
           }} 
           className="w-full px-4 py-2 rounded-full font-mono text-xs uppercase tracking-widest border border-[var(--theme-500)]/50 bg-black/50 text-[var(--theme-400)] hover:bg-[var(--theme-500)]/20 transition-all flex items-center space-x-2 justify-center shadow-[0_0_10px_rgba(var(--theme-rgb),0.3)]"
         >
           <Globe size={14} />
           <span>Back to Earth</span>
         </button>

         <div className="absolute bottom-6 right-6 z-20 flex flex-col items-end gap-3 pointer-events-auto">
           <div className="flex space-x-4">
             <button 
               onClick={() => { setSelectedPlanet('Earth'); setManualTarget(null); setTargetSatrec(null); setIsRideMode(false); }}
               className={`px-4 py-2 rounded-full font-mono text-xs uppercase tracking-widest border transition-all flex items-center space-x-2 border-white/10 bg-black/50 text-white/50 hover:text-white hover:bg-white/10`}
             >
               <span>Back to Earth</span>
             </button>

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

           <div className="flex space-x-2 w-[140px] justify-between">
              <button onClick={() => {
                 const cam = (window as any).solarSystemCamera;
                 const controls = (window as any).solarSystemControls;
                 if (cam && controls) {
                    const dir = new THREE.Vector3().subVectors(controls.target, cam.position).normalize();
                    cam.position.add(dir.multiplyScalar(cam.position.distanceTo(controls.target) * 0.2));
                 }
              }} className="flex-1 flex justify-center items-center bg-black/50 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 p-2 rounded-full shadow-lg transition-colors">
                 <ZoomIn size={16} />
              </button>
              <button onClick={() => {
                 const cam = (window as any).solarSystemCamera;
                 const controls = (window as any).solarSystemControls;
                 if (cam && controls) {
                    const dir = new THREE.Vector3().subVectors(cam.position, controls.target).normalize();
                    cam.position.add(dir.multiplyScalar(cam.position.distanceTo(controls.target) * 0.25));
                 }
              }} className="flex-1 flex justify-center items-center bg-black/50 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 p-2 rounded-full shadow-lg transition-colors">
                 <ZoomOut size={16} />
              </button>
              <button onClick={() => {
                 setSelectedPlanet('Earth');
                 setManualTarget(null);
                 setTargetSatrec(null);
                 setIsRideMode(false);
              }} className="flex-1 flex justify-center items-center bg-black/50 border border-[var(--theme-500)]/50 text-[var(--theme-400)] hover:bg-[var(--theme-500)]/20 p-2 rounded-full shadow-[0_0_15px_rgba(var(--theme-rgb),0.3)] transition-colors">
                 <RotateCcw size={16} />
              </button>
           </div>
        </div>

      </div>

    </div>
  );
}
