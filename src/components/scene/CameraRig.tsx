"use client";
import { useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { CAM_D, FRAME_H, FRAME_W, PX } from "./pixel";
import { sceneStore } from "@/lib/store";

const reducedMotion = () => typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/**
 * Camera nhìn thẳng (không xoay) để pixel không bị méo. Góc nhìn tự tính để phủ kín khung ngắm
 * (mặc định 640×360) ở mọi tỉ lệ màn hình (cắt hai bên khi màn hình dọc). Con trỏ chuột tạo hiệu ứng thị sai nhẹ.
 * Đổi focus/khung thì camera lia và zoom mượt theo trục dọc (hạ xuống bàn, ngẩng lên mặt Nguyệt);
 * người dùng chọn giảm chuyển động thì cắt thẳng.
 */
export function CameraRig({
  focus = [0, 0] as [number, number],
  zoom = 1,
  portraitZoom,
  frame = [FRAME_W, FRAME_H] as [number, number],
  shift = false,
}: {
  focus?: [number, number];
  zoom?: number;
  portraitZoom?: number;
  /** khung ngắm tính bằng pixel ảnh (1 px = PX đơn vị) */
  frame?: [number, number];
  /** đọc sceneStore.shiftX để lệch khung ngang (cảnh bàn có sổ mở bên phải) */
  shift?: boolean;
}) {
  const { camera, size, pointer } = useThree();
  const cam = camera as THREE.PerspectiveCamera;
  const dolly = useRef(0);
  const ready = useRef(false);
  const reduce = useRef(reducedMotion());

  useFrame((_, dt) => {
    const aspect = size.width / size.height;
    const frameW = frame[0] * PX;
    const frameH = frame[1] * PX;
    // chiều cao nhìn thấy tại z = 0, chừa 6% lề cho thị sai
    // màn hình dọc có thể lùi camera (zoom < 1) để thấy trọn nhân vật; phần thừa trên/dưới là nền tối
    const z = aspect < 0.8 && portraitZoom ? portraitZoom : zoom;
    const visH = (Math.min(frameH, frameW / aspect) * 0.94) / z;
    const fov = THREE.MathUtils.radToDeg(2 * Math.atan(visH / 2 / CAM_D));
    const snap = !ready.current || reduce.current;
    const nextFov = snap ? fov : THREE.MathUtils.damp(cam.fov, fov, 3.2, dt);
    if (Math.abs(cam.fov - nextFov) > 0.001) {
      cam.fov = nextFov;
      cam.updateProjectionMatrix();
    }
    const stage = sceneStore.get().stage;
    dolly.current = THREE.MathUtils.damp(dolly.current, stage === "door" ? 1 : 0, 1.6, dt);
    const d = dolly.current;
    // màn hình dọc: giới hạn biên độ ngang để không lộ mép khung
    const maxX = Math.max(0, (frameW - visH * aspect) / 2) * 0.9;
    const px = THREE.MathUtils.clamp(pointer.x * 0.12, -0.12, 0.12) * (1 - d);
    // lệch đặt sau phép kẹp: ảnh mặt bàn rộng thêm phần gỗ hai bên nên lệch không lộ mép
    const offset = shift ? sceneStore.get().shiftX * visH * aspect : 0;
    const tx = THREE.MathUtils.clamp(focus[0] + px, -maxX - 0.12, maxX + 0.12) + offset;
    const ty = focus[1] + pointer.y * 0.05 * (1 - d) - d * 0.75; // tiến về phía cửa nhà
    cam.position.x = snap ? tx : THREE.MathUtils.damp(cam.position.x, tx, 4, dt);
    cam.position.y = snap ? ty : THREE.MathUtils.damp(cam.position.y, ty, 3.2, dt);
    cam.position.z = CAM_D - d * 4.6;
    ready.current = true;
  });
  return null;
}
