import Link from "next/link";
import { PageShell } from "@/components/ui/PageShell";
import { PaymentStatus } from "./PaymentStatus";

export const metadata = { title: "Thanh toán · Ngôi Nhà Trong Rừng" };

export default async function PaymentReturn({ searchParams }: PageProps<"/thanh-toan">) {
  const sp = await searchParams;
  const order = typeof sp.order === "string" ? sp.order : "";
  const cancelled = sp.huy === "1";
  return (
    <PageShell title={cancelled ? "Đã hủy thanh toán" : "Cảm ơn cậu"}>
      {cancelled ? <p>Không sao cả. Ngọn đèn vẫn sáng cho khách ghé chơi.</p> : <PaymentStatus order={order} />}
      <p style={{ marginTop: "1.5rem" }}>
        <Link className="btn-pixel btn-gold" href="/?vao=1">Vào nhà</Link>
      </p>
    </PageShell>
  );
}
