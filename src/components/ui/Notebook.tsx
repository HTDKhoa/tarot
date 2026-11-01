"use client";
import { useEffect, useRef } from "react";
import { assetUrl } from "@/lib/assets";
import type { DrawnCard, ReaderLine } from "@/lib/tarot/types";

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
  /** đang đọc lá nào (để mép trang thò ra ghi đúng lá đó) */
  active: number | null;
  open: boolean;
  /** desktop: sổ nằm mở sẵn bên phải khăn */
  docked: boolean;
  /** mở tới trang tổng kết (khi gom xong) */
  toRecap: boolean;
  onOpenChange: (open: boolean) => void;
}

const cardTitle = (c: DrawnCard) => `${c.positionLabel} · ${c.card.name_en}${c.reversed ? " (ngược)" : ""}`;

/** Câu lật lá mở đầu bằng "Vị trí: Tên lá." đã có ở đề mục ngay trên, nên bỏ phần đó cho khỏi lặp. */
const withoutTitle = (text: string) => text.replace(/^[^:.]+: [^.]+\.\s*/, "");

/** Câu đầu tiên trong lời Nguyệt về một lá, cho trang tổng kết. */
function firstSentence(entries: LogEntry[]) {
  const said = entries.find((e) => e.line.tag !== "reveal")?.line.text ?? "";
  const m = said.match(/^.*?[.!?…](\s|$)/);
  return (m ? m[0] : said).trim();
}

/** Cuốn sổ của Bấc trên bàn: câu hỏi, lời Nguyệt theo từng lá, và trang tổng kết. Chữ thật, đọc được bằng trình đọc màn hình. */
export function Notebook({ question, cards, log, recap, active, open, docked, toRecap, onOpenChange }: Props) {
  const panel = useRef<HTMLDivElement>(null);
  const recapRef = useRef<HTMLElement>(null);
  const peekRef = useRef<HTMLButtonElement>(null);
  const shown = open || docked;

  // mở sổ thì đưa focus vào sổ; gom xong thì lật tới trang tổng kết
  useEffect(() => {
    if (!shown) return;
    if (toRecap && recapRef.current) recapRef.current.scrollIntoView({ block: "start", behavior: "smooth" });
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

  const activeCard = active !== null ? cards[active] : null;
  const peekText = activeCard ? `Đang đọc: ${cardTitle(activeCard)}` : `Cậu hỏi: ${question}`;
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
          <span className="notebook-edge">{peekText}</span>
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
          style={{ borderImageSource: `url("${assetUrl("/assets/table/page_frame.png")}")` }}
        >
          <div className="notebook-head">
            <h2 tabIndex={-1}>Sổ của Bấc</h2>
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
          <div className="notebook-page" data-scrollable>
            <section>
              <h3>Cậu hỏi</h3>
              <p className="notebook-question">{question}</p>
            </section>
            <section>
              <h3>Lời Nguyệt</h3>
              {log.map((e) =>
                e.line.revealPosition !== undefined && e.card !== null && cards[e.card] ? (
                  <div key={e.key}>
                    <h4>{cardTitle(cards[e.card])}</h4>
                    {withoutTitle(e.line.text) && <p>{withoutTitle(e.line.text)}</p>}
                  </div>
                ) : (
                  <p key={e.key}>{e.line.text}</p>
                ),
              )}
            </section>
            {recap && (
              <section ref={recapRef} className="notebook-recap" aria-label="Trang tổng kết">
                <h3>Bàn hôm nay</h3>
                <ul>
                  {cards.map((c, i) => (
                    <li key={`${c.card.id}-${i}`}>
                      <b>{cardTitle(c)}</b>
                      {firstSentence(byCard(i)) && <span> {firstSentence(byCard(i))}</span>}
                    </li>
                  ))}
                </ul>
                {recap.themes.length > 0 && (
                  <p>
                    <b>Các lá nói về</b> {recap.themes.join(" · ")}
                  </p>
                )}
                {recap.advice && (
                  <p className="notebook-advice">
                    <b>Lời dặn</b> {recap.advice}
                  </p>
                )}
              </section>
            )}
          </div>
        </div>
      )}
    </>
  );
}
