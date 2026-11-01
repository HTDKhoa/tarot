import { NextResponse } from "next/server";
import { getUser } from "@/lib/supabase/server";

export async function GET(req: Request) {
  const order = Number(new URL(req.url).searchParams.get("order"));
  const { supabase, user } = await getUser();
  if (!supabase || !user || !Number.isFinite(order)) return NextResponse.json({ status: "unknown" });
  const { data } = await supabase.from("payments").select("status, plan").eq("order_code", order).maybeSingle();
  return NextResponse.json({ status: data?.status ?? "unknown", plan: data?.plan ?? null });
}
