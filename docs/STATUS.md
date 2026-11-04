# Trạng thái (v0.2, 2026-11-01)

Demo online (một file HTML, chạy trong trình duyệt): https://claude.ai/artifact/6oHkSpp9omN939qmisxhQu (bản v0.1, chưa có các sửa đổi bên dưới)

Đánh giá tiếp quản và danh sách việc: `docs/ASSESSMENT.md`. Ảnh trước / sau: `docs/assessment/` và `docs/assessment/sau-p0/`.

## Đã có
- Next.js 16 + TS + Tailwind 4; deploy Cloudflare Workers qua @opennextjs/cloudflare (bundle ~1,8 MiB gzip, đo bằng `wrangler deploy --dry-run`).
- Cảnh HD-2D: bìa rừng parallax (sương, đom đóm, trăng) → camera tiến vào cửa → trong nhà (ánh nến chập chờn, bloom, vignette). Nguyệt thở/chớp mắt/nói; mắt và mặt dây chuyền đổi màu theo tag; Bấc chớp mắt/nghiêng đầu; tự hạ đồ họa khi FPS < 38. Không có WebGL hoặc cảnh 3D lỗi thì hiện ảnh tĩnh (`public/assets/fallback/`, `SceneStage.tsx`).
- Pixel art: `public/assets`, script vẽ lại ở `art/`.
- 78 tranh lá bài (vẽ tay, 97×181, khung vàng + dải tên kem) và mặt sau cùng cỡ; làm sạch và xuất bằng `art/cards_clean.py` (xem `docs/CARD_ART.md`).
- Luồng đọc bài: khách chỉ viết câu hỏi (chuyện gì cũng được, không gom chủ đề), Claude Haiku 5.5 chọn kiểu trải (1 lá; Quá khứ–Hiện tại–Hướng đi; Tình huống–Trở ngại–Lời khuyên) và viết một câu Nguyệt nói vì sao trải như vậy ngay trong lời mời "Cậu chọn N lá" (`chooseAI.ts`; chưa có `ANTHROPIC_API_KEY`, lỗi, quá 5 giây hay AI từ chối thì quay về đoán từ khóa trong `choose.ts`; kiểm khủng hoảng chạy trước AI; AI không bao giờ chọn lá) → khách chọn lá từ dải bài → lật từng lá theo lời thoại → chỉ mời bốc thêm khi có lý do (tối đa 3) → trang "Bàn hôm nay" trong sổ. Hai góc máy (mặt Nguyệt / mặt bàn): trải bài diễn ra trên mặt bàn với tay Nguyệt, lá theo đúng hình trải, cuốn sổ của Bấc (câu hỏi, lời Nguyệt theo từng lá, trang tổng kết) và ô chân dung trong hộp thoại. Lá bài của ngày cố định theo người/ngày.
- Giọng: dữ liệu lá giữ giọng trung tính; `reader.ts` đổi "người hỏi" thành "cậu" và tách thành các lượt ≤ 28 từ.
- An toàn: lọc từ khóa (`src/lib/safety.ts`); khủng hoảng thì khóa trải bài tới hết phiên (sessionStorage), câu hỏi khủng hoảng bị chặn ngay ở trình duyệt (cùng hàm với máy chủ) nên không hạ máy, không xào bài; thẻ hỗ trợ cố định có "Ngồi thêm một lúc" và "Ra về".
- Supabase: schema + RLS (migrations 0001–0004), Google OAuth, nhật ký (danh sách, chi tiết, ghi chú, "đã xảy ra chưa", xóa phiên, xóa toàn bộ dữ liệu), hạn mức theo tháng giờ VN đếm ở `reading_usage`. Khách không ghi được lá bài / lời thoại; mọi ghi phía server dùng secret key và kiểm lỗi.
- payOS: tạo link VietQR; webhook kiểm chữ ký, kích hoạt gói bằng hàm SQL `activate_payment` trong một transaction, lỗi thì trả 500 để payOS gửi lại.
- Production thiếu biến Supabase thì đóng cửa và ghi log rõ ràng; muốn cố ý chạy demo thì đặt `DEMO_MODE=1`.
- Trang: /goi, /nhat-ky, /nhat-ky/[id], /thanh-toan, /dieu-khoan, /rieng-tu (bản nháp).

## Còn thiếu / biết là chưa tốt
- Lời đọc: tên lá và lời tả tranh lấy từ dữ liệu theo kết quả rút; nghĩa từng lá và ý riêng "còn ta thì…" do Claude Haiku 5.5 viết theo đúng câu hỏi, chỉ dựa trên dữ liệu lá được đưa (`readAI.ts`), qua bộ kiểm giọng `aiGuard.ts` (không "tôi", emoji, gạch đầu dòng, giọng thầy bói, tên lá chưa rút); sai một chỗ hay lỗi/quá 15 giây thì cả bàn quay về ghép câu (`reader.ts`). Chờ máy chủ thêm khoảng 3–7 giây cho hai lượt gọi. Lá làm rõ và lời kết vẫn ghép từ dữ liệu.
- Trời trong tranh lá là chấm nhiễu nhẹ, chưa phải dither đều; vài góc chỗ xóa số La Mã cũ còn thấy đường nối nếu soi kỹ.
- `npm run build:demo`: bước Vite cần cài lại `node_modules` trên Windows (thiếu `@rolldown/binding-win32-x64-msvc`).
- Chưa có test tự động trong repo (migration đã được thử trên PGlite trong lúc làm, nhưng chưa thành bộ test).
- Chưa có âm thanh, tổng kết tháng, bộ nhớ dài hạn, "quên chuyện này", cài đặt xưng hô.
- Trang Gói/Nhật ký/Điều khoản dùng layout đơn giản, chưa được chăm chút như cảnh chính. Lúc tổng kết, lá trên bàn che một phần mặt Nguyệt; bàn 6 lá trên mobile phải cuộn nhẹ.
- Truy cập bàn phím/đọc màn hình chưa được audit; hiệu năng mobile chưa đo trên máy thật.
- Số đường dây hỗ trợ tâm lý VN chưa xác minh (`SUPPORT_LINES` đang rỗng).
- Điều khoản/quyền riêng tư là bản nháp, cần rà soát pháp lý.
