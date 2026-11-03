"""Chất liệu vẽ tay: tán lá, vỏ cây, cỏ, nếp vải.

Học từ bộ mẫu trong reference/ (chỉ học cách vẽ, không chép): mỗi chất liệu 3–4 tông,
mảng sáng tối có hình (chùm lá hình giọt, vệt cỏ nằm ngang, sọc vỏ cây dọc), không chấm lẻ.
Mọi hàm nhận Canvas (rws_draw) và tọa độ theo ô tranh.
"""
import math
import random

from rws_draw import region, smooth

LEAF = ('L', 'l', 'g', 'G')       # sáng → tối
BARK = ('j', 'H', 'h')


def foliage(c, clumps, tones=LEAF, ink='o', seed=1):
    """Tán lá từ các chùm rủ (cx, cy, rộng, cao), vẽ sau → trước.

    Mỗi chùm là vài thùy tròn chồng lên nhau, đáy kéo thành mũi rủ. Sáng theo khối: mép
    trên-trái tông sáng, mép dưới-phải tông tối, đáy tối nhất — chùm có thể tích, không phẳng.
    Chùm trước đè chùm sau, chỗ đè có mép tối của chùm trước nên tán có lớp lang."""
    from rws_draw import ellipse_pts
    rnd = random.Random(seed)
    hi, mid, lo, deep = tones
    whole = set()
    for cx, cy, w, h in clumps:
        reg = set()
        lobes = [(cx, cy, w / 2, h * 0.32)]
        for _ in range(3):
            lobes.append((cx + rnd.uniform(-w * 0.3, w * 0.3), cy + rnd.uniform(-h * 0.15, h * 0.1),
                          w * rnd.uniform(0.22, 0.34), h * rnd.uniform(0.2, 0.3)))
        for lx, ly, rx, ry in lobes:
            reg |= region(ellipse_pts(lx, ly, rx, ry, 16))
        # mũi rủ ở đáy
        for k in range(rnd.randint(1, 2)):
            tx = cx + rnd.uniform(-w * 0.25, w * 0.25)
            reg |= region([(tx - 2.2, cy), (tx + 2.2, cy), (tx + 0.3, cy + h * 0.55), (tx - 0.3, cy + h * 0.55)])
        for x, y in reg:
            if (x, y + 1) not in reg:
                col = deep
            elif (x - 1, y - 1) not in reg or (x - 2, y - 2) not in reg and (x, y - 1) not in reg:
                col = hi
            elif (x + 1, y + 1) not in reg or (x + 1, y + 2) not in reg:
                col = lo
            else:
                col = mid
            c.px(x, y, col)
        # mép dưới của chùm trước nằm trên chùm sau: viền tông tối nhất
        for x, y in reg:
            if (x, y + 1) in whole and (x, y + 1) not in reg:
                c.px(x, y, deep)
        whole |= reg
    if ink:
        c.outline(whole, ink)
    return whole


def bark(c, pts, tones=BARK, ink='o', seed=2, knots=()):
    """Thân cây: tông giữa, vệt sáng dọc bên trái, mép phải tối, sọc vỏ dọc ngắn, mắt gỗ."""
    rnd = random.Random(seed)
    hi, mid, lo = tones
    reg = region(smooth(pts, 1))
    rows = {}
    for x, y in reg:
        rows.setdefault(y, []).append(x)
    for y, xs in rows.items():
        x0, x1 = min(xs), max(xs)
        w = x1 - x0 + 1
        for x in xs:
            u = (x - x0) / max(1, w - 1)
            c.px(x, y, hi if 0.12 < u < 0.3 else lo if u > 0.78 else mid)
    ys = sorted(rows)
    for _ in range(len(ys) // 3):
        y = rnd.choice(ys)
        xs = rows[y]
        x = rnd.randint(min(xs) + 1, max(max(xs) - 2, min(xs) + 1))
        for k in range(rnd.randint(3, 7)):
            if (x, y + k) in reg:
                c.px(x, y + k, lo)
    for kx, ky in knots:
        c.rows(kx - 1, ky - 2, ['.h.', 'hHh', 'hoh', 'hHh', '.h.'])
    if ink:
        c.outline(reg, ink)
    return reg


def grass(c, chars, tones=('L', 'l', 'g', 'G'), seed=3, density=1.0, box=None):
    """Cỏ: phủ tông giữa, rồi vệt ngang dài sáng và tối như gió lướt (dài 7–20 px, dày 1–2 px).

    Chỉ vẽ lên pixel đang có màu thuộc `chars`. Vệt sáng dày hơn ở gần mép trên của đồi."""
    rnd = random.Random(seed)
    hi, mid, lo, deep = tones
    x0, y0, x1, y1 = box or (0, 0, c.w - 1, c.h - 1)
    area = [(x, y) for y in range(y0, y1 + 1) for x in range(x0, x1 + 1) if c.get(x, y) in chars]
    if not area:
        return
    aset = set(area)
    for x, y in area:
        c.px(x, y, mid)
    n = int(len(area) / 30 * density)
    for _ in range(n):
        x, y = rnd.choice(area)
        col = rnd.choice((hi, hi, hi, lo, lo, deep))
        ln = rnd.randint(7, 20)
        slope = rnd.choice((0, 0, 0, 1))
        for k in range(ln):
            yy = y - (k // 6 if slope else 0)
            if (x + k, yy) in aset:
                c.px(x + k, yy, col)
            if 1 < k < ln - 2 and rnd.random() < 0.5 and (x + k, yy + 1) in aset:
                c.px(x + k, yy + 1, col)


def fold(c, pts, col, members):
    """Nếp vải: đường gấp khúc qua các điểm, chỉ vẽ lên pixel thuộc `members` (trong mảng vải)."""
    for (xa, ya), (xb, yb) in zip(pts, pts[1:]):
        n = max(abs(xb - xa), abs(yb - ya), 1)
        for k in range(int(n) + 1):
            x, y = round(xa + (xb - xa) * k / n), round(ya + (yb - ya) * k / n)
            if c.get(x, y) in members:
                c.px(x, y, col)


LEAF_CLUSTER = [
    '.44..',
    '4433.',
    '43332',
    '.3221',
    '..11.',
]


def leafy(c, clumps, tones, seed=1, step=4):
    """Tán lá dày như lá mẫu: khối các chùm rủ, lấp bằng hàng trăm cụm lá nhỏ 5×5 (sáng trên-trái,
    tối dưới-phải), cụm phía dưới mỗi chùm tối hơn một bậc; khe giữa các cụm để tông tối.

    tones: 5 ký tự tối → sáng. Viền ngoài bằng tông tối nhất (không đen)."""
    from rws_draw import ellipse_pts
    rnd = random.Random(seed)
    whole = set()
    shapes = []
    for cx, cy, w, h in clumps:
        reg = set()
        lobes = [(cx, cy, w / 2, h * 0.32)]
        for _ in range(3):
            lobes.append((cx + rnd.uniform(-w * 0.3, w * 0.3), cy + rnd.uniform(-h * 0.15, h * 0.1),
                          w * rnd.uniform(0.22, 0.34), h * rnd.uniform(0.2, 0.3)))
        for lx, ly, rx, ry in lobes:
            reg |= region(ellipse_pts(lx, ly, rx, ry, 16))
        for _ in range(rnd.randint(1, 3)):              # mũi rủ ở đáy
            tx = cx + rnd.uniform(-w * 0.3, w * 0.3)
            reg |= region([(tx - 2, cy), (tx + 2, cy), (tx + 0.4, cy + h * 0.6), (tx - 0.4, cy + h * 0.6)])
        shapes.append((reg, cy, h))
        whole |= reg
    for x, y in whole:
        c.px(x, y, tones[1])
    for reg, cy, h in shapes:
        top = min(y for _, y in reg)
        bot = max(y for _, y in reg)
        pts = sorted(reg, key=lambda p: (p[1], p[0]))
        for x, y in pts[::step * 2]:
            jx, jy = x + rnd.randint(-1, 1), y + rnd.randint(-1, 1)
            shade = -1 if (y - top) / max(1, bot - top) > 0.55 else 0
            for j, row in enumerate(LEAF_CLUSTER):
                for i, ch in enumerate(row):
                    q = (jx + i - 2, jy + j - 2)
                    if ch != '.' and q in reg:
                        c.px(*q, tones[max(1, min(4, int(ch) + shade))])
        for x, y in reg:                                  # đáy chùm: viền tối
            if (x, y + 1) not in reg:
                c.px(x, y, tones[0] if (x, y + 1) not in whole else tones[1])
    for x, y in whole:
        for q in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
            if q not in whole:
                c.px(*q, tones[0])
    return whole
