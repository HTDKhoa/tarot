"use client";
import dynamic from "next/dynamic";
import { sessionGet, sessionSet, storageGet, storageSet } from "@/lib/storage";
import { EMERGENCY, SUPPORT_LINES } from "@/lib/safety";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Dialogue } from "./Dialogue";
import { TableView } from "./TableView";
import { Notebook, type LogEntry } from "./Notebook";
import { Portrait } from "./Portrait";
import { useMedia } from "@/lib/useMedia";
import { TopBar, type Me } from "./TopBar";
import { sceneStore, useScene } from "@/lib/store";
import { createClient } from "@/lib/supabase/client";
import { SPREADS, type SpreadId } from "@/lib/tarot/spreads";
import { TOPIC_LABELS, type DrawnCard, type ReaderLine, type Topic } from "@/lib/tarot/types";

// Cảnh 3D (hoặc ảnh tĩnh nếu không có WebGL) chỉ chạy ở trình duyệt.
const SceneStage = dynamic(() => import("../scene/SceneStage"), { ssr: false });

type Phase = "menu" | "form" | "picking" | "reading" | "deciding" | "closing" | "summary" | "shuffling" | "done" | "daily" | "crisis" | "message" | "login";
interface Draw { cardId: number; reversed: boolean }
interface Ctx {
  question: string;
  readingId: string | null;
  demo: boolean;
  topic: Topic;
  spread: SpreadId;
  draws: Draw[];
  clarifiers: Draw[];
  clarifiersLeft: number;
}


/** Các bước diễn ra trên mặt bàn: máy tự hạ xuống bàn khi bắt đầu, khách đổi góc được bất cứ lúc nào. */
const TABLE_PHASES: Phase[] = ["shuffling", "picking", "reading", "deciding", "closing", "summary", "daily"];
const toTable = () => sceneStore.set({ stage: "table" });
const toFace = () => {
  if (sceneStore.get().stage === "table") sceneStore.set({ stage: "inside" });
};
/**
 * Một trục dọc duy nhất: mặt Nguyệt ở trên, mặt bàn ở giữa, cuốn sổ ở dưới cùng.
 * Đi xuống: mặt → bàn → mở sổ (điện thoại). Đi lên: gập sổ → mặt Nguyệt.
 */
function verticalStep(dir: "up" | "down", o: { notebookOpen: boolean; docked: boolean; hasNotebook: boolean; setNotebookOpen: (v: boolean) => void }) {
  const onTable = sceneStore.get().stage === "table";
  if (dir === "up") {
    if (onTable && o.notebookOpen && !o.docked) o.setNotebookOpen(false);
    else toFace();
  } else if (!onTable) toTable();
  else if (o.hasNotebook && !o.docked) o.setNotebookOpen(true);
}
/** Cảnh xào bài kéo dài tối thiểu chừng này (bỏ qua khi người dùng chọn giảm chuyển động). */
const SHUFFLE_MS = 1600;
const shuffleTime = (since: number) => {
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return Promise.resolve();
  const left = SHUFFLE_MS - (performance.now() - since);
  return left > 0 ? new Promise((r) => setTimeout(r, left)) : Promise.resolve();
};
/** Vuốt / cuộn bắt đầu trên một nút, ô nhập hay vùng cuộn thì không tính là đổi góc máy. */
const isInteractive = (t: EventTarget | null) => t instanceof Element && !!t.closest("button, a, textarea, input, select, [data-scrollable]");

/** Đã dừng vì khủng hoảng thì khóa trải bài tới hết phiên (đóng tab). */
const CRISIS_KEY = "nguyet_crisis";
const CRISIS_RETURN: ReaderLine[] = [{ tag: "gentle", text: "Đèn vẫn sáng. Hôm nay ta cất bài rồi. Ta chỉ muốn biết cậu đang an toàn." }];

export default function HomeClient() {
  const stage = useScene((s) => s.stage);
  const fade = useScene((s) => s.fade);
  const [me, setMe] = useState<Me | null>(null);
  const [visited, setVisited] = useState(false);
  const [phase, setPhase] = useState<Phase>("menu");
  const [script, setScript] = useState<{ id: number; lines: ReaderLine[] }>({ id: 0, lines: [] });
  const setLines = (lines: ReaderLine[]) => setScript((s) => ({ id: s.id + 1, lines }));
  const [cards, setCards] = useState<DrawnCard[]>([]);
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  // lá Nguyệt đang nói tới: tay chỉ vào, ánh nến thắp
  const [active, setActive] = useState<number | null>(null);
  const [ctx, setCtx] = useState<Ctx | null>(null);
  const [busy, setBusy] = useState(false);
  const [picked, setPicked] = useState<number[]>([]);
  const [pendingLines, setPendingLines] = useState<ReaderLine[]>([]);
  // Tổng kết cuối phiên: nằm ở trang cuối cuốn sổ trên bàn.
  const [recap, setRecap] = useState<{ themes: string[]; advice: string } | null>(null);
  // Cuốn sổ của Bấc: mọi câu Nguyệt nói trong phiên, gắn với lá đang được lật lúc đó.
  const [log, setLog] = useState<LogEntry[]>([]);
  const [notebookOpen, setNotebookOpen] = useState(false);
  const currentCard = useRef<number | null>(null);
  // Câu chào ra về để dành tới lúc máy ngẩng lên mặt Nguyệt.
  const [farewell, setFarewell] = useState<ReaderLine | null>(null);
  // Desktop: sổ nằm mở sẵn bên phải khăn.
  const docked = useMedia("(min-width: 1024px) and (min-aspect-ratio: 4/3)");

  // Máy chủ thiếu cấu hình (production): đóng cửa, không cho vào nhà.
  const [closed, setClosed] = useState(false);
  const [crisisLocked, setCrisisLocked] = useState(false);

  const loadMe = useCallback(async () => {
    const r = await fetch("/api/me", { cache: "no-store" }).catch(() => null);
    if (!r?.ok) {
      setClosed(r?.status === 503);
      return null;
    }
    const j = (await r.json()) as Me;
    setMe(j);
    return j;
  }, []);

  useEffect(() => {
    // Đọc trạng thái đăng nhập và localStorage (chỉ có ở trình duyệt) sau khi mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadMe();
    setVisited(storageGet("nguyet_visited") === "1");
    if (sessionGet(CRISIS_KEY) === "1") {
      setCrisisLocked(true);
      setPhase("crisis");
      setScript((s) => ({ id: s.id + 1, lines: CRISIS_RETURN }));
    }
    const params = new URLSearchParams(location.search);
    if (params.get("vao") === "1") {
      sceneStore.set({ stage: "inside" });
      history.replaceState(null, "", "/");
    }
  }, [loadMe]);

  // vừa vào nhà mà chưa nói gì thì Nguyệt chào
  const greetingNow = stage === "inside" && phase === "menu" && script.lines.length === 0 && me ? me.greeting : null;
  const lines = greetingNow ?? script.lines;

  const enterHouse = (skip = false) => {
    storageSet("nguyet_visited", "1");
    if (skip) {
      sceneStore.set({ fade: 1 });
      setTimeout(() => sceneStore.set({ stage: "inside", fade: 0 }), 450);
      return;
    }
    sceneStore.set({ stage: "door" });
    setTimeout(() => sceneStore.set({ fade: 1 }), 1500);
    setTimeout(() => sceneStore.set({ stage: "inside", fade: 0 }), 2100);
  };

  const leave = () => {
    sceneStore.set({ fade: 1 });
    setTimeout(() => {
      resetTable();
      setLines(crisisLocked ? CRISIS_RETURN : []);
      setPhase(crisisLocked ? "crisis" : "menu");
      sceneStore.set({ stage: "forest", fade: 0, tag: "neutral" });
    }, 450);
  };

  const resetTable = () => {
    setCards([]);
    setRevealed(new Set());
    setActive(null);
    setCtx(null);
    setPicked([]);
    setRecap(null);
    setLog([]);
    setNotebookOpen(false);
    setFarewell(null);
    currentCard.current = null;
  };

  const say = (l: ReaderLine[], next: Phase) => {
    setPhase(next);
    setLines(l);
  };

  const login = async () => {
    const supabase = createClient();
    if (!supabase) return;
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${location.origin}/auth/callback?next=/?vao=1` },
    });
  };

  const startReading = () => {
    if (crisisLocked) return;
    if (me?.configured && !me.user) {
      say([{ tag: "tease", text: "Khoan đã. Muốn ta trải bài thì cậu ghi tên vào sổ khách trước. Ta cần nhớ ai đã ngồi ở bàn này." }], "login");
      return;
    }
    resetTable();
    toFace();
    say([{ tag: "think", text: "Kể ta nghe điều cậu đang băn khoăn. Viết thật lòng, càng cụ thể ta càng đọc rõ." }], "form");
  };

  const submitQuestion = async (question: string, topic: Topic, spread: SpreadId) => {
    setBusy(true);
    setLines([]);
    // Bấm "Xào bài" thì máy hạ xuống bàn ngay, Nguyệt xào bài trong lúc chờ máy chủ rút lá.
    toTable();
    // form gập lại, hộp thoại báo Nguyệt đang xào bài trong lúc hai tay xào trên bàn
    setPhase("shuffling");
    const startedAt = performance.now();
    try {
      const r = await fetch("/api/reading", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ question, topic, spread }) });
      const j = await r.json().catch(() => ({}));
      if (j.crisis) {
        // Khủng hoảng luôn ở góc mặt đối mặt.
        toFace();
        sessionSet(CRISIS_KEY, "1");
        setCrisisLocked(true);
        resetTable();
        return say(j.lines, "crisis");
      }
      if (!r.ok) toFace();
      // nghi thức: Nguyệt xào bài ít nhất một lúc rồi mới trải dải bài, kể cả khi máy chủ trả rất nhanh
      if (r.ok) await shuffleTime(startedAt);
      if (r.status === 401) return say([{ tag: "tease", text: j.error }], "login");
      if (j.error === "quota") return say([{ tag: "concern", text: j.message }], "message");
      if (!r.ok) return say([{ tag: "concern", text: j.error ?? "Có gì đó trục trặc. Cậu thử lại nhé." }], "message");
      setCtx({ question, readingId: j.readingId, demo: j.demo, topic, spread, draws: j.draws ?? [], clarifiers: [], clarifiersLeft: j.clarifiersLeft });
      setCards(j.cards);
      setPendingLines(j.lines);
      setPicked([]);
      say([{ tag: "shuffle", text: `Ta xào xong rồi. Cậu chọn ${j.cards.length === 1 ? "một lá" : `${j.cards.length} lá`} trong dải bài này, theo cảm giác của cậu.` }], "picking");
      loadMe();
    } catch {
      // mất mạng giữa chừng: ngẩng lên, Nguyệt báo và cho quay lại
      toFace();
      say([{ tag: "concern", text: "Có gì đó trục trặc. Cậu thử lại nhé." }], "message");
    } finally {
      setBusy(false);
    }
  };

  const pickFromFan = (i: number) => {
    if (picked.includes(i) || picked.length >= cards.length) return;
    const next = [...picked, i];
    setPicked(next);
    if (next.length === cards.length) setTimeout(() => say(pendingLines, "reading"), 500);
  };

  const onLine = (line: ReaderLine, index: number) => {
    if (line.revealPosition !== undefined) {
      const pos = line.revealPosition === -1 ? cards.length - 1 : line.revealPosition;
      setRevealed((s) => new Set(s).add(pos));
      setActive(pos);
      currentCard.current = pos;
    }
    // ghi vào sổ mọi câu của phiên trải bài (không ghi lá của ngày)
    if (ctx && phase !== "daily") {
      const key = `${script.id}:${index}`;
      const entry: LogEntry = { key, line, card: currentCard.current };
      setLog((l) => (l.some((e) => e.key === key) ? l : [...l, entry]));
    }
  };

  const onDone = () => {
    if (phase === "reading") setPhase("deciding");
    if (phase === "closing") {
      // gom xong thì sổ mở tới trang tổng kết; khách đọc xong mới ngẩng lên
      setPhase("summary");
      setNotebookOpen(true);
    }
  };

  const clarify = async () => {
    if (!ctx) return;
    setBusy(true);
    try {
      const r = await fetch("/api/reading/clarify", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ readingId: ctx.readingId, demo: ctx.demo ? { topic: ctx.topic, spread: ctx.spread, draws: ctx.draws, clarifiers: ctx.clarifiers } : undefined }),
      });
      const j = await r.json();
      if (!r.ok) return say([{ tag: "concern", text: j.error ?? "Có gì đó trục trặc." }], "deciding");
      setCards((c) => [...c, j.card]);
      setCtx({ ...ctx, clarifiers: j.draw ? [...ctx.clarifiers, j.draw] : [...ctx.clarifiers, { cardId: j.card.card.id, reversed: j.card.reversed }], clarifiersLeft: j.clarifiersLeft });
      say(j.lines, "reading");
    } finally {
      setBusy(false);
    }
  };

  const finish = async () => {
    if (!ctx) return;
    setBusy(true);
    setLines([]);
    try {
      const r = await fetch("/api/reading/finish", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ readingId: ctx.readingId, demo: ctx.demo ? { topic: ctx.topic, draws: ctx.draws, clarifiers: ctx.clarifiers } : undefined }),
      });
      const j = await r.json();
      if (!r.ok) return say([{ tag: "concern", text: j.error ?? "Có gì đó trục trặc." }], "done");
      setRecap({ themes: j.themes ?? [], advice: j.advice ?? "" });
      // phần gom nói trên bàn; câu chào ra về để dành tới lúc ngẩng lên
      const all = j.lines as ReaderLine[];
      const last = all.at(-1);
      const bye = last?.tag === "farewell" ? last : null;
      setFarewell(bye);
      currentCard.current = null;
      say(bye ? all.slice(0, -1) : all, "closing");
    } finally {
      setBusy(false);
    }
  };

  const daily = async () => {
    if (crisisLocked) return;
    resetTable();
    setBusy(true);
    setLines([]);
    toTable();
    try {
      const j = await (await fetch("/api/daily", { cache: "no-store" })).json();
      setCards([j.card]);
      say(j.lines, "daily");
    } finally {
      setBusy(false);
    }
  };

  const backToMenu = () => {
    resetTable();
    toFace();
    say([{ tag: "neutral", text: "Còn điều gì khác không?" }], "menu");
  };

  // Đổi góc máy: nút luôn hiện, vuốt dọc trên cảnh, bánh xe chuột, phím ↑/↓.
  const canToggle = TABLE_PHASES.includes(phase) || (phase === "done" && cards.length > 0);
  const onTable = stage === "table";
  const touchY = useRef<number | null>(null);
  const lastWheel = useRef(0);
  const hasNotebook = !!ctx && phase !== "daily";
  useEffect(() => {
    if (!canToggle) return;
    const nav = { notebookOpen, docked, hasNotebook, setNotebookOpen };
    const onKey = (e: KeyboardEvent) => {
      if (isInteractive(e.target) && !(e.target instanceof HTMLButtonElement)) return;
      if (e.key === "ArrowUp") verticalStep("up", nav);
      if (e.key === "ArrowDown") verticalStep("down", nav);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [canToggle, notebookOpen, docked, hasNotebook]);
  // Sổ nằm mở bên phải (desktop): camera lệch phải nửa bề rộng cột sổ, để vòng đọc bài nằm giữa phần bàn còn lại.
  useEffect(() => {
    const update = () => {
      const vw = window.innerWidth;
      const col = Math.min(vw * 0.3, 360) + 24;
      sceneStore.set({ shiftX: docked && hasNotebook ? col / 2 / vw : 0 });
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [docked, hasNotebook]);
  const nav = { notebookOpen, docked, hasNotebook, setNotebookOpen };
  const gestures = canToggle
    ? {
        onTouchStart: (e: React.TouchEvent) => {
          touchY.current = isInteractive(e.target) ? null : e.touches[0].clientY;
        },
        onTouchEnd: (e: React.TouchEvent) => {
          if (touchY.current === null) return;
          const dy = e.changedTouches[0].clientY - touchY.current;
          touchY.current = null;
          // vuốt lên (ngón tay đi lên) thì đi lên trục: gập sổ / nhìn Nguyệt; vuốt xuống thì xuống bàn / mở sổ
          if (dy < -60) verticalStep("up", nav);
          else if (dy > 60) verticalStep("down", nav);
        },
        onWheel: (e: React.WheelEvent) => {
          if (isInteractive(e.target) || Math.abs(e.deltaY) < 30) return;
          const now = performance.now();
          if (now - lastWheel.current < 700) return;
          lastWheel.current = now;
          verticalStep(e.deltaY < 0 ? "up" : "down", nav);
        },
      }
    : {};

  const quotaText = me?.status ? `${Math.max(0, me.status.limit - me.status.used)}/${me.status.limit} lượt tháng này` : null;

  return (
    <main className="stage-root" {...gestures}>
      <div className="stage-canvas">
        <SceneStage />
      </div>
      <div className="stage-fade" style={{ opacity: fade }} />
      <TopBar me={me} onLogin={login} />
      {canToggle && (
        <button type="button" className="shot-toggle" onClick={onTable ? toFace : toTable} aria-keyshortcuts={onTable ? "ArrowUp" : "ArrowDown"}>
          {onTable ? "▲ Nhìn Nguyệt" : "▼ Xem bàn"}
        </button>
      )}

      {stage === "forest" && (
        <section className="forest-hero">
          <h1 className="title-pixel">Ngôi Nhà Trong Rừng</h1>
          <p className="hero-sub">Có một ngọn đèn không bao giờ tắt ở cuối lối mòn. Người giữ đèn đọc bài tarot cho những ai mang theo một câu hỏi.</p>
          {closed ? (
            <p className="hero-closed" role="status">Ngôi nhà đang tạm đóng cửa để sửa sang. Cậu quay lại sau nhé.</p>
          ) : (
            <div className="hero-actions">
              <button className="btn-pixel btn-gold" onClick={() => enterHouse(false)}>Đi theo lối mòn</button>
              {visited && (
                <button className="btn-pixel" onClick={() => enterHouse(true)}>Vào thẳng trong nhà</button>
              )}
            </div>
          )}
          <p className="hero-note">
            Dành cho giải trí và tự chiêm nghiệm, không thay thế lời khuyên y tế, pháp lý hay tài chính. <Link href="/dieu-khoan">Điều khoản</Link> · <Link href="/rieng-tu">Quyền riêng tư</Link>
          </p>
        </section>
      )}

      {(stage === "inside" || onTable) && (
        <div className={`play-zone ${onTable ? "is-table" : ""}`}>
          {onTable && (
            <TableView
              spread={phase === "daily" ? "daily" : (ctx?.spread ?? "one")}
              cards={cards}
              revealed={revealed}
              active={active}
              shuffling={busy && cards.length === 0}
              picking={phase === "picking"}
              picked={picked}
              onPick={pickFromFan}
              docked={docked && hasNotebook}
            >
              {hasNotebook && ctx && (
                <Notebook
                  question={ctx.question}
                  cards={cards}
                  log={log}
                  recap={recap}
                  open={notebookOpen}
                  docked={docked}
                  toRecap={phase === "summary"}
                  onOpenChange={setNotebookOpen}
                />
              )}
            </TableView>
          )}

          {phase === "crisis" && <SupportCard onLeave={leave} />}

          <div className="dialogue-zone">
            {phase === "form" ? (
              <QuestionForm onSubmit={submitQuestion} onCancel={backToMenu} busy={busy} />
            ) : (
              <Dialogue key={greetingNow ? "greet" : script.id} lines={lines} onLine={onLine} onDone={onDone} busy={busy} portrait={onTable ? <Portrait /> : undefined}>
                {phase === "menu" && (
                  <>
                    <button className="btn-pixel btn-gold" onClick={startReading}>Trải bài</button>
                    <button className="btn-pixel" onClick={daily}>Lá bài của ngày</button>
                    {me?.user && <Link className="btn-pixel" href="/nhat-ky">Nhật ký</Link>}
                    <button className="btn-pixel btn-ghost" onClick={leave}>Ra về</button>
                    {quotaText && <span className="quota-chip">{quotaText}</span>}
                  </>
                )}
                {phase === "login" && (
                  <>
                    {me?.configured ? <button className="btn-pixel btn-gold" onClick={login}>Ghi tên bằng Google</button> : <span className="hint">Chưa cấu hình đăng nhập (chế độ demo).</span>}
                    <button className="btn-pixel btn-ghost" onClick={backToMenu}>Để sau</button>
                  </>
                )}
                {phase === "deciding" && ctx && (
                  <>
                    {ctx.clarifiersLeft > 0 && (
                      <button className="btn-pixel" onClick={clarify} disabled={busy}>Rút thêm một lá ({ctx.clarifiersLeft})</button>
                    )}
                    <button className="btn-pixel btn-gold" onClick={finish} disabled={busy}>Nói đi, ta nghe</button>
                  </>
                )}
                {phase === "summary" && (
                  <button
                    className="btn-pixel btn-gold"
                    onClick={() => {
                      // đọc xong trang tổng kết thì máy ngẩng lên, Nguyệt chào mặt đối mặt
                      setNotebookOpen(false);
                      toFace();
                      say([farewell ?? { tag: "farewell", text: "Đường về vẫn sáng. Ta để đèn chờ." }], "done");
                    }}
                  >
                    Gập sổ, ngẩng lên
                  </button>
                )}
                {phase === "done" && (
                  <>
                    <button className="btn-pixel btn-gold" onClick={startReading}>Hỏi điều khác</button>
                    {me?.user && <Link className="btn-pixel" href="/nhat-ky">Xem nhật ký</Link>}
                    <button className="btn-pixel btn-ghost" onClick={leave}>Ra về</button>
                  </>
                )}
                {phase === "daily" && (
                  <>
                    <button className="btn-pixel btn-gold" onClick={startReading}>Trải bài sâu hơn</button>
                    <button className="btn-pixel btn-ghost" onClick={backToMenu}>Quay lại</button>
                  </>
                )}
                {phase === "message" && (
                  <>
                    <Link className="btn-pixel btn-gold" href="/goi">Xem các gói</Link>
                    <button className="btn-pixel btn-ghost" onClick={backToMenu}>Quay lại</button>
                  </>
                )}
              </Dialogue>
            )}
          </div>
        </div>
      )}
    </main>
  );
}

/** Thẻ hỗ trợ khi khủng hoảng: hiện ngay, cố định, chỉ có một lối ra là "Ra về". */
function SupportCard({ onLeave }: { onLeave: () => void }) {
  return (
    <section className="support-card pixel-frame" role="alert" aria-label="Hỗ trợ khẩn cấp">
      <p>
        Nếu cậu đang gặp nguy hiểm, hãy gọi <a href={`tel:${EMERGENCY.number}`}>{EMERGENCY.label.toLowerCase()} {EMERGENCY.number}</a> hoặc tới cơ sở y tế gần nhất. Hãy nói chuyện với một người cậu tin tưởng ngay lúc này.
      </p>
      {SUPPORT_LINES.length > 0 && (
        <ul className="support-lines">
          {SUPPORT_LINES.map((l) => (
            <li key={l.number}>
              {l.label}: <a href={`tel:${l.number}`}>{l.number}</a>
              {l.hours && ` (${l.hours})`}
            </li>
          ))}
        </ul>
      )}
      <button className="btn-pixel btn-ghost" onClick={onLeave}>Ra về</button>
    </section>
  );
}

function QuestionForm({ onSubmit, onCancel, busy }: { onSubmit: (q: string, t: Topic, s: SpreadId) => void; onCancel: () => void; busy: boolean }) {
  const [q, setQ] = useState("");
  const [topic, setTopic] = useState<Topic>("ban_than");
  const [spread, setSpread] = useState<SpreadId>("past_present_path");
  const topics = useMemo(() => Object.entries(TOPIC_LABELS) as [Topic, string][], []);
  return (
    <form
      className="dialogue pixel-frame question-form"
      onSubmit={(e) => {
        e.preventDefault();
        if (q.trim().length >= 3 && !busy) onSubmit(q.trim(), topic, spread);
      }}
    >
      <div className="dialogue-name">Câu hỏi của cậu</div>
      <textarea
        value={q}
        onChange={(e) => setQ(e.target.value)}
        maxLength={500}
        rows={3}
        placeholder="Ví dụ: Mình có nên nhận lời chuyển sang công việc mới không?"
        autoFocus
        aria-label="Câu hỏi"
      />
      <div className="chip-row" role="radiogroup" aria-label="Chủ đề">
        {topics.map(([k, label]) => (
          <button key={k} type="button" role="radio" aria-checked={topic === k} className={`chip ${topic === k ? "is-on" : ""}`} onClick={() => setTopic(k)}>
            {label}
          </button>
        ))}
      </div>
      <div className="chip-row" role="radiogroup" aria-label="Kiểu trải bài">
        {Object.values(SPREADS).map((s) => (
          <button key={s.id} type="button" role="radio" aria-checked={spread === s.id} className={`chip ${spread === s.id ? "is-on" : ""}`} onClick={() => setSpread(s.id)} title={s.description}>
            {s.name}
          </button>
        ))}
      </div>
      <div className="dialogue-actions">
        <button className="btn-pixel btn-gold" type="submit" disabled={busy || q.trim().length < 3}>{busy ? "Đang xào bài…" : "Xào bài"}</button>
        <button className="btn-pixel btn-ghost" type="button" onClick={onCancel}>Thôi</button>
        <span className="hint">{q.length}/500</span>
      </div>
    </form>
  );
}
