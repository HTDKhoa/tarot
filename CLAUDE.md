@AGENTS.md

# Ngôi Nhà Trong Rừng — hướng dẫn cho agent

Web tarot trải nghiệm kiểu HD-2D (pixel art trong cảnh 3D có ánh sáng). Khách đi qua rừng, gõ cửa, ngồi trước **Nguyệt** (người giữ đèn, đội mũ trùm, con cú **Bấc** trên vai) để trải bài. Thị trường Việt Nam trước; toàn bộ giao diện và lời thoại bằng tiếng Việt.

Đọc thêm trước khi làm: `docs/PLAN.md` (quyết định sản phẩm), `docs/PERSONA.md` (giọng và ranh giới của Nguyệt), `docs/STATUS.md` (đã có / còn thiếu), `README.md` (cài đặt).

## Lệnh

| Việc | Lệnh |
| --- | --- |
| Chạy dev (chế độ demo nếu chưa có .env) | `npm run dev` |
| Kiểm tra kiểu / lint | `npm run typecheck` · `npm run lint` |
| Build Next | `npm run build` |
| Build + chạy thử trên runtime Cloudflare | `npm run preview` |
| Deploy | `npm run deploy` |
| Bản demo một file HTML | `npm run build:demo` → `demo/dist/index.html` |
| Vẽ lại pixel art | `python3 art/build_all.py` (nếu thư mục art có trong repo) |

Mọi thay đổi phải qua được `typecheck`, `lint` và `build` trước khi coi là xong.

## Kiến trúc

- Next.js 16 App Router (đọc `node_modules/next/dist/docs/` khi không chắc API — bản này khác dữ liệu huấn luyện; không dùng `middleware.ts`/`proxy.ts` vì OpenNext Cloudflare chưa hỗ trợ proxy Node).
- `src/components/scene/` — three.js qua @react-three/fiber. 1 px ảnh = 0.01 đơn vị; khung chuẩn 640×360; vị trí đặt theo `at={{x, bottom}}` trong `PixelSprite`. Hai rule React Compiler (`immutability`, `purity`) tắt riêng thư mục này vì mutate trong `useFrame` là cách dùng chuẩn của R3F.
- `src/components/ui/` — DOM overlay: hộp thoại (`Dialogue`), lá bài (`TarotCard`), luồng chính (`HomeClient`).
- `src/lib/tarot/` — dữ liệu 78 lá (`src/data/tarot_vi.json`), rút bài `draw.ts`, **người đọc tạm thời `reader.ts`** (ghép câu từ dữ liệu, chưa có AI).
- `src/app/api/` — reading (tạo / clarify / finish), daily, me, payments (create / webhook / status).
- Supabase: `supabase/migrations/0001_init.sql` (RLS bật cho mọi bảng). Không cấu hình → chế độ demo.
- payOS: `src/lib/payos.ts`, webhook `src/app/api/payments/webhook/route.ts`.
- Asset và localStorage luôn đi qua `assetUrl()` (`src/lib/assets.ts`) và `storageGet/storageSet` (`src/lib/storage.ts`) — bản demo một file phụ thuộc vào điều này.

## Bất biến — không được đổi nếu chưa hỏi chủ dự án

1. **Rút bài chỉ ở server** bằng crypto RNG (`draw.ts`). Không bao giờ để client hay LLM chọn lá. Tên lá trong lời thoại chỉ lấy từ kết quả rút.
2. **An toàn trước vai diễn:** câu hỏi có dấu hiệu khủng hoảng/tự hại → dừng trải bài, không tính hạn mức, hiện hỗ trợ (115). Y tế/pháp lý/tài chính → nói rõ giới hạn, không khuyên mua/bán/dùng thuốc/kiện. Không ghi số đường dây hỗ trợ tâm lý chưa xác minh.
3. **Giá và hạn mức:** 69.000đ/tháng, 399.000đ/năm; free 3 lượt/tháng, trả phí 30 lượt/tháng (`src/lib/plans.ts`). Thanh toán QR không tự gia hạn.
4. **Chi phí 0đ hạ tầng:** Cloudflare Workers free (bundle < 3 MiB gzip — kiểm bằng `npx wrangler deploy --dry-run`), Supabase free, payOS free. Không thêm dịch vụ trả phí, không thêm R2.
5. **Thẩm mỹ HD-2D pixel là cố ý:** pixel sắc nét (nearest, `image-rendering: pixelated`), bảng màu đêm (navy/tím mận/vàng nến), font VT323 cho tiêu đề và nút, Be Vietnam Pro cho đoạn văn. Đừng "hiện đại hóa" thành giao diện SaaS phẳng. Không dùng `filter` lên phần tử có transform 3D.
6. **Giọng Nguyệt** theo `docs/PERSONA.md`: xưng "ta–cậu", câu ngắn, không emoji, không gạch đầu dòng trong lời thoại, không giọng thầy bói, không giọng trợ lý ảo.
7. **Dữ liệu lá bài** có phần từ Tarotoo (MIT) — giữ `THIRD_PARTY_NOTICES.md`. Không chép nội dung từ các trang tarot thương mại.

## Cách kiểm tra giao diện

Cảnh 3D cần trình duyệt có WebGL. Playwright + Chromium có sẵn; khởi chạy với `--use-gl=angle --use-angle=swiftshader --enable-unsafe-swiftshader`. Chụp ít nhất desktop 1440×810 và mobile 390×844 cho: bìa rừng, trong nhà, form câu hỏi, dải bài, đang đọc bài. Mở ảnh ra xem trước khi báo xong. SwiftShader chậm nên game tự hạ đồ họa — bình thường.

## Quy ước

- Comment và chuỗi giao diện bằng tiếng Việt có dấu.
- Không commit `.env*`, `.dev.vars`, khóa API.
- Thay đổi lớn: lập kế hoạch/spec trước, chia việc nhỏ, mỗi việc kết thúc bằng typecheck + lint + build + ảnh chụp nếu đụng UI.
