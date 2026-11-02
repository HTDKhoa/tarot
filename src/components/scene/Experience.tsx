"use client";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { storageGet } from "@/lib/storage";
import { Bloom, EffectComposer, HueSaturation, Vignette } from "@react-three/postprocessing";
import { Suspense, useEffect, useRef, useState } from "react";
import { CameraRig } from "./CameraRig";
import { ForestScene } from "./ForestScene";
import { InteriorScene } from "./InteriorScene";
import { TableScene, tableCenterY, tableFrame } from "./TableScene";
import { CAM_D } from "./pixel";
import { sceneStore, useScene, type Quality, type Stage } from "@/lib/store";

/**
 * Render ở độ phân giải thấp rồi phóng lên bằng CSS (image-rendering: pixelated):
 * vừa giữ nét pixel, vừa nhẹ cho điện thoại. Mức "high" có bloom; mức "low" chỉ giữ vignette.
 */
function targetDpr(quality: Quality) {
  if (typeof window === "undefined") return 1;
  const internalHeight = quality === "high" ? 720 : 420;
  return Math.min(window.devicePixelRatio || 1, Math.max(0.35, internalHeight / window.innerHeight));
}

function FpsProbe({ onLow }: { onLow: () => void }) {
  const frames = useRef(0);
  const time = useRef(0);
  const done = useRef(false);
  useFrame((_, dt) => {
    if (done.current) return;
    time.current += dt;
    frames.current += 1;
    // bỏ 1 giây đầu (tải texture), đo trong 2 giây sau
    if (time.current > 3) {
      done.current = true;
      if (frames.current / time.current < 38) onLow();
    }
  });
  return null;
}

function Effects({ quality }: { quality: Quality }) {
  if (quality === "low") {
    return (
      <EffectComposer multisampling={0}>
        <Vignette offset={0.25} darkness={0.75} />
      </EffectComposer>
    );
  }
  return (
    <EffectComposer multisampling={0}>
      <Bloom mipmapBlur intensity={1.15} luminanceThreshold={0.82} luminanceSmoothing={0.2} radius={0.7} />
      <HueSaturation saturation={0.08} />
      <Vignette offset={0.22} darkness={0.8} />
    </EffectComposer>
  );
}

/**
 * Trong nhà có hai góc máy trên cùng một trục dọc: mặt Nguyệt ở trên, mặt bàn ngay bên dưới.
 * Cả hai cảnh cùng được dựng nên khi đổi góc, camera lia liền một mạch thay vì cắt.
 */
function World({ stage }: { stage: Stage }) {
  const { size } = useThree();
  const portrait = size.width / size.height < 0.8;
  if (stage === "forest" || stage === "door") {
    return (
      <>
        <ForestScene />
        <CameraRig focus={[0, 0]} zoom={1} portraitZoom={1} />
        {/* tải sẵn ảnh trong nhà khi khách còn ở bìa rừng, để lúc bước vào cảnh không bật ra muộn.
            Nhóm ẩn: không vẽ, không chiếu sáng; màu nền của cảnh trong nhà gắn vào nhóm chứ không vào scene. */}
        <Suspense fallback={null}>
          <group visible={false}>
            <InteriorScene />
            <TableScene portrait={portrait} />
          </group>
        </Suspense>
      </>
    );
  }
  const onTable = stage === "table";
  return (
    <>
      <InteriorScene />
      <TableScene portrait={portrait} />
      {onTable ? (
        <CameraRig focus={[0, tableCenterY(portrait)]} frame={tableFrame(portrait)} zoom={1} shift />
      ) : (
        <CameraRig focus={[0, -0.17]} zoom={1.25} portraitZoom={0.8} arrive />
      )}
    </>
  );
}

export default function Experience() {
  const stage = useScene((s) => s.stage);
  const quality = useScene((s) => s.quality);
  const [dpr, setDpr] = useState(1);

  useEffect(() => {
    const saved = storageGet("nguyet_quality") as Quality | null;
    if (saved === "high" || saved === "low") sceneStore.set({ quality: saved });
  }, []);
  useEffect(() => {
    const update = () => setDpr(targetDpr(quality));
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [quality]);

  return (
    <Canvas
      className="pixel-canvas"
      dpr={dpr}
      gl={{ antialias: false, powerPreference: "high-performance" }}
      camera={{ fov: 30, position: [0, 0, CAM_D], near: 0.1, far: 50 }}
      flat
    >
      <Suspense fallback={null}>
        <World stage={stage} />
        <Effects quality={quality} />
      </Suspense>
      <FpsProbe
        onLow={() => {
          if (!storageGet("nguyet_quality")) sceneStore.set({ quality: "low" });
        }}
      />
    </Canvas>
  );
}
