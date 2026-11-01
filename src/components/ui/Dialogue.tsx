"use client";
import { useEffect, useRef, useState } from "react";
import type { ReaderLine } from "@/lib/tarot/types";
import { sceneStore } from "@/lib/store";

interface Props {
  lines: ReaderLine[];
  /** gọi khi bắt đầu một câu (để lật bài đúng lúc) */
  onLine?: (line: ReaderLine, index: number) => void;
  /** gọi khi đã đọc hết các câu */
  onDone?: () => void;
  children?: React.ReactNode;
  busy?: boolean;
  /** ô chân dung người nói, gài ở góc trên phải khung (dùng khi không thấy mặt Nguyệt trong cảnh) */
  portrait?: React.ReactNode;
}

const SPEED_MS = 22;

/** Hộp thoại kiểu game: chữ chạy từng ký tự, chạm để hiện hết câu hoặc sang câu sau.
 *  Muốn đọc bộ câu mới thì đổi `key` để component mount lại. */
export function Dialogue({ lines, onLine, onDone, children, busy, portrait }: Props) {
  const [idx, setIdx] = useState(0);
  const [shown, setShown] = useState(0);
  const doneRef = useRef(false);
  const line = lines[idx];
  const full = line?.text ?? "";
  const typing = shown < full.length;
  const finished = lines.length === 0 || (idx >= lines.length - 1 && !typing);

  useEffect(() => {
    if (!line) return;
    onLine?.(line, idx);
    sceneStore.set({ tag: line.tag });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [line, idx]);

  useEffect(() => {
    sceneStore.set({ speaking: typing });
    if (!typing) return;
    const t = setTimeout(() => setShown((s) => Math.min(full.length, s + (full[s] === " " ? 2 : 1))), SPEED_MS);
    return () => clearTimeout(t);
  }, [shown, typing, full]);

  useEffect(() => {
    if (finished && !doneRef.current && lines.length) {
      doneRef.current = true;
      onDone?.();
    }
  }, [finished, lines.length, onDone]);

  useEffect(() => () => sceneStore.set({ speaking: false }), []);

  const advance = () => {
    if (typing) setShown(full.length);
    else if (idx < lines.length - 1) {
      setIdx(idx + 1);
      setShown(0);
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === "Enter" || e.key === " ") && !(e.target instanceof HTMLTextAreaElement) && !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLButtonElement)) {
        e.preventDefault();
        advance();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <div className={`dialogue pixel-frame ${portrait ? "has-portrait" : ""}`} role="log" aria-live="polite">
      <div className="dialogue-name">Nguyệt</div>
      {portrait}
      <button type="button" className="dialogue-text" onClick={advance} aria-label="Tiếp">
        {/* chừa chỗ cho ô chân dung để chữ chảy vòng quanh */}
        {portrait && <span className="portrait-spacer" aria-hidden />}
        {busy && !line ? <span className="dialogue-wait">Nguyệt đang xào bài…</span> : full.slice(0, shown)}
        {!finished && !typing && line && <span className="dialogue-next">▼</span>}
      </button>
      {finished && children && <div className="dialogue-actions">{children}</div>}
    </div>
  );
}
