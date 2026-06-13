'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';

// A single cricket ball that travels DOWN the page as the user scrolls,
// rolling as it goes. Rendered in a fixed, full-viewport canvas behind the
// content (pointer-events-none) so one continuous ball ties the whole
// landing scroll together — the Bugatti-style "object follows you down" feel.
function RollingBall() {
  const group = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (!group.current) return;
    const doc = document.documentElement;
    const maxScroll = doc.scrollHeight - window.innerHeight;
    const progress = maxScroll > 0 ? Math.min(window.scrollY / maxScroll, 1) : 0;

    // Vertical travel: start near the top of the viewport, end near the
    // bottom. Camera spans roughly [-3.2, 3.2] in world Y at this distance.
    const topY = 3.0;
    const bottomY = -3.0;
    const targetY = THREE.MathUtils.lerp(topY, bottomY, progress);
    group.current.position.y = THREE.MathUtils.lerp(group.current.position.y, targetY, 0.1);

    // Drift gently left<->right across the page as it descends (S-curve).
    const targetX = Math.sin(progress * Math.PI * 1.5) * 2.2;
    group.current.position.x = THREE.MathUtils.lerp(group.current.position.x, targetX, 0.1);

    // Roll: rotation tied to how far it has travelled, plus a little idle spin.
    group.current.rotation.z = -progress * Math.PI * 6;
    group.current.rotation.y += delta * 0.4;
  });

  return (
    <group ref={group} position={[0, 3, 0]}>
      <mesh>
        <sphereGeometry args={[0.7, 64, 64]} />
        <meshStandardMaterial color="#8b1a1a" roughness={0.35} metalness={0.05} />
      </mesh>
      {/* Seam stitching rings */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.703, 0.01, 16, 128]} />
        <meshStandardMaterial color="#f5f0e6" roughness={0.6} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
        <torusGeometry args={[0.699, 0.005, 16, 128]} />
        <meshStandardMaterial color="#f5f0e6" roughness={0.6} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -0.04, 0]}>
        <torusGeometry args={[0.699, 0.005, 16, 128]} />
        <meshStandardMaterial color="#f5f0e6" roughness={0.6} />
      </mesh>
    </group>
  );
}

export default function ScrollBall() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10">
      <Canvas camera={{ position: [0, 0, 4.5], fov: 45 }}>
        <ambientLight intensity={0.4} />
        <spotLight position={[5, 8, 5]} intensity={120} color="#fff3c4" angle={0.4} />
        <spotLight position={[-5, 6, -3]} intensity={60} color="#9fffcf" angle={0.5} />
        <RollingBall />
      </Canvas>
    </div>
  );
}
