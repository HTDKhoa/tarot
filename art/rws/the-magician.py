import math

from rws_draw import ellipse_pts, mottle, parts, repaint
from rws_symbols import coin

SCAN = 'RWS_Tarot_01_Magician.jpg'
CROP = (48, 96, 1040, 1538)
NUMERAL = 'I'
SKY = ('au', 2, 3, (1, 2, 3), [(45, 25), (70, 60), (8, 70)], 30)
SYMBOLS = ['dấu vô cực trên đầu', 'đũa giơ cao tay phải', 'tay trái chỉ xuống đất',
           'bàn có cốc, kiếm, đồng xu, gậy', 'áo choàng đỏ ngoài áo trắng', 'đai xanh',
           'hoa hồng đỏ và hoa huệ trắng']

MATERIALS = [
    ('trời', [(5, 40), (70, 60), (50, 15), (75, 100), (5, 75), (65, 30), (70, 90)], '~'),
    ('lá', [(0, 112)], 'l'),
    ('áo đỏ', [(27, 60), (55, 60), (28, 100), (52, 105), (30, 80)], 'frR'),
    ('áo trắng', [(40, 55), (38, 65), (20, 32), (61, 69)], 'wcW'),
    ('da', [(35, 40), (16, 18), (67, 76)], 'kKm'),
]

KEEP = set()                      # người, bàn, cốc vẽ lại bằng khối; nền vẽ lại toàn bộ
RED = ('f', 'r', 'R')
WHITE = ('w', 'c', 'W')
FLESH = ('k', 'K', 'm')
BALL = {'shade': 'ball'}


def background(x, y, k, kept):
    garland = x < 10 or x > 74 or y < 7
    garden = y > 108 and not (24 <= x <= 58 and k in 'frRo')
    if kept and not garland and not garden:
        return None
    return '~'


def rose(c, x, y):
    c.rows(x - 2, y - 2, [
        '.ooo.',
        'ofrro',
        'orfRo',
        'oRRRo',
        '.ooo.',
    ])


def lily(c, x, y):
    c.rows(x - 2, y - 2, [
        'o.o.o',
        'wowow',
        '.www.',
        '..g..',
        '..g..',
    ])


def leaf(c, x, y, flip=False):
    rows = ['.oo.', 'oLlo', 'olgo', '.oo.']
    c.rows(x, y, [r[::-1] for r in rows] if flip else rows)


def draw(c):
    repaint(c, KEEP, background)

    # dây hoa hồng treo hai bên và mép trên: thân dây lượn, lá và hoa bám theo
    for y in range(0, 32):
        c.px(3 + round(math.sin(y * 0.35)), y, 'g')
    for y in range(0, 48):
        c.px(81 + round(math.sin(y * 0.3 + 1)), y, 'g')
    for x in range(10, 76):
        if not 30 <= x <= 52:
            c.px(x, 1 + round(0.8 * math.sin(x * 0.4)), 'g')
    for x, y in [(2, 4), (4, 12), (2, 20), (5, 28), (80, 6), (82, 14), (79, 22), (82, 30), (80, 38), (83, 45),
                 (20, 1), (60, 1), (70, 2)]:
        leaf(c, x - 1, y - 1, flip=x > 40)
    for x, y in [(4, 8), (3, 24), (81, 18), (82, 34), (64, 2), (24, 2)]:
        rose(c, x, y)

    # người (sau → trước): áo choàng đỏ, áo trắng, đai xanh, tay giơ đũa, tay chỉ đất, đầu
    parts(c, [
        ([(22, 40), (30, 36), (36, 39), (45, 39), (52, 42), (58, 52), (63, 66), (64, 76), (62, 90), (62, 112),
          (24, 112), (22, 90)], RED),
        ([(34, 41), (45, 41), (46, 72), (44, 86), (36, 86), (34, 72)], WHITE, {'sharp': True}),
        ([(34, 72), (46, 72), (46, 75), (34, 75)], ('I', 'i', 'b'), {'sharp': True}),
        ([(11.5, 1), (14.5, 1), (14.5, 26), (11.5, 26)], WHITE, {'shade': False, 'sep': 'o', 'sharp': True}),
        ([(17, 13), (21, 17), (32, 37), (29, 43), (24, 41), (14, 18)], WHITE),
        (ellipse_pts(14.5, 13.5, 2.5, 2.5), FLESH, BALL),
        ([(54, 58), (60, 64), (65, 71), (62, 74), (55, 67)], WHITE),
        ([(62, 72), (67, 74), (71, 79), (69, 81), (63, 76)], FLESH),
        (ellipse_pts(38.5, 35, 4.5, 5), FLESH, BALL),
        ([(33.5, 34), (33.5, 30), (36, 28.5), (41, 28.5), (43.5, 31), (43.5, 39), (42, 39), (42, 34), (35, 34)],
         ('H', 'h', 'h')),
    ])
    c.line(34, 33, 43, 33, 'w')

    # bàn gỗ phía trước áo choàng: mặt bàn sáng, thân tối
    parts(c, [
        ([(0, 90), (50, 90), (50, 108), (0, 108)], ('H', 'H', 'h'), {'sharp': True}),
        ([(0, 86), (52, 86), (50, 91), (0, 91)], ('j', 'j', 'H'), {'sharp': True}),
    ])
    c.line(1, 99, 48, 99, 'h')
    # cốc vàng chân cao
    c.rows(9, 63, [
        'oooooooooooooo',
        'oYYAAAAAAAAAao',
        'oYAAAAAAAAAAao',
        '.oYAAAAAAAAao.',
        '.oYAAAAAAAAao.',
        '..oYAAAAAAao..',
        '...oYAAAAao...',
        '....ooAaoo....',
        '.....oAao.....',
        '.....oAao.....',
        '.....oAao.....',
        '.....oAao.....',
        '.....oAao.....',
        '.....oAao.....',
        '.....oAao.....',
        '.....oAao.....',
        '.....oAao.....',
        '.....oAao.....',
        '.....oAao.....',
        '.....oAao.....',
        '.....oAao.....',
        '....oYAAao....',
        '...oYAAAAao...',
        '...oaaaaaao...',
    ])

    # vườn dưới chân: thảm lá mép lượn, hồng và huệ, chừa áo choàng
    for x in range(c.w):
        top = 110 + round(1.5 * math.sin(x * 0.7) + math.sin(x * 0.23))
        for y in range(top, c.h):
            if not (24 <= x <= 58 and c.get(x, y) in 'frR'):
                c.px(x, y, 'l')
        if c.get(x, top) == 'l':
            c.px(x, top, 'o')
    mottle(c, 'lg', 'g', 'L', seed=5, scale=4, amount=0.3)
    for x, y in [(6, 114), (16, 118), (66, 114), (78, 118), (72, 122), (3, 122), (52, 117)]:
        rose(c, x, y)
    for x, y in [(11, 114), (62, 119), (82, 112), (20, 113), (30, 119)]:
        lily(c, x, y)

    # dấu vô cực đen trên đầu
    c.rows(30, 21, [
        '.ooooo.....ooooo.',
        'oo...oo...oo...oo',
        'o.....oo.oo.....o',
        'o......ooo......o',
        'o.....oo.oo.....o',
        'oo...oo...oo...oo',
        '.ooooo.....ooooo.',
    ])
    # trên bàn: đồng xu, kiếm nằm ngang
    coin(c, 8, 87, 5)
    c.line(18, 88, 46, 88, 'x')
    c.line(18, 89, 46, 89, 's')
    c.rect(16, 86, 17, 91, 'a')
    c.rect(13, 88, 15, 89, 'H')
