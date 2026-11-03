"use client";
import { useEffect, useRef } from "react";
import { armRig } from "@/lib/armRig";
import { assetUrl } from "@/lib/assets";
import type { SpreadId } from "@/lib/tarot/spreads";
import type { DrawnCard } from "@/lib/tarot/types";
import { TarotCard } from "./TarotCard";

/** Cả bộ 78 lá úp trải thành một dải dài để khách tự chọn. Chọn ô nào cũng không đổi lá: lá đã rút ở máy chủ. */
const FAN_SIZE = 78;

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
const TIP_ROW = { point: 54, rest: 43 };

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
      const s = armRig.px / HAND_SPRITE; // px CSS cho một pixel của sprite tay
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

/**
 * Dải bài: 78 lá úp chồng nhau thành một dải dài trên khăn, như người đọc bài trải cả bộ ra bàn. Dải dài hơn
 * màn nên cuộn ngang (vuốt, kéo thanh cuộn, hoặc lăn chuột dọc cũng đi ngang); mở ra ở giữa bộ bài. Mỗi lá lộ ra
 * một khe đủ rộng để chạm trúng; lá hơi gợn lên xuống và nghiêng nhẹ cho khỏi thành một hàng thẳng đơ.
 */
function Ribbon({ picked, onPick }: { picked: number[]; onPick: (i: number) => void }) {
  const zone = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = zone.current;
    if (!el) return;
    // mở ra ở giữa bộ bài; hai đầu mờ dần để thấy còn bài ở hai bên
    el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2;
    // lăn chuột dọc thì đi ngang trong dải, không lia máy hay cuộn trang
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      e.preventDefault();
      el.scrollLeft += e.deltaY;
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    // chuột: giữ và kéo để đi dọc dải như vuốt bằng ngón tay; kéo quá vài pixel thì không tính là chọn lá
    let drag: { x: number; left: number; moved: boolean } | null = null;
    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      drag = { x: e.clientX, left: el.scrollLeft, moved: false };
    };
    const onMove = (e: PointerEvent) => {
      if (!drag) return;
      const dx = e.clientX - drag.x;
      if (!drag.moved && Math.abs(dx) > 5) {
        drag.moved = true;
        el.classList.add("is-dragging");
      }
      if (drag.moved) el.scrollLeft = drag.left - dx;
    };
    const onUp = () => {
      if (drag?.moved) {
        // nuốt cú nhấp ngay sau khi thả, để lá dưới con trỏ không bị chọn
        // (gỡ ngay ở nhịp sau: thả chuột ngoài dải thì không có cú nhấp nào, đừng để nó nuốt cú nhấp thật sau đó)
        const swallow = (ev: MouseEvent) => ev.stopPropagation();
        el.addEventListener("click", swallow, { capture: true });
        setTimeout(() => {
          el.removeEventListener("click", swallow, { capture: true });
          el.classList.remove("is-dragging");
        }, 0);
      }
      drag = null;
    };
    el.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, []);
  return (
    // data-focus-next: hộp thoại nói xong mà không có nút thì focus về lá đầu tiên của dải, không rơi về body
    // data-scrollable: vuốt / lăn trong dải không tính là đổi góc máy
    <div ref={zone} className="fan-zone" role="group" aria-label="Dải bài úp, 78 lá" data-focus-next data-scrollable>
      <div className="fan-ribbon">
        {Array.from({ length: FAN_SIZE }, (_, i) => {
          const order = picked.indexOf(i);
          const vars = {
            // gợn nhẹ: lên xuống vài pixel và nghiêng một chút, như bài trải tay
            "--wave": `${Math.round(Math.sin(i * 0.9) * 4 + Math.sin(i * 0.37) * 3)}px`,
            "--tilt": `${(Math.sin(i * 1.7) * 2.2).toFixed(1)}deg`,
          } as React.CSSProperties;
          return (
            <div key={i} className={`fan-card ${order >= 0 ? "is-picked" : ""}`} style={vars}>
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
        {/* bộ đếm và lời nhắc chung một tấm mực, ngay trên dải bài */}
        <div className="table-count">
          <span aria-live="polite">
            Đã chọn {picked.length}/{cards.length}
          </span>
          <span className="fan-hint">Cả bộ 78 lá · kéo ngang để xem hết</span>
        </div>
        <Ribbon picked={picked} onPick={onPick} />
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
