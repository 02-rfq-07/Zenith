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

   const voyagerPoints = useMemo(() => {
     const pts = [];
     for(let i=0; i<100; i++) pts.push(new THREE.Vector3(100 + i * 10, i * 2, i * 5));
     return pts;
   }, []);

   const jwstOrbitPoints = useMemo(() => {
     const pts = [];
     for(let i=0; i<=64; i++) {
        const a = (i/64) * Math.PI * 2;
        pts.push(new THREE.Vector3(50, Math.sin(a)*5, Math.cos(a)*5));
     }
     return pts;
   }, []);

   useFrame((state) => {
      if (voyagerRef.current) {
        const t = Math.max(0, state.clock.elapsedTime * 0.1 + (timeOffset * 0.1));
        voyagerRef.current.position.set(100 + t * 10, t * 2, t * 5);
      }

      if (jwstRef.current) {
         const ht = state.clock.elapsedTime * 0.5 + (timeOffset * 0.01);
         jwstRef.current.position.set(50, Math.sin(ht)*5, Math.cos(ht)*5);
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

        <Line points={jwstOrbitPoints} color="#c084fc" opacity={0.3} lineWidth={1} transparent dashed dashSize={2} gapSize={2} />
        <group ref={jwstRef}>
          <CustomSpacecraftModel name="jwst" size={3} />
          <Html position={[0, 3, 0]} center style={{ pointerEvents: 'none' }}>
             <div className={`font-mono text-[8px] uppercase tracking-[0.3em] px-2 py-1 rounded backdrop-blur-sm transition-colors ${selectedPlanet === 'James Webb Space Telescope' ? 'bg-[var(--theme-500)]/80 text-white' : 'bg-black/50 text-white/50 border border-white/10'}`}>JWST</div>
          </Html>
        </group>
     </group>
   );
}

export function MarsRoverSurface({ radius }: { radius: number }) {
  const roverRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime * 0.05;
    const currentLat = t;
    const currentLon = Math.sin(t * 0.5) * 0.5;

    if (roverRef.current) {
      const phi = Math.PI / 2 - currentLat;
      const theta = currentLon;
      
      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.cos(phi);
      const z = radius * Math.sin(phi) * Math.sin(theta);
      roverRef.current.position.set(x, y, z);
      
      const normal = new THREE.Vector3(x,y,z).normalize();
      
      const nextLat = currentLat + 0.01;
      const nextLon = currentLon + Math.cos(t * 0.5) * 0.01;
      const nPhi = Math.PI / 2 - nextLat;
      const nTheta = nextLon;
      const lookTarget = new THREE.Vector3(
        radius * Math.sin(nPhi) * Math.cos(nTheta),
        radius * Math.cos(nPhi),
        radius * Math.sin(nPhi) * Math.sin(nTheta)
      );
      
      roverRef.current.up.copy(normal);
      roverRef.current.lookAt(lookTarget);

      // Export tracking data for CameraController
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
  });

  return (
    <group ref={roverRef}>
      <CustomSpacecraftModel name="rover" size={0.3} />
      <Html position={[0, 1, 0]} center style={{ pointerEvents: 'none' }}>
         <div className={`font-mono text-[6px] uppercase tracking-[0.3em] px-1 py-0.5 rounded backdrop-blur-sm bg-red-500/80 text-white border border-red-400`}>PERSEVERANCE</div>
      </Html>
    </group>
  );
}
