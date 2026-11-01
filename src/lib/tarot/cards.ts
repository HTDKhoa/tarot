import "server-only";
import data from "@/data/tarot_vi.json";
import type { CardData, PublicCard, Orientation } from "./types";

const CARDS = (data as { cards: CardData[] }).cards;

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
