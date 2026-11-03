import math

from rws_draw import ellipse_pts, inside, mottle, parts
from rws_symbols import cloud, coin

SCAN = 'Pents01.jpg'
CROP = (44, 228, 1050, 1690)
NUMERAL = ''
SKY = (None, 'x', 'c', (), [], 22)          # tím xám, dither kem sáng dần lên mép trên
SYMBOLS = ['bàn tay từ mây nâng đồng xu', 'đồng xu vàng có ngôi sao năm cánh', 'vầng sáng quanh tay',
           'vòm hoa lối vào vườn', 'lối đi vàng dẫn tới núi xa', 'hoa huệ trắng trong vườn']

CLOUD = ('w', 'c', 's')
HEDGE_TOP = 101
ARCH = (58.5, 101, 10, 13)          # tâm x, chân vòm y, bán kính ngang, cao
GATE = [(54, 101), (54, 96), (56, 93), (61, 93), (63, 96), (63, 112), (54, 112)]
PATH = [(56, 112), (61, 112), (64, 125), (53, 125)]


def draw(c):
    # trời xám kem phẳng, toàn bộ lá vẽ lại bằng hình
    for y in range(c.h):
        for x in range(c.w):
            c.px(x, y, '~')

    # vầng sáng: tia ngắn tỏa quanh bàn tay
    for k in range(26):
        a = math.radians(200 + k * 7)
        x0, y0 = 50 + 26 * math.cos(a), 54 - 13 * math.sin(a)
        if k % 2 == 0:
            c.line(round(x0), round(y0), round(50 + 30 * math.cos(a)), round(54 - 15 * math.sin(a)), 'w')

    # mây cuộn bên trái
    cloud(c, tone=('w', 'w', 's'), puffs=[(10, 22, 10, 9), (5, 37, 8, 8), (11, 51, 10, 9), (21, 57, 6, 6), (15, 69, 10, 8), (25, 77, 7, 5)])

    coin(c, 53, 32, 17)
    # bàn tay ngửa đỡ đồng xu (sau → trước): cẳng tay ra từ mây, lòng tay, ngón cong ôm mép phải, ngón cái
    hand = ('w', 'w', 'c')
    parts(c, [
        ([(14, 51), (26, 49), (36, 48), (42, 50), (50, 51), (60, 50), (66, 47), (69, 42), (72, 40), (73, 46),
          (71, 52), (66, 58), (58, 62), (48, 64), (38, 64), (28, 62), (14, 61)], hand),
        ([(46, 53), (56, 52), (62, 51), (64.5, 53), (58, 55.5), (48, 56)], hand, {'sep': 's'}),
    ], ink='s')
    # kẽ ngón cong ôm mép đồng xu
    c.line(67, 48, 65, 55, 'c')
    c.line(70, 47, 68, 54, 'c')

    # vườn: hàng rào hoa, vòm cổng, núi xa, lối vàng, bãi cỏ
    for x in range(c.w):
        top = HEDGE_TOP + round(1.2 * math.sin(x * 0.9) + math.sin(x * 0.37))
        for y in range(top, 113):
            c.px(x, y, 'g')
        c.px(x, top - 1, 'o')
    for x, y in c._mask(lambda d: d.ellipse((ARCH[0] - ARCH[2], ARCH[1] - ARCH[3], ARCH[0] + ARCH[2], ARCH[1] + ARCH[3] * 0.3), fill=1)):
        c.px(x, y, 'g')
    for x, y in c._mask(lambda d: d.ellipse((ARCH[0] - ARCH[2] - 1, ARCH[1] - ARCH[3] - 1, ARCH[0] + ARCH[2] + 1, ARCH[1] + ARCH[3] * 0.3 + 1), outline=1)):
        if y < HEDGE_TOP:
            c.px(x, y, 'o')
    for y in range(90, 113):
        for x in range(50, 68):
            if inside(GATE, x, y):
                c.px(x, y, 'B' if y > 103 - (x - 54) * 0.6 and y > 99 else 'i')
    for y in range(112, c.h):
        for x in range(c.w):
            c.px(x, y, 'y' if inside(PATH, x, y) else 'l')
    c.line(0, 112, 85, 112, 'G')
    mottle(c, 'lL', 'g', 'L', seed=3, scale=5)
    mottle(c, 'g', 'G', 'l', seed=8, scale=3, amount=0.3)
    for x, y in [(4, 104), (14, 103), (24, 106), (34, 104), (44, 106), (72, 104), (80, 106), (52, 96), (66, 98)]:
        c.rows(x, y, ['.r.', 'rfr', '.R.'])
    for x, y in [(2, 108), (10, 107), (19, 109), (28, 108), (75, 108)]:
        c.rows(x, y, ['w.w', '.w.', '.g.', '.g.'])
