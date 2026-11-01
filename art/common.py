"""Shared palette + helpers for the tarot-web HD-2D pixel assets.

Every saved sprite is snapped to PAL (binary alpha, nearest palette colour),
so the whole asset set shares one ~43 colour palette.
"""
import os
import random
from PIL import Image, ImageDraw

import os
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'public', 'assets')

PAL = {
    'out': (22, 12, 28),            # #160c1c outline / deepest shadow
    # night navy ramp
    'n0': (12, 14, 34), 'n1': (20, 24, 50), 'n2': (30, 36, 70), 'n3': (46, 54, 98), 'n4': (70, 80, 130),
    # plum ramp
    'p0': (44, 20, 44), 'p1': (70, 30, 66), 'p2': (98, 48, 92),
    # violet / lavender (sky horizon, far hills)
    'v1': (62, 46, 96), 'v2': (92, 78, 130),
    # moss ramp
    'g0': (14, 24, 30), 'g1': (22, 40, 44), 'g2': (34, 58, 56), 'g3': (54, 84, 66), 'g4': (86, 116, 76),
    # wood ramp
    'w0': (36, 24, 30), 'w1': (60, 38, 36), 'w2': (90, 60, 46), 'w3': (126, 88, 60),
    # stone
    's1': (72, 70, 92), 's2': (110, 108, 130),
    # silver hair
    'h1': (160, 162, 192), 'h2': (206, 210, 228),
    # skin + lip
    'k0': (150, 96, 100), 'k1': (196, 148, 138), 'k2': (226, 190, 172), 'lip': (150, 64, 78),
    # owl browns
    'o0': (82, 68, 62), 'o1': (122, 108, 96), 'o2': (162, 148, 130), 'o3': (214, 204, 186),
    # gold
    'au0': (150, 112, 52), 'au1': (214, 172, 80), 'au2': (246, 216, 140),
    # flame / amber
    'f0': (232, 140, 50), 'f1': (255, 200, 90), 'f2': (255, 246, 214),
    # teal gem
    't0': (60, 140, 140), 't1': (120, 230, 210),
    # cream, moon, star
    'cr': (235, 222, 190), 'moon': (240, 236, 200), 'star': (190, 206, 255),
}
PAL_LIST = list(dict.fromkeys(PAL.values()))

BAYER = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]]


def c(name):
    return PAL[name] + (255,)


def new(w, h, fill=None):
    return Image.new('RGBA', (w, h), c(fill) if fill else (0, 0, 0, 0))


def bayer(x, y, f):
    """True when an ordered-dither pixel at (x,y) should take the 'upper' colour for fraction f."""
    return f > (BAYER[y % 4][x % 4] + 0.5) / 16


def put(img, x, y, col):
    if 0 <= x < img.width and 0 <= y < img.height:
        img.putpixel((int(x), int(y)), c(col) if isinstance(col, str) else col)


def get_a(img, x, y):
    if 0 <= x < img.width and 0 <= y < img.height:
        return img.getpixel((x, y))[3]
    return 0


def outline(img, col='out', diag=False):
    """1px outline around every opaque region (4-neighbour by default)."""
    w, h = img.size
    src = img.load()
    out = img.copy()
    op = out.load()
    nb = [(1, 0), (-1, 0), (0, 1), (0, -1)]
    if diag:
        nb += [(1, 1), (-1, -1), (1, -1), (-1, 1)]
    oc = c(col)
    for y in range(h):
        for x in range(w):
            if src[x, y][3] == 0:
                for dx, dy in nb:
                    nx, ny = x + dx, y + dy
                    if 0 <= nx < w and 0 <= ny < h and src[nx, ny][3] > 0:
                        op[x, y] = oc
                        break
    return out


_cache = {}


def nearest(rgb):
    if rgb not in _cache:
        _cache[rgb] = min(PAL_LIST, key=lambda p: (p[0] - rgb[0]) ** 2 * 3 + (p[1] - rgb[1]) ** 2 * 4 + (p[2] - rgb[2]) ** 2 * 2)
    return _cache[rgb]


def snap(img, opaque=False):
    img = img.convert('RGBA')
    px = img.load()
    for y in range(img.height):
        for x in range(img.width):
            r, g, b, a = px[x, y]
            if opaque or a >= 128:
                px[x, y] = nearest((r, g, b)) + (255,)
            else:
                px[x, y] = (0, 0, 0, 0)
    return img


SAVED = []


def save(img, rel, opaque=False):
    img = snap(img, opaque)
    path = os.path.join(ROOT, rel)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    img.save(path)
    SAVED.append(rel)
    return img


def glow_from(img, cols):
    """Build a glow layer from the pixels of img whose colour is one of cols."""
    want = {PAL[k] for k in cols}
    g = new(*img.size)
    sp, gp = img.load(), g.load()
    for y in range(img.height):
        for x in range(img.width):
            p = sp[x, y]
            if p[3] and p[:3] in want:
                gp[x, y] = p
    return g


def mirror_lr(img):
    """Copy left half onto the right half, mirrored (for symmetric icons)."""
    w = img.width
    left = img.crop((0, 0, w // 2, img.height))
    img.paste(left.transpose(Image.FLIP_LEFT_RIGHT), (w - w // 2, 0))
    return img


def rot180_half(img):
    """Copy top half onto the bottom half rotated 180 deg."""
    h = img.height
    top = img.crop((0, 0, img.width, h // 2))
    img.paste(top.transpose(Image.ROTATE_180), (0, h - h // 2))
    return img


def draw(img):
    return ImageDraw.Draw(img)


def rng(seed):
    return random.Random(seed)
