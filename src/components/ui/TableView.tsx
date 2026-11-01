"use client";
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

/**
 * Cánh tay Nguyệt vươn từ mép xa của bàn: ống tay áo lặp dọc tới mép trên vùng bàn, bàn tay ở cuối.
 * Bóng đổ lệch xuống trái (nến ở góc trên phải) để tay nằm trên khăn chứ không trôi.
 */
function Arm({ hand, className = "" }: { hand: "point" | "rest"; className?: string }) {
  const sleeve = { backgroundImage: `url("${assetUrl("/assets/table/sleeve_tile.png")}")` };
  const src = assetUrl(`/assets/table/hand_${hand}.png`);
  const limb = (
    <>
      <span className="arm-sleeve" style={sleeve} />
      <img src={src} alt="" />
    </>
  );
  return (
    <span className={`table-arm ${className}`} aria-hidden>
      <span className="arm-shadow">{limb}</span>
      <span className="arm-limb">{limb}</span>
    </span>
  );
}

/** Tay chỉ: đầu ngón trỏ dừng ngay trên mép trên của lá, không che tên hay hình. */
function PointingHand() {
  return <Arm hand="point" className="is-pointing" />;
}

function Slot({ c, i, revealed, active, hand }: { c: DrawnCard; i: number; revealed: boolean; active: boolean; hand: boolean }) {
  return (
    <div className={`table-slot ${active ? "is-active" : ""}`} data-pos={i}>
      {active && hand && <PointingHand />}
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
      <div className={field()} aria-label="Nguyệt đang xào bài">
        {/* hai nửa bộ bài, mỗi nửa dưới một bàn tay, tách ra rồi gập vào nhau */}
        <div className="table-shuffle" aria-hidden>
          {["half-a", "half-b"].map((h) => (
            <div key={h} className={`shuffle-half ${h}`}>
              <span className="shuffle-deck" style={{ backgroundImage: `url("${assetUrl("/assets/cards/card_back.png")}")` }} />
              <Arm hand="rest" className="is-shuffling" />
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
        <div className="fan-zone" aria-label="Dải bài úp">
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
              "--angle2": `${(j - mid2) * 4}deg`,
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
      <div className={`table-spread ${SHAPE[spread]}`}>
        {main.map(({ c, i }) => (
          <Slot key={`${c.card.id}-${i}`} c={c} i={i} revealed={revealed.has(i)} active={active === i} hand />
        ))}
      </div>
      {extra.length > 0 && (
        <div className="table-spread spread-clarifiers" aria-label="Lá làm rõ">
          {extra.map(({ c, i }) => (
            // hàng làm rõ nằm sát dưới chú thích hàng trên: tay đưa vào sẽ che chữ, nên chỉ thắp lá bằng ánh nến
            <Slot key={`${c.card.id}-${i}`} c={c} i={i} revealed={revealed.has(i)} active={active === i} hand={false} />
          ))}
        </div>
      )}
      {children}
    </div>
  );
}
