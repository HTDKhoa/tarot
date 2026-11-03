"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { CardFace } from "./TarotCard";
import type { PublicCard } from "@/lib/tarot/types";

/** Các nhóm của bộ bài theo thứ tự quen thuộc; tên chất theo cách gọi tiếng Việt trong tên lá ("Bảy Kiếm"). */
const GROUPS: Array<{ key: string; title: string; match: (c: PublicCard) => boolean }> = [
  { key: "major", title: "Ẩn Chính", match: (c) => c.arcana === "major" },
  { key: "wands", title: "Gậy", match: (c) => c.suit === "wands" },
  { key: "cups", title: "Cốc", match: (c) => c.suit === "cups" },
  { key: "swords", title: "Kiếm", match: (c) => c.suit === "swords" },
  { key: "pentacles", title: "Tiền", match: (c) => c.suit === "pentacles" },
];

/** Bỏ dấu và viết thường, để gõ "bay kiem" hay "seven of" đều tìm ra. */
const fold = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();

/** Lưới cả bộ 78 lá theo nhóm, với ô tìm theo tên Việt hoặc tên Anh. */
export function DeckIndex({ cards }: { cards: PublicCard[] }) {
  const [q, setQ] = useState("");
  const needle = fold(q.trim());
  const shown = useMemo(
    () => (needle ? cards.filter((c) => fold(`${c.name_vi} ${c.name_en}`).includes(needle)) : cards),
    [cards, needle],
  );
  return (
    <>
      <div className="deck-search">
        <label htmlFor="tim-la" className="deck-search-label">
          Tìm lá
        </label>
        <input id="tim-la" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ví dụ: Ẩn Sĩ, The Star, bảy kiếm" autoComplete="off" />
        <span className="deck-search-count" aria-live="polite">
          {needle ? `${shown.length} lá` : "78 lá"}
        </span>
      </div>
      {shown.length === 0 && <p className="deck-empty">Không có lá nào mang tên đó. Thử gõ tên khác, có dấu hay không dấu đều được.</p>}
      {GROUPS.map((g) => {
        const list = shown.filter(g.match);
        if (!list.length) return null;
        return (
          <section key={g.key} className="deck-group" aria-labelledby={`nhom-${g.key}`}>
            <h2 id={`nhom-${g.key}`}>
              {g.title}
              <span>{list.length} lá</span>
            </h2>
            <ul className="deck-grid">
              {list.map((c) => (
                <li key={c.id}>
                  <Link href={`/la-bai/${c.slug}`} className="deck-item">
                    <CardFace card={c} size="md" />
                    <span className="deck-name">{c.name_vi}</span>
                    <span className="deck-name-en">{c.name_en}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </>
  );
}
