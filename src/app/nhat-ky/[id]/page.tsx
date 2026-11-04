import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/ui/PageShell";
import { getUser } from "@/lib/supabase/server";
import { getCard } from "@/lib/tarot/cards";
import { SPREADS, type SpreadId } from "@/lib/tarot/spreads";
import { NoteEditor } from "./NoteEditor";
import { DeleteButton } from "@/components/ui/DeleteButton";

export default async function JournalEntry({ params }: PageProps<"/nhat-ky/[id]">) {
  const { id } = await params;
  const { supabase, user } = await getUser();
  if (!supabase || !user) notFound();
  const { data: r } = await supabase
    .from("readings")
    .select("id, question, spread, summary, advice, note, happened, created_at, reading_cards(position, card_id, reversed, clarifier), messages(id, role, text)")
    .eq("id", id)
    .maybeSingle();
  if (!r) notFound();
  const spread = SPREADS[r.spread as SpreadId];
  const cards = [...r.reading_cards].sort((a, b) => a.position - b.position);
  const messages = [...r.messages].sort((a, b) => a.id - b.id);

  return (
    <PageShell title={r.question} lead={`${new Date(r.created_at).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })} · ${spread?.name ?? r.spread}`}>
      <section className="pixel-frame" style={{ padding: "1rem 1.2rem", marginBottom: "1.5rem" }}>
        <ul style={{ display: "grid", gap: "0.4rem" }}>
          {cards.map((c) => {
            const card = getCard(c.card_id);
            const label = c.clarifier ? "Lá làm rõ" : spread?.positions[c.position] ?? `Lá ${c.position + 1}`;
            return (
              <li key={c.position} style={{ fontFamily: "var(--font-pixel)", fontSize: "1.35rem" }}>
                <span style={{ color: "var(--muted)" }}>{label}:</span>{" "}
                {/* tên lá dẫn sang trang tra cứu lá đó, để đọc kỹ sau buổi đọc */}
                <Link href={`/la-bai/${card.slug}`} style={{ color: "var(--gold-hi)" }}>
                  {card.name_en}
                </Link>
                {c.reversed && <span style={{ color: "var(--moonlit-blue)" }}> · ngược</span>}
              </li>
            );
          })}
        </ul>
        {r.advice && <p style={{ marginTop: "0.8rem" }}><b>Lời dặn:</b> {r.advice}</p>}
      </section>

      <NoteEditor id={r.id} note={r.note ?? ""} happened={r.happened} />

      <div className="prose-dark" style={{ marginTop: "2rem" }}>
        <h2>Những gì Nguyệt đã nói</h2>
        {messages.map((m) => (
          <p key={m.id} style={m.role === "user" ? { color: "var(--muted)", fontStyle: "italic" } : undefined}>
            {m.role === "user" ? `Cậu: ${m.text}` : m.text}
          </p>
        ))}
      </div>
      <div style={{ marginTop: "2rem", display: "grid", gap: "1rem", justifyItems: "start" }}>
        <DeleteButton
          label="Xóa phiên này"
          warning="Câu hỏi, các lá, lời của Nguyệt và ghi chú của phiên này sẽ bị xóa hẳn, không lấy lại được. Lượt trải bài đã dùng trong tháng vẫn được tính."
          endpoint={`/api/reading/${r.id}`}
          redirectTo="/nhat-ky"
        />
        <Link href="/nhat-ky">← Về nhật ký</Link>
      </div>
    </PageShell>
  );
}
