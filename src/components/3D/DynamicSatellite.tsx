import React, { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';

export function getSatelliteModelInfo(name: string, isDebris: boolean): { url: string | null, scale: number } {
  const upper = name.toUpperCase();
  let url = null;
  let scale = 1;

  if (isDebris) {
    url = '/models/asteroids/small_asteroid.glb'; // Default debris
    scale = 0.05;
  } else {
    if (upper.includes('ISS')) { url = '/models/ISS_stationary.glb'; scale = 0.8; }
    else if (upper.includes('HUBBLE')) { url = '/models/Hubble-1.glb'; scale = 0.8; }
    else if (upper.includes('SMAP')) { url = '/models/SMAP.glb'; scale = 0.8; }
    else if (upper.includes('AQUA')) { url = '/models/other_satellites/Aqua (C).glb'; scale = 0.8; }
    else if (upper.includes('CALIPSO')) { url = '/models/other_satellites/Cloud-Aerosol Lidar and Infrared Pathfinder Satellite (CALIPSO).glb'; scale = 0.8; }
    else if (upper.includes('CLOUDSAT')) { url = '/models/other_satellites/CloudSat (A).glb'; scale = 0.8; }
    else if (upper.includes('CYGNSS')) { url = '/models/other_satellites/Cyclone Global Navigation Satellite System (CYGNSS).glb'; scale = 0.8; }
    else if (upper.includes('GOES')) { url = '/models/other_satellites/Geostationary Operational Environmental Satellites.glb'; scale = 0.8; }
    else if (upper.includes('HINODE')) { url = '/models/other_satellites/Hinode (Solar-B).glb'; scale = 0.8; }
    else if (upper.includes('ICESAT-2')) { url = '/models/other_satellites/Ice, Clouds, and Land Elevation Satellite-2 (ICESat-2) (A).glb'; scale = 0.8; }
    else if (upper.includes('ICESAT')) { url = '/models/other_satellites/Ice, Clouds, and Land Elevation Satellite (ICESat) (A).glb'; scale = 0.8; }
    else if (upper.includes('LANDSAT 7')) { url = '/models/other_satellites/Landsat 7.glb'; scale = 0.8; }
    else if (upper.includes('LANDSAT')) { url = '/models/other_satellites/Landsat 4 and 5.glb'; scale = 0.8; }
    else if (upper.includes('JASON')) { url = '/models/other_satellites/Ocean Surface Topography Mission (OSTM Jason-2).glb'; scale = 0.8; }
    else if (upper.includes('OCO')) { url = '/models/other_satellites/Orbiting Carbon Observatory (OCO) 2.glb'; scale = 0.8; }
    else if (upper.includes('QUIKSCAT')) { url = '/models/other_satellites/Quick Scatterometer (QuikSCAT).glb'; scale = 0.8; }
    else if (upper.includes('RADARSAT')) { url = '/models/other_satellites/Radar Satellite-1 (RADARSAT-1).glb'; scale = 0.8; }
    else if (upper.includes('SUOMI')) { url = '/models/other_satellites/Suomi National Polar-orbiting Partnership (Suomi NPP).glb'; scale = 0.8; }
    else if (upper.includes('SUZAKU')) { url = '/models/other_satellites/Suzaku.glb'; scale = 0.8; }
    else if (upper.includes('SWIFT')) { url = '/models/other_satellites/Swift.glb'; scale = 0.8; }
    else if (upper.includes('TOPEX')) { url = '/models/other_satellites/TOPEX-Poseidon.glb'; scale = 0.8; }
    else if (upper.includes('TDRS')) { url = '/models/other_satellites/Tracking and Data Relay Satellites (TDRS) (A).glb'; scale = 0.8; }
    else if (upper.includes('TESS')) { url = '/models/other_satellites/Transiting Exoplanet Survey Satellite (TESS) (A).glb'; scale = 0.8; }
    else if (upper.includes('TRMM')) { url = '/models/other_satellites/Tropical Rainfall Measuring Mission (TRMM).glb'; scale = 0.8; }
    else if (upper.includes('STARLINK')) { url = '/models/other_satellites/starlink_spacex_satellite.glb'; scale = 0.8; }
    else { url = null; } // Will trigger procedural fallback
  }
  
  return { url, scale };
}

// Deterministic random based on string hash
function seededRandom(str: string) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = Math.imul(31, h) + str.charCodeAt(i) | 0;
  return function() {
    h = Math.imul(h ^ h >>> 16, 2246822507);
    h = Math.imul(h ^ h >>> 13, 3266489909);
    return (h ^= h >>> 16) >>> 0;
  };
}

const ALL_SATELLITE_MODELS = [
  { url: '/models/other_satellites/Aqua (C).glb', scale: 0.8 },
  { url: '/models/other_satellites/Cloud-Aerosol Lidar and Infrared Pathfinder Satellite (CALIPSO).glb', scale: 0.8 },
  { url: '/models/other_satellites/CloudSat (A).glb', scale: 0.8 },
  { url: '/models/other_satellites/Cyclone Global Navigation Satellite System (CYGNSS).glb', scale: 0.8 },
  { url: '/models/other_satellites/Geostationary Operational Environmental Satellites.glb', scale: 0.8 },
  { url: '/models/other_satellites/Hinode (Solar-B).glb', scale: 0.8 },
  { url: '/models/other_satellites/Ice, Clouds, and Land Elevation Satellite-2 (ICESat-2) (A).glb', scale: 0.8 },
  { url: '/models/other_satellites/Ice, Clouds, and Land Elevation Satellite (ICESat) (A).glb', scale: 0.8 },
  { url: '/models/other_satellites/Landsat 7.glb', scale: 0.8 },
  { url: '/models/other_satellites/Landsat 4 and 5.glb', scale: 0.8 },
  { url: '/models/other_satellites/Ocean Surface Topography Mission (OSTM Jason-2).glb', scale: 0.8 },
  { url: '/models/other_satellites/Orbiting Carbon Observatory (OCO) 2.glb', scale: 0.8 },
  { url: '/models/other_satellites/Quick Scatterometer (QuikSCAT).glb', scale: 0.8 },
  { url: '/models/other_satellites/Radar Satellite-1 (RADARSAT-1).glb', scale: 0.8 },
  { url: '/models/other_satellites/Suomi National Polar-orbiting Partnership (Suomi NPP).glb', scale: 0.8 },
  { url: '/models/other_satellites/Suzaku.glb', scale: 0.8 },
  { url: '/models/other_satellites/Swift.glb', scale: 0.8 },
  { url: '/models/other_satellites/TOPEX-Poseidon.glb', scale: 0.8 },
  { url: '/models/other_satellites/Tracking and Data Relay Satellites (TDRS) (A).glb', scale: 0.8 },
  { url: '/models/other_satellites/Transiting Exoplanet Survey Satellite (TESS) (A).glb', scale: 0.8 },
  { url: '/models/other_satellites/Tropical Rainfall Measuring Mission (TRMM).glb', scale: 0.8 },
  { url: '/models/other_satellites/starlink_spacex_satellite.glb', scale: 0.8 },
];

function ProceduralSatellite({ name, isDebris, dashboardMode }: { name: string, isDebris: boolean, dashboardMode?: boolean }) {
  const rand = seededRandom(name);
  const r = () => rand() / 4294967296;

  if (isDebris) {
    const s = (0.1 + r() * 0.4) * (dashboardMode ? 10 : 1);
    return (
      <mesh>
        <dodecahedronGeometry args={[s, 0]} />
        <meshStandardMaterial color="#ef4444" roughness={0.9} metalness={0.1} />
      </mesh>
    );
  }

  // Use one of the 36 custom GLB models randomly
  const idx = Math.floor(r() * ALL_SATELLITE_MODELS.length);
  const fallback = ALL_SATELLITE_MODELS[idx];

  const finalScale = fallback.scale * (dashboardMode ? 3 : 1);
  return <DynamicGLTF url={fallback.url} scale={finalScale} />;
}

export function DynamicSatellite({ name, isDebris, dashboardMode = false }: { name: string, isDebris: boolean, dashboardMode?: boolean }) {
  const { url, scale } = getSatelliteModelInfo(name, isDebris);

  if (url) {
    return <DynamicGLTF url={url} scale={scale * (dashboardMode ? 3 : 1)} />;
  }

  // Pure fallback if file doesn't exist
  return <ProceduralSatellite name={name} isDebris={isDebris} dashboardMode={dashboardMode} />;
}

import * as THREE from 'three';

function DynamicGLTF({ url, scale }: { url: string, scale: number }) {
  const { scene } = useGLTF(url);
  const clonedScene = useMemo(() => {
    const clone = scene.clone();
    // Normalize bounding box: scale model mathematically to exactly 1 unit diameter natively
    const box = new THREE.Box3().setFromObject(clone);
    const size = new THREE.Vector3();
    box.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z);
    if (maxDim > 0) {
       // Offset it so its center is 0,0,0
       const center = new THREE.Vector3();
       box.getCenter(center);
       clone.position.sub(center);
       // Now scale the container to 1
       const wrapper = new THREE.Group();
       wrapper.add(clone);
       wrapper.scale.set(1/maxDim, 1/maxDim, 1/maxDim);
       return wrapper;
    }
    return clone;
  }, [scene, url]);
  
  // SMAP specific orientation fix: point dish away from Earth
  if (url.includes('SMAP.glb')) {
    return (
      <group rotation={[Math.PI / 2, Math.PI, 0]} scale={scale}>
        <primitive object={clonedScene} />
      </group>
    );
  }
  
  return (
    <group scale={scale}>
      <primitive object={clonedScene} />
    </group>
  );
}
