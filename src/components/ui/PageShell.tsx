import Link from "next/link";
import { NavLinks } from "./NavLinks";

export function PageShell({ title, lead, children }: { title: string; lead?: string; children: React.ReactNode }) {
  return (
    <div className="page-wrap">
      <header className="topbar">
        <Link href="/" className="brand">☾ Ngôi Nhà Trong Rừng</Link>
        <nav className="topnav">
          <NavLinks show={["home", "deck", "plans", "journal"]} />
        </nav>
      </header>
      <main className="page-inner">
        <h1 className="title-pixel">{title}</h1>
        {lead && <p className="page-lead">{lead}</p>}
        {children}
      </main>
    </div>
  );
}
