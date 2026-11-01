"""Nguyệt (the keeper, 160x176) and the owl Bấc (40x44).

Keeper is drawn as two layers: a fixed lower layer (robe, sleeves, hands)
and an upper layer (hood, mantle, face, hair, pendant) that rises 1px while
she breathes in.
"""
import json
import math
from PIL import Image
from common import *

KW, KH = 160, 176
OW, OH = 40, 44

EYE_PX = [(86, 57), (87, 57), (88, 58), (88, 59), (89, 59), (88, 60), (89, 60), (88, 61), (89, 61), (88, 62), (86, 63), (87, 63)]
EYE_CORE = [(88, 59), (88, 60), (88, 61)]
EYE_CENTER = (88, 60)
PENDANT = {  # pixel: colour
    (80, 110): 'au1',
    (79, 111): 't0', (80, 111): 't1', (81, 111): 't1',
    (78, 112): 't0', (79, 112): 't1', (80, 112): 'f2', (81, 112): 't1', (82, 112): 't0',
    (78, 113): 't0', (79, 113): 't1', (80, 113): 't1', (81, 113): 't1', (82, 113): 't0',
    (79, 114): 't0', (80, 114): 't1', (81, 114): 't0',
    (80, 115): 't0',
}
SHOULDER = (36, 108)       # where the owl's feet rest (frame 0)
OWL_FEET = (20, 43)        # bottom-centre of the owl's talons inside owl sprite


# ------------------------------------------------------------------ helpers
def fill_poly_shaded(img, pts, base, dark=None, light=None, dark_fn=None, light_fn=None):
    tmp = new(*img.size)
    draw(tmp).polygon(pts, fill=c(base))
    tp, ip = tmp.load(), img.load()
    for y in range(img.height):
        for x in range(img.width):
            if tp[x, y][3]:
                col = base
                if dark and dark_fn and dark_fn(x, y, tmp):
                    col = dark
                elif light and light_fn and light_fn(x, y, tmp):
                    col = light
                ip[x, y] = c(col)
    return tmp


def edge_dist(mask, x, y, dx, n):
    """How many px from (x,y) stepping by dx until leaving the mask (max n)."""
    for k in range(1, n + 1):
        xx = x + dx * k
        if not (0 <= xx < mask.width) or mask.getpixel((xx, y))[3] == 0:
            return k
    return n + 1


def hand(img, x0, y0, mirror, ring_finger):
    """A resting hand, palm down, fingers toward the viewer. 22x12 box at (x0,y0)."""
    m = new(22, 12)
    d = draw(m)
    d.rectangle([2, 0, 17, 5], fill=(255, 0, 0, 255))      # back of hand
    d.rectangle([1, 1, 18, 5], fill=(255, 0, 0, 255))
    lens = [5, 6, 6, 5]
    fxs = [1, 5, 9, 13]
    for i, fx in enumerate(fxs):
        d.rectangle([fx, 5, fx + 3, 5 + lens[i]], fill=(255, 0, 0, 255))
        put(m, fx, 5 + lens[i], (0, 0, 0, 0))
        put(m, fx + 3, 5 + lens[i], (0, 0, 0, 0))
    d.polygon([(17, 2), (20, 3), (21, 7), (19, 8), (17, 6)], fill=(255, 0, 0, 255))   # thumb (toward body centre)
    if mirror:
        m = m.transpose(Image.FLIP_LEFT_RIGHT)
    mp = m.load()
    for y in range(12):
        for x in range(22):
            if not mp[x, y][3]:
                continue
            left_empty = x == 0 or not mp[x - 1, y][3]
            right_empty = x == 21 or not mp[x + 1, y][3]
            below_empty = y == 11 or not mp[x, y + 1][3]
            col = 'k2'
            if left_empty or (below_empty and y > 6):
                col = 'k1'
            put(img, x0 + x, y0 + y, col)
    for gx, ln in ((5, 5), (9, 6), (13, 5)):
        xx = (21 - gx) if mirror else gx
        for y in range(6, 6 + ln):
            put(img, x0 + xx, y0 + y, 'k0')
    fx = fxs[ring_finger]
    for k in range(4):
        xx = fx + k
        xx = (21 - xx) if mirror else xx
        put(img, x0 + xx, y0 + 7, 'au2' if k == 2 else 'au1')


# ------------------------------------------------------------------ keeper
def keeper_lower():
    L = new(KW, KH)
    d = draw(L)
    # torso
    d.polygon([(18, 175), (22, 132), (40, 116), (120, 116), (138, 132), (142, 175)], fill=c('n2'))
    # inner plum robe, visible in the V
    pts = [(70, 86), (90, 86), (100, 175), (60, 175)]
    fill_poly_shaded(L, pts, 'p1', dark='p0', dark_fn=lambda x, y, m: x < 77 - (y - 86) * 0.1)
    d.line([(70, 92), (60, 175)], fill=c('au1'))
    d.line([(90, 92), (100, 175)], fill=c('au1'))
    for y in range(120, 172, 5):
        put(L, 80, y, 'au0')
        put(L, 80, y + 1, 'au1')
    # sleeves
    larm = [(14, 142), (24, 124), (40, 122), (52, 136), (66, 158), (66, 166), (30, 166), (18, 156)]
    rarm = [(KW - x, y) for x, y in larm]
    fill_poly_shaded(L, larm, 'n2', dark='n1', light='n3',
                     dark_fn=lambda x, y, m: edge_dist(m, x, y, -1, 5) <= 5 and x < 34,
                     light_fn=lambda x, y, m: edge_dist(m, x, y, 1, 2) <= 2 and y < 158)
    fill_poly_shaded(L, rarm, 'n2', dark='n1', light='n3',
                     dark_fn=lambda x, y, m: edge_dist(m, x, y, -1, 2) <= 2 and y < 158,
                     light_fn=lambda x, y, m: edge_dist(m, x, y, 1, 4) <= 4)
    # fold lines
    d.line([(30, 132), (40, 160)], fill=c('n1'))
    d.line([(44, 134), (54, 156)], fill=c('n1'))
    d.line([(130, 132), (120, 160)], fill=c('n1'))
    d.line([(116, 134), (108, 152)], fill=c('n1'))
    # separation line between sleeve and robe
    d.line([(52, 136), (66, 158)], fill=c('out'))
    d.line([(108, 136), (94, 158)], fill=c('out'))
    # cuffs: dark opening + gold trim
    for x0, x1 in ((30, 66), (94, 130)):
        d.rectangle([x0 + 2, 164, x1 - 2, 166], fill=c('n0'))
        d.line([(x0, 163), (x1, 163)], fill=c('au1'))
        d.line([(x0 + 1, 162), (x1 - 1, 162)], fill=c('au0'))
    hand(L, 37, 164, False, 2)
    hand(L, 101, 164, True, 2)
    return L


def keeper_upper(mouth='closed', eye='open', sway=0):
    U = new(KW, KH)
    d = draw(U)
    # ---- mantle (capelet) with a V opening
    lm = [(22, 130), (26, 116), (38, 105), (54, 97), (70, 92), (73, 104), (72, 134), (54, 134), (36, 133)]
    rm = [(KW - x, y) for x, y in lm]
    fill_poly_shaded(U, lm, 'n2', dark='n1', dark_fn=lambda x, y, m: edge_dist(m, x, y, -1, 6) <= 6 or y > 129)
    fill_poly_shaded(U, rm, 'n2', dark='n1', light='n3',
                     dark_fn=lambda x, y, m: y > 129 and x < 120,
                     light_fn=lambda x, y, m: edge_dist(m, x, y, 1, 5) <= 5 or (y < 108 and x > 100))
    # gold hem + front edges
    for pts in (lm, rm):
        d.line([pts[-3], pts[-2], pts[-1], pts[0]], fill=c('au1'))
        d.line([pts[4], pts[5], pts[6]], fill=c('au1'))
    d.line([(54, 135), (72, 135)], fill=c('out'))
    d.line([(36, 134), (54, 135)], fill=c('out'))
    d.line([(22, 131), (36, 134)], fill=c('out'))
    d.line([(KW - 54, 135), (KW - 72, 135)], fill=c('out'))
    d.line([(KW - 36, 134), (KW - 54, 135)], fill=c('out'))
    d.line([(KW - 22, 131), (KW - 36, 134)], fill=c('out'))
    # ---- hood
    hood = new(KW, KH)
    hd = draw(hood)
    hd.ellipse([46, 8, 114, 96], fill=c('n2'))
    hd.polygon([(76, 9), (80, 5), (84, 9)], fill=c('n2'))
    hd.polygon([(47, 60), (113, 60), (121, 102), (39, 102)], fill=c('n2'))
    hp = hood.load()
    for y in range(KH):
        for x in range(KW):
            if hp[x, y][3]:
                col = 'n2'
                dl = edge_dist(hood, x, y, -1, 8)
                dr = edge_dist(hood, x, y, 1, 7)
                if dl <= 7:
                    col = 'n1'
                elif dr <= 1 and 16 < y < 56:
                    col = 'n4'
                elif dr <= 6 and y < 84:
                    col = 'n3'
                elif y < 16 and x > 79:
                    col = 'n3'
                hp[x, y] = c(col)
    U.alpha_composite(hood)
    # folds
    d.line([(68, 12), (58, 32), (54, 60)], fill=c('n1'))
    d.line([(94, 13), (102, 30), (106, 56)], fill=c('n3'))
    d.line([(48, 62), (44, 96)], fill=c('n0'))
    d.line([(112, 64), (116, 98)], fill=c('n2'))
    # gold dotted rim around the opening
    rim = new(KW, KH)
    draw(rim).ellipse([59, 31, 101, 101], outline=c('au1'))
    rp = rim.load()
    for y in range(KH):
        for x in range(KW):
            if rp[x, y][3] and (x + y) % 2 == 0 and y < 92:
                put(U, x, y, 'au1' if x > 80 else 'au0')
    # plum lining
    lin = new(KW, KH)
    draw(lin).ellipse([61, 33, 99, 99], fill=c('p1'))
    lp = lin.load()
    for y in range(KH):
        for x in range(KW):
            if lp[x, y][3]:
                put(U, x, y, 'p2' if x > 86 else ('p0' if x < 72 else 'p1'))
    # void inside the hood
    d.ellipse([64, 36, 96, 96], fill=c('out'))
    # faint hair strands catching a little light in the dark
    for p in [(72, 42), (71, 43), (70, 44), (70, 45), (69, 46), (89, 41), (90, 42), (91, 43), (91, 44)]:
        put(U, *p, 's1')
    # ---- face: chin + lips catching candle light
    chin = [(71, 68), (89, 66), (88, 77), (85, 82), (80, 84), (75, 82), (72, 77)]
    cm = new(KW, KH)
    draw(cm).polygon(chin, fill=(255, 0, 0, 255))
    for y in range(64, 86):
        for x in range(70, 91):
            if not cm.getpixel((x, y))[3]:
                continue
            sh = y - (68 + (89 - x) * 0.42)
            if sh < 0:
                continue
            if sh < 1.6 and not bayer(x, y, .5):
                continue
            col = 'k2'
            if x < 75 or y >= 83 or edge_dist(cm, x, y, -1, 2) <= 2 or sh < 2.5:
                col = 'k1'
            put(U, x, y, col)
    my = 77
    if mouth == 'closed':
        for x in range(78, 83):
            put(U, x, my, 'lip')
        put(U, 79, my + 1, 'k1')
        put(U, 80, my + 1, 'k1')
    elif mouth == 'half':
        for x in range(78, 83):
            put(U, x, my - 1, 'lip')
        for x in range(79, 82):
            put(U, x, my, 'out')
        for x in range(79, 82):
            put(U, x, my + 1, 'lip')
    elif mouth == 'open':
        for x in range(79, 82):
            put(U, x, my - 2, 'lip')
        put(U, 78, my - 1, 'lip')
        put(U, 82, my - 1, 'lip')
        for x in range(79, 82):
            put(U, x, my - 1, 'out')
            put(U, x, my, 'out')
        put(U, 78, my, 'lip')
        put(U, 82, my, 'lip')
        for x in range(79, 82):
            put(U, x, my + 1, 'lip')
    stars_on(U, 7)                     # before hair so stars never move between frames
    # ---- silver hair locks spilling out of the hood
    for (x0, y0, y1, side, phase, wmax) in [(67, 52, 114, -1, 0.0, 3), (70, 62, 110, -1, 1.7, 2), (65, 70, 118, -1, 3.1, 2),
                                             (92, 52, 114, 1, 0.6, 3), (89, 62, 108, 1, 2.2, 2), (95, 70, 117, 1, 3.6, 2)]:
        for y in range(y0, y1 + 1):
            t = (y - y0) / (y1 - y0)
            x = x0 + side * (t * 7 + 1.6 * math.sin(t * 7 + phase))
            if y >= 98:
                x += sway * min(1, (y - 98) / 10)
            w = max(1, round(wmax * math.sin(math.pi * min(1, .15 + t * .95))))
            xi = round(x)
            inside = y < 90 and 64 < xi < 96
            for k in range(w):
                xx = xi + k - w // 2
                if inside:
                    col = 's1' if k == 0 else 'h1'
                elif side < 0:
                    col = 'h2' if (k == w - 1 and w > 1) else 'h1'
                else:
                    col = 'h1' if (k == 0 and w > 1) else 'h2'
                put(U, xx, y, col)
    # ---- moon phases embroidered across the hood
    def disc(cx, cy, rr, col, cut=None):
        for y in range(int(cy - rr - 1), int(cy + rr + 2)):
            for x in range(int(cx - rr - 1), int(cx + rr + 2)):
                if (x - cx) ** 2 + (y - cy) ** 2 <= rr * rr:
                    if cut and (x - cut[0]) ** 2 + (y - cut[1]) ** 2 <= cut[2] ** 2:
                        continue
                    put(U, x, y, col)
    disc(80, 19, 3.2, 'au1')                      # full moon in the middle
    put(U, 81, 18, 'au2')
    put(U, 82, 19, 'au2')
    put(U, 79, 20, 'au0')
    # half moons
    for (x, y, side) in [(71, 22, -1), (89, 22, 1)]:
        for yy in range(y - 2, y + 3):
            for xx in range(x - 2, x + 3):
                if (xx - x) ** 2 + (yy - y) ** 2 <= 5 and (xx - x) * side >= 0:
                    put(U, xx, yy, 'au1')
    # crescents
    for (x, y, side) in [(63, 29, -1), (97, 29, 1)]:
        for p in [(x, y - 2), (x + side, y - 1), (x + side, y), (x + side, y + 1), (x, y + 2)]:
            put(U, *p, 'au1')
    # ---- pendant on a gold chain
    for k in range(0, 18, 2):
        put(U, 72 + k * 8 // 18, 93 + k, 'au1')
        put(U, 88 - k * 8 // 18, 93 + k, 'au1')
    for (x, y), col in PENDANT.items():
        put(U, x, y, col)
    for p in [(78, 111), (82, 111), (77, 112), (83, 112), (77, 113), (83, 113), (78, 114), (82, 114), (79, 115), (81, 115), (80, 116)]:
        put(U, *p, 'au0')
    # ---- crescent eye
    if eye == 'open':
        for p in EYE_PX:
            put(U, *p, 'au1')
        for p in EYE_CORE:
            put(U, *p, 'au2')
    else:
        for p in [(86, 61), (87, 62), (88, 62), (89, 61)]:
            put(U, *p, 'au0')
    return U


def stars_on(img, seed):
    r = rng(seed)
    p = img.load()
    cloak = {PAL['n1'], PAL['n2'], PAL['n3']}
    n = 0
    while n < 46:
        x, y = r.randint(16, 144), r.randint(20, 160)
        if p[x, y][3] and p[x, y][:3] in cloak:
            ok = all(p[x + dx, y + dy][3] and p[x + dx, y + dy][:3] in cloak for dx, dy in [(1, 0), (-1, 0), (0, 1), (0, -1)])
            if ok:
                p[x, y] = c(r.choices(['star', 'moon', 'au1'], [3, 2, 2])[0])
                n += 1


def keeper(dy=0, sway=0, mouth='closed', eye='open'):
    L = keeper_lower()
    U = keeper_upper(mouth, eye, sway)
    stars_on(L, 9)
    img = L.copy()
    if dy:
        U = U.crop((0, -dy, KW, KH - dy))
    img.alpha_composite(U)
    img = outline(img)
    return img


def keeper_glow(dy=0, eye=True):
    g = new(KW, KH)
    if eye:
        for p in EYE_PX:
            put(g, p[0], p[1] + dy, 'f1')
        for p in EYE_CORE:
            put(g, p[0], p[1] + dy, 'f2')
    for (x, y), col in PENDANT.items():
        if col in ('t1', 'f2'):
            put(g, x, y + dy, col)
    return g


# ------------------------------------------------------------------ owl
def owl_frame(kind):
    body = new(OW, OH)
    d = draw(body)
    puff = 1 if kind == 'breathe' else 0
    # tail
    d.polygon([(17, 37), (23, 37), (22, 43), (18, 43)], fill=c('o0'))
    # body
    d.ellipse([8 - puff, 15, 32 + puff, 41], fill=c('o1'))
    # wings
    lw = [(9 - puff, 20), (14, 18), (15, 30), (13, 40), (9 - puff, 38), (7 - puff, 30)]
    rw = [(OW - x, y) for x, y in lw]
    d.polygon(lw, fill=c('o0'))
    d.polygon(rw, fill=c('o1'))
    for k, y in enumerate(range(24, 40, 4)):
        d.line([(9 - puff, y), (13, y + 2)], fill=c('o1'))
        d.line([(OW - 9 + puff, y), (OW - 13, y + 2)], fill=c('o2'))
    d.line([(OW - 8 + puff, 24), (OW - 8 + puff, 34)], fill=c('o2'))
    # chest
    d.ellipse([13, 21 - puff, 27, 41], fill=c('o3'))
    for y in range(25 - puff, 40, 4):
        for x in range(15 + (y // 4) % 2 * 2, 26, 4):
            put(body, x, y, 'o2')
            put(body, x + 1, y + 1, 'o2')
            put(body, x - 1, y + 1, 'o2')
    for y in range(22, 41):
        if body.getpixel((14, y))[:3] == PAL['o3']:
            put(body, 14, y, 'o2')
    # feet
    for fx in (14, 22):
        for k in range(4):
            put(body, fx + k, 41, 'au0')
            put(body, fx + k, 42, 'au0' if k % 2 == 0 else 'au1')
        put(body, fx, 43, 'out')
        put(body, fx + 2, 43, 'out')
        put(body, fx + 3, 43, 'out')

    head = new(OW, OH)
    h = draw(head)
    h.ellipse([7, 3, 33, 25], fill=c('o1'))
    h.polygon([(8, 9), (9, 0), (15, 5)], fill=c('o0'))
    h.polygon([(25, 5), (31, 0), (32, 9)], fill=c('o1'))
    put(head, 30, 1, 'o2')
    put(head, 30, 2, 'o2')
    # crown speckles
    for p in [(13, 5), (17, 4), (21, 4), (25, 5), (15, 7), (23, 7), (11, 8), (29, 8), (19, 6)]:
        put(head, *p, 'o0' if p[0] < 20 else 'o2')
    # facial discs
    h.ellipse([9, 8, 19, 20], fill=c('o2'))
    h.ellipse([21, 8, 31, 20], fill=c('o3'))
    h.arc([9, 8, 19, 20], 100, 260, fill=c('o0'))
    h.arc([21, 8, 31, 20], 280, 80, fill=c('o1'))
    # brows meeting above the beak
    h.line([(10, 10), (14, 11), (19, 14)], fill=c('o0'))
    h.line([(30, 10), (26, 11), (21, 14)], fill=c('o1'))
    # eyes
    for ex in (13, 23):
        if kind == 'blink':
            for p in [(ex, 13), (ex + 1, 14), (ex + 2, 14), (ex + 3, 13)]:
                put(head, *p, 'o0')
        else:
            for p in [(ex + 1, 12), (ex + 2, 12), (ex, 13), (ex + 3, 13), (ex, 14), (ex + 3, 14)]:
                put(head, *p, 'f1')
            put(head, ex + 1, 15, 'f0')
            put(head, ex + 2, 15, 'f0')
            for p in [(ex + 1, 13), (ex + 2, 13), (ex + 1, 14), (ex + 2, 14)]:
                put(head, *p, 'out')
            put(head, ex + 1, 13, 'f2')
            put(head, ex - 1, 13, 'o0')
            put(head, ex + 4, 13, 'o0')
    # beak
    for p, col in [((19, 15), 'au0'), ((20, 15), 'au1'), ((19, 16), 'au0'), ((20, 16), 'au1'), ((20, 17), 'au0')]:
        put(head, *p, col)
    put(head, 18, 15, 'o0')
    if kind == 'tilt':
        hp = head.load()
        sheared = new(OW, OH)
        sp = sheared.load()
        for x in range(OW):
            off = round((x - 20) * 0.13)
            for y in range(OH):
                if hp[x, y][3] and 0 <= y + off < OH:
                    sp[x, y + off] = hp[x, y]
        head = sheared
    img = body
    img.alpha_composite(head)
    img = outline(img)
    return img


def build():
    frames = {'keeper_idle_0': (0, 0), 'keeper_idle_1': (-1, 0), 'keeper_idle_2': (-1, 1), 'keeper_idle_3': (0, 1)}
    for name, (dy, sway) in frames.items():
        save(keeper(dy, sway), f'characters/{name}.png')
    save(keeper(eye='closed'), 'characters/keeper_blink.png')
    for i, m in enumerate(['closed', 'half', 'open']):
        save(keeper(mouth=m), f'characters/keeper_speak_{i}.png')
    save(keeper_glow(0), 'characters/keeper_glow.png')
    save(keeper_glow(-1), 'characters/keeper_glow_up.png')
    save(keeper_glow(0, eye=False), 'characters/keeper_glow_blink.png')

    owls = []
    for i, kind in enumerate(['base', 'breathe', 'blink', 'tilt']):
        o = save(owl_frame(kind), f'characters/owl_idle_{i}.png')
        owls.append(o)
    save(glow_from(owls[0], ['f0', 'f1', 'f2']), 'characters/owl_glow.png')
    save(glow_from(owls[3], ['f0', 'f1', 'f2']), 'characters/owl_glow_tilt.png')

    anchors = {
        'keeper_frame': [KW, KH],
        'owl_frame': [OW, OH],
        'owl_feet_on_left_shoulder': list(SHOULDER),
        'owl_feet_in_owl_sprite': list(OWL_FEET),
        'owl_sprite_offset_in_keeper': [SHOULDER[0] - OWL_FEET[0], SHOULDER[1] - OWL_FEET[1]],
        'glowing_eye_center': list(EYE_CENTER),
        'pendant_center': [80, 112],
        'mouth_center': [80, 80],
        'per_frame': {
            'keeper_idle_0': {'upper_dy': 0, 'glow': 'keeper_glow.png'},
            'keeper_idle_1': {'upper_dy': -1, 'glow': 'keeper_glow_up.png'},
            'keeper_idle_2': {'upper_dy': -1, 'glow': 'keeper_glow_up.png'},
            'keeper_idle_3': {'upper_dy': 0, 'glow': 'keeper_glow.png'},
            'keeper_blink': {'upper_dy': 0, 'glow': 'keeper_glow_blink.png'},
            'keeper_speak_0': {'upper_dy': 0, 'glow': 'keeper_glow.png'},
            'keeper_speak_1': {'upper_dy': 0, 'glow': 'keeper_glow.png'},
            'keeper_speak_2': {'upper_dy': 0, 'glow': 'keeper_glow.png'},
        },
        'owl_per_frame': {
            'owl_idle_0': {'glow': 'owl_glow.png'},
            'owl_idle_1': {'glow': 'owl_glow.png'},
            'owl_idle_2': {'glow': None},
            'owl_idle_3': {'glow': 'owl_glow_tilt.png'},
        },
        'notes': [
            'upper_dy: hood, shoulders, face and pendant rise 1px on idle 1-2; add upper_dy to the owl position and to eye/pendant coords on those frames.',
            'Speak frames share frame 0 geometry, so keeper_glow.png fits them (no keeper_glow_speak needed).',
            'Keeper hands sit on the bottom edge of the frame: place the sprite so its bottom row touches the far edge of table.png.',
        ],
    }
    path = os.path.join(ROOT, 'characters/anchors.json')
    with open(path, 'w') as f:
        json.dump(anchors, f, indent=2, ensure_ascii=False)
    SAVED.append('characters/anchors.json')


if __name__ == '__main__':
    build()
    print('characters ok')
