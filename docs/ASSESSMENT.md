# Đánh giá tiếp quản (2026-11-01)

Phạm vi: đọc tài liệu và mã nguồn, chạy `typecheck` / `lint` / `build`, chạy `npm run dev` ở chế độ demo (chưa có `.env`), chụp màn hình bằng Playwright + Chromium (SwiftShader) ở desktop 1440×810 và mobile 390×844. Chưa sửa dòng code nào.

Ảnh chụp ở `docs/assessment/` theo dạng `{desktop|mobile}-{bước}.png`:
`01-bia-rung`, `01b-dang-vao-cua`, `02-trong-nha`, `03-form-cau-hoi`, `04-dai-bai`, `05-dang-doc-bai`, `05b-moi-rut-them`, `06-tong-ket`, `07-goi` (+ `07-goi-full`), `08-khung-hoang`.
SwiftShader chậm nên game tự hạ xuống "Đồ họa: nhẹ" (không bloom). Nút tròn "N" ở góc dưới trái là chỉ báo của Next dev, bản build không có.

## Tiến độ (cập nhật 2026-11-01, đợt 1)

Đã xong, mỗi việc một commit (ảnh sau khi sửa ở `docs/assessment/sau-p0/`):

| Việc | Lỗi | Ghi chú |
| --- | --- | --- |
| B1 | (L23) | git, `.gitattributes` (LF), lint bỏ qua thư mục skill. **Chưa đẩy lên GitHub**: máy chưa đăng nhập GitHub. |
| B2 | L16 | Hàm SQL `activate_payment` (migration 0002), mọi lỗi ghi DB trả 500 + log `[payos-webhook]`. |
| B4 | L18 | Migration 0003: khách không còn INSERT lá bài / lời thoại, chỉ UPDATE `note`, `happened`. |
| C1 | L17 | Migration 0004 + `DELETE /api/me`, `DELETE /api/reading/[id]`, nút trong nhật ký. Hạn mức đếm ở `reading_usage` để xóa phiên không hồi lượt. |
| B5 | L19 | Production thiếu biến thì đóng cửa + log; `DEMO_MODE=1` để cố ý chạy demo. |
| A1 | L1 | `.play-zone` flex cột. |
| A4 | L4 | Khóa trải bài tới hết phiên, thẻ hỗ trợ cố định, chỉ có "Ra về". |
| A2 (một phần) | L2 | Sửa trong `reader.ts` thay vì sửa dữ liệu: "người hỏi" → "cậu", lượt ≤ 28 từ. |
| A3 | L3 | Chỉ mời khi `offerClarifier`. |
| A5 | L5 | Thẻ "Bàn hôm nay". |
| A6 (một phần) | L6 | Gỡ "tổng kết tháng"; phần thông tin người bán / hoàn tiền / làm nổi gói năm còn lại. |
| B6 | L20 | Ảnh tĩnh + error boundary. |

Các migration 0002–0004 đã được chạy thử trên PGlite (Postgres WASM) với schema `auth` giả lập: 31 kiểm tra đạt (kích hoạt gói, gửi lặp, hoàn tác khi lỗi, RLS, xóa dữ liệu). Chưa chạy trên Supabase thật.

## 1. Kết quả kiểm tra

| Lệnh | Kết quả |
| --- | --- |
| `npm run typecheck` | Xanh |
| `npm run lint` | 0 lỗi, 376 cảnh báo, **toàn bộ** nằm trong bản sao skill impeccable (`.claude/`, `.agent/`, `.agents/`, `.gemini/`). `src/` sạch. |
| `npm run build` | Xanh, 17 route |
| `npm audit --omit=dev` | 0 lỗ hổng (20 lỗ hổng nằm ở devDependencies) |
| Cloudflare (`opennextjs-cloudflare build` + `wrangler deploy --dry-run`) | Xanh, gzip 1.785,75 KiB (< 3 MiB). Xem mục 6 |

Môi trường bàn giao có vấn đề: `node_modules` được chép sang bị hỏng (không có `.bin`, gói `next` chỉ còn `dist`), phải chạy `npm ci` lại. Thư mục dự án **chưa phải repo git**; `git ls-remote https://github.com/HTDKhoa/tarot.git` không trả về ref nào (repo rỗng, hoặc phải đăng nhập mới đọc được).

## 2. Những gì chạy tốt

- **Cảnh HD-2D đúng chất:** bìa rừng có trăng, sương, đom đóm, ánh cửa sổ ấm; camera tiến vào cửa; trong nhà có ánh nến, kệ sách, Nguyệt và Bấc. Pixel sắc nét ở cả hai kích thước, không thấy nhòe. Bảng màu đêm và font VT323 / Be Vietnam Pro đúng như CLAUDE.md (`desktop-01`, `desktop-02`, `mobile-02`).
- **Luồng demo đi được trọn vòng:** câu hỏi → chọn chủ đề và kiểu trải → dải 13 lá → chọn 3 lá → lật từng lá theo lời thoại → mời rút thêm → tổng kết → chào ra về. Không màn nào bị tràn ngang ở cả hai kích thước. Console sạch, chỉ có một cảnh báo `THREE.Clock` deprecated.
- **Rút bài đúng bất biến:** `draw.ts` dùng `crypto.getRandomValues` có rejection sampling, Fisher–Yates một phần, không lệch. Lá ngược 35%. Lá của ngày băm SHA-256 theo (người, ngày).
- **An toàn:** câu "Mình mệt quá, không muốn sống nữa" bị chặn trước khi rút bài, trước cả bước kiểm tra đăng nhập và hạn mức, có thẻ hỗ trợ với `tel:115` (`*-08-khung-hoang`). Câu hỏi y tế / pháp lý / tài chính có lời rào trước. `SUPPORT_LINES` để trống đúng như bất biến 2.
- **Server khá chắc tay:** mọi body đi qua zod; webhook payOS kiểm chữ ký, chặn cộng ngày hai lần bằng `update … where status = 'pending'`; RLS bật cho mọi bảng; callback đăng nhập chặn open redirect (`//`); hạn mức tính theo tháng giờ Việt Nam.
- **Kỷ luật demo một file:** asset và localStorage đều đi qua `assetUrl()` và `storageGet/Set`.

## 3. Lỗi tìm thấy

Mức độ: **P0** chặn ra mắt thu tiền · **P1** nên sửa trước khi ra mắt · **P2** sửa khi rảnh.

### Sản phẩm, giọng Nguyệt, giao diện

| # | Mức | Lỗi | Bằng chứng |
| --- | --- | --- | --- |
| L1 | P1 | **Hộp thoại che chú thích lá bài trên mobile.** Khi các nút hành động xếp thành hai dòng, hộp thoại cao lên và đè lên tên lá (thấy "Eight of Wands · ngược" bị cắt). `.table-zone` đặt cố định `bottom: 16rem` trong khi hộp thoại cao thấp tùy nội dung. | `mobile-05b-moi-rut-them.png`; `src/app/globals.css:514` |
| L2 | P1 | **Lời giải không đúng giọng Nguyệt.** Đoạn nghĩa lá lấy thẳng từ dữ liệu gọi khách là "người hỏi" chứ không phải "cậu". Đếm được 229/936 đoạn có "người hỏi", 86 đoạn dài quá 40 từ, 165 đoạn có dấu chấm phẩy. Trên mobile một câu chiếm 7 dòng. PERSONA quy định ≤ 25 từ mỗi câu và xưng "ta–cậu". | `desktop-05`, `mobile-05`; `src/lib/tarot/reader.ts:114`, `src/data/tarot_vi.json` |
| L3 | P1 | **Lần nào cũng mời rút thêm**, kể cả khi không có lý do ("Cậu muốn rút thêm một lá làm rõ…"), và lúc nào cũng hiện nút "Rút thêm một lá (3)". PERSONA: chỉ mời khi có lý do cụ thể và phải nói ra lý do. | `desktop-05b`; `reader.ts:135`, `HomeClient.tsx:289` |
| L4 | P1 | **Khủng hoảng chưa khóa rút bài.** Bấm nút trên thẻ hỗ trợ là về lại menu, có thể "Trải bài" ngay. PERSONA: "dừng trải bài, khóa rút bài, thẻ hỗ trợ cố định trên UI". Thẻ hỗ trợ cũng chỉ hiện sau khi chữ chạy xong, và nhắc lại gần như nguyên văn câu vừa nói. Nút ghi "Ta vẫn ở đây" là lời của Nguyệt nhưng lại đặt trên nút của khách. | `*-08-khung-hoang`; `HomeClient.tsx:314-318` |
| L5 | P1 | **Tổng kết biến mất.** Lời gom ý và lời dặn chạy qua rồi thôi; màn cuối chỉ còn câu chào ra về. Không có thẻ tóm tắt để đọc lại. Ở demo hoặc khi chưa vào nhật ký thì khách mất luôn nội dung vừa trả tiền để nghe. | `*-06-tong-ket` |
| L6 | P1 | **Trang /goi quảng cáo tính năng chưa có:** "Nhật ký và tổng kết tháng" không ghi "(sắp có)" dù tổng kết tháng chưa làm. "Mọi kiểu trải bài" cũng không phải quyền lợi riêng vì gói free cũng dùng được mọi kiểu. Thẻ gói năm (được chọn làm nổi bật) gần như không khác hai thẻ còn lại. | `*-07-goi`; `src/app/goi/page.tsx:29` |
| L7 | P2 | Tên lá trộn tiếng Anh và tiếng Việt: chú thích và lời thoại dùng `name_en` ("Five of Pentacles, lá ngược"), dải dưới lá dùng tên Việt rút gọn ("Tiền", "Cốc"). Cần chốt một quy ước. | `desktop-05`, `desktop-06` |
| L8 | P2 | Thanh trên cùng ở mobile rất chật ("Ngôi Nhà Trong Rừng" sát chữ "Gói"). Khi đã đăng nhập, nút "Tên · Thoát" chắc chắn sẽ làm tràn hoặc xuống dòng. | `mobile-01`; `TopBar.tsx` |
| L9 | P2 | Lá trong dải bài trên mobile chỉ lộ ra một khe khoảng 20–25 px để chạm, dưới mức tối thiểu 44 px. | `mobile-04-dai-bai` |
| L10 | P2 | Form câu hỏi không có nhãn cho hai hàng chip (chủ đề, kiểu trải); khách mới không biết hàng nào là gì. | `*-03-form-cau-hoi` |
| L11 | P2 | Chú thích dưới lá đè lên mép bàn và tay Nguyệt, độ tương phản thấp. | `desktop-05`, `mobile-06` |
| L12 | P2 | Lỗi không phải hạn mức (ví dụ "Không lưu được phiên") vẫn hiện nút "Xem các gói". | `HomeClient.tsx:129, 308-313` |
| L13 | P2 | Thanh điều hướng ở các trang phụ luôn hiện "Nhật ký", kể cả với khách chưa đăng nhập hoặc ở chế độ demo. | `PageShell.tsx` |

### Tiếp cận (a11y)

| # | Mức | Lỗi | Vị trí |
| --- | --- | --- | --- |
| L14 | P1 | Lời thoại nằm trong `<button aria-label="Tiếp">`, nên trình đọc màn hình chỉ đọc "Tiếp" mà không đọc nội dung. Vùng `aria-live` lại cập nhật theo từng ký tự đang chạy. | `Dialogue.tsx:445-450` |
| L15 | P2 | Không có `prefers-reduced-motion` (chữ chạy, lật bài, chuyển cảnh). `aria-label` của lá chỉ dùng tên tiếng Anh. | `globals.css`, `TarotCard.tsx:487` |

### Server, dữ liệu, thanh toán

| # | Mức | Lỗi | Vị trí |
| --- | --- | --- | --- |
| L16 | P0 | **Webhook không kiểm tra kết quả kích hoạt gói.** Đơn được chuyển sang `paid` trước; nếu `upsert` vào `subscriptions` lỗi thì webhook vẫn trả `success`, payOS không gửi lại, nghĩa là khách đã trả tiền mà không có gói và không ai biết. | `api/payments/webhook/route.ts:43` |
| L17 | P0 | **Chưa có cách xóa dữ liệu**, trong khi trang Quyền riêng tư hứa "xóa toàn bộ dữ liệu bất kỳ lúc nào". Migration không có policy `delete`, cũng không có API hay nút nào. Câu hỏi tarot là dữ liệu nhạy cảm (Nghị định 13/2023/NĐ-CP). | `supabase/migrations/0001_init.sql`, `rieng-tu/page.tsx` |
| L18 | P1 | **RLS cho khách tự ghi `reading_cards` và `messages`.** Khách đã đăng nhập có thể dùng publishable key gọi thẳng Supabase để chèn lá tùy ý vào phiên của mình hoặc chèn tin nhắn `role='nguyet'`. Việc này đi ngược tinh thần bất biến 1 ("tên lá chỉ lấy từ kết quả rút"). Policy `update` của `readings` cũng cho sửa mọi cột (status, summary…), không chỉ `note`/`happened`. | `0001_init.sql:109-120` |
| L19 | P1 | **Thiếu cấu hình thì tự rơi vào chế độ demo.** Nếu bản production build thiếu biến `NEXT_PUBLIC_SUPABASE_*`, web lặng lẽ chạy demo: không đăng nhập, không hạn mức, và client tự gửi lại danh sách lá trong `clarify`/`finish`. Production nên dừng hẳn thay vì mở cửa như vậy. | `lib/config.ts`, `api/reading/clarify/route.ts:47-50` |
| L20 | P1 | Không có fallback khi WebGL không chạy được (máy cũ, WebGL bị tắt) và không có error boundary, nên lỗi tạo context có thể làm trắng cả trang, kéo theo luồng đọc bài DOM. | `scene/Experience.tsx` |
| L21 | P2 | Hạn mức đếm rồi mới ghi, nên gửi song song nhiều request có thể vượt hạn mức. Bốc thêm lá song song thì request sau bị lỗi khóa chính, nhưng lỗi bị bỏ qua và client vẫn thấy lá chưa được lưu. Kết quả các lệnh `insert` phụ đều không được kiểm tra. | `api/reading/route.ts:63-67`, `clarify/route.ts:62-66` |
| L22 | P2 | Đơn hủy không bao giờ chuyển sang `cancelled`. Gọi payOS lỗi thì trả 500 trơn. Trang chờ thanh toán bảo "liên hệ hỗ trợ" nhưng cả web không có kênh liên hệ nào. | `payments/create`, `thanh-toan/PaymentStatus.tsx:19` |
| L23 | P2 | Lint quét cả thư mục skill impeccable nên sinh 376 cảnh báo nhiễu. Nên thêm các thư mục đó vào `globalIgnores`. | `eslint.config.mjs` |

## 4. Rủi ro

1. **Pháp lý khi thu tiền** (không phải tư vấn pháp lý, cần hỏi luật sư hoặc kế toán): website bán dịch vụ thường phải thông báo với Bộ Công Thương (online.gov.vn) và công khai thông tin người bán (tên, liên hệ, mã số thuế hoặc định danh), chính sách hoàn tiền và giải quyết khiếu nại. Dữ liệu nhạy cảm cần có sự đồng ý rõ ràng và quyền xóa (Nghị định 13/2023). Điều khoản ghi 18+ nhưng không có bước xác nhận tuổi. Thu nhập cá nhân phải kê khai thuế.
2. **Giọng sản phẩm:** đây là thứ khách trả tiền để nghe. Lời giải hiện tại đúng nghĩa nhưng nghe như tài liệu tham khảo (L2), dễ làm khách thất vọng ngay lượt đầu và hạ tỉ lệ chuyển sang gói trả phí.
3. **Chi phí 0đ:** bundle Cloudflare hiện ổn (mục 6), nhưng AI agent và tranh lá bài sẽ đẩy kích thước lên, nên đo lại sau mỗi lần thêm thư viện. Supabase gói free sẽ tạm dừng project sau khoảng 1 tuần không hoạt động; gói free cũng không có sao lưu tự động dài hạn.
4. **Hiệu năng mobile thật chưa đo.** Ảnh chụp chỉ chứng minh bố cục, không chứng minh tốc độ khung hình. Đường hạ đồ họa có tồn tại (`FpsProbe`) nhưng chưa thử trên máy Android tầm thấp.
5. **Không có test tự động** cho phần tiền (webhook, cộng ngày, hạn mức) và phần an toàn (bộ lọc khủng hoảng). Đây là hai chỗ sai thì hậu quả thật.
6. **Bộ lọc khủng hoảng bằng từ khóa** dễ lọt câu gián tiếp ("chẳng còn lý do gì để tiếp tục", viết không dấu kiểu "khong muon song" vẫn bắt được, nhưng "ko muốn sống" thì chưa). Chấp nhận được cho bản đầu, nhưng cần bộ test câu mẫu.
7. **Quy trình:** chưa có git nên chưa commit nhỏ được. Cần khởi tạo repo và đẩy lên `HTDKhoa/tarot` trước ticket đầu tiên.

## 5. Việc đề xuất

Ước lượng: S ≤ nửa ngày, M ≈ 1 ngày, L > 1 ngày. Các ticket có ★ là đề xuất làm trước khi ra mắt.

### (A) Thiết kế và trải nghiệm

| Mã | Việc | Cỡ |
| --- | --- | --- |
| A1 ★ | Sửa bố cục bàn bài + hộp thoại để không bao giờ đè nhau (đặt theo chiều cao thật của hộp thoại, hoặc gom vào một cột flex) (L1, L11) | M |
| A2 ★ | Biên tập lại dữ liệu lời thoại sang giọng Nguyệt: "người hỏi" → "cậu", tách câu ≤ 25 từ, bỏ dấu chấm phẩy; đổi "Còn đây là ý riêng của ta." thành mở đầu "còn ta thì…". Bắt đầu bằng script đếm/đánh dấu, rồi sửa có duyệt (L2) | L |
| A3 ★ | Chỉ mời rút thêm khi `offerClarifier`, kèm lý do; khi không mời thì nút rút thêm chỉ là lựa chọn phụ, không phải lời mời (L3) | S |
| A4 ★ | Luồng khủng hoảng: khóa nút trải bài trong phiên, thẻ hỗ trợ hiện ngay và cố định, bỏ đoạn lặp, đổi nhãn nút cho đúng vai khách (L4) | S |
| A5 ★ | Thẻ tổng kết cuối phiên: các lá + lời gom + lời dặn, đọc lại được, có nút sang nhật ký (L5) | M |
| A6 ★ | Trang /goi: sửa quyền lợi cho đúng sự thật, làm nổi gói năm, thêm khối thông tin người bán / liên hệ / hoàn tiền (L6, L22) | S |
| A7 | Chốt quy ước tên lá (gợi ý: tên Việt chính, tên Anh phụ) và áp dụng thống nhất (L7) | S |
| A8 | Thanh trên cùng ở mobile: gom vào menu gọn, thử với trạng thái đã đăng nhập (L8, L13) | S |
| A9 | Dải bài dễ chạm trên mobile (vùng chạm ≥ 44 px, hoặc vuốt để chọn) + nhãn cho hai hàng chip (L9, L10) | M |
| A10 | Tiếp cận: hộp thoại đọc được bằng trình đọc màn hình, chỉ thông báo khi xong câu, `prefers-reduced-motion`, nhãn lá bằng tiếng Việt (L14, L15) | M |
| A11 | Chăm chút các trang phụ (/goi, /nhat-ky, /thanh-toan, /dieu-khoan) cho cùng chất với cảnh chính, qua `/impeccable` sau khi đã có DESIGN.md ghi lại hệ hiện có | L |

### (B) Độ tin cậy và test

| Mã | Việc | Cỡ |
| --- | --- | --- |
| B1 ★ | Khởi tạo git, `.gitignore` đủ, commit trạng thái bàn giao, đẩy lên `HTDKhoa/tarot` | S |
| B2 ★ | Webhook: kiểm tra lỗi upsert, trả lỗi để payOS gửi lại (hoặc hoàn tác `paid`), ghi log (L16) | S |
| B3 ★ | Unit test (Vitest, chỉ là devDependency) cho `draw.ts` (phân bố, không trùng), `safety.ts` (bộ câu mẫu có dấu / không dấu / viết tắt), `vnMonthStart`, logic cộng ngày của webhook | M |
| B4 ★ | Siết RLS: bỏ policy insert của `reading_cards`/`messages`, server ghi qua RPC `security definer` hoặc admin client; giới hạn `update` của `readings` chỉ còn `note`/`happened` (L18) | M |
| B5 ★ | Production không được rơi về demo: thiếu cấu hình thì báo lỗi rõ ràng (L19) | S |
| B6 ★ | Error boundary + ảnh tĩnh thay thế khi WebGL lỗi; luồng đọc bài vẫn dùng được (L20) | M |
| B7 | Kiểm tra kết quả các `insert` phụ, chống vượt hạn mức khi gửi song song (đếm và ghi trong một RPC) (L21) | M |
| B8 | E2E Playwright cho luồng demo (dùng lại script chụp ảnh ở bước này) + chụp ảnh hồi quy desktop/mobile | M |
| B9 | Dọn lint (ignore thư mục skill), thêm script `check` chạy typecheck + lint + test + build (L23) | S |

### (C) Sẵn sàng ra mắt

| Mã | Việc | Cỡ |
| --- | --- | --- |
| C1 ★ | Xóa dữ liệu: nút "Xóa toàn bộ dữ liệu của tôi" + xóa từng phiên trong nhật ký; API xóa qua admin client (L17) | M |
| C2 ★ | Thiết lập Supabase thật (project, migration, Google OAuth, redirect URL) theo README; viết lại thành checklist đã kiểm chứng | M |
| C3 ★ | payOS: kênh thanh toán, webhook URL, thử một giao dịch thật số tiền nhỏ trên domain thật; xử lý đơn hủy (L22) | M |
| C4 ★ | Deploy Cloudflare: đo bundle bằng `wrangler deploy --dry-run`, đặt secret, domain, `NEXT_PUBLIC_SITE_URL` | M |
| C5 ★ | Pháp lý: hoàn thiện Điều khoản + Quyền riêng tư (bỏ dòng "bản nháp"), thông tin người bán, chính sách hoàn tiền, đồng ý xử lý dữ liệu nhạy cảm khi đăng nhập lần đầu, xác nhận 18+. Nội dung cần chủ dự án / luật sư duyệt; tôi chỉ soạn khung | M |
| C6 | Xác minh đường dây hỗ trợ tâm lý tại Việt Nam (chủ dự án gọi thử), rồi mới thêm vào `SUPPORT_LINES` | S |
| C7 | SEO và chia sẻ: ảnh Open Graph, favicon pixel, `robots`, `sitemap`; trang 404 có chất rừng | S |
| C8 | Theo dõi: dùng Cloudflare observability (đã bật) + log lỗi webhook; checklist vận hành (Supabase tạm dừng project, sao lưu thủ công) | S |

### (D) Để sau

| Mã | Việc |
| --- | --- |
| D1 | Agent Claude thay `reader.ts` (Haiku 5.5 hội thoại, Sonnet 5.5 tổng kết), giữ nguyên API, rút bài vẫn ở server |
| D2 | Bộ phân loại khủng hoảng bằng AI thay cho / chồng lên bộ lọc từ khóa |
| D3 | Vẽ 78 tranh lá bài theo style riêng |
| D4 | Bộ nhớ dài hạn + nút "Quên chuyện này đi", cài đặt xưng hô |
| D5 | Tổng kết tháng, thư cuối năm, âm thanh, giọng nói, tiếng Anh, app mobile |

### Thứ tự đề xuất
B1 → B5, B2, B4 (an toàn tiền và dữ liệu) → A1, A3, A4, A5 (lỗi trải nghiệm rõ nhất) → B3, B6 → A2 (biên tập giọng, làm song song được) → C1, A6, C5 → C2, C3, C4 (cần chủ dự án tạo tài khoản và đưa khóa) → phần còn lại của A và B.

## 6. Bundle Cloudflare

`npx opennextjs-cloudflare build` chạy xanh. `npx wrangler deploy --dry-run` báo **Total Upload 8.515 KiB / gzip 1.785,75 KiB**, tức khoảng 58% hạn mức 3 MiB của gói free; còn dư khoảng 1,2 MiB cho AI agent sau này.

OpenNext cảnh báo không hỗ trợ đầy đủ Windows và khuyên dùng WSL. Nên deploy từ WSL, hoặc từ GitHub Actions (miễn phí với repo này), thay vì từ Windows (bổ sung vào C4).
