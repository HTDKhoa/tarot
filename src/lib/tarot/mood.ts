/**
 * Tâm trạng ánh sáng của một lá trên bàn, theo Persona Bible: lá lớn và nặng thì "phòng tối đi một chút",
 * lá khó hay lá ngược thì ánh trăng xanh lạnh, tin tốt thì ánh vàng ấm; còn lại là ánh nến thường.
 * Dùng chung cho người đọc bài (chọn cảm xúc của Nguyệt) và mặt bàn (đổi ánh sáng khi Nguyệt nói tới lá).
 */
export type CardMood = "moon" | "warm" | "candle";

/** Lá nặng: Nguyệt nghiêm lại, bàn tối và lạnh đi. */
export const SOLEMN = new Set(["death", "the-devil", "the-tower", "ten-of-swords", "three-of-swords", "nine-of-swords"]);
/** Lá sáng: ánh nến ấm hơn. */
export const WARM = new Set([
  "the-sun", "the-star", "the-world", "the-empress", "the-lovers", "ten-of-cups", "nine-of-cups", "six-of-wands",
  "four-of-wands", "ace-of-cups", "two-of-cups",
]);

export function cardMood(slug: string, reversed: boolean): CardMood {
  if (SOLEMN.has(slug) || reversed) return "moon";
  if (WARM.has(slug)) return "warm";
  return "candle";
}
