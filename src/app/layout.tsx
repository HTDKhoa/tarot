import type { Metadata, Viewport } from "next";
import "@fontsource/vt323/vietnamese.css";
import "@fontsource/vt323/latin.css";
import "@fontsource/be-vietnam-pro/vietnamese-400.css";
import "@fontsource/be-vietnam-pro/latin-400.css";
import "@fontsource/be-vietnam-pro/vietnamese-600.css";
import "@fontsource/be-vietnam-pro/latin-600.css";
import "./globals.css";

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
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
