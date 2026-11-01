"""Card back, card front frame, suit icons and the Major Arcana star."""
import math
from common import *

CW, CH = 48, 80


def rounded_border(img):
    for (x, y) in [(0, 0), (1, 0), (0, 1), (CW - 1, 0), (CW - 2, 0), (CW - 1, 1),
                   (0, CH - 1), (1, CH - 1), (0, CH - 2), (CW - 1, CH - 1), (CW - 2, CH - 1), (CW - 1, CH - 2)]:
        put(img, x, y, (0, 0, 0, 0))
    for (x, y) in [(1, 1), (CW - 2, 1), (1, CH - 2), (CW - 2, CH - 2)]:
        put(img, x, y, 'out')


def card_back():
    img = new(CW, CH, 'n1')
    d = draw(img)
    d.rectangle([0, 0, CW - 1, CH - 1], outline=c('out'))
    d.rectangle([1, 1, CW - 2, CH - 2], outline=c('n2'))
    d.rectangle([2, 2, CW - 3, CH - 3], outline=c('au1'))
    d.rectangle([3, 3, CW - 4, CH - 4], outline=c('au0'))
    # inner dotted frame
    for x in range(6, CW - 6):
        if x % 2 == 0:
            put(img, x, 6, 'au0')
    for y in range(6, CH // 2):
        if y % 2 == 0:
            put(img, 6, y, 'au0')
    # corner moons (top-left, mirrored/rotated later)
    for p in [(9, 9), (10, 8), (11, 8), (8, 10), (8, 11), (9, 12)]:
        put(img, *p, 'au1')
    put(img, 10, 10, 'au2')
    # small stars scattered (top-left quadrant)
    for (x, y) in [(15, 14), (10, 22), (18, 26), (13, 33), (20, 9), (8, 30)]:
        put(img, x, y, 'star' if (x + y) % 2 else 'au0')
    # ring around the centre motif
    cx, cy = 23.5, 39.5
    for a in range(0, 360, 2):
        x = cx + 15 * math.cos(math.radians(a))
        y = cy + 15 * math.sin(math.radians(a))
        if y < CH / 2:
            put(img, round(x - .01), round(y - .01), 'au0')
    for a in range(0, 360, 10):
        x = cx + 17 * math.cos(math.radians(a))
        y = cy + 17 * math.sin(math.radians(a))
        if y < CH / 2:
            put(img, round(x - .01), round(y - .01), 'au1')
    # rays from ring to edge (top)
    for k in range(3):
        put(img, 23, 20 - k * 3, 'au1')
    put(img, 23, 9, 'au2')
    put(img, 22, 9, 'au1')
    put(img, 23, 8, 'au1')
    # crescent cupping the lantern from above (horns down)
    for y in range(20, 30):
        for x in range(10, 24):
            d1 = (x - cx) ** 2 + (y - 31) ** 2
            d2 = (x - cx) ** 2 + (y - 33.5) ** 2
            if d1 <= 9.5 ** 2 and d2 > 9.5 ** 2 and y < 31:
                put(img, x, y, 'au1' if y > 22 else 'au2')
    # lantern (top half; rotated copy forms the bottom)
    for p in [(22, 29), (22, 28), (23, 27)]:          # hanging ring
        put(img, *p, 'au1')
    d.line([(22, 30), (23, 30)], fill=c('au1'))       # roof
    d.line([(20, 31), (23, 31)], fill=c('au1'))
    d.line([(18, 32), (23, 32)], fill=c('au0'))
    put(img, 23, 31, 'au2')
    d.rectangle([19, 33, 23, 39], fill=c('au0'))      # frame
    d.rectangle([20, 34, 23, 39], fill=c('f1'))       # glass
    d.line([(21, 34), (21, 39)], fill=c('au0'))       # frame bar
    for p in [(23, 36), (23, 37), (22, 38), (23, 38), (22, 39), (23, 39)]:
        put(img, *p, 'f2')
    mirror_lr(img)
    rot180_half(img)
    rounded_border(img)
    return img


def card_frame():
    img = new(CW, CH, 'cr')
    d = draw(img)
    d.rectangle([0, 0, CW - 1, CH - 1], outline=c('out'))
    d.rectangle([1, 1, CW - 2, CH - 2], outline=c('au1'))
    # art window x4..43, y4..63 (transparent) with gold line around it
    d.rectangle([3, 3, 44, 64], outline=c('au0'))
    d.rectangle([4, 4, 43, 63], fill=(0, 0, 0, 0))
    # name band y66..76 (plain cream) with gold border
    d.line([(3, 65), (44, 65)], fill=c('au1'))
    d.line([(3, 77), (44, 77)], fill=c('au0'))
    d.line([(3, 65), (3, 77)], fill=c('au0'))
    d.line([(44, 65), (44, 77)], fill=c('au0'))
    d.rectangle([4, 66, 43, 76], fill=c('cr'))
    for p in [(2, 2), (CW - 3, 2)]:
        put(img, *p, 'au2')
    rounded_border(img)
    return img


# ------------------------------------------------------------------ icons
def icon_wands():
    img = new(16, 16)
    for k in range(12):
        x, y = 2 + k * 0.85, 14 - k
        put(img, round(x), round(y), 'w2')
        put(img, round(x) + 1, round(y), 'w3')
    put(img, 2, 14, 'w1')
    put(img, 3, 14, 'w2')
    for p in [(7, 7), (6, 6), (5, 6), (6, 5)]:
        put(img, *p, 'g3')
    for p in [(11, 6), (12, 6), (13, 5), (12, 7)]:
        put(img, *p, 'g4')
    for p in [(12, 2), (13, 1), (13, 2), (12, 1)]:
        put(img, *p, 'g4')
    put(img, 13, 3, 'g3')
    put(img, 5, 5, 'g4')
    put(img, 9, 9, 'au1')
    put(img, 10, 9, 'au2')
    return outline(img)


def icon_cups():
    img = new(16, 16)
    d = draw(img)
    for y in range(2, 9):
        hw = 5 - max(0, y - 5)
        for x in range(8 - hw, 8 + hw):
            col = 'au1'
            if x < 8 - hw + 2:
                col = 'au0'
            elif x >= 8 + hw - 2:
                col = 'au2'
            put(img, x, y, col)
    d.line([(3, 2), (12, 2)], fill=c('au2'))
    d.line([(4, 3), (11, 3)], fill=c('t0'))
    put(img, 9, 3, 't1')
    d.rectangle([7, 9, 8, 11], fill=c('au1'))
    put(img, 7, 9, 'au0')
    d.rectangle([5, 12, 10, 13], fill=c('au1'))
    d.line([(5, 13), (10, 13)], fill=c('au0'))
    put(img, 9, 12, 'au2')
    put(img, 7, 5, 't1')
    return outline(img)


def icon_swords():
    img = new(16, 16)
    d = draw(img)
    d.rectangle([7, 2, 8, 10], fill=c('h1'))
    d.line([(8, 2), (8, 10)], fill=c('h2'))
    put(img, 7, 1, 'h2')
    put(img, 8, 1, 'h2')
    d.line([(3, 11), (12, 11)], fill=c('au1'))
    put(img, 3, 10, 'au0')
    put(img, 12, 10, 'au2')
    d.rectangle([7, 12, 8, 13], fill=c('w2'))
    put(img, 8, 12, 'w3')
    d.rectangle([7, 14, 8, 14], fill=c('au1'))
    put(img, 8, 14, 'au2')
    return outline(img)


def icon_pentacles():
    img = new(16, 16)
    cx, cy = 7.5, 7.5
    for y in range(16):
        for x in range(16):
            dd = math.hypot(x - cx, y - cy)
            if dd <= 6.6:
                col = 'au1'
                if dd > 5.6:
                    col = 'au0' if x < cx else 'au2'
                put(img, x, y, col)
    pts = []
    for k in range(5):
        a = -math.pi / 2 + k * 2 * math.pi / 5
        pts.append((cx + 4.2 * math.cos(a), cy + 4.4 * math.sin(a)))
    d = draw(img)
    order = [0, 2, 4, 1, 3, 0]
    for i in range(5):
        a, b = pts[order[i]], pts[order[i + 1]]
        d.line([(round(a[0]), round(a[1])), (round(b[0]), round(b[1]))], fill=c('w2'))
    return outline(img)


def icon_major_star():
    img = new(16, 16)
    cx, cy = 7.5, 7.5
    for y in range(16):
        for x in range(16):
            dx, dy = abs(x - cx), abs(y - cy)
            # 4 long rays + 4 short diagonal rays
            long_ray = (dx < 1 and dy < 7.6) or (dy < 1 and dx < 7.6)
            body = dx + dy < 3.6
            diag = abs(dx - dy) < .9 and dx < 4.2
            if long_ray or body or diag:
                col = 'au1'
                if body:
                    col = 'au2'
                if dx < 1 and dy < 1:
                    col = 'f2'
                if (long_ray and max(dx, dy) > 5.5) or (diag and dx > 3):
                    col = 'au0' if (x < cx or y > cy) else 'au1'
                put(img, x, y, col)
    return outline(img)


def build():
    save(card_back(), 'cards/card_back.png')
    save(card_frame(), 'cards/card_frame.png')
    save(icon_wands(), 'cards/suit_wands.png')
    save(icon_cups(), 'cards/suit_cups.png')
    save(icon_swords(), 'cards/suit_swords.png')
    save(icon_pentacles(), 'cards/suit_pentacles.png')
    save(icon_major_star(), 'cards/major_star.png')


if __name__ == '__main__':
    build()
    print('cards ok')
