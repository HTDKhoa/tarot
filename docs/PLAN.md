# Kế hoạch sản phẩm (tóm tắt)

Bản đầy đủ (Claude Doc): https://claude.ai/artifact/TJAFoKq7V6c8t9CTwjok9R

## Quyết định đã chốt
- Thị trường: Việt Nam trước, quốc tế sau (thêm tiếng Anh).
- Phong cách: HD-2D — sprite pixel trong không gian 3D có ánh sáng, bloom, chiều sâu.
- Nền tảng: web responsive desktop + mobile; app iOS/Android sau (đóng gói web, ví dụ Capacitor).
- Tương tác: chat chữ trước, giọng nói sau.
- Bộ bài: 78 lá Waite-Smith vẽ lại theo style riêng, có lá ngược. Không dùng tên thương mại "Rider-Waite" khi quảng bá.
- Đăng nhập: chỉ Google (Apple thêm khi làm app iOS).
- Giá: 69.000đ/tháng, 399.000đ/năm; free 3 lượt/tháng, trả phí 30 lượt/tháng; lá bài của ngày không giới hạn.
- Nhân vật: Người Giữ Đèn Rừng (tên tạm Nguyệt) bản 2B — mũ trùm xanh đêm thêu tuần trăng, mắt trăng khuyết vàng sáng trong bóng tối, lộ cằm và môi dưới ánh nến, mặt dây chuyền đá xanh ngọc, cú Bấc trên vai trái.
- AI (giai đoạn sau): Claude Haiku 5.5 cho hội thoại; Claude Sonnet 5.5 cho tổng kết trải bài ≥ 3 lá, Celtic Cross, thư tổng kết. Server rút bài bằng crypto RNG.
- Ngân sách khởi đầu < 5 triệu đồng; hạ tầng dùng gói miễn phí (Cloudflare, Supabase, payOS).

## Lộ trình
0. Chuẩn bị: persona bible ✓, nghĩa 78 lá (bản nháp ✓), prototype AI dạng chữ.
1. MVP: nội thất HD-2D ✓, luồng trải bài ✓, đăng nhập Google ✓, nhật ký ✓, payOS ✓ — cần hoàn thiện, kiểm thử, deploy.
2. Ra mắt: cảnh rừng ✓, tổng kết tháng, trang chính sách, kênh nội dung ngắn.
3. Mở rộng: giọng nói, tiếng Anh, sự kiện theo mùa, Apple login, vẽ lại đủ 78 tranh lá.
4. App mobile.

## Pháp lý cần lưu ý (không phải tư vấn pháp lý)
- Định vị giải trí và tự chiêm nghiệm, không tiên tri; có điều khoản và miễn trừ rõ.
- Bảo vệ dữ liệu cá nhân: câu hỏi tarot thường nhạy cảm; có chính sách quyền riêng tư và nút xóa dữ liệu.
- Thu tiền online với tư cách cá nhân vẫn phải kê khai thuế.
