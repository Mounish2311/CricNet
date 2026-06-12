'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';

interface Stat {
  label: string;
  value: number; // normalized 0..1
  color: string;
}

function Bar({ stat, index }: { stat: Stat; index: number }) {
  const mesh = useRef<THREE.Mesh>(null);
  const target = Math.max(stat.value, 0.05) * 2.2;
  useFrame(() => {
    if (!mesh.current) return;
    // Animate bars growing up to their target height
    const s = mesh.current.scale;
    s.y = THREE.MathUtils.lerp(s.y, target, 0.06);
    mesh.current.position.y = (s.y * 0.5) - 1;
  });
  return (
    <mesh ref={mesh} position={[(index - 1.5) * 0.9, -1, 0]} scale={[1, 0.01, 1]}>
      <boxGeometry args={[0.55, 1, 0.55]} />
      <meshStandardMaterial color={stat.color} roughness={0.3} metalness={0.4} />
    </mesh>
  );
}

export default function StatBars3D({ stats }: { stats: Stat[] }) {
  return (
    <div className="h-56 w-full">
      <Canvas camera={{ position: [0, 1, 4.2], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <spotLight position={[4, 6, 4]} intensity={80} color="#fff3c4" />
        {stats.map((s, i) => (
          <Bar key={s.label} stat={s} index={i} />
        ))}
      </Canvas>
      <div className="-mt-6 flex justify-around text-xs text-zinc-400">
        {stats.map((s) => (
          <span key={s.label}>{s.label}</span>
        ))}
      </div>
    </div>
  );
}
