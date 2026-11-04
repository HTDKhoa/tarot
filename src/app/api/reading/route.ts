import { NextResponse } from "next/server";
import { z } from "zod";
import { getUser } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { drawCards } from "@/lib/tarot/draw";
import { SPREADS, MAX_CLARIFIERS, type SpreadId } from "@/lib/tarot/spreads";
import { composeReading, crisisLines } from "@/lib/tarot/reader";
import { isCrisis, sensitiveKind } from "@/lib/safety";
import { chooseTopic } from "@/lib/tarot/choose";
import { chooseSpreadWithAI } from "@/lib/tarot/chooseAI";
import { getPlanStatus, saveLines, toDrawnCards } from "@/lib/readings";

const Body = z.object({
  question: z.string().trim().min(3, "Câu hỏi hơi ngắn quá").max(500, "Câu hỏi dài quá 500 ký tự"),
  // Khách chỉ viết câu hỏi; cách trải do AI chọn từ chính câu hỏi (chooseAI.ts) khi không được gửi kèm.
  // Chủ đề chỉ còn là phỏng đoán nội bộ cho người đọc ghép câu (reader.ts), không giới hạn điều khách được hỏi.
  topic: z.enum(["tinh_cam", "cong_viec", "tai_chinh", "ban_than"]).optional(),
  spread: z.enum(Object.keys(SPREADS) as [SpreadId, ...SpreadId[]]).optional(),
});

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" }, { status: 400 });
  }
  const { question } = parsed.data;
  const topic = parsed.data.topic ?? chooseTopic(question);

  // An toàn trước hết, trước cả AI: không trải bài khi có dấu hiệu khủng hoảng, và không tính vào hạn mức.
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

  // Gọi AI sau khi đã qua kiểm tra khủng hoảng và hạn mức, để không tốn lượt gọi cho phiên sẽ bị chặn.
  const choice = parsed.data.spread ? { spread: parsed.data.spread, reason: null, by: "client" } : await chooseSpreadWithAI(question);
  const spreadId = choice.spread;
  const spread = SPREADS[spreadId];
  // AI chỉ quyết định số lá qua cách trải; lá vẫn rút ở đây bằng crypto RNG.
  const draws = drawCards(spread.positions.length);
  const { lines, offerClarifier } = composeReading({ question, topic, spread, draws, sensitive: sensitiveKind(question), byAI: choice.by === "ai" });
  const cards = toDrawnCards(draws, spread.positions);

  let readingId: string | null = null;
  if (supabase && user) {
    const { data, error } = await supabase
      .from("readings")
      .insert({ user_id: user.id, question, topic, spread: spreadId })
      .select("id")
      .single();
    if (error) {
      console.error("[reading] không tạo được phiên", error.message);
      return NextResponse.json({ error: "Không lưu được phiên đọc bài." }, { status: 500 });
    }
    const id: string = data.id;
    // Lá bài và lời thoại chỉ server được ghi (RLS chặn khách), nên dùng client secret key.
    const admin = createAdminClient();
    const failed =
      (await admin.from("reading_cards").insert(draws.map((d, i) => ({ reading_id: id, position: i, card_id: d.cardId, reversed: d.reversed })))).error ??
      (await admin.from("messages").insert({ reading_id: id, role: "user", text: question })).error ??
      (await saveLines(admin, id, lines)) ??
      (await admin.from("reading_usage").insert({ user_id: user.id })).error;
    if (failed) {
      console.error("[reading] không lưu được lá bài / lời thoại", failed.message);
      await admin.from("readings").delete().eq("id", id);
      return NextResponse.json({ error: "Không lưu được phiên đọc bài." }, { status: 500 });
    }
    readingId = id;
  }

  return NextResponse.json({
    readingId,
    demo: !supabase,
    topic,
    spread: spreadId,
    // câu Nguyệt nói vì sao trải như vậy, đặt trước lời mời chọn lá; null khi đoán bằng từ khóa
    reason: choice.reason,
    // Ở chế độ demo, trình duyệt giữ danh sách lá để gửi lại khi bốc thêm hoặc kết thúc.
    draws: supabase ? undefined : draws,
    cards,
    lines,
    offerClarifier,
    clarifiersLeft: MAX_CLARIFIERS,
  });
}
