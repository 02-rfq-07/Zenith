import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line, useGLTF, Html } from '@react-three/drei';
import * as THREE from 'three';

function CustomSpacecraftModel({ name, size }: { name: string, size: number }) {
  const { scene } = useGLTF(`/models/spacecraft/${name}.glb`);
  const clonedScene = useMemo(() => {
    const clone = scene.clone();
    const box = new THREE.Box3().setFromObject(clone);
    const sz = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(sz.x, sz.y, sz.z);
    if (maxDim > 0) clone.scale.set(1/maxDim, 1/maxDim, 1/maxDim);
    
    if (name === 'voyager') clone.rotation.x = Math.PI / 4;
    
    clone.scale.multiplyScalar(size);
    return clone;
  }, [scene, size, name]);

  return <primitive object={clonedScene} />;
}

export function DeepSpaceMissions({ timeOffset, selectedPlanet }: { timeOffset: number, selectedPlanet: string | null }) {
   const voyagerRef = useRef<THREE.Group>(null);
   const jwstRef = useRef<THREE.Group>(null);
   const transferRoverRef = useRef<THREE.Group>(null);

   const voyagerPoints = useMemo(() => {
     const pts = [];
     for(let i=0; i<100; i++) pts.push(new THREE.Vector3(i * 10, i * 2, i * 5));
     return pts;
   }, []);

   const marsOrbitRadius = 300;
   const sunPos = new THREE.Vector3(-200, 0, 0);
   const marsLandingAngle = 4.1;
   const marsPos = new THREE.Vector3(
     sunPos.x + marsOrbitRadius * Math.cos(marsLandingAngle),
     0,
     sunPos.z + marsOrbitRadius * Math.sin(marsLandingAngle)
   );

   const transferCurve = useMemo(() => {
     const start = new THREE.Vector3(0,0,0);
     const end = marsPos;
     const mid = start.clone().lerp(end, 0.5);
     mid.x += 50; 
     mid.z += 100;
     return new THREE.QuadraticBezierCurve3(start, mid, end);
   }, [marsPos]);

   const transferPoints = useMemo(() => transferCurve.getPoints(50), [transferCurve]);

   useFrame((state) => {
      if (voyagerRef.current) {
        const t = Math.max(0, state.clock.elapsedTime * 0.1 + (timeOffset * 0.1));
        voyagerRef.current.position.set(t * 10, t * 2, t * 5);
      }

      if (transferRoverRef.current) {
         const progress = Math.max(0, Math.min(1, (timeOffset + 1440) / 1440));
         const pos = transferCurve.getPointAt(progress);
         transferRoverRef.current.position.copy(pos);
         if (progress < 0.99) {
            const next = transferCurve.getPointAt(Math.min(1, progress + 0.01));
            transferRoverRef.current.lookAt(next);
         }
         
         const wp = new THREE.Vector3();
         transferRoverRef.current.getWorldPosition(wp);
         (window as any).roverTransferTracking = wp;
      }

      if (jwstRef.current) {
         const ht = state.clock.elapsedTime * 0.5 + (timeOffset * 0.01);
         jwstRef.current.position.set(2, Math.sin(ht)*0.5, Math.cos(ht)*0.5);
      }
   });

   return (
     <group>
        <Line points={voyagerPoints} color="#d97706" opacity={0.3} lineWidth={1} transparent dashed dashSize={2} gapSize={2} />
        <group ref={voyagerRef}>
          <CustomSpacecraftModel name="voyager" size={2} />
          <Html position={[0, 3, 0]} center style={{ pointerEvents: 'none' }}>
            <div className={`font-mono text-[8px] uppercase tracking-[0.3em] px-2 py-1 rounded backdrop-blur-sm transition-colors ${selectedPlanet === 'Voyager 1' ? 'bg-[var(--theme-500)]/80 text-white' : 'bg-black/50 text-white/50 border border-white/10'}`}>VOYAGER 1</div>
          </Html>
        </group>

        <group ref={jwstRef}>
          <CustomSpacecraftModel name="jwst" size={0.5} />
          <Html position={[0, 1.5, 0]} center style={{ pointerEvents: 'none' }}>
             <div className={`font-mono text-[8px] uppercase tracking-[0.3em] px-2 py-1 rounded backdrop-blur-sm transition-colors ${selectedPlanet === 'James Webb Space Telescope' ? 'bg-[var(--theme-500)]/80 text-white' : 'bg-black/50 text-white/50 border border-white/10'}`}>JWST</div>
          </Html>
        </group>

        <Line points={transferPoints} color="#ef4444" opacity={0.4} lineWidth={2} transparent dashed dashSize={4} gapSize={4} />
        {timeOffset < 0 && (
          <group ref={transferRoverRef}>
             <CustomSpacecraftModel name="rover" size={1} />
             <Html position={[0, 2, 0]} center style={{ pointerEvents: 'none' }}>
                <div className={`font-mono text-[8px] uppercase tracking-[0.3em] px-2 py-1 rounded backdrop-blur-sm transition-colors bg-red-500/80 border border-red-400/50 text-white`}>CRUISE STAGE</div>
             </Html>
          </group>
        )}
     </group>
   );
}

export function MarsRoverSurface({ radius, isDriving }: { radius: number, isDriving: boolean }) {
  const roverRef = useRef<THREE.Group>(null);
  
  const [lat, setLat] = useState(0);
  const [lon, setLon] = useState(0);
  const [heading, setHeading] = useState(0);
  const keys = useRef({ w: false, a: false, s: false, d: false });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'w' || e.key === 'ArrowUp') keys.current.w = true;
      if (e.key === 's' || e.key === 'ArrowDown') keys.current.s = true;
      if (e.key === 'a' || e.key === 'ArrowLeft') keys.current.a = true;
      if (e.key === 'd' || e.key === 'ArrowRight') keys.current.d = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'w' || e.key === 'ArrowUp') keys.current.w = false;
      if (e.key === 's' || e.key === 'ArrowDown') keys.current.s = false;
      if (e.key === 'a' || e.key === 'ArrowLeft') keys.current.a = false;
      if (e.key === 'd' || e.key === 'ArrowRight') keys.current.d = false;
    };
    if (isDriving) {
      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('keyup', handleKeyUp);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    }
  }, [isDriving]);

  useFrame((state, delta) => {
    if (isDriving) {
      if (keys.current.a) setHeading(h => h + delta * 1.5);
      if (keys.current.d) setHeading(h => h - delta * 1.5);

      const speed = 0.5;
      if (keys.current.w) {
         setLat(l => l + Math.cos(heading) * delta * speed);
         setLon(l => l + Math.sin(heading) * delta * speed);
      }
      if (keys.current.s) {
         setLat(l => l - Math.cos(heading) * delta * speed);
         setLon(l => l - Math.sin(heading) * delta * speed);
      }
    }

    if (roverRef.current) {
      const phi = Math.PI / 2 - lat;
      const theta = lon;
      
      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.cos(phi);
      const z = radius * Math.sin(phi) * Math.sin(theta);
      roverRef.current.position.set(x, y, z);
      
      const normal = new THREE.Vector3(x,y,z).normalize();
      
      const nextLat = lat + Math.cos(heading)*0.01;
      const nextLon = lon + Math.sin(heading)*0.01;
      const nPhi = Math.PI / 2 - nextLat;
      const nTheta = nextLon;
      const lookTarget = new THREE.Vector3(
        radius * Math.sin(nPhi) * Math.cos(nTheta),
        radius * Math.cos(nPhi),
        radius * Math.sin(nPhi) * Math.sin(nTheta)
      );
      
      roverRef.current.up.copy(normal);
      roverRef.current.lookAt(lookTarget);

      if (isDriving) {
         const wp = new THREE.Vector3();
         roverRef.current.getWorldPosition(wp);
         const wq = new THREE.Quaternion();
         roverRef.current.getWorldQuaternion(wq);
         
         const worldUp = new THREE.Vector3(0,1,0).applyQuaternion(wq);
         const worldForward = new THREE.Vector3(0,0,1).applyQuaternion(wq);

         (window as any).roverTracking = {
            pos: wp,
            up: worldUp,
            forward: worldForward
         };
      }
    }
  });

  return (
    <group ref={roverRef}>
      <CustomSpacecraftModel name="rover" size={0.5} />
      {!isDriving && (
        <Html position={[0, 1, 0]} center style={{ pointerEvents: 'none' }}>
           <div className={`font-mono text-[6px] uppercase tracking-[0.3em] px-1 py-0.5 rounded backdrop-blur-sm bg-red-500/80 text-white border border-red-400`}>PERSEVERANCE</div>
        </Html>
      )}
    </group>
  );
}
