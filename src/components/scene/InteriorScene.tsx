"use client";
import { useFrame } from "@react-three/fiber";
import { assetUrl } from "@/lib/assets";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { PixelSprite, framePos, useRadialTexture } from "./pixel";
import { Fireflies } from "./Fireflies";
import { sceneStore, useScene } from "@/lib/store";
import type { EmotionTag } from "@/lib/tarot/types";
import { EYE_GLOW } from "@/lib/tarot/emotion";

const C = "/assets/characters";
const I = "/assets/interior";
const OVERSCAN = 1.08;

const KEEPER_W = 160;
const KEEPER_H = 176;
/** Vị trí theo manifest.json của bộ asset (góc trên trái → tâm ngang + cạnh dưới). */
const KEEPER_AT = { x: 240 + KEEPER_W / 2, bottom: 75 + KEEPER_H }; // đáy chạm mép xa của bàn
const TABLE_BOTTOM = 360;
const CANDLE_AT = { x: 478 + 10, bottom: 254 + 40 };
const FLAME_AT = { x: 478 + 5 + 5, bottom: 254 - 9 + 16 };
const CRYSTAL_AT = { x: 142 + 14, bottom: 266 + 28 };

interface Anchors {
  /** góc trên trái của sprite cú trong khung keeper */
  owl_offset?: [number, number];
}

function useAnchors() {
  const [a, setA] = useState<Anchors>({});
  useEffect(() => {
    fetch(assetUrl(`${C}/anchors.json`))
      .then((r) => (r.ok ? r.json() : {}))
      .then((j) => setA(normalizeAnchors(j)))
      .catch(() => {});
  }, []);
  return a;
}

function normalizeAnchors(j: Record<string, unknown>): Anchors {
  const v = j["owl_sprite_offset_in_keeper"];
  return Array.isArray(v) && v.length >= 2 ? { owl_offset: [Number(v[0]), Number(v[1])] } : {};
}

/** Frame idle 1–2 nâng phần trên người lên 1px (anchors.json: upper_dy). */
const IDLE_ORDER = [0, 1, 2, 3, 2, 1];
const idleUp = (i: number) => i === 1 || i === 2;

const GLOW = EYE_GLOW;

function Keeper({ onFrame }: { onFrame: (up: boolean) => void }) {
  const speaking = useScene((s) => s.speaking);
  const tag = useScene((s) => s.tag);
  const [frame, setFrame] = useState(0);
  const [blink, setBlink] = useState(false);
  const idle = useMemo(() => IDLE_ORDER.map((i) => `${C}/keeper_idle_${i}.png`), []);
  const speak = useMemo(() => [0, 1, 2, 1].map((i) => `${C}/keeper_speak_${i}.png`), []);
  const acc = useRef(0);
  const frameRef = useRef(0);
  const nextBlink = useRef(3);

  useFrame((_, dt) => {
    acc.current += dt;
    const fps = speaking ? 9 : 3;
    if (acc.current > 1 / fps) {
      acc.current = 0;
      const n = (frameRef.current + 1) % (speaking ? speak.length : idle.length);
      frameRef.current = n;
      setFrame(n);
      onFrame(!speaking && idleUp(IDLE_ORDER[n % IDLE_ORDER.length]));
    }
    nextBlink.current -= dt;
    if (nextBlink.current <= 0) {
      setBlink(true);
      setTimeout(() => setBlink(false), 140);
      nextBlink.current = 2.5 + Math.random() * 4;
    }
  });

  const g = GLOW[tag];
  const blinking = blink && !speaking;
  const src = blinking ? `${C}/keeper_blink.png` : speaking ? speak[frame % speak.length] : idle[frame % idle.length];
  const up = !speaking && !blinking && idleUp(IDLE_ORDER[frame % IDLE_ORDER.length]);
  const all = useMemo(() => [...idle, ...speak, `${C}/keeper_blink.png`], [idle, speak]);
  const glows = useMemo(() => [`${C}/keeper_glow.png`, `${C}/keeper_glow_up.png`, `${C}/keeper_glow_blink.png`], []);
  return (
    <>
      {/* nạp sẵn mọi frame để đổi frame không bị nháy */}
      <PixelSprite src={all} frame={all.indexOf(src)} position={[0, 0, 0]} at={KEEPER_AT} overscan={OVERSCAN} />
      <PixelSprite src={glows} frame={blinking ? 2 : up ? 1 : 0} position={[0, 0, 0.01]} at={KEEPER_AT} overscan={OVERSCAN} mode="glow" glowColor={g.color} glowStrength={g.strength} />
    </>
  );
}

function Owl({ anchors, up }: { anchors: Anchors; up: boolean }) {
  const tag = useScene((s) => s.tag);
  const frames = useMemo(() => [0, 1, 2, 3].map((i) => `${C}/owl_idle_${i}.png`), []);
  const [f, setF] = useState(0);
  const t = useRef(0);
  useFrame((_, dt) => {
    t.current += dt;
    if (t.current > 0.45) {
      t.current = 0;
      // thở 0-1, thỉnh thoảng chớp (2); nghiêng đầu (3) khi có điều bất ngờ
      setF((prev) => {
        if (tag === "surprise" || tag === "reveal") return 3;
        if (Math.random() < 0.08) return 2;
        return prev === 0 ? 1 : 0;
      });
    }
  });
  // cú đậu trên vai trái của Nguyệt; offset là góc trên trái sprite cú trong khung keeper
  const [ox, oy] = anchors.owl_offset ?? [16, 65];
  const at = { x: KEEPER_AT.x - KEEPER_W / 2 + ox + 20, bottom: KEEPER_AT.bottom - KEEPER_H + oy + 44 - (up ? 1 : 0) };
  const glows = useMemo(() => [`${C}/owl_glow.png`, `${C}/owl_glow_tilt.png`], []);
  return (
    <>
      <PixelSprite src={frames} frame={f} position={[0, 0, 0.05]} at={at} overscan={OVERSCAN} />
      {f !== 2 && <PixelSprite src={glows} frame={f === 3 ? 1 : 0} position={[0, 0, 0.06]} at={at} overscan={OVERSCAN} mode="glow" glowStrength={2.6} glowColor="#ffc46b" />}
    </>
  );
}

function Candle() {
  const light = useRef<THREE.PointLight>(null);
  const halo = useRef<THREE.Mesh>(null);
  const tex = useRadialTexture("rgba(255,190,110,0.9)", "rgba(255,150,60,0)");
  const [flame, setFlame] = useState(0);
  const flash = useRef(0);
  const lastTag = useRef<EmotionTag>("neutral");
  const flames = useMemo(() => [0, 1, 2, 3].map((i) => `${I}/flame_${i}.png`), []);
  const tf = useRef(0);
  const flameAt = FLAME_AT;
  const [fx0, fy0] = framePos(flameAt.x, flameAt.bottom - 8, 0.6);
  const lx = fx0 * OVERSCAN;
  const ly = fy0 * OVERSCAN;

  useFrame(({ clock }, dt) => {
    const tag = sceneStore.get().tag;
    if (tag !== lastTag.current) {
      if (tag === "reveal" || tag === "surprise") flash.current = 1;
      lastTag.current = tag;
    }
    flash.current = Math.max(0, flash.current - dt * 1.5);
    const t = clock.elapsedTime;
    const flicker = 0.88 + Math.sin(t * 13) * 0.04 + Math.sin(t * 7.3) * 0.05 + Math.random() * 0.03;
    const base = tag === "solemn" ? 0.55 : tag === "warm" ? 1.15 : 1;
    if (light.current) light.current.intensity = 9 * base * flicker * (1 + flash.current * 0.8);
    if (halo.current) (halo.current.material as THREE.MeshBasicMaterial).opacity = 0.42 * base * flicker * (1 + flash.current);
    tf.current += dt;
    if (tf.current > 0.12) {
      tf.current = 0;
      setFlame((f) => (f + 1) % 4);
    }
  });

  return (
    <>
      <pointLight ref={light} position={[lx, ly, 1.1]} color="#ffb061" intensity={9} distance={7} decay={1.2} />
      <mesh ref={halo} position={[lx, ly, 0.62]} scale={[2.6, 2.6, 1]}>
        <planeGeometry />
        <meshBasicMaterial map={tex} transparent opacity={0.4} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </mesh>
      <PixelSprite src={`${I}/candle.png`} position={[0, 0, 0.6]} at={CANDLE_AT} overscan={OVERSCAN} />
      <PixelSprite src={flames} frame={flame} position={[0, 0, 0.61]} at={flameAt} overscan={OVERSCAN} mode="glow" glowStrength={2.8} glowColor="#ffd08a" />
    </>
  );
}

export function InteriorScene() {
  const anchors = useAnchors();
  const [up, setUp] = useState(false);
  return (
    <group>
      <color attach="background" args={["#08060d"]} />
      <ambientLight color="#5a5f9e" intensity={1.1} />
      <directionalLight color="#8ea2ff" intensity={0.6} position={[-4, 2, 3]} />

      <PixelSprite src={`${I}/room.png`} position={[0, 0, -0.8]} at={{ x: 320, bottom: 360 }} overscan={OVERSCAN} />
      <PixelSprite src={`${I}/room_glow.png`} position={[0, 0, -0.79]} at={{ x: 320, bottom: 360 }} overscan={OVERSCAN} mode="glow" glowStrength={1.6} glowColor="#dfe6ff" />
      <Keeper onFrame={setUp} />
      <Owl anchors={anchors} up={up} />
      <PixelSprite src={`${I}/table.png`} position={[0, 0, 0.5]} at={{ x: 320, bottom: TABLE_BOTTOM }} overscan={OVERSCAN} />
      <PixelSprite src={`${I}/crystal.png`} position={[0, 0, 0.55]} at={CRYSTAL_AT} overscan={OVERSCAN} />
      <PixelSprite src={`${I}/crystal_glow.png`} position={[0, 0, 0.56]} at={CRYSTAL_AT} overscan={OVERSCAN} mode="glow" glowStrength={2} glowColor="#c9b6ff" />
      <Candle />
      <Fireflies count={14} area={[5, 2.6, 1]} center={[0, 0.3, -0.3]} color="#ffd9a0" size={3} />
    </group>
  );
}
