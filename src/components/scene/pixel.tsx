"use client";
import { useTexture } from "@react-three/drei";
import { assetUrl } from "@/lib/assets";
import { useFrame } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";

/** 1 pixel của ảnh gốc = 0.01 đơn vị thế giới. Khung chuẩn 640×360 px = 6.4×3.6. */
export const PX = 0.01;
export const FRAME_W = 640;
export const FRAME_H = 360;
/** Khoảng cách camera chuẩn tới mặt phẳng z = 0. */
export const CAM_D = 7;

export function prepPixelTexture(t: THREE.Texture) {
  t.magFilter = THREE.NearestFilter;
  t.minFilter = THREE.NearestFilter;
  t.generateMipmaps = false;
  t.colorSpace = THREE.SRGBColorSpace;
  t.needsUpdate = true;
  return t;
}

/** Hệ số phóng để một lớp đặt ở độ sâu z vẫn trông đúng kích thước pixel khi nhìn từ camera chuẩn. */
export const depthScale = (z: number) => (CAM_D - z) / CAM_D;

/** Đổi tọa độ pixel trong khung 640×360 (gốc góc trên trái) sang thế giới, có tính độ sâu. */
export function framePos(px: number, py: number, z: number): [number, number, number] {
  const k = depthScale(z);
  return [(px - FRAME_W / 2) * PX * k, (FRAME_H / 2 - py) * PX * k, z];
}

type Mode = "lit" | "flat" | "glow";

interface SpriteProps {
  src: string | string[];
  /** chỉ số frame khi src là mảng */
  frame?: number;
  position: [number, number, number];
  /** nhân thêm vào kích thước pixel gốc */
  scale?: number;
  mode?: Mode;
  glowStrength?: number;
  glowColor?: THREE.ColorRepresentation;
  opacity?: number;
  renderOrder?: number;
  /** Neo theo khung 640×360: x là tâm ngang, bottom là cạnh dưới của sprite (pixel khung). Ghi đè x, y của position. */
  at?: { x: number; bottom: number };
  /** Phóng đều theo bề ngang khung (dùng cho các lớp nền rộng 640 px) */
  overscan?: number;
}

/** Một sprite pixel art phẳng. "lit" nhận ánh sáng (ánh nến), "flat" không, "glow" cộng sáng để bloom bắt. */
export function PixelSprite({
  src,
  frame = 0,
  position,
  scale = 1,
  mode = "lit",
  glowStrength = 2.2,
  glowColor = "#ffffff",
  opacity = 1,
  renderOrder,
  at,
  overscan = 1,
}: SpriteProps) {
  const list = (Array.isArray(src) ? src : [src]).map(assetUrl);
  const textures = useTexture(list) as THREE.Texture[];
  useLayoutEffect(() => textures.forEach(prepPixelTexture), [textures]);
  const tex = textures[Math.min(frame, textures.length - 1)];
  const img = tex.image as { width: number; height: number };
  const z = position[2];
  const k = depthScale(z) * scale * overscan;
  const pos: [number, number, number] = at
    ? (() => {
        const [wx, wy] = framePos(at.x, at.bottom - (img.height * scale) / 2, z);
        // phóng overscan quanh tâm khung để không lộ mép khi có thị sai
        return [wx * overscan, wy * overscan, z];
      })()
    : position;
  const color = useMemo(() => {
    const c = new THREE.Color(glowColor);
    return mode === "glow" ? c.multiplyScalar(glowStrength) : c;
  }, [glowColor, glowStrength, mode]);

  return (
    <mesh position={pos} scale={[img.width * PX * k, img.height * PX * k, 1]} renderOrder={renderOrder}>
      <planeGeometry args={[1, 1]} />
      {mode === "lit" ? (
        <meshLambertMaterial map={tex} transparent alphaTest={0.5} opacity={opacity} />
      ) : mode === "flat" ? (
        <meshBasicMaterial map={tex} transparent alphaTest={0.5} opacity={opacity} toneMapped={false} />
      ) : (
        <meshBasicMaterial
          map={tex}
          color={color}
          transparent
          opacity={opacity}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      )}
    </mesh>
  );
}

/** Quầng sáng mềm (texture tạo bằng canvas) cho ánh nến, sương, ánh trăng. */
export function useRadialTexture(inner = "rgba(255,255,255,1)", outer = "rgba(255,255,255,0)") {
  return useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const g = c.getContext("2d")!;
    const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0, inner);
    grad.addColorStop(1, outer);
    g.fillStyle = grad;
    g.fillRect(0, 0, 128, 128);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, [inner, outer]);
}

/** Đổi frame theo nhịp, trả về chỉ số frame hiện tại qua ref (không render lại mỗi frame). */
export function useFrameTicker(fps: number, count: number, onTick: (i: number) => void) {
  const acc = useRef(0);
  const i = useRef(0);
  useFrame((_, dt) => {
    acc.current += dt;
    const step = 1 / fps;
    if (acc.current >= step) {
      acc.current %= step;
      i.current = (i.current + 1) % count;
      onTick(i.current);
    }
  });
}
