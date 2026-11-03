# Tranh 78 lá bài — quy trình vẽ

Trạng thái (2026-11-03): **đủ 78 lá trên web**, là tranh chủ dự án vẽ tay trong Aseprite (`art/aseprite/cards/tarot_*`), được làm sạch và đóng khung bằng `art/cards_clean.py`. Quy trình RWS bên dưới (từ "Nguồn và giới hạn") là hướng cũ, giữ lại để tham khảo; các cỡ 96×160 / 120×200 trong đó không còn dùng.

## Bộ hiện tại: tranh vẽ tay → web

| Thứ | Cỡ |
| --- | --- |
| Lá | 97×181 (CSS `height: calc(var(--w) * 181 / 97)`) |
| Ô tranh | 89×156 tại (4, 4), ảnh `public/assets/cards/art/<id>.png` (id theo `tarot_vi.json`) |
| Dải tên kem | hàng 162–176, khớp `.tarot-band`; tên tiếng Anh do DOM viết |
| Khung | mực, vàng, kem, vàng sẫm từ ngoài vào (`card_frame.png`); mặt sau `card_back.png` cùng cỡ |
| Lá nhỏ trong sổ | giữ khung 48×80 cũ `card_mini.png` + biểu tượng chất (art/cards.py) |
| Ảnh trên web | `publish` phóng sẵn ×4 bằng nearest (lá 388×724, tranh 356×624); CSS hiển thị `image-rendering: auto` để pixel đều ở mọi cỡ lá |

`cards_clean.py` làm, theo thứ tự:

1. Aseprite xuất từng lá ra PNG (`_png/`), đo ô tranh bên trong đường viền tối của khung cũ.
2. Cắt 7 hàng chữ tên cũ ở đáy. Lá chính giữ nguyên pixel (89×156). Lá phụ cắt 77×135.
3. Xóa số La Mã cũ ở góc trên-trái bằng cách chép khối bên phải hoặc bên dưới (chọn đường nối ít lệch nhất; lá chọn sai ghi vào `PATCH_FROM`). Thay mép vát sáng/bóng của khung cũ còn sót bằng hàng tranh kế trong.
4. Bảng màu chung 160 màu (k-means trong Lab, mỗi cụm lấy màu thật nhiều pixel nhất) thay cho ~3.500 màu gần trùng.
5. Lá phụ phóng lên 89×156 (EPX ×4 rồi lấy màu trội, không trộn màu), cùng cỡ pixel với lá chính.
6. Bỏ pixel lẻ gần màu xung quanh; pixel lẻ tương phản mạnh (sao, điểm sáng) giữ.
7. Bảng số vàng trên nền navy giữa mép trên (lá chính 0–XXI, lá số II–X; Át và lá hoàng gia không có), nằm trong ô tranh nên lật theo lá ngược.

```
python art/cards_clean.py sheet major cups   # bảng trước | sau → _sheets/clean_<nhóm>.png
python art/cards_clean.py build              # → art/aseprite/cards/clean/<id>_<slug>.aseprite (giữ file đã có)
python art/cards_clean.py build --force      # ghi đè cả file đã sửa tay
python art/cards_clean.py publish            # clean/*.aseprite → public/assets/cards/
```

Sửa tay: mở `clean/<id>_<slug>.aseprite`, vẽ trên layer `tranh`, lưu, chạy `publish`. `build` không có `--force` sẽ không ghi đè.

Tên file trong `tarot_minor_arcana_all/aseprite_swords` và `aseprite_wands` để số 13/14 ngược với chữ (king/queen); script nhận lá theo chữ trong tên, không theo số. Bốn file lá chính đặt tên lệch với tranh bên trong (`12_the_hanged_man` là Temperance, `13_death` là The Devil, `14_temperance` là The Hanged Man, `15_the_devil` là Death; soát theo chữ tên vẽ trên lá gốc), sửa bằng bảng `MAJOR_IS`. File trong `clean/` đặt tên theo `name_en` của `tarot_vi.json` (chất tiền là `pentacles`).

Biết là chưa tốt: trời trong tranh gốc không phải dither Bayer đều mà là chấm nhiễu nhẹ (lá phụ càng rõ). Muốn trời sạch như phần "Phong cách" bên dưới thì phải dựng lại vùng trời từng lá.

## Nguồn và giới hạn

- Hình gốc: scan Waite–Smith bản 1909–1910 tô màu, vẽ bởi Pamela Colman Smith, public domain. Lấy từ Wikimedia Commons (`RWS_Tarot_NN_Name.jpg`, `CupsNN.jpg`, `WandsNN.jpg`, `SwordsNN.jpg`, `PentsNN.jpg`; khoảng 1110×1920, ~0,8 MB/ảnh). Lưu ở `art/src/rws/`, **không đưa vào git**.
- Bộ pixel tarot trong `reference/` Có thể dùng để scan bản đầu tiên trước từng pixel, nhưng vẫn phải khác ở bản final một chút để có chất riêng.
- Khi lên web: thêm dòng nguồn RWS (Pamela Colman Smith, 1909–1910, public domain) vào `THIRD_PARTY_NOTICES.md`. Không dùng tên "Rider-Waite" khi quảng bá (PLAN.md).

## Phong cách lấy từ bộ mẫu

1. Trời phẳng một tông, dither Bayer 4×4 sáng dần lên mép trên. Đây là nét nhận diện chính.
2. Mỗi chất liệu 2–3 tông phẳng, không gradient mềm.
3. Viền mực `#160c1c` chỉ ở bóng ngoài và chỗ hai chất liệu gặp nhau. Nét nằm trong một mảng cùng màu thì đổi thành tông tối nhất của dải đó.
4. Mặt người để trống (chủ dự án chốt): không vẽ mắt, mũi, miệng. Đầu 7–8 px là khối da có mép sáng/tối, tóc một khối. Tay là khối, không vẽ ngón. Hình dáng phải tự kể chuyện.
5. Bố cục bám sát RWS; bỏ chi tiết nhỏ hơn 2 px.

Khác bộ mẫu: tên lá **không** vẽ vào tranh (DOM vẽ bằng VT323 trên dải kem, như hiện tại); số La Mã đặt giữa mép trên như RWS, không ở góc; bảng màu riêng.

## Kích thước

| Thứ | Cỡ |
| --- | --- |
| Lá (khung) | 96×160, gấp đôi 48×80 cũ, giữ tỉ lệ `80/48` trong CSS |
| Ô tranh | 86×125 tại (5, 5) |
| Dải tên | y 132–155, khớp `.tarot-band` (bottom 4%, cao 13%) |
| Góc | bậc 2 px trong sprite như cũ |

Cách hiển thị (cỡ CSS → pixel màn hình mỗi pixel tranh):

- Bàn, điện thoại: 72–84 px, DPR 3 → khoảng 2,5×. Sắc.
- Bàn, laptop 1440×810: khoảng 121 px, DPR 1 → 1,26×. Đọc được nhưng dither trời hơi lệch nhịp. Khi nối vào web nên làm tròn `--w` về bội số 96 px thiết bị (hoặc chấp nhận ở DPR ≥ 2).
- Tra cứu (sau này): 192 px (2×) laptop, 288 px (3×) cho cả điện thoại lẫn laptop. Pixel to, đúng chất.
- Dải bài (`tarot-sm`, 54–88 px) chỉ hiện mặt sau. Mặt sau cũng phải vẽ lại ở 96×160 để lúc lật hai mặt cùng độ mịn.

Dung lượng: PNG ô tranh khoảng 3–6 KB/lá → cả bộ dưới 0,5 MB. Asset tĩnh không tính vào giới hạn 3 MiB của Worker. Bản demo một file sẽ nhúng base64 nên to thêm khoảng 0,6 MB.

## Chất liệu (học từ lá Four of Cups trong reference/)

- Tán lá: chùm rủ nhiều thùy, sáng theo khối (mép trên-trái sáng, dưới-phải tối, đáy tối nhất) — `rws_texture.foliage`.
- Vỏ cây: thân to loe rễ, vệt sáng dọc bên trái, mép phải tối, sọc vỏ ngắn, mắt gỗ — `rws_texture.bark`.
- Cỏ: vệt ngang dài 7–20 px sáng/tối như gió lướt, không chấm — `rws_texture.grass`.
- Vải: nếp gấp bằng đường tông tối trong mảng vải — `rws_texture.fold`.
- Người: tay chân là ống tròn (`capsule`), mọi mảng tự bo tròn (`smooth`); đồ vật cứng (bàn, kiếm, đũa) đặt `'sharp': True`. Đổ bóng `ball` chỉ cho vật tròn nhỏ (đầu, mây, bình); thân người dùng `rim`, nếu không sẽ phình như thùng.
- Cốc: một hình duy nhất 13 px (`rws_symbols.cup`), vàng cam đậm.

## Quy tắc đặt từng pixel (đo từ lá The Fool trong reference/)

Số đo lấy từ ảnh chụp `reference/1.jpg` (ô tranh khoảng 125×226 px ảnh, JPEG nhòe nên không khôi phục được lưới pixel gốc). Mục nào ghi **(đo)** là số liệu từ ảnh; mục ghi **(nghề)** là quy tắc pixel art chung, ảnh quá mờ để đo nhưng lá mẫu nhìn khớp. Ví dụ ASCII bên dưới tự vẽ, số 1–5 là tông tối → sáng, `#` là mực, `.` là nền.

### 1. Dải màu: 5 tông, tông giữa chiếm nhiều nhất

**(đo)** Mỗi chất liệu tách được 5 tông. Tỉ lệ diện tích:

| Chất liệu | Độ sáng L 5 tông | Diện tích tông giữa | Lệch sắc tối → sáng |
| --- | --- | --- | --- |
| Áo lam | 30 · 37 · 45 · 58 · 73 | 44% ở tông 2 | 227° → 247° (sáng ngả tím) |
| Cỏ | 11 · 26 · 34 · 40 · 70 | 38% ở tông 3 | 95° → 75° (sáng ngả vàng) |
| Đá nâu | 9 · 15 · 22 · 27 · 39 | 73% ở ba tông tối | gần như giữ 20° |
| Nước | 23 · 36 · 42 · 53 · 69 | 37% ở tông 2 | giữ 185°, chỉ đổi độ sáng |

Vì sao:

- Một mảng phải đọc được là *một* vật trước, rồi mới tới khối. Vì vậy tông giữa phủ phần lớn diện tích; tông sáng nhất chỉ 7–17%, đặt ở chỗ ánh sáng chạm thẳng vào.
- Bước độ sáng không đều: hai tông tối sát nhau (bóng mềm), tông sáng nhất nhảy xa (L +12 đến +30). Khoảng nhảy lớn đó làm điểm sáng "bật" lên ở cỡ 1×.
- Lệch sắc chỉ dùng cho vật sống (cỏ, vải): sáng ngả về màu nắng, tối ngả về màu bóng. Đá và nước giữ sắc để trông nặng và lạnh. Đó là lý do `RAMPS` có dải lệch sắc cho `grass`, `tunic`, nhưng `bark` và `sky` lệch rất ít.
- Đá dồn 73% vào ba tông tối: vách đá là phông lùi về sau để người nổi lên. Mảng nền không được sáng hơn người đứng trước nó.

### 2. Ánh sáng: trên-trái, đặt tông theo vị trí trên khối

**(đo)** Áo sáng hơn ở nửa trái (L +7), cỏ sáng hơn ở nửa trên (L +11).

Thứ tự tông trên một khối tròn, ánh sáng từ trên-trái:

```
  . . # # # . .        # ở mép trên-trái là tông 1 của vật (xem mục 3),
  . 4 5 4 3 # .        ở mép dưới-phải là mực
  # 5 4 3 3 2 #
  # 4 3 3 3 2 #        5: 1–3 px, sát mép sáng, không chạm mép
  # 3 3 3 2 1 #        4: một vệt mỏng dọc mép trên-trái
  . # 2 2 1 # .        3: tông giữa, phần lớn diện tích
  . . # # # . .        2: dải 1–2 px phía dưới-phải; 1: chỗ khuất nhất, sát chỗ tiếp đất
```

Vì sao: mắt đọc khối qua *vị trí* của tông sáng/tối, không qua chuyển màu mềm. Tông 5 đặt lệch hẳn về một góc thì chỉ một chấm cũng đủ làm khối tròn; đặt giữa thì khối bẹt.

### 3. Viền: chỉ đậm phía khuất sáng (sel-out)

**(đo)** Quanh con chó trắng: mép phải có 44% pixel tối (L < 45); mép trên, trái, dưới 0%. Quanh áo lam: mép phải tối nhất (L 84), mép trên sáng nhất (L 112).

Quy tắc:

```
  phía sáng          phía tối
  . 1 3 3 3 2 #      1 = tông tối nhất của chính vật đó
  . 1 3 3 2 2 #      # = mực #160c1c
  . 1 3 2 2 1 #
```

- Mép dưới-phải (khuất sáng) và mép chạm đất: mực.
- Mép trên-trái (nhận sáng): tông 1 của vật, không dùng mực. Vật rất sáng (lông trắng, mây, hoa trắng) bỏ hẳn viền phía sáng, để nền tự làm viền.
- Chỗ hai mảng của cùng một người chồng lên nhau: tông 1 của mảng *ở trước*, không dùng mực.

Vì sao: viền mực đều bốn phía làm vật như dán giấy lên tranh. Bỏ mực phía sáng làm ánh sáng như tràn qua mép, giữ cảm giác khối. Mực phía tối vẫn giữ bóng ngoài rõ ở cỡ nhỏ.

### 4. Nét cong và nét xiên: bậc đều, đổi dần **(nghề)**

```
  đúng (bậc 4-3-2-1)        sai (bậc lộn xộn 2-1-3-1)
  # # # #                   # #
          # # #                 #
                # #               # # #
                    #                   #
```

- Đoạn thẳng xiên: các bậc cùng độ dài (2-2-2 hoặc 3-3-3). Một bậc lệch nhịp nhìn ra ngay là răng cưa.
- Đường cong: bậc dài dần hoặc ngắn dần đơn điệu (4-3-2-1-1-2-3-4), không nhảy qua lại.
- Không để hai pixel nét chỉ chạm nhau ở góc *và* cạnh cùng lúc (chữ L thừa): nét dày lên 2 px tại đó, xóa pixel ở góc trong.

Vì sao: ở 1× mỗi bậc là một bước mắt thấy được. Nhịp đều thì mắt đọc thành đường liền; nhịp lệch thì mắt dừng lại ở chỗ lệch.

### 5. Cụm pixel: không có pixel lẻ **(nghề, lá mẫu khớp)**

- Mỗi mảng tông nhỏ nhất 2×1 hoặc 2×2. Pixel đứng một mình (bốn cạnh khác màu) chỉ được dùng có chủ ý: hoa văn vải, mắt chim, đầu ngọn cỏ, tia sáng.
- Viền giữa hai tông đi theo hình khối (cong theo vật), không theo đường ngang thẳng hay răng cưa ngẫu nhiên.
- Không dùng nhiễu ngẫu nhiên từng pixel (lốm đốm) cho đá hay đất; trông như ảnh in lỗi. Dùng mảng loang lớn (mục 7).

Vì sao: pixel lẻ đọc như bụi. Cụm 2 px trở lên mới đọc thành hình.

### 6. Dither: chỉ trong dải chuyển giữa hai tông phẳng

**(đo)** Trên trời: hàng thuộc mảng phẳng có tỉ lệ đổi màu 0–0,1 mỗi pixel; hàng thuộc dải chuyển có 0,5–0,6 (bàn cờ 50%).

```
  2 2 2 2 2 2 2 2   mảng phẳng tông 2
  2 3 2 3 2 3 2 3   dải chuyển: bàn cờ, 2–4 hàng
  3 2 3 2 3 2 3 2
  3 3 3 3 3 3 3 3   mảng phẳng tông 3
```

- Dither là cầu nối hai mảng phẳng, rộng 2–4 hàng, không trải khắp bầu trời.
- Chỉ dither hai tông kề nhau trong dải (2 với 3), không bao giờ nhảy tông (1 với 4).
- Chỉ dùng cho mảng lớn và phẳng: trời, nước xa, sương. Không dither lên người, vải, cỏ.

Vì sao: dither rộng làm cả mảng rung khi lá nhỏ (laptop 1,26×). Dải hẹp giữ đúng tác dụng: báo cho mắt rằng trời chuyển màu, rồi để yên.

### 7. Chất liệu: hình của từng cụm

Nhìn phóng to lá mẫu:

- **Cỏ:** chùm thùy rủ xuống, mỗi chùm 4–8 px. Đỉnh chùm tông 4–5 (vàng chanh), thân tông 3, dưới chùm là bóng tông 1 hắt lên chùm sau. Đất nâu lộ ra giữa các chùm ở chỗ thưa. Vì sao: bóng dưới mỗi chùm tạo nhịp sáng–tối lặp lại, nhờ đó thảm cỏ có độ dày mà không cần vẽ từng lá.
- **Đá vách:** phiến nằm ngang dài 6–14 px, khe giữa phiến là tông 1, mép trên mỗi phiến một vệt tông 4. Vì sao: vệt sáng trên mép phiến cho biết ánh sáng từ trên; phiến ngang cho biết đá xếp lớp, khác với đất.
- **Nước đổ:** vệt dọc dài, tông 5 ở giữa dòng, tông 2 ở hai bên. Vì sao: vệt dọc đọc thành chuyển động rơi.
- **Vải có hoa văn:** chấm 1–2 px, đặt theo lưới so le, khoảng 5–7 px; chấm vẫn theo ánh sáng (phía tối dùng màu chấm tối hơn). Nếp gấp là đường chéo tông 2 đi theo hướng kéo của vải.

### 8. Bóng tiếp xúc

Chỗ chân, móng, đáy vật chạm đất: một dải 1–2 px tông 1 của *mặt đất*, rộng hơn bàn chân một chút. Vì sao: không có bóng này người trông như lơ lửng trên nền.

## Bảng màu theo lá mẫu (chủ dự án chốt)

Lá dùng cỡ 120×200 (ô tranh 110×157). Ngoài 32 màu gốc (chỉ dùng khi ép màu scan), mỗi chất liệu có dải 5 tông lệch sắc lấy từ lá mẫu: `sky`, `cloud`, `grass`, `leaf`, `bark`, `gold`, `skin`, `hair`, `tunic`, `sleeve`, `pants` (`RAMPS` trong `art/rws_prep.py`; ký tự gọi bằng `T('tunic')`, tối → sáng). Áo quần đổi màu như lá mẫu (áo vàng rêu, tay áo đỏ cam, quần trắng tím), không giữ màu RWS.

Tô khối bằng `rws_draw.form()`: mảng như gối phồng, pháp tuyến chiếu ánh sáng trên-trái, lượng tử 5 tông; viền ngoài phía khuất sáng là mực, phía nhận sáng là tông tối của chất liệu (sel-out). Tán lá dùng `rws_texture.leafy()` (hàng trăm cụm lá 5×5).

## Bảng màu lá bài

32 màu, theo dải tối → sáng, trong `art/rws_prep.py` (`RAMPS`): mực, kem (4), vàng (4), đỏ (3), cam, da (3), cỏ (4), xanh trời/nước (4), gỗ (3), đá (3), tím núi (2). Màu biểu tượng RWS giữ nguyên ý (trời vàng của Magician, trời xanh của Star). Dải xanh lá, gỗ, đỏ, vàng đã nâng độ bão hòa và tương phản sau khi so với reference (bản đầu quá xám nên trông phẳng).

## Quy trình một lá

Mỗi lá là một file `art/rws/<slug>.py` (xem docstring `art/rws/__init__.py`) cộng lưới `art/rws/<slug>.txt` (125 hàng × 86 ký tự, một ký tự một pixel theo `KEY` trong `art/rws_draw.py`; `~` là trời, tự dither).

1. Tải scan vào `art/src/rws/`. Viết `SCAN`, `CROP` (tỉ lệ 86:125), `NUMERAL`, `SKY`, `SYMBOLS`.
2. Nếu scan tô màu phẳng rõ: khai báo `MATERIALS` (chất liệu, điểm mẫu, tông). Kiểm điểm mẫu bằng `python art/rws_material.py sample <slug> x,y …` (điểm rơi vào nét mực sẽ báo "toàn mực"). Scan quá dày nét (ngựa, giáp) thì bỏ `MATERIALS`, vẽ cả lá bằng khối.
3. `python art/rws_prep.py <slug> --reseed` sinh lưới. **`--reseed` xóa mọi chỗ đã sửa trên lưới.**
4. Viết `draw(c)`. Người và thú luôn dựng tay bằng `parts` theo tọa độ can từ scan (xem bằng `rws_view`); bước tách mảng chỉ dùng cho nền và đồ vật, vì nó làm người răng cưa và dính khối. Viền mực chỉ bao bóng ngoài; chỗ hai mảng cùng một người gặp nhau dùng tông tối của mảng trước. `repaint` vẽ lại nền bằng hình trơn; `parts` dựng người/vật từ các mảng đa giác (`shade='rim'` cho vải, `'ball'` cho mây, bình, giáp; `ink=None` cho vật mềm); `mottle` loang cỏ, đất; `rws_symbols` cho sao, đồng xu, cốc, mây dùng chung.
5. `python art/rws_cards.py <slug>` → `.aseprite` (layer `tham chieu scan` ẩn, `luoi`, `ve tay`, `sua tay`, `khung`, `so`), `<slug>.png`, `<slug>_art.png`. Layer `sua tay` là của người vẽ trong Aseprite, build lại không ghi đè.
6. Soát tỷ lệ người bằng cách đè lá mẫu: `python art/rws_overlay.py <slug> reference/<ảnh>.jpg --ref x0 y0 x1 y1 --at x y` (ba khung: tranh mình, đè 50%, mẫu đã căn). Người vẽ theo đơn vị đầu: đầu ~13×14 px, vai ~2,3 đầu, áo phủ vai, tay áo lộ từ khuỷu; hai đùi phải nối vào hông dưới vạt áo.
7. Xem: `python art/rws_view.py <slug> [--box x0 y0 x1 y1]` (phóng to có lưới, cạnh scan), `python art/rws_lint.py <slug> -v`, `python art/rws_sheet.py <nhóm> <slug …>` (scan / 1× / 3×).

Lá ngược: web chỉ xoay ô tranh, dải tên đứng yên, nên web dùng `<slug>_art.png` cộng `_frame.png` chung, không dùng ảnh cả lá.

## Aseprite và pixel-mcp

- Dùng bản build `E:\aseprite\build\bin\aseprite.exe` (mã nguồn `E:\aseprite`, Skia m124 ở `E:\deps\skia`, CMake với `-DENABLE_SCRIPTING=ON`). Bản cũ `E:\Aseprite-v1.3.18.6-Windows` không có Lua scripting nên pixel-mcp không vẽ được; health check của plugin chỉ gọi `--version` nên không phát hiện ra.
- pixel-mcp đọc cấu hình ở `~/.config/pixel-mcp/config.json` (biến `PIXEL_MCP_CONFIG` trong `.mcp.json` của plugin), không phải `%APPDATA%`. Đổi đường dẫn xong phải khởi động lại server MCP (phiên mới).
- Lỗi của pixel-mcp 0.5.0: `draw_pixels` cộng thêm gốc của cel. Layer có nội dung bắt đầu ở (5, 5) thì pixel vẽ vào (x, y) sẽ rơi vào (x + 5, y + 5). Vẽ trên layer phủ kín cả canvas, hoặc trừ gốc cel trước khi gọi.
- `art/rws_cards.py` vẫn ghi `.aseprite` bằng `art/aseprite_file.py`; kiểm bằng CLI:

```
aseprite -b art/aseprite/cards/<slug>.aseprite --save-as kiem.png
```

## Còn lại sau khi duyệt

- (Đã xong theo cách khác: 78 lá, mặt sau và `TarotCard` dùng tranh vẽ tay, xem "Bộ hiện tại" ở đầu file.)
- Nguyệt, Bấc, ngôi nhà: giữ nguyên cỡ canvas và điểm neo trong `public/assets/characters/anchors.json` (Nguyệt 160×176 × 8 khung, Bấc 40×44 × 4, nhà 160×140 + glow) để code không phải đổi; dùng bảng màu đêm của cảnh, không dùng bảng màu lá.
