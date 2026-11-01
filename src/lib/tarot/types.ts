export type Orientation = "xuoi" | "nguoc";
export type Topic = "tinh_cam" | "cong_viec" | "tai_chinh" | "ban_than";
export type Suit = "wands" | "cups" | "swords" | "pentacles";

export interface CardData {
  id: number;
  slug: string;
  name_en: string;
  name_vi: string;
  arcana: "major" | "minor";
  suit: Suit | null;
  number: number;
  element: string | null;
  planet: string | null;
  zodiac: string | null;
  yes_no: "yes" | "no" | "maybe";
  hinh_anh: string;
  tu_khoa: Record<Orientation, string[]>;
  y_nghia: Record<Orientation, string>;
  chu_de: Record<Topic, Record<Orientation, string>>;
  loi_khuyen: Record<Orientation, string>;
  nguyet: string;
}

/** Thông tin lá bài gửi xuống trình duyệt (không gửi cả bộ dữ liệu). */
export interface PublicCard {
  id: number;
  slug: string;
  name_en: string;
  name_vi: string;
  arcana: "major" | "minor";
  suit: Suit | null;
  number: number;
  keywords: string[];
}

export interface DrawnCard {
  position: number;
  positionLabel: string;
  card: PublicCard;
  reversed: boolean;
  clarifier: boolean;
}

/** Tag cảm xúc điều khiển animation, khớp với persona bible. */
export type EmotionTag =
  | "greet"
  | "neutral"
  | "think"
  | "shuffle"
  | "reveal"
  | "warm"
  | "tease"
  | "concern"
  | "surprise"
  | "solemn"
  | "gentle"
  | "farewell";

export interface ReaderLine {
  tag: EmotionTag;
  text: string;
  /** Lật lá ở vị trí này trước khi nói câu. */
  revealPosition?: number;
}

export const TOPIC_LABELS: Record<Topic, string> = {
  tinh_cam: "Tình cảm",
  cong_viec: "Công việc",
  tai_chinh: "Tài chính",
  ban_than: "Bản thân",
};
