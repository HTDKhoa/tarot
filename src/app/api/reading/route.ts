import { NextResponse } from "next/server";
import { z } from "zod";
import { getUser } from "@/lib/supabase/server";
import { drawCards } from "@/lib/tarot/draw";
import { SPREADS, MAX_CLARIFIERS, type SpreadId } from "@/lib/tarot/spreads";
import { composeReading, crisisLines } from "@/lib/tarot/reader";
import { isCrisis, sensitiveKind } from "@/lib/safety";
import { getPlanStatus, saveLines, toDrawnCards } from "@/lib/readings";

const Body = z.object({
  question: z.string().trim().min(3, "Câu hỏi hơi ngắn quá").max(500, "Câu hỏi dài quá 500 ký tự"),
  topic: z.enum(["tinh_cam", "cong_viec", "tai_chinh", "ban_than"]),
  spread: z.enum(Object.keys(SPREADS) as [SpreadId, ...SpreadId[]]),
});

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" }, { status: 400 });
  }
  const { question, topic, spread: spreadId } = parsed.data;
  const spread = SPREADS[spreadId];

  // An toàn trước hết: không trải bài khi có dấu hiệu khủng hoảng, và không tính vào hạn mức.
  if (isCrisis(question)) {
    return NextResponse.json({ crisis: true, lines: crisisLines() });
  }

  const { supabase, user } = await getUser();
  if (supabase && !user) {
    return NextResponse.json({ error: "Cậu cần ghi tên vào sổ khách (đăng nhập) trước đã." }, { status: 401 });
  }

  if (supabase && user) {
    const status = await getPlanStatus(supabase, user.id);
    if (status.used >= status.limit) {
      return NextResponse.json(
        {
          error: "quota",
          message:
            status.plan === "free"
              ? "Tháng này cậu đã dùng hết lượt trải bài của khách ghé chơi rồi. Nếu muốn ghé thường xuyên, xem các gói nhé."
              : "Tháng này ta đã đọc cho cậu đủ nhiều rồi. Nến cũng cần nghỉ. Đầu tháng sau cậu quay lại nhé.",
        },
        { status: 429 },
      );
    }
  }

  const draws = drawCards(spread.positions.length);
  const { lines, offerClarifier } = composeReading({ question, topic, spread, draws, sensitive: sensitiveKind(question) });
  const cards = toDrawnCards(draws, spread.positions);

  let readingId: string | null = null;
  if (supabase && user) {
    const { data, error } = await supabase
      .from("readings")
      .insert({ user_id: user.id, question, topic, spread: spreadId })
      .select("id")
      .single();
    if (error) return NextResponse.json({ error: "Không lưu được phiên đọc bài." }, { status: 500 });
    readingId = data.id;
    await supabase.from("reading_cards").insert(
      draws.map((d, i) => ({ reading_id: readingId, position: i, card_id: d.cardId, reversed: d.reversed })),
    );
    await supabase.from("messages").insert({ reading_id: readingId, role: "user", text: question });
    await saveLines(supabase, readingId!, lines);
  }

  return NextResponse.json({
    readingId,
    demo: !supabase,
    // Ở chế độ demo, trình duyệt giữ danh sách lá để gửi lại khi bốc thêm hoặc kết thúc.
    draws: supabase ? undefined : draws,
    cards,
    lines,
    offerClarifier,
    clarifiersLeft: MAX_CLARIFIERS,
  });
}
