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
    """Mặt bàn của Nguyệt nhìn từ chỗ khách ngồi, hơi chếch xuống: mép xa hẹp hơn mép gần (phối cảnh),
    hai mép bên chéo dần, ngoài mép bàn là sàn nhà chìm trong bóng tối. Khăn tím mận như ở góc mặt Nguyệt
    (interior.table) phủ kín mặt bàn rồi rủ qua mép (dải nếp gấp tối, viền vàng ở mép), mép gần phía khách
    là dải viền vàng đính hạt; sao thêu thưa dần về phía xa; vòng đọc bài chấm vàng; trăng khuyết ở mép gần.
    Vạt áo và hai tay nghỉ của Nguyệt ở mép xa là lớp DOM (.table-robe).
    CW: bề rộng vùng giữa để đặt vòng đọc bài; phần thêm hai bên cho máy lia ngang khi sổ nằm ở góc bàn.
    Ánh nến đến từ góc trên phải mặt bàn (dither Bayer)."""
    CW = CW or W
    landscape = CW > H
    img = new(W, H, 'out')
    px = img.load()
    cx0 = W / 2
    # Mép xa ngay dưới thanh trên cùng (vạt áo Nguyệt phủ lên đó). Hai mép bên hội tụ về tâm máy:
    # bản dọc đối xứng; bản ngang dùng cho desktop có sổ ghim, máy lệch phải nên mép trái chéo rõ
    # và hiện trong khung, mép phải nằm ngoài cột sổ để sổ vẫn nằm trên bàn.
    if landscape:
        far_y, far_l, far_r, near_l, near_r = 40, 286, 890, -130, 1090
    else:
        far_y, far_l, far_r, near_l, near_r = 52, 64, W - 64, -14, W + 14

    def edges(y):
        t = (y - far_y) / max(1, H - far_y)
        return far_l + (near_l - far_l) * t, far_r + (near_r - far_r) * t

    def hw(y):  # nửa bề rộng quanh tâm vòng đọc bài (dùng để chừa sao)
        l, r_ = edges(y)
        return min(cx0 - l, r_ - cx0)

    # sàn nhà trong bóng tối: ván mờ, rất tối
    for y in range(H):
        for x in range(W):
            if bayer(x, y, 0.10 + 0.08 * ((x // 7 + y // 40) % 2)):
                px[x, y] = c('n0')
    lx, ly = (730 if landscape else W - 84), far_y + H * 0.10   # nguồn sáng: ngọn nến gần góc xa bên phải
    diag = math.hypot(W, H)
    drape = 7                                          # dải khăn rủ qua mép bên
    for y in range(far_y, H):
        el, er = edges(y)
        depth = (y - far_y) / (H - far_y)              # 0 ở mép xa, 1 ở mép gần
        for x in range(W):
            out_by = max(el - x, x - er)               # >0: ngoài mép bàn
            if out_by <= 0:
                light = 1 - math.hypot(x - lx, y - ly) / diag
                light -= (1 - depth) * 0.08            # xa thì tối hơn một chút
                col = 'p0'
                if bayer(x, y, max(0, light - .25) * 1.6):
                    col = 'p1'
                if bayer(x, y, max(0, light - .62) * 2.2):
                    col = 'p2'
                px[x, y] = c(col)
            elif out_by <= drape:
                # khăn rủ xuống qua mép bên: nếp gấp tối, nhạt dần vào bóng
                k = out_by
                col = 'p0' if (x + y // 3) % 5 else 'out'
                if k > 4 and bayer(x, y, 0.5):
                    col = 'out'
                px[x, y] = c(col)
    d = draw(img)
    # mép bàn: viền thêu vàng chạy theo mép khăn (hai bên và mép xa)
    for y in range(far_y, H):
        el, er = edges(y)
        put(img, int(el), y, 'au0')
        put(img, int(er), y, 'au0')
        if y > far_y + 4:
            put(img, int(el + 5), y, 'au1')
            put(img, int(er - 5), y, 'au1')
    d.line([(far_l, far_y), (far_r, far_y)], fill=c('au0'))
    d.line([(far_l + 5, far_y + 4), (far_r - 5, far_y + 4)], fill=c('au1'))
    # mép gần: khăn gập xuống phía khách, dải viền vàng đính hạt
    d.line([(0, H - 9), (W, H - 9)], fill=c('au0'))
    d.line([(0, H - 7), (W, H - 7)], fill=c('au2'))
    d.rectangle([0, H - 6, W, H - 3], fill=c('au0'))
    d.line([(0, H - 5), (W, H - 5)], fill=c('au1'))
    for x in range(2, W, 6):
        put(img, x, H - 5, 'au2')
    d.rectangle([0, H - 2, W, H - 1], fill=c('out'))
    # sao thêu, thưa dần về phía xa; chừa vòng đọc bài
    r = rng(seed)
    # phối cảnh: vòng tròn trên mặt bàn hiện ra thành elip dẹt (rộng hơn cao), cả ở bản dọc
    rx, ry = (CW * 0.30, H * 0.30) if landscape else (CW * 0.36, CW * 0.36 * 0.9)
    cy0 = H * 0.46

    def inside(x, y, pad):
        el, er = edges(y)
        return el + pad < x < er - pad and y > far_y + pad

    def star(x, y, big):
        put(img, x, y, 'au0')
        if big:
            for ddx, ddy in [(1, 0), (-1, 0), (0, 1), (0, -1)]:
                put(img, x + ddx, y + ddy, 'au0')
            put(img, x, y, 'au1')

    for _ in range(int(W * H / 1500)):
        x, y = r.randint(8, W - 9), r.randint(far_y + 8, H - 16)
        if not inside(x, y, 9) or ((x - cx0) / (rx + 10)) ** 2 + ((y - cy0) / (ry + 10)) ** 2 < 1:
            continue
        if r.random() > 0.35 + 0.65 * (y - far_y) / (H - far_y):
            continue
        star(x, y, r.random() < .3 * (y - far_y) / (H - far_y) + .05)
    for _ in range(max(3, int(W * H / 60000))):
        for _try in range(30):
            x, y = r.randint(20, W - 21), r.randint(far_y + 30, H - 30)
            if inside(x, y, 24) and ((x - cx0) / (rx + 24)) ** 2 + ((y - cy0) / (ry + 24)) ** 2 >= 1:
                break
        for _k in range(r.randint(3, 5)):
            if inside(x, y, 10):
                star(x, y, True)
            x += r.randint(-9, 9)
            y += r.randint(-6, 6)
    # vòng đọc bài: elip chấm vàng
    steps = int(2 * math.pi * max(rx, ry) / 4)
    for i in range(steps):
        a = 2 * math.pi * i / steps
        put(img, round(cx0 + rx * math.cos(a)), round(cy0 + ry * math.sin(a)), 'au0' if i % 3 else 'au1')
    # trăng khuyết thêu ở mép gần (phía khách)
    mx, my = int(W / 2), int(H - (34 if landscape else 44))
    for y in range(my - 9, my + 10):
        for x in range(mx - 9, mx + 10):
            if (x - mx) ** 2 + (y - my) ** 2 <= 7 ** 2 and (x - mx + 3) ** 2 + (y - my + 2) ** 2 > 6 ** 2:
                put(img, x, y, 'au1')
    return img


def robe():
    """Lòng Nguyệt nhìn từ trên xuống, nàng ngồi bên kia mép xa của bàn: vạt áo choàng xanh sao phủ qua mép bàn,
    gấu vàng cong chùng ở giữa, hai bên bo tròn (hai tay vươn ra từ hai bên, .table-arm.is-resting).
    Phần trên chìm dần vào bóng tối phía nàng ngồi (dither tới 'out'), nên mép cắt ở đỉnh vùng chơi không lộ.
    Cùng chất liệu ống tay (n1..n3, sao kem). Dưới gấu là bóng đổ lên khăn bằng dither."""
    W, H = 96, 34
    img = new(W, H)
    px = img.load()
    for x in range(W):
        t = (x + 0.5) / W
        u = 2 * t - 1                                      # -1..1
        # gấu áo: cung elip, thấp nhất ở giữa, bo lên ở hai bên
        hem = int(8 + 18 * math.sqrt(max(0.0, 1 - u * u)))
        for y in range(0, hem + 1):
            dark = 1 - y / max(1, hem)                     # 1 ở đỉnh, 0 ở gấu
            col = 'n2'
            if bayer(x, y, 0.25 + 0.45 * abs(u) ** 2):     # hai bên tối hơn (bo tròn)
                col = 'n1'
            if bayer(x, y, max(0, dark - 0.45) * 1.9):     # đỉnh chìm vào bóng tối
                col = 'out'
            px[x, y] = c(col)
        # nếp gấp dọc ở giữa vạt
        if abs(u) < 0.75 and x % 13 in (0, 1):
            for y in range(int(hem * 0.45), hem - 2):
                px[x, y] = c('n3' if x % 13 == 0 else 'n1')
        # viền gấu vàng
        if abs(u) < 0.97:
            px[x, hem] = c('au0')
            px[x, hem - 1] = c('au1' if x % 4 else 'au2')
            if hem + 1 < H:
                px[x, hem + 1] = c('out')
            for k, dens in ((2, .7), (3, .45), (4, .25), (5, .12)):
                if hem + k < H and bayer(x, hem + k, dens):
                    px[x, hem + k] = c('out')
    r = rng(5)
    for _ in range(18):
        x, y = r.randint(6, W - 7), r.randint(8, 22)
        if px[x, y][3] and px[x, y][:3] == PAL['n2']:
            put(img, x, y, 'cr')
    return img


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
    save(robe(), 'table/robe.png')
    for rel, im in portraits().items():
        save(im, rel)


if __name__ == '__main__':
    build()
    print('table ok')
