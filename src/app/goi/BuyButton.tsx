"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function BuyButton({ plan, loggedIn }: { plan: "month" | "year"; loggedIn: boolean }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const buy = async () => {
    setErr(null);
    if (!loggedIn) {
      const supabase = createClient();
      if (!supabase) return setErr("Web đang chạy chế độ demo, chưa bật đăng nhập.");
      await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${location.origin}/auth/callback?next=/goi` } });
      return;
    }
    setBusy(true);
    try {
      const r = await fetch("/api/payments/create", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ plan }) });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error ?? "Không tạo được đơn");
      location.href = j.checkoutUrl;
    } catch (e) {
      setErr((e as Error).message);
      setBusy(false);
    }
  };
  return (
    <div>
      <button className="btn-pixel btn-gold btn-block" onClick={buy} disabled={busy}>
        {busy ? "Đang tạo mã…" : loggedIn ? "Thanh toán bằng VietQR" : "Đăng nhập để mua"}
      </button>
      {err && (
        <p className="form-error" role="alert">
          {err}
        </p>
      )}
    </div>
  );
}
