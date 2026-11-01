"use client";
import { useSyncExternalStore } from "react";
import type { EmotionTag } from "./tarot/types";

/** "inside": góc máy nhìn mặt Nguyệt; "table": máy hạ xuống mặt bàn khi trải bài. */
export type Stage = "forest" | "door" | "inside" | "table";
export type Quality = "high" | "low";

export interface SceneState {
  stage: Stage;
  tag: EmotionTag;
  speaking: boolean;
  quality: Quality;
  /** 0..1, dùng cho hiệu ứng mờ dần khi chuyển cảnh */
  fade: number;
  /** cảnh bàn: lệch camera sang phải, tính theo phần bề ngang màn (sổ mở bên phải thì bàn lùi sang trái) */
  shiftX: number;
}

let state: SceneState = { stage: "forest", tag: "neutral", speaking: false, quality: "high", fade: 0, shiftX: 0 };
const listeners = new Set<() => void>();

export const sceneStore = {
  get: () => state,
  set(patch: Partial<SceneState>) {
    state = { ...state, ...patch };
    listeners.forEach((l) => l());
  },
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
};

const serverSnapshot = state;
export function useScene<T>(select: (s: SceneState) => T): T {
  return useSyncExternalStore(
    sceneStore.subscribe,
    () => select(sceneStore.get()),
    () => select(serverSnapshot),
  );
}
