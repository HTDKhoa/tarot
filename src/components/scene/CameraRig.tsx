"use client";
import { useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { CAM_D, FRAME_H, FRAME_W, PX } from "./pixel";
import { sceneStore } from "@/lib/store";

/**
 * Camera nhìn thẳng (không xoay) để pixel không bị méo. Góc nhìn tự tính để phủ kín khung 640×360
 * ở mọi tỉ lệ màn hình (cắt hai bên khi màn hình dọc). Con trỏ chuột tạo hiệu ứng thị sai nhẹ.
 */
export function CameraRig({ focus = [0, 0] as [number, number], zoom = 1, portraitZoom }: { focus?: [number, number]; zoom?: number; portraitZoom?: number }) {
  const { camera, size, pointer } = useThree();
  const cam = camera as THREE.PerspectiveCamera;
  const dolly = useRef(0);

  useFrame((_, dt) => {
    const aspect = size.width / size.height;
    const frameW = FRAME_W * PX;
    const frameH = FRAME_H * PX;
    // chiều cao nhìn thấy tại z = 0, chừa 6% lề cho thị sai
    // màn hình dọc có thể lùi camera (zoom < 1) để thấy trọn nhân vật; phần thừa trên/dưới là nền tối
    const z = aspect < 0.8 && portraitZoom ? portraitZoom : zoom;
    const visH = (Math.min(frameH, frameW / aspect) * 0.94) / z;
    const fov = THREE.MathUtils.radToDeg(2 * Math.atan(visH / 2 / CAM_D));
    if (Math.abs(cam.fov - fov) > 0.01) {
      cam.fov = fov;
      cam.updateProjectionMatrix();
    }
    const stage = sceneStore.get().stage;
    dolly.current = THREE.MathUtils.damp(dolly.current, stage === "door" ? 1 : 0, 1.6, dt);
    const d = dolly.current;
    // màn hình dọc: giới hạn biên độ ngang để không lộ mép khung
    const maxX = Math.max(0, (frameW - visH * aspect) / 2) * 0.9;
    const px = THREE.MathUtils.clamp(pointer.x * 0.12, -0.12, 0.12) * (1 - d);
    const tx = THREE.MathUtils.clamp(focus[0] + px, -maxX - 0.12, maxX + 0.12);
    const ty = focus[1] + pointer.y * 0.05 * (1 - d) - d * 0.75; // tiến về phía cửa nhà
    cam.position.x = THREE.MathUtils.damp(cam.position.x, tx, 4, dt);
    cam.position.y = THREE.MathUtils.damp(cam.position.y, ty, 4, dt);
    cam.position.z = CAM_D - d * 4.6;
  });
  return null;
}
