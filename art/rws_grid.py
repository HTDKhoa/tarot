"""Lưới ký tự của tranh lá bài (art/rws/<slug>.txt): 125 hàng × 86 ký tự, một ký tự một pixel.

Ký tự theo KEY của rws_draw; '~' là trời: khi ghép, trời tự dither Bayer 4×4 từ tông nền
sang tông sáng dần lên mép trên theo SKY của lá, nên sửa hình trời không phải tự xếp dither.

    python art/rws_grid.py show the-star 20 30 60 70     # in vùng (x0 y0 x1 y1) kèm thước tọa độ
    python art/rws_grid.py put the-star 30 40 < khoi.txt # dán khối hàng vào (x, y); '.' giữ nguyên
"""
import os
import sys

from PIL import Image

import rws
from rws_draw import rgba, sky_char
from rws_prep import ART, SKY_CH


def path(slug):
    return os.path.join(rws.HERE, f'{slug}.txt')


def read(slug):
    with open(path(slug), encoding='utf-8') as f:
        rows = [list(r) for r in f.read().splitlines()]
    w, h = ART[2], ART[3]
    assert len(rows) == h and all(len(r) == w for r in rows), f'{slug}.txt phải là {h} hàng × {w} ký tự'
    return rows


def write(slug, rows):
    with open(path(slug), 'w', encoding='utf-8') as f:
        f.write('\n'.join(''.join(r) for r in rows) + '\n')


def image(slug, sky):
    """Lưới → ảnh RGBA cỡ ô tranh."""
    rows = read(slug)
    im = Image.new('RGBA', (ART[2], ART[3]))
    px = im.load()
    for y, r in enumerate(rows):
        for x, ch in enumerate(r):
            px[x, y] = rgba(sky_char(sky, x, y) if ch == SKY_CH else ch)
    return im


def show(slug, x0, y0, x1, y1):
    rows = read(slug)
    print('     ' + ''.join(str(x // 10 % 10) if x % 10 == 0 else ' ' for x in range(x0, x1 + 1)))
    print('     ' + ''.join(str(x % 10) for x in range(x0, x1 + 1)))
    for y in range(y0, y1 + 1):
        print(f'{y:4d} ' + ''.join(rows[y][x0:x1 + 1]))


def put(slug, x, y, block):
    rows = read(slug)
    for j, line in enumerate(block):
        for i, ch in enumerate(line):
            if ch != '.' and 0 <= y + j < len(rows) and 0 <= x + i < len(rows[0]):
                rows[y + j][x + i] = ch
    write(slug, rows)


if __name__ == '__main__':
    cmd, slug = sys.argv[1], sys.argv[2]
    nums = [int(v) for v in sys.argv[3:]]
    if cmd == 'show':
        show(slug, *(nums or [0, 0, ART[2] - 1, ART[3] - 1]))
    elif cmd == 'put':
        block = [ln.rstrip('\n') for ln in sys.stdin.read().splitlines()]
        # dòng chỉ có khoảng trắng ở đầu/cuối khối thì bỏ; khoảng trắng trong khối coi như '.'
        put(slug, nums[0], nums[1], [ln.replace(' ', '.') for ln in block])


def trace(slug, x0, y0, x1, y1, t=0.2):
    """Bản can từ scan, chưa làm gọn: mực ở ô có nét phủ trên t (thấp hơn bước nền), còn lại màu gần nhất."""
    import numpy as np
    import rws_prep as P
    from rws_draw import KEY
    card = rws.load(slug)
    src = Image.open(os.path.join(P.SRC, card.SCAN)).crop(card.CROP)
    a = np.asarray(src.convert('RGB')).astype(float)
    lab = P.to_lab(a)
    ink = lab[..., 0] < 35
    idx = P.nearest(lab)
    H, W = ink.shape
    w, h = ART[2], ART[3]
    ys = np.linspace(0, H, h + 1).astype(int)
    xs = np.linspace(0, W, w + 1).astype(int)
    inv = {P.NAMES.index(n): ch for ch, n in KEY.items()}
    print('     ' + ''.join(str(x // 10 % 10) if x % 10 == 0 else ' ' for x in range(x0, x1 + 1)))
    print('     ' + ''.join(str(x % 10) for x in range(x0, x1 + 1)))
    for y in range(y0, y1 + 1):
        row = ''
        for x in range(x0, x1 + 1):
            cell = ink[ys[y]:ys[y + 1], xs[x]:xs[x + 1]]
            if cell.mean() > t:
                row += 'o'
            else:
                c = idx[ys[y]:ys[y + 1], xs[x]:xs[x + 1]][~cell]
                row += inv[np.bincount(c, minlength=len(P.COLORS)).argmax()] if c.size else 'o'
        print(f'{y:4d} ' + row)


if __name__ == '__main__' and sys.argv[1] == 'trace':
    trace(sys.argv[2], *[int(v) for v in sys.argv[3:7]], *([float(sys.argv[7])] if len(sys.argv) > 7 else []))
