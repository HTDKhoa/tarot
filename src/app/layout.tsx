import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

/*
 * Font tự host qua next/font, tải trước, kèm font dự phòng đã chỉnh cỡ, để lúc font tải xong chữ không đổi bề ngang
 * và xô bố cục (CLS). Đo trên điện thoại 4G chậm: không tải trước thì bìa rừng xô 0.075 (VT323 là font pixel đơn cách,
 * font dự phòng tự chỉnh theo Arial không khớp); tải trước thì CLS ~0.002, đổi lại lần vẽ đầu chậm ~0.3 s.
 * File là bản gộp latin + tiếng Việt của @fontsource (src/app/fonts), mỗi kiểu một file. Bản demo một file vẫn dùng
 * @fontsource trực tiếp, nên globals.css giữ tên font gốc làm dự phòng.
 */
const vt323 = localFont({
  src: "./fonts/vt323-400.woff2",
  weight: "400",
  variable: "--font-vt323",
  fallback: ["ui-monospace", "monospace"],
});
const beVietnam = localFont({
  src: [
    { path: "./fonts/be-vietnam-pro-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/be-vietnam-pro-600.woff2", weight: "600", style: "normal" },
  ],
  variable: "--font-be-vietnam",
  fallback: ["system-ui", "sans-serif"],
});

export const metadata: Metadata = {
  title: "Ngôi Nhà Trong Rừng · Tarot",
  description: "Đi theo lối mòn, gõ cửa ngôi nhà giữa rừng và ngồi xuống trước người giữ đèn. Một trải nghiệm tarot để tự chiêm nghiệm.",
};

export const viewport: Viewport = {
  themeColor: "#08060d",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="vi" className={`${vt323.variable} ${beVietnam.variable}`}>
      <body>{children}</body>
    </html>
  );
}
