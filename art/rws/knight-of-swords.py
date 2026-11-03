from rws_draw import ellipse_pts, inside, mottle, parts
from rws_symbols import cloud

SCAN = 'Swords12.jpg'
CROP = (51, 150, 1051, 1603)
NUMERAL = ''
SKY = ('b', 2, 3, (2, 3), [], 30)
SYMBOLS = ['hiệp sĩ giáp bạc giơ kiếm cao', 'áo choàng và chùm lông đỏ bay ngược', 'ngựa trắng phi lao sang trái',
           'mây xé ngang trời', 'cây nghiêng trong gió']

# Bản scan quá dày nét để tách mảng tự động: cả lá vẽ bằng khối, tọa độ can theo scan.
HORSE = ('w', 'c', 'x')
STEEL = ('x', 's', 'S')
BALL = {'shade': 'ball'}
RED = ('f', 'r', 'R')
HILL = [(0, 116), (10, 113), (22, 112), (32, 115), (38, 120), (40, 125), (0, 125)]


def tree(c, x, y, lean):
    """Cây nhỏ nghiêng trong gió: thân mảnh, tán dẹt kéo về phía gió thổi."""
    for i in range(16):
        c.px(x + round(i * lean), y - i, 'h')
    tx, ty = x + round(15 * lean), y - 15
    parts(c, [(ellipse_pts(tx + 3, ty, 5, 2.5), ('l', 'g', 'G'), {'shade': 'ball'}),
              (ellipse_pts(tx + 1, ty + 5, 4, 2), ('l', 'g', 'G'), {'shade': 'ball'})], ink=None)


def draw(c):
    for y in range(c.h):
        for x in range(c.w):
            c.px(x, y, 'y' if inside(HILL, x, y) else '~')
    # mây xé ngang, gió thổi từ phải sang
    for puffs in ([(10, 3, 16, 3), (30, 5, 12, 3), (2, 11, 8, 2)],
                  [(55, 12, 14, 3), (74, 17, 14, 4), (46, 17, 8, 2)],
                  [(14, 41, 16, 3), (30, 45, 12, 3), (4, 47, 10, 2)]):
        cloud(c, puffs, ('w', 'c', 'x'))
    # gò đất vàng và cây nghiêng góc dưới trái
    mottle(c, 'y', 'A', None, seed=4, scale=4, amount=0.35)
    for x in range(0, 41):
        for y in range(108, c.h):
            if c.get(x, y) in 'yA':
                c.px(x, y, 'o')
                break
    tree(c, 3, 104, 0.35)
    tree(c, 10, 100, 0.3)

    # ngựa trắng phi sang trái (sau → trước): chân trước gập, thân, cổ, đầu, chân trước duỗi
    parts(c, [
        ([(52, 86), (58, 88), (62, 96), (64, 104), (61, 108), (55, 107), (57, 100), (54, 94)], HORSE),
        ([(40, 52), (52, 50), (66, 52), (86, 54), (86, 96), (70, 97), (56, 92), (44, 86), (36, 80)], HORSE, BALL),
        ([(22, 52), (28, 47), (36, 46), (46, 50), (52, 58), (50, 72), (44, 80), (36, 76), (30, 66), (26, 60)], HORSE, BALL),
        ([(21, 52), (23, 45), (26, 51)], HORSE),
        ([(25, 52), (28, 45), (30, 53)], HORSE),
        ([(3, 62), (5, 59), (12, 56), (19, 53), (24, 51), (28, 54), (30, 60), (27, 66), (20, 68), (12, 68),
          (6, 68), (3, 66)], HORSE, BALL),
        ([(40, 78), (48, 84), (36, 96), (22, 108), (10, 117), (6, 118), (5, 115), (16, 105), (30, 92)], HORSE),
    ])
    # móng sẫm
    c.rows(4, 115, ['.oo.', 'osSo', 'oSSo', '.oo.'])
    c.rows(57, 106, ['.oo.', 'osSo', 'oSSo', '.oo.'])
    # bờm xám phất ngược theo gió dọc mép trên cổ
    for x, y in [(27, 47), (31, 45), (35, 44), (39, 45), (43, 47)]:
        c.rows(x, y - 2, ['..oo', '.oso', 'osxo', 'oxo.'])
    # cương: dây sẫm quanh mõm và đầu, dây cương về tay hiệp sĩ
    c.line(7, 60, 7, 67, 'h')
    c.line(8, 60, 22, 56, 'h')
    c.line(9, 63, 54, 58, 'h')

    # hiệp sĩ (sau → trước): áo choàng, chùm lông, chân, thân giáp, mũ, vai, tay giơ kiếm
    parts(c, [
        ([(58, 28), (70, 26), (86, 30), (86, 66), (78, 62), (70, 56), (62, 46)], RED),
        ([(60, 22), (64, 14), (72, 8), (84, 4), (80, 11), (72, 17), (65, 24)], RED),
        ([(60, 68), (70, 70), (70, 90), (64, 102), (58, 106), (54, 104), (60, 96), (62, 82)], STEEL),
        ([(56, 36), (66, 32), (76, 36), (80, 52), (78, 70), (64, 74), (58, 64), (56, 50)], STEEL, BALL),
        (ellipse_pts(56, 28, 6, 6.5), STEEL, BALL),
        ([(56, 34), (54, 40), (44, 38), (34, 33), (26, 28), (25, 24), (30, 24), (40, 30), (50, 33)], STEEL),
        (ellipse_pts(58, 38, 4.5, 3.5), STEEL, BALL),
        (ellipse_pts(25.5, 25.5, 3, 3), STEEL, BALL),
    ])
    c.line(58, 58, 78, 58, 'y')
    c.line(58, 59, 78, 59, 'A')
    # khe mũ: mặt để trống
    c.rect(51, 27, 54, 32, 'K')
    c.line(51, 27, 51, 32, 'k')

    # kiếm giơ cao: lưỡi thép, chắn vàng, chuôi, quả chặn
    parts(c, [
        ([(15, 0), (19, 0), (22, 19), (18, 19)], ('w', 'x', 's'), {'shade': False, 'sep': 'o', 'sharp': True}),
        ([(13, 18), (27, 18), (27, 21), (13, 21)], ('Y', 'y', 'A'), {'sharp': True}),
        ([(20, 21), (23, 21), (24, 28), (21, 28)], ('j', 'H', 'h'), {'sharp': True}),
        (ellipse_pts(23, 30, 2, 2), ('Y', 'y', 'A')),
    ])
    c.line(16, 1, 19, 17, 'w')
