"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { assetUrl } from "@/lib/assets";

/**
 * Các lối đi chính của ngôi nhà (thanh trên cùng và thanh trang phụ): mỗi lối là một tấm biển pixel nhỏ có hình
 * đồ vật trong nhà, để khách thấy đây là chỗ bấm vào được chứ không phải dòng chữ trang trí. Trang đang mở
 * thì biển sáng viền vàng (aria-current).
 */
const LINKS = {
  home: { href: "/?vao=1", label: "Vào nhà", icon: "/assets/interior/candle.png" },
  deck: { href: "/la-bai", label: "Bộ bài", icon: "/assets/cards/card_back.png" },
  plans: { href: "/goi", label: "Gói", icon: "/assets/cards/suit_pentacles.png" },
  journal: { href: "/nhat-ky", label: "Nhật ký", icon: "/assets/table/book.png" },
} as const;

export type NavKey = keyof typeof LINKS;

export function NavLinks({ show }: { show: NavKey[] }) {
  const path = usePathname();
  return (
    <>
      {show.map((k) => {
        const l = LINKS[k];
        const base = l.href.split("?")[0];
        const current = k !== "home" && (path === base || path.startsWith(`${base}/`));
        return (
          <Link key={k} href={l.href} className="nav-sign" aria-current={current ? "page" : undefined}>
            <img src={assetUrl(l.icon)} alt="" className={`nav-icon is-${k}`} />
            {l.label}
          </Link>
        );
      })}
    </>
  );
}
