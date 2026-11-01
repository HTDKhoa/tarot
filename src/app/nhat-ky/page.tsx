import Link from "next/link";
import { PageShell } from "@/components/ui/PageShell";
import { getUser } from "@/lib/supabase/server";
import { SPREADS, type SpreadId } from "@/lib/tarot/spreads";
import { TOPIC_LABELS, type Topic } from "@/lib/tarot/types";
import { getCard } from "@/lib/tarot/cards";
import { DeleteButton } from "@/components/ui/DeleteButton";

export const dynamic = "force-dynamic";
export const metadata = { title: "Nhật ký · Ngôi Nhà Trong Rừng" };

export default async function JournalPage() {
  const { supabase, user } = await getUser();
  if (!supabase) {
    return (
      <PageShell title="Nhật ký" lead="Web đang chạy chế độ demo nên chưa lưu nhật ký. Hãy cấu hình Supabase để bật đăng nhập.">
        <Link className="btn-pixel btn-gold" href="/?vao=1">Vào nhà</Link>
      </PageShell>
    );
  }
  if (!user) {
    return (
      <PageShell title="Nhật ký" lead="Cậu cần đăng nhập để xem những lần đã ghé.">
        <Link className="btn-pixel btn-gold" href="/?vao=1">Vào nhà</Link>
      </PageShell>
    );
  }
  const { data: readings } = await supabase
    .from("readings")
    .select("id, question, topic, spread, status, summary, created_at, reading_cards(position, card_id, reversed, clarifier)")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <PageShell title="Nhật ký" lead="Những lần cậu đã ngồi ở bàn này. Bấc giữ cuốn sổ cẩn thận lắm.">
      {!readings?.length && <p>Chưa có trang nào. Hãy vào nhà và hỏi Nguyệt một câu.</p>}
      <ol style={{ display: "grid", gap: "1rem" }}>
        {readings?.map((r) => {
          const cards = [...r.reading_cards].sort((a, b) => a.position - b.position);
          return (
            <li key={r.id}>
              <Link href={`/nhat-ky/${r.id}`} className="pixel-frame" style={{ display: "block", padding: "1rem 1.1rem", textDecoration: "none", color: "inherit" }}>
                <div style={{ fontFamily: "var(--font-pixel)", fontSize: "1.15rem", color: "var(--muted)" }}>
                  {new Date(r.created_at).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh", dateStyle: "medium", timeStyle: "short" })} · {TOPIC_LABELS[r.topic as Topic]} · {SPREADS[r.spread as SpreadId]?.name ?? r.spread}
                </div>
                <div style={{ fontWeight: 600, margin: "0.3rem 0" }}>{r.question}</div>
                <div style={{ fontFamily: "var(--font-pixel)", fontSize: "1.25rem", color: "var(--gold-hi)" }}>
                  {cards.map((c) => `${getCard(c.card_id).name_en}${c.reversed ? " (ngược)" : ""}`).join(" · ")}
                </div>
                {r.summary && <p style={{ color: "var(--muted)", marginTop: "0.3rem", fontSize: "0.92rem" }}>{r.summary}</p>}
              </Link>
            </li>
          );
        })}
      </ol>
      <section className="prose-dark" style={{ marginTop: "3rem" }}>
        <h2>Dữ liệu của cậu</h2>
        <p>
          Cậu có thể xóa toàn bộ nhật ký, ghi chú và hồ sơ bất kỳ lúc nào. Lịch sử thanh toán được giữ lại theo yêu cầu kế toán; gói đang dùng và số lượt đã dùng trong tháng không đổi.
        </p>
        <DeleteButton
          label="Xóa toàn bộ dữ liệu của tôi"
          warning="Mọi phiên trải bài, lời của Nguyệt, ghi chú và hồ sơ của cậu sẽ bị xóa hẳn, không lấy lại được."
          endpoint="/api/me"
          redirectTo="/nhat-ky"
        />
      </section>
    </PageShell>
  );
}
