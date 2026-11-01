import type { EmotionTag } from "./types";

/** Màu và độ sáng của mắt trăng khuyết + mặt dây chuyền theo cảm xúc. Cảnh 3D và ô chân dung dùng chung. */
export const EYE_GLOW: Record<EmotionTag, { color: string; strength: number }> = {
  greet: { color: "#ffe6a0", strength: 2.6 },
  neutral: { color: "#ffffff", strength: 2.0 },
  think: { color: "#d9e4ff", strength: 1.7 },
  shuffle: { color: "#ffffff", strength: 2.2 },
  reveal: { color: "#fff2c4", strength: 3.4 },
  warm: { color: "#ffd27a", strength: 2.8 },
  tease: { color: "#ffe9b0", strength: 2.2 },
  // three.js không đọc được biến CSS nên giữ mã màu; trùng moonlit-blue (Xanh Trăng) trong DESIGN.md
  concern: { color: "#9ec3ff", strength: 1.8 },
  surprise: { color: "#ffffff", strength: 4.0 },
  solemn: { color: "#b9b4ff", strength: 1.5 },
  gentle: { color: "#ffd9a8", strength: 1.6 },
  farewell: { color: "#ffe6a0", strength: 2.4 },
};
