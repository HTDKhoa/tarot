import { PageShell } from "@/components/ui/PageShell";
import { BuyButton } from "./BuyButton";
import { PLANS, formatVnd } from "@/lib/plans";
import { getUser } from "@/lib/supabase/server";
import { getPlanStatus } from "@/lib/readings";

export const dynamic = "force-dynamic";
export const metadata = { title: "Gói · Ngôi Nhà Trong Rừng" };

export default async function PricingPage() {
  const { supabase, user } = await getUser();
  const status = supabase && user ? await getPlanStatus(supabase, user.id) : null;
  const perMonth = Math.round(PLANS.year.price / 12 / 1000) * 1000;
  const saving = Math.round((1 - PLANS.year.price / (PLANS.month.price * 12)) * 100);

  return (
    <PageShell title="Ghé thường xuyên" lead="Ngọn đèn luôn sáng cho khách ghé chơi. Nếu cậu muốn ngồi lâu hơn, đây là các gói.">
      {status && status.plan !== "free" && (
        <p className="pixel-frame plan-current">
          Cậu đang dùng <b>{PLANS[status.plan].name}</b>, còn hạn tới {new Date(status.expiresAt!).toLocaleDateString("vi-VN")}. Mua thêm sẽ cộng dồn ngày.
        </p>
      )}
      <div className="plan-grid">
        <PlanCard name={PLANS.free.name} price="0đ" note="Mãi mãi" features={["Lá bài của ngày, không giới hạn", `${PLANS.free.readingsPerMonth} lần trải bài mỗi tháng`, "Nhật ký lưu các phiên"]} />
        <PlanCard
          name={PLANS.month.name}
          price={formatVnd(PLANS.month.price)}
          note="30 ngày"
          features={[`${PLANS.month.readingsPerMonth} lần trải bài mỗi tháng`, "Nhật ký lưu các phiên", "Nguyệt nhớ chuyện cũ của cậu (sắp có)"]}
          action={<BuyButton plan="month" loggedIn={!!user} />}
        />
        <PlanCard
          name={PLANS.year.name}
          price={formatVnd(PLANS.year.price)}
          note={`≈ ${formatVnd(perMonth)}/tháng · tiết kiệm ${saving}%`}
          highlight
          features={["Mọi quyền lợi của gói tháng", "Thư tổng kết cuối năm từ Nguyệt (sắp có)", "Skin bộ bài riêng (sắp có)"]}
          action={<BuyButton plan="year" loggedIn={!!user} />}
        />
      </div>
      <div className="prose-dark plan-faq">
        <h2>Thanh toán thế nào?</h2>
        <p>Quét mã VietQR bằng app ngân hàng bất kỳ. Gói kích hoạt ngay khi tiền về, không tự gia hạn, không lưu thẻ. Hết hạn thì cậu tự quay về gói khách ghé chơi, nhật ký vẫn còn nguyên.</p>
        <h2>Lượt trải bài tính thế nào?</h2>
        <p>Mỗi lần trải bài tốn một lượt; rút thêm lá làm rõ trong cùng phiên không tốn thêm. Lượt tính theo tháng dương lịch và làm mới vào ngày 1 hằng tháng. Lá bài của ngày không tốn lượt.</p>
      </div>
    </PageShell>
  );
}

function PlanCard({ name, price, note, features, action, highlight }: { name: string; price: string; note: string; features: string[]; action?: React.ReactNode; highlight?: boolean }) {
  return (
    <section className={`pixel-frame plan-card ${highlight ? "is-highlight" : ""}`}>
      <h2 className="title-pixel plan-name">{name}</h2>
      <div className="plan-price">{price}</div>
      <div className="plan-note">{note}</div>
      <ul className="plan-features">
        {features.map((f) => (
          <li key={f}>{f}</li>
        ))}
      </ul>
      {action}
    </section>
  );
}
