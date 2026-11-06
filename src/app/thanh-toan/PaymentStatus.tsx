"use client";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

type Status = "pending" | "paid" | "slow" | "unknown" | "login";

/** Hỏi lại mỗi 2 giây, tối đa chừng này lần (~30 giây): webhook của ngân hàng có thể tới chậm sau khi chuyển hướng. */
const TRIES = 15;

/**
 * Trạng thái đơn sau khi khách quay về từ trang thanh toán. Mỗi trạng thái nói rõ chuyện gì đang xảy ra và khách
 * làm gì tiếp: tiền chưa về sau ~30 giây thì không để chữ "đang chờ" mãi, mà nói gói sẽ tự kích hoạt và cho kiểm tra lại.
 */
export function PaymentStatus({ order }: { order: string }) {
  const [status, setStatus] = useState<Status>("pending");
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // hỏi trạng thái; chỉ đặt state trong callback của fetch, không đặt đồng bộ trong effect
  const watch = useCallback(() => {
    clearTimeout(timer.current);
    let tries = 0;
    const poll = async () => {
      const s = await fetch(`/api/payments/status?order=${encodeURIComponent(order)}`, { cache: "no-store" })
        .then((r) => r.json())
        .then((j) => j.status as string)
        // mạng chập chờn: coi như chưa có tin, hỏi lại lần sau
        .catch(() => "pending");
      if (s === "paid" || s === "unknown" || s === "login") return setStatus(s);
      if (tries++ < TRIES) timer.current = setTimeout(poll, 2000);
      else setStatus("slow");
    };
    poll();
  }, [order]);

  useEffect(() => {
    watch();
    return () => clearTimeout(timer.current);
  }, [watch]);
  const checkAgain = () => {
    setStatus("pending");
    watch();
  };

  const code = <b className="order-code">{order}</b>;
  return (
    <div aria-live="polite">
      {status === "pending" && <p>Đang chờ ngân hàng báo tiền về… Thường chỉ mất vài giây. Mã đơn của cậu là {code}.</p>}
      {status === "paid" && <p>Tiền đã về, gói của cậu đã kích hoạt. Nguyệt đang chờ trong nhà.</p>}
      {status === "slow" && (
        <>
          <p>
            Ngân hàng chưa báo tiền về. Nếu cậu đã chuyển khoản, gói sẽ tự kích hoạt ngay khi tiền về, cậu không cần làm gì
            thêm. Cứ giữ lại mã đơn {code} và ảnh biên lai chuyển khoản.
          </p>
          <p className="page-actions">
            <button type="button" className="btn-pixel" onClick={checkAgain}>
              Kiểm tra lại
            </button>
          </p>
        </>
      )}
      {status === "login" && <p>Cậu cần ghi tên lại (đăng nhập) thì ta mới xem được đơn {code}. Cậu vào nhà ghi tên, rồi quay về trang Gói để xem gói của mình.</p>}
      {status === "unknown" && (
        <p>
          Ta không thấy đơn {code} trong tài khoản của cậu. Nếu cậu đã chuyển khoản, gói sẽ tự kích hoạt khi tiền về; cứ giữ
          lại mã đơn và ảnh biên lai chuyển khoản.
        </p>
      )}
      {status !== "paid" && status !== "pending" && (
        <p className="page-actions">
          <Link className="btn-pixel" href="/goi">
            Xem gói của mình
          </Link>
        </p>
      )}
    </div>
  );
}
