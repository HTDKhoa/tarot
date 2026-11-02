"use client";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { PX, PixelSprite, framePos, useRadialTexture } from "./pixel";
import { sceneStore } from "@/lib/store";

const T = "/assets/table";
const I = "/assets/interior";

/**
 * Cúi xuống tại chỗ: cảnh bàn mở ra từ chính chiếc bàn trước mặt Nguyệt ở góc mặt Nguyệt (mặt khăn của
 * interior table.png, khung 640×360 từ y 250 tới 300, z 0.5, phóng overscan 1.08). Lúc bắt đầu cúi, mặt bàn
 * nhìn từ trên bị ép dẹt nằm đúng lên dải khăn ấy (như mặt bàn nhìn chếch); máy hạ xuống thì mặt bàn giãn ra,
 * mép xa dâng lên che dần Nguyệt từ dưới lên, như khi người ta cúi đầu nhìn bàn. Ngẩng lên thì làm ngược lại.
 */
const STRIP_TOP = framePos(320, 250, 0.5)[1] * 1.08;
const STRIP_FRONT = framePos(320, 300, 0.5)[1] * 1.08;
const TABLE_SURFACE_Y = (STRIP_TOP + STRIP_FRONT) / 2;

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

/** Thời gian cúi xuống / ngẩng lên (giây). */
const UNFOLD_S = 0.9;

/** Mép xa / mép gần của mặt bàn trong ảnh (khớp art/table.py tabletop). */
const EDGES = { landscape: { far: 40, near: 262 }, portrait: { far: 52, near: 455 } };

/**
 * Mặt bàn nhìn từ chỗ khách ngồi, cúi xuống. Lá, tay Nguyệt và cuốn sổ là lớp DOM đặt trên cảnh này.
 * Nến (gần, bên phải) và quả cầu pha lê (gần, bên trái) đứng đúng chỗ như ở góc mặt Nguyệt, nên lúc mặt bàn
 * còn ép dẹt chúng trùng với nến và quả cầu vẽ sẵn. Cảnh vẽ đè lên cảnh trong nhà (không so chiều sâu).
 *
 * Toạ độ trong nhóm `unfold`: gốc ở mép xa, trục y đi xuống theo pixel ảnh; mỗi khung đặt vị trí và độ ép
 * dọc của nhóm theo tiến độ cúi (0: dải khăn ở góc mặt Nguyệt, 1: nhìn hẳn xuống bàn). Nến và quả cầu
 * là vật đứng nên được bù độ ép, chỉ trượt theo mặt bàn.
 */
export function TableScene({ portrait }: { portrait: boolean }) {
  const [w, h] = tableFrame(portrait);
  const cy = tableCenterY(portrait);
  const iw = portrait ? w : 960; // ảnh bản ngang rộng 960, hơn khung 640, để máy lia khi có sổ
  const { far, near } = portrait ? EDGES.portrait : EDGES.landscape;
  const unfold = useRef<THREE.Group>(null);
  const standing = useRef<THREE.Group[]>([]);
  const start = sceneStore.get().stage === "table" ? 1 : 0;
  const progress = useRef(start);
  const fade = useRef(start);
  const prepared = useRef(false);

  // pixel ảnh -> toạ độ trong nhóm unfold
  const lx = (u: number) => (u - iw / 2) * PX;
  const ly = (v: number) => -(v - far) * PX;
  const S = portrait ? 1.2 : 1.6;
  // điện thoại: mép gần thường nằm sau cuốn sổ và hộp thoại, nên nến đứng nhích lên để ngọn lửa ló ra sau sổ;
  // quả cầu pha lê không đặt (ở góc mặt Nguyệt trên điện thoại nó cũng nằm ngoài khung)
  const candle: [number, number] = [lx(portrait ? 290 : 650), ly(portrait ? 400 : 232)];
  const ball: [number, number] = [lx(312), ly(232)];
  // độ ép dọc lúc bắt đầu: cả mặt bàn (mép xa tới mép gần) nằm gọn trong dải khăn ở góc mặt Nguyệt
  const squash0 = (STRIP_TOP - STRIP_FRONT) / ((near - far) * PX);
  const farY1 = cy + (h / 2 - far) * PX;

  useFrame((_, dt) => {
    const g = unfold.current;
    if (!g) return;
    const target = sceneStore.get().stage === "table" ? 1 : 0;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    // nhịp cúi đầu: đi đều theo thời gian rồi nắn bằng đường sin vào-ra (khởi động êm, dừng êm),
    // thay vì damp (nhanh nhất ngay khung đầu, mặt bàn bật lên)
    const step = dt / UNFOLD_S;
    progress.current = reduce ? target : progress.current + THREE.MathUtils.clamp(target - progress.current, -step, step);
    const p = (1 - Math.cos(Math.PI * progress.current)) / 2;
    // mặt bàn hiện rõ ngay khi bắt đầu mở (đã nằm đúng chỗ dải khăn), không lồng mờ lên cảnh trong nhà
    fade.current = THREE.MathUtils.smoothstep(p, 0, 0.18);
    const sy = THREE.MathUtils.lerp(squash0, 1, p);
    g.position.y = THREE.MathUtils.lerp(STRIP_TOP, farY1, p);
    g.scale.y = sy;
    standing.current.forEach((o) => o && (o.scale.y = 1 / sy));
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
    <group ref={unfold}>
      <PixelSprite src={portrait ? `${T}/tabletop_doc.png` : `${T}/tabletop.png`} position={[0, ly(h / 2), 0]} renderOrder={10} />
      {!portrait && (
        <group position={[ball[0], ball[1], 0.05]} ref={(o) => void (o && (standing.current[0] = o))}>
          <PixelSprite src={`${I}/crystal.png`} position={[0, 14 * PX * S, 0]} scale={S} renderOrder={11} />
        </group>
      )}
      <group position={[candle[0], candle[1], 0]} ref={(o) => void (o && (standing.current[1] = o))}>
        <TableCandle x={0} y={20 * PX * S} size={S} fade={fade} />
      </group>
    </group>
  );
}
