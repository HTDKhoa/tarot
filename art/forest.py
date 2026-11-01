"""Forest cover scene layers (640x360): sky, far, mid, near, ground, house."""
import math
from common import *

W, H = 640, 360
HOUSE_POS = (240, 118)       # where house.png sits in the 640x360 frame
MOON_C = (556, 62)


# ------------------------------------------------------------------ sky
def sky():
    img = new(W, H, 'n0')
    glow = new(W, H)
    stops = [(0, 'n0'), (90, 'n1'), (170, 'n2'), (245, 'v1'), (315, 'v2')]
    for y in range(H):
        seg = None
        for i in range(len(stops) - 1):
            if stops[i][0] <= y < stops[i + 1][0]:
                seg = (stops[i], stops[i + 1])
        for x in range(W):
            if seg is None:
                col = stops[-1][1]
            else:
                (y0, a), (y1, b) = seg
                f = (y - y0) / (y1 - y0)
                g = max(0.0, (f - 0.55) / 0.45)
                col = b if bayer(x, y, g) else a
            img.putpixel((x, y), c(col))
    r = rng(3)
    # thin cloud streaks, one step lighter than the sky they sit on
    for _ in range(9):
        cx, cy, L = r.randint(0, W), r.randint(110, 240), r.randint(50, 150)
        lighter = {'n0': 'n1', 'n1': 'n2', 'n2': 'v1', 'v1': 'v2', 'v2': 'v2'}
        for k, (dy, frac) in enumerate([(0, .55), (1, 1.0), (2, .7)]):
            l = int(L * frac)
            x0 = cx - l // 2 + (k - 1) * 6
            for x in range(x0, x0 + l):
                if 0 <= x < W and (x + k) % 9:
                    base = img.getpixel((x, cy + dy))[:3]
                    name = [k2 for k2, v in PAL.items() if v == base][0]
                    put(img, x, cy + dy, lighter.get(name, name))
    # moon (waxing crescent, lit on the lower right)
    mx, my = MOON_C
    for y in range(my - 24, my + 25):
        for x in range(mx - 24, mx + 25):
            d1 = (x - mx) ** 2 + (y - my) ** 2
            d2 = (x - mx + 10) ** 2 + (y - my + 6) ** 2
            if d1 <= 22 ** 2 and d2 > 19 ** 2:
                col = 'moon'
                if d2 <= 21 ** 2:
                    col = 'cr'
                put(img, x, y, col)
                put(glow, x, y, col)
    for p in [(565, 74), (566, 74), (565, 75), (571, 60), (572, 61), (560, 79), (574, 52)]:
        put(img, *p, 'cr')
        put(glow, *p, 'cr')
    # stars
    for _ in range(320):
        x, y = r.randint(0, W - 1), int(abs(r.gauss(0, 120)))
        if y >= 290 or math.hypot(x - mx, y - my) < 34:
            continue
        col = r.choices(['star', 's2', 'moon', 'n4'], [3, 4, 1, 3])[0]
        put(img, x, y, col)
    bright = [(48, 30), (130, 88), (214, 22), (300, 64), (388, 26), (452, 108), (610, 140), (82, 160), (258, 140), (500, 18)]
    for (x, y) in bright:
        for dx, dy in [(0, 0), (1, 0), (-1, 0), (0, 1), (0, -1)]:
            col = 'moon' if (dx, dy) == (0, 0) else 'star'
            put(img, x + dx, y + dy, col)
            put(glow, x + dx, y + dy, col)
    return img, glow


# ------------------------------------------------------------------ far
def far():
    img = new(W, H)
    # mountain range
    def ridge(x):
        return int(206 - 30 * math.sin(x / 95 + 1.2) - 16 * math.sin(x / 41 + .3) - 6 * math.sin(x / 15) - 4 * math.sin(x / 7.3))
    r = rng(5)
    for x in range(W):
        top = ridge(x)
        slope = ridge(x + 1) - ridge(x - 1)
        for y in range(top, H):
            col = 'v1'
            if slope > 0 and y - top < 3:
                col = 'v2'
            put(img, x, y, col)
        put(img, x, top, 'v2' if slope >= 0 else 'v1')
        if slope > 1 and r.random() < .5:   # lit streaks on right-facing slopes
            L = r.randint(3, 10)
            for k in range(L):
                put(img, x, top + 3 + k, 'v2')
    # distant pine line
    def base(x):
        return int(250 + 5 * math.sin(x / 47) + 3 * math.sin(x / 19))
    for x in range(W):
        for y in range(base(x), H):
            put(img, x, y, 'n2')
    x = -4
    while x < W + 4:
        h = r.randint(9, 22)
        b = base(x)
        for k in range(h):
            hw = int(k * 0.32 * (0.6 + 0.4 * ((k % 5) / 4)))
            for xx in range(x - hw, x + hw + 1):
                put(img, xx, b - h + k, 'n2')
        put(img, x, b - h - 1, 'n2')
        x += r.randint(4, 8)
    return img


# ------------------------------------------------------------------ pines
def pine(img, cx, base, h, hw, cols, seed):
    dark, mid, light = cols
    r = rng(seed)
    top = base - h
    tiers = max(4, h // 20)
    for y in range(top, base - 5):
        t = (y - top) / (h - 5)
        tp = (t * tiers) % 1
        w = int(round(hw * (0.12 + 0.88 * t) * (0.5 + 0.5 * tp)))
        jag = r.randint(-1, 1) if tp > .7 else 0
        for x in range(cx - w - jag, cx + w + 1 + jag):
            rel = (x - cx) / (w + 0.5)
            col = mid
            if rel < -0.3 or tp < .15:
                col = dark
            elif rel > 0.45 and tp > .55:
                col = light
            put(img, x, y, col)
    put(img, cx, top - 1, mid)
    put(img, cx, top - 2, dark)
    for y in range(base - 6, base + 30):
        for x in range(cx - 2, cx + 3):
            put(img, x, y, 'w0')


def mid():
    img = new(W, H)
    r = rng(8)
    for y in range(282, H):
        for x in range(W):
            put(img, x, y, 'g0')
    trees = []
    x = -20
    while x < 228:
        trees.append(x)
        x += r.randint(18, 34)
    x = 652
    while x > 412:
        trees.append(x)
        x -= r.randint(18, 34)
    trees.sort(key=lambda t: r.random())
    for i, tx in enumerate(trees):
        near_gap = min(abs(tx - 228), abs(tx - 412)) < 30
        h = r.randint(90, 130) if near_gap else r.randint(120, 200)
        base = r.randint(284, 300)
        pine(img, tx, base, h, int(h * .27), ('g0', 'g1', 'g2'), 100 + i)
    # low shrubs at the clearing edges
    for (bx, by, rr) in [(218, 282, 12), (234, 288, 9), (420, 284, 11), (406, 290, 8)]:
        d = draw(img)
        d.ellipse([bx - rr, by - rr, bx + rr, by + rr], fill=c('g1'))
        d.ellipse([bx - rr + 3, by - rr + 1, bx + rr - 2, by + rr - 4], fill=c('g2'))
        d.ellipse([bx - rr + 1, by - rr + 4, bx + rr - 4, by + rr], fill=c('g1'))
    return img


# ------------------------------------------------------------------ near
def blob(img, cx, cy, rr, seed, fill='g0', rim='g1', shade='out'):
    r = rng(seed)
    for y in range(cy - rr - 2, cy + rr + 3):
        for x in range(cx - rr - 2, cx + rr + 3):
            ang = math.atan2(y - cy, x - cx)
            edge = rr + 2.2 * math.sin(ang * 7 + seed) + 1.2 * math.sin(ang * 13 + seed * 2)
            dd = math.hypot(x - cx, y - cy)
            if dd <= edge:
                col = fill
                if dd > edge - 2 and -2.2 < ang < -0.2 and r.random() < .7:
                    col = rim
                elif y > cy + rr * .35 and r.random() < .55:
                    col = shade
                put(img, x, y, col)


def near():
    img = new(W, H)
    glow = new(W, H)
    d = draw(img)
    r = rng(12)
    # left big trunk
    d.polygon([(0, 0), (30, 0), (34, 120), (40, 300), (52, 360), (0, 360)], fill=c('out'))
    for k in range(14):
        x = r.randint(2, 30)
        y = r.randint(0, 340)
        d.line([(x, y), (x + r.choice([0, 1]), y + r.randint(8, 30))], fill=c('w0'))
    for y in range(0, 360, 2):  # rim light on right edge of trunk
        xe = 30 + (4 * y / 120 if y < 120 else 4 + 6 * (y - 120) / 180 if y < 300 else 10 + 12 * (y - 300) / 60)
        put(img, int(xe), y, 'g1')
    # overhanging branch + leaf clumps (top left)
    d.line([(26, 52), (80, 40), (130, 34), (178, 20)], fill=c('out'), width=6)
    d.line([(26, 60), (90, 46), (150, 34)], fill=c('out'), width=3)
    for i, (bx, by, rr) in enumerate([(10, 10, 30), (52, 8, 26), (96, 18, 22), (138, 10, 20), (176, 16, 15), (70, 38, 16), (120, 40, 13), (30, 46, 18), (206, 6, 12)]):
        blob(img, bx, by, rr, 20 + i)
    # hanging moss strands
    for k in range(18):
        x = r.randint(20, 200)
        y0 = 30 + r.randint(0, 20)
        for y in range(y0, y0 + r.randint(6, 22)):
            if img.getpixel((x, y))[3] == 0 or y > y0:
                put(img, x + (1 if (y // 5) % 2 else 0), y, 'g0' if r.random() < .8 else 'g1')
    # right thin trunk + top right clump
    d.polygon([(606, 0), (626, 0), (630, 360), (600, 360)], fill=c('out'))
    for y in range(0, 360, 2):
        put(img, 601 - int(1 * y / 360), y, 'g1') if False else None
    for i, (bx, by, rr) in enumerate([(640, 4, 30), (600, 0, 18), (622, 34, 16)]):
        blob(img, bx, by, rr, 40 + i)
    # bush masses bottom left / right
    for i, (bx, by, rr) in enumerate([(10, 300, 34), (60, 326, 28), (110, 346, 22), (-4, 350, 30), (150, 356, 14)]):
        blob(img, bx, by, rr, 60 + i)
    for i, (bx, by, rr) in enumerate([(630, 286, 36), (588, 318, 30), (540, 344, 24), (640, 350, 30), (500, 356, 14)]):
        blob(img, bx, by, rr, 80 + i)
    # grass blades along the bottom
    for x in range(0, W, 1):
        dc = abs(x - 320)
        if dc < 70 and r.random() < .6:
            continue
        hmax = 4 + int(min(dc, 260) / 260 * 24)
        h = r.randint(2, hmax)
        lean = r.choice([-1, 0, 0, 1])
        for k in range(h):
            xx = x + (lean * k) // 5
            put(img, xx, H - 1 - k, 'g1' if k == h - 1 and r.random() < .5 else 'out' if k < h * .6 else 'g0')
    # fireflies
    flies = [(196, 232), (150, 182), (88, 260), (470, 214), (520, 260), (572, 196), (258, 300), (402, 248), (228, 92), (612, 228)]
    for (x, y) in flies:
        put(img, x, y, 'f1')
        put(glow, x, y, 'f1')
    return img, glow


# ------------------------------------------------------------------ ground
def ground():
    img = new(W, H)
    r = rng(14)

    def edge(x):
        return int(250 + 4 * math.sin(x / 40) + 3 * math.sin(x / 17 + 1))

    def path(y):
        t = (y - 252) / 108
        cx = 320 + 10 * math.sin(t * 3.0) - 6 * t
        hw = 7 + t * 62
        return cx, hw

    for x in range(W):
        e = edge(x)
        if 280 <= x <= 360:
            e = max(e, 254)
        for y in range(e, H):
            f = (y - e) / 40
            col = 'g1' if not bayer(x, y, min(1, f)) else 'g2'
            put(img, x, y, col)
    # grass texture tufts
    for _ in range(900):
        x, y = r.randint(0, W - 1), r.randint(256, H - 1)
        if img.getpixel((x, y))[3] == 0:
            continue
        near_k = (y - 250) / 110
        col = r.choices(['g3', 'g1', 'g4'], [5, 4, 1 + int(near_k * 3)])[0]
        put(img, x, y, col)
        if near_k > .3:
            put(img, x - 1, y + 1, col)
            put(img, x + 1, y + 1, col)
    # path
    for y in range(252, H):
        cx, hw = path(y)
        for x in range(int(cx - hw), int(cx + hw) + 1):
            dd = abs(x - cx) / hw
            col = 'w1'
            if dd > .82:
                col = 'w0'
            elif bayer(x, y, 0.25 * (1 - dd)) and y > 280:
                col = 'w2'
            put(img, x, y, col)
    # pebbles and ruts
    for _ in range(70):
        y = r.randint(262, H - 3)
        cx, hw = path(y)
        x = int(cx + r.uniform(-.7, .7) * hw)
        big = y > 300 and r.random() < .5
        put(img, x, y, 's2')
        put(img, x + 1, y, 's1')
        if big:
            put(img, x, y + 1, 's1')
            put(img, x + 1, y + 1, 'w0')
            put(img, x - 1, y, 's1')
    # grass tufts creeping over path edges
    for y in range(256, H, 3):
        cx, hw = path(y)
        for side in (-1, 1):
            x = int(cx + side * (hw + r.randint(-2, 1)))
            for k in range(r.randint(2, 4 + (y - 250) // 25)):
                put(img, x + side * (k % 2), y - k, 'g3' if k else 'g2')
    # grass silhouette blades on the top edge
    for x in range(W):
        if r.random() < .55:
            e = edge(x) if not (280 <= x <= 360) else max(edge(x), 254)
            for k in range(r.randint(1, 4)):
                put(img, x, e - 1 - k, 'g2' if k < 2 else 'g1')
    # little flowers and two mushrooms
    for _ in range(40):
        x, y = r.randint(0, W - 1), r.randint(262, H - 6)
        cx, hw = path(y)
        if abs(x - cx) < hw + 4:
            continue
        put(img, x, y, r.choice(['cr', 'p2', 'star']))
    for (mx, my) in [(232, 296), (436, 318)]:
        d = draw(img)
        d.rectangle([mx, my, mx + 1, my + 3], fill=c('cr'))
        d.rectangle([mx - 2, my - 2, mx + 3, my], fill=c('p2'))
        put(img, mx - 1, my - 2, 'cr')
        put(img, mx + 2, my - 1, 'cr')
    return img


# ------------------------------------------------------------------ house
def house():
    Wd, Hd = 160, 140
    img = new(Wd, Hd)
    d = draw(img)
    r = rng(21)
    # chimney (behind roof)
    d.rectangle([112, 8, 127, 52], fill=c('s1'))
    for y in range(9, 52, 4):
        off = 0 if (y // 4) % 2 else 3
        d.line([(112, y), (127, y)], fill=c('w0'))
        for x in range(112 + off, 128, 6):
            d.line([(x, y), (x, y + 3)], fill=c('w0'))
        for x in range(113 + off, 127, 6):
            put(img, x + 3, y + 1, 's2')
            put(img, x + 4, y + 1, 's2')
    d.rectangle([110, 4, 129, 8], fill=c('s2'))
    d.line([(110, 8), (129, 8)], fill=c('s1'))
    d.rectangle([114, 1, 125, 3], fill=c('w0'))
    # gable wall (vertical planks)
    d.polygon([(80, 18), (14, 74), (146, 74)], fill=c('w1'))
    for x in range(18, 146, 6):
        d.line([(x, 18), (x, 76)], fill=c('w0'))
        d.line([(x + 1, 18), (x + 1, 76)], fill=c('w2'))
    # mask planks outside gable triangle
    px = img.load()
    for y in range(0, 77):
        for x in range(0, Wd):
            inside = y >= 18 and abs(x - 80) <= (y - 18) * 66 / 56
            if not inside and not (110 <= x <= 129 and y <= 52):
                px[x, y] = (0, 0, 0, 0)
    # attic round window
    d.ellipse([72, 38, 88, 54], fill=c('w0'))
    d.ellipse([74, 40, 86, 52], fill=c('f1'))
    d.line([(80, 40), (80, 52)], fill=c('w0'))
    d.line([(74, 46), (86, 46)], fill=c('w0'))
    for p in [(77, 43), (83, 43)]:
        put(img, *p, 'f2')
    # log walls
    for i, y in enumerate(range(74, 128, 7)):
        d.rectangle([14, y, 146, y + 6], fill=c('w2'))
        d.line([(14, y), (146, y)], fill=c('w3'))
        d.line([(14, y + 5), (146, y + 5)], fill=c('w1'))
        d.line([(14, y + 6), (146, y + 6)], fill=c('w0'))
        for k in range(6):
            gx = r.randint(18, 140)
            d.line([(gx, y + 2 + k % 3), (gx + r.randint(3, 8), y + 2 + k % 3)], fill=c('w1'))
        for ex, lit in ((11, False), (149, True)):
            d.ellipse([ex - 3, y, ex + 3, y + 6], fill=c('w3' if lit else 'w2'))
            d.ellipse([ex - 1, y + 2, ex + 1, y + 4], fill=c('w1' if lit else 'w0'))
            put(img, ex, y + 3, 'w2' if lit else 'w1')
    # foundation stones
    d.rectangle([8, 127, 152, 134], fill=c('s1'))
    x = 8
    while x < 152:
        w = r.randint(6, 11)
        d.rectangle([x, 127, x + w - 1, 134], fill=c('s1'))
        d.line([(x, 127), (x + w - 2, 127)], fill=c('s2'))
        d.line([(x + w - 1, 127), (x + w - 1, 134)], fill=c('out'))
        x += w
    # roof bands, moss covered
    for side in (-1, 1):
        pts = [(80, 4), (80 + side * 80, 70), (80 + side * 80, 79), (80 + side * 70, 79), (80, 17)]
        pts = [(min(159, max(0, x)), y) for x, y in pts]
        d.polygon(pts, fill=c('g2'))
    for y in range(4, 80):
        for x in range(Wd):
            if px[x, y][:3] == PAL['g2'] and px[x, y][3]:
                # distance to top edge of roof
                top = 4 + abs(x - 80) * 66 / 80
                dd = y - top
                if dd < 2.5:
                    col = 'g3' if x > 80 else 'g2'
                    if x > 80 and (x + y) % 3 == 0:
                        col = 'g4'
                elif x < 80 and dd > 7 and bayer(x, y, 0.5):
                    col = 'g1'
                elif x > 80 and 3 < dd < 6 and bayer(x, y, 0.5):
                    col = 'g3'
                else:
                    col = 'g2'
                px[x, y] = c(col)
    # moss lumps on top edge
    for k in range(16):
        x = r.randint(6, 154)
        top = int(4 + abs(x - 80) * 66 / 80)
        d.ellipse([x - 3, top - 2, x + 3, top + 2], fill=c('g3' if x > 80 else 'g2'))
        put(img, x + 1, top - 2, 'g4' if x > 80 else 'g3')
    # underside shadow of roof on gable
    for y in range(17, 80):
        hw = (y - 17) * 70 / 62
        for sx in (int(80 - hw), int(80 + hw)):
            if 0 <= sx < Wd and y < 79:
                put(img, sx, y, 'w0')
    d.line([(0, 79), (159, 79)], fill=c('g1'))
    # drooping moss strands under the eaves
    for x in range(0, Wd, 2):
        if 14 <= x <= 146 and r.random() < .55:
            L = r.randint(1, 5)
            for k in range(L):
                put(img, x, 80 + k, 'g2' if k < L - 1 else 'g3')
    # door
    d.rectangle([66, 92, 93, 127], fill=c('w0'))
    d.ellipse([66, 82, 93, 102], fill=c('w0'))
    d.rectangle([68, 94, 91, 127], fill=c('w1'))
    d.ellipse([68, 84, 91, 104], fill=c('w1'))
    for x in range(72, 91, 5):
        d.line([(x, 86 if abs(x - 80) < 8 else 90), (x, 127)], fill=c('w0'))
        d.line([(x + 1, 88 if abs(x - 80) < 8 else 92), (x + 1, 127)], fill=c('w2'))
    for y in (100, 119):
        d.line([(68, y), (91, y)], fill=c('s1'))
        d.line([(68, y + 1), (91, y + 1)], fill=c('out'))
    d.rectangle([86, 108, 88, 110], fill=c('au1'))
    put(img, 86, 108, 'au2')
    # crescent cut-out in the door (lit)
    for p in [(79, 89), (78, 90), (78, 91), (78, 92), (79, 93), (80, 93)]:
        put(img, *p, 'f1')
    # step
    d.rectangle([62, 128, 97, 133], fill=c('s2'))
    d.line([(62, 133), (97, 133)], fill=c('s1'))
    d.line([(62, 128), (97, 128)], fill=c('h1'))
    # windows
    for wx in (22, 112):
        d.rectangle([wx, 86, wx + 25, 110], fill=c('w0'))
        d.rectangle([wx + 3, 89, wx + 22, 107], fill=c('f1'))
        d.line([(wx + 12, 89), (wx + 12, 107)], fill=c('w0'))
        d.line([(wx + 13, 89), (wx + 13, 107)], fill=c('w0'))
        d.line([(wx + 3, 97), (wx + 22, 97)], fill=c('w0'))
        for p in [(wx + 4, 90), (wx + 5, 90), (wx + 4, 91), (wx + 14, 90), (wx + 15, 90), (wx + 14, 91)]:
            put(img, *p, 'f2')
        d.rectangle([wx - 2, 110, wx + 27, 112], fill=c('w3'))
        d.line([(wx - 2, 112), (wx + 27, 112)], fill=c('w1'))
        # flower box
        d.rectangle([wx, 113, wx + 25, 118], fill=c('w1'))
        d.line([(wx, 113), (wx + 25, 113)], fill=c('w2'))
        for k in range(wx + 1, wx + 25, 2):
            put(img, k, 112 - (k % 3 == 0), 'g3')
            put(img, k, 111 - (k % 3 == 0), 'g2' if k % 4 else ('cr' if wx < 80 else 'p2'))
    # lantern by the door (right)
    d.line([(94, 86), (102, 86)], fill=c('out'))
    put(img, 102, 87, 'out')
    d.rectangle([99, 88, 105, 90], fill=c('s1'))
    put(img, 102, 87, 's2')
    d.rectangle([99, 91, 105, 99], fill=c('s1'))
    d.rectangle([100, 91, 104, 98], fill=c('f1'))
    put(img, 102, 94, 'f2')
    put(img, 102, 95, 'f2')
    d.rectangle([99, 100, 105, 101], fill=c('s1'))
    put(img, 102, 102, 's1')
    # woodpile (left)
    for (lx, ly) in [(3, 122), (9, 122), (6, 116), (3, 128), (9, 128)]:
        d.ellipse([lx - 3, ly - 3, lx + 3, ly + 3], fill=c('w2'))
        d.ellipse([lx - 1, ly - 1, lx + 1, ly + 1], fill=c('w3'))
    img = outline(img)
    glow = glow_from(img, ['f1', 'f2'])
    return img, glow


def build():
    s, sg = sky()
    save(s, 'forest/sky.png', opaque=True)
    save(sg, 'forest/sky_glow.png')
    save(far(), 'forest/far.png')
    save(mid(), 'forest/mid.png')
    n, ng = near()
    save(n, 'forest/near.png')
    save(ng, 'forest/near_glow.png')
    save(ground(), 'forest/ground.png')
    h, hg = house()
    save(h, 'forest/house.png')
    save(hg, 'forest/house_glow.png')


if __name__ == '__main__':
    build()
    print('forest ok')
