import type { Topic } from "./types";
import type { SpreadId } from "./spreads";

/**
 * Chọn chủ đề và cách trải từ chính câu khách viết; khách chỉ cần viết câu hỏi.
 * Tạm thời đoán bằng từ khóa, cho tới khi agent AI thay chỗ này (giữ nguyên chữ ký hàm).
 * Chỉ chọn cách trải, không bao giờ chọn lá: lá vẫn rút ở draw.ts bằng crypto RNG.
 *
 * Từ khóa viết có dấu, vì nhiều từ ngắn trùng nhau khi bỏ dấu ("nợ"/"nó", "thi"/"thì", "vay"/"vậy").
 */

/**
 * Từ hoặc cụm từ đứng riêng, không dính vào chữ khác (tránh "ny" trong "nyc", "thi" trong "thiết").
 * `count`: cờ g để đếm số lần khớp; bỏ cờ g khi chỉ dùng .test() để không vướng lastIndex.
 */
const words = (list: string[], count = false) =>
  new RegExp(`(?<![\\p{L}\\p{N}])(${list.join("|")})(?![\\p{L}\\p{N}])`, count ? "giu" : "iu");

const TOPIC_WORDS: Array<[Topic, RegExp]> = [
  [
    "tinh_cam",
    words([
      "người yêu", "ny", "crush", "chia tay", "yêu", "thương", "tình cảm", "tình yêu", "hẹn hò", "tỏ tình", "người ấy", "người cũ", "ex",
      "bạn trai", "bạn gái", "vợ", "chồng", "cưới", "kết hôn", "ly hôn", "quay lại", "nối lại", "độc thân", "mối quan hệ", "anh ấy",
      "cô ấy", "thích", "cảm nắng", "ghen", "chung thủy", "phản bội", "người thứ ba", "nhớ", "duyên",
    ], true),
  ],
  [
    "cong_viec",
    words([
      "công việc", "việc làm", "đi làm", "nghỉ việc", "chuyển việc", "xin việc", "nhảy việc", "sếp", "đồng nghiệp", "công ty", "phỏng vấn",
      "thăng chức", "tăng lương", "lương", "dự án", "kinh doanh", "khởi nghiệp", "sự nghiệp", "nghề", "ngành", "học", "thi", "đại học",
      "du học", "trường", "offer", "cv", "khách hàng", "làm việc",
    ], true),
  ],
  [
    "tai_chinh",
    words([
      "tiền", "tài chính", "đầu tư", "nợ", "vay", "tiết kiệm", "mua nhà", "bán nhà", "chứng khoán", "cổ phiếu", "coin", "crypto", "bitcoin",
      "thu nhập", "chi tiêu", "làm giàu", "lỗ", "lãi",
    ], true),
  ],
];

/** Câu hỏi đang kẹt, cần chọn hay cần lối ra: Tình huống – Trở ngại – Lời khuyên. */
const DECISION = words([
  "có nên", "nên làm gì", "nên làm sao", "làm sao", "làm thế nào", "làm gì để", "phải làm", "lựa chọn", "chọn", "hay là", "bế tắc", "kẹt",
  "vượt qua", "giải quyết",
]);
/** Khách tự nói muốn một lá. */
const ONE_CARD = words(["một lá", "1 lá", "nhanh thôi"]);

const wordCount = (s: string) => s.split(/\s+/).filter(Boolean).length;

export function chooseTopic(question: string): Topic {
  const q = question.normalize("NFC").toLowerCase();
  let best: Topic = "ban_than";
  let bestScore = 0;
  // hòa điểm thì giữ chủ đề đứng trước trong danh sách
  for (const [topic, re] of TOPIC_WORDS) {
    const score = q.match(re)?.length ?? 0;
    if (score > bestScore) {
      best = topic;
      bestScore = score;
    }
  }
  return best;
}

export function chooseSpread(question: string): SpreadId {
  const q = question.normalize("NFC").toLowerCase();
  if (ONE_CARD.test(q) || wordCount(q) <= 4) return "one";
  if (DECISION.test(q)) return "situation_obstacle_advice";
  // còn lại (chuyện sẽ ra sao, vì sao, người ấy nghĩ gì…): nhìn theo dòng thời gian
  return "past_present_path";
}
