import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/ui/PageShell";
import { CardFace } from "@/components/ui/TarotCard";
import { assetUrl } from "@/lib/assets";
import { allCards, getCardBySlug, toPublic } from "@/lib/tarot/cards";
import { TOPIC_LABELS, type Topic } from "@/lib/tarot/types";

export function generateStaticParams() {
  return allCards().map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const card = getCardBySlug((await params).slug);
  if (!card) return {};
  return {
    title: `${card.name_vi} (${card.name_en}) · Bộ bài · Ngôi Nhà Trong Rừng`,
    description: card.y_nghia.xuoi,
  };
}

const TOPICS = Object.keys(TOPIC_LABELS) as Topic[];

/** Trang một lá: tranh lớn, tên, từ khóa, nghĩa xuôi và ngược, theo từng chủ đề, lời khuyên, ý riêng của Nguyệt. */
export default async function CardPage({ params }: { params: Promise<{ slug: string }> }) {
  const card = getCardBySlug((await params).slug);
  if (!card) notFound();
  const deck = allCards();
  const prev = deck[(card.id + deck.length - 1) % deck.length];
  const next = deck[(card.id + 1) % deck.length];
  const pub = toPublic(card);
  return (
    <PageShell title={card.name_vi} lead={card.name_en}>
      <nav className="deck-crumb" aria-label="Đường dẫn">
        <Link href="/la-bai">← Cả bộ bài</Link>
      </nav>
      <div className="card-sheet">
        {/* bên trái: lá nằm trên khăn của Nguyệt dưới ánh nến; bên phải: trang sổ của Bấc ghi nghĩa lá */}
        <figure
          className="card-sheet-art"
          style={{ backgroundImage: `radial-gradient(ellipse 80% 55% at 70% 8%, rgba(255, 190, 110, 0.22), transparent 70%), url("${assetUrl("/assets/table/cloth_tile.png")}")` }}
        >
          <CardFace card={pub} size="xl" />
          <figcaption>{card.hinh_anh}</figcaption>
        </figure>

        <div className="card-sheet-text card-paper" style={{ borderImageSource: `url("${assetUrl("/assets/table/book_frame.png")}")` }}>
          <div className="card-paper-head">
            <img src={assetUrl("/assets/characters/owl_idle_0.png")} alt="" />
            <span>
              Bấc chép về lá
              <b>
                {card.name_vi} · {card.name_en}
              </b>
            </span>
          </div>
          {/* xuôi và ngược đứng cạnh nhau trên màn rộng, chồng lên nhau trên điện thoại */}
          <div className="card-sides">
            <section aria-labelledby="xuoi">
              <h2 id="xuoi">Xuôi</h2>
              <ul className="card-keys" aria-label="Từ khóa xuôi">
                {card.tu_khoa.xuoi.map((k) => (
                  <li key={k}>{k}</li>
                ))}
              </ul>
              <p>{card.y_nghia.xuoi}</p>
            </section>
            <section aria-labelledby="nguoc">
              <h2 id="nguoc">Ngược</h2>
              <ul className="card-keys" aria-label="Từ khóa ngược">
                {card.tu_khoa.nguoc.map((k) => (
                  <li key={k}>{k}</li>
                ))}
              </ul>
              <p>{card.y_nghia.nguoc}</p>
            </section>
          </div>

          <h2>Theo từng chuyện</h2>
          <dl className="card-topics">
            {TOPICS.map((t) => (
              <div key={t}>
                <dt>{TOPIC_LABELS[t]}</dt>
                <dd>
                  <span className="card-dir">Xuôi</span> {card.chu_de[t].xuoi}
                </dd>
                <dd>
                  <span className="card-dir">Ngược</span> {card.chu_de[t].nguoc}
                </dd>
              </div>
            ))}
          </dl>

          <h2>Lời khuyên</h2>
          <p>
            <span className="card-dir">Xuôi</span> {card.loi_khuyen.xuoi}
          </p>
          <p>
            <span className="card-dir">Ngược</span> {card.loi_khuyen.nguoc}
          </p>
        </div>
      </div>

      {/* lời riêng của Nguyệt trong chính hộp thoại của nàng: thẻ tên, ô chân dung, giọng ta–cậu */}
      <aside className="card-nguyet pixel-frame" aria-label="Nguyệt nói riêng">
        <span className="card-nguyet-name">Nguyệt</span>
        <img className="card-nguyet-face" src={assetUrl("/assets/portrait/nguyet_idle.png")} alt="" />
        <p>{card.nguyet}</p>
      </aside>

      <nav className="card-pager" aria-label="Lá trước, lá sau">
        <Link href={`/la-bai/${prev.slug}`} className="btn-pixel">
          ← {prev.name_vi}
        </Link>
        <Link href={`/la-bai/${next.slug}`} className="btn-pixel">
          {next.name_vi} →
        </Link>
      </nav>
    </PageShell>
  );
}
