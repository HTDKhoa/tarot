"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

/** Ghi chú riêng của khách và đánh dấu "điều đó đã xảy ra chưa". */
export function NoteEditor({ id, note, happened }: { id: string; note: string; happened: boolean | null }) {
  const [text, setText] = useState(note);
  const [h, setH] = useState<boolean | null>(happened);
  const [saved, setSaved] = useState<string | null>(null);
  const save = async (patch: { note?: string; happened?: boolean | null }) => {
    const supabase = createClient();
    if (!supabase) return;
    const { error } = await supabase.from("readings").update(patch).eq("id", id);
    setSaved(error ? "Không lưu được" : "Đã lưu");
    setTimeout(() => setSaved(null), 1500);
  };
  return (
    <section className="pixel-frame" style={{ padding: "1rem 1.2rem" }}>
      <label style={{ fontFamily: "var(--font-pixel)", fontSize: "1.3rem", color: "var(--gold-hi)" }} htmlFor="note">Ghi chú của cậu</label>
      <textarea
        id="note"
        value={text}
        maxLength={2000}
        onChange={(e) => setText(e.target.value)}
        onBlur={() => text !== note && save({ note: text })}
        rows={3}
        style={{ width: "100%", marginTop: "0.4rem", background: "rgba(8,6,13,0.6)", border: "2px solid rgba(185,176,201,0.5)", color: "var(--cream)", padding: "0.5rem" }}
      />
      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginTop: "0.6rem", flexWrap: "wrap" }}>
        <span style={{ fontFamily: "var(--font-pixel)", fontSize: "1.2rem" }}>Điều đó đã xảy ra chưa?</span>
        {([[true, "Rồi"], [false, "Chưa"], [null, "Chưa biết"]] as const).map(([v, label]) => (
          <button key={label} type="button" className={`chip ${h === v ? "is-on" : ""}`} onClick={() => { setH(v); save({ happened: v }); }}>
            {label}
          </button>
        ))}
        {saved && <span className="hint">{saved}</span>}
      </div>
    </section>
  );
}
