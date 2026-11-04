import "server-only";
import { allCards } from "./cards";

/**
 * Kiểm lời AI viết cho Nguyệt trước khi khách đọc. Trả về lý do không dùng được, hoặc null nếu ổn.
 * `allowedIds`: các lá đã rút trong phiên; lời thoại chỉ được nhắc tên những lá này (bất biến 1).
 *
 * Tên Việt so đúng chữ hoa ("Mặt Trời" là tên lá, "ánh mặt trời" là câu thường); tên Anh không phân biệt hoa thường.
 */
export function voiceProblem(text: string, allowedIds: number[] = []): string | null {
  if (!text.trim()) return "trống";
  // lộ vai: Nguyệt không bao giờ xưng "tôi"
  if (/(?<![\p{L}])tôi(?![\p{L}])/iu.test(text)) return "xưng tôi";
  if (/\p{Extended_Pictographic}/u.test(text)) return "emoji";
  if (/^\s*[-•*]\s/mu.test(text)) return "gạch đầu dòng";
  if (/số cậu|vận hạn|cúng giải/iu.test(text)) return "giọng thầy bói";
  const lower = text.toLowerCase();
  for (const c of allCards()) {
    if (allowedIds.includes(c.id)) continue;
    if (lower.includes(c.name_en.toLowerCase()) || viNameRe(c.name_vi).test(text)) return `nhắc lá chưa rút: ${c.name_en}`;
  }
  return null;
}

const reCache = new Map<string, RegExp>();
/** Tên Việt đứng trọn: "Nữ Hoàng" (The Empress) không khớp vào "Nữ Hoàng Gậy" trong dữ liệu lá Queen. */
function viNameRe(name: string): RegExp {
  let re = reCache.get(name);
  if (!re) {
    const esc = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    re = new RegExp(`(?<!\\p{L})${esc}(?!\\p{L}|\\s+\\p{Lu})`, "u");
    reCache.set(name, re);
  }
  return re;
}
