"use client";
import Link from "next/link";
import { storageSet } from "@/lib/storage";
import { sceneStore, useScene } from "@/lib/store";
import type { ReaderLine } from "@/lib/tarot/types";
import type { PlanId } from "@/lib/plans";

export interface Me {
  configured: boolean;
  user: { id: string; email?: string; name: string | null } | null;
  status: { plan: PlanId; expiresAt: string | null; used: number; limit: number } | null;
  greeting: ReaderLine[];
}

export function TopBar({ me, onLogin }: { me: Me | null; onLogin: () => void }) {
  const quality = useScene((s) => s.quality);
  const toggleQuality = () => {
    const q = quality === "high" ? "low" : "high";
    storageSet("nguyet_quality", q);
    sceneStore.set({ quality: q });
  };
  return (
    <header className="topbar">
      <Link href="/" className="brand">
        <span className="brand-moon" aria-hidden>☾</span> Ngôi Nhà Trong Rừng
      </Link>
      <nav className="topnav">
        <Link href="/goi">Gói</Link>
        {me?.user && <Link href="/nhat-ky">Nhật ký</Link>}
        <button type="button" onClick={toggleQuality} title="Đổi mức đồ họa" aria-label="Đổi mức đồ họa">
          {quality === "high" ? "Đồ họa: cao" : "Đồ họa: nhẹ"}
        </button>
        {me?.configured &&
          (me.user ? (
            <form action="/auth/signout" method="post">
              <button type="submit" title={me.user.email}>
                {me.user.name ?? "Tài khoản"} · Thoát
              </button>
            </form>
          ) : (
            <button type="button" onClick={onLogin}>Đăng nhập</button>
          ))}
        {me && !me.configured && <span className="demo-badge">Demo</span>}
      </nav>
    </header>
  );
}
