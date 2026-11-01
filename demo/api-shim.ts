/**
 * Bản demo không có server: chặn fetch tới /api/* và chạy logic đọc bài ngay trong trình duyệt,
 * dùng lại đúng các hàm của web thật (chế độ demo, không đăng nhập, không lưu).
 */
import { drawCards, dailyDraw, type Draw } from "@/lib/tarot/draw";
import { SPREADS, MAX_CLARIFIERS, type SpreadId } from "@/lib/tarot/spreads";
import { composeClarifier, composeClosing, composeDaily, composeReading, crisisLines, greeting } from "@/lib/tarot/reader";
import { isCrisis, sensitiveKind } from "@/lib/safety";
import { toDrawnCards } from "@/lib/readings";
import { getCard, toPublic } from "@/lib/tarot/cards";
import { vnDateKey, vnHour } from "@/lib/config";
import type { Topic } from "@/lib/tarot/types";
import { storageGet, storageSet } from "@/lib/storage";

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

async function handle(path: string, body: Record<string, unknown> | null): Promise<Response> {
  switch (path) {
    case "/api/me":
      return json({ configured: false, user: null, status: null, greeting: greeting({ hour: vnHour(), returning: storageGet("nguyet_demo_returning") === "1" }) });

    case "/api/reading": {
      const question = String(body?.question ?? "").trim();
      const topic = body?.topic as Topic;
      const spread = SPREADS[body?.spread as SpreadId];
      if (question.length < 3) return json({ error: "Câu hỏi hơi ngắn quá" }, 400);
      if (!spread) return json({ error: "Kiểu trải không hợp lệ" }, 400);
      if (isCrisis(question)) return json({ crisis: true, lines: crisisLines() });
      storageSet("nguyet_demo_returning", "1");
      const draws = drawCards(spread.positions.length);
      const { lines, offerClarifier } = composeReading({ question, topic, spread, draws, sensitive: sensitiveKind(question) });
      return json({ readingId: null, demo: true, draws, cards: toDrawnCards(draws, spread.positions), lines, offerClarifier, clarifiersLeft: MAX_CLARIFIERS });
    }

    case "/api/reading/clarify": {
      const demo = body?.demo as { topic: Topic; spread: SpreadId; draws: Draw[]; clarifiers: Draw[] };
      const spread = SPREADS[demo.spread];
      if (demo.clarifiers.length >= MAX_CLARIFIERS) return json({ error: "Đã đủ 3 lá làm rõ." }, 409);
      const [d] = drawCards(1, [...demo.draws, ...demo.clarifiers].map((x) => x.cardId));
      const position = demo.draws.length + demo.clarifiers.length;
      const [card] = toDrawnCards([d], spread.positions, true, position);
      return json({ card, draw: d, lines: composeClarifier(d, demo.topic, demo.clarifiers.length), clarifiersLeft: MAX_CLARIFIERS - demo.clarifiers.length - 1 });
    }

    case "/api/reading/finish": {
      const demo = body?.demo as { topic: Topic; draws: Draw[]; clarifiers: Draw[] };
      return json(composeClosing(demo));
    }

    case "/api/daily": {
      let seed = storageGet("nguyet_demo_seed");
      if (!seed) {
        seed = crypto.randomUUID();
        storageSet("nguyet_demo_seed", seed);
      }
      const d = await dailyDraw(seed, vnDateKey());
      return json({
        card: { position: 0, positionLabel: "Lá của ngày", card: toPublic(getCard(d.cardId), d.reversed ? "nguoc" : "xuoi"), reversed: d.reversed, clarifier: false },
        lines: composeDaily(d),
      });
    }
  }
  return json({ error: "Không có ở bản demo" }, 404);
}

export function installApiShim() {
  const realFetch = window.fetch.bind(window);
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    if (url.startsWith("/api/")) {
      const path = url.split("?")[0];
      const body = init?.body ? JSON.parse(String(init.body)) : null;
      // giả lập độ trễ mạng nhỏ để nhịp "xào bài" tự nhiên
      await new Promise((r) => setTimeout(r, 350));
      return handle(path, body);
    }
    return realFetch(input, init);
  };
}
