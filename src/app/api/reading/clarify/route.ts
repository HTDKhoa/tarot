import { NextResponse } from "next/server";
import { z } from "zod";
import { getUser } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { drawCards, type Draw } from "@/lib/tarot/draw";
import { SPREADS, MAX_CLARIFIERS, type SpreadId } from "@/lib/tarot/spreads";
import { composeClarifier } from "@/lib/tarot/reader";
import { writeClarifierWithAI } from "@/lib/tarot/readAI";
import { sensitiveKind } from "@/lib/safety";
import type { Topic } from "@/lib/tarot/types";
import { saveLines, toDrawnCards } from "@/lib/readings";

const DrawSchema = z.object({ cardId: z.number().int().min(0).max(77), reversed: z.boolean() });
const Body = z.object({
  readingId: z.string().uuid().nullable().optional(),
  // chỉ dùng ở chế độ demo
  demo: z
    .object({
      question: z.string().max(500).optional(),
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

  let question: string;
  let topic: Topic;
  let spreadId: SpreadId;
  let draws: Draw[];
  let clarifiers: Draw[];

  if (supabase) {
    if (!user || !parsed.data.readingId) return NextResponse.json({ error: "Cần đăng nhập" }, { status: 401 });
    const { data: reading } = await supabase
      .from("readings")
      .select("id, question, topic, spread, status, reading_cards(position, card_id, reversed, clarifier)")
      .eq("id", parsed.data.readingId)
      .single();
    if (!reading || reading.status !== "open") return NextResponse.json({ error: "Phiên này đã khép lại." }, { status: 409 });
    question = reading.question;
    topic = reading.topic as Topic;
    spreadId = reading.spread as SpreadId;
    const rc = [...reading.reading_cards].sort((a, b) => a.position - b.position);
    draws = rc.filter((c) => !c.clarifier).map((c) => ({ cardId: c.card_id, reversed: c.reversed }));
    clarifiers = rc.filter((c) => c.clarifier).map((c) => ({ cardId: c.card_id, reversed: c.reversed }));
  } else {
    if (!parsed.data.demo) return NextResponse.json({ error: "Thiếu dữ liệu demo" }, { status: 400 });
    ({ topic, draws, clarifiers } = parsed.data.demo);
    question = parsed.data.demo.question ?? "";
    spreadId = parsed.data.demo.spread as SpreadId;
  }

  const spread = SPREADS[spreadId];
  if (!spread) return NextResponse.json({ error: "Kiểu trải không hợp lệ" }, { status: 400 });
  if (clarifiers.length >= MAX_CLARIFIERS) return NextResponse.json({ error: "Đã đủ 3 lá làm rõ." }, { status: 409 });

  const [d] = drawCards(1, [...draws, ...clarifiers].map((x) => x.cardId));
  // Claude nói lá làm rõ nghiêng bàn về phía nào; lỗi hay chưa có khóa thì ghép câu từ dữ liệu.
  const ai = question ? await writeClarifierWithAI({ question, spread, draws, clarifiers, card: d, sensitive: sensitiveKind(question) }) : null;
  const lines = composeClarifier(d, topic, clarifiers.length, ai);
  const position = draws.length + clarifiers.length;
  const [card] = toDrawnCards([d], spread.positions, true, position);

  if (supabase && parsed.data.readingId) {
    // Phiên đã được xác nhận là của khách ở trên (đọc qua RLS); ghi bằng client secret key.
    const admin = createAdminClient();
    const { error } = await admin
      .from("reading_cards")
      .insert({ reading_id: parsed.data.readingId, position, card_id: d.cardId, reversed: d.reversed, clarifier: true });
    // Trùng vị trí nghĩa là một yêu cầu bốc thêm khác vừa ghi trước: không trả lá chưa được lưu.
    if (error) {
      console.error("[clarify] không lưu được lá làm rõ", error.message);
      return NextResponse.json({ error: "Bàn vừa có thay đổi. Cậu thử lại nhé." }, { status: 409 });
    }
    const lineError = await saveLines(admin, parsed.data.readingId, lines);
    if (lineError) console.error("[clarify] không lưu được lời thoại", lineError.message);
  }

  return NextResponse.json({ card, draw: supabase ? undefined : d, lines, clarifiersLeft: MAX_CLARIFIERS - clarifiers.length - 1 });
}
