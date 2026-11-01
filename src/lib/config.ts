export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/** Chưa điền Supabase thì web chạy ở chế độ demo: trải bài được nhưng không đăng nhập, không lưu. */
export const isSupabaseConfigured = () => Boolean(SUPABASE_URL && SUPABASE_KEY);

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
