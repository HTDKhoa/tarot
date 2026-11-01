/** localStorage có thể không tồn tại hoặc ném lỗi (iframe sandbox, chế độ riêng tư): luôn bọc try/catch. */
export function storageGet(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}
/** sessionStorage: sống tới khi đóng tab. Cũng bọc try/catch như trên. */
export function sessionGet(key: string): string | null {
  try {
    return window.sessionStorage.getItem(key);
  } catch {
    return null;
  }
}
export function sessionSet(key: string, value: string) {
  try {
    window.sessionStorage.setItem(key, value);
  } catch {
    /* bỏ qua */
  }
}
export function storageSet(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* bỏ qua */
  }
}
