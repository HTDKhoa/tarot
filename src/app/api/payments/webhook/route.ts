import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isPayOSConfigured, payos } from "@/lib/payos";
import { PLANS } from "@/lib/plans";

const TAG = "[payos-webhook]";

/** Lỗi hệ thống: trả 500 để payOS gửi lại webhook sau. */
function retryLater(message: string, detail: Record<string, unknown>) {
  console.error(TAG, message, JSON.stringify(detail));
  return NextResponse.json({ success: false, error: message }, { status: 500 });
}

/**
 * Webhook payOS. Đăng ký URL https://<domain>/api/payments/webhook trong trang quản trị payOS.
 * Payload hợp lệ đã xử lý xong (kể cả đơn thử của payOS) thì trả 200 để payOS thôi gửi lại.
 * Mọi lỗi ghi DB đều trả 500 để payOS gửi lại; đơn và gói được ghi cùng một transaction
 * trong hàm SQL activate_payment (supabase/migrations/0002_activate_payment.sql).
 */
export async function POST(req: Request) {
  if (!isPayOSConfigured()) return retryLater("Chưa cấu hình payOS", {});

  let data;
  try {
    data = await payos().webhooks.verify(await req.json());
  } catch (e) {
    console.warn(TAG, "chữ ký không hợp lệ", (e as Error).message);
    return NextResponse.json({ success: false, error: "Chữ ký không hợp lệ" }, { status: 400 });
  }
  const orderCode = data.orderCode;

  let admin;
  try {
    admin = createAdminClient();
  } catch (e) {
    return retryLater("Thiếu cấu hình Supabase phía server", { orderCode, error: (e as Error).message });
  }

  const { data: payment, error: findError } = await admin
    .from("payments")
    .select("id, plan, amount, status")
    .eq("order_code", orderCode)
    .maybeSingle();
  if (findError) return retryLater("Không đọc được đơn", { orderCode, error: findError.message });
  if (!payment) {
    console.info(TAG, "không có đơn (có thể là đơn thử của payOS)", orderCode);
    return NextResponse.json({ success: true, note: "order not found" });
  }
  if (payment.status === "paid") return NextResponse.json({ success: true, note: "already processed" });

  if (data.code !== "00" || data.amount < payment.amount) {
    const { error } = await admin.from("payments").update({ raw: data }).eq("id", payment.id);
    if (error) return retryLater("Không lưu được dữ liệu đơn chưa thanh toán", { orderCode, error: error.message });
    console.warn(TAG, "đơn chưa thanh toán đủ", JSON.stringify({ orderCode, code: data.code, amount: data.amount, expected: payment.amount }));
    return NextResponse.json({ success: true, note: "not paid" });
  }

  const plan = PLANS[payment.plan as "month" | "year"];
  if (!plan) return retryLater("Gói của đơn không hợp lệ", { orderCode, plan: payment.plan });

  const { data: result, error: activateError } = await admin.rpc("activate_payment", {
    p_order_code: orderCode,
    p_days: plan.days,
    p_raw: data,
  });
  if (activateError) return retryLater("Kích hoạt gói thất bại", { orderCode, error: activateError.message });

  console.info(TAG, "kết quả", JSON.stringify({ orderCode, result }));
  return NextResponse.json({ success: true, note: result });
}
