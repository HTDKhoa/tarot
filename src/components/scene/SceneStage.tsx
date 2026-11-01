"use client";
import { Component, useState, type ReactNode } from "react";
import { assetUrl } from "@/lib/assets";
import { useScene } from "@/lib/store";
import Experience from "./Experience";

/** Thử tạo context WebGL rồi trả lại ngay, để không chiếm chỗ của canvas thật. */
function hasWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
    return Boolean(gl);
  } catch {
    return false;
  }
}

/**
 * Ảnh tĩnh của cảnh, chụp từ chính canvas ở khung chuẩn 640×360 (và 360×640 cho màn dọc).
 * Dùng khi trình duyệt không có WebGL hoặc cảnh 3D lỗi; giao diện đọc bài vẫn chạy bình thường.
 */
export function SceneFallback() {
  const stage = useScene((s) => s.stage);
  // mặt bàn vốn là một ảnh phẳng nhìn từ trên, dùng thẳng làm ảnh tĩnh
  const [doc, ngang] =
    stage === "table"
      ? ["/assets/table/tabletop_doc.png", "/assets/table/tabletop.png"]
      : (["doc", "ngang"] as const).map((o) => `/assets/fallback/${stage === "inside" ? "trong-nha" : "rung"}-${o}.png`);
  return (
    <picture className={`scene-fallback ${stage === "door" ? "is-door" : ""}`}>
      <source media="(orientation: portrait)" srcSet={assetUrl(doc)} />
      <img src={assetUrl(ngang)} alt="" />
    </picture>
  );
}

/** Bắt lỗi khi tạo / chạy canvas (R3F ném lỗi lên cây React), rồi chuyển sang ảnh tĩnh. */
class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: unknown) {
    console.error("[cảnh 3D] lỗi WebGL, chuyển sang ảnh tĩnh", error);
  }
  render() {
    return this.state.failed ? <SceneFallback /> : this.props.children;
  }
}

/** Chỉ chạy ở trình duyệt (nạp bằng dynamic ssr: false). */
export default function SceneStage() {
  const [webgl] = useState(hasWebGL);
  if (!webgl) return <SceneFallback />;
  return (
    <SceneBoundary>
      <Experience />
    </SceneBoundary>
  );
}
