# Ngôi Nhà Trong Rừng — web tarot HD-2D

Người dùng đi theo lối mòn trong rừng, gõ cửa một ngôi nhà gỗ và ngồi trước Nguyệt, người giữ đèn, để trải bài tarot.

Bản này **chưa gắn AI**. Lời giải được ghép từ dữ liệu 78 lá (`src/data/tarot_vi.json`) trong `src/lib/tarot/reader.ts`. Khi gắn agent Claude, chỉ cần thay các hàm trong file đó. API và giao diện giữ nguyên.

## Chạy thử ngay (chế độ demo)

```bash
npm install
npm run dev        # http://localhost:3000
```

Khi chưa điền Supabase, web chạy ở chế độ **demo**: trải bài, bốc thêm lá làm rõ và lá bài của ngày đều dùng được, nhưng không có đăng nhập và không lưu nhật ký.

## Công nghệ

| Phần | Dùng |
| --- | --- |
| Web | Next.js 16 (App Router) + TypeScript + Tailwind 4 |
| Cảnh HD-2D | three.js + @react-three/fiber + postprocessing (bloom, tilt-shift, vignette) |
| Đăng nhập + DB | Supabase (Google OAuth, Postgres, Row Level Security) |
| Thanh toán | payOS (VietQR, không tự gia hạn) |
| Host | Cloudflare Workers qua @opennextjs/cloudflare |

## Cấu trúc

```
src/
  app/
    page.tsx                 trang chính: rừng → cửa → trong nhà
    api/reading/             tạo phiên, bốc thêm lá (clarify), kết thúc (finish)
    api/daily/               lá bài của ngày
    api/me/                  trạng thái người dùng + lời chào
    api/payments/            tạo đơn payOS, webhook, kiểm tra trạng thái
    auth/                    callback Google, đăng xuất
    goi/ nhat-ky/ thanh-toan/ dieu-khoan/ rieng-tu/
  components/scene/          cảnh 3D (Experience, ForestScene, InteriorScene…)
  components/ui/             hộp thoại, lá bài, form câu hỏi
  lib/tarot/                 dữ liệu lá, rút bài (crypto RNG), người đọc tạm thời
  lib/safety.ts              lọc khủng hoảng / chủ đề nhạy cảm bằng từ khóa (tạm thời)
  data/tarot_vi.json         nghĩa 78 lá tiếng Việt
supabase/migrations/         schema + RLS
public/assets/               toàn bộ pixel art
art/                         script Python vẽ lại pixel art (python3 art/build_all.py)
demo/                        bản demo một file HTML (npm run build:demo)
docs/                        kế hoạch, persona, trạng thái, prompt bàn giao cho agent
CLAUDE.md                    hướng dẫn cho Claude Code / agent
```

## Cài đặt thật

### 1. Supabase
1. Tạo project tại supabase.com (gói Free).
2. Vào **SQL Editor**, lần lượt dán và Run **từng file** trong `supabase/migrations/` theo thứ tự số (`0001_…`, `0002_…`, …). Khi có file mới, chỉ chạy các file chưa chạy.
3. Vào **Authentication → Providers → Google** và bật lên. Client ID và Secret lấy từ Google Cloud Console (OAuth consent screen + OAuth client loại Web). Redirect URI của Google ghi là `https://<project>.supabase.co/auth/v1/callback`.
4. Vào **Authentication → URL Configuration**:
   - Site URL: domain của bạn.
   - Redirect URLs: thêm `http://localhost:3000/**` và `https://<domain>/**`.
5. Chép URL, publishable key và secret key vào `.env.local` (mẫu ở `.env.example`).

### 2. payOS
1. Đăng ký tại payos.vn. Cá nhân chỉ cần CCCD. Liên kết tài khoản ngân hàng.
2. Tạo kênh thanh toán, rồi chép Client ID, API Key và Checksum Key vào `.env.local`.
3. Sau khi deploy, đặt webhook URL là `https://<domain>/api/payments/webhook`.

### 3. Deploy lên Cloudflare
```bash
npx wrangler login
# đặt khóa bí mật cho Worker
npx wrangler secret put SUPABASE_SECRET_KEY
npx wrangler secret put PAYOS_CLIENT_ID
npx wrangler secret put PAYOS_API_KEY
npx wrangler secret put PAYOS_CHECKSUM_KEY
# các biến NEXT_PUBLIC_* phải có lúc build: để trong .env.production hoặc biến môi trường khi build
npm run deploy
```
Chạy thử bản build trên runtime của Cloudflare: điền `.dev.vars`, rồi chạy `npm run preview`.

## Hạn mức
Định nghĩa trong `src/lib/plans.ts`:
- Free: 3 lần trải bài mỗi tháng.
- Gói tháng 69.000đ và gói năm 399.000đ: 30 lần mỗi tháng.

Lá bài của ngày không bị giới hạn.

## Việc còn lại
- Gắn agent Claude (Haiku 5.5 + Sonnet 5.5) thay cho `reader.ts`, kèm bộ phân loại khủng hoảng thay cho `safety.ts`.
- Xác minh số đường dây hỗ trợ tâm lý tại Việt Nam, rồi thêm vào `SUPPORT_LINES`.
- Vẽ 78 tranh lá bài. Hiện mặt trước chỉ có biểu tượng chất bài, số và tên.
- Rà soát pháp lý cho điều khoản và chính sách quyền riêng tư.

## Giấy phép dữ liệu
Xem `THIRD_PARTY_NOTICES.md`. Dữ liệu Tarotoo dùng giấy phép MIT và bắt buộc phải kèm thông báo này.
