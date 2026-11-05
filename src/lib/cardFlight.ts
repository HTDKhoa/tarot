/**
 * Lá bay về bàn: ngay trước khi dải bài nhường chỗ cho hình trải, ghi vị trí trên màn của từng lá khách đã chọn
 * (theo thứ tự chọn, tức đúng thứ tự vị trí trên bàn). Mặt bàn đọc lại để cho lá trượt từ dải về đúng ô của nó.
 */
export const cardFlight: { from: (DOMRect | null)[] } = { from: [] };

/** Ghi vị trí các lá đã chọn trong dải (picked: chỉ số lá trong dải, theo thứ tự chọn). */
export function captureFlight(picked: number[]) {
  const fan = document.querySelectorAll<HTMLElement>(".fan-card");
  cardFlight.from = picked.map((i) => fan[i]?.querySelector<HTMLElement>(".tarot-card")?.getBoundingClientRect() ?? null);
}
