import Link from "next/link";

export function PageShell({ title, lead, children }: { title: string; lead?: string; children: React.ReactNode }) {
  return (
    <div className="page-wrap">
      <header className="topbar">
        <Link href="/" className="brand">☾ Ngôi Nhà Trong Rừng</Link>
        <nav className="topnav">
          <Link href="/?vao=1">Vào nhà</Link>
          <Link href="/la-bai">Bộ bài</Link>
          <Link href="/goi">Gói</Link>
          <Link href="/nhat-ky">Nhật ký</Link>
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
