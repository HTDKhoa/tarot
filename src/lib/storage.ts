/** localStorage có thể không tồn tại hoặc ném lỗi (iframe sandbox, chế độ riêng tư): luôn bọc try/catch. */
export function storageGet(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}
export function storageSet(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* bỏ qua */
  }
}
