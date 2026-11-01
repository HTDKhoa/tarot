export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/** Chưa điền Supabase thì web chạy ở chế độ demo: trải bài được nhưng không đăng nhập, không lưu. */
export const isSupabaseConfigured = () => Boolean(SUPABASE_URL && SUPABASE_KEY);

/** Production thiếu biến môi trường: dừng hẳn thay vì lặng lẽ mở chế độ demo (không đăng nhập, không hạn mức). */
export class MissingConfigError extends Error {
  constructor(missing: string[]) {
    super(
      `[cấu hình] Production thiếu biến môi trường: ${missing.join(", ")}. ` +
        "Biến NEXT_PUBLIC_* phải có lúc build; khóa bí mật đặt bằng `npx wrangler secret put`. " +
        "Muốn cố ý chạy chế độ demo trên production thì đặt DEMO_MODE=1.",
    );
    this.name = "MissingConfigError";
  }
}

/**
 * Chỉ gọi phía server. "live": có Supabase. "demo": chạy demo có chủ đích (dev, hoặc DEMO_MODE=1).
 * Production thiếu cấu hình thì ném MissingConfigError.
 */
export function supabaseMode(): "live" | "demo" {
  const production = process.env.NODE_ENV === "production" && process.env.DEMO_MODE !== "1";
  if (!isSupabaseConfigured()) {
    if (!production) return "demo";
    throw new MissingConfigError(
      [
        !SUPABASE_URL && "NEXT_PUBLIC_SUPABASE_URL",
        !SUPABASE_KEY && "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
      ].filter((x): x is string => Boolean(x)),
    );
  }
  // Ghi lá bài, lời thoại và xóa dữ liệu đều cần khóa bí mật phía server.
  if (production && !(process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY)) {
    throw new MissingConfigError(["SUPABASE_SECRET_KEY"]);
  }
  return "live";
}

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
export const TIMEZONE = "Asia/Ho_Chi_Minh";

/** Khóa ngày/tháng theo giờ Việt Nam, ví dụ "2026-11-01" và "2026-11". */
export function vnDateKey(d = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TIMEZONE, year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
}
export function vnMonthStart(d = new Date()): Date {
  const [y, m] = vnDateKey(d).split("-").map(Number);
  // 00:00 ngày 1 theo giờ VN (UTC+7) = 17:00 ngày cuối tháng trước theo UTC
  return new Date(Date.UTC(y, m - 1, 1, -7));
}
export function vnHour(d = new Date()) {
  return Number(new Intl.DateTimeFormat("en-US", { timeZone: TIMEZONE, hour: "numeric", hourCycle: "h23" }).format(d));
}
