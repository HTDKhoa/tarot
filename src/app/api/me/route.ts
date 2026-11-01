import { NextResponse } from "next/server";
import { getUser } from "@/lib/supabase/server";
import { getPlanStatus } from "@/lib/readings";
import { vnHour } from "@/lib/config";
import { greeting } from "@/lib/tarot/reader";

/** Trạng thái người dùng + lời chào của Nguyệt khi bước vào nhà. */
export async function GET() {
  const { supabase, user } = await getUser();
  if (!supabase) {
    return NextResponse.json({ configured: false, user: null, status: null, greeting: greeting({ hour: vnHour(), returning: false }) });
  }
  if (!user) {
    return NextResponse.json({ configured: true, user: null, status: null, greeting: greeting({ hour: vnHour(), returning: false }) });
  }
  const [{ data: profile }, status, { count }] = await Promise.all([
    supabase.from("profiles").select("display_name").eq("id", user.id).maybeSingle(),
    getPlanStatus(supabase, user.id),
    supabase.from("readings").select("id", { count: "exact", head: true }).eq("user_id", user.id),
  ]);
  const name = profile?.display_name?.split(" ").at(-1) ?? null;
  return NextResponse.json({
    configured: true,
    user: { id: user.id, email: user.email, name },
    status,
    greeting: greeting({ name, hour: vnHour(), returning: (count ?? 0) > 0 }),
  });
}

/**
 * "Xóa toàn bộ dữ liệu của tôi": mọi phiên (kèm lá bài, lời thoại), bộ nhớ và hồ sơ.
 * Giữ lại lịch sử thanh toán (kế toán), gói đang dùng và số lượt đã dùng trong tháng.
 */
export async function DELETE() {
  const { supabase, user } = await getUser();
  if (!supabase || !user) return NextResponse.json({ error: "Cậu cần đăng nhập trước." }, { status: 401 });

  // Client của khách: RLS chỉ cho xóa dữ liệu của chính mình.
  for (const [table, column] of [["readings", "user_id"], ["user_memory", "user_id"], ["profiles", "id"]] as const) {
    const { error } = await supabase.from(table).delete().eq(column, user.id);
    if (error) {
      console.error("[xóa dữ liệu]", table, error.message);
      return NextResponse.json({ error: "Chưa xóa xong. Cậu thử lại nhé, phần còn lại sẽ được xóa tiếp." }, { status: 500 });
    }
  }
  return NextResponse.json({ ok: true });
}
