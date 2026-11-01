"use client";
import type { DrawnCard } from "@/lib/tarot/types";
import { assetUrl } from "@/lib/assets";

const ROMAN = ["0", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII", "XIV", "XV", "XVI", "XVII", "XVIII", "XIX", "XX", "XXI"];
// Trên bàn tên lá chỉ dùng tiếng Anh (chủ dự án chốt); tên Việt chỉ có trong lời Nguyệt.
const RANK: Record<number, string> = { 1: "Ace", 11: "Page", 12: "Knight", 13: "Queen", 14: "King" };
const SUIT: Record<string, string> = { wands: "Wands", cups: "Cups", swords: "Swords", pentacles: "Pentacles" };

export function cardNumeral(c: DrawnCard["card"]) {
  if (c.arcana === "major") return ROMAN[c.number] ?? String(c.number);
  return RANK[c.number] ?? String(c.number);
}

interface Props {
  drawn?: DrawnCard;
  revealed: boolean;
  onClick?: () => void;
  selected?: boolean;
  label?: string;
  size?: "sm" | "md" | "lg" | "table";
  highlight?: boolean;
  /** tên đọc cho lá úp (mặc định "Lá bài úp"), ví dụ vị trí trong dải bài */
  name?: string;
  /** lá trong dải bài đã được chọn */
  pressed?: boolean;
}

/** Lá bài DOM: mặt sau / mặt trước pixel, lật bằng CSS 3D. Lá ngược thì xoay 180° mặt trước. */
export function TarotCard({ drawn, revealed, onClick, selected, label, size = "md", highlight, name, pressed }: Props) {
  const c = drawn?.card;
  const icon = c ? assetUrl(c.arcana === "major" ? "/assets/cards/major_star.png" : `/assets/cards/suit_${c.suit}.png`) : null;
  return (
    <div className={`tarot-slot tarot-${size}`}>
      <button
        type="button"
        onClick={onClick}
        disabled={!onClick}
        aria-label={revealed && c ? `${c.name_en}${drawn?.reversed ? " ngược" : ""}` : (name ?? "Lá bài úp")}
        aria-pressed={pressed}
        className={`tarot-card ${revealed ? "is-revealed" : ""} ${selected ? "is-selected" : ""} ${highlight ? "is-highlight" : ""}`}
      >
        <span className="tarot-face tarot-back" style={{ backgroundImage: `url("${assetUrl("/assets/cards/card_back.png")}")` }} />
        <span className={`tarot-face tarot-front ${drawn?.reversed ? "is-reversed" : ""}`} style={{ backgroundImage: `url("${assetUrl("/assets/cards/card_frame.png")}")` }}>
          {c && (
            <>
              <span className="tarot-art">
                {icon && <img src={icon} alt="" className="tarot-icon" />}
                <span className="tarot-numeral">{cardNumeral(c)}</span>
              </span>
              <span className="tarot-band">{c.arcana === "major" ? c.name_en.replace(/^The /, "") : SUIT[c.suit ?? ""]}</span>
            </>
          )}
        </span>
      </button>
      {size === "table" ? (
        // Trên bàn: vùng chú thích cố định (vị trí + chiều, rồi tên tối đa 2 dòng) để mọi lá thẳng hàng
        <div className="tarot-caption">
          {label && (
            <div className="tarot-pos">
              {label}
              {revealed && drawn?.reversed && <span className="tarot-rev"> · ngược</span>}
            </div>
          )}
          {revealed && c && <div className="tarot-name">{c.name_en}</div>}
        </div>
      ) : (
        (label || (revealed && c)) && (
          <div className="tarot-caption">
            {label && <div className="tarot-pos">{label}</div>}
            {revealed && c && (
              <div className="tarot-name">
                {c.name_en}
                {drawn?.reversed && <span className="tarot-rev"> · ngược</span>}
              </div>
            )}
          </div>
        )
      )}
    </div>
  );
}
