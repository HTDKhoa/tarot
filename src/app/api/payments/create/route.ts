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
  if (!parsed.success) return NextResponse.json({ error: "Gói không hợp lệ" }, { status: 400 });
  const { supabase, user } = await getUser();
  if (!supabase || !user) return NextResponse.json({ error: "Cậu cần đăng nhập trước." }, { status: 401 });
  if (!isPayOSConfigured()) return NextResponse.json({ error: "Thanh toán chưa được cấu hình." }, { status: 503 });

  const plan = PLANS[parsed.data.plan];
  const orderCode = newOrderCode();
  const origin = new URL(req.url).origin || SITE_URL;

  const link = await payos().paymentRequests.create({
    orderCode,
    amount: plan.price,
    description: `NGUYET ${parsed.data.plan === "month" ? "THANG" : "NAM"}`, // tối đa 25 ký tự
    items: [{ name: plan.name, quantity: 1, price: plan.price }],
    returnUrl: `${origin}/thanh-toan?order=${orderCode}`,
    cancelUrl: `${origin}/thanh-toan?order=${orderCode}&huy=1`,
  });

  const admin = createAdminClient();
  const { error } = await admin.from("payments").insert({
    user_id: user.id,
    order_code: orderCode,
    plan: parsed.data.plan,
    amount: plan.price,
    checkout_url: link.checkoutUrl,
  });
  if (error) return NextResponse.json({ error: "Không tạo được đơn." }, { status: 500 });
  return NextResponse.json({ checkoutUrl: link.checkoutUrl, orderCode });
}
