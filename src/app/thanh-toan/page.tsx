import Link from "next/link";
import { PageShell } from "@/components/ui/PageShell";
import { PaymentStatus } from "./PaymentStatus";

export const metadata = { title: "Thanh toán · Ngôi Nhà Trong Rừng" };

/** Trang khách quay về sau payOS: đã hủy, hoặc chờ tiền về (tiêu đề không cảm ơn khi tiền chưa về). */
export default async function PaymentReturn({ searchParams }: PageProps<"/thanh-toan">) {
  const sp = await searchParams;
  const order = typeof sp.order === "string" ? sp.order : "";
  const cancelled = sp.huy === "1";
  return (
    <PageShell title={cancelled ? "Đã hủy đơn" : "Thanh toán gói"}>
      {cancelled ? (
        <>
          <p>Đơn này đã hủy, cậu không cần làm gì thêm. Ngọn đèn vẫn sáng cho khách ghé chơi; muốn mua lại thì chọn gói lần nữa nhé.</p>
          <p className="page-actions">
            <Link className="btn-pixel" href="/goi">Xem các gói</Link>
          </p>
        </>
      ) : (
        <PaymentStatus order={order} />
      )}
      <p className="page-actions">
        <Link className="btn-pixel btn-gold" href="/?vao=1">Vào nhà</Link>
      </p>
    </PageShell>
  );
}
