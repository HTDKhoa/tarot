/**
 * Đường dẫn asset. Bản web thường trả nguyên đường dẫn /assets/...;
 * bản demo một-file gán sẵn bảng ánh xạ sang data URI vào globalThis.__ASSET_MAP__.
 */
export function assetUrl(path: string): string {
  const map = (globalThis as { __ASSET_MAP__?: Record<string, string> }).__ASSET_MAP__;
  return map?.[path] ?? path;
}
