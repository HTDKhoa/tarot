import "server-only";
import { DECK_SIZE } from "./cards";

/** Tỉ lệ lá ngược. Có thể chỉnh qua biến môi trường REVERSED_RATE (0..1). */
const REVERSED_RATE = (() => {
  const v = Number(process.env.REVERSED_RATE);
  return Number.isFinite(v) && v >= 0 && v <= 1 ? v : 0.35;
})();

/** Số nguyên ngẫu nhiên đều trong [0, max) bằng crypto RNG, không lệch (rejection sampling). */
export function randomInt(max: number): number {
  if (max <= 0 || max > 2 ** 32) throw new Error("max không hợp lệ");
  const limit = Math.floor(2 ** 32 / max) * max;
  const buf = new Uint32Array(1);
  for (;;) {
    crypto.getRandomValues(buf);
    if (buf[0] < limit) return buf[0] % max;
  }
}

export interface Draw {
  cardId: number;
  reversed: boolean;
}

/** Rút `count` lá khác nhau, bỏ qua các lá trong `exclude`. */
export function drawCards(count: number, exclude: number[] = []): Draw[] {
  const pool: number[] = [];
  const excluded = new Set(exclude);
  for (let i = 0; i < DECK_SIZE; i++) if (!excluded.has(i)) pool.push(i);
  if (count > pool.length) throw new Error("Không đủ lá để rút");
  const out: Draw[] = [];
  for (let k = 0; k < count; k++) {
    const j = k + randomInt(pool.length - k);
    [pool[k], pool[j]] = [pool[j], pool[k]];
    out.push({ cardId: pool[k], reversed: randomInt(10_000) < REVERSED_RATE * 10_000 });
  }
  return out;
}

/** Lá bài của ngày: cố định theo (người dùng, ngày) để tải lại trang không đổi lá. */
export async function dailyDraw(seedKey: string, dateKey: string): Promise<Draw> {
  const bytes = new TextEncoder().encode(`${seedKey}|${dateKey}|nguyet-daily`);
  const hash = new Uint32Array(await crypto.subtle.digest("SHA-256", bytes));
  return { cardId: hash[0] % DECK_SIZE, reversed: hash[1] % 100 < REVERSED_RATE * 100 };
}
