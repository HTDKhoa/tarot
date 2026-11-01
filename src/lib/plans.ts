export type PlanId = "free" | "month" | "year";

export const PLANS = {
  free: { id: "free", name: "Khách ghé chơi", price: 0, days: 0, readingsPerMonth: 3 },
  month: { id: "month", name: "Gói tháng", price: 69_000, days: 30, readingsPerMonth: 30 },
  year: { id: "year", name: "Gói năm", price: 399_000, days: 365, readingsPerMonth: 30 },
} as const;

export const formatVnd = (n: number) => n.toLocaleString("vi-VN") + "đ";
