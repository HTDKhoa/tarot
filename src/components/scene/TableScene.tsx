"use client";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { FRAME_H, PX, PixelSprite, useRadialTexture } from "./pixel";
import { sceneStore } from "@/lib/store";

const T = "/assets/table";
const I = "/assets/interior";

/** Mép trên của mặt bàn trùng mép dưới khung trong nhà (đã phóng overscan 1.08), để máy lia dọc liền một mạch. */
const TOP_Y = -(FRAME_H * PX * 1.08) / 2;

/** Khung ngắm của cảnh bàn: bản ngang cho màn ngang, bản dọc cho điện thoại. */
export const tableFrame = (portrait: boolean): [number, number] => (portrait ? [360, 640] : [640, 360]);
/** Tâm cảnh bàn trong thế giới, nơi camera nhìn vào khi hạ xuống. */
export const tableCenterY = (portrait: boolean) => TOP_Y - (tableFrame(portrait)[1] * PX) / 2;

/** Ngọn nến đặt ở góc trên phải mặt bàn: chính nó thắp khăn (point light) và cho bloom bắt (flame glow). */
function TableCandle({ x, y }: { x: number; y: number }) {
  const light = useRef<THREE.PointLight>(null);
  const halo = useRef<THREE.Mesh>(null);
  const tex = useRadialTexture("rgba(255,190,110,0.9)", "rgba(255,150,60,0)");
  const flames = useMemo(() => [0, 1, 2, 3].map((i) => `${I}/flame_${i}.png`), []);
  const [flame, setFlame] = useState(0);
  const tf = useRef(0);
  useFrame(({ clock }, dt) => {
    const tag = sceneStore.get().tag;
    const t = clock.elapsedTime;
    const flicker = 0.88 + Math.sin(t * 13) * 0.04 + Math.sin(t * 7.3) * 0.05 + Math.random() * 0.03;
    const base = tag === "solemn" ? 0.6 : tag === "warm" ? 1.15 : tag === "reveal" ? 1.2 : 1;
    if (light.current) light.current.intensity = 8.5 * base * flicker;
    if (halo.current) (halo.current.material as THREE.MeshBasicMaterial).opacity = 0.4 * base * flicker;
    tf.current += dt;
    if (tf.current > 0.12) {
      tf.current = 0;
      setFlame((f) => (f + 1) % 4);
    }
  });
  // candle.png 20×40: bấc ở (10, 5); flame_N.png 10×16, đáy ngọn lửa ở (5, 15)
  const S = 1.6;
  const candleY = y;
  const wickY = candleY + (20 - 5) * PX * S;
  const flameY = wickY + (15 - 8) * PX * S;
  return (
    <>
      <pointLight ref={light} position={[x, y + 0.2, 1.4]} color="#ffb061" intensity={8.5} distance={9} decay={1.1} />
      <mesh ref={halo} position={[x, flameY, 0.05]} scale={[3.2, 3.2, 1]}>
        <planeGeometry />
        <meshBasicMaterial map={tex} transparent opacity={0.4} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </mesh>
      <PixelSprite src={`${I}/candle.png`} position={[x, candleY, 0.06]} scale={S} />
      <PixelSprite src={flames} frame={flame} position={[x, flameY, 0.07]} scale={S} mode="glow" glowStrength={2.8} glowColor="#ffd08a" />
    </>
  );
}

/** Mặt bàn nhìn từ trên. Lá, tay Nguyệt và cuốn sổ là lớp DOM đặt trên cảnh này (chữ thật, đọc được). */
export function TableScene({ portrait }: { portrait: boolean }) {
  const [w, h] = tableFrame(portrait);
  const cy = tableCenterY(portrait);
  // nến ở góc trên phải khăn
  // bản dọc: điện thoại cắt bớt hai mép và thanh trên cùng che đỉnh, nên đặt nến lùi vào trong
  const candleX = (w / 2 - (portrait ? 84 : 70)) * PX;
  const candleY = cy + (h / 2 - (portrait ? 96 : 56)) * PX;
  return (
    <group>
      <PixelSprite src={portrait ? `${T}/tabletop_doc.png` : `${T}/tabletop.png`} position={[0, cy, 0]} />
      <TableCandle x={candleX} y={candleY} />
    </group>
  );
}
