"use client";
import { useState } from "react";

interface Props {
  /** chữ trên nút lần đầu */
  label: string;
  /** câu cảnh báo hiện ra khi bấm lần đầu */
  warning: string;
  /** API nhận DELETE */
  endpoint: string;
  /** xóa xong thì chuyển tới đây */
  redirectTo: string;
}

/** Nút xóa hai bước: bấm lần đầu hiện cảnh báo, bấm "Xóa hẳn" mới gửi yêu cầu. */
export function DeleteButton({ label, warning, endpoint, redirectTo }: Props) {
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const remove = async () => {
    setBusy(true);
    setErr(null);
    try {
      const r = await fetch(endpoint, { method: "DELETE" });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.error ?? "Không xóa được. Cậu thử lại nhé.");
      location.href = redirectTo;
    } catch (e) {
      setErr((e as Error).message);
      setBusy(false);
    }
  };

  if (!confirming) {
    return (
      <button type="button" className="btn-pixel btn-danger" onClick={() => setConfirming(true)}>
        {label}
      </button>
    );
  }
  return (
    <div className="delete-confirm" role="alertdialog" aria-label={label}>
      <p>{warning}</p>
      <div className="delete-actions">
        <button type="button" className="btn-pixel btn-danger" onClick={remove} disabled={busy}>
          {busy ? "Đang xóa…" : "Xóa hẳn"}
        </button>
        <button type="button" className="btn-pixel btn-ghost" onClick={() => setConfirming(false)} disabled={busy}>
          Thôi
        </button>
      </div>
      {err && <p className="delete-error">{err}</p>}
    </div>
  );
}
