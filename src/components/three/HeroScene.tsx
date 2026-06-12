'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Stars } from '@react-three/drei';
import { useRef } from 'react';
import * as THREE from 'three';

// The ball reacts to page scroll: spins faster, drifts up, and shrinks
// as the user scrolls toward the content sections.
function CricketBall() {
  const group = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (!group.current) return;
    const progress = Math.min(window.scrollY / window.innerHeight, 1);
    group.current.rotation.y += delta * (0.6 + progress * 3);
    group.current.rotation.x += delta * 0.15;
    group.current.position.y = THREE.MathUtils.lerp(group.current.position.y, progress * 1.6, 0.08);
    const target = 1 - progress * 0.45;
    group.current.scale.setScalar(THREE.MathUtils.lerp(group.current.scale.x, target, 0.08));
  });
  return (
    <group ref={group}>
      <mesh>
        <sphereGeometry args={[1.2, 64, 64]} />
        <meshStandardMaterial color="#8b1a1a" roughness={0.35} metalness={0.05} />
      </mesh>
      {/* Seam stitching rings */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.205, 0.016, 16, 128]} />
        <meshStandardMaterial color="#f5f0e6" roughness={0.6} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.07, 0]}>
        <torusGeometry args={[1.198, 0.008, 16, 128]} />
        <meshStandardMaterial color="#f5f0e6" roughness={0.6} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -0.07, 0]}>
        <torusGeometry args={[1.198, 0.008, 16, 128]} />
        <meshStandardMaterial color="#f5f0e6" roughness={0.6} />
      </mesh>
    </group>
  );
}

export default function HeroScene() {
  return (
    <div className="absolute inset-0">
      <Canvas camera={{ position: [0, 0, 4.5], fov: 45 }}>
        <ambientLight intensity={0.35} />
        {/* Stadium floodlights */}
        <spotLight position={[5, 8, 5]} intensity={120} color="#fff3c4" angle={0.4} />
        <spotLight position={[-5, 6, -3]} intensity={60} color="#9fffcf" angle={0.5} />
        <Float speed={2} rotationIntensity={0.4} floatIntensity={0.8}>
          <CricketBall />
        </Float>
        <Stars radius={60} depth={40} count={1500} factor={3} fade />
      </Canvas>
    </div>
  );
}
