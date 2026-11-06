import { NextResponse } from "next/server";
import { z } from "zod";
import { getUser } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isPayOSConfigured, newOrderCode, payos } from "@/lib/payos";
import { PLANS } from "@/lib/plans";
import { SITE_URL } from "@/lib/config";

const Body = z.object({ plan: z.enum(["month", "year"]) });

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Không có gói này. Cậu tải lại trang Gói rồi chọn lại nhé." }, { status: 400 });
  const { supabase, user } = await getUser();
  if (!supabase || !user) return NextResponse.json({ error: "Cậu cần ghi tên (đăng nhập) trước khi mua gói." }, { status: 401 });
  if (!isPayOSConfigured()) return NextResponse.json({ error: "Ngôi nhà chưa nhận thanh toán lúc này. Cậu quay lại sau nhé." }, { status: 503 });
  const FAILED = "Chưa tạo được mã thanh toán, lỗi ở phía ta. Cậu bấm lại sau ít phút nhé.";

  const plan = PLANS[parsed.data.plan];
  const orderCode = newOrderCode();
  const origin = new URL(req.url).origin || SITE_URL;

  let link;
  try {
    link = await payos().paymentRequests.create({
      orderCode,
      amount: plan.price,
      description: `NGUYET ${parsed.data.plan === "month" ? "THANG" : "NAM"}`, // tối đa 25 ký tự
      items: [{ name: plan.name, quantity: 1, price: plan.price }],
      returnUrl: `${origin}/thanh-toan?order=${orderCode}`,
      cancelUrl: `${origin}/thanh-toan?order=${orderCode}&huy=1`,
    });
  } catch (e) {
    // payOS lỗi hay không trả lời: báo khách bằng một câu dễ hiểu thay vì để lỗi 500 trần
    console.error("[payments/create] payOS không tạo được link", e instanceof Error ? e.message : e);
    return NextResponse.json({ error: FAILED }, { status: 502 });
  }

  const admin = createAdminClient();
  const { error } = await admin.from("payments").insert({
    user_id: user.id,
    order_code: orderCode,
    plan: parsed.data.plan,
    amount: plan.price,
    checkout_url: link.checkoutUrl,
  });
  if (error) return NextResponse.json({ error: FAILED }, { status: 500 });
  return NextResponse.json({ checkoutUrl: link.checkoutUrl, orderCode });
}
