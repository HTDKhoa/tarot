import "server-only";
import data from "@/data/tarot_vi.json";
import type { CardData, PublicCard, Orientation } from "./types";

/**
 * Tên Việt theo cách gọi phổ biến của giới tarot Việt Nam (chủ dự án chốt). Dữ liệu gốc giữ nguyên,
 * chỉ chỉnh ở đây: The Empress là "Nữ Hoàng", lá Queen là "Hoàng Hậu <chất>" (dữ liệu đang đảo hai tên
 * này), The Chariot là "Cỗ Xe Chiến Thắng".
 */
export function viName(card: Pick<CardData, "slug" | "name_vi">): string {
  if (card.slug === "the-empress") return "Nữ Hoàng";
  if (card.slug === "the-chariot") return "Cỗ Xe Chiến Thắng";
  return card.name_vi.replace(/^Nữ Hoàng (?=\S)/, "Hoàng Hậu ");
}

const CARDS = (data as { cards: CardData[] }).cards.map((c) => ({ ...c, name_vi: viName(c) }));

export const DECK_SIZE = CARDS.length;

export function getCard(id: number): CardData {
  const card = CARDS[id];
  if (!card || card.id !== id) throw new Error(`Không có lá bài id=${id}`);
  return card;
}

export function toPublic(card: CardData, orientation: Orientation = "xuoi"): PublicCard {
  return {
    id: card.id,
    slug: card.slug,
    name_en: card.name_en,
    name_vi: card.name_vi,
    arcana: card.arcana,
    suit: card.suit,
    number: card.number,
    keywords: card.tu_khoa[orientation],
  };
}
