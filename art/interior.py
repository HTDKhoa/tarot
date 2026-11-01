"""Interior scene: room (opaque), table, candle, flames, crystal ball."""
import math
from common import *

W, H = 640, 360
TABLE_Y = 250          # table.png top edge in the 640x360 frame
CANDLE_POS = (478, 254)
CRYSTAL_POS = (142, 266)
WICK = (10, 5)         # wick top inside candle.png
FLAME_BASE = (5, 15)   # bottom centre of the flame inside flame_N.png


# ------------------------------------------------------------------ room
def room():
    img = new(W, H, 'w1')
    glow = new(W, H)
    d = draw(img)
    r = rng(31)
    # vertical wall planks
    x = 0
    while x < W:
        pw = r.randint(20, 28)
        d.rectangle([x, 0, x + pw - 1, 300], fill=c('w1'))
        d.line([(x, 0), (x, 300)], fill=c('w0'))
        d.line([(x + pw - 2, 0), (x + pw - 2, 300)], fill=c('w2'))
        for _ in range(7):
            gx = r.randint(x + 3, x + pw - 4)
            gy = r.randint(0, 290)
            d.line([(gx, gy), (gx, gy + r.randint(6, 26))], fill=c('w0' if r.random() < .6 else 'w2'))
        if r.random() < .5:
            kx, ky = r.randint(x + 5, x + pw - 8), r.randint(40, 270)
            d.ellipse([kx, ky, kx + 4, ky + 6], fill=c('w0'))
            put(img, kx + 2, ky + 3, 'w2')
        for ny in (30, 286):
            put(img, x + pw // 2, ny, 's1')
            put(img, x + pw // 2, ny - 1, 's2')
        x += pw
    # ceiling beam
    d.rectangle([0, 0, W, 22], fill=c('w2'))
    d.line([(0, 2), (W, 2)], fill=c('w3'))
    d.line([(0, 21), (W, 21)], fill=c('w1'))
    d.line([(0, 22), (W, 22)], fill=c('w0'))
    d.line([(0, 23), (W, 23)], fill=c('w0'))
    for _ in range(40):
        gx, gy = r.randint(0, W), r.randint(4, 18)
        d.line([(gx, gy), (gx + r.randint(6, 30), gy)], fill=c('w1'))
    # baseboard + floor
    d.rectangle([0, 296, W, 301], fill=c('w0'))
    d.line([(0, 296), (W, 296)], fill=c('w2'))
    for i, y in enumerate(range(302, H, 9)):
        d.rectangle([0, y, W, y + 8], fill=c('w1'))
        d.line([(0, y), (W, y)], fill=c('w0'))
        d.line([(0, y + 1), (W, y + 1)], fill=c('w2'))
        for k in range(0, W, 70):
            sx = k + (i * 31) % 70
            d.line([(sx, y), (sx, y + 8)], fill=c('w0'))

    # ---- window (left)
    wx0, wy0, wx1, wy1 = 40, 58, 176, 204
    d.rectangle([wx0 - 8, wy0 - 8, wx1 + 8, wy1 + 8], fill=c('w0'))
    d.rectangle([wx0 - 6, wy0 - 6, wx1 + 6, wy1 + 6], fill=c('w2'))
    d.line([(wx0 - 6, wy0 - 6), (wx1 + 6, wy0 - 6)], fill=c('w3'))
    d.line([(wx1 + 6, wy0 - 6), (wx1 + 6, wy1 + 6)], fill=c('w3'))
    d.rectangle([wx0 - 1, wy0 - 1, wx1 + 1, wy1 + 1], fill=c('w0'))
    for y in range(wy0, wy1 + 1):
        t = (y - wy0) / (wy1 - wy0)
        for x in range(wx0, wx1 + 1):
            if t < .45:
                col = 'n1' if bayer(x, y, max(0, (t - .25) / .2)) else 'n0'
            elif t < .8:
                col = 'n2' if bayer(x, y, max(0, (t - .6) / .2)) else 'n1'
            else:
                col = 'v1' if bayer(x, y, (t - .8) / .2 + .2) else 'n2'
            put(img, x, y, col)
    # distant treeline in window
    for x in range(wx0, wx1 + 1):
        h = 8 + int(6 * abs(math.sin(x / 7.0)) + 4 * math.sin(x / 19))
        for y in range(wy1 - h, wy1 + 1):
            put(img, x, y, 'g0')
    for _ in range(40):
        sx, sy = r.randint(wx0, wx1), r.randint(wy0, wy1 - 30)
        put(img, sx, sy, r.choice(['star', 's2', 'n4']))
    # moon
    mx, my = 142, 92
    for y in range(my - 16, my + 17):
        for x in range(mx - 16, mx + 17):
            d1 = (x - mx) ** 2 + (y - my) ** 2
            d2 = (x - mx + 8) ** 2 + (y - my + 5) ** 2
            if d1 <= 14 ** 2 and d2 > 12 ** 2:
                col = 'cr' if d2 <= 13.5 ** 2 else 'moon'
                put(img, x, y, col)
                put(glow, x, y, col)
    for (sx, sy) in [(66, 76), (118, 148), (88, 120)]:
        for dx, dy in [(0, 0), (1, 0), (-1, 0), (0, 1), (0, -1)]:
            col = 'moon' if (dx, dy) == (0, 0) else 'star'
            put(img, sx + dx, sy + dy, col)
            put(glow, sx + dx, sy + dy, col)
    # mullions
    mxc, myc = (wx0 + wx1) // 2, (wy0 + wy1) // 2
    d.rectangle([mxc - 2, wy0, mxc + 2, wy1], fill=c('w2'))
    d.line([(mxc + 2, wy0), (mxc + 2, wy1)], fill=c('w1'))
    d.rectangle([wx0, myc - 2, wx1, myc + 2], fill=c('w2'))
    d.line([(wx0, myc + 2), (wx1, myc + 2)], fill=c('w1'))
    d.line([(wx0, myc - 2), (wx1, myc - 2)], fill=c('w3'))
    # sill
    d.rectangle([wx0 - 14, wy1 + 8, wx1 + 14, wy1 + 14], fill=c('w3'))
    d.line([(wx0 - 14, wy1 + 14), (wx1 + 14, wy1 + 14)], fill=c('w1'))
    d.line([(wx0 - 14, wy1 + 15), (wx1 + 14, wy1 + 15)], fill=c('w0'))
    # plant pot on the sill
    d.polygon([(150, wy1 - 2), (164, wy1 - 2), (162, wy1 + 7), (152, wy1 + 7)], fill=c('w2'))
    d.line([(150, wy1 - 2), (164, wy1 - 2)], fill=c('w3'))
    for k, (lx, ly) in enumerate([(152, wy1 - 8), (157, wy1 - 12), (162, wy1 - 9), (155, wy1 - 5), (160, wy1 - 5)]):
        d.ellipse([lx - 2, ly - 3, lx + 2, ly + 3], fill=c('g3' if k % 2 else 'g2'))
    # small books on sill
    d.rectangle([34, wy1 + 2, 52, wy1 + 7], fill=c('n3'))
    d.line([(34, wy1 + 2), (52, wy1 + 2)], fill=c('au0'))
    d.rectangle([36, wy1 - 2, 50, wy1 + 1], fill=c('p1'))
    # curtain (plum) tied on the left
    d.rectangle([20, 34, 186, 38], fill=c('w0'))
    put(img, 20, 36, 'au0')
    put(img, 186, 36, 'au0')
    cur = [(22, 39), (52, 39), (48, 90), (38, 132), (44, 210), (24, 214), (20, 140)]
    d.polygon(cur, fill=c('p1'))
    for k, fx in enumerate([28, 34, 40, 46]):
        d.line([(fx, 40), (fx - 6 + k, 130), (fx - 10, 210)], fill=c('p0' if k % 2 else 'p2'))
    d.rectangle([24, 128, 44, 133], fill=c('au0'))
    d.line([(24, 128), (44, 128)], fill=c('au1'))
    # right curtain stub
    d.polygon([(166, 39), (186, 39), (190, 214), (176, 214), (178, 120)], fill=c('p1'))
    for fx in (172, 180):
        d.line([(fx, 40), (fx + 2, 130), (fx + 4, 212)], fill=c('p0'))
    d.line([(184, 40), (188, 212)], fill=c('p2'))

    # ---- shelves (right)
    sx0, sx1 = 452, 628
    for sy in (98, 168, 238):
        d.rectangle([sx0, sy, sx1, sy + 5], fill=c('w2'))
        d.line([(sx0, sy), (sx1, sy)], fill=c('w3'))
        d.line([(sx0, sy + 5), (sx1, sy + 5)], fill=c('w0'))
        d.line([(sx0, sy + 6), (sx1, sy + 6)], fill=c('w0'))
        for bx in (sx0 + 10, sx1 - 14):
            d.polygon([(bx, sy + 6), (bx + 5, sy + 6), (bx + 5, sy + 18)], fill=c('w1'))
            d.line([(bx, sy + 6), (bx + 5, sy + 18)], fill=c('w0'))
    # top shelf: jars
    jars = [(458, 70, 16, 't0'), (478, 78, 12, 'g3'), (494, 64, 18, 'p2'), (516, 74, 14, 'au0'), (534, 80, 10, 'n4'),
            (548, 62, 20, 'g2'), (572, 72, 14, 't0'), (590, 80, 10, 'p1'), (604, 68, 18, 'v2')]
    for (jx, jy, jw, col) in jars:
        jb = 97
        d.rectangle([jx, jy + 4, jx + jw - 1, jb], fill=c('s1'))
        d.rectangle([jx + 1, jy + 4 + (jb - jy) // 3, jx + jw - 2, jb - 1], fill=c(col))
        d.rectangle([jx + 2, jy, jx + jw - 3, jy + 3], fill=c('w3'))
        d.line([(jx + 2, jy + 3), (jx + jw - 3, jy + 3)], fill=c('w1'))
        d.line([(jx + jw - 3, jy + 6), (jx + jw - 3, jy + 10)], fill=c('h2'))
        put(img, jx + jw - 4, jy + 6, 'h2')
        d.line([(jx, jy + 4), (jx, jb)], fill=c('out'))
        d.line([(jx + jw - 1, jy + 4), (jx + jw - 1, jb)], fill=c('out'))
        d.line([(jx, jy + 4), (jx + jw - 1, jy + 4)], fill=c('out'))
        d.rectangle([jx + 1, jy - 1, jx + jw - 2, jy - 1], fill=c('out'))
    # middle shelf: books
    bx = 458
    book_cols = ['n3', 'p1', 'g2', 'w2', 'n2', 'p2', 'au0', 'n3', 'g3', 'p1', 'w1', 'n4', 'p2', 'g2']
    i = 0
    while bx < 590:
        bw, bh = r.randint(5, 9), r.randint(22, 34)
        col = book_cols[i % len(book_cols)]
        top = 167 - bh
        d.rectangle([bx, top, bx + bw - 1, 167], fill=c(col))
        d.line([(bx, top), (bx, 167)], fill=c('out'))
        d.line([(bx + bw - 1, top), (bx + bw - 1, 167)], fill=c('out'))
        d.line([(bx, top), (bx + bw - 1, top)], fill=c('out'))
        d.line([(bx + 1, top + 4), (bx + bw - 2, top + 4)], fill=c('au1'))
        d.line([(bx + 1, 163), (bx + bw - 2, 163)], fill=c('au1'))
        put(img, bx + bw // 2, top + 10, 'au1')
        bx += bw
        i += 1
    # leaning book + lying stack
    d.polygon([(592, 167), (598, 167), (614, 138), (608, 135)], fill=c('p1'))
    d.line([(592, 167), (608, 135)], fill=c('out'))
    d.line([(598, 167), (614, 138)], fill=c('out'))
    for k, col in enumerate(['n3', 'g2', 'w2']):
        y = 162 - k * 5
        d.rectangle([600 + k, y, 626 - k, y + 4], fill=c(col))
        d.rectangle([600 + k, y, 626 - k, y + 4], outline=c('out'))
        d.line([(602 + k, y + 2), (624 - k, y + 2)], fill=c('cr'))
    # bottom shelf: crystal cluster, mortar, scrolls, bottle
    d.polygon([(462, 237), (466, 222), (470, 237)], fill=c('t0'))
    d.polygon([(468, 237), (473, 216), (478, 237)], fill=c('t1'))
    d.polygon([(476, 237), (480, 226), (484, 237)], fill=c('t0'))
    d.line([(473, 218), (473, 236)], fill=c('h2'))
    d.ellipse([496, 224, 520, 238], fill=c('s1'))
    d.rectangle([496, 224, 520, 230], fill=c('s1'))
    d.line([(496, 224), (520, 224)], fill=c('s2'))
    d.line([(512, 224), (522, 210)], fill=c('w3'))
    d.line([(513, 224), (523, 211)], fill=c('w2'))
    for k in range(3):
        y = 232 - k * 5
        d.rectangle([534 + k * 3, y, 560 + k * 3, y + 4], fill=c('cr'))
        d.ellipse([532 + k * 3, y, 537 + k * 3, y + 4], fill=c('o2'))
        d.line([(546 + k * 3, y), (546 + k * 3, y + 4)], fill=c('lip'))
    d.rectangle([580, 214, 592, 237], fill=c('g2'))
    d.rectangle([583, 206, 589, 213], fill=c('g2'))
    d.rectangle([584, 202, 588, 205], fill=c('w3'))
    d.line([(590, 216), (590, 230)], fill=c('h2'))
    d.rectangle([600, 226, 620, 237], fill=c('o2'))   # a little skull-shaped... box
    d.line([(600, 226), (620, 226)], fill=c('o3'))
    put(img, 606, 231, 'out')
    put(img, 614, 231, 'out')
    for obj in [(580, 202, 592, 237), (600, 226, 620, 237), (496, 210, 523, 238), (462, 216, 484, 237), (532, 222, 563, 236)]:
        pass
    # hanging dried herbs from the beam
    for k, hx in enumerate([462, 488, 520, 552, 584, 612, 214, 196]):
        L = 16 + (k * 7) % 18
        d.line([(hx, 23), (hx, 23 + L)], fill=c('w3'))
        col_a, col_b = [('g3', 'g2'), ('p2', 'p1'), ('g4', 'g3'), ('au0', 'w3')][k % 4]
        for j in range(16):
            yy = 23 + L + j
            hw = max(0, 4 - abs(j - 5) // 2) if j < 13 else 0
            for xx in range(hx - hw, hx + hw + 1):
                put(img, xx, yy, col_a if (xx + yy) % 3 else col_b)
        d.line([(hx - 2, 23 + L), (hx + 2, 23 + L)], fill=c('lip'))
    img = img.convert('RGBA')
    return img, glow


# ------------------------------------------------------------------ table
def table():
    Wt, Ht = 640, 110
    img = new(Wt, Ht)
    px = img.load()
    front = 50
    for y in range(0, front + 1):
        t = y / front
        x0 = int(28 * (1 - t)) - 0
        x1 = Wt - 1 - x0
        for x in range(max(0, x0), min(Wt, x1 + 1)):
            col = 'p1' if y > 6 else 'p0'
            if bayer(x, y, max(0, (t - .55)) * 1.2):
                col = 'p2'
            px[x, y] = c(col)
    d = draw(img)
    # gold border embroidered onto the top surface
    for y in range(4, front - 3):
        t = y / front
        x0 = int(28 * (1 - t)) + 6
        for x in (x0, Wt - 1 - x0):
            put(img, x, y, 'au1')
    d.line([(31, 4), (Wt - 32, 4)], fill=c('au1'))
    d.line([(6, front - 4), (Wt - 7, front - 4)], fill=c('au1'))
    d.line([(4, front - 2), (Wt - 5, front - 2)], fill=c('au0'))
    # embroidered stars + a reading circle on the top
    r = rng(41)
    for _ in range(70):
        x, y = r.randint(40, Wt - 40), r.randint(8, front - 7)
        if abs(x - 320) < 90:
            continue
        put(img, x, y, 'au0')
        if r.random() < .3:
            for dx, dy in [(1, 0), (-1, 0), (0, 1), (0, -1)]:
                put(img, x + dx, y + dy, 'au0')
            put(img, x, y, 'au1')
    for a in range(0, 360, 4):
        x = 320 + 80 * math.cos(math.radians(a))
        y = 26 + 17 * math.sin(math.radians(a))
        put(img, round(x), round(y), 'au0')
    # front edge + drape
    d.line([(0, front), (Wt, front)], fill=c('au2'))
    d.rectangle([0, front + 1, Wt, Ht - 1], fill=c('p0'))
    for x in range(0, Wt, 16):
        d.line([(x + 4, front + 5), (x + 2, Ht - 6)], fill=c('out'))
        d.line([(x + 10, front + 5), (x + 11, Ht - 6)], fill=c('p1'))
        d.line([(x + 11, front + 8), (x + 12, Ht - 8)], fill=c('p1'))
    d.rectangle([0, front + 2, Wt, front + 5], fill=c('au0'))
    d.line([(0, front + 3), (Wt, front + 3)], fill=c('au1'))
    for x in range(2, Wt, 6):
        put(img, x, front + 3, 'au2')
    # scalloped hem with gold beads
    for x in range(0, Wt, 12):
        for k in range(12):
            yy = Ht - 6 + int(3 * math.sin(math.pi * k / 12))
            for y in range(yy, Ht):
                put(img, x + k, y, (0, 0, 0, 0))
            put(img, x + k, yy - 1, 'au0')
        put(img, x, Ht - 6, 'au1')
        put(img, x, Ht - 5, 'au2')
        put(img, x, Ht - 4, 'au1')
    # crescent-moon embroidery on the drape, centred
    for (cx, cy) in [(320, front + 30)]:
        for y in range(cy - 10, cy + 11):
            for x in range(cx - 10, cx + 11):
                d1 = (x - cx) ** 2 + (y - cy) ** 2
                d2 = (x - cx + 4) ** 2 + (y - cy + 3) ** 2
                if d1 <= 8 ** 2 and d2 > 7 ** 2:
                    put(img, x, y, 'au1')
        for (sx, sy) in [(300, front + 22), (340, front + 22), (290, front + 34), (350, front + 34)]:
            put(img, sx, sy, 'au1')
            for dx, dy in [(1, 0), (-1, 0), (0, 1), (0, -1)]:
                put(img, sx + dx, sy + dy, 'au0')
    img = outline(img)
    return img


# ------------------------------------------------------------------ candle + flames
def candle():
    img = new(20, 40)
    d = draw(img)
    # brass holder: dish, socket, ring handle
    d.ellipse([16, 28, 19, 34], fill=c('au0'))
    d.ellipse([17, 30, 18, 32], fill=(0, 0, 0, 0))
    d.ellipse([1, 31, 18, 38], fill=c('au0'))
    d.ellipse([2, 31, 17, 35], fill=c('au1'))
    d.line([(4, 32), (15, 32)], fill=c('au0'))
    d.line([(11, 33), (15, 33)], fill=c('au2'))
    d.rectangle([6, 27, 13, 32], fill=c('au1'))
    d.line([(6, 27), (6, 32)], fill=c('au0'))
    d.line([(12, 27), (12, 31)], fill=c('au2'))
    d.line([(6, 27), (13, 27)], fill=c('au2'))
    # wax
    d.rectangle([7, 7, 12, 26], fill=c('cr'))
    d.line([(7, 7), (7, 26)], fill=c('o2'))
    d.line([(11, 8), (11, 25)], fill=c('moon'))
    d.line([(7, 7), (12, 7)], fill=c('moon'))
    d.line([(8, 6), (11, 6)], fill=c('moon'))
    # drips
    for p in [(7, 8), (7, 9), (7, 10), (6, 9), (12, 8), (12, 9), (12, 10), (12, 11), (13, 10)]:
        put(img, *p, 'cr')
    # wick
    put(img, 10, 5, 'out')
    put(img, 10, 4, 'out')
    put(img, 9, 6, 'o2')
    img = outline(img)
    return img


def flames():
    frames = []
    shapes = [  # (tip_dx, height, belly_dx, width)
        (0, 13, 0, 3.4), (1, 14, 0, 3.2), (0, 12, 1, 3.6), (-1, 14, 0, 3.3)]
    for i, (tip, hgt, belly, wid) in enumerate(shapes):
        img = new(10, 16)
        base_y = 15
        cx = 5
        for y in range(base_y - hgt, base_y + 1):
            t = (y - (base_y - hgt)) / hgt          # 0 tip .. 1 base
            if t < .72:
                hw = wid * (t / .72) ** 0.8
            else:
                hw = wid * (1 - ((t - .72) / .28) ** 2 * .45)
            off = tip * (1 - t) ** 1.5 * 2.2 + belly * math.sin(math.pi * t) * .8
            for x in range(10):
                dx = x - (cx - .5 + off)
                if abs(dx) <= hw + .25:
                    rel = abs(dx) / max(.6, hw)
                    if t > .88 and rel < .6:
                        col = 'star'
                    elif rel < .42 and t > .4:
                        col = 'f2'
                    elif rel < .75 and t > .2:
                        col = 'f1'
                    else:
                        col = 'f0'
                    put(img, x, y, col)
        frames.append(img)
    return frames


# ------------------------------------------------------------------ crystal ball
def crystal():
    img = new(28, 28)
    d = draw(img)
    cx, cy, rr = 14, 11, 10
    for y in range(28):
        for x in range(28):
            dd = math.hypot(x - cx + .5, y - cy + .5)
            if dd <= rr:
                t = (y - (cy - rr)) / (2 * rr)
                col = 'v1' if not bayer(x, y, t * .9) else 'n3'
                if x - cx > 3 and dd > rr - 3:
                    col = 'v2'
                put(img, x, y, col)
    swirl = []
    for k in range(26):
        a = k * .42
        rad = 1.5 + k * .22
        swirl.append((round(cx - .5 + rad * math.cos(a)), round(cy - .5 + rad * math.sin(a) * .8)))
    for p in swirl:
        put(img, *p, 't1')
    put(img, cx - 1, cy - 1, 'f2')
    put(img, cx, cy - 1, 't1')
    for p in [(18, 4), (19, 5), (20, 6), (19, 4)]:
        put(img, *p, 'h2')
    put(img, 17, 5, 'star')
    # stand
    d.polygon([(7, 20), (20, 20), (23, 26), (4, 26)], fill=c('w2'))
    d.line([(7, 20), (20, 20)], fill=c('au1'))
    d.line([(5, 24), (22, 24)], fill=c('au0'))
    d.line([(4, 26), (23, 26)], fill=c('w1'))
    for x in range(15, 21):
        put(img, x, 21, 'w3')
    img = outline(img)
    glow = glow_from(img, ['t1', 'f2'])
    return img, glow


def build():
    rm, rg = room()
    save(rm, 'interior/room.png', opaque=True)
    save(rg, 'interior/room_glow.png')
    save(table(), 'interior/table.png')
    save(candle(), 'interior/candle.png')
    for i, f in enumerate(flames()):
        save(f, f'interior/flame_{i}.png')
    cr, cg = crystal()
    save(cr, 'interior/crystal.png')
    save(cg, 'interior/crystal_glow.png')


if __name__ == '__main__':
    build()
    print('interior ok')
