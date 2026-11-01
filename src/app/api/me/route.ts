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
