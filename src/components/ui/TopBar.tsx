"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { storageSet } from "@/lib/storage";
import { sceneStore, useScene } from "@/lib/store";
import { useMedia } from "@/lib/useMedia";
import { NavLinks } from "./NavLinks";
import type { ReaderLine } from "@/lib/tarot/types";
import type { PlanId } from "@/lib/plans";

export interface Me {
  configured: boolean;
  user: { id: string; email?: string; name: string | null } | null;
  status: { plan: PlanId; expiresAt: string | null; used: number; limit: number } | null;
  greeting: ReaderLine[];
}

/**
 * Thanh trên cùng. Màn rộng: các liên kết nằm một hàng. Điện thoại: gộp vào nút "Menu" mở một khung pixel,
 * vì khi đã đăng nhập (Gói, Nhật ký, Đồ họa, Tên · Thoát) một hàng không còn vừa.
 */
export function TopBar({ me, onLogin }: { me: Me | null; onLogin: () => void }) {
  const quality = useScene((s) => s.quality);
  // đang ở bàn trải bài thì không mời sang trang tra cứu: khách cần tập trung vào buổi đọc
  const reading = useScene((s) => s.stage === "table");
  const compact = useMedia("(max-width: 640px)");
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const toggleQuality = () => {
    const q = quality === "high" ? "low" : "high";
    storageSet("nguyet_quality", q);
    sceneStore.set({ quality: q });
  };

  // menu mở: chạm ra ngoài hoặc Esc để đóng, focus trả về nút Menu
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!menuRef.current?.contains(e.target as Node) && !buttonRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("keydown", onKey);
    menuRef.current?.querySelector<HTMLElement>("a, button")?.focus();
    return () => {
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const items = (
    <>
      <NavLinks show={[...(reading ? [] : (["deck"] as const)), "plans", ...(me?.user ? (["journal"] as const) : [])]} />
      {/* tên đọc theo đúng chữ hiển thị (gồm trạng thái); title nói rõ việc nút làm */}
      {/* cài đặt, không phải lối đi: chữ nhỏ, mờ, đứng sau các biển */}
      <button type="button" className="nav-setting" onClick={toggleQuality} title="Đổi mức đồ họa">
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
    </>
  );

  return (
    <header className="topbar">
      <Link href="/" className="brand">
        <span className="brand-moon" aria-hidden>☾</span> Ngôi Nhà Trong Rừng
      </Link>
      {compact ? (
        <div className="topnav">
          {me && !me.configured && <span className="demo-badge">Demo</span>}
          <button ref={buttonRef} type="button" className="menu-button" aria-expanded={open} aria-controls="menu-chinh" onClick={() => setOpen((o) => !o)}>
            Menu
          </button>
          {open && (
            <div id="menu-chinh" ref={menuRef} className="topmenu pixel-frame" onClick={(e) => (e.target as HTMLElement).closest("a") && setOpen(false)}>
              {items}
            </div>
          )}
        </div>
      ) : (
        <nav className="topnav">
          {items}
          {me && !me.configured && <span className="demo-badge">Demo</span>}
        </nav>
      )}
    </header>
  );
}
