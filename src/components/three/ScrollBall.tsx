'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';

// Two cricket balls travel DOWN the page as the user scrolls, rolling as they
// go. Rendered in a fixed, full-viewport canvas behind the content
// (pointer-events-none) so they tie the whole landing scroll together — the
// "object follows you down" feel. The white Kookaburra and the red leather
// ball drift on mirrored S-curves (dir = +1 / -1), crossing past each other.
interface BallProps {
  bodyColor: string;
  seamColor: string;
  stitchColor: string;
  dir: 1 | -1; // +1 = white's path, -1 = mirrored (opposite) path
  scale: number;
  startX: number; // initial X so the two don't spawn on top of each other
}

function RollingBall({ bodyColor, seamColor, stitchColor, dir, scale, startX }: BallProps) {
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

    // Drift left<->right across the page as it descends (S-curve). dir flips
    // the curve so the red ball mirrors the white one.
    const targetX = dir * Math.sin(progress * Math.PI * 1.5) * 2.2;
    group.current.position.x = THREE.MathUtils.lerp(group.current.position.x, targetX, 0.1);

    // Roll: rotation tied to travel, direction matched to drift, plus idle spin.
    group.current.rotation.z = -dir * progress * Math.PI * 6;
    group.current.rotation.y += dir * delta * 0.4;
  });

  return (
    <group ref={group} position={[startX, 3, 0]} scale={scale}>
      <mesh>
        <sphereGeometry args={[0.7, 64, 64]} />
        <meshStandardMaterial color={bodyColor} roughness={0.45} metalness={0.05} />
      </mesh>
      {/* Dark seam + raised stitching rows (the "grip") */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.704, 0.022, 16, 160]} />
        <meshStandardMaterial color={seamColor} roughness={0.7} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.055, 0]}>
        <torusGeometry args={[0.7, 0.01, 16, 160]} />
        <meshStandardMaterial color={stitchColor} roughness={0.75} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -0.055, 0]}>
        <torusGeometry args={[0.7, 0.01, 16, 160]} />
        <meshStandardMaterial color={stitchColor} roughness={0.75} />
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
        {/* White Kookaburra */}
        <RollingBall
          bodyColor="#f4f5f1"
          seamColor="#1c1c1c"
          stitchColor="#2a2a2a"
          dir={1}
          scale={0.62}
          startX={0}
        />
        {/* Red leather, mirrored opposite path */}
        <RollingBall
          bodyColor="#9e1b1b"
          seamColor="#f5f0e6"
          stitchColor="#e8e0cf"
          dir={-1}
          scale={0.62}
          startX={0}
        />
      </Canvas>
    </div>
  );
}
