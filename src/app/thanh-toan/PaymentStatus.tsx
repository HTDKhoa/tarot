"use client";
import { useEffect, useState } from "react";

/** Webhook có thể tới chậm vài giây sau khi chuyển hướng, nên hỏi lại trạng thái vài lần. */
export function PaymentStatus({ order }: { order: string }) {
  const [status, setStatus] = useState("pending");
  useEffect(() => {
    let tries = 0;
    let timer: ReturnType<typeof setTimeout>;
    const poll = async () => {
      const j = await (await fetch(`/api/payments/status?order=${encodeURIComponent(order)}`, { cache: "no-store" })).json();
      setStatus(j.status);
      if (j.status !== "paid" && tries++ < 15) timer = setTimeout(poll, 2000);
    };
    poll();
    return () => clearTimeout(timer);
  }, [order]);
  if (status === "paid") return <p>Gói của cậu đã được kích hoạt. Nguyệt đang chờ.</p>;
  if (status === "unknown") return <p>Không tìm thấy đơn này. Nếu cậu đã chuyển tiền mà gói chưa kích hoạt, hãy liên hệ hỗ trợ kèm mã đơn {order}.</p>;
  return <p>Đang chờ ngân hàng xác nhận… (mã đơn {order})</p>;
}
