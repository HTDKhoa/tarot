# Trạng thái (v0.1, 2026-11-01)

Demo online (một file HTML, chạy trong trình duyệt): https://claude.ai/artifact/6oHkSpp9omN939qmisxhQu

## Đã có
- Next.js 16 + TS + Tailwind 4; deploy Cloudflare Workers qua @opennextjs/cloudflare (đã build và chạy bằng wrangler dev; bundle ~1,8 MiB gzip).
- Cảnh HD-2D: bìa rừng parallax (sương, đom đóm, trăng) → camera tiến vào cửa → trong nhà (ánh nến chập chờn, bloom, vignette). Nguyệt thở/chớp mắt/nói; mắt và mặt dây chuyền đổi màu theo tag; Bấc chớp mắt/nghiêng đầu; tự hạ đồ họa khi FPS < 38.
- Pixel art: `public/assets`, script vẽ lại ở `art/`.
- Luồng đọc bài: câu hỏi + chủ đề + kiểu trải (1 lá; Quá khứ–Hiện tại–Hướng đi; Tình huống–Trở ngại–Lời khuyên) → khách chọn lá từ dải bài → lật từng lá theo lời thoại → mời bốc thêm (tối đa 3) → tổng kết + lời dặn. Lá bài của ngày cố định theo người/ngày.
- Lọc an toàn tạm bằng từ khóa (`src/lib/safety.ts`).
- Supabase: schema + RLS, Google OAuth, nhật ký (danh sách, chi tiết, ghi chú, "đã xảy ra chưa"), hạn mức theo tháng giờ VN.
- payOS: tạo link VietQR, webhook kiểm chữ ký + chống cộng ngày hai lần, trang chờ xác nhận.
- Trang: /goi, /nhat-ky, /nhat-ky/[id], /thanh-toan, /dieu-khoan, /rieng-tu (bản nháp).

## Còn thiếu / biết là chưa tốt
- Chưa có AI: `src/lib/tarot/reader.ts` ghép câu từ dữ liệu (đúng nghĩa nhưng lặp khuôn).
- Mặt trước lá bài mới là biểu tượng chất + số + tên; chưa có 78 tranh.
- Chưa có test tự động (unit/e2e).
- Chưa có âm thanh, tổng kết tháng, bộ nhớ dài hạn, "quên chuyện này", cài đặt xưng hô.
- Trang Gói/Nhật ký/Điều khoản dùng layout đơn giản, chưa được chăm chút như cảnh chính.
- Truy cập bàn phím/đọc màn hình chưa được audit; hiệu năng mobile chưa đo trên máy thật.
- Số đường dây hỗ trợ tâm lý VN chưa xác minh (`SUPPORT_LINES` đang rỗng).
- Điều khoản/quyền riêng tư là bản nháp, cần rà soát pháp lý.
