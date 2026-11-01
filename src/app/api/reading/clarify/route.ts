import { NextResponse } from "next/server";
import { z } from "zod";
import { getUser } from "@/lib/supabase/server";
import { drawCards, type Draw } from "@/lib/tarot/draw";
import { SPREADS, MAX_CLARIFIERS, type SpreadId } from "@/lib/tarot/spreads";
import { composeClarifier } from "@/lib/tarot/reader";
import type { Topic } from "@/lib/tarot/types";
import { saveLines, toDrawnCards } from "@/lib/readings";

const DrawSchema = z.object({ cardId: z.number().int().min(0).max(77), reversed: z.boolean() });
const Body = z.object({
  readingId: z.string().uuid().nullable().optional(),
  // chỉ dùng ở chế độ demo
  demo: z
    .object({
      topic: z.enum(["tinh_cam", "cong_viec", "tai_chinh", "ban_than"]),
      spread: z.string(),
      draws: z.array(DrawSchema).max(10),
      clarifiers: z.array(DrawSchema).max(MAX_CLARIFIERS),
    })
    .optional(),
});

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Dữ liệu không hợp lệ" }, { status: 400 });
  const { supabase, user } = await getUser();

  let topic: Topic;
  let spreadId: SpreadId;
  let draws: Draw[];
  let clarifiers: Draw[];

  if (supabase) {
    if (!user || !parsed.data.readingId) return NextResponse.json({ error: "Cần đăng nhập" }, { status: 401 });
    const { data: reading } = await supabase
      .from("readings")
      .select("id, topic, spread, status, reading_cards(position, card_id, reversed, clarifier)")
      .eq("id", parsed.data.readingId)
      .single();
    if (!reading || reading.status !== "open") return NextResponse.json({ error: "Phiên này đã khép lại." }, { status: 409 });
    topic = reading.topic as Topic;
    spreadId = reading.spread as SpreadId;
    const rc = [...reading.reading_cards].sort((a, b) => a.position - b.position);
    draws = rc.filter((c) => !c.clarifier).map((c) => ({ cardId: c.card_id, reversed: c.reversed }));
    clarifiers = rc.filter((c) => c.clarifier).map((c) => ({ cardId: c.card_id, reversed: c.reversed }));
  } else {
    if (!parsed.data.demo) return NextResponse.json({ error: "Thiếu dữ liệu demo" }, { status: 400 });
    ({ topic, draws, clarifiers } = parsed.data.demo);
    spreadId = parsed.data.demo.spread as SpreadId;
  }

  const spread = SPREADS[spreadId];
  if (!spread) return NextResponse.json({ error: "Kiểu trải không hợp lệ" }, { status: 400 });
  if (clarifiers.length >= MAX_CLARIFIERS) return NextResponse.json({ error: "Đã đủ 3 lá làm rõ." }, { status: 409 });

  const [d] = drawCards(1, [...draws, ...clarifiers].map((x) => x.cardId));
  const lines = composeClarifier(d, topic, clarifiers.length);
  const position = draws.length + clarifiers.length;
  const [card] = toDrawnCards([d], spread.positions, true, position);

  if (supabase && parsed.data.readingId) {
    await supabase
      .from("reading_cards")
      .insert({ reading_id: parsed.data.readingId, position, card_id: d.cardId, reversed: d.reversed, clarifier: true });
    await saveLines(supabase, parsed.data.readingId, lines);
  }

  return NextResponse.json({ card, draw: supabase ? undefined : d, lines, clarifiersLeft: MAX_CLARIFIERS - clarifiers.length - 1 });
}
