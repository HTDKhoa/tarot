import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { payos } from "@/lib/payos";
import { PLANS } from "@/lib/plans";

/**
 * Webhook payOS. Đăng ký URL https://<domain>/api/payments/webhook trong trang quản trị payOS.
 * Luôn trả 200 cho payload hợp lệ (kể cả đơn thử của payOS) để payOS không gửi lại liên tục.
 */
export async function POST(req: Request) {
  let data;
  try {
    data = await payos().webhooks.verify(await req.json());
  } catch {
    return NextResponse.json({ success: false, error: "Chữ ký không hợp lệ" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: payment } = await admin.from("payments").select("*").eq("order_code", data.orderCode).maybeSingle();
  if (!payment) return NextResponse.json({ success: true, note: "order not found" });
  if (payment.status === "paid") return NextResponse.json({ success: true, note: "already processed" });
  if (data.code !== "00" || data.amount < payment.amount) {
    await admin.from("payments").update({ raw: data }).eq("id", payment.id);
    return NextResponse.json({ success: true, note: "not paid" });
  }

  const now = new Date();
  // Chỉ một request được chuyển pending -> paid, tránh cộng ngày hai lần khi payOS gửi lặp.
  const { data: claimed } = await admin
    .from("payments")
    .update({ status: "paid", paid_at: now.toISOString(), raw: data })
    .eq("id", payment.id)
    .eq("status", "pending")
    .select("id");
  if (!claimed?.length) return NextResponse.json({ success: true, note: "already processed" });

  const plan = PLANS[payment.plan as "month" | "year"];
  const { data: sub } = await admin.from("subscriptions").select("plan, expires_at").eq("user_id", payment.user_id).maybeSingle();
  const base = sub && new Date(sub.expires_at) > now ? new Date(sub.expires_at) : now;
  const expires = new Date(base.getTime() + plan.days * 86_400_000);
  // Đang còn gói năm mà mua thêm gói tháng thì vẫn giữ nhãn gói năm, chỉ cộng thêm ngày.
  const keepYear = sub && new Date(sub.expires_at) > now && sub.plan === "year";
  await admin.from("subscriptions").upsert({
    user_id: payment.user_id,
    plan: keepYear ? "year" : payment.plan,
    expires_at: expires.toISOString(),
    updated_at: now.toISOString(),
  });
  return NextResponse.json({ success: true });
}
