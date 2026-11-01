"use client";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { PixelSprite, framePos, useRadialTexture } from "./pixel";
import { Fireflies } from "./Fireflies";
import { sceneStore } from "@/lib/store";

const A = "/assets/forest";
const OVERSCAN = 1.12;

type Mode = "lit" | "flat" | "glow";
/** Lớp nền rộng bằng khung, neo đáy ở y = 360 (đáy khung) trừ khi chỉ định khác. */
export function FrameLayer({ src, z, mode = "lit", glowStrength, bottom = 360 }: { src: string; z: number; mode?: Mode; glowStrength?: number; bottom?: number }) {
  return <PixelSprite src={src} position={[0, 0, z]} at={{ x: 320, bottom }} overscan={OVERSCAN} mode={mode} glowStrength={glowStrength} />;
}

function Mist() {
  const tex = useRadialTexture("rgba(170,180,230,0.55)", "rgba(170,180,230,0)");
  const refs = useRef<THREE.Mesh[]>([]);
  const items = [
    { y: -0.9, z: -1.0, w: 5, h: 0.9, speed: 0.05, phase: 0 },
    { y: -1.3, z: -0.2, w: 6, h: 0.8, speed: -0.04, phase: 2 },
    { y: -0.4, z: -2.4, w: 7, h: 1.2, speed: 0.03, phase: 4 },
  ];
  useFrame(({ clock }) => {
    refs.current.forEach((m, i) => {
      if (m) m.position.x = Math.sin(clock.elapsedTime * items[i].speed + items[i].phase) * 1.2;
    });
  });
  return (
    <>
      {items.map((it, i) => (
        <mesh key={i} ref={(m) => { if (m) refs.current[i] = m; }} position={[0, it.y, it.z]} scale={[it.w, it.h, 1]}>
          <planeGeometry />
          <meshBasicMaterial map={tex} transparent opacity={0.35} depthWrite={false} />
        </mesh>
      ))}
    </>
  );
}

function DoorLight() {
  const ref = useRef<THREE.PointLight>(null);
  const [x0, y0] = framePos(320, 240, -1.35);
  const x = x0 * OVERSCAN;
  const y = y0 * OVERSCAN;
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const door = sceneStore.get().stage === "door";
    const target = door ? 6 : 1.2 + Math.sin(clock.elapsedTime * 3) * 0.08;
    ref.current.intensity = THREE.MathUtils.lerp(ref.current.intensity, target, 0.05);
  });
  return <pointLight ref={ref} position={[x, y, -1.0]} color="#ffb85c" intensity={1.2} distance={3.5} decay={1.4} />;
}

export function ForestScene() {
  const houseZ = -1.4;
  return (
    <group>
      <color attach="background" args={["#0a0b1c"]} />
      <ambientLight color="#7d86c9" intensity={1.6} />
      <directionalLight color="#a9b8ff" intensity={0.9} position={[3, 3, 2]} />
      <DoorLight />

      <FrameLayer src={`${A}/sky.png`} z={-4} mode="flat" />
      <FrameLayer src={`${A}/sky_glow.png`} z={-3.99} mode="glow" glowStrength={1.8} />
      <FrameLayer src={`${A}/far.png`} z={-3} />
      <FrameLayer src={`${A}/mid.png`} z={-2} />
      <PixelSprite src={`${A}/house.png`} position={[0, 0, houseZ]} at={{ x: 320, bottom: 258 }} overscan={OVERSCAN} />
      <PixelSprite src={`${A}/house_glow.png`} position={[0, 0, houseZ + 0.01]} at={{ x: 320, bottom: 258 }} overscan={OVERSCAN} mode="glow" glowStrength={2.4} glowColor="#ffd48a" />
      <Mist />
      <FrameLayer src={`${A}/ground.png`} z={-0.6} />
      <Fireflies count={46} />
      <FrameLayer src={`${A}/near.png`} z={0.6} />
      <FrameLayer src={`${A}/near_glow.png`} z={0.61} mode="glow" glowStrength={2.2} />
    </group>
  );
}
