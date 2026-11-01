import "server-only";
/**
 * NGƯỜI ĐỌC BÀI TẠM THỜI (chưa có AI).
 * Ghép lời thoại của Nguyệt từ dữ liệu 78 lá theo các mẫu câu trong persona bible.
 * Khi gắn agent Claude, thay các hàm trong file này bằng lời gọi model; giao diện và API giữ nguyên.
 */
import { getCard } from "./cards";
import { randomInt, type Draw } from "./draw";
import type { CardData, EmotionTag, Orientation, ReaderLine, Topic } from "./types";
import { TOPIC_LABELS } from "./types";
import type { Spread } from "./spreads";
import { MAX_CLARIFIERS } from "./spreads";

const pick = <T,>(arr: readonly T[]): T => arr[randomInt(arr.length)];
const orient = (d: Draw): Orientation => (d.reversed ? "nguoc" : "xuoi");

const SOLEMN = new Set(["death", "the-devil", "the-tower", "ten-of-swords", "three-of-swords", "nine-of-swords"]);
const WARM = new Set(["the-sun", "the-star", "the-world", "the-empress", "the-lovers", "ten-of-cups", "nine-of-cups", "six-of-wands", "four-of-wands", "ace-of-cups", "two-of-cups"]);
const SURPRISE = new Set(["wheel-of-fortune", "the-fool", "the-magician"]);

function tagFor(card: CardData, reversed: boolean): EmotionTag {
  if (SOLEMN.has(card.slug)) return "solemn";
  if (reversed) return "concern";
  if (WARM.has(card.slug)) return "warm";
  if (SURPRISE.has(card.slug)) return "surprise";
  if (card.slug === "the-moon" || card.slug === "the-high-priestess") return "think";
  return "neutral";
}

function cardTitle(card: CardData, reversed: boolean) {
  return `${card.name_en}${reversed ? ", lá ngược" : ""}`;
}

export function greeting(opts: { name?: string | null; hour: number; returning: boolean }): ReaderLine[] {
  const who = opts.name ? `${opts.name}` : "cậu";
  const time =
    opts.hour < 5 ? "Khuya thế này mà cậu vẫn tìm được đường tới đây." :
    opts.hour < 11 ? "Sương sớm còn chưa tan, cậu đã gõ cửa rồi." :
    opts.hour < 17 ? "Giữa ban ngày mà rừng vẫn tối, cậu đi đường có lạc không?" :
    opts.hour < 21 ? "Trời vừa sập tối, đèn ta cũng vừa thắp." :
    "Đêm xuống rồi. Ngồi đi, bàn này chưa từng đuổi ai.";
  const lines: ReaderLine[] = [{ tag: "greet", text: opts.returning ? `Lại là ${who}. ${time}` : time }];
  lines.push({
    tag: "neutral",
    text: opts.returning
      ? "Hôm nay cậu mang theo câu hỏi gì?"
      : "Ta là Nguyệt, người giữ đèn ở đây. Còn con cú trên vai là Bấc, nó không cắn đâu. Cậu mang theo câu hỏi gì?",
  });
  return lines;
}

export function crisisLines(): ReaderLine[] {
  return [
    {
      tag: "gentle",
      text: "Ta cất bài đi đã. Những gì cậu vừa viết quan trọng hơn mọi lá bài trên bàn này.",
    },
    {
      tag: "gentle",
      text: "Cậu có đang an toàn không, ngay lúc này? Nếu có ai đó cậu tin, hãy gọi cho họ bây giờ. Nếu cậu đang gặp nguy hiểm, hãy gọi cấp cứu 115. Ta vẫn ở đây.",
    },
  ];
}

function sensitiveCaveat(kind: "health" | "legal" | "money"): ReaderLine {
  const text = {
    health:
      "Ta nói thật trước nhé: chuyện cơ thể thì lá bài không thay được bác sĩ. Ta chỉ cùng cậu xem nỗi lo này đang đè lên cậu thế nào thôi.",
    legal:
      "Giấy tờ và luật lệ thì cần người hiểu luật, cậu nên hỏi một luật sư. Còn điều cậu đang sợ mất trong chuyện này, ta xem được.",
    money:
      "Lá bài không biết giá ngày mai, và ta sẽ không bảo cậu mua hay bán gì. Điều ta xem được là cậu đang cầm tiền bằng tâm thế nào.",
  }[kind];
  return { tag: "concern", text };
}

export interface ComposeInput {
  question: string;
  topic: Topic;
  spread: Spread;
  draws: Draw[];
  sensitive: "health" | "legal" | "money" | null;
}

export function composeReading(input: ComposeInput): { lines: ReaderLine[]; offerClarifier: boolean } {
  const { topic, spread, draws } = input;
  const lines: ReaderLine[] = [];
  if (input.sensitive) lines.push(sensitiveCaveat(input.sensitive));

  lines.push({
    tag: "shuffle",
    text:
      spread.positions.length === 1
        ? `Một câu hỏi về ${TOPIC_LABELS[topic].toLowerCase()}, một lá. Để ta xem.`
        : `${TOPIC_LABELS[topic]}, trải ${spread.positions.length} lá: ${spread.positions.join(", ").toLowerCase()}. ${pick([
            "Đừng vội. Nến còn dài.",
            "Cậu thở chậm lại một chút.",
            "Bấc, ngồi yên nào.",
          ])}`,
  });

  // Lá được Nguyệt nói thêm ý riêng: ưu tiên Major Arcana, nếu không thì lá cuối.
  const majorIdx = draws.findIndex((d) => getCard(d.cardId).arcana === "major");
  const opinionIdx = majorIdx >= 0 ? majorIdx : draws.length - 1;

  draws.forEach((d, i) => {
    const card = getCard(d.cardId);
    const o = orient(d);
    const label = spread.positions[i];
    lines.push({
      tag: "reveal",
      revealPosition: i,
      text: `${label}: ${cardTitle(card, d.reversed)}. ${card.hinh_anh}`,
    });
    lines.push({ tag: tagFor(card, d.reversed), text: `${card.y_nghia[o]} ${card.chu_de[topic][o]}` });
    if (i === opinionIdx) lines.push({ tag: d.reversed ? "concern" : "tease", text: `Còn đây là ý riêng của ta. ${card.nguyet}` });
  });

  const reversedCount = draws.filter((d) => d.reversed).length;
  const single = draws.length === 1 ? getCard(draws[0].cardId) : null;
  const offerClarifier =
    reversedCount >= 2 ||
    (spread.id === "situation_obstacle_advice" && draws[1]?.reversed === true) ||
    (single !== null && single.yes_no === "maybe");

  if (offerClarifier) {
    lines.push({
      tag: "think",
      text: pick([
        "Bàn này còn lưỡng lự quá. Cậu có muốn rút thêm một lá để ta xem nó đang nghiêng về phía nào không?",
        "Các lá đang kéo hai ngả. Một lá nữa có thể cho ta biết cậu đang đứng gần bên nào hơn. Rút, hay để ta nói những gì đang thấy?",
      ]),
    });
  } else {
    lines.push({ tag: "neutral", text: "Cậu muốn rút thêm một lá làm rõ, hay để ta gom lại những gì đang thấy?" });
  }
  return { lines, offerClarifier };
}

export function composeClarifier(d: Draw, topic: Topic, index: number): ReaderLine[] {
  const card = getCard(d.cardId);
  const o = orient(d);
  const lines: ReaderLine[] = [
    { tag: "reveal", revealPosition: -1, text: `Lá làm rõ: ${cardTitle(card, d.reversed)}. ${card.hinh_anh}` },
    { tag: tagFor(card, d.reversed), text: `${card.chu_de[topic][o]} ${card.loi_khuyen[o]}` },
  ];
  if (index + 1 >= MAX_CLARIFIERS) {
    lines.push({ tag: "neutral", text: "Bàn đã đủ chật rồi. Rút thêm chỉ làm nó rối hơn. Để ta gom lại cho cậu nghe." });
  } else {
    lines.push({ tag: "neutral", text: "Cậu muốn rút thêm, hay để ta gom lại?" });
  }
  return lines;
}

export function composeClosing(input: { topic: Topic; draws: Draw[]; clarifiers: Draw[] }): { lines: ReaderLine[]; summary: string; advice: string } {
  const all = [...input.draws, ...input.clarifiers];
  const words = all.map((d) => getCard(d.cardId).tu_khoa[orient(d)][0]);
  const last = input.clarifiers.at(-1) ?? input.draws.at(-1)!;
  const lastCard = getCard(last.cardId);
  const advice = lastCard.loi_khuyen[orient(last)];
  const summary = `Các lá nói về: ${words.join(", ")}. Lời dặn: ${advice}`;
  const lines: ReaderLine[] = [
    { tag: "think", text: `Gom lại thì bàn này nói về ${words.slice(0, -1).join(", ")}${words.length > 1 ? " và " : ""}${words.at(-1)}.` },
    { tag: "warm", text: `Nếu cậu chỉ nhớ một điều, thì hãy nhớ: ${advice.charAt(0).toLowerCase()}${advice.slice(1)}` },
    {
      tag: "farewell",
      text: pick([
        "Đường về vẫn sáng. Ta để đèn chờ.",
        "Bấc sẽ ghi lại hôm nay vào cuốn sổ của ta. Khi nào cần thì quay lại.",
        "Lá bài không quyết định thay cậu đâu. Nó chỉ soi đèn thôi. Đi cẩn thận nhé.",
      ]),
    },
  ];
  return { lines, summary, advice };
}

export function composeDaily(d: Draw): ReaderLine[] {
  const card = getCard(d.cardId);
  const o = orient(d);
  return [
    { tag: "reveal", revealPosition: 0, text: `Lá của cậu hôm nay: ${cardTitle(card, d.reversed)}. ${card.hinh_anh}` },
    { tag: tagFor(card, d.reversed), text: `${card.y_nghia[o]} ${card.loi_khuyen[o]}` },
  ];
}
