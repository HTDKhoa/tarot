import random

from rws_draw import T, capsule, ellipse_pts, form, inside, region, smooth
from rws_symbols import cloud
from rws_texture import leafy

SCAN = 'Cups04.jpg'
CROP = (52, 358, 1046, 1777)
NUMERAL = 'IV'
# trời: sáng ở dưới, dither sẫm dần lên mép trên như lá mẫu
SKY = ('sky', 3, 1, (), [], 46)
SYMBOLS = ['người ngồi khoanh tay dưới gốc cây', 'bàn tay từ mây đưa cốc thứ tư',
           'ba cốc xếp hàng trên cỏ', 'đồi xanh sau lưng']

# Cả lá vẽ lại bằng tay theo lá mẫu trong reference/ (bảng màu 5 tông lệch sắc, tô khối form(),
# viền sel-out); bố cục và tỷ lệ căn bằng rws_overlay.py. Lưới RWS chỉ còn là bản phác.
TRACE = True
INK_T = 0.5                    # áo, tóc gạch bóng dày: chỉ giữ nét đặc làm mực
HATCH = 16
MATERIALS = [
    ('trời', [(13, 11), (13, 88), (90, 37), (102, 88), (45, 24), (51, 75), (83, 5), (102, 9)], '~'),
    ('đồi', [(13, 120), (77, 139), (102, 114), (38, 114), (90, 152)], 'l', {'hatch': 'g'}),
    ('lá', [(90, 14)], 'LlgG'),
    ('thân cây', [(68, 11), (68, 30), (65, 43)], 'jHh', {'hatch': 'h'}),
    ('mây', [(15, 56), (23, 52)], 'wcx'),
    ('áo', [(79, 78), (90, 80), (74, 96)], 'Llg'),
    ('tay áo', [(63, 91), (90, 93)], 'frR'),
    ('quần', [(90, 116)], 'Iib'),
    ('da', [(75, 62), (78, 65)], 'kKm'),
    ('cốc', [(8, 137), (28, 137), (42, 56)], 'yAa'),
]

# cốc thấp, mập, vàng cam như lá mẫu: vệt sáng dọc bên trái, thân vàng, mép phải cam rồi nâu
CUP = [
    'oooooooooooooo',
    'oaaaaaaaaaaaao',
    'oOyyAAAAAOOOao',
    'oOyyAAAAAOOOao',
    'oOyyAAAAAOOaao',
    '.oOyAAAAOOaao.',
    '.oOyAAAAOOaao.',
    '..oOyAAAOaao..',
    '..oOyAAAOaao..',
    '...oOyAOaao...',
    '....oOyAao....',
    '.....oyAo.....',
    '....oOyAao....',
    '....oaaaao....',
    '.....oyAo.....',
    '.....oyAo.....',
    '.....oyAo.....',
    '....oOyAao....',
    '...oOyAAOao...',
    '..oOyAAAOOao..',
    '.oOyAAAAAOOao.',
    'oOyyAAAAAOOOao',
    'oaaaaaaaaaaaao',
    'oooooooooooooo',
]


GRASS, LEAF, BARK, GOLD = T('grass'), T('leaf'), T('bark'), T('gold')
FLESH, HAIR, TUNIC, SLEEVE, PANTS, CLOUD = T('skin'), T('hair'), T('tunic'), T('sleeve'), T('pants'), T('cloud')

HILL = [(0, 113), (12, 112), (26, 109), (40, 105), (52, 100), (62, 98), (76, 99), (90, 103), (100, 107), (110, 109),
        (110, 157), (0, 157)]
FAR = [(0, 110), (6, 107), (14, 108), (22, 106), (30, 109), (34, 112), (0, 114)]
TRUNK = [(58, -3), (79, -3), (78, 30), (77, 60), (77, 82), (79, 94), (85, 101), (52, 101), (57, 94),
         (59, 82), (59, 60), (58, 30)]
CANOPY = [  # chùm lá rủ (cx, cy, rộng, cao), sau → trước: khối lớn phải, cụm nhỏ trái
    (20, -2, 22, 12), (40, -3, 22, 12), (62, -3, 22, 12), (86, -3, 24, 14), (106, 0, 16, 16),
    (28, 5, 14, 14), (48, 6, 12, 12), (76, 8, 16, 22), (96, 10, 18, 26), (110, 18, 10, 24),
    (88, 26, 12, 20), (104, 32, 9, 18), (66, 10, 10, 14),
]
CUP_COLORS = {'o': 'o', 'a': GOLD[1], 'O': GOLD[2], 'A': GOLD[3], 'y': GOLD[4]}


def blob(pts):
    return region(smooth(list(pts)))


def background(c):
    for y in range(c.h):
        for x in range(c.w):
            if inside(HILL, x, y):
                c.px(x, y, GRASS[2])
            elif inside(FAR, x, y):
                c.px(x, y, 'v' if y < 110 else 'V')
            else:
                c.px(x, y, '~')
    # cỏ: vệt ngang dài như gió lướt, sáng nhất vàng chanh, tối xanh rêu
    rnd = random.Random(5)
    area = [(x, y) for y in range(96, c.h) for x in range(c.w) if inside(HILL, x, y)]
    aset = set(area)
    for _ in range(len(area) // 40):
        x, y = rnd.choice(area)
        k = rnd.choice((3, 3, 4, 1, 1, 3))
        ln = rnd.randint(8, 26) if k >= 3 else rnd.randint(6, 16)
        th = rnd.choice((1, 2, 2, 3))
        for i in range(ln):
            for dy in range(th if 1 < i < ln - 2 else 1):
                q = (x + i, y + dy - i // 10)
                if q in aset:
                    c.px(*q, GRASS[k])
    # mép đồi: viền mực, ngay dưới là một hàng sáng
    for x in range(c.w):
        for y in range(90, c.h):
            if inside(HILL, x, y):
                c.px(x, y - 1, 'o')
                c.px(x, y, GRASS[3])
                break


def tree(c):
    reg = blob(TRUNK)
    rows = {}
    for x, y in reg:
        rows.setdefault(y, []).append(x)
    rnd = random.Random(2)
    for y, xs in rows.items():
        x0, x1 = min(xs), max(xs)
        for x in xs:
            u = (x - x0) / max(1, x1 - x0)
            k = 4 if 0.18 < u < 0.3 else 3 if u < 0.45 else 2 if u < 0.75 else 1 if u < 0.92 else 0
            c.px(x, y, BARK[k])
    for _ in range(40):                                  # sọc vỏ dọc
        y = rnd.choice(sorted(rows))
        x = rnd.randint(min(rows[y]) + 2, max(rows[y]) - 2)
        for k in range(rnd.randint(4, 9)):
            if (x, y + k) in reg:
                c.px(x, y + k, BARK[1])
    for x, y in [(66, 25), (67, 25), (66, 26), (67, 26)]:      # mắt gỗ
        c.px(x, y, 'o')
    for x, y in reg:
        for q in ((x + 1, y), (x - 1, y)):
            if q not in reg and c.get(*q) == '~':
                c.px(*q, 'o')
    leafy(c, CANOPY, LEAF, seed=9)


HEAD2 = [   # tóc ôm đỉnh và rủ hai bên như mũ, mặt cúi để trống
    '....ooooooo....',
    '..ooiijjjiioo..',
    '.oiijjjjjiiiio.',
    'oiijjjiiiiiiiho',
    'oiijiiiiiiiihho',
    'oiiihhhhhhiihho',
    'ohihnnnnnnmhhho',
    'ohhnnnnnnnmmhho',
    'ohhnnnnnnmmmhho',
    '.ohnnnnnnmmmho.',
    '.ohnnnnnmmmlho.',
    '..onnnnnmmllo..',
    '..ommnnmmmllo..',
    '...ollmmmllo...',
    '....olllllo....',
]

# Các mảng của người, tọa độ ô tranh, vẽ sau → trước. Dáng ngồi khom tựa gốc cây như RWS:
# áo chui phủ vai thành hình chuông, tay áo phồng lộ ra hai bên từ giữa cánh tay, cẳng tay phải
# vắt chéo lên cẳng tay trái, chân bắt chéo thành một dải, một ủng chúi xuống dốc.
PANTS_BAND = [(66, 113), (73, 112), (84, 113), (92, 112), (99, 113), (101.5, 116.5), (99.5, 121), (92, 123),
              (84, 124), (74, 124), (67, 122.5), (64, 118)]
BOOT_LEFT = [(63.5, 117.5), (68, 116.5), (71, 119), (70.5, 124), (66, 124.5), (63, 122)]
BOOT_DOWN = [(83, 122.5), (87.5, 122.5), (89.5, 128), (91.5, 131.5), (90.5, 134), (86.5, 134), (84.5, 130)]
PONCHO = [(72, 85), (78, 83.5), (86, 83.5), (92, 85), (96, 89), (97, 94), (97, 100), (96, 106), (98, 110),
          (99.5, 113.5), (93, 114.5), (86, 113.5), (80, 114.5), (72, 113.5), (64.5, 114), (63, 110), (64, 104),
          (64, 96), (66, 90)]
SCARF = [(75, 83), (89, 83), (86, 87), (83, 92), (81, 92), (78, 87)]
SLEEVE_LEFT = [(68, 92), (63, 94), (61, 98), (61, 103), (63, 106), (68, 107.5), (78, 107), (86, 106),
               (87.5, 103), (84, 101), (72, 101), (69, 99), (69, 94)]
SLEEVE_RIGHT = [(94, 91), (98, 93), (100.5, 97), (100.5, 102), (98, 105.5), (93, 106), (86, 104.5),
                (79, 102.5), (75, 101.5), (75, 98), (79, 96.5), (86, 97.5), (91, 98.5), (93, 96)]
HAND = [(82.5, 96.5), (87, 96), (89, 97.5), (88.5, 100), (83.5, 100.5), (82, 99)]


def stroke(c, pts, col, members):
    """Nét gấp khúc qua các điểm, chỉ vẽ lên pixel thuộc `members`."""
    for (xa, ya), (xb, yb) in zip(pts, pts[1:]):
        n = max(abs(xb - xa), abs(yb - ya), 1)
        for k in range(int(n) + 1):
            p = (round(xa + (xb - xa) * k / n), round(ya + (yb - ya) * k / n))
            if p in members:
                c.px(*p, col)


def man(c):
    P, S, U = PANTS, SLEEVE, TUNIC
    form(c, region(PANTS_BAND), P, round_px=3, levels=(0.05, 0.2, 0.38, 0.58))   # vải trắng: sáng hơn
    band = region(PANTS_BAND)
    stroke(c, [(99, 115), (90, 118), (80, 121), (74, 123)], P[1], band)   # ống chân trước vắt chéo
    stroke(c, [(98, 114), (89, 117), (79, 120), (73, 122)], P[4], band)   # mép sáng phía trên nếp
    stroke(c, [(72, 113), (70, 117), (69, 121)], P[1], band)               # gối trái gập
    form(c, region(BOOT_LEFT), BARK, round_px=2)
    form(c, region(BOOT_DOWN), BARK, round_px=2)

    poncho = region(PONCHO)
    form(c, poncho, U, round_px=3, levels=(0.05, 0.22, 0.5, 0.72))   # vải sáng màu: ít vùng tối
    for top, bot in [((71, 109), (69, 113)), ((80, 110), (80, 114)), ((89, 109), (91, 113))]:
        stroke(c, [top, bot], U[2], poncho)                                # nếp vạt áo, nhẹ
        stroke(c, [(top[0] - 1, top[1]), (bot[0] - 1, bot[1])], U[4], poncho)
    stroke(c, [(81, 91), (81, 100)], U[1], poncho)                         # nẹp khuy
    form(c, region(SCARF), S, round_px=2)

    left = region(SLEEVE_LEFT)
    form(c, left, S, round_px=3)
    stroke(c, [(66, 98), (67, 101), (69, 104)], S[1], left)                # nếp khuỷu trái
    stroke(c, [(74, 104), (82, 104)], S[1], left)
    right = region(SLEEVE_RIGHT)
    form(c, right, S, round_px=3)
    stroke(c, [(96, 96), (95, 99), (93, 103)], S[1], right)                # nếp khuỷu phải
    stroke(c, [(88, 100), (82, 99.5)], S[2], right)
    stroke(c, [(90, 98), (84, 97.5)], S[4], right)                         # vệt sáng cẳng tay trên
    form(c, region(HAND), FLESH, round_px=2)
    c.rows(76, 69, HEAD2, {'h': HAIR[1], 'i': HAIR[2], 'j': HAIR[3],
                           'n': FLESH[4], 'm': FLESH[3], 'l': FLESH[2], 'k': FLESH[1]})


def draw(c):
    background(c)
    tree(c)
    cloud(c, [(10, 62, 7, 5), (15, 53, 8, 7), (24, 50, 8, 6), (31, 57, 6, 6), (20, 64, 9, 5)],
          (CLOUD[4], CLOUD[2], CLOUD[1]))
    form(c, blob(capsule(31, 65, 43, 64, 2.6, 2.4)), FLESH, round_px=2)
    c.rows(38, 50, CUP, CUP_COLORS)
    for x in (4, 23, 45):
        c.rows(x, 128, CUP, CUP_COLORS)
    man(c)
