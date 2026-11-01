import { NextResponse } from "next/server";
import { z } from "zod";
import { getUser } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Draw } from "@/lib/tarot/draw";
import { composeClosing } from "@/lib/tarot/reader";
import type { Topic } from "@/lib/tarot/types";
import { saveLines } from "@/lib/readings";

const DrawSchema = z.object({ cardId: z.number().int().min(0).max(77), reversed: z.boolean() });
const Body = z.object({
  readingId: z.string().uuid().nullable().optional(),
  demo: z
    .object({
      topic: z.enum(["tinh_cam", "cong_viec", "tai_chinh", "ban_than"]),
      draws: z.array(DrawSchema).min(1).max(10),
      clarifiers: z.array(DrawSchema).max(3),
    })
    .optional(),
});

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Dữ liệu không hợp lệ" }, { status: 400 });
  const { supabase, user } = await getUser();

  let topic: Topic;
  let draws: Draw[];
  let clarifiers: Draw[];

  if (supabase) {
    if (!user || !parsed.data.readingId) return NextResponse.json({ error: "Cần đăng nhập" }, { status: 401 });
    const { data: reading } = await supabase
      .from("readings")
      .select("id, topic, status, reading_cards(position, card_id, reversed, clarifier)")
      .eq("id", parsed.data.readingId)
      .single();
    if (!reading) return NextResponse.json({ error: "Không tìm thấy phiên" }, { status: 404 });
    if (reading.status !== "open") return NextResponse.json({ error: "Phiên này đã khép lại." }, { status: 409 });
    topic = reading.topic as Topic;
    const rc = [...reading.reading_cards].sort((a, b) => a.position - b.position);
    draws = rc.filter((c) => !c.clarifier).map((c) => ({ cardId: c.card_id, reversed: c.reversed }));
    clarifiers = rc.filter((c) => c.clarifier).map((c) => ({ cardId: c.card_id, reversed: c.reversed }));
  } else {
    if (!parsed.data.demo) return NextResponse.json({ error: "Thiếu dữ liệu demo" }, { status: 400 });
    ({ topic, draws, clarifiers } = parsed.data.demo);
  }

  const { lines, summary, advice, themes } = composeClosing({ topic, draws, clarifiers });

  if (supabase && parsed.data.readingId) {
    // Khách chỉ được sửa note/happened; trạng thái và tóm tắt do server ghi bằng client secret key.
    const admin = createAdminClient();
    const { error } = await admin
      .from("readings")
      .update({ status: "closed", summary, advice, closed_at: new Date().toISOString() })
      .eq("id", parsed.data.readingId);
    if (error) {
      console.error("[finish] không khép được phiên", error.message);
      return NextResponse.json({ error: "Không lưu được phần tổng kết. Cậu thử lại nhé." }, { status: 500 });
    }
    const lineError = await saveLines(admin, parsed.data.readingId, lines);
    if (lineError) console.error("[finish] không lưu được lời thoại", lineError.message);
  }
  return NextResponse.json({ lines, summary, advice, themes });
}
