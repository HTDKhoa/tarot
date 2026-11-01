import { createRoot } from "react-dom/client";
import assetMap from "./asset-map.generated.json";
import { installApiShim } from "./api-shim";
import HomeClient from "@/components/ui/HomeClient";
import "@fontsource/vt323/vietnamese.css";
import "@fontsource/vt323/latin.css";
import "@fontsource/be-vietnam-pro/vietnamese-400.css";
import "@fontsource/be-vietnam-pro/latin-400.css";
import "@fontsource/be-vietnam-pro/vietnamese-600.css";
import "@fontsource/be-vietnam-pro/latin-600.css";
import "@/app/globals.css";

(globalThis as { __ASSET_MAP__?: Record<string, string> }).__ASSET_MAP__ = assetMap as Record<string, string>;
installApiShim();

const PAGES: Record<string, string> = {
  "/goi": "Trang Gói (69.000đ/tháng, 399.000đ/năm, thanh toán VietQR)",
  "/nhat-ky": "Trang Nhật ký",
  "/dieu-khoan": "Trang Điều khoản",
  "/rieng-tu": "Trang Quyền riêng tư",
};
const toast = document.getElementById("demo-toast")!;
let timer: ReturnType<typeof setTimeout>;
(window as unknown as { __demoNav: (h: string) => void }).__demoNav = (href: string) => {
  toast.textContent = `${PAGES[href.split("?")[0]] ?? "Trang này"} có ở bản đầy đủ. Bản demo chỉ gồm trải nghiệm trong rừng và trong nhà.`;
  toast.classList.add("show");
  clearTimeout(timer);
  timer = setTimeout(() => toast.classList.remove("show"), 3200);
};

createRoot(document.getElementById("root")!).render(<HomeClient />);
