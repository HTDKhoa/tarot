import "server-only";
import Anthropic from "@anthropic-ai/sdk";

/** Mẫu Claude Nguyệt dùng: Haiku 5.5, nhanh và rẻ, đủ cho chọn cách trải và lời đọc ngắn. */
export const NGUYET_MODEL = "claude-haiku-5-5";

let client: Anthropic | null = null;

/**
 * Client Claude dùng chung phía máy chủ. Chưa đặt ANTHROPIC_API_KEY thì trả về null: mọi chỗ gọi AI phải có đường lui.
 * Không thử lại (khách đang chờ); mỗi lời gọi tự đặt thời gian chờ.
 */
export function claude(): Anthropic | null {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;
  return (client ??= new Anthropic({ apiKey, maxRetries: 0 }));
}

/** Ghi loại lỗi khi gọi Claude, không ghi câu hỏi của khách. */
export function logClaudeError(where: string, err: unknown) {
  if (err instanceof Anthropic.APIError) console.warn(`[${where}] lỗi API`, err.status, err.name);
  else console.warn(`[${where}] lỗi`, err instanceof Error ? err.name : "không rõ");
}
