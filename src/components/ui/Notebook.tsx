"use client";
import { useEffect, useRef } from "react";
import { assetUrl } from "@/lib/assets";
import type { DrawnCard, ReaderLine } from "@/lib/tarot/types";
import type { SpreadId } from "@/lib/tarot/spreads";

/** Một dòng Nguyệt đã nói, gắn với lá đang được lật lúc đó (null: lời mở đầu hoặc gom lại). */
export interface LogEntry {
  key: string;
  line: ReaderLine;
  card: number | null;
}

interface Props {
  question: string;
  cards: DrawnCard[];
  log: LogEntry[];
  recap: { themes: string[]; advice: string } | null;
  open: boolean;
  /** desktop: sổ nằm mở sẵn bên phải khăn */
  docked: boolean;
  /** mở tới trang tổng kết (khi gom xong) */
  toRecap: boolean;
  onOpenChange: (open: boolean) => void;
  /** kiểu trải, để trang tổng kết vẽ lại đúng hình trải */
  spread?: SpreadId;
}

/** cuộn mượt, trừ khi người dùng chọn giảm chuyển động */
const smooth = (): ScrollBehavior => (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth");

const cardTitle = (c: DrawnCard) => `${c.positionLabel} · ${c.card.name_en}${c.reversed ? " (ngược)" : ""}`;

/** Câu lật lá mở đầu bằng "Vị trí: Tên lá." đã có ở đề mục ngay trên, nên bỏ phần đó cho khỏi lặp. */
const withoutTitle = (text: string) => text.replace(/^[^:.]+: [^.]+\.\s*/, "");

/** "Còn đây là ý riêng của ta." đã thành nhãn của khối ý riêng trong sổ. */
const OPINION_OPEN = /^Còn đây là ý riêng của ta\.\s*/;

/** Lá vẽ nhỏ trong sổ: khung lá và biểu tượng chất (hoặc ngôi sao Ẩn Chính), lá ngược thì lộn ngược. */
function MiniCard({ c }: { c: DrawnCard }) {
  const icon = assetUrl(c.card.arcana === "major" ? "/assets/cards/major_star.png" : `/assets/cards/suit_${c.card.suit}.png`);
  return (
    <span className={`nb-card ${c.reversed ? "is-reversed" : ""}`} style={{ backgroundImage: `url("${assetUrl("/assets/cards/card_mini.png")}")` }} aria-hidden>
      <img src={icon} alt="" />
    </span>
  );
}

/** Đầu mục của một lá: lá vẽ nhỏ, vị trí, tên, dấu "ngược". */
function CardHead({ c }: { c: DrawnCard }) {
  return (
    <div className="nb-head">
      <MiniCard c={c} />
      <h4>
        <span className="nb-pos">{c.positionLabel}</span>
        <span className="nb-name">{c.card.name_en}</span>
        {c.reversed && <span className="nb-rev">ngược</span>}
      </h4>
    </div>
  );
}

/** Đêm hôm nay, như Bấc ghi đầu trang. */
const tonight = () => {
  const d = new Date();
  return `Đêm ${d.getDate()} tháng ${d.getMonth() + 1}`;
};

/** Câu đầu tiên trong lời Nguyệt về một lá, cho trang tổng kết. */
function firstSentence(entries: LogEntry[]) {
  const said = (entries.find((e) => e.line.kind === "meaning") ?? entries.find((e) => e.line.tag !== "reveal"))?.line.text ?? "";
  const m = said.match(/^.*?[.!?…](\s|$)/);
  return (m ? m[0] : said).trim();
}

/** Cuốn sổ của Bấc trên bàn: câu hỏi, lời Nguyệt theo từng lá, và trang tổng kết. Chữ thật, đọc được bằng trình đọc màn hình. */
export function Notebook({ question, cards, log, recap, open, docked, toRecap, onOpenChange, spread }: Props) {
  const panel = useRef<HTMLDivElement>(null);
  const recapRef = useRef<HTMLElement>(null);
  const peekRef = useRef<HTMLButtonElement>(null);
  const shown = open || docked;

  // mở sổ thì đưa focus vào sổ; gom xong thì lật tới trang tổng kết
  useEffect(() => {
    if (!shown) return;
    if (toRecap && recapRef.current) recapRef.current.scrollIntoView({ block: "start", behavior: smooth() });
    else if (!docked) panel.current?.querySelector<HTMLElement>("h2")?.focus();
  }, [shown, toRecap, docked]);

  // sổ mở trên điện thoại: Esc để gập
  useEffect(() => {
    if (!open || docked) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onOpenChange(false);
        peekRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, docked, onOpenChange]);

  // có câu mới thì cuộn trang tới đó: giữ đề mục của lá đang nói trong tầm nhìn nếu vừa trang,
  // còn không thì ưu tiên câu mới nhất (sổ ghim trên desktop thấp hơn sổ mở trên điện thoại)
  const pageRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const page = pageRef.current;
    if (!shown || toRecap || !page) return;
    const entries = page.querySelectorAll<HTMLElement>("[data-entry]");
    const last = entries[entries.length - 1];
    if (!last) return;
    const heads = page.querySelectorAll<HTMLElement>(".nb-head");
    const head = heads[heads.length - 1];
    const lastBottom = last.offsetTop + last.offsetHeight;
    const headTop = head && head.offsetTop <= last.offsetTop ? head.offsetTop : last.offsetTop;
    const top = Math.max(headTop - 8, lastBottom - page.clientHeight + 12);
    if (top > page.scrollTop) page.scrollTo({ top, behavior: smooth() });
  }, [log.length, shown, toRecap]);

  const byCard = (i: number) => log.filter((e) => e.card === i);

  return (
    <>
      {!docked && !open && (
        <button
          ref={peekRef}
          type="button"
          className="notebook-peek"
          aria-expanded={false}
          aria-controls="so-cua-bac"
          onClick={() => onOpenChange(true)}
        >
          <img className="notebook-cover" src={assetUrl("/assets/table/book.png")} alt="" />
          {/* trang đầu thò ra từ dưới bìa: luôn ghi câu hỏi của khách */}
          <span className="notebook-edge">
            <span className="notebook-edge-text">Cậu hỏi: {question}</span>
          </span>
          <span className="sr-only">Mở sổ</span>
        </button>
      )}
      {shown && (
        <div
          id="so-cua-bac"
          ref={panel}
          className={`notebook ${docked ? "is-docked" : "is-open"}`}
          role="region"
          aria-label="Sổ của Bấc"
          // khung giấy đi qua assetUrl để bản demo một file vẫn có ảnh
          style={{ borderImageSource: `url("${assetUrl("/assets/table/book_frame.png")}")` }}
        >
          <div className="notebook-head">
            <img className="nb-owl" src={assetUrl("/assets/characters/owl_idle_0.png")} alt="" />
            <h2 tabIndex={-1}>
              Sổ của Bấc
              <span className="nb-date">{tonight()}</span>
            </h2>
            {!docked && (
              <button
                type="button"
                className="notebook-close"
                onClick={() => {
                  onOpenChange(false);
                  requestAnimationFrame(() => peekRef.current?.focus());
                }}
              >
                Gập sổ
              </button>
            )}
          </div>
          <div ref={pageRef} className="notebook-page" data-scrollable>
            <section className="nb-ask">
              <h3>Cậu hỏi</h3>
              <p className="notebook-question">{question}</p>
            </section>
            {/* chưa có câu nào (đang xào bài) thì chưa mở mục này, tránh một tiêu đề trống */}
            {log.length > 0 && (
              <section>
                <h3>Lời Nguyệt</h3>
                {log.map((e) => {
                  const k = e.line.kind;
                  if (e.line.revealPosition !== undefined && e.card !== null && cards[e.card]) {
                    return (
                      <div key={e.key} data-entry className="nb-entry">
                        <CardHead c={cards[e.card]} />
                        {withoutTitle(e.line.text) && <p className="nb-image">{withoutTitle(e.line.text)}</p>}
                      </div>
                    );
                  }
                  if (k === "opinion") {
                    const first = OPINION_OPEN.test(e.line.text);
                    return (
                      <p key={e.key} data-entry className={`nb-opinion ${first ? "is-first" : ""}`}>
                        {first && <span className="nb-opinion-label">Nguyệt nói riêng</span>}
                        {e.line.text.replace(OPINION_OPEN, "")}
                      </p>
                    );
                  }
                  return (
                    <p key={e.key} data-entry className={k === "image" ? "nb-image" : k === "meaning" ? undefined : "nb-aside"}>
                      {e.line.text}
                    </p>
                  );
                })}
              </section>
            )}
            {recap && (
              <section ref={recapRef} className="notebook-recap" aria-label="Trang tổng kết">
                <h3>Bàn hôm nay</h3>
                {/* lời dặn đứng đầu trang: điều khách mang về, thấy ngay không cần cuộn */}
                {recap.advice && (
                  <div className="notebook-advice">
                    <b>Lời dặn</b>
                    <p>{recap.advice}</p>
                  </div>
                )}
                {/* hình trải vẽ lại bằng lá nhỏ, đúng hình trên bàn; lá làm rõ thành một hàng nhỏ phía dưới */}
                <div className={`nb-spread ${spread === "situation_obstacle_advice" ? "is-triangle" : ""}`} aria-hidden>
                  {cards
                    .filter((c) => !c.clarifier)
                    .map((c, i) => (
                      <span key={`${c.card.id}-${i}`} className="nb-spread-slot">
                        <MiniCard c={c} />
                        <span className="nb-pos">{c.positionLabel}</span>
                      </span>
                    ))}
                </div>
                {cards.some((c) => c.clarifier) && (
                  <div className="nb-spread is-clarifiers" aria-hidden>
                    {cards
                      .filter((c) => c.clarifier)
                      .map((c, i) => (
                        <span key={`${c.card.id}-${i}`} className="nb-spread-slot">
                          <MiniCard c={c} />
                        </span>
                      ))}
                  </div>
                )}
                <ul>
                  {cards.map((c, i) => (
                    <li key={`${c.card.id}-${i}`}>
                      <b>{cardTitle(c)}</b>
                      {firstSentence(byCard(i)) && <span> {firstSentence(byCard(i))}</span>}
                    </li>
                  ))}
                </ul>
                {recap.themes.length > 0 && (
                  <div className="nb-themes">
                    <b>Các lá nói về</b>
                    <span className="nb-stamps">
                      {recap.themes.map((t) => (
                        <span key={t} className="nb-stamp">
                          {t}
                        </span>
                      ))}
                    </span>
                  </div>
                )}
              </section>
            )}
          </div>
        </div>
      )}
    </>
  );
}
