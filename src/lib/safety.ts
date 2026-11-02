/**
 * Lọc an toàn tạm thời bằng từ khóa, dùng cho tới khi có bộ phân loại AI riêng.
 * Bộ lọc này cố tình nhạy: thà dừng nhầm một phiên còn hơn bỏ sót một người đang gặp nguy.
 */

const CRISIS_PATTERNS = [
  /t[ựu]\s*t[ửu]/i,
  /t[ựu]\s*s[áa]t/i,
  /mu[ốo]n\s*ch[ếe]t/i,
  /kh[ôo]ng\s*mu[ốo]n\s*s[ốo]ng/i,
  /ch[ẳa]ng\s*mu[ốo]n\s*s[ốo]ng/i,
  /k[ếe]t\s*th[úu]c\s*(cu[ộo]c\s*[đd][ờo]i|t[ấa]t\s*c[ảa]|m[ạa]ng\s*s[ốo]ng)/i,
  /t[ựu]\s*l[àa]m\s*h[ạa]i/i,
  /t[ựu]\s*h[ạa]i/i,
  /r[ạa]ch\s*tay/i,
  /nh[ảa]y\s*c[ầa]u/i,
  /bi[ếe]n\s*m[ấa]t\s*m[ãa]i/i,
  /mu[ốo]n\s*bi[ếe]n\s*m[ấa]t/i,
  /ch[áa]n\s*s[ốo]ng/i,
  /(kh[ôo]ng|ch[ẳa]ng)\s*(c[òo]n\s*)?thi[ếe]t\s*s[ốo]ng/i,
  /s[ốo]ng\s*(kh[ôo]ng|ch[ẳa]ng)\s*n[ổo]i/i,
  /s[ốo]ng\s*([đd][ểe]\s*)?l[àa]m\s*g[ìi]\s*n[ữu]a/i,
  /kh[ôo]ng\s*mu[ốo]n\s*t[ồo]n\s*t[ạa]i/i,
  /ng[ủu]\s*(lu[ôo]n|m[ộo]t\s*gi[ấa]c)\s*(kh[ôo]ng|ch[ẳa]ng)\s*(d[ậa]y|t[ỉi]nh)/i,
  /kh[ôo]ng\s*(mu[ốo]n\s*)?t[ỉi]nh\s*d[ậa]y\s*n[ữu]a/i,
  /ch[ếe]t\s*(qu[áa]ch|cho\s*(xong|r[ồo]i))/i,
  /qu[áa]\s*li[ềe]u/i,
  /\bsuicid/i,
  /kill\s*myself/i,
  /end\s*my\s*life/i,
  /want\s*to\s*die/i,
];

const SENSITIVE_PATTERNS: Array<{ kind: "health" | "legal" | "money"; re: RegExp }> = [
  { kind: "health", re: /(b[ệe]nh|thu[ốo]c|ung th[ưu]|mang thai|c[óo] b[ầa]u|ph[ẫa]u thu[ậa]t|ch[ẩa]n [đd]o[áa]n|s[ứu]c kh[ỏo]e)/i },
  { kind: "legal", re: /(ki[ệe]n|t[òo]a [áa]n|lu[ậa]t s[ưu]|h[ợo]p [đd][ồo]ng|ly h[ôo]n|tranh ch[ấa]p|b[ịi] b[ắa]t)/i },
  { kind: "money", re: /([đd][ầa]u t[ưu]|c[ổo] phi[ếe]u|ch[ứu]ng kho[áa]n|crypto|coin|bitcoin|vay|n[ợo]\b|l[ãa]i su[ấa]t|mua nh[àa]|b[áa]n nh[àa])/i },
];

export function isCrisis(text: string): boolean {
  return CRISIS_PATTERNS.some((re) => re.test(text));
}

export function sensitiveKind(text: string): "health" | "legal" | "money" | null {
  return SENSITIVE_PATTERNS.find((p) => p.re.test(text))?.kind ?? null;
}

/**
 * Số khẩn cấp quốc gia. Đường dây hỗ trợ tâm lý cần được xác minh trước khi ra mắt;
 * thêm vào SUPPORT_LINES sau khi đã gọi thử và kiểm tra giờ hoạt động.
 */
export const EMERGENCY = { label: "Cấp cứu", number: "115" };
export const SUPPORT_LINES: Array<{ label: string; number: string; hours?: string }> = [];
