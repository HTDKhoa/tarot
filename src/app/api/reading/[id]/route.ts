import { NextResponse } from "next/server";
import { z } from "zod";
import { getUser } from "@/lib/supabase/server";

/** Xóa một phiên trong nhật ký. Lá bài và lời thoại bị xóa theo (on delete cascade); hạn mức tháng không đổi. */
export async function DELETE(_req: Request, { params }: RouteContext<"/api/reading/[id]">) {
  const { id } = await params;
  if (!z.string().uuid().safeParse(id).success) return NextResponse.json({ error: "Mã phiên không hợp lệ" }, { status: 400 });
  const { supabase, user } = await getUser();
  if (!supabase || !user) return NextResponse.json({ error: "Cậu cần đăng nhập trước." }, { status: 401 });

  // Client của khách: RLS chỉ cho xóa phiên của chính mình.
  const { data, error } = await supabase.from("readings").delete().eq("id", id).select("id");
  if (error) {
    console.error("[xóa phiên]", error.message);
    return NextResponse.json({ error: "Không xóa được phiên này. Cậu thử lại nhé." }, { status: 500 });
  }
  if (!data.length) return NextResponse.json({ error: "Không tìm thấy phiên này." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
