"use client";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { PX, PixelSprite, framePos, useRadialTexture } from "./pixel";
import { sceneStore } from "@/lib/store";

const T = "/assets/table";
const I = "/assets/interior";

/**
 * Cúi xuống tại chỗ: cảnh bàn đặt ngay trên chiếc bàn trước mặt Nguyệt ở góc mặt Nguyệt (mặt khăn của
 * interior table.png, khung 640×360 từ y 250 tới 300, z 0.5, phóng overscan 1.08). Máy chỉ hạ nhẹ xuống đó
 * trong khi mặt bàn nhìn từ trên hiện dần lên đè lên cảnh trong nhà; không lia qua vạt khăn sang chỗ khác.
 */
const TABLE_SURFACE_Y = framePos(320, 275, 0.5)[1] * 1.08;

/** Khung ngắm của cảnh bàn: bản ngang cho màn ngang, bản dọc cho điện thoại. */
export const tableFrame = (portrait: boolean): [number, number] => (portrait ? [360, 640] : [640, 360]);
/** Tâm cảnh bàn trong thế giới, nơi camera nhìn vào khi hạ xuống: chính mặt bàn trước mặt Nguyệt. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const tableCenterY = (_portrait: boolean) => TABLE_SURFACE_Y;

/** Độ hiện của cảnh bàn (0..1), dùng chung cho ảnh mặt bàn, cây nến và ánh nến. */
type Fade = { current: number };

/** Ngọn nến đặt ở góc trên phải mặt bàn: chính nó thắp khăn (point light) và cho bloom bắt (flame glow). */
function TableCandle({ x, y, size, fade }: { x: number; y: number; size: number; fade: Fade }) {
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
    // ánh nến bàn chỉ sáng khi đang nhìn xuống bàn, để không rọi thêm vào cảnh trong nhà
    if (light.current) light.current.intensity = 8.5 * base * flicker * fade.current;
    if (halo.current) (halo.current.material as THREE.MeshBasicMaterial).opacity = 0.4 * base * flicker * fade.current;
    tf.current += dt;
    if (tf.current > 0.12) {
      tf.current = 0;
      setFlame((f) => (f + 1) % 4);
    }
  });
  // candle.png 20×40: bấc ở (10, 5); flame_N.png 10×16, đáy ngọn lửa ở (5, 15)
  const S = size;
  const candleY = y;
  const wickY = candleY + (20 - 5) * PX * S;
  const flameY = wickY + (15 - 8) * PX * S;
  return (
    <>
      <pointLight ref={light} position={[x, y + 0.2, 1.4]} color="#ffb061" intensity={8.5} distance={9} decay={1.1} />
      <mesh ref={halo} position={[x, flameY, 0.05]} scale={[3.2, 3.2, 1]} renderOrder={12} userData={{ halo: true }}>
        <planeGeometry />
        <meshBasicMaterial map={tex} transparent opacity={0.4} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </mesh>
      {/* chính cây nến là nguồn sáng: giữ màu sáp thật, không nhận ánh nến của chính nó */}
      <PixelSprite src={`${I}/candle.png`} position={[x, candleY, 0.06]} scale={S} mode="flat" renderOrder={13} />
      <PixelSprite src={flames} frame={flame} position={[x, flameY, 0.07]} scale={S} mode="glow" glowStrength={2.1} glowColor="#ffd08a" renderOrder={14} />
    </>
  );
}

/**
 * Mặt bàn nhìn từ chỗ khách ngồi, cúi xuống. Lá, tay Nguyệt và cuốn sổ là lớp DOM đặt trên cảnh này.
 * Nến (gần, bên phải) và quả cầu pha lê (gần, bên trái) đứng đúng chỗ như ở góc mặt Nguyệt; toạ độ tính
 * theo pixel của ảnh mặt bàn (khớp art/table.py tabletop). Cảnh vẽ đè lên cảnh trong nhà (không so chiều sâu)
 * và hiện dần khi máy cúi xuống, mờ đi khi ngẩng lên.
 */
export function TableScene({ portrait }: { portrait: boolean }) {
  const [w, h] = tableFrame(portrait);
  const cy = tableCenterY(portrait);
  const group = useRef<THREE.Group>(null);
  const fade = useRef(sceneStore.get().stage === "table" ? 1 : 0);
  const prepared = useRef(false);
  // pixel ảnh mặt bàn -> toạ độ thế giới (ảnh bản ngang rộng 960, hơn khung 640, để máy lia khi có sổ)
  const iw = portrait ? w : 960;
  const at = (u: number, v: number): [number, number] => [(u - iw / 2) * PX, cy + (h / 2 - v) * PX];
  const candleS = portrait ? 1.2 : 1.6;
  // điện thoại: mép gần thường nằm sau cuốn sổ và hộp thoại, nên nến đứng nhích lên để ngọn lửa ló ra sau sổ;
  // quả cầu pha lê không đặt (ở góc mặt Nguyệt trên điện thoại nó cũng nằm ngoài khung)
  const [candleX, candleY] = at(portrait ? 290 : 650, (portrait ? 400 : 232) - 20 * candleS);
  const [ballX, ballY] = at(portrait ? 70 : 312, (portrait ? 440 : 232) - 14 * candleS);

  useFrame((_, dt) => {
    const g = group.current;
    if (!g) return;
    const target = sceneStore.get().stage === "table" ? 1 : 0;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    fade.current = reduce ? target : THREE.MathUtils.damp(fade.current, target, 3.4, dt);
    if (Math.abs(fade.current - target) < 0.004) fade.current = target;
    g.visible = fade.current > 0.002;
    g.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh) return;
      const mat = m.material as THREE.Material & { userData: { base?: number } };
      if (!prepared.current) {
        // vẽ sau cảnh trong nhà và không so chiều sâu, để đè lên trọn cảnh dù đứng ở z nào
        mat.userData.base = mat.opacity;
        mat.depthTest = false;
        mat.alphaTest = 0;
        mat.transparent = true;
        mat.needsUpdate = true;
        m.renderOrder = m.renderOrder || 10;
      }
      if (m.userData.halo) return; // quầng nến tự tính độ mờ theo fade
      mat.opacity = (mat.userData.base ?? 1) * fade.current;
    });
    prepared.current = true;
  });

  return (
    <group ref={group}>
      <PixelSprite src={portrait ? `${T}/tabletop_doc.png` : `${T}/tabletop.png`} position={[0, cy, 0]} renderOrder={10} />
      {!portrait && <PixelSprite src={`${I}/crystal.png`} position={[ballX, ballY, 0.05]} scale={candleS} renderOrder={11} />}
      <TableCandle x={candleX} y={candleY} size={candleS} fade={fade} />
    </group>
  );
}
