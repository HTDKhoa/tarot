"use client";
import dynamic from "next/dynamic";
import { sessionGet, sessionSet, storageGet, storageSet } from "@/lib/storage";
import { EMERGENCY, SUPPORT_LINES, isCrisis } from "@/lib/safety";
import { captureFlight } from "@/lib/cardFlight";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Dialogue } from "./Dialogue";
import { TableView } from "./TableView";
import { Notebook, type LogEntry } from "./Notebook";
import { Portrait } from "./Portrait";
import { useMedia } from "@/lib/useMedia";
import { TopBar, type Me } from "./TopBar";
import { sceneStore, useScene } from "@/lib/store";
import { createClient } from "@/lib/supabase/client";
import type { SpreadId } from "@/lib/tarot/spreads";
import type { DrawnCard, ReaderLine, Topic } from "@/lib/tarot/types";

// Cảnh 3D (hoặc ảnh tĩnh nếu không có WebGL) chỉ chạy ở trình duyệt.
const SceneStage = dynamic(() => import("../scene/SceneStage"), { ssr: false });

type Phase = "menu" | "form" | "picking" | "reading" | "deciding" | "closing" | "summary" | "shuffling" | "done" | "daily" | "crisis" | "message" | "quota" | "login";
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

/** Thời gian lớp đen mờ vào/ra (khớp transition của .stage-fade). */
const FADE_MS = 550;

interface PendingLines {
  lines: ReaderLine[] | null;
  failed: boolean;
  wait: Promise<void>;
}

/** Theo dõi lời đọc đang tới: biết ngay đã có chưa, và chờ được khi cần. */
function pendingFrom(part: Promise<{ lines?: ReaderLine[] }>): PendingLines {
  const p: PendingLines = { lines: null, failed: false, wait: Promise.resolve() };
  p.wait = part.then(
    (x) => {
      if (Array.isArray(x.lines)) p.lines = x.lines;
      else p.failed = true;
    },
    () => {
      p.failed = true;
    },
  );
  return p;
}

/** Đọc phản hồi NDJSON từng dòng: mỗi lần gọi trả về đối tượng JSON kế tiếp. */
function ndjsonReader(body: ReadableStream<Uint8Array>) {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buf = "";
  return async function next() {
    for (;;) {
      const i = buf.indexOf("\n");
      if (i >= 0) {
        const line = buf.slice(0, i);
        buf = buf.slice(i + 1);
        return JSON.parse(line);
      }
      const { value, done } = await reader.read();
      if (done) throw new Error("hết dữ liệu");
      buf += decoder.decode(value, { stream: true });
    }
  };
}

/** Đã dừng vì khủng hoảng thì khóa trải bài tới hết phiên (đóng tab). */
const CRISIS_KEY = "nguyet_crisis";
const CRISIS_RETURN: ReaderLine[] = [{ tag: "gentle", text: "Đèn vẫn sáng. Hôm nay ta cất bài rồi. Ta chỉ muốn biết cậu đang an toàn." }];
/** Lời mời viết câu hỏi: Nguyệt nói câu này ngay trên ô nhập, form không thay giọng của nàng bằng tiêu đề. */
const FORM_INVITE = "Kể ta nghe điều cậu đang băn khoăn. Viết thật lòng, càng cụ thể ta càng đọc rõ. Trải mấy lá, để ta lo.";
/** Lời báo lỗi: nói cái gì chưa xong, lỗi ở phía ai, và bước tiếp theo. Không hứa điều máy không biết chắc. */
const FAIL = {
  askNetwork: "Ta chưa xào được bài. Đường tới đây vừa chập chờn. Câu hỏi ta vẫn giữ, cậu hỏi lại nhé.",
  askServer: "Ta chưa xào được bài. Trục trặc ở phía ta, không phải do cậu. Câu hỏi ta vẫn giữ, cậu hỏi lại nhé.",
  daily: "Ta chưa lấy được lá của hôm nay, đường tới đây vừa chập chờn. Cậu thử lại nhé.",
  clarify: "Lá làm rõ chưa rút được, đường tới đây vừa chập chờn. Cậu rút lại, hoặc để ta gom lại cũng được.",
  finish: "Ta chưa gom lại được, đường tới đây vừa chập chờn. Bài vẫn nằm nguyên trên bàn, cậu bấm lại nhé.",
};
/** "Ngồi thêm một lúc": Nguyệt ở lại bầu bạn, không bài, không khuyên; lần lượt từng câu. */
const CRISIS_STAY: ReaderLine[] = [
  { tag: "gentle", text: "Ừ, ngồi đi. Ta không cất đèn đâu." },
  { tag: "gentle", text: "Không cần nói gì cũng được. Ta vẫn ngồi đây với cậu." },
  { tag: "gentle", text: "Nếu thấy nặng quá, gọi cho một người cậu tin. Ta vẫn ở đây khi cậu quay lại." },
];

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
  // lời đọc của bàn đang trải: máy chủ gửi sau lá bài (trong lúc khách chọn lá), nên có thể chưa tới khi chọn xong
  const readingLines = useRef<PendingLines | null>(null);
  // Tổng kết cuối phiên: nằm ở trang cuối cuốn sổ trên bàn.
  const [recap, setRecap] = useState<{ themes: string[]; advice: string } | null>(null);
  // Cuốn sổ của Bấc: mọi câu Nguyệt nói trong phiên, gắn với lá đang được lật lúc đó.
  const [log, setLog] = useState<LogEntry[]>([]);
  const [notebookOpen, setNotebookOpen] = useState(false);
  const currentCard = useRef<number | null>(null);
  // Câu chào ra về để dành tới lúc máy ngẩng lên mặt Nguyệt.
  const [farewell, setFarewell] = useState<ReaderLine | null>(null);
  // câu hỏi vừa gửi, để sổ đã ghi được câu hỏi ngay trong lúc xào bài (trước khi máy chủ trả lá)
  const [askedQuestion, setAskedQuestion] = useState("");
  const [lastAsk, setLastAsk] = useState<string | null>(null);
  // chỉ điền sẵn form khi "Hỏi lại" sau lỗi; "Trải bài", "Hỏi điều khác" luôn mở form trống
  const [prefill, setPrefill] = useState<string | null>(null);
  // lỗi vừa rồi đến từ đâu, để nút "thử lại" làm đúng việc đó
  const [retry, setRetry] = useState<"ask" | "daily" | null>(null);
  // Desktop: sổ nằm mở sẵn bên phải khăn.
  const docked = useMedia("(min-width: 1024px) and (min-aspect-ratio: 4/3)");

  // Máy chủ thiếu cấu hình (production): đóng cửa, không cho vào nhà.
  const [closed, setClosed] = useState(false);
  const [crisisLocked, setCrisisLocked] = useState(false);
  const [stayIndex, setStayIndex] = useState(0);

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
    // giảm chuyển động: bỏ cảnh máy tiến tới cửa, chỉ mờ đen rồi vào nhà
    if (skip || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      sceneStore.set({ fade: 1 });
      setTimeout(() => sceneStore.set({ stage: "inside", fade: 0 }), FADE_MS);
      return;
    }
    // Một nhịp liền: máy đi tới cửa (CameraRig, 2.4 giây), bóng tối phủ lên khi máy vẫn đang đi,
    // đổi cảnh lúc đã tối hẳn, rồi trong nhà sáng dần lên.
    sceneStore.set({ stage: "door" });
    setTimeout(() => sceneStore.set({ fade: 1 }), 1350);
    setTimeout(() => {
      sceneStore.set({ stage: "inside" });
      // chờ cảnh trong nhà vẽ xong vài khung (dựng shader lần đầu có thể khựng) rồi mới cho sáng lên,
      // để lớp đen không lui đi trên một khung hình cũ của bìa rừng
      requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(() => sceneStore.set({ fade: 0 }))));
    }, 1350 + FADE_MS + 60);
  };

  const leave = () => {
    sceneStore.set({ fade: 1 });
    setTimeout(() => {
      resetTable();
      setLines(crisisLocked ? CRISIS_RETURN : []);
      setPhase(crisisLocked ? "crisis" : "menu");
      sceneStore.set({ stage: "forest", fade: 0, tag: "neutral" });
    }, FADE_MS);
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
    setPrefill(null);
    say([{ tag: "think", text: FORM_INVITE }], "form");
  };

  /** Khủng hoảng: ở góc mặt Nguyệt, khóa bài tới hết phiên, thẻ hỗ trợ hiện ngay; lời của Nguyệt lấy từ máy chủ. */
  const enterCrisis = async (question: string) => {
    toFace();
    sessionSet(CRISIS_KEY, "1");
    setCrisisLocked(true);
    resetTable();
    setStayIndex(0);
    say([], "crisis");
    try {
      const r = await fetch("/api/reading", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ question }) });
      const j = await r.json();
      say(j.crisis && Array.isArray(j.lines) ? j.lines : CRISIS_RETURN, "crisis");
    } catch {
      say(CRISIS_RETURN, "crisis");
    }
  };

  // "Ngồi thêm một lúc": mỗi lần bấm, Nguyệt nói câu kế; hết câu thì lặp câu cuối
  const stay = () => {
    say([CRISIS_STAY[Math.min(stayIndex, CRISIS_STAY.length - 1)]], "crisis");
    setStayIndex((i) => i + 1);
  };

  // Khách chỉ gửi câu hỏi; máy chủ chọn chủ đề và cách trải rồi trả về cùng lá.
  const submitQuestion = async (question: string) => {
    // An toàn trước vai diễn: câu hỏi có dấu hiệu khủng hoảng thì không hạ máy, không xào bài, thẻ hỗ trợ hiện ngay.
    // Kiểm bằng đúng hàm máy chủ dùng; máy chủ vẫn kiểm lại (và có thể bắt thêm) ở dưới.
    if (isCrisis(question)) return enterCrisis(question);
    setBusy(true);
    setLines([]);
    // Bấm "Xào bài" thì máy hạ xuống bàn ngay, Nguyệt xào bài trong lúc chờ máy chủ rút lá.
    toTable();
    // form gập lại, hộp thoại báo Nguyệt đang xào bài trong lúc hai tay xào trên bàn
    setAskedQuestion(question);
    setLastAsk(question);
    setRetry("ask");
    setPhase("shuffling");
    const startedAt = performance.now();
    try {
      const r = await fetch("/api/reading", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ question }) });
      // Máy chủ trả hai đợt (NDJSON): lá bài trước, lời đọc sau. Lỗi, khủng hoảng và bản demo một file vẫn trả JSON một lần.
      const nextPart = r.ok && r.body && r.headers.get("content-type")?.includes("ndjson") ? ndjsonReader(r.body) : null;
      const j = nextPart ? await nextPart() : await r.json().catch(() => ({}));
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
      if (j.error === "quota") return say([{ tag: "concern", text: j.message }], "quota");
      // 400 là lời nhắc về chính câu hỏi (ngắn quá, dài quá); còn lại là trục trặc phía máy chủ
      if (!r.ok) return say([{ tag: "concern", text: r.status === 400 && j.error ? j.error : FAIL.askServer }], "message");
      setCtx({ question, readingId: j.readingId, demo: j.demo, topic: j.topic, spread: j.spread, draws: j.draws ?? [], clarifiers: [], clarifiersLeft: j.clarifiersLeft });
      setCards(j.cards);
      readingLines.current = nextPart ? pendingFrom(nextPart()) : pendingFrom(Promise.resolve(j));
      setPicked([]);
      say([{ tag: "shuffle", text: `${typeof j.reason === "string" ? j.reason : "Ta xào xong rồi."} Cậu chọn ${j.cards.length === 1 ? "một lá" : `${j.cards.length} lá`} trong dải bài này, theo cảm giác của cậu.` }], "picking");
      loadMe();
    } catch {
      // mất mạng giữa chừng: ngẩng lên, Nguyệt báo và cho quay lại
      toFace();
      say([{ tag: "concern", text: FAIL.askNetwork }], "message");
    } finally {
      setBusy(false);
    }
  };

  const pickFromFan = (i: number) => {
    if (picked.includes(i) || picked.length >= cards.length) return;
    const next = [...picked, i];
    setPicked(next);
    // lá vừa chọn bị khoá nên mất focus: đưa focus sang lá chưa chọn kế bên, không để rơi về <body>
    if (next.length < cards.length) {
      requestAnimationFrame(() => {
        const free = [...document.querySelectorAll<HTMLButtonElement>(".fan-card .tarot-card:not(:disabled)")];
        const target = free.find((_, k) => k >= i - next.filter((p) => p < i).length) ?? free.at(-1);
        target?.focus({ preventScroll: true });
      });
    }
    if (next.length === cards.length) setTimeout(() => showReading(next), 500);
  };

  /** Chọn đủ lá: đọc bài ngay nếu lời đã tới; chưa thì Nguyệt nhìn bài một lúc rồi mới đọc. */
  const showReading = async (pickedOrder: number[]) => {
    const pending = readingLines.current;
    if (!pending) return;
    if (!pending.lines && !pending.failed) {
      setBusy(true);
      say([{ tag: "think", text: "Để ta nhìn các lá cậu vừa chọn đã." }], "picking");
      await pending.wait;
      setBusy(false);
    }
    if (pending.lines) {
      // ghi chỗ các lá đã chọn trong dải ngay trước khi dải nhường chỗ cho hình trải, để lá bay về đúng ô
      captureFlight(pickedOrder);
      return say(pending.lines, "reading");
    }
    toFace();
    say([{ tag: "concern", text: FAIL.askNetwork }], "message");
  };

  const onLine = (line: ReaderLine) => {
    if (line.revealPosition !== undefined) {
      const pos = line.revealPosition === -1 ? cards.length - 1 : line.revealPosition;
      setRevealed((s) => new Set(s).add(pos));
      setActive(pos);
      currentCard.current = pos;
    }
  };

  // Ghi vào sổ mọi câu của phiên trải bài (không ghi lá của ngày), trừ câu thủ tục lúc xào/trải ("Ta xào xong rồi…").
  // Ghi khi câu đã hiện trọn, để sổ ghim trên desktop không in sẵn câu Nguyệt còn đang nói dở.
  const onShown = (line: ReaderLine, index: number) => {
    if (ctx && phase !== "daily" && line.tag !== "shuffle") {
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
        body: JSON.stringify({ readingId: ctx.readingId, demo: ctx.demo ? { question: ctx.question, topic: ctx.topic, spread: ctx.spread, draws: ctx.draws, clarifiers: ctx.clarifiers } : undefined }),
      });
      const j = await r.json().catch(() => ({}));
      // 409: phiên đã khép hoặc đủ lá, lời máy chủ nói đúng tình huống
      if (!r.ok) return say([{ tag: "concern", text: r.status === 409 && j.error ? j.error : FAIL.clarify }], "deciding");
      setCards((c) => [...c, j.card]);
      setCtx({ ...ctx, clarifiers: j.draw ? [...ctx.clarifiers, j.draw] : [...ctx.clarifiers, { cardId: j.card.card.id, reversed: j.card.reversed }], clarifiersLeft: j.clarifiersLeft });
      say(j.lines, "reading");
    } catch {
      say([{ tag: "concern", text: FAIL.clarify }], "deciding");
    } finally {
      setBusy(false);
    }
  };

  const finish = async () => {
    if (!ctx) return;
    // gom lại là nói về cả bàn: thôi thắp lá cuối và thu tay chỉ về
    setActive(null);
    currentCard.current = null;
    setBusy(true);
    setLines([]);
    try {
      const r = await fetch("/api/reading/finish", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ readingId: ctx.readingId, demo: ctx.demo ? { question: ctx.question, topic: ctx.topic, spread: ctx.spread, draws: ctx.draws, clarifiers: ctx.clarifiers } : undefined }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) return r.status === 409 && j.error ? say([{ tag: "concern", text: j.error }], "done") : say([{ tag: "concern", text: FAIL.finish }], "deciding");
      setRecap({ themes: j.themes ?? [], advice: j.advice ?? "" });
      // phần gom nói trên bàn; câu chào ra về để dành tới lúc ngẩng lên
      const all = j.lines as ReaderLine[];
      const last = all.at(-1);
      const bye = last?.tag === "farewell" ? last : null;
      setFarewell(bye);
      currentCard.current = null;
      say(bye ? all.slice(0, -1) : all, "closing");
    } catch {
      say([{ tag: "concern", text: FAIL.finish }], "deciding");
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
      const r = await fetch("/api/daily", { cache: "no-store" });
      const j = await r.json();
      if (!r.ok || !j.card) throw new Error("daily");
      setCards([j.card]);
      say(j.lines, "daily");
    } catch {
      // không để khách ngồi trước tấm khăn trống: ngẩng lên, Nguyệt báo và cho thử lại
      toFace();
      setRetry("daily");
      say([{ tag: "concern", text: FAIL.daily }], "message");
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
  const hasNotebook = (!!ctx || phase === "shuffling") && phase !== "daily";
  useEffect(() => {
    if (!canToggle) return;
    const nav = { notebookOpen, docked, hasNotebook, setNotebookOpen };
    const onKey = (e: KeyboardEvent) => {
      if (isInteractive(e.target) && !(e.target instanceof HTMLButtonElement)) return;
      // đang đi giữa các lá trong dải bài bằng bàn phím: phím mũi tên không lia máy hay mở sổ
      if (e.target instanceof Element && e.target.closest(".fan-zone")) return;
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
      {/* cảnh 3D là trang trí; nội dung đọc được nằm ở các lớp DOM bên trên */}
      <div className="stage-canvas" aria-hidden>
        <SceneStage />
      </div>
      <div className="stage-fade" style={{ opacity: fade }} />
      <TopBar me={me} onLogin={login} />
      {/* nút giữa đỉnh chỉ ở góc mặt Nguyệt; ở góc mặt bàn, lối ngẩng lên là ô chân dung trong hộp thoại
          (cánh tay Nguyệt vươn từ mép xa của bàn đi qua đúng chỗ giữa đỉnh) */}
      {canToggle && !onTable && (
        <button type="button" className="shot-toggle" onClick={toTable} aria-keyshortcuts="ArrowDown">
          ▼ Xem bàn
        </button>
      )}

      {/* lúc máy đi tới cửa, khối chữ mờ dần đi chứ không biến mất ngay; inert để không bấm lại được */}
      {(stage === "forest" || stage === "door") && (
        <section className={`forest-hero ${stage === "door" ? "is-leaving" : ""}`} inert={stage === "door"}>
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
            Dành cho giải trí và tự chiêm nghiệm, không thay thế lời khuyên y tế, pháp lý hay tài chính. <Link href="/la-bai">Bộ bài</Link> · <Link href="/dieu-khoan">Điều khoản</Link> · <Link href="/rieng-tu">Quyền riêng tư</Link>
          </p>
        </section>
      )}

      {(stage === "inside" || onTable) && (
        // tiêu đề cho trình đọc màn hình; nằm ngoài vùng chơi để không phá cột flex dồn đáy
        <h1 className="sr-only">
          {onTable ? "Bàn đọc bài của Nguyệt" : "Trong nhà, trước mặt Nguyệt, người giữ đèn, với con cú Bấc trên vai"}
        </h1>
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
              {hasNotebook && (
                <Notebook
                  question={ctx?.question ?? askedQuestion}
                  cards={cards}
                  log={log}
                  recap={recap}
                  open={notebookOpen}
                  docked={docked}
                  toRecap={phase === "summary"}
                  onOpenChange={setNotebookOpen}
                  spread={ctx?.spread}
                />
              )}
            </TableView>
          )}

          {phase === "crisis" && <SupportCard onStay={stay} onLeave={leave} />}

          <div className="dialogue-zone">
            {phase === "form" ? (
              <QuestionForm onSubmit={submitQuestion} onCancel={backToMenu} busy={busy} quotaText={quotaText} initial={prefill} />
            ) : (
              <Dialogue key={greetingNow ? "greet" : script.id} lines={lines} onLine={onLine} onShown={onShown} onDone={onDone} busy={busy} portrait={onTable ? <Portrait onLook={canToggle ? toFace : undefined} /> : undefined}>
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
                      <button className="btn-pixel" onClick={clarify} disabled={busy}>
                        Rút thêm một lá · còn {ctx.clarifiersLeft}
                      </button>
                    )}
                    {/* lời của khách (xưng "mình"), nói rõ bấm là Nguyệt gom lại và khép phiên */}
                    <button className="btn-pixel btn-gold" onClick={finish} disabled={busy}>
                      Gom lại giúp mình
                    </button>
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
                    Ngẩng lên chào Nguyệt
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
                {phase === "quota" && (
                  <>
                    <Link className="btn-pixel btn-gold" href="/goi">Xem các gói</Link>
                    <button className="btn-pixel btn-ghost" onClick={backToMenu}>Quay lại</button>
                  </>
                )}
                {phase === "message" && (
                  <>
                    {retry === "ask" && lastAsk && (
                      <button
                        className="btn-pixel btn-gold"
                        onClick={() => {
                          setPrefill(lastAsk);
                          say([{ tag: "think", text: FORM_INVITE }], "form");
                        }}
                      >
                        Hỏi lại
                      </button>
                    )}
                    {retry === "daily" && (
                      <button className="btn-pixel btn-gold" onClick={daily}>
                        Thử lại
                      </button>
                    )}
                    <button className={`btn-pixel ${retry ? "btn-ghost" : "btn-gold"}`} onClick={backToMenu}>
                      Quay lại
                    </button>
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

/** Thẻ hỗ trợ khi khủng hoảng: hiện ngay, cố định. Hai lối: ngồi lại với Nguyệt (không bài), hoặc ra về. */
function SupportCard({ onStay, onLeave }: { onStay: () => void; onLeave: () => void }) {
  // thẻ hiện thì focus vào "Ngồi thêm một lúc", không để rơi về body (người dùng bàn phím, trình đọc màn hình)
  const stayRef = useRef<HTMLButtonElement>(null);
  useEffect(() => stayRef.current?.focus({ preventScroll: true }), []);
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
      <div className="support-actions">
        <button ref={stayRef} className="btn-pixel btn-gold" onClick={onStay}>
          Ngồi thêm một lúc
        </button>
        <button className="btn-pixel btn-ghost" onClick={onLeave}>
          Ra về
        </button>
      </div>
    </section>
  );
}

/**
 * Form câu hỏi nằm trong khung hộp thoại và vẫn là lượt nói của Nguyệt: thẻ tên "Nguyệt", lời mời của nàng làm nhãn ô nhập.
 * Khách chỉ viết câu hỏi; chủ đề và cách trải để Nguyệt chọn (máy chủ đoán từ câu hỏi).
 */
function QuestionForm({
  onSubmit,
  onCancel,
  busy,
  quotaText,
  initial,
}: {
  onSubmit: (q: string) => void;
  onCancel: () => void;
  busy: boolean;
  quotaText: string | null;
  /** "Hỏi lại" sau lỗi: điền sẵn câu hỏi vừa gửi để khách không phải gõ lại */
  initial: string | null;
}) {
  const [q, setQ] = useState(initial ?? "");
  const formRef = useRef<HTMLFormElement>(null);
  const areaRef = useRef<HTMLTextAreaElement>(null);
  const tooShort = q.trim().length < 3;

  // Chuột/bàn phím: vào thẳng ô nhập. Cảm ứng: không bật bàn phím ảo (nó che nút "Xào bài"),
  // focus vào khung form để trình đọc màn hình vẫn đọc lời mời.
  useEffect(() => {
    if (window.matchMedia("(pointer: fine)").matches) areaRef.current?.focus();
    else formRef.current?.focus({ preventScroll: true });
  }, []);

  return (
    <form
      ref={formRef}
      tabIndex={-1}
      className="dialogue pixel-frame question-form"
      aria-labelledby="form-loi-moi"
      onSubmit={(e) => {
        e.preventDefault();
        if (!tooShort && !busy) onSubmit(q.trim());
      }}
    >
      <div className="dialogue-name" aria-hidden>
        Nguyệt
      </div>
      <label id="form-loi-moi" htmlFor="form-cau-hoi" className="question-invite">
        {FORM_INVITE}
      </label>
      <textarea
        ref={areaRef}
        id="form-cau-hoi"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        maxLength={500}
        rows={3}
        placeholder="Ví dụ: Mình có nên nhận lời chuyển sang công việc mới không?"
      />
      <div className="dialogue-actions">
        <button className="btn-pixel btn-gold" type="submit" disabled={busy || tooShort} aria-describedby="form-goi-y">
          {busy ? "Đang xào bài…" : "Xào bài"}
        </button>
        <button className="btn-pixel btn-ghost" type="button" onClick={onCancel}>
          Thôi
        </button>
        {/* nút bị khóa thì nói lý do; viết đủ rồi thì đếm chữ */}
        <span id="form-goi-y" className="hint">
          {tooShort ? "Viết vài chữ trước đã" : `${q.length}/500`}
        </span>
        {quotaText && <span className="quota-chip">Tốn 1 lượt · còn {quotaText}</span>}
      </div>
    </form>
  );
}
