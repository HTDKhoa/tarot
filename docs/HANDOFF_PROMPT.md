# Bàn giao cho Claude Code

## 0. Chuẩn bị (chạy trong terminal, một lần)

```bash
unzip nguyet-tarot.zip && cd tarot-web
git init && git add -A && git commit -m "v0.1: bản bàn giao"
npm install
npx playwright install chromium        # để agent tự chụp màn hình kiểm tra
npx impeccable install                 # chọn Claude Code, phạm vi project
claude plugin install mattpocock-skills@claude-plugins-official
claude                                 # mở Claude Code trong thư mục dự án
```

Trong Claude Code, gõ `/` để kiểm tra đã thấy `/impeccable` và các lệnh như `/wayfinder`, `/to-tickets`, `/implement`, `/code-review`.

## 1. Prompt tiếp quản (dán nguyên văn)

```
Cậu tiếp quản dự án web tarot "Ngôi Nhà Trong Rừng". Mục tiêu: hoàn thiện web để ra mắt thu tiền ở Việt Nam, giữ nguyên chất HD-2D pixel và giọng của nhân vật Nguyệt.

Bước 1 — Hiểu dự án, CHƯA sửa code:
- Đọc CLAUDE.md, README.md, docs/PLAN.md, docs/PERSONA.md, docs/STATUS.md.
- Chạy npm run typecheck, npm run lint, npm run build; chạy npm run dev rồi dùng Playwright chụp desktop 1440×810 và mobile 390×844 các màn: bìa rừng, trong nhà, form câu hỏi, dải bài, đang đọc bài, tổng kết, trang /goi. Mở từng ảnh ra xem.
- Viết docs/ASSESSMENT.md: những gì chạy tốt, lỗi tìm thấy (kèm ảnh/đường dẫn file), rủi ro, và danh sách việc đề xuất chia theo 4 nhóm: (A) thiết kế & trải nghiệm, (B) độ tin cậy & test, (C) sẵn sàng ra mắt (deploy, Supabase, payOS, pháp lý), (D) để sau (AI agent, 78 tranh lá bài).

Bước 2 — Dừng lại, tóm tắt ASSESSMENT.md cho tôi trong 10 dòng và hỏi tôi duyệt trước khi làm tiếp.

Luật làm việc cho cả dự án:
- Tuân thủ mục "Bất biến" trong CLAUDE.md. Gặp việc buộc phải phá bất biến thì hỏi tôi trước.
- Mỗi thay đổi kết thúc bằng typecheck + lint + build xanh; đụng giao diện thì chụp lại desktop + mobile và tự xem.
- Commit nhỏ, thông điệp tiếng Việt, mỗi ticket một commit trở lên.
- Không thêm dịch vụ trả phí. Không đưa khóa bí mật vào code.
```

## 2. Thiết lập skill (gõ lần lượt)

1. `/setup-matt-pocock-skills` — nếu chưa có GitHub repo, chọn lưu issue/ticket dạng file markdown trong repo (ví dụ `docs/tickets/`).
2. `/impeccable init` — gợi ý trả lời:
   - Loại bề mặt: **product có màu sắc thương hiệu mạnh** (là ứng dụng dùng thật, nhưng cảm xúc và thẩm mỹ là sản phẩm).
   - Người dùng: người Việt 18–35, chủ yếu dùng điện thoại, tìm tarot để tự chiêm nghiệm về tình cảm, công việc, bản thân.
   - Giọng: bí ẩn, ấm, thân mật ("ta–cậu"), không sến, không giọng thầy bói.
   - Tham chiếu muốn giống: game HD-2D (Octopath Traveler), Eastward, Stardew Valley về độ ấm; anti-reference: web tarot bói toán màu mè, giao diện SaaS phẳng, gradient tím-hồng chung chung.
   - Hệ thiết kế hiện có: bảng màu đêm (navy #141a33, tím mận #3a1c3a, vàng nến #d9ae55, kem #f3e9d2), VT323 cho tiêu đề/nút, Be Vietnam Pro cho đoạn văn, khung pixel viền vàng. Yêu cầu: **ghi lại hệ hiện có vào DESIGN.md, không thay mới**.

## 3. Thiết kế với Impeccable (sau khi duyệt ASSESSMENT)

```
/impeccable critique toàn bộ luồng trên mobile: bìa rừng → trong nhà → đặt câu hỏi → chọn lá → đọc bài → tổng kết
```
Đọc báo cáo, chọn điểm muốn sửa, rồi:
```
/impeccable audit
/impeccable polish hộp thoại và lá bài
/impeccable polish các trang /goi, /nhat-ky, /thanh-toan cho đồng bộ với cảnh chính
```
Nhắc thêm nếu cần: "Giữ pixel sắc nét và bảng màu trong DESIGN.md; chụp lại desktop + mobile sau mỗi lần polish."

## 4. Kỹ thuật với bộ skill của Matt Pocock

```
/wayfinder hoàn thiện web để ra mắt: các nhóm B và C trong docs/ASSESSMENT.md
```
Rồi biến kế hoạch thành ticket và làm từng cái:
```
/to-tickets
/implement <tên hoặc đường dẫn ticket>
```
Ưu tiên ticket gợi ý:
1. Test cho phần lõi bằng TDD: `draw.ts` (không trùng lá, tỉ lệ ngược, exclude), `reader.ts` (không nhắc lá ngoài bàn), `safety.ts` (bắt các câu khủng hoảng tiếng Việt có/không dấu), tính hạn mức theo tháng giờ VN, webhook payOS (chữ ký sai, gọi lặp, số tiền thiếu).
2. Test e2e Playwright cho luồng demo đầy đủ trên desktop + mobile.
3. Cài đặt xưng hô (ta–cậu / mình–bạn / chị–em) lưu vào `profiles.address_style`.
4. Nút "Xóa dữ liệu của tôi" và "Quên phiên này" trong nhật ký.
5. Checklist deploy thật: Supabase, Google OAuth, payOS sandbox → production, `npm run deploy`, kiểm webhook.

Sau mỗi ticket lớn:
```
/code-review
```

## 5. Khi muốn dừng và đổi phiên

```
/handoff
```
Lưu tài liệu bàn giao vào `docs/`, phiên sau mở bằng: "Đọc CLAUDE.md và docs/<file handoff> rồi tiếp tục."

## Ghi chú
- Giai đoạn gắn AI (Claude Haiku 5.5 + Sonnet 5.5 thay `src/lib/tarot/reader.ts`) để sau khi web ổn định; persona và bản nháp system prompt ở link trong `docs/PERSONA.md`.
- Nếu agent đề xuất đổi thẩm mỹ, giá, cách rút bài hoặc luật an toàn: yêu cầu nó ghi lý do vào `docs/decisions/` và chờ bạn duyệt.
