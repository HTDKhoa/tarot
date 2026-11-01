export type SpreadId = "one" | "past_present_path" | "situation_obstacle_advice";

export interface Spread {
  id: SpreadId;
  name: string;
  description: string;
  positions: string[];
}

export const SPREADS: Record<SpreadId, Spread> = {
  one: {
    id: "one",
    name: "Một lá",
    description: "Một câu hỏi, một lá. Nhanh và thẳng.",
    positions: ["Thông điệp"],
  },
  past_present_path: {
    id: "past_present_path",
    name: "Quá khứ – Hiện tại – Hướng đi",
    description: "Nhìn câu chuyện theo dòng thời gian.",
    positions: ["Quá khứ", "Hiện tại", "Hướng đi"],
  },
  situation_obstacle_advice: {
    id: "situation_obstacle_advice",
    name: "Tình huống – Trở ngại – Lời khuyên",
    description: "Khi cậu đang kẹt và cần một lối ra.",
    positions: ["Tình huống", "Trở ngại", "Lời khuyên"],
  },
};

export const MAX_CLARIFIERS = 3;
