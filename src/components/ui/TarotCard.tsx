"use client";
import type { DrawnCard } from "@/lib/tarot/types";
import { assetUrl } from "@/lib/assets";

const ROMAN = ["0", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII", "XIV", "XV", "XVI", "XVII", "XVIII", "XIX", "XX", "XXI"];
const RANK: Record<number, string> = { 1: "Át", 11: "Tiểu Đồng", 12: "Hiệp Sĩ", 13: "Nữ Hoàng", 14: "Vua" };

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
  size?: "sm" | "md" | "lg";
  highlight?: boolean;
}

/** Lá bài DOM: mặt sau / mặt trước pixel, lật bằng CSS 3D. Lá ngược thì xoay 180° mặt trước. */
export function TarotCard({ drawn, revealed, onClick, selected, label, size = "md", highlight }: Props) {
  const c = drawn?.card;
  const icon = c ? assetUrl(c.arcana === "major" ? "/assets/cards/major_star.png" : `/assets/cards/suit_${c.suit}.png`) : null;
  return (
    <div className={`tarot-slot tarot-${size}`}>
      <button
        type="button"
        onClick={onClick}
        disabled={!onClick}
        aria-label={revealed && c ? `${c.name_en}${drawn?.reversed ? " ngược" : ""}` : "Lá bài úp"}
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
              <span className="tarot-band">{c.arcana === "major" ? c.name_vi : c.name_vi.split(" ").at(-1)}</span>
            </>
          )}
        </span>
      </button>
      {(label || (revealed && c)) && (
        <div className="tarot-caption">
          {label && <div className="tarot-pos">{label}</div>}
          {revealed && c && (
            <div className="tarot-name">
              {c.name_en}
              {drawn?.reversed && <span className="tarot-rev"> · ngược</span>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
