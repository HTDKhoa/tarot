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
      if (!supabase) return setErr("Bản demo chưa bật đăng nhập nên chưa mua được gói.");
      await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${location.origin}/auth/callback?next=/goi` } });
      return;
    }
    setBusy(true);
    // lỗi mạng và lỗi máy chủ đều thành một câu khách hiểu được, không lộ lỗi kỹ thuật (tiếng Anh) ra màn hình
    let r: Response;
    try {
      r = await fetch("/api/payments/create", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ plan }) });
    } catch {
      setErr("Chưa kết nối được tới ngôi nhà. Cậu kiểm tra mạng rồi bấm lại nhé.");
      return setBusy(false);
    }
    const j = await r.json().catch(() => ({}));
    if (r.ok && j.checkoutUrl) {
      location.href = j.checkoutUrl;
      return;
    }
    setErr(typeof j.error === "string" ? j.error : "Chưa tạo được mã thanh toán, lỗi ở phía ta. Cậu bấm lại sau ít phút nhé.");
    setBusy(false);
  };
  return (
    <div>
      <button className="btn-pixel btn-gold btn-block" onClick={buy} disabled={busy}>
        {busy ? "Đang tạo mã QR…" : loggedIn ? "Thanh toán bằng VietQR" : "Ghi tên để mua"}
      </button>
      {err && (
        <p className="form-error" role="alert">
          {err}
        </p>
      )}
    </div>
  );
}
