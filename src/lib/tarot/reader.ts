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

/** Nguyệt gọi tên Việt (cách gọi phổ biến, xem cards.ts) kèm tên Anh để khách đối chiếu với lá trên bàn. */
function cardTitle(card: CardData, reversed: boolean) {
  return `${card.name_vi} (${card.name_en})${reversed ? ", lá ngược" : ""}`;
}

/**
 * Dữ liệu lá (tarot_vi.json) cố ý viết giọng trung tính, gọi khách là "người hỏi", để AI dùng sau này.
 * Khi Nguyệt nói thì gọi khách là "cậu", và đổi dấu chấm phẩy thành câu ngắn.
 */
function speak(text: string): string {
  return text
    .replaceAll("Người hỏi", "Cậu")
    .replaceAll("người hỏi", "cậu")
    // dữ liệu gọi lá Queen là "Nữ Hoàng <chất>"; cách gọi phổ biến là "Hoàng Hậu <chất>" (cards.ts)
    .replace(/Nữ Hoàng (Gậy|Cốc|Kiếm|Tiền)/g, "Hoàng Hậu $1")
    .replace(/;\s*(\S)/gu, (_, c: string) => `. ${c.toLocaleUpperCase("vi")}`);
}

/** Mỗi lượt thoại tối đa chừng này từ (một câu dài hơn thì vẫn đứng riêng một lượt). */
const MAX_WORDS_PER_TURN = 28;
const wordCount = (s: string) => s.split(/\s+/).filter(Boolean).length;

/**
 * Tách một đoạn thành nhiều lượt thoại, mỗi lượt gồm vài câu trọn vẹn.
 * `first` (ví dụ revealPosition) chỉ gắn vào lượt đầu, để lá được lật đúng lúc bắt đầu nói.
 */
function turns(text: string, tag: EmotionTag, first?: Partial<ReaderLine>): ReaderLine[] {
  const sentences = speak(text).split(/(?<=[.!?…])\s+(?=[\p{Lu}"“])/u);
  const chunks: string[] = [];
  let buf = "";
  for (const s of sentences) {
    const next = buf ? `${buf} ${s}` : s;
    if (buf && wordCount(next) > MAX_WORDS_PER_TURN) {
      chunks.push(buf);
      buf = s;
    } else buf = next;
  }
  if (buf) chunks.push(buf);
  return chunks.map((t, i) => ({ tag, text: t, ...(i === 0 ? first : undefined) }));
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
      // Số khẩn cấp nằm trên thẻ hỗ trợ cố định của giao diện, không nhắc lại ở đây.
      tag: "gentle",
      text: "Cậu có đang an toàn không, ngay lúc này? Nếu có ai đó cậu tin, hãy gọi cho họ bây giờ. Ta vẫn ở đây.",
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
    lines.push(...turns(`${label}: ${cardTitle(card, d.reversed)}. ${card.hinh_anh}`, "reveal", { revealPosition: i }));
    lines.push(...turns(`${card.y_nghia[o]} ${card.chu_de[topic][o]}`, tagFor(card, d.reversed)));
    if (i === opinionIdx) lines.push(...turns(`Còn đây là ý riêng của ta. ${card.nguyet}`, d.reversed ? "concern" : "tease"));
  });

  const reversedCount = draws.filter((d) => d.reversed).length;
  const single = draws.length === 1 ? getCard(draws[0].cardId) : null;
  const offerClarifier =
    reversedCount >= 2 ||
    (spread.id === "situation_obstacle_advice" && draws[1]?.reversed === true) ||
    (single !== null && single.yes_no === "maybe");

  // PERSONA: chỉ mời rút thêm khi có lý do, và nói ra lý do. Không có lý do thì không mời; khách vẫn có hai nút để chọn.
  if (offerClarifier) {
    lines.push({
      tag: "think",
      text: pick([
        "Bàn này còn lưỡng lự quá. Cậu có muốn rút thêm một lá để ta xem nó đang nghiêng về phía nào không?",
        "Các lá đang kéo hai ngả. Một lá nữa có thể cho ta biết cậu đang đứng gần bên nào hơn. Rút, hay để ta nói những gì đang thấy?",
      ]),
    });
  }
  return { lines, offerClarifier };
}

export function composeClarifier(d: Draw, topic: Topic, index: number): ReaderLine[] {
  const card = getCard(d.cardId);
  const o = orient(d);
  const lines: ReaderLine[] = [
    ...turns(`Lá làm rõ: ${cardTitle(card, d.reversed)}. ${card.hinh_anh}`, "reveal", { revealPosition: -1 }),
    ...turns(`${card.chu_de[topic][o]} ${card.loi_khuyen[o]}`, tagFor(card, d.reversed)),
  ];
  // Lá làm rõ không tự mời thêm lá nữa; hết lượt thì nói rõ vì sao dừng.
  if (index + 1 >= MAX_CLARIFIERS) {
    lines.push({ tag: "neutral", text: "Bàn đã đủ chật rồi. Rút thêm chỉ làm nó rối hơn. Để ta gom lại cho cậu nghe." });
  }
  return lines;
}

export function composeClosing(input: { topic: Topic; draws: Draw[]; clarifiers: Draw[] }): { lines: ReaderLine[]; summary: string; advice: string; themes: string[] } {
  const all = [...input.draws, ...input.clarifiers];
  const words = all.map((d) => getCard(d.cardId).tu_khoa[orient(d)][0]);
  const last = input.clarifiers.at(-1) ?? input.draws.at(-1)!;
  const lastCard = getCard(last.cardId);
  const advice = speak(lastCard.loi_khuyen[orient(last)]);
  const summary = `Các lá nói về: ${words.join(", ")}. Lời dặn: ${advice}`;
  const lines: ReaderLine[] = [
    { tag: "think", text: `Gom lại thì bàn này nói về ${words.slice(0, -1).join(", ")}${words.length > 1 ? " và " : ""}${words.at(-1)}.` },
    ...turns(`Nếu cậu chỉ nhớ một điều, thì hãy nhớ: ${advice.charAt(0).toLowerCase()}${advice.slice(1)}`, "warm"),
    {
      tag: "farewell",
      text: pick([
        "Đường về vẫn sáng. Ta để đèn chờ.",
        "Bấc sẽ ghi lại hôm nay vào cuốn sổ của ta. Khi nào cần thì quay lại.",
        "Lá bài không quyết định thay cậu đâu. Nó chỉ soi đèn thôi. Đi cẩn thận nhé.",
      ]),
    },
  ];
  return { lines, summary, advice, themes: words };
}

export function composeDaily(d: Draw): ReaderLine[] {
  const card = getCard(d.cardId);
  const o = orient(d);
  return [
    ...turns(`Lá của cậu hôm nay: ${cardTitle(card, d.reversed)}. ${card.hinh_anh}`, "reveal", { revealPosition: 0 }),
    ...turns(`${card.y_nghia[o]} ${card.loi_khuyen[o]}`, tagFor(card, d.reversed)),
  ];
}
