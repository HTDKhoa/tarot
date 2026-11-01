"""Cảnh mặt bàn (góc máy hạ xuống bàn khi trải bài).

Mặt bàn nhìn từ trên xuống (bản ngang 640x360 và bản dọc 360x640), tay Nguyệt đưa
từ phía bên kia bàn, cuốn sổ của Bấc, khung trang giấy (9-slice cho border-image)
và ô chân dung cắt từ chính sprite của Nguyệt để dùng trong hộp thoại.
"""
import math
from PIL import Image
from common import *
import characters


# ------------------------------------------------------------------ mặt bàn
def tabletop(W, H, seed, CW=None):
    """Khăn tím mận trên mặt bàn gỗ; viền thêu vàng, sao thêu, vòng đọc bài chấm vàng.
    CW: bề rộng phần khăn + lề (căn giữa); phần gỗ thừa hai bên để máy lia ngang khi sổ nằm
    ở góc bàn mà không lộ mép ảnh. Ánh nến đến từ góc trên phải khăn (dither Bayer)."""
    CW = CW or W
    ox = (W - CW) // 2
    img = new(W, H, 'w0')
    px = img.load()
    # gỗ: ván dọc theo chiều ngang, vân bằng dither
    plank = 26
    for y in range(H):
        for x in range(W):
            k = (y // plank)
            t = ((x * 0.013 + k * 1.7) % 1.0)
            col = 'w1' if bayer(x, y, 0.35 + 0.3 * math.sin(t * math.tau)) else 'w0'
            if y % plank == 0:
                col = 'out'
            px[x, y] = c(col)
    # khăn
    m = 22 if CW > H else 16
    x0, y0, x1, y1 = ox + m, m, ox + CW - 1 - m, H - 1 - m
    lx, ly = ox + CW * 0.82, H * 0.12    # nguồn sáng: ngọn nến
    diag = math.hypot(CW, H)
    for y in range(y0, y1 + 1):
        for x in range(x0, x1 + 1):
            light = 1 - math.hypot(x - lx, y - ly) / diag      # 0..1
            col = 'p0'
            if bayer(x, y, max(0, light - .25) * 1.6):
                col = 'p1'
            if bayer(x, y, max(0, light - .62) * 2.2):
                col = 'p2'
            px[x, y] = c(col)
    d = draw(img)
    # viền thêu: hai đường vàng + chấm ở góc
    for inset, col in ((6, 'au1'), (9, 'au0')):
        d.rectangle([x0 + inset, y0 + inset, x1 - inset, y1 - inset], outline=c(col))
    for (cx, cy) in ((x0 + 6, y0 + 6), (x1 - 6, y0 + 6), (x0 + 6, y1 - 6), (x1 - 6, y1 - 6)):
        for dx, dy in [(0, 0), (1, 0), (-1, 0), (0, 1), (0, -1)]:
            put(img, cx + dx, cy + dy, 'au2')
    # tua rua ở mép khăn
    for x in range(x0 + 2, x1 - 1, 4):
        put(img, x, y0 - 1, 'au0')
        put(img, x, y1 + 1, 'au0')
        put(img, x, y1 + 2, 'au0' if x % 8 == 2 else 'p0')
    # sao thêu rải, chừa vùng giữa cho lá bài
    r = rng(seed)
    for _ in range(int(CW * H / 2600)):
        x, y = r.randint(x0 + 16, x1 - 16), r.randint(y0 + 16, y1 - 16)
        if abs(x - W / 2) < CW * 0.3 and abs(y - H * 0.46) < H * 0.3:
            continue
        put(img, x, y, 'au0')
        if r.random() < .35:
            for dx, dy in [(1, 0), (-1, 0), (0, 1), (0, -1)]:
                put(img, x + dx, y + dy, 'au0')
            put(img, x, y, 'au1')
    # vòng đọc bài: elip chấm vàng
    # bản ngang: vòng nhỏ hơn một chút để sổ nằm mở bên phải mà không cắt vòng
    rx, ry = (CW * 0.30, H * 0.33) if CW > H else (CW * 0.40, H * 0.27)
    cx, cy = W / 2, H * 0.46
    steps = int(2 * math.pi * max(rx, ry) / 4)
    for i in range(steps):
        a = 2 * math.pi * i / steps
        put(img, round(cx + rx * math.cos(a)), round(cy + ry * math.sin(a)), 'au0' if i % 3 else 'au1')
    # trăng khuyết thêu ở mép gần (phía khách)
    mx, my = int(W / 2), int(y1 - (26 if CW > H else 34))
    for y in range(my - 9, my + 10):
        for x in range(mx - 9, mx + 10):
            if (x - mx) ** 2 + (y - my) ** 2 <= 7 ** 2 and (x - mx + 3) ** 2 + (y - my + 2) ** 2 > 6 ** 2:
                put(img, x, y, 'au1')
    return img


# ------------------------------------------------------------------ tay Nguyệt (đưa từ phía bên kia bàn, nhìn từ trên)
def sleeve_and_hand(point=True):
    """Ống tay áo xanh đêm viền vàng chạy từ mép trên xuống, bàn tay úp, ngón trỏ duỗi khi chỉ."""
    W, H = 34, 66
    img = new(W, H)
    d = draw(img)
    # ống tay: loe nhẹ, sao rắc như áo choàng
    # mép trên thẳng 3..30 để nối liền với sleeve_tile, loe dần xuống cổ tay
    d.polygon([(3, 0), (30, 0), (30, 6), (28, 30), (6, 30), (3, 6)], fill=c('n2'))
    d.line([(4, 0), (4, 6)], fill=c('n3'))
    d.line([(4, 6), (7, 30)], fill=c('n3'))
    d.line([(29, 0), (29, 6)], fill=c('n1'))
    d.line([(29, 6), (27, 30)], fill=c('n1'))
    for p in [(10, 6), (19, 12), (14, 21), (24, 4), (22, 24)]:
        put(img, *p, 'cr')
    # viền tay áo vàng
    d.rectangle([6, 28, 27, 31], fill=c('au1'))
    d.line([(6, 31), (27, 31)], fill=c('au0'))
    for x in range(7, 27, 3):
        put(img, x, 29, 'au2')
    # bàn tay
    d.rectangle([9, 32, 24, 43], fill=c('k2'))
    d.line([(9, 32), (9, 43)], fill=c('k1'))
    d.line([(24, 33), (24, 42)], fill=c('k1'))
    for gx in (13, 17, 21):
        d.line([(gx, 38), (gx, 43)], fill=c('k1'))
    # ngón cái
    d.polygon([(24, 34), (28, 37), (27, 41), (24, 40)], fill=c('k2'))
    if point:
        # ngón trỏ duỗi thẳng xuống; các ngón khác co lại
        d.rectangle([13, 43, 16, 62], fill=c('k2'))
        d.line([(13, 44), (13, 62)], fill=c('k1'))
        d.line([(13, 63), (16, 63)], fill=c('k1'))
        d.rectangle([17, 43, 24, 46], fill=c('k1'))
        d.rectangle([9, 43, 12, 46], fill=c('k1'))
    else:
        # bốn ngón đặt phẳng
        for i, fx in enumerate((9, 13, 17, 21)):
            ln = (6, 8, 8, 6)[i]
            d.rectangle([fx, 43, fx + 3, 43 + ln], fill=c('k2'))
            d.line([(fx, 44), (fx, 43 + ln)], fill=c('k1'))
    # nhẫn vàng ở ngón áp út (như sprite chính)
    d.line([(17, 44), (20, 44)], fill=c('au1'))
    put(img, 19, 44, 'au2')
    return outline(img)


def sleeve_tile():
    """Đoạn ống tay áo 34x8 lặp dọc (repeat-y) phía trên hand_*.png, để cánh tay vươn từ mép xa của bàn."""
    W, H = 34, 8
    img = new(W, H)
    d = draw(img)
    d.rectangle([3, 0, 30, H - 1], fill=c('n2'))
    d.line([(4, 0), (4, H - 1)], fill=c('n3'))
    d.line([(29, 0), (29, H - 1)], fill=c('n1'))
    for p in [(11, 2), (21, 5), (16, 7)]:
        put(img, *p, 'cr')
    d.line([(2, 0), (2, H - 1)], fill=c('out'))
    d.line([(31, 0), (31, H - 1)], fill=c('out'))
    return img


# ------------------------------------------------------------------ cuốn sổ của Bấc (gập, nhìn từ trên)
def book():
    W, H = 70, 50
    img = new(W, H)
    d = draw(img)
    # mép giấy thò ra bên phải và phía dưới
    d.rectangle([4, 4, 66, 47], fill=c('cr'))
    d.line([(5, 47), (66, 47)], fill=c('o2'))
    d.line([(66, 5), (66, 47)], fill=c('o2'))
    # bìa da
    d.rectangle([2, 2, 63, 44], fill=c('w2'))
    for y in range(2, 45):
        for x in range(2, 64):
            if bayer(x, y, 0.18):
                put(img, x, y, 'w1')
    d.rectangle([2, 2, 9, 44], fill=c('w1'))       # gáy
    d.line([(9, 2), (9, 44)], fill=c('out'))
    d.line([(3, 8), (8, 8)], fill=c('au0'))
    d.line([(3, 38), (8, 38)], fill=c('au0'))
    # góc bọc đồng
    for (cx, cy, sx, sy) in ((63, 2, -1, 1), (63, 44, -1, -1)):
        for k in range(5):
            put(img, cx + sx * k, cy, 'au1')
            put(img, cx, cy + sy * k, 'au1')
    # trăng khuyết dập vàng giữa bìa
    mx, my = 37, 23
    for y in range(my - 8, my + 9):
        for x in range(mx - 8, mx + 9):
            if (x - mx) ** 2 + (y - my) ** 2 <= 7 ** 2 and (x - mx + 3) ** 2 + (y - my + 2) ** 2 > 6 ** 2:
                put(img, x, y, 'au1')
    put(img, 46, 15, 'au2')
    put(img, 49, 29, 'au1')
    # dải đánh dấu trang
    d.rectangle([52, 44, 55, 49], fill=c('p2'))
    put(img, 52, 49, (0, 0, 0, 0))
    put(img, 55, 49, (0, 0, 0, 0))
    return outline(img)


BOOK_SLICE = (10, 10, 12, 18)   # trên, phải, dưới, trái (border-image-slice)


def book_frame():
    """40x42, 9-slice cho cuốn sổ mở: bìa da nâu bọc ngoài, góc bọc đồng, chồng mép trang,
    gáy sổ bên trái có chỉ khâu vàng và bóng gáy trên giấy. Đoạn giữa mỗi cạnh dài bội số 4
    để chỉ khâu lặp tròn (border-image-repeat: round)."""
    W, H = 40, 42
    T, R, B, L = BOOK_SLICE
    img = new(W, H, 'cr')
    px = img.load()
    for y in range(H):
        for x in range(W):
            leather = x < L - 6 or x >= W - 5 or y < 5 or y >= H - 6
            if leather:
                px[x, y] = c('w1' if bayer(x, y, 0.28) else 'w2')
    d = draw(img)
    d.rectangle([0, 0, W - 1, H - 1], outline=c('out'))
    # mép bìa sáng hơn ở phía nến (trên, phải)
    d.line([(1, 1), (W - 2, 1)], fill=c('w3'))
    d.line([(W - 2, 1), (W - 2, H - 2)], fill=c('w3'))
    # gáy: dải da đậm, chỉ khâu vàng mỗi 4px
    d.rectangle([1, 1, 4, H - 2], fill=c('w0'))
    for y in range(2, H - 2, 4):
        put(img, 7, y, 'au0')
        put(img, 7, y + 1, 'au1')
    # mép trong của bìa
    d.line([(L - 6, 5), (L - 6, H - 7)], fill=c('out'))
    d.line([(L - 6, 4), (W - 6, 4)], fill=c('out'))
    d.line([(W - 6, 4), (W - 6, H - 7)], fill=c('out'))
    d.line([(L - 6, H - 7), (W - 6, H - 7)], fill=c('out'))
    # chồng mép trang (dưới dày hơn, phải mỏng)
    for k, col in enumerate(('o2', 'cr', 'o2')):
        d.line([(L - 5, H - 8 - k), (W - 7, H - 8 - k)], fill=c(col))
    for k, col in enumerate(('o2', 'cr')):
        d.line([(W - 7 - k, 5), (W - 7 - k, H - 9)], fill=c(col))
    # bóng gáy trên giấy, nhạt dần sang phải
    for x in range(L - 5, L):
        f = (L - x) / 6
        for y in range(5, H - 10):
            if bayer(x, y, f):
                px[x, y] = c('o2' if f > .5 else 'o3')
    # góc bọc đồng ở hai góc ngoài bên phải
    for (cx, cy, sx, sy) in ((W - 1, 0, -1, 1), (W - 1, H - 1, -1, -1)):
        for k in range(4):
            put(img, cx + sx * k, cy + sy, 'au1')
            put(img, cx + sx, cy + sy * k, 'au1')
        put(img, cx + sx, cy + sy, 'au2')
    return img


# ------------------------------------------------------------------ ô chân dung (cắt từ sprite Nguyệt)
PORTRAIT_BOX = (60, 38, 108, 86)     # 48x48 quanh mắt trăng khuyết và cằm, trong khung keeper


def portraits():
    box = PORTRAIT_BOX
    out = {}
    out['portrait/nguyet_idle.png'] = characters.keeper().crop(box)
    out['portrait/nguyet_blink.png'] = characters.keeper(eye='closed').crop(box)
    for i, m in enumerate(['closed', 'half', 'open']):
        out[f'portrait/nguyet_speak_{i}.png'] = characters.keeper(mouth=m).crop(box)
    out['portrait/nguyet_glow.png'] = characters.keeper_glow(0).crop(box)
    return out


def build():
    save(tabletop(960, 360, 7, CW=640), 'table/tabletop.png', opaque=True)
    save(tabletop(360, 640, 11), 'table/tabletop_doc.png', opaque=True)
    save(sleeve_and_hand(point=True), 'table/hand_point.png')
    save(sleeve_and_hand(point=False), 'table/hand_rest.png')
    save(book(), 'table/book.png')
    save(book_frame(), 'table/book_frame.png', opaque=True)
    save(sleeve_tile(), 'table/sleeve_tile.png')
    for rel, im in portraits().items():
        save(im, rel)


if __name__ == '__main__':
    build()
    print('table ok')
