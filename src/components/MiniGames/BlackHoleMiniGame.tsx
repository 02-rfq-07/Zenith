'use client';

import React, { Suspense, useRef, useState, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, Html, Stars, OrbitControls } from '@react-three/drei';
import { useSpring, a } from '@react-spring/three';
import { useDrag } from '@use-gesture/react';
import * as THREE from 'three';

// 1. The Black Hole Component
function BlackHole() {
  const { scene } = useGLTF('/models/blackhole.glb');
  const ref = useRef<THREE.Group>(null);

  const normalizedScene = useMemo(() => {
    const clone = scene.clone();
    const box = new THREE.Box3().setFromObject(clone);
    const size = new THREE.Vector3();
    box.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z);
    if (maxDim > 0) {
       const center = new THREE.Vector3();
       box.getCenter(center);
       clone.position.sub(center);
       const wrapper = new THREE.Group();
       wrapper.add(clone);
       wrapper.scale.set(1/maxDim, 1/maxDim, 1/maxDim);
       return wrapper;
    }
    return clone;
  }, [scene]);

  // Auto rotate the black hole slowly
  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.5;
    }
  });

  return (
    <group ref={ref} scale={2.5} position={[0, 0, 0]}>
      <primitive object={normalizedScene} />
    </group>
  );
}

// 2. The Draggable Object
function DraggableObject({ 
  id, 
  initialPos, 
  onEaten 
}: { 
  id: number; 
  initialPos: [number, number, number]; 
  onEaten: (id: number) => void;
}) {
  const { size, viewport } = useThree();
  const aspect = size.width / viewport.width;

  // React Spring for physics and animation
  const [{ pos, scale }, api] = useSpring(() => ({
    pos: initialPos,
    scale: [1, 1, 1],
    config: { mass: 1, tension: 170, friction: 26 }
  }));

  const [isEaten, setIsEaten] = useState(false);
  const meshRef = useRef<THREE.Mesh>(null);

  // Auto rotate object
  useFrame((_, delta) => {
    if (meshRef.current && !isEaten) {
      meshRef.current.rotation.x += delta;
      meshRef.current.rotation.y += delta * 1.5;
    }
  });

  // Setup drag interaction
  const bind = useDrag(({ offset: [x, y], first, last, active }) => {
    if (isEaten) return;

    // Convert pixel offset to 3D world space
    const targetX = (x / aspect) + initialPos[0];
    const targetY = (-y / aspect) + initialPos[1];

    if (active) {
      api.start({ pos: [targetX, targetY, 0], config: { tension: 300, friction: 20 } });
    } else {
      // Check distance to center (black hole)
      const dist = Math.sqrt(targetX * targetX + targetY * targetY);
      if (dist < 1.5) {
        // Eaten!
        setIsEaten(true);
        api.start({ 
          pos: [0, 0, 0], 
          scale: [0, 0, 0], 
          config: { mass: 1, tension: 120, friction: 14 },
          onRest: () => {
            onEaten(id);
          }
        });
      } else {
        // Float back a bit or just stay where dropped
        // We'll let it stay where dropped but update initialPos logically
        // Actually, returning to initial position is cleaner for the mini-game
        api.start({ pos: initialPos, config: { tension: 100, friction: 10 } });
      }
    }
  });

  // Procedural rock/planet
  const color = useMemo(() => {
    const colors = ['#8b5cf6', '#06b6d4', '#f59e0b', '#10b981', '#f43f5e'];
    return colors[Math.floor(Math.random() * colors.length)];
  }, []);

  const shapeType = id % 3;

  return (
    <a.mesh 
      {...(bind() as any)}
      ref={meshRef}
      position={pos as any}
      scale={scale as any}
      castShadow
      receiveShadow
    >
      {shapeType === 0 ? <dodecahedronGeometry args={[0.3, 0]} /> :
       shapeType === 1 ? <octahedronGeometry args={[0.3, 1]} /> :
       <icosahedronGeometry args={[0.3, 0]} />}
      <meshStandardMaterial color={color} roughness={0.8} metalness={0.2} />
    </a.mesh>
  );
}

// 3. Main Scene
export default function BlackHoleMiniGame() {
  const [objects, setObjects] = useState<{id: number, pos: [number, number, number]}[]>([
    { id: 1, pos: [-2, 1.5, 0] },
    { id: 2, pos: [2, 1.5, 0] },
    { id: 3, pos: [-2, -1.5, 0] },
    { id: 4, pos: [2, -1.5, 0] }
  ]);

  const handleEaten = (eatenId: number) => {
    setObjects(prev => {
      // Remove eaten object
      const filtered = prev.filter(o => o.id !== eatenId);
      
      // Spawn a new one at a random edge
      const angle = Math.random() * Math.PI * 2;
      const radius = 2.5 + Math.random();
      const newPos: [number, number, number] = [Math.cos(angle) * radius, Math.sin(angle) * radius, 0];
      
      // Use a robust unique ID instead of closure-captured state
      const uniqueId = Date.now() + Math.floor(Math.random() * 10000);
      return [...filtered, { id: uniqueId, pos: newPos }];
    });
  };

  return (
    <div className="w-full h-[350px] glass-panel hud-border relative overflow-hidden mt-6 flex flex-col">
      <div className="absolute top-4 left-4 z-10 flex items-center space-x-2 text-cyan-400">
         <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse shadow-[0_0_8px_#06b6d4]"></span>
         <span className="font-mono text-xs uppercase tracking-widest font-bold">Gravitational Anomaly Sector</span>
      </div>
      <div className="absolute top-10 left-4 z-10">
         <p className="text-[10px] text-white/40 font-mono uppercase tracking-widest">
           Drag orbital bodies into the singularity.
         </p>
      </div>

      <div className="absolute inset-0 cursor-grab active:cursor-grabbing">
        <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
          <ambientLight intensity={1.5} />
          <directionalLight position={[10, 10, 5]} intensity={2} />
          <pointLight position={[0, 0, 0]} intensity={5} color="#8b5cf6" distance={5} />
          
          <Stars radius={10} depth={50} count={1500} factor={4} saturation={0} fade speed={1} />
          
          <OrbitControls enablePan={false} enableZoom={true} maxDistance={15} minDistance={2} />

          <Suspense fallback={<Html center><div className="text-[10px] text-cyan-500 font-mono animate-pulse">ANALYZING SINGULARITY...</div></Html>}>
            <BlackHole />
          </Suspense>

          {objects.map(obj => (
            <DraggableObject 
              key={obj.id} 
              id={obj.id} 
              initialPos={obj.pos} 
              onEaten={handleEaten} 
            />
          ))}
        </Canvas>
      </div>
    </div>
  );
}
