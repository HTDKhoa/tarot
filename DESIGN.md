---
name: Ngôi Nhà Trong Rừng
description: Tarot tự chiêm nghiệm trong một ngôi nhà gỗ HD-2D, nơi ánh nến là thứ duy nhất phát sáng.
colors:
  forest-night: "#08060d"
  hood-navy: "#141a33"
  hood-navy-light: "#1d2547"
  hood-navy-lit: "#2a3463"
  plum-dusk: "#3a1c3a"
  ink-outline: "#160c1c"
  card-face: "#2a2140"
  candle-gold: "#d9ae55"
  flame-gold: "#f3d68b"
  candle-cream: "#fff4d6"
  ember-brown: "#5a3d16"
  ember-brown-lit: "#74501d"
  ember-deep: "#4a3214"
  old-paper: "#f3e9d2"
  mist: "#b9b0c9"
  moonlit-blue: "#9ec3ff"
  brick-ember: "#d98a75"
  brick-deep: "#3a1616"
  brick-deep-lit: "#522020"
  brick-cream: "#ffe1d6"
  rose-ash: "#f0b9a0"
  paper: "#ebdebe"
  ink: "#3a2410"
  ink-soft: "#74501d"
  leather: "#5a3c2e"
typography:
  display:
    fontFamily: "VT323, ui-monospace, monospace"
    fontSize: "clamp(2.6rem, 7vw, 4.4rem)"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "0.02em"
  headline:
    fontFamily: "VT323, ui-monospace, monospace"
    fontSize: "clamp(2.2rem, 6vw, 3.2rem)"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "0.02em"
  title:
    fontFamily: "VT323, ui-monospace, monospace"
    fontSize: "1.7rem"
    fontWeight: 400
    lineHeight: 1.1
  label:
    fontFamily: "VT323, ui-monospace, monospace"
    fontSize: "1.35rem"
    fontWeight: 400
    lineHeight: 1
  label-md:
    fontFamily: "VT323, ui-monospace, monospace"
    fontSize: "1.2rem"
    fontWeight: 400
    lineHeight: 1.05
  label-sm:
    fontFamily: "VT323, ui-monospace, monospace"
    fontSize: "1.15rem"
    fontWeight: 400
    lineHeight: 1.05
  body:
    fontFamily: "Be Vietnam Pro, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.7
  body-dialogue:
    fontFamily: "Be Vietnam Pro, system-ui, sans-serif"
    fontSize: "clamp(0.98rem, 2.3vw, 1.08rem)"
    fontWeight: 400
    lineHeight: 1.6
  body-strong:
    fontFamily: "Be Vietnam Pro, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 600
    lineHeight: 1.6
  body-notebook:
    fontFamily: "Be Vietnam Pro, system-ui, sans-serif"
    fontSize: "0.94rem"
    fontWeight: 400
    lineHeight: 1.6
  body-sm:
    fontFamily: "Be Vietnam Pro, system-ui, sans-serif"
    fontSize: "0.86rem"
    fontWeight: 400
    lineHeight: 1.35
rounded:
  none: "0px"
spacing:
  xs: "0.4rem"
  sm: "0.6rem"
  md: "0.8rem"
  lg: "1.2rem"
  xl: "2rem"
components:
  button:
    backgroundColor: "{colors.hood-navy-light}"
    textColor: "{colors.old-paper}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "0.5rem 0.9rem 0.45rem"
  button-hover:
    backgroundColor: "{colors.hood-navy-lit}"
  button-gold:
    backgroundColor: "{colors.ember-brown}"
    textColor: "{colors.candle-cream}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "0.5rem 0.9rem 0.45rem"
  button-gold-hover:
    backgroundColor: "{colors.ember-brown-lit}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.old-paper}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "0.5rem 0.9rem 0.45rem"
  button-danger:
    backgroundColor: "{colors.brick-deep}"
    textColor: "{colors.brick-cream}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "0.5rem 0.9rem 0.45rem"
  button-danger-hover:
    backgroundColor: "{colors.brick-deep-lit}"
  chip:
    backgroundColor: "rgba(8, 6, 13, 0.4)"
    textColor: "{colors.old-paper}"
    typography: "{typography.label-sm}"
    rounded: "{rounded.none}"
    padding: "0.15rem 0.6rem"
  chip-on:
    backgroundColor: "{colors.ember-deep}"
    textColor: "{colors.candle-cream}"
  dialogue-panel:
    backgroundColor: "{colors.hood-navy}"
    textColor: "{colors.old-paper}"
    typography: "{typography.body-dialogue}"
    rounded: "{rounded.none}"
    padding: "1.4rem 1.2rem 1rem"
  name-tag:
    backgroundColor: "{colors.plum-dusk}"
    textColor: "{colors.flame-gold}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "0.05rem 0.6rem"
  text-input:
    backgroundColor: "rgba(8, 6, 13, 0.6)"
    textColor: "{colors.old-paper}"
    typography: "{typography.body}"
    rounded: "{rounded.none}"
    padding: "0.6rem 0.7rem"
  tarot-card-md:
    backgroundColor: "{colors.card-face}"
    rounded: "{rounded.none}"
    width: "clamp(72px, 13vw, 120px)"
  tarot-card-sm:
    backgroundColor: "{colors.card-face}"
    rounded: "{rounded.none}"
    width: "clamp(54px, 9vw, 88px)"
  tarot-card-table:
    backgroundColor: "{colors.card-face}"
    rounded: "{rounded.none}"
    width: "clamp(72px, min(21.5vw, 15vh), 136px)"
  tarot-card-clarifier:
    backgroundColor: "{colors.card-face}"
    rounded: "{rounded.none}"
    width: "clamp(54px, min(7.5vw, 10vh), 96px)"
  table-caption:
    backgroundColor: "rgba(8, 6, 13, 0.66)"
    textColor: "{colors.flame-gold}"
    typography: "{typography.label-md}"
    rounded: "{rounded.none}"
    padding: "0.05rem 0.35rem"
  shot-toggle:
    backgroundColor: "rgba(8, 6, 13, 0.62)"
    textColor: "{colors.old-paper}"
    typography: "{typography.label-md}"
    rounded: "{rounded.none}"
    padding: "0 0.9rem"
    height: "44px"
  portrait:
    backgroundColor: "{colors.hood-navy}"
    rounded: "{rounded.none}"
    size: "72px"
  notebook-page:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.body-notebook}"
    rounded: "{rounded.none}"
    padding: "0.5rem 0.4rem 1rem"
  notebook-edge:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "0.35rem 0.6rem"
  notebook-close:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.label-md}"
    rounded: "{rounded.none}"
    padding: "0 0.7rem"
    height: "44px"
---

# Design System: Ngôi Nhà Trong Rừng

## Overview

**Creative North Star: "Ngọn đèn cuối lối mòn"**

Mọi thứ bắt đầu từ bóng tối. Nền là đêm rừng và xanh mũ trùm, gần như không có màu. Thứ duy nhất phát sáng là ánh vàng của nến. Thứ quan trọng trên màn hình không được tô màu cho nổi lên mà được *thắp* lên: lựa chọn đang bật, người đang nói, lá vừa lật. Khách đi trong một đêm dài, và giao diện chỉ là những đốm sáng dẫn đường.

Thế giới được dựng kiểu HD-2D: sprite pixel đặt trong không gian 3D có ánh sáng, sương, bloom và vignette. Giao diện DOM nằm trên cảnh như lớp hộp thoại của một game JRPG, nhưng tiết chế. Khung lùi về sau để cảnh và lời Nguyệt nói lên trước. Mật độ thấp: mỗi lúc chỉ một hộp thoại, một bàn bài, một vài nút.

Tham chiếu cần giống: game HD-2D (Octopath Traveler), Eastward, và độ ấm của Stardew Valley. Cần tránh: web bói toán màu mè, giao diện SaaS phẳng, gradient tím-hồng chung chung.

**Key Characteristics:**
- Nền tối xanh đêm, ánh vàng nến là điểm sáng duy nhất.
- Pixel sắc nét ở mọi tầng: sprite, canvas và ảnh đều phóng to kiểu nearest-neighbor.
- Góc vuông tuyệt đối, viền đặc 2–3 px, bóng đặc lệch xuống thay cho bóng nhòe.
- Hai giọng chữ: VT323 cho thứ để bấm và gọi tên, Be Vietnam Pro cho thứ để đọc.
- Thành phần trầm và tiết chế; cảnh và lời thoại dẫn dắt.
- Trong nhà là một khung liền: mặt Nguyệt để trò chuyện, máy lia dọc xuống chính chiếc bàn ngay dưới tay nàng để trải bài.

## Colors

Bảng màu đêm, gần đơn sắc: xanh mũ trùm và tím mận làm nền, một tông vàng nến làm ánh sáng, kem giấy cũ cho chữ.

### Primary
- **Vàng Nến** (candle-gold): viền khung pixel, viền thẻ tên, viền ô nhập khi focus. Là "kim loại" của ngôi nhà; xuất hiện mảnh, chạy quanh mép chứ không phủ mặt.
- **Ngọn Lửa** (flame-gold): phần sáng nhất của ánh nến. Dùng cho tiêu đề pixel, tên người nói, tên lá đã lật, viền của lựa chọn đang bật, nét focus đứt, mũi tên "tiếp" nhấp nháy.
- **Than Hồng** (ember-brown, sáng lên thành ember-brown-lit khi hover) và **Than Trầm** (ember-deep): nền của nút chính và chip đang bật. Là vàng nến đã cháy xuống, ấm mà không chói.
- **Kem Ánh Nến** (candle-cream): chữ trên nền than hồng.

### Secondary
- **Tím Mận** (plum-dusk): nền thẻ tên "Nguyệt" và các nhãn nhô lên mép khung; màu áo của người giữ đèn.

### Tertiary
- **Xanh Trăng** (moonlit-blue): chữ "ngược" của lá ngược (trên bàn, trong dải và trong nhật ký), và ánh mắt trăng khuyết của Nguyệt khi lo lắng; tức ánh trăng lạnh đối lại ánh nến.
- **Gạch Hồng** (brick-ember, nền brick-deep sẫm lên thành brick-deep-lit khi hover, chữ brick-cream): chỉ cho hành động không hoàn tác được (xóa dữ liệu).
- **Tro Hồng** (rose-ash): viền thẻ hỗ trợ khi khủng hoảng và chữ báo lỗi. Ấm và rõ, không báo động đỏ.

### Neutral
- **Đêm Rừng Sâu** (forest-night): nền trang, màu theme của trình duyệt, nền lớp mờ khi chuyển cảnh.
- **Xanh Mũ Trùm** (hood-navy) và **Xanh Mũ Trùm Nhạt** (hood-navy-light, sáng lên thành hood-navy-lit khi hover): mặt khung pixel (dải chuyển từ hood-navy-light xuống một xanh tím đêm sẫm hơn, rgba(20, 16, 38, 0.96)), nền nút thường, mặt sau lá bài.
- **Mặt Lá** (card-face): nền ô hình trên mặt trước lá bài, lộ ra qua khung kem vẽ pixel.
- **Kem Giấy Cũ** (old-paper): mọi chữ đọc được trên nền tối.
- **Khói Sương** (mist): chữ phụ, nhãn vị trí lá, gợi ý, viền nút thường (đầy đủ) và viền chip (mờ 40–50%).
- **Mực Viền** (ink-outline): đường viền ngoài cùng của sprite và khung, bóng đặc dưới nút; màu tối nhất trong bảng màu sprite.

### Sổ của Bấc
Bộ màu riêng của cuốn sổ, một vật bằng giấy và da nằm dưới ánh nến, cùng họ nâu-kem với bảng màu sprite.
- **Giấy Sổ** (paper): mặt trang sổ mở và mép trang thò ra dưới bìa. Kem dịu hơn Kem Giấy Cũ để không chói khi nằm cạnh ngọn nến. Đây chính là màu kem `cr` của bảng sprite, nên khung kem và dải tên vẽ trên mặt lá cũng là màu này.
- **Mực Nâu** (ink): chữ trên trang sổ, tiêu đề "Sổ của Bấc", tên lá trong sổ, chữ nút "Gập sổ", và tên in trên dải kem của mặt lá. Viền mép trang và vạch kẻ dùng chính màu này ở độ mờ 35–45%.
- **Mực Nhạt** (ink-soft): tiêu đề mục trong sổ ("Bàn hôm nay"). Cùng giá trị với Than Hồng (hover) nhưng khác vai: mực trên giấy, không phải nền nút.
- **Da Bìa** (leather): viền nút trong sổ, vạch đôi 4 px mở đầu trang tổng kết, thanh cuộn; nền mờ 10–12% cho ô "Lời dặn" và hover nút.

Sprite trong `public/assets` dùng chung một bảng khoảng 43 màu (`art/common.py`), viền mực #160c1c, đổ bóng bằng dithering Bayer 4×4. Màu CSS ở trên lấy từ cùng họ đó.

### Named Rules
**Luật Một Ngọn Nến.** Vàng là ánh sáng, không phải sơn. Chỉ thứ đang được chọn, đang nói hoặc vừa lật mới mang Ngọn Lửa; vàng không phủ những mảng lớn.

**Luật Không Tím Hồng.** Không gradient tím-hồng, không màu neon "huyền bí". Bí ẩn đến từ bóng tối, không đến từ sắc độ.

**Luật Trang Sổ.** Trong lớp giao diện, Giấy Sổ, Mực Nâu, Mực Nhạt và Da Bìa chỉ sống trong cuốn sổ của Bấc; ngoại lệ duy nhất là dải tên kem trên mặt lá, nơi tên lá in bằng Mực Nâu như chữ trên giấy. Trên trang sổ chữ là mực, không bao giờ là Ngọn Lửa; vàng chỉ chạm vào sổ ở viền hover và nét focus.

## Typography

**Display Font:** VT323 (fallback ui-monospace, monospace)
**Body Font:** Be Vietnam Pro 400 / 600 (fallback system-ui, sans-serif)

**Character:** VT323 là font bitmap của màn hình game cũ, nên nút, tiêu đề và nhãn có cảm giác thuộc về thế giới pixel. Be Vietnam Pro là sans-serif dựng cho tiếng Việt, đủ dấu và đủ thoáng để đọc lời Nguyệt trên điện thoại. Cả hai nạp bộ ký tự `vietnamese` và `latin`.

### Hierarchy
- **Display** (400, clamp(2.6rem, 7vw, 4.4rem), 1): tên ngôi nhà ở bìa rừng; quầng sáng vàng và bóng mực đặc bên dưới.
- **Headline** (400, clamp(2.2rem, 6vw, 3.2rem), 1): tiêu đề trang phụ (Gói, Nhật ký, Điều khoản…).
- **Title** (400, 1.7rem, 1.1): tiêu đề mục trong trang phụ, tên gói.
- **Label** (400, 1.35rem, 1): chữ trên nút, thẻ tên người nói, thanh trên cùng (cả thương hiệu và liên kết dùng Label nhỏ trên mobile), tiêu đề "Sổ của Bấc", thông báo ngôi nhà đóng cửa, nhãn ghi chú và danh sách lá trong nhật ký.
- **Label vừa** (400, 1.2rem, 1.05): tên lá dưới lá bài, nút đổi góc máy, nút "Gập sổ", tên lá và tiêu đề mục trong sổ, bộ đếm "Đã chọn n/3", dãy tên lá trong danh sách nhật ký.
- **Label nhỏ** (400, 1.15rem): chip, gợi ý, bộ đếm ký tự và hạn mức, nhãn vị trí dưới lá, nút ▼, ngày trong danh sách nhật ký, nhãn trong trang tổng kết của sổ.
- **Body** (400, 1rem, 1.7): đoạn văn trong trang phụ.
- **Body hội thoại** (400, clamp(0.98rem, 2.3vw, 1.08rem), 1.6): lời Nguyệt trong hộp thoại, chữ chạy từng ký tự.
- **Body sổ** (400, 0.94rem, 1.6): lời giải từng lá và trang tổng kết trong sổ của Bấc; câu hỏi của khách ở đầu trang dùng bản 600.
- **Body nhỏ** (400, 0.86rem, 1.35): chữ phụ: ghi chú pháp lý ở bìa rừng, lỗi ngay dưới nút, mép trang thò ra dưới bìa sổ (tối đa 2 dòng), ghi chú dưới giá gói, tóm tắt trong danh sách nhật ký.

Mọi cỡ chữ trong giao diện đều thuộc một vai trên; riêng số và dải tên trên mặt lá co theo bề rộng lá (VT323, 20% và 13% bề rộng), và giá gói ở /goi dùng cỡ nhỏ nhất của Headline (2.2rem). Bề mặt mới chọn vai có sẵn, không thêm cỡ lẻ.

### Named Rules
**Luật Hai Giọng.** VT323 cho thứ để bấm hoặc gọi tên: nút, nhãn, tiêu đề, tên lá. Be Vietnam Pro cho thứ để đọc: lời thoại, đoạn văn. Đoạn nào dài hơn một dòng thì không dùng VT323.

## Layout

Cảnh được thiết kế trên khung chuẩn 640×360 px: 1 px ảnh bằng 0.01 đơn vị thế giới, sprite đặt theo tọa độ trong khung đó. Canvas render ở độ phân giải thấp (chiều cao nội bộ 720 px ở mức "cao", 420 px ở mức "nhẹ") rồi phóng lên toàn màn hình bằng `image-rendering: pixelated`. Camera tự dịch và zoom theo khung ngang hay dọc.

Giao diện DOM là các lớp đặt cố định trên cảnh:
- **Thanh trên cùng**: thương hiệu bên trái, điều hướng bên phải; nền chuyển từ đêm sang trong suốt để không cắt ngang cảnh.
- **Bìa rừng**: khối chữ giữa, dưới đáy màn hình, rộng tối đa 640 px. Trên mobile khối này trải hết ngang, có nền tối dần từ trên xuống để chữ đọc được trên cảnh.
- **Vùng chơi** (trong nhà): một cột flex xếp từ đáy lên gồm dải bài hoặc mặt bàn, thẻ hỗ trợ (chỉ khi khủng hoảng), và hộp thoại. Khoảng cách clamp(0.75rem, 2.5vh, 1.6rem). Các khối rộng min(94vw, 780px).
- **Mặt bàn** (góc máy bàn): vùng bàn rộng min(96vw, 1000px) chiếm hết phần còn lại phía trên hộp thoại, căn giữa kiểu `safe center` để bàn đông lá vẫn cuộn tới hàng trên. Vùng chơi bắt đầu ngay dưới thanh trên cùng để cánh tay Nguyệt vươn từ mép xa của bàn; nội dung chừa 3.2rem cho nút đổi góc máy. Lá nằm đúng hình trải trong vòng chấm vàng của khăn: một lá; ba lá thành hàng; tam giác với Trở ngại ở đỉnh, hai lá kia hạ xuống 0.6 bề rộng lá. Lá làm rõ là một hàng riêng nhỏ hơn bên dưới; khi có hàng này, hình trải chính thu nhỏ để cả bàn vừa một màn. Cỡ lá theo cả bề ngang lẫn bề cao màn. Lá bài của ngày cũng dùng mặt bàn, một lá, không có sổ. Lúc xào bài, giữa bàn chỉ có bộ bài chia hai nửa dưới hai bàn tay; sổ vẫn nằm đúng chỗ của nó.
- **Sổ của Bấc**: trên điện thoại sổ gập ở góc dưới trái của bàn, bàn chừa 4.5rem trên dưới cho mép sổ; mở ra thì phủ kín vùng bàn. Trên desktop (≥1024 px và tỉ lệ ≥4:3) sổ mở sẵn ở góc phải bàn, dưới ngọn nến, rộng min(30vw, 360px), cách đỉnh 15vh; vùng bàn chừa cột đó và camera lệch phải nửa bề rộng cột để vòng đọc bài vẫn nằm giữa phần bàn còn lại. Sổ chỉ ghi một câu khi câu đó đã hiện trọn trong hộp thoại (chạy xong chữ, được bấm hiện hết, hoặc bị bỏ qua bằng "Sang lá kế"), để sổ ghim không in sẵn câu Nguyệt còn đang nói dở.
- **Trang phụ**: một cột giữa rộng min(92vw, 880px), đệm trên 6rem, nền đêm có quầng ánh nến mờ ở đỉnh.

Nhịp khoảng cách theo rem: 0.4 / 0.6 / 0.8 / 1.2 / 2. Điểm ngắt chính ở 640 px: tiêu đề nhỏ lại, dải bài khép sát hơn, khối bìa rừng trải ngang. Hai điểm ngắt phụ: 900 px (ô chân dung lớn lên 96 px) và ≥1024 px kèm tỉ lệ ≥4:3 (sổ mở sẵn ở góc bàn). Mọi lớp tôn trọng `env(safe-area-inset-*)`.

### Named Rules
**Luật Hai Góc Máy.** Trong nhà có hai góc máy cùng nhìn một chiếc bàn. Trong nhà là một khung liền từ trên xuống: Nguyệt, rồi ngay dưới tay nàng là mặt bàn nhìn chếch từ trên (kiểu sàn và bàn trong game HD-2D: nhân vật đứng, mặt bàn nằm). Góc mặt bàn chỉ là máy lia dọc xuống mặt bàn ấy, cùng khung và cùng độ zoom với góc mặt Nguyệt, không zoom, không kéo giãn, không lồng mờ; mọi thứ cùng trôi lên một lượt, nến và quả cầu đứng yên một chỗ. Máy dừng khi mép trên khung vừa qua chân nến và đầu ngón tay Nguyệt (`TABLE_VIEW_TOP`), cộng lệch ngang khi sổ ghim. Lá, tay Nguyệt và sổ hiện ra khi máy đã lia gần tới (0.4s trễ). Hai góc: mặt Nguyệt (trò chuyện, chào hỏi, câu hỏi, chào ra về; khủng hoảng luôn ở đây) và mặt bàn (xào bài, chọn lá, lật lá, tổng kết). Máy tự hạ xuống bàn khi bấm "Xào bài" và tự nâng lên khi chào ra về. Khách đổi góc bất cứ lúc nào: ở mặt Nguyệt bằng nút "▼ Xem bàn" giữa đỉnh màn, ở mặt bàn bằng ô chân dung Nguyệt trên hộp thoại (kèm thẻ "▲ Nhìn Nguyệt"), và ở cả hai góc bằng vuốt dọc, bánh xe chuột hoặc phím ↑/↓; trên điện thoại trục đi tiếp xuống cuốn sổ. Ở góc mặt Nguyệt, hộp thoại và lá xếp chung một cột flex dồn đáy, không định vị tuyệt đối riêng rẽ: hộp thoại cao bao nhiêu thì lá lùi lên bấy nhiêu, khi tràn thì cột cuộn được. Ở góc mặt bàn, hình trải nằm đúng hình của nó trong vòng chấm đọc bài.

**Đi vào nhà.** Một nhịp liền khoảng 2.5 giây, không có chỗ dừng: bấm "Đi theo lối mòn" thì khối chữ bìa rừng mờ đi (0.4s) và máy bắt đầu đi về phía cửa theo đường sin vào-ra (2.4s), cửa sáng dần. Bóng tối phủ lên ở giây 1.35, khi máy vẫn đang đi (0.55s, cubic-bezier(0.65, 0, 0.35, 1)); đổi cảnh lúc đã tối hẳn, chờ cảnh trong nhà vẽ xong vài khung rồi mới sáng lên. Trong nhà máy mở ra hơi gần rồi lùi nhẹ về khung nghỉ, như mắt vừa quen ánh nến; hộp thoại chào hiện sau 0.35s để không nổi trên màn đen. Ảnh trong nhà được tải sẵn khi khách còn ở bìa rừng. Giảm chuyển động: bỏ đoạn đi, chỉ mờ đen rồi vào thẳng.

## Elevation & Depth

Chiều sâu thật thuộc về cảnh 3D: lớp parallax, sương, ánh nến chập chờn, bloom (ngưỡng độ sáng 0.82) và vignette. Giao diện thì phẳng như pixel. Bề mặt tách khỏi cảnh bằng viền đặc và bóng đặc lệch xuống, không nhòe. Thứ đang được chọn hoặc đang nói thì *phát sáng* bằng quầng vàng.

### Shadow Vocabulary
- **Bóng nút** (`box-shadow: 0 3px 0 #160c1c`): nút thường và nút chính; khi ấn, nút lún 2 px và bóng còn 1 px.
- **Bóng lá bài** (`box-shadow: 0 6px 0 rgba(0, 0, 0, 0.45)`): lá trên bàn và trong dải.
- **Viền khung pixel** (`box-shadow: 0 0 0 3px #160c1c, inset 0 0 0 3px rgba(0, 0, 0, 0.35), 0 10px 30px rgba(0, 0, 0, 0.55)`): viền mực bên ngoài, gờ tối bên trong, và một quầng tối mềm duy nhất để đặt khung lên trên cảnh nhiều chi tiết.
- **Quầng nến** (`box-shadow: 0 0 14px rgba(243, 214, 139, 0.9), 0 6px 0 rgba(0, 0, 0, 0.45)`): lá được chọn trong dải; bản 0.7 cho lá làm rõ.
- **Bóng sổ** (`box-shadow: 0 8px 0 rgba(0, 0, 0, 0.5)`): cuốn sổ mở; mép trang thò ra dưới bìa dùng bản 4 px, 0.45.
- **Bóng ô chân dung** (`box-shadow: 0 0 0 3px #160c1c, 0 6px 0 rgba(0, 0, 0, 0.45)`): viền mực và bóng đặc như lá bài, không quầng tối mềm.
- **Bóng tay trên khăn** (`filter: brightness(0)`, `opacity: 0.38`): chính hình cánh tay tô đen, lệch 16% bề rộng tay theo trục của tay (tay xoay thì bóng xoay theo).
- **Bóng lá trên khăn**: hai bậc đặc sát mép (-2px 2px, -4px 4px, mực đêm 70% và 28%), lá nằm trên khăn chứ không nhấc lên. Bóng tiếp xúc đặc, không nhòe; phần tử chỉ dịch 2D, không có transform 3D.
- **Bóng bộ bài lúc xào** (`box-shadow: 0 6px 0 rgba(0, 0, 0, 0.45), inset 0 -3px 0 #160c1c`): bóng lá bài cộng một gờ mực ở đáy cho độ dày của xấp bài.
- **Chữ thắp sáng** (`text-shadow: 0 3px 0 #160c1c, 0 0 22px rgba(255, 196, 107, 0.35)`): tiêu đề pixel.
- **Chữ trên cảnh** (`text-shadow: 0 2px 0 #000`): chú thích dưới lá, đặc như bóng nút. Chữ phụ ở bìa rừng dùng bản mềm (0 2px 6px #000; 0 1px 3px cho dòng ghi chú) chỉ để đọc được trên cảnh, không để nâng bề mặt.

### Named Rules
**Luật Ánh Sáng Là Chiều Sâu.** Không bóng nhòe kiểu material để nâng bề mặt. Bề mặt nằm phẳng trên bóng đặc; muốn một thứ nổi lên thì thắp nó bằng quầng vàng. Ngoại lệ duy nhất là quầng tối mềm dưới khung pixel, dùng để tách khung khỏi cảnh.

## Shapes

Góc vuông tuyệt đối ở mọi nơi: nút, chip, khung, ô nhập, lá bài, thẻ tên. Hình khối được định nghĩa bằng viền đặc: 3 px vàng nến cho khung chính, 2 px cho nút, chip, ô nhập và thẻ tên. Thẻ tên nhô lên đè mép trên của khung, như nhãn tên trong hộp thoại game. Lá bài theo tỉ lệ 97:181 của tranh (`art/cards_clean.py`), mặt trước và mặt sau đều là ảnh pixel. Bốn góc lá được cắt bậc 2 px ngay trong ảnh: đó là góc của thế giới pixel, không phải bán kính bo trong CSS. Lá vẽ nhỏ trong sổ giữ khung 48:80 cũ (`card_mini.png`, `art/cards.py`).

Cuốn sổ là ngoại lệ có chủ ý cho viền vàng: khung da-giấy vẽ pixel cắt 9 mảnh (cắt 10/10/12/18, viền 20/20/24/36 px, gáy dày bên trái), lặp kiểu `round`, vẫn góc vuông. Bên trong sổ, vạch kẻ là nét mực: 2 px liền dưới tiêu đề, 2 px đứt dưới tên lá, 4 px đôi màu da mở đầu trang tổng kết. Mép trang thò ra dưới bìa không viền da, chỉ một nét mực mỏng 2 px như mép giấy.

### Named Rules
**Luật Góc Vuông.** Bán kính bo luôn bằng 0. Một góc bo tròn là dấu hiệu của giao diện SaaS, không phải ngôi nhà này.

## Components

Các thành phần trầm và tiết chế: chúng là đồ vật nhỏ trong nhà, không phải điểm nhấn. Cảnh và lời Nguyệt được nhìn trước. Khi khách bật giảm chuyển động, mọi hoạt ảnh và chuyển tiếp CSS về ngay trạng thái cuối; chữ chạy, lia máy và cuộn mượt được tắt riêng trong mã.

### Buttons
- **Shape:** góc vuông (0px), viền đặc 2 px, bóng mực đặc 3 px bên dưới; chữ VT323 1.35rem.
- **Thường:** nền xanh mũ trùm nhạt, chữ kem giấy cũ, viền khói sương. Hover sáng lên thành hood-navy-lit.
- **Chính (vàng):** nền than hồng, viền ngọn lửa, chữ kem ánh nến; hover sáng thành ember-brown-lit. Mỗi nhóm nút chỉ có một nút chính.
- **Ghost:** nền trong suốt, viền khói sương mờ 50%; cho lựa chọn lùi lại ("Thôi", "Ra về", "Quay lại").
- **Nguy hiểm:** nền gạch trầm, viền gạch hồng, chữ kem gạch; hover sẫm lên thành brick-deep-lit. Chỉ cho xóa dữ liệu, luôn đi qua bước xác nhận thứ hai.
- **Hover / Focus / Active:** hover đổi nền; focus là nét đứt 2 px ngọn lửa, cách 3 px; ấn thì lún 2 px; khi bị vô hiệu hóa thì mờ 50%.

### Chips
- **Style:** VT323 1.15rem, viền khói sương mờ 40%, nền đêm mờ 40%.
- **State:** khi bật (`role="radio"`, `aria-checked`): viền ngọn lửa, nền than trầm, chữ kem ánh nến. Dùng cho trạng thái "đã xảy ra chưa" trong nhật ký.
- **Form câu hỏi:** vẫn là lượt nói của Nguyệt: thẻ tên "Nguyệt", lời mời của nàng làm nhãn ô nhập ("… Trải mấy lá, để ta lo."), rồi nút "Xào bài". Khách chỉ viết câu hỏi; chủ đề và cách trải do máy chủ chọn từ câu hỏi (`src/lib/tarot/choose.ts`, tạm đoán theo từ khóa, sau thay bằng AI), và Nguyệt nói ra lựa chọn ở câu mở đầu ("Tình cảm, trải 3 lá: quá khứ, hiện tại, hướng đi."). Nút bị khóa thì gợi ý nói lý do ("Viết vài chữ trước đã"); đã đăng nhập thì báo trước "Tốn 1 lượt". Màn cảm ứng không tự bật bàn phím ảo.

### Cards / Containers
- **Khung pixel** (hộp thoại, thẻ gói, mục và ghi chú nhật ký): góc vuông, viền 3 px vàng nến, mặt chuyển dọc từ xanh mũ trùm nhạt xuống gần xanh mũ trùm (gần như đặc), bóng theo Viền khung pixel. Đệm 1.2rem; hộp thoại 1.4rem trên.
- **Thẻ hỗ trợ khủng hoảng:** cùng khung nhưng viền tro hồng và mặt đỏ trầm; luôn hiện ngay, không chờ chữ chạy, và hiện trước cả nghi thức: câu hỏi khủng hoảng thì máy không hạ xuống bàn, không xào bài. Hai lối: "Ngồi thêm một lúc" (nút chính, Nguyệt ở lại bầu bạn từng câu ngắn, bài vẫn khóa) và "Ra về" (ghost).
- **Xác nhận xóa:** viền 2 px gạch hồng, nền gạch trầm mờ 55%.

### Inputs / Fields
- **Style:** góc vuông, viền 2 px khói sương mờ 50%, nền đêm mờ 60%, chữ kem; không cho kéo giãn.
- **Focus:** viền chuyển sang vàng nến, không dùng outline.
- **Bộ đếm:** VT323 khói sương ngay cạnh nút gửi (63/500).

### Navigation
- **Thanh trên cùng:** VT323 Label 1.35rem (Label nhỏ 1.15rem trên mobile); thương hiệu màu ngọn lửa kèm biểu tượng trăng ☾; liên kết kem giấy cũ mờ 85%, hover sáng hẳn và chuyển ngọn lửa. Huy hiệu "Demo" là viền vàng 1 px. Dưới 640 px các liên kết gộp vào nút "Menu" (viền khói sương), mở một khung pixel thả xuống với mỗi mục cao 44 px; chạm ra ngoài hoặc Esc để đóng.
- **Màn cảm ứng** (`pointer: coarse`): mọi thứ bấm được có vùng chạm tối thiểu 44 px (nút, chip, liên kết và nút trên thanh trên cùng); liên kết nằm giữa câu được nới vùng chạm bằng đệm trong dòng.

### Hộp thoại (signature)
Khung pixel rộng min(94vw, 780px) với thẻ tên tím mận nhô lên mép trái. Lời Nguyệt chạy từng ký tự (22 ms mỗi ký tự); chạm vào chữ, Enter hoặc Space để hiện hết câu hoặc sang câu sau. Mũi tên ▼ ngọn lửa là một nút thật ở góc dưới phải khung (vùng chạm 44px), nhấp nhô theo `steps(2)` khi còn câu tiếp và mờ đi khi chữ đang chạy. Nút hành động chỉ hiện khi đã nói xong; lúc đó focus chuyển tới nút đầu tiên, còn khi chưa xong thì focus nằm ở ▼. Hộp thoại không giành focus khi khách đang ở chỗ khác (sổ, ô nhập). Lúc chờ rút lá, khung hiện "Nguyệt đang xào bài…" nghiêng, màu khói sương. Khi lời đọc lật nhiều lá, một hàng VT323 khói sương nằm cùng hàng với ▼: "Lá 2/3" và lối tắt "Sang lá kế ▸" (gạch chân khói sương, ngọn lửa khi hover). Lối tắt nhảy tới câu mở lá kế; các câu bị bỏ qua vẫn được ghi vào sổ. Sổ không ghi câu thủ tục lúc xào và trải bài. Nút là lời của khách (xưng "mình", ví dụ "Gom lại giúp mình"), không mượn giọng "ta" của Nguyệt. Lời báo lỗi do Nguyệt nói, gồm ba ý: việc gì chưa xong, lỗi ở phía ai, bước tiếp theo ("Câu hỏi ta vẫn giữ, cậu hỏi lại nhé" kèm nút "Hỏi lại" điền sẵn câu hỏi). Lỗi giữa phiên trả khách về đúng bước đang làm, không nhảy qua. Trình đọc màn hình không nghe chữ chạy: mỗi câu được báo trọn một lần ("Nguyệt: …") qua một vùng `aria-live` ẩn. Người dùng chọn giảm chuyển động thì chữ hiện ngay, máy không lia và bỏ cảnh đi tới cửa.

### Lá bài (signature)
Mặt sau là ảnh pixel đèn lồng giữa vòng trăng trên nền xanh đêm, viền chấm vàng; mặt trước là tranh vẽ tay của từng lá (78 lá) trong khung mực–vàng–kem–vàng sẫm, bảng số La Mã vàng trên nền navy treo giữa mép trên (Ẩn Chính 0–XXI, lá số II–X; Át và lá hoàng gia không có), và dải tên kem in Mực Nâu (tên lá Ẩn Chính bỏ "The", hoặc tên chất: Wands, Cups, Swords, Pentacles). Ảnh lá (khung, mặt sau, tranh) phóng sẵn ×4 bằng nearest và hiển thị với `image-rendering: auto`: thu nhỏ mượt từ ảnh lớn giữ pixel đều nhau ở mọi cỡ lá, còn nearest ở tỉ lệ lẻ (113 px cho 97 px tranh) làm nét dày mỏng không đều. Lật bằng cách co bề ngang về 0 rồi mở ra trong 0.5s, đổi mặt đúng ở giữa. Lá ngược xoay phần hình 180°. Chú thích dưới lá: vị trí (khói sương), tên lá (ngọn lửa), "ngược" (xanh trăng). Ô lá hẹp hơn 150 px (điện thoại) thì "ngược" xuống dòng riêng, bỏ dấu chấm giữa, để chú thích không tràn ra mép màn hay sang lá bên. Màn thấp (≤700 px) có mép sổ thì lá nhỏ theo chiều cao và hình tam giác dẹt hơn, để chú thích bốn dòng vẫn nằm trên mép sổ. Bốn cỡ: sm (dải bài), md, lg, và cỡ bàn (xem dưới).

**Luật Tên Lá.** Mọi chữ khách đọc trên bàn, trong sổ và nhật ký gọi lá bằng tên tiếng Anh. Tên Việt chỉ xuất hiện trong lời Nguyệt, luôn kèm tên Anh trong ngoặc, theo cách gọi phổ biến (The Empress là Nữ Hoàng, lá Queen là Hoàng Hậu, The Chariot là Cỗ Xe Chiến Thắng; `viName` trong `src/lib/tarot/cards.ts`).

### Dải bài (signature)
Cả bộ 78 lá úp chồng nhau thành một dải dài trên khăn, như người đọc bài trải cả bộ ra bàn; bộ đếm "Đã chọn n/3" và lời nhắc "Cả bộ 78 lá · kéo ngang để xem hết" chung một tấm mực ngay trên dải. Lá úp ở màn chọn lá lớn hơn lá sm thường (clamp(72px, 20vw, 96px) trên điện thoại, clamp(70px, 6.5vw, 96px) khi sổ ghim). Trên điện thoại dải hạ xuống ngay trên mép sổ, vào tầm ngón cái; desktop dải nằm giữa vòng chấm. Dải dài hơn màn nên cuộn ngang (vuốt, giữ chuột kéo với con trỏ nắm, thanh cuộn vàng mảnh, hoặc lăn chuột dọc cũng đi ngang; kéo quá 5 px thì thả ra không tính là chọn lá) và mở ra ở giữa bộ bài; hai đầu dải mờ dần cho biết còn bài. Mỗi lá lộ ra một khe 34 px trên cảm ứng (22 px với chuột, có rê để nhấc lá); lá hơi gợn lên xuống vài pixel và nghiêng ±2° như bài trải tay. Lá được chọn nhấc lên 24 px và thắp quầng nến. Chọn ô nào cũng không đổi lá: lá đã rút ở máy chủ. Vuốt hay lăn trong dải không tính là đổi góc máy.

### Nút đổi góc máy
Mỗi góc một lối, đặt theo chỗ khách đang nhìn. Ở mặt Nguyệt: nút "▼ Xem bàn" giữa đỉnh màn, ngay dưới thanh trên cùng, hiện khi còn lá trên bàn. Chữ VT323 1.2rem, nền đêm mờ 62%, viền 2 px khói sương mờ 50%, cao tối thiểu 44 px, không bóng. Ở mặt bàn: ô chân dung Nguyệt trên mép phải hộp thoại là nút ngẩng lên, kèm thẻ "▲ Nhìn Nguyệt" ngồi trên mép khung sát bên trái chân dung (cùng kiểu chữ và viền với nút trên; màn dưới 360 px chỉ còn "▲ Nhìn", tên đọc vẫn đủ). Không đặt nút giữa đỉnh ở mặt bàn: cánh tay Nguyệt vươn từ mép xa của bàn đi qua đúng chỗ đó, trông như tay mọc ra từ nút; lối ở hộp thoại còn nằm trong tầm ngón cái. Hover chuyển chữ sang ngọn lửa và viền sang vàng nến; focus là nét đứt chung.

### Lá trên bàn và chú thích
Lá trên bàn rộng clamp(72px, min(21.5vw, 15vh), 136px); trên desktop có sổ ghim, lá lớn theo chiều cao clamp(96px, min(13vw, 18.5vh), 176px) (150 px ở 1440×810) và hình trải dồn xuống gần hộp thoại, để phía trên còn chỗ cho bàn tay Nguyệt. Lá làm rõ clamp(54px, min(7.5vw, 10vh), 96px); khi có hàng lá làm rõ, hình trải chính nhỏ lại, tam giác dẹt hơn và hai hàng sát nhau (1rem), để cả ba lá làm rõ vẫn vừa trên hộp thoại không phải cuộn. Góc mặt bàn chỉ chừa khe 0.75rem dưới thanh trên cùng vì không có nút giữa đỉnh. Chú thích dưới lá có vùng cố định hai dòng (cao tối thiểu 3.6rem) để hàng lá không xô lệch khi tên dài: vị trí (khói sương, một dòng; "· ngược" xanh trăng nối vào dòng này) và tên lá (ngọn lửa, tối đa 2 dòng, cắt phần thừa), mỗi dòng nằm trên một tấm mực rgba(8, 6, 13, 0.66) để đọc được cả trên vùng khăn sáng nhất cạnh nến. Bộ đếm lá lúc chọn dùng cùng tấm mực.

**Bố cục bàn (layout).** Hộp thoại ở góc mặt bàn giữ một chiều cao cố định (4 dòng trên điện thoại, 3 dòng từ 900 px; câu dài hơn cuộn trong khung và tự giữ dòng đang chạy trong tầm nhìn), nên bàn phía trên không nhảy theo từng câu và lá không trôi khỏi vòng chấm vẽ trên khăn. Lá làm rõ là hàng phụ, rõ ràng nhỏ hơn hình trải chính (khoảng 0.55 lần). Một lá thì trải lớn (clamp(96px, min(34vw, 22vh), 176px)). Desktop có sổ ghim: hình trải nằm giữa vòng chấm, dải bài chọn lá gọn trong cột bàn bên trái sổ, hộp thoại đứng giữa cột bàn (cùng trục với hình trải). Màn thấp (≤700 px) có hàng làm rõ: lá nhỏ theo chiều cao, bỏ dòng "Làm rõ n", tên lá làm rõ và mép sổ còn một dòng, để không gì nằm dưới mép sổ.

### Cánh tay Nguyệt
**Bàn của Nguyệt.** Mặt bàn (`table/tabletop.png` cho màn ngang, `tabletop_doc.png` cho điện thoại; vẽ ở `art/table.py tabletop`) nằm trong chính cảnh trong nhà ở z 0.5, mép xa ở y 250 của khung, ngay dưới tay Nguyệt, thay cho dải bàn vẽ phối cảnh cũ. Khăn tím mận phủ kín mặt bàn, bóng Nguyệt đổ xuống mép xa rồi một đường viền thêu vàng, sao thêu và chòm sao, vòng đọc bài chấm vàng quanh chỗ trải lá; mép gần phía khách nằm ngay trên hộp thoại: dải viền vàng đính hạt rồi vạt khăn rủ xuống, dưới nữa là bóng tối. Nến (góc xa bên phải) và quả cầu pha lê (góc xa bên trái) là sprite của cảnh trong nhà, đứng yên suốt lúc lia; ánh nến trên khăn toả từ chỗ cây nến. Mép gần và vòng đọc bài trong ảnh khớp chỗ máy dừng ở góc mặt bàn (màn ngang và điện thoại khác nhau), nên đổi `TABLE_VIEW_TOP` hay độ zoom thì phải vẽ lại ảnh. Ở góc mặt bàn không vẽ thêm vạt áo hay tay nghỉ: Nguyệt thật ở ngay phía trên khung.

Cánh tay Nguyệt là một lớp phủ cả màn (TableView `Arms`): mỗi tay đặt gốc ở khuỷu tay thật của nàng, chiếu từ cảnh 3D (CameraRig ghi vào `armRig` vị trí hai khuỷu ngay sau hai bàn tay đang đặt trên mép bàn ở góc mặt Nguyệt), rồi xoay quanh gốc ấy về phía chỗ cần chạm. Cỡ tay theo người nàng, không theo cỡ lá: bàn tay trong sprite rộng 15 px ứng với bàn tay Nguyệt rộng 20 px khung. Ống tay là mảnh pixel lặp dọc nối liền bàn tay (chồng 1 px), đi ra từ mép trên màn phía nàng ngồi. Lá bên trái dùng tay trái, lá giữa và lá phải dùng tay phải; tay không dùng thu về phía người nàng. Đầu ngón trỏ dừng ngay trên mép trên của lá đang được nói; đổi lá thì tay lướt sang (làm mượt theo thời gian, tức thì khi giảm chuyển động). Lúc xào bài hai bàn tay úp lên phần trên của hai nửa bộ bài và theo hai nửa tách ra gập vào. Không có tay chỉ trên hàng lá làm rõ; cất tay khi sổ mở phủ bàn trên điện thoại. Ở góc mặt bàn bỏ thị sai theo chuột để mặt bàn 3D và lá, tay (DOM) không trượt lệch nhau. Lá nằm trên khăn: bóng tiếp xúc sát mép đổ về dưới trái (xa nến), và một lớp ánh nến phủ lá (sáng về phía nến, tối dần sang góc dưới trái), lá đang được nói sáng hơn.

### Ô chân dung
Ở góc mặt bàn, khi không thấy mặt Nguyệt, hộp thoại có một ô chân dung vuông nhô lên mép phải: 72 px (96 px từ 900 px), viền 3 px vàng nến, nền xanh mũ trùm. Ảnh cắt từ chính sprite của Nguyệt: miệng mấp máy khi nói, thỉnh thoảng chớp mắt, mắt trăng khuyết đổi màu theo cảm xúc như trong cảnh 3D. Chữ trong hộp thoại chừa chỗ cho ô này.

### Sổ của Bấc (signature)
Cuốn sổ bìa da nâu ghi lại câu hỏi và lời giải từng lá để khách đọc lại bất cứ lúc nào. Trang mở là khung 9 mảnh da-giấy, mặt Giấy Sổ, chữ Mực Nâu, bóng đặc 8 px. Đầu sổ là tiêu đề "Sổ của Bấc" và nút "Gập sổ" viền Da Bìa; trang cuộn được, đáy trang mờ dần vào giấy, tự cuộn để lá mới hiện trọn và tới trang tổng kết khi đọc xong (cuộn mượt; tức thì khi giảm chuyển động). Sổ không bao giờ ẩn hẳn, kể cả lúc xào bài. Trang tổng kết "Bàn hôm nay" mở bằng vạch đôi da, đặt "Lời dặn" lên đầu trên nền da mờ, rồi mới tới danh sách lá. Trang sổ có cấu trúc chứ không là một dải đoạn văn: đầu trang là Bấc (sprite cú) cạnh tên sổ và "Đêm {ngày} tháng {tháng}"; câu hỏi trong ngoặc kép. Mỗi lá mở bằng một đầu mục: lá vẽ nhỏ (khung lá và biểu tượng chất, lá ngược lộn ngược), vị trí (mực nhạt), tên lá lớn (VT323 1.45rem), và dấu "ngược" đóng mực nghiêng; gạch đứt bên dưới. Lời Nguyệt chia ba giọng theo `ReaderLine.kind` (reader.ts gắn): tả tranh là chú thích nghiêng nhỏ mực nhạt; nghĩa lá là chữ thường; ý riêng của Nguyệt là một khối nền da mờ mở bằng dấu ngoặc kép lớn và nhãn "Nguyệt nói riêng". Lời ngoài các lá (mời rút thêm, gom lại) mực nhạt. Trang tổng kết: lời dặn giữa trang giữa hai vạch đôi da, hình trải vẽ lại bằng lá nhỏ đúng hình trên bàn (tam giác có Trở ngại ở đỉnh, lá làm rõ một hàng nhỏ), danh sách từng lá, rồi "Các lá nói về" là những dấu đóng mực nghiêng lệch nhau.
- **Điện thoại:** sổ gập ở góc dưới trái, bìa da 84 px với trang đầu trượt ra từ dưới bìa, luôn ghi câu hỏi hoặc lá đang đọc (tối đa 2 dòng). Chạm hoặc đi xuống trục để mở phủ kín bàn; đi lên trục hoặc "Gập sổ" để gập lại.
- **Desktop (≥1024 px, ≥4:3):** sổ mở sẵn ở góc phải bàn, dưới ngọn nến, ngoài vòng đọc bài.

## Do's and Don'ts

### Do:
- **Do** giữ pixel sắc nét ở mọi tầng: texture `NearestFilter`, `image-rendering: pixelated` cho canvas và ảnh; riêng lá bài dùng ảnh phóng sẵn ×4 thu nhỏ mượt (xem Lá bài).
- **Do** để vàng chỉ chạm vào thứ đang được chọn, đang nói hoặc vừa lật (Luật Một Ngọn Nến).
- **Do** dùng VT323 cho nút, nhãn, tiêu đề; Be Vietnam Pro cho lời thoại và đoạn văn (Luật Hai Giọng).
- **Do** trò chuyện ở góc mặt Nguyệt và trải bài ở góc mặt bàn; giữ lối đổi góc luôn có (nút "▼ Xem bàn" ở mặt Nguyệt, ô chân dung ở mặt bàn), và ở góc mặt Nguyệt đặt lá, thẻ, hộp thoại trong cùng cột flex dồn đáy (Luật Hai Góc Máy).
- **Do** đặt lá trên bàn đúng hình của kiểu trải trong vòng chấm; lá làm rõ thành hàng riêng nhỏ hơn bên dưới.
- **Do** dùng bộ màu sổ chỉ cho cuốn sổ của Bấc (Luật Trang Sổ).
- **Do** tách bề mặt khỏi cảnh bằng viền đặc và bóng đặc lệch xuống; thắp thứ quan trọng bằng quầng vàng.
- **Do** vẽ sprite mới bằng bảng màu chung trong `art/common.py`, viền mực #160c1c.
- **Do** lấy cảm hứng từ game HD-2D (Octopath Traveler), Eastward và độ ấm của Stardew Valley.

### Don't:
- **Don't** "hiện đại hóa" thành giao diện SaaS phẳng: không bo góc, không thẻ trắng, không bóng nhòe material.
- **Don't** dùng gradient tím-hồng chung chung hay phong cách web bói toán màu mè.
- **Don't** dùng `filter` trên phần tử có transform 3D.
- **Don't** làm mượt pixel: không phóng ảnh pixel bằng bilinear, không chèn ảnh vector bóng bẩy vào cảnh.
- **Don't** dùng VT323 cho đoạn văn nhiều dòng.
- **Don't** dùng đỏ báo động cho khủng hoảng hay lỗi; dùng tro hồng ấm.
- **Don't** để bàn tay Nguyệt che tên hay hình lá, hay đưa màn khủng hoảng xuống góc mặt bàn.


### Trang Bộ bài (tra cứu)
Trang thuộc về ngôi nhà, không phải danh mục: mỗi nhóm lá là một tấm khăn tím mận của Nguyệt (`table/cloth_tile.png`, dither và sao thêu, ánh nến góc trên phải, viền thêu một nét vàng, bóng đặc), nhãn nhóm như thẻ tên trên hộp thoại, lá đặt tay nghiêng lệch nhau với bóng tiếp xúc; trang một lá đặt lá trên khăn dưới ánh nến bên trái, nghĩa lá trên trang sổ của Bấc bên phải (khung giấy 9 mảnh, mực nâu, Bấc ở đầu trang, từ khóa là dấu đóng mực), và lời riêng của Nguyệt trong chính hộp thoại của nàng (thẻ tên, ô chân dung). `/la-bai`: cả bộ 78 lá chia Ẩn Chính, Gậy, Cốc, Kiếm, Tiền; mỗi lá là mặt lá đứng yên (`CardFace`, cùng khung và tranh với lá trên bàn) kèm tên Việt (VT323 ngọn lửa) và tên Anh (khói sương); ô tìm theo tên Việt hoặc Anh, có dấu hay không dấu. `/la-bai/[slug]` (78 trang dựng sẵn): tranh lớn kèm lời tả tranh, xuôi và ngược cạnh nhau (từ khóa thành ô viền, nghĩa), theo từng chuyện, lời khuyên, và khối "Nguyệt nói riêng" cùng kiểu thẻ tên của hộp thoại; cuối trang có lá trước, lá sau. Tiêu đề là tên Việt, tên Anh ghi dưới. Lối vào: thanh trên cùng (ẩn khi đang ở bàn trải bài, để khách tập trung), thanh của các trang phụ, bìa rừng (cạnh Điều khoản), và tên lá trong nhật ký. Trong lúc đọc bài không có lối vào trang này.

### Thanh trên cùng: lối đi
Các lối đi chính (Vào nhà, Bộ bài, Gói, Nhật ký; `NavLinks`) là những tấm biển pixel nhỏ chứ không phải chữ trơn: nền đêm mờ 62%, viền 2 px khói sương, bóng đặc 3 px, hình đồ vật trong nhà bên trái chữ (cây nến, mặt sau lá bài, đồng tiền, cuốn sổ). Rê hoặc focus: viền vàng, chữ ngọn lửa, nhấc 2 px. Trang đang mở: viền vàng (aria-current). Cài đặt "Đồ họa" là chữ nhỏ mờ đứng sau các biển, không phải lối đi. Điện thoại: nút Menu là biển viền vàng, trong menu mỗi lối là một biển 44 px; trang phụ xếp bốn biển một hàng dưới tên trang, màn ≤360 px bỏ hình chỉ giữ chữ. "Bộ bài" ẩn khi đang ở bàn trải bài.