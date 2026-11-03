from rws_draw import ellipse_pts, inside, mottle, parts, repaint
from rws_symbols import small_star, star

SCAN = 'RWS_Tarot_17_Star.jpg'
CROP = (52, 110, 1050, 1561)
NUMERAL = 'XVII'
SKY = ('b', 2, 3, (2, 3), [(25, 40), (10, 60), (60, 10)], 26)
SYMBOLS = ['ngôi sao lớn tám cánh', 'bảy sao trắng nhỏ', 'người quỳ một gối, chân trên đất, chân trong nước',
           'hai bình đổ nước: một xuống ao, một xuống đất (năm dòng)', 'chim đậu trên cây', 'đồi xa']

# sau → trước; sao vẽ lại bằng rws_symbols nên mảng sao để là trời
MATERIALS = [
    ('trời', [(5, 35), (40, 45), (60, 35), (84, 10), (30, 62), (55, 40)], '~'),
    ('sao trắng', [(11, 24), (75, 5), (11, 61)], '~'),
    ('sao vàng', [(44, 19), (36, 22), (52, 22)], '~'),
    ('đồi', [(10, 68), (20, 69)], 'v'),
    ('cỏ', [(10, 80), (84, 100), (5, 90), (50, 85), (70, 80), (65, 115), (62, 100), (70, 95), (80, 110)], 'l'),
    ('cây', [(78, 46), (82, 52)], 'Llg'),
    ('nước', [(10, 105), (30, 118), (45, 110)], 'i'),
    ('da', [(50, 58), (60, 65), (40, 85), (65, 92), (55, 70), (45, 75)], 'kKm'),
    ('tóc', [(27, 52), (30, 50), (33, 50)], 'YyA'),
    ('bình', [(80, 67), (17, 86)], 'frR'),
]


TUFTS = [(6, 78), (15, 83), (24, 76), (8, 90), (47, 84), (52, 92), (64, 104), (70, 98), (60, 112),
         (82, 104), (66, 120), (78, 124), (58, 80), (12, 74)]


HORIZON = 71
HILLS = [(0, 67), (5, 65), (12, 66), (19, 64), (26, 67), (33, HORIZON), (0, HORIZON)]
POND = [(0, 97), (14, 96), (30, 97), (44, 99), (54, 101), (57, 105), (56, 111), (51, 117), (45, 122), (42, 125), (0, 125)]
FIGURE = set()                 # người và bình vẽ lại bằng khối, nền vẽ lại toàn bộ
FLESH = ('k', 'K', 'm')
BALL = {'shade': 'ball'}


def background(x, y):
    if y < HORIZON:
        return 'v' if inside(HILLS, x, y) else '~'
    if inside(POND, x, y):
        return 'i'
    return 'l'


def draw(c):
    repaint(c, FIGURE, background)
    star(c, 44, 19, 21, 8.5, fill='y', shade='A')
    for x, y in [(11, 5), (75, 5), (11, 24), (76, 24), (23, 43), (63, 44), (11, 61)]:
        small_star(c, x, y)

    # cây nhỏ và con chim bên phải (bước tách mảng làm mất vì quá mảnh)
    c.rect(78, 52, 79, 74, 'H')
    parts(c, [
        (ellipse_pts(81, 47, 4.5, 4), ('L', 'l', 'g')),
        (ellipse_pts(76, 45, 3.5, 3), ('L', 'l', 'g')),
        (ellipse_pts(83, 54, 3, 3), ('L', 'l', 'g')),
    ])
    c.rows(73, 35, [
        '..oo...',
        '.orfo..',
        'oorrroo',
        '..oRo..',
        '...o...',
    ])

    # bờ xa của ao sẫm, gợn sóng sáng đồng tâm quanh chỗ nước rơi
    for x in range(c.w):
        for y in range(90, c.h):
            if c.get(x, y) == 'i' and c.get(x, y - 1) == 'l':
                c.px(x, y - 1, 'g')
    for r in (4, 8, 12):
        for x, y in c._mask(lambda d, r=r: d.ellipse((21 - r * 1.7, 113 - r * 0.6, 21 + r * 1.7, 113 + r * 0.6), outline=1)):
            if c.get(x, y) == 'i' and (x // 2 + r) % 3:
                c.px(x, y, 'I')
    # dòng nước: bình trái rơi xuống ao, bình phải rơi xuống đất rồi chảy ra mép lá
    c.rect(20, 94, 21, 112, 'I')
    c.rect(22, 95, 22, 111, 'i')
    c.rect(74, 73, 75, 103, 'I')
    c.rect(76, 74, 76, 103, 'i')
    for x0, y0 in [(73, 103), (72, 107), (74, 111), (77, 115), (81, 118)]:
        c.rect(x0, y0, x0 + 3, y0 + 3, 'i')
        c.rect(x0 + 1, y0, x0 + 2, y0 + 1, 'I')

    mottle(c, 'l', 'g', 'L', seed=17, scale=6, amount=0.25)
    # cỏ: vài khóm sẫm cho mặt đất có nhịp, không chấm li ti như bản in
    for x, y in TUFTS:
        if c.get(x, y) == 'l' and c.get(x + 2, y) == 'l':
            c.rows(x, y - 1, ['g.g', '.g.'])

    # người quỳ: chân trái quỳ trên bờ, chân phải bước xuống ao, thân đổ về trước (sau → trước)
    parts(c, [
        ([(56, 97), (64, 95), (74, 91), (85, 88), (86, 92), (76, 96), (66, 100), (58, 101)], FLESH),       # cẳng chân quỳ
        ([(58, 70), (66, 69), (72, 73), (74, 80), (71, 88), (66, 95), (62, 100), (56, 99), (55, 90),
          (55, 80)], FLESH, BALL),                                                                            # đùi và hông
        ([(37, 50), (42, 48), (50, 48), (57, 50), (60, 55), (61, 62), (63, 70), (58, 73), (50, 72), (46, 68),
          (43, 62), (39, 58)], FLESH, BALL),                                                                  # thân
        ([(55, 50), (60, 51), (67, 56), (74, 61), (79, 65), (77, 69), (71, 67), (64, 62), (58, 59)], FLESH),  # tay rót bên phải
        ([(56, 68), (58, 74), (48, 76), (36, 77), (29, 77), (25, 74), (26, 70), (34, 68), (44, 68)], FLESH, BALL),  # đùi trước
        ([(25, 73), (31, 74), (36, 83), (41, 93), (44, 99), (39, 100), (35, 91), (30, 82)], FLESH),         # cẳng chân trước
        ([(37, 98), (44, 97), (48, 100), (48, 103), (38, 103), (36, 101)], FLESH),                          # bàn chân trong nước
        ([(36, 55), (41, 58), (38, 64), (32, 71), (27, 78), (23, 85), (19, 85), (21, 79), (27, 70), (32, 62)], FLESH),  # tay rót bên trái
        (ellipse_pts(31.5, 53.5, 4, 4.5), FLESH, BALL),                                                     # đầu cúi, mặt để trống
        ([(27, 53), (27, 48), (31, 45.5), (36, 46), (40, 49), (43, 53), (44, 58), (41, 60), (38, 56), (34, 51),
          (30, 50), (28, 54)],
         ('Y', 'y', 'A')),                                                                                    # tóc
    ])
    # hai bình đỏ: thân tròn, miệng nghiêng về phía nước đổ
    c.rows(13, 81, [
        '..oooo....',
        '.offrro...',
        'offrrrRo..',
        'ofrrrrRo..',
        'orrrrrRRo.',
        'orrrrRRRo.',
        '.oRRRRRooo',
        '..ooooRRbo',
        '......oIIo',
        '.......oo.',
    ])
    c.rows(74, 64, [
        '....oooo...',
        '...offrro..',
        '..offrrrRo.',
        '.ofrrrrrRo.',
        'oorrrrrrRo.',
        'oRorrrrRRo.',
        'oIoRRRRRo..',
        '.IIoooooo..',
    ])
