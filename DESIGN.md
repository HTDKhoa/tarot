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
  brick-cream: "#ffe1d6"
  rose-ash: "#f0b9a0"
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
- **Xanh Trăng** (moonlit-blue): chỉ dùng cho chữ "ngược" của lá ngược, tức ánh trăng lạnh đối lại ánh nến.
- **Gạch Hồng** (brick-ember, nền brick-deep, chữ brick-cream): chỉ cho hành động không hoàn tác được (xóa dữ liệu).
- **Tro Hồng** (rose-ash): viền thẻ hỗ trợ khi khủng hoảng và chữ báo lỗi. Ấm và rõ, không báo động đỏ.

### Neutral
- **Đêm Rừng Sâu** (forest-night): nền trang, màu theme của trình duyệt, nền lớp mờ khi chuyển cảnh.
- **Xanh Mũ Trùm** (hood-navy) và **Xanh Mũ Trùm Nhạt** (hood-navy-light, sáng lên thành hood-navy-lit khi hover): mặt khung pixel (dải chuyển từ hood-navy-light xuống gần hood-navy), nền nút thường, mặt sau lá bài.
- **Mặt Lá** (card-face): nền mặt trước lá bài.
- **Kem Giấy Cũ** (old-paper): mọi chữ đọc được trên nền tối.
- **Khói Sương** (mist): chữ phụ, nhãn vị trí lá, gợi ý, viền nút thường (đầy đủ) và viền chip (mờ 40–50%).
- **Mực Viền** (ink-outline): đường viền ngoài cùng của sprite và khung, bóng đặc dưới nút; màu tối nhất trong bảng màu sprite.

Sprite trong `public/assets` dùng chung một bảng khoảng 43 màu (`art/common.py`), viền mực #160c1c, đổ bóng bằng dithering Bayer 4×4. Màu CSS ở trên lấy từ cùng họ đó.

### Named Rules
**Luật Một Ngọn Nến.** Vàng là ánh sáng, không phải sơn. Chỉ thứ đang được chọn, đang nói hoặc vừa lật mới mang Ngọn Lửa; vàng không phủ những mảng lớn.

**Luật Không Tím Hồng.** Không gradient tím-hồng, không màu neon "huyền bí". Bí ẩn đến từ bóng tối, không đến từ sắc độ.

## Typography

**Display Font:** VT323 (fallback ui-monospace, monospace)
**Body Font:** Be Vietnam Pro 400 / 600 (fallback system-ui, sans-serif)

**Character:** VT323 là font bitmap của màn hình game cũ, nên nút, tiêu đề và nhãn có cảm giác thuộc về thế giới pixel. Be Vietnam Pro là sans-serif dựng cho tiếng Việt, đủ dấu và đủ thoáng để đọc lời Nguyệt trên điện thoại. Cả hai nạp bộ ký tự `vietnamese` và `latin`.

### Hierarchy
- **Display** (400, clamp(2.6rem, 7vw, 4.4rem), 1): tên ngôi nhà ở bìa rừng; quầng sáng vàng và bóng mực đặc bên dưới.
- **Headline** (400, clamp(2.2rem, 6vw, 3.2rem), 1): tiêu đề trang phụ (Gói, Nhật ký, Điều khoản…).
- **Title** (400, 1.7rem, 1.1): tiêu đề mục trong trang phụ, tên gói.
- **Label** (400, 1.35rem, 1): chữ trên nút, thẻ tên người nói, thanh trên cùng (1.3rem; 1.1rem trên mobile).
- **Label nhỏ** (400, 1.15rem): chip, gợi ý, bộ đếm ký tự, nhãn vị trí lá, nhãn trong thẻ tổng kết.
- **Body** (400, 1rem, 1.7): đoạn văn trong trang phụ.
- **Body hội thoại** (400, clamp(0.98rem, 2.3vw, 1.08rem), 1.6): lời Nguyệt trong hộp thoại, chữ chạy từng ký tự.

### Named Rules
**Luật Hai Giọng.** VT323 cho thứ để bấm hoặc gọi tên: nút, nhãn, tiêu đề, tên lá. Be Vietnam Pro cho thứ để đọc: lời thoại, đoạn văn. Đoạn nào dài hơn một dòng thì không dùng VT323.

## Layout

Cảnh được thiết kế trên khung chuẩn 640×360 px: 1 px ảnh bằng 0.01 đơn vị thế giới, sprite đặt theo tọa độ trong khung đó. Canvas render ở độ phân giải thấp (chiều cao nội bộ 720 px ở mức "cao", 420 px ở mức "nhẹ") rồi phóng lên toàn màn hình bằng `image-rendering: pixelated`. Camera tự dịch và zoom theo khung ngang hay dọc.

Giao diện DOM là các lớp đặt cố định trên cảnh:
- **Thanh trên cùng**: thương hiệu bên trái, điều hướng bên phải; nền chuyển từ đêm sang trong suốt để không cắt ngang cảnh.
- **Bìa rừng**: khối chữ giữa, dưới đáy màn hình, rộng tối đa 640 px. Trên mobile khối này trải hết ngang, có nền tối dần từ trên xuống để chữ đọc được trên cảnh.
- **Vùng chơi** (trong nhà): một cột flex xếp từ đáy lên gồm dải bài hoặc bàn bài, thẻ tổng kết hoặc thẻ hỗ trợ, và hộp thoại. Khoảng cách clamp(0.75rem, 2.5vh, 1.6rem). Các khối rộng min(94vw, 780px); bàn bài rộng min(96vw, 900px).
- **Trang phụ**: một cột giữa rộng min(92vw, 880px), đệm trên 6rem, nền đêm có quầng ánh nến mờ ở đỉnh.

Nhịp khoảng cách theo rem: 0.4 / 0.6 / 0.8 / 1.2 / 2. Một điểm ngắt duy nhất ở 640 px: tiêu đề nhỏ lại, dải bài khép sát hơn, khối bìa rừng trải ngang. Mọi lớp tôn trọng `env(safe-area-inset-*)`.

### Named Rules
**Luật Cột Từ Đáy Lên.** Bàn bài, thẻ và hộp thoại luôn nằm chung một cột dồn xuống đáy, không bao giờ định vị tuyệt đối riêng rẽ. Hộp thoại cao bao nhiêu thì bàn tự lùi lên bấy nhiêu; khi tràn thì cột cuộn được.

## Elevation & Depth

Chiều sâu thật thuộc về cảnh 3D: lớp parallax, sương, ánh nến chập chờn, bloom (ngưỡng độ sáng 0.82) và vignette. Giao diện thì phẳng như pixel. Bề mặt tách khỏi cảnh bằng viền đặc và bóng đặc lệch xuống, không nhòe. Thứ đang được chọn hoặc đang nói thì *phát sáng* bằng quầng vàng.

### Shadow Vocabulary
- **Bóng nút** (`box-shadow: 0 3px 0 #160c1c`): nút thường và nút chính; khi ấn, nút lún 2 px và bóng còn 1 px.
- **Bóng lá bài** (`box-shadow: 0 6px 0 rgba(0, 0, 0, 0.45)`): lá trên bàn và trong dải.
- **Viền khung pixel** (`box-shadow: 0 0 0 3px #160c1c, inset 0 0 0 3px rgba(0, 0, 0, 0.35), 0 10px 30px rgba(0, 0, 0, 0.55)`): viền mực bên ngoài, gờ tối bên trong, và một quầng tối mềm duy nhất để đặt khung lên trên cảnh nhiều chi tiết.
- **Quầng nến** (`box-shadow: 0 0 14px rgba(243, 214, 139, 0.9), 0 6px 0 rgba(0, 0, 0, 0.45)`): lá được chọn trong dải; bản 0.7 cho lá làm rõ.
- **Chữ thắp sáng** (`text-shadow: 0 3px 0 #160c1c, 0 0 22px rgba(255, 196, 107, 0.35)`): tiêu đề pixel.

### Named Rules
**Luật Ánh Sáng Là Chiều Sâu.** Không bóng nhòe kiểu material để nâng bề mặt. Bề mặt nằm phẳng trên bóng đặc; muốn một thứ nổi lên thì thắp nó bằng quầng vàng. Ngoại lệ duy nhất là quầng tối mềm dưới khung pixel, dùng để tách khung khỏi cảnh.

## Shapes

Góc vuông tuyệt đối ở mọi nơi: nút, chip, khung, ô nhập, lá bài, thẻ tên. Hình khối được định nghĩa bằng viền đặc: 3 px vàng nến cho khung chính, 2 px cho nút, chip, ô nhập và thẻ tên. Thẻ tên nhô lên đè mép trên của khung, như nhãn tên trong hộp thoại game. Lá bài theo tỉ lệ 48:80 của sprite, mặt trước và mặt sau đều là ảnh pixel phóng to.

### Named Rules
**Luật Góc Vuông.** Bán kính bo luôn bằng 0. Một góc bo tròn là dấu hiệu của giao diện SaaS, không phải ngôi nhà này.

## Components

Các thành phần trầm và tiết chế: chúng là đồ vật nhỏ trong nhà, không phải điểm nhấn. Cảnh và lời Nguyệt được nhìn trước.

### Buttons
- **Shape:** góc vuông (0px), viền đặc 2 px, bóng mực đặc 3 px bên dưới; chữ VT323 1.35rem.
- **Thường:** nền xanh mũ trùm nhạt, chữ kem giấy cũ, viền khói sương. Hover sáng lên thành hood-navy-lit.
- **Chính (vàng):** nền than hồng, viền ngọn lửa, chữ kem ánh nến; hover sáng thành ember-brown-lit. Mỗi nhóm nút chỉ có một nút chính.
- **Ghost:** nền trong suốt, viền khói sương mờ 50%; cho lựa chọn lùi lại ("Thôi", "Ra về", "Quay lại").
- **Nguy hiểm:** nền gạch trầm, viền gạch hồng, chữ kem gạch; chỉ cho xóa dữ liệu, luôn đi qua bước xác nhận thứ hai.
- **Hover / Focus / Active:** hover đổi nền; focus là nét đứt 2 px ngọn lửa, cách 3 px; ấn thì lún 2 px; khi bị vô hiệu hóa thì mờ 50%.

### Chips
- **Style:** VT323 1.15rem, viền khói sương mờ 40%, nền đêm mờ 40%.
- **State:** khi bật (`role="radio"`, `aria-checked`): viền ngọn lửa, nền than trầm, chữ kem ánh nến. Dùng để chọn chủ đề, kiểu trải và trạng thái "đã xảy ra chưa".

### Cards / Containers
- **Khung pixel** (hộp thoại, thẻ tổng kết, thẻ gói, mục nhật ký): góc vuông, viền 3 px vàng nến, mặt chuyển dọc từ xanh mũ trùm nhạt xuống gần xanh mũ trùm (gần như đặc), bóng theo Viền khung pixel. Đệm 1.2rem; hộp thoại 1.4rem trên.
- **Thẻ hỗ trợ khủng hoảng:** cùng khung nhưng viền tro hồng và mặt đỏ trầm; luôn hiện ngay, không chờ chữ chạy.
- **Xác nhận xóa:** viền 2 px gạch hồng, nền gạch trầm mờ 55%.

### Inputs / Fields
- **Style:** góc vuông, viền 2 px khói sương mờ 50%, nền đêm mờ 60%, chữ kem; không cho kéo giãn.
- **Focus:** viền chuyển sang vàng nến, không dùng outline.
- **Bộ đếm:** VT323 khói sương ngay cạnh nút gửi (63/500).

### Navigation
- **Thanh trên cùng:** VT323 1.3rem (1.1rem trên mobile); thương hiệu màu ngọn lửa kèm biểu tượng trăng ☾; liên kết kem giấy cũ mờ 85%, hover sáng hẳn và chuyển ngọn lửa. Huy hiệu "Demo" là viền vàng 1 px.

### Hộp thoại (signature)
Khung pixel rộng min(94vw, 780px) với thẻ tên tím mận nhô lên mép trái. Lời Nguyệt chạy từng ký tự (22 ms mỗi ký tự); chạm, Enter hoặc Space để hiện hết câu hoặc sang câu sau. Mũi tên ▼ ngọn lửa nhấp nhô theo `steps(2)` báo còn câu tiếp. Nút hành động chỉ hiện khi đã nói xong.

### Lá bài (signature)
Mặt sau là ảnh pixel đèn lồng trên nền xanh đêm; mặt trước là khung kem với biểu tượng chất bài, số La Mã hoặc tên bậc (VT323 ngọn lửa) và dải tên tiếng Việt. Lật bằng cách co bề ngang về 0 rồi mở ra trong 0.5s, đổi mặt đúng ở giữa. Lá ngược xoay phần hình 180°. Chú thích dưới lá: vị trí (khói sương), tên lá (ngọn lửa), "ngược" (xanh trăng). Ba cỡ: sm, md, lg.

### Dải bài (signature)
13 lá úp xếp hình quạt (mỗi lá lệch 5°, xoay quanh điểm dưới đáy). Lá được chọn nhấc lên 28 px (22 px trên mobile) và thắp quầng nến.

## Do's and Don'ts

### Do:
- **Do** giữ pixel sắc nét ở mọi tầng: texture `NearestFilter`, `image-rendering: pixelated` cho canvas, ảnh và lá bài.
- **Do** để vàng chỉ chạm vào thứ đang được chọn, đang nói hoặc vừa lật (Luật Một Ngọn Nến).
- **Do** dùng VT323 cho nút, nhãn, tiêu đề; Be Vietnam Pro cho lời thoại và đoạn văn (Luật Hai Giọng).
- **Do** đặt bàn bài, thẻ và hộp thoại trong cùng cột flex dồn đáy (Luật Cột Từ Đáy Lên).
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
