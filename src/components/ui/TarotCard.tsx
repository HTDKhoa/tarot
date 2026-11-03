"use client";
import type { DrawnCard } from "@/lib/tarot/types";
import { assetUrl } from "@/lib/assets";

// Trên bàn tên lá chỉ dùng tiếng Anh (chủ dự án chốt); tên Việt chỉ có trong lời Nguyệt.
const SUIT: Record<string, string> = { wands: "Wands", cups: "Cups", swords: "Swords", pentacles: "Pentacles" };

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
  // tranh lá do art/cards_clean.py xuất, số La Mã đã vẽ sẵn trong tranh
  const art = c ? assetUrl(`/assets/cards/art/${String(c.id).padStart(2, "0")}.png`) : null;
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
              <span className="tarot-art">{art && <img src={art} alt="" />}</span>
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
              {/* ô hẹp (điện thoại): "ngược" xuống dòng riêng và bỏ dấu chấm giữa, để chú thích không tràn sang lá bên */}
              {revealed && drawn?.reversed && (
                <span className="tarot-rev">
                  <span className="tarot-rev-dot"> · </span>ngược
                </span>
              )}
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
