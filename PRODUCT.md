# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

Web responsive, ưu tiên điện thoại. App iOS/Android dự kiến là bản đóng gói web (ví dụ Capacitor), nên vẫn dùng ngôn ngữ thiết kế của web.

## Users

Người Việt 18–35 tuổi, chủ yếu dùng điện thoại, tìm tarot để tự chiêm nghiệm về tình cảm, công việc và bản thân. Họ mang theo một câu hỏi cụ thể và muốn có người cùng nhìn vào nó, không cần lời tiên tri.

Mở rộng sau: khách quốc tế dùng tiếng Anh. Chưa làm; toàn bộ giao diện và lời thoại hiện chỉ có tiếng Việt.

## Product Purpose

Một trải nghiệm tarot để tự chiêm nghiệm: khách đi theo lối mòn trong rừng, gõ cửa một ngôi nhà gỗ và ngồi trước người giữ đèn để trải bài. Sản phẩm thu tiền bằng gói trả phí tại Việt Nam.

Thành công là khách quay lại vì cảm thấy được lắng nghe và được soi rõ câu hỏi của mình, rồi chọn ghé thường xuyên bằng gói trả phí.

## Positioning

Một người đọc bài có cá tính, ở trong một nơi chốn có thật để ghé lại. Đó là Nguyệt, người giữ đèn đội mũ trùm, với con cú Bấc trên vai, trong một ngôi nhà giữa rừng dựng bằng pixel art trong không gian 3D có ánh sáng (HD-2D). Nguyệt có giọng, có chính kiến và có những lá bài riêng mình thân hay e ngại. Định vị là tự chiêm nghiệm, không phải bói toán.

## Operating Context

- Luồng chính: bìa rừng → bước vào nhà → viết câu hỏi (Nguyệt tự chọn chủ đề và kiểu trải từ câu hỏi) → chọn lá từ dải bài úp → Nguyệt lật và giải từng lá → có thể bốc thêm tối đa 3 lá làm rõ → tổng kết và lời dặn.
- Lá bài của ngày: miễn phí, không giới hạn, cố định theo người và ngày.
- Nhật ký: các phiên đã đọc, ghi chú riêng, đánh dấu "điều đó đã xảy ra chưa", xóa từng phiên hoặc toàn bộ dữ liệu.
- Thanh toán: quét VietQR qua payOS bằng app ngân hàng, không lưu thẻ, không tự gia hạn.
- Đăng nhập: chỉ Google (Apple thêm khi làm app iOS).

## Capabilities and Constraints

- Rút bài chỉ diễn ra trên server, bằng crypto RNG. Client hay AI không bao giờ chọn lá; tên lá trong lời thoại chỉ lấy từ kết quả rút. Bộ 78 lá Waite-Smith, có lá ngược.
- Giá và hạn mức: free 3 lượt trải bài/tháng; gói tháng 69.000đ và gói năm 399.000đ, cùng 30 lượt/tháng; lá của ngày không giới hạn.
- An toàn đặt trước vai diễn: câu hỏi có dấu hiệu khủng hoảng thì dừng trải bài, khóa rút bài tới hết phiên, không tính hạn mức, hiện thẻ hỗ trợ (115). Câu hỏi y tế / pháp lý / tài chính thì nói rõ giới hạn, không khuyên mua, bán, dùng thuốc hay kiện tụng. Không ghi số đường dây hỗ trợ tâm lý chưa xác minh.
- Chi phí hạ tầng 0đ: Cloudflare Workers free (bundle < 3 MiB gzip), Supabase free, payOS free. Không thêm dịch vụ trả phí.
- Lời giải hiện ghép từ dữ liệu 78 lá; agent Claude (Haiku cho hội thoại, Sonnet cho tổng kết) sẽ thay sau, giữ nguyên API.
- Dữ liệu lá bài (`src/data/tarot_vi.json`) cố ý viết giọng trung tính để AI dùng sau; giọng Nguyệt được áp khi ghép lời.
- Quyết định còn mở: tên thương hiệu và tên nhân vật (cả hai đang là tên tạm); bản tiếng Anh; số đường dây hỗ trợ tâm lý; điều khoản và chính sách quyền riêng tư bản chính thức.

## Brand Commitments

- Tên tạm: "Ngôi Nhà Trong Rừng" (sản phẩm), "Nguyệt" (người giữ đèn), "Bấc" (con cú, không nói, chỉ phản ứng). Đừng khóa chặt thiết kế vào hai tên đầu vì chúng có thể đổi.
- Giọng Nguyệt theo `docs/PERSONA.md`: xưng "ta–cậu" (khách đổi được), câu ngắn, hình ảnh gần gũi (nến, sương, rễ cây, nước), ấm nhưng không ngọt, hay hỏi hơn giảng. Không emoji, không gạch đầu dòng trong lời thoại, không giọng thầy bói, không giọng trợ lý ảo. Không phán tuyệt đối, không đưa mốc thời gian, không dọa dẫm, không gợi ý cúng giải hay mua vật phẩm, không quảng cáo gói trả phí giữa lúc giải bài.
- Ràng buộc thị giác đã chốt (CLAUDE.md, bất biến 5): thẩm mỹ HD-2D pixel là cố ý, pixel sắc nét, không "hiện đại hóa" thành giao diện SaaS phẳng.
- Không dùng tên thương mại "Rider-Waite" khi quảng bá.

## Evidence on Hand

- Pixel art của cảnh, nhân vật và lá bài: `public/assets/`; script vẽ lại ở `art/`.
- Nghĩa 78 lá tiếng Việt: `src/data/tarot_vi.json`. Một phần lấy từ Tarotoo (MIT), bắt buộc giữ `THIRD_PARTY_NOTICES.md`.
- Persona đầy đủ kèm hội thoại mẫu: `docs/PERSONA.md` và bản Claude Doc được liên kết trong đó.
- Bản demo một file HTML: liên kết trong `docs/STATUS.md`.
- Chưa có: khách hàng, lời chứng thực, số liệu sử dụng, báo chí, 78 tranh lá bài riêng. Không được bịa ra những thứ này.

## Product Principles

1. **An toàn trước vai diễn.** Khi khách có dấu hiệu gặp nguy, nhân vật lùi lại và sự hỗ trợ thật lên trước.
2. **Trung thực với lá bài.** Lá do server rút; không bẻ nghĩa lá để chiều khách, không lờ lá khó, không bán lời hứa.
3. **Nguyệt là người, không phải tính năng.** Mọi chữ khách đọc trong ngôi nhà đều phải nghe như Nguyệt nói, kể cả lỗi và hạn mức.
4. **Nơi chốn trước giao diện.** Khách đang ghé thăm một ngôi nhà, không phải dùng một bảng điều khiển; các trang phụ cũng phải thuộc về thế giới đó.
5. **Tôn trọng dữ liệu nhạy cảm.** Câu hỏi tarot thường riêng tư: lưu ít, nói rõ lưu gì, và khách xóa được bất kỳ lúc nào.
