"use client";
import { useEffect } from "react";
import Link from "next/link";

/** Lỗi không lường trước (kể cả máy chủ thiếu cấu hình). Chi tiết chỉ ghi ở log máy chủ, không lộ ra trình duyệt. */
export default function Error({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <div className="page-wrap">
      <main className="page-inner">
        <h1 className="title-pixel">Ngôi nhà tạm đóng cửa</h1>
        <p className="page-lead">Đèn trong nhà vừa chập chờn. Cậu thử lại sau một lát nhé.</p>
        <p style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap" }}>
          <button type="button" className="btn-pixel btn-gold" onClick={() => retry()}>
            Thử lại
          </button>
          <Link className="btn-pixel btn-ghost" href="/">
            Về bìa rừng
          </Link>
        </p>
      </main>
    </div>
  );
}
