"use client";
import { useEffect, useRef, useState } from "react";
import type { ReaderLine } from "@/lib/tarot/types";
import { sceneStore } from "@/lib/store";
import { useMedia } from "@/lib/useMedia";

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

/**
 * Hộp thoại kiểu game: chữ chạy từng ký tự, chạm để hiện hết câu hoặc sang câu sau.
 * Muốn đọc bộ câu mới thì đổi `key` để component mount lại.
 *
 * Trình đọc màn hình không nghe chữ chạy: mỗi câu được báo trọn một lần qua một vùng ẩn,
 * còn nút ▼ "Câu tiếp" là đường đi bằng bàn phím. Người dùng chọn giảm chuyển động thì chữ hiện ngay.
 */
export function Dialogue({ lines, onLine, onDone, children, busy, portrait }: Props) {
  const [idx, setIdx] = useState(0);
  const [shown, setShown] = useState(0);
  const doneRef = useRef(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const reduce = useMedia("(prefers-reduced-motion: reduce)");
  const line = lines[idx];
  const full = line?.text ?? "";
  const typing = !reduce && shown < full.length;
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

  // Đổi bước làm nút cũ biến mất thì focus rơi về <body>: đưa nó tới nút hành động đầu tiên,
  // hoặc tới ▼ khi còn câu. Không giành focus khi khách đang ở chỗ khác (sổ, ô nhập…).
  useEffect(() => {
    const root = rootRef.current;
    const active = document.activeElement;
    if (!root || (active && active !== document.body && !root.contains(active))) return;
    const target = finished
      ? root.querySelector<HTMLElement>(".dialogue-actions button, .dialogue-actions a")
      : root.querySelector<HTMLElement>(".dialogue-next");
    target?.focus({ preventScroll: true });
  }, [finished, idx]);

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

  const visible = reduce ? full : full.slice(0, shown);
  return (
    <div ref={rootRef} className={`dialogue pixel-frame ${portrait ? "has-portrait" : ""}`}>
      <div className="dialogue-name" aria-hidden>
        Nguyệt
      </div>
      {portrait}
      {/* chữ chạy chỉ để nhìn; chạm vào đâu trong khung cũng là "tiếp" */}
      <div className="dialogue-text" onClick={advance} aria-hidden>
        {portrait && <span className="portrait-spacer" />}
        {busy && !line ? <span className="dialogue-wait">Nguyệt đang xào bài…</span> : visible}
      </div>
      {/* trình đọc màn hình nghe trọn câu một lần, kèm tên người nói */}
      <p className="sr-only" aria-live="polite" aria-atomic>
        {busy && !line ? "Nguyệt đang xào bài." : line ? `Nguyệt: ${full}` : ""}
      </p>
      {!finished && line && (
        <button type="button" className={`dialogue-next ${typing ? "is-typing" : ""}`} onClick={advance} aria-label={typing ? "Hiện hết câu" : "Câu tiếp"}>
          ▼
        </button>
      )}
      {finished && children && <div className="dialogue-actions">{children}</div>}
    </div>
  );
}
