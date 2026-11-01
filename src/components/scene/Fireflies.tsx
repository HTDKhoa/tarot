"use client";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

/** Đom đóm: điểm vuông (đúng chất pixel), sáng vượt ngưỡng để bloom bắt. */
export function Fireflies({ count = 40, area = [6, 2.4, 2] as [number, number, number], center = [0, -0.4, -0.6] as [number, number, number], color = "#ffe08a", size = 4 }) {
  const ref = useRef<THREE.Points>(null);
  const seeds = useMemo(
    () => Array.from({ length: count }, () => [Math.random(), Math.random(), Math.random(), Math.random() * Math.PI * 2]),
    [count],
  );
  const positions = useMemo(() => new Float32Array(count * 3), [count]);
  const colors = useMemo(() => new Float32Array(count * 3), [count]);
  const base = useMemo(() => new THREE.Color(color).multiplyScalar(2.4), [color]);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    for (let i = 0; i < count; i++) {
      const [a, b, c, p] = seeds[i];
      positions[i * 3] = center[0] + (a - 0.5) * area[0] + Math.sin(t * 0.3 + p) * 0.25;
      positions[i * 3 + 1] = center[1] + (b - 0.5) * area[1] + Math.sin(t * 0.7 + p * 2) * 0.12;
      positions[i * 3 + 2] = center[2] + (c - 0.5) * area[2];
      const blink = Math.max(0, Math.sin(t * (0.8 + a) + p * 3));
      colors[i * 3] = base.r * blink;
      colors[i * 3 + 1] = base.g * blink;
      colors[i * 3 + 2] = base.b * blink;
    }
    const g = ref.current?.geometry;
    if (g) {
      g.attributes.position.needsUpdate = true;
      g.attributes.color.needsUpdate = true;
    }
  });

  return (
    <points ref={ref} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial size={size} sizeAttenuation={false} vertexColors transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
    </points>
  );
}
