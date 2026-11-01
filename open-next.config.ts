// Cấu hình OpenNext cho Cloudflare. Chưa dùng incremental cache (R2) để giữ ở gói miễn phí:
// mọi trang động đều render theo request.
import { defineCloudflareConfig } from "@opennextjs/cloudflare";

export default defineCloudflareConfig({});
