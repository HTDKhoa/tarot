"""Soát quy tắc pixel art cho tranh lá bài (đọc <slug>.png đã ghép; tọa độ theo ô tranh).

    python art/rws_lint.py               # mọi lá
    python art/rws_lint.py the-star -v   # một lá, in tọa độ từng lỗi

Báo:
  màu ngoài bảng   pixel không thuộc 32 màu
  pixel lẻ         khác màu cả 8 pixel quanh nó (bỏ qua trời đã dither và hộp LINT_OK)
  mực lọt mảng     pixel mực mà quanh nó chỉ một màu, không phải ranh giới hai chất liệu
"""
import os
import sys

from PIL import Image

import rws
from rws_prep import ART, COLORS, OUT

INK = (22, 12, 28, 255)
PALETTE = {c + (255,) for c in COLORS}


def lint(slug):
    card = rws.load(slug)
    im = Image.open(os.path.join(OUT, f'{slug}.png')).convert('RGBA')
    px = im.load()
    sky = Image.open(os.path.join(OUT, '_base', f'{slug}_sky.png')).load()
    ok = getattr(card, 'LINT_OK', [])
    x0, y0, w, h = ART
    issues = {'màu ngoài bảng': [], 'pixel lẻ': [], 'mực lọt mảng': []}
    used = set()
    for y in range(y0, y0 + h):
        for x in range(x0, x0 + w):
            p = px[x, y]
            used.add(p)
            if p not in PALETTE:
                issues['màu ngoài bảng'].append((x - x0, y - y0))
                continue
            ax, ay = x - x0, y - y0
            if sky[ax, ay] or any(a <= ax <= c and b <= ay <= d for a, b, c, d in ok):
                continue
            nb = [px[x + dx, y + dy] for dy in (-1, 0, 1) for dx in (-1, 0, 1)
                  if (dx or dy) and x0 <= x + dx < x0 + w and y0 <= y + dy < y0 + h]
            if p not in nb:
                issues['pixel lẻ'].append((ax, ay))
            if p == INK:
                others = {q for q in nb if q != INK}
                if len(others) == 1 and sum(q == INK for q in nb) <= 2:
                    issues['mực lọt mảng'].append((ax, ay))
    return issues, len(used)


def main():
    args = [a for a in sys.argv[1:] if not a.startswith('-')]
    verbose = '-v' in sys.argv
    total = 0
    for slug in args or rws.slugs():
        issues, ncol = lint(slug)
        n = sum(len(v) for v in issues.values())
        total += n
        print(f'{slug}: {ncol} màu, ' + ', '.join(f'{k} {len(v)}' for k, v in issues.items()))
        if verbose:
            for k, v in issues.items():
                if v:
                    print(f'  {k}: ' + ' '.join(f'{x},{y}' for x, y in v))
    sys.exit(1 if total else 0)


if __name__ == '__main__':
    main()
