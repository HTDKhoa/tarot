"use client";
import { useEffect, useRef } from "react";
import { armRig } from "@/lib/armRig";
import { assetUrl } from "@/lib/assets";
import type { SpreadId } from "@/lib/tarot/spreads";
import type { DrawnCard } from "@/lib/tarot/types";
import { TarotCard } from "./TarotCard";

const FAN_SIZE = 13;
/** số lá ở vòng cung phía sau khi dải bài tách hai hàng trên điện thoại */
const BACK_ROW = 7;

/** Hình trải trên khăn: một lá ở giữa, ba lá thành hàng, hay tam giác (Trở ngại ở đỉnh). */
const SHAPE: Record<SpreadId | "daily", string> = {
  one: "spread-one",
  daily: "spread-one",
  past_present_path: "spread-row",
  situation_obstacle_advice: "spread-triangle",
};

interface Props {
  spread: SpreadId | "daily";
  cards: DrawnCard[];
  revealed: Set<number>;
  /** lá đang được Nguyệt nói tới: tay chỉ vào, ánh nến thắp */
  active: number | null;
  /** đang chờ máy chủ rút lá: Nguyệt xào bài */
  shuffling: boolean;
  picking: boolean;
  picked: number[];
  onPick: (i: number) => void;
  /** desktop: cuốn sổ nằm mở sẵn bên phải khăn, hình trải lùi sang trái nhường chỗ */
  docked: boolean;
  /** cuốn sổ của Bấc */
  children?: React.ReactNode;
}

/** Ống tay áo lặp dọc rồi bàn tay ở cuối; bóng tiếp xúc là chính hình ấy tô đen, lệch theo hướng nến. */
function Arm({ hand, side, armRef }: { hand: "point" | "rest"; side: "left" | "right"; armRef: (el: HTMLSpanElement | null) => void }) {
  const sleeve = { backgroundImage: `url("${assetUrl("/assets/table/sleeve_tile.png")}")` };
  const src = assetUrl(`/assets/table/hand_${hand}.png`);
  const limb = (
    <>
      <span className="arm-sleeve" style={sleeve} />
      <img src={src} alt="" />
    </>
  );
  return (
    <span ref={armRef} className={`table-arm is-${side}`} aria-hidden>
      <span className="arm-shadow">{limb}</span>
      <span className="arm-limb">{limb}</span>
    </span>
  );
}

/** Hàng sprite tay (hand_*.png 34×66): bàn tay rộng 15 px ảnh, bằng bàn tay Nguyệt rộng 20 px khung ở góc mặt Nguyệt. */
const HAND_SPRITE = 15 / 20;
/** Hàng dưới cùng của đầu ngón trỏ (tay chỉ) và của lòng bàn tay (tay úp) trong ảnh cao 66. */
const TIP_ROW = { point: 62, rest: 43 };

/**
 * Hai cánh tay Nguyệt, vẽ một lớp trên cả bàn: mỗi tay vươn từ khuỷu tay thật của nàng (CameraRig chiếu từ cảnh 3D
 * vào armRig) tới chỗ cần chạm, cùng thang với cơ thể nàng. Lá bên trái dùng tay trái, còn lại tay phải; tay không
 * dùng thì thu về phía người nàng (ra ngoài khung). Đổi lá thì tay lướt sang, không bật nhảy.
 */
function Arms({ mode }: { mode: "point" | "shuffle" | null }) {
  const layer = useRef<HTMLDivElement>(null);
  const refs = useRef<Record<"left" | "right", HTMLSpanElement | null>>({ left: null, right: null });
  useEffect(() => {
    const cur = { left: { len: 0, ang: 0 }, right: { len: 0, ang: 0 } };
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    let last = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      raf = requestAnimationFrame(tick);
      const root = layer.current?.parentElement;
      if (!root) return;
      const s = (armRig.px * 1) / HAND_SPRITE; // px CSS cho một pixel của sprite tay
      const aw = 34 * s;
      const want: Record<"left" | "right", { x: number; y: number } | null> = { left: null, right: null };
      if (armRig.ready && mode === "shuffle") {
        const decks = [...root.querySelectorAll<HTMLElement>(".shuffle-deck")].map((e) => e.getBoundingClientRect());
        decks.forEach((r, i) => {
          // lòng bàn tay úp lên phần trên của nửa bộ bài
          want[i === 0 ? "left" : "right"] = { x: r.left + r.width / 2, y: r.top + r.height * 0.32 + (66 - TIP_ROW.rest) * s };
        });
      } else if (armRig.ready && mode === "point") {
        const card = root.querySelector<HTMLElement>(".table-spread:not(.spread-clarifiers) .table-slot.is-active .tarot-card");
        if (card) {
          const r = card.getBoundingClientRect();
          const mid = (armRig.left.x + armRig.right.x) / 2;
          const side = r.left + r.width / 2 < mid - r.width * 0.25 ? "left" : "right";
          // đầu ngón trỏ dừng ngay trên mép trên của lá
          want[side] = { x: r.left + r.width / 2, y: r.top - 2 + (66 - TIP_ROW.point) * s };
        }
      }
      (["left", "right"] as const).forEach((side) => {
        const el = refs.current[side];
        if (!el) return;
        const p = armRig[side];
        const w = want[side];
        const tLen = w ? Math.hypot(w.x - p.x, w.y - p.y) : 0;
        const tAng = w ? (-Math.atan2(w.x - p.x, w.y - p.y) * 180) / Math.PI : cur[side].ang;
        const k = reduce ? 1 : 1 - Math.exp(-9 * dt);
        cur[side].len += (tLen - cur[side].len) * k;
        cur[side].ang += (tAng - cur[side].ang) * k;
        const show = armRig.ready && cur[side].len > 24 * s;
        el.style.visibility = show ? "visible" : "hidden";
        if (!show) return;
        el.style.left = `${p.x - aw / 2}px`;
        el.style.top = `${p.y}px`;
        el.style.width = `${aw}px`;
        el.style.height = `${cur[side].len}px`;
        el.style.transform = `rotate(${cur[side].ang}deg)`;
        el.style.setProperty("--aw", `${aw}px`);
      });
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [mode]);
  const hand = mode === "shuffle" ? "rest" : "point";
  return (
    <div ref={layer} className="arm-layer" aria-hidden>
      <Arm hand={hand} side="left" armRef={(el) => void (refs.current.left = el)} />
      <Arm hand={hand} side="right" armRef={(el) => void (refs.current.right = el)} />
    </div>
  );
}

function Slot({ c, i, revealed, active }: { c: DrawnCard; i: number; revealed: boolean; active: boolean }) {
  return (
    <div className={`table-slot ${active ? "is-active" : ""}`} data-pos={i}>
      <TarotCard drawn={c} revealed={revealed} label={c.positionLabel} highlight={active} size="table" />
    </div>
  );
}

/** Lớp DOM của cảnh mặt bàn: lá, dải bài để chọn, tay Nguyệt. Khăn và nến nằm ở cảnh 3D phía sau. */
export function TableView({ spread, cards, revealed, active, shuffling, picking, picked, onPick, docked, children }: Props) {
  const field = (extra = "") => `table-field ${docked ? "has-notebook" : ""} ${extra}`;
  const main = cards.map((c, i) => ({ c, i })).filter(({ c }) => !c.clarifier);
  const extra = cards.map((c, i) => ({ c, i })).filter(({ c }) => c.clarifier);

  if (shuffling) {
    return (
      <div className={field()} role="img" aria-label="Nguyệt đang xào bài">
        <Arms mode="shuffle" />
        {/* hai nửa bộ bài, mỗi nửa dưới một bàn tay, tách ra rồi gập vào nhau */}
        <div className="table-shuffle" aria-hidden>
          {["half-a", "half-b"].map((h) => (
            <div key={h} className={`shuffle-half ${h}`}>
              <span className="shuffle-deck" style={{ backgroundImage: `url("${assetUrl("/assets/cards/card_back.png")}")` }} />
            </div>
          ))}
        </div>
        {/* sổ không bao giờ ẩn hẳn, kể cả lúc đang xào bài */}
        {children}
      </div>
    );
  }

  if (picking) {
    return (
      <div className={field()}>
        <p className="table-count" aria-live="polite">
          Đã chọn {picked.length}/{cards.length}
        </p>
        {/* data-focus-next: hộp thoại nói xong mà không có nút thì focus về lá đầu tiên của dải, không rơi về body */}
        <div className="fan-zone" role="group" aria-label="Dải bài úp" data-focus-next>
          {Array.from({ length: FAN_SIZE }, (_, i) => {
            const mid = (FAN_SIZE - 1) / 2;
            const order = picked.indexOf(i);
            // điện thoại: hai vòng cung (7 lá sau, 6 lá trước) để mỗi lá lộ ra đủ rộng cho ngón tay
            const back = i < BACK_ROW;
            const n = back ? BACK_ROW : FAN_SIZE - BACK_ROW;
            const j = back ? i : i - BACK_ROW;
            const mid2 = (n - 1) / 2;
            const vars = {
              "--angle": `${(i - mid) * 5}deg`,
              "--offset": `${(i - mid) * 7}%`,
              // vòng sau nghiêng ít hơn để lá ở mép không nhô ra ngoài màn; vòng trước giữ 4° để khe giữa các lá đủ rộng cho ngón tay
              "--angle2": `${(j - mid2) * (back ? 3 : 4)}deg`,
              "--k2": j - mid2,
            } as React.CSSProperties;
            return (
              <div key={i} className={`fan-card ${back ? "is-back" : "is-front"} ${order >= 0 ? "is-picked" : ""}`} style={vars}>
                <TarotCard
                  revealed={false}
                  size="sm"
                  onClick={order >= 0 ? undefined : () => onPick(i)}
                  selected={order >= 0}
                  name={`Lá thứ ${i + 1} trên ${FAN_SIZE}`}
                  pressed={order >= 0}
                />
              </div>
            );
          })}
        </div>
        {children}
      </div>
    );
  }

  return (
    <div className={field(extra.length ? "has-extra" : "")}>
      <Arms mode="point" />
      <div className={`table-spread ${SHAPE[spread]}`}>
        {main.map(({ c, i }) => (
          <Slot key={`${c.card.id}-${i}`} c={c} i={i} revealed={revealed.has(i)} active={active === i} />
        ))}
      </div>
      {extra.length > 0 && (
        <div className="table-spread spread-clarifiers" role="group" aria-label="Lá làm rõ">
          {extra.map(({ c, i }) => (
            // hàng làm rõ nằm sát dưới chú thích hàng trên: tay đưa vào sẽ che chữ, nên chỉ thắp lá bằng ánh nến
            <Slot key={`${c.card.id}-${i}`} c={c} i={i} revealed={revealed.has(i)} active={active === i} />
          ))}
        </div>
      )}
      {children}
    </div>
  );
}
