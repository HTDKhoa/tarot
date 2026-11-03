"""Biểu tượng dùng chung cho cả bộ: sao, đồng xu ngũ giác, cốc, kiếm, gậy.

Vẽ một lần ở đây rồi đóng dấu lên lá, để mười cái cốc của Ten of Cups giống cốc của Ace.
Mọi hàm nhận Canvas (rws_draw) và tọa độ theo ô tranh.
"""
import math


def inside(pts, x, y):
    """Điểm (x, y) nằm trong đa giác (tia chẵn lẻ)."""
    hit = False
    for (x0, y0), (x1, y1) in zip(pts, pts[1:] + pts[:1]):
        if (y0 > y) != (y1 > y) and x < x0 + (y - y0) * (x1 - x0) / (y1 - y0):
            hit = not hit
    return hit


def raster(pts):
    """Tô đa giác lấy mẫu ở tâm pixel, nên hình đối xứng qua tâm pixel cho ra pixel đối xứng."""
    xs, ys = [p[0] for p in pts], [p[1] for p in pts]
    return {(x, y) for y in range(int(min(ys)) - 1, int(max(ys)) + 2)
            for x in range(int(min(xs)) - 1, int(max(xs)) + 2) if inside(pts, x + 0.5, y + 0.5)}


def star(c, cx, cy, R, r, n=8, fill='w', shade='c', outline='o', rot=-90, selout=None):
    """Sao n cánh tâm pixel (cx, cy), bán kính ngoài R, trong r. Nửa dưới-phải đổ tông shade (sáng từ trên-trái).

    selout: viền chỉ ở phía khuất sáng (phải, dưới) bằng màu này, thay cho viền kín."""
    pts = []
    for k in range(2 * n):
        a = math.radians(rot + k * 180 / n)
        rad = R if k % 2 == 0 else r
        pts.append((cx + 0.5 + rad * math.cos(a), cy + 0.5 + rad * math.sin(a)))
    region = raster(pts)
    step = 360 / n
    for x, y in region:
        # mỗi tia chia đôi theo trục: nửa theo chiều kim đồng hồ sáng, nửa kia tối — sao có khối như mài cạnh
        a = (math.degrees(math.atan2(y - cy, x - cx)) - rot) % 360
        off = (a + step / 2) % step - step / 2
        c.px(x, y, fill if off < 0 or (x, y) == (cx, cy) else shade)
    if outline:
        c.outline(region, outline)
    if selout:
        for x, y in region:
            for dx, dy in ((1, 0), (0, 1)):
                if (x + dx, y + dy) not in region:
                    c.px(x + dx, y + dy, selout)
    return region


SMALL_STAR = [
    '.....w.....',
    '.....w.....',
    '.w...w...w.',
    '..w.www.w..',
    '...wwwwc...',
    'wwwwwwccccc',
    '...wwccc...',
    '..w.ccc.c..',
    '.w...c...c.',
    '.....c.....',
    '.....c.....',
]


def small_star(c, cx, cy, fill='w', shade='c'):
    """Sao nhỏ 11×11 vẽ tay, tâm ở (cx, cy)."""
    c.rows(cx - 5, cy - 5, [r.replace('w', '1').replace('c', '2') for r in SMALL_STAR], {'1': fill, '2': shade})


def coin(c, cx, cy, rad, rim='a', face='y', hi='Y', star_col='a', outline='h'):
    """Đồng xu vàng có ngôi sao năm cánh; viền nâu sẫm (không đen), vành tông tối, mặt tông giữa."""
    region = set(c._mask(lambda d: d.ellipse((cx - rad, cy - rad, cx + rad, cy + rad), fill=1)))
    inner = set(c._mask(lambda d: d.ellipse((cx - rad + 2, cy - rad + 2, cx + rad - 2, cy + rad - 2), fill=1)))
    for x, y in region:
        c.px(x, y, rim if (x, y) not in inner else face)
    # vệt sáng cung trên-trái
    for x, y in inner:
        if (x - 1, y - 1) not in inner and (x - cx) + (y - cy) < -rad * 0.6:
            c.px(x, y, hi)
    pts = []
    for k in range(5):
        a = math.radians(-90 + k * 144)
        pts.append((cx + (rad - 3.2) * math.cos(a), cy + (rad - 3.2) * math.sin(a)))
    for k in range(5):
        (x0, y0), (x1, y1) = pts[k], pts[(k + 1) % 5]
        c.line(round(x0), round(y0), round(x1), round(y1), star_col)
    if outline:
        c.outline(region, outline)
    return region


CUP_BOWL = [
    'ooooooooooooo',
    'oaaaaaaaaaaao',
    'oYyyyyyyyyAao',
    'oYYyyyyyyyAao',
    'oYYyyyyyyAAao',
    '.oYyyyyyyAao.',
    '.oYYyyyyAAao.',
    '..oYyyyyAao..',
    '...oYyyAao...',
    '....oYAao....',
]
CUP_KNOT = [
    '...oYyyAao...',
    '...oaAAaao...',
]
CUP_STEM = '....oyAao....'
CUP_FOOT = [
    '....oYAao....',
    '...oYyyAao...',
    '..oYyyyyAao..',
    '.oYyyyyyyAao.',
    'oaaaaaaaaaaao',
    'ooooooooooooo',
]


def cup(c, x, y, h=29):
    """Cốc vàng chân cao 13 px, góc trên-trái (x, y), cao h: lòng cốc tròn 4 tông, vệt sáng
    dọc bên trái, nút thân, chân loe. Mọi lá chất Cups dùng đúng hình này."""
    stem = h - len(CUP_BOWL) - len(CUP_KNOT) - len(CUP_FOOT)
    top = (stem + 1) // 3
    rows = CUP_BOWL + [CUP_STEM] * top + CUP_KNOT + [CUP_STEM] * (stem - top) + CUP_FOOT
    # vàng đậm: thân tông giữa-tối của dải vàng, lòng cốc nâu sẫm, chỉ vệt sáng là vàng nhạt
    c.rows(x, y, [r.replace('a', '3').replace('A', '2').replace('y', '1') for r in rows],
           {'1': 'A', '2': 'O', '3': 'h'})


def cloud(c, puffs, tone=('w', 'c', 's')):
    """Đám mây một khối: hợp các cụm tròn (cx, cy, rx, ry), không viền.

    Sáng 2 px dọc mép trên cả khối, tối 2 px dọc mép dưới, nếp tối ở chỗ cụm này đè lên
    cụm kia — nên mây đọc thành một khối bông chứ không phải chồng bóng tròn."""
    from rws_draw import ellipse_pts, region
    hi, mid, lo = tone
    regs = [region(ellipse_pts(cx, cy, rx, ry)) for cx, cy, rx, ry in puffs]
    whole = set().union(*regs)
    for x, y in whole:
        c.px(x, y, mid)
    for reg in regs:
        # nếp: mép dưới của cụm phía trước nằm trên cụm phía sau
        for x, y in reg:
            if (x, y + 1) not in reg and (x, y + 1) in whole:
                c.px(x, y, lo)
    for x, y in whole:
        if (x, y - 1) not in whole or (x, y - 2) not in whole:
            c.px(x, y, hi)
        if (x, y + 1) not in whole or (x, y + 2) not in whole:
            c.px(x, y, lo)
    return whole


def goblet(c, x, y, w, h, tones=('Y', 'y', 'A', 'a'), ink='o'):
    """Cốc chân cao cỡ tùy ý, góc trên-trái (x, y): lòng cốc tròn, nút thân, chân loe.

    Tô theo cột trong từng hàng: vệt sáng bên trái, thân, bóng bên phải, mép phải tối nhất;
    hàng miệng cốc tối để thấy lòng cốc."""
    import math
    hi, mid, lo, deep = tones
    cx = x + (w - 1) / 2
    bowl = round(h * 0.42)
    foot = round(h * 0.2)
    stem_r = max(1.0, w * 0.1)
    knot = y + bowl + round((h - bowl - foot) * 0.3)
    pts = set()
    for yy in range(y, y + h):
        t = yy - y
        if t < bowl:
            r = (w / 2) * math.sqrt(max(0.0, 1 - (t / bowl) ** 2.2))
            r = max(r, stem_r)
        elif yy in (knot, knot + 1):
            r = stem_r + 1.5
        elif t >= h - foot:
            r = stem_r + (w / 2 - stem_r) * ((t - (h - foot) + 1) / foot) ** 0.8
        else:
            r = stem_r
        x0, x1 = round(cx - r), round(cx + r)
        for xx in range(x0, x1 + 1):
            pts.add((xx, yy))
        span = max(1, x1 - x0)
        for xx in range(x0, x1 + 1):
            u = (xx - x0) / span
            col = hi if u < 0.28 else mid if u < 0.62 else lo if u < 0.86 else deep
            if t == 1:
                col = deep
            c.px(xx, yy, col)
    if ink:
        c.outline(pts, ink)
    return pts
