"""Xem tranh lá bài phóng to có lưới tọa độ, đặt cạnh scan, để đặt mảng vẽ tay.

    python art/rws_view.py the-magician                      # cả ô tranh, bản đã vẽ
    python art/rws_view.py the-magician --base               # bản nền chưa vẽ tay
    python art/rws_view.py the-magician --box 30 20 70 60    # một vùng, theo tọa độ ô tranh
    python art/rws_view.py the-magician --scale 12

Ghi ra art/aseprite/cards/_view/<slug>.png.
"""
import argparse
import os

from PIL import Image, ImageDraw

import rws
from rws_prep import ART, CW, CH, OUT, SRC


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('slug')
    ap.add_argument('--base', action='store_true')
    ap.add_argument('--box', type=int, nargs=4)
    ap.add_argument('--scale', type=int)
    ap.add_argument('--out')
    a = ap.parse_args()

    card = rws.load(a.slug)
    x0, y0, w, h = ART
    if a.base:
        art = Image.new('RGBA', (CW, CH))
        art.alpha_composite(Image.open(os.path.join(OUT, '_base', f'{a.slug}_art.png')).convert('RGBA'), (x0, y0))
    else:
        art = Image.open(os.path.join(OUT, f'{a.slug}.png')).convert('RGBA')
    ax0, ay0, ax1, ay1 = a.box or (0, 0, w - 1, h - 1)
    bx0, by0, bx1, by1 = ax0 + x0, ay0 + y0, ax1 + x0, ay1 + y0
    bw, bh = bx1 - bx0 + 1, by1 - by0 + 1
    s = a.scale or max(4, min(16, 1000 // max(bw, bh)))

    # scan: cùng vùng, quy từ tọa độ lá sang tọa độ ảnh scan
    cx0, cy0, cx1, cy1 = card.CROP
    fx, fy = (cx1 - cx0) / w, (cy1 - cy0) / h
    scan = Image.open(os.path.join(SRC, card.SCAN)).convert('RGB')
    sb = (cx0 + (bx0 - x0) * fx, cy0 + (by0 - y0) * fy, cx0 + (bx1 + 1 - x0) * fx, cy0 + (by1 + 1 - y0) * fy)
    scan = scan.crop(tuple(int(v) for v in sb)).resize((bw * s, bh * s), Image.LANCZOS)

    crop = art.crop((bx0, by0, bx1 + 1, by1 + 1))
    bg = Image.new('RGBA', crop.size, (255, 0, 255, 255))
    bg.alpha_composite(crop)
    big = bg.convert('RGB').resize((bw * s, bh * s), Image.NEAREST)

    pad = 28
    sheet = Image.new('RGB', (bw * s * 2 + pad * 3, bh * s + pad * 2), (24, 18, 30))
    sheet.paste(scan, (pad, pad))
    ox = bw * s + pad * 2
    sheet.paste(big, (ox, pad))
    d = ImageDraw.Draw(sheet)
    for i in range(bw + 1):
        X = ax0 + i
        col = (255, 255, 255) if X % 10 == 0 else (60, 50, 70)
        if s >= 6 or X % 10 == 0:
            d.line([(ox + i * s, pad), (ox + i * s, pad + bh * s)], fill=col, width=1)
        if X % 5 == 0:
            d.line([(pad + i * s, pad), (pad + i * s, pad + bh * s)], fill=(255, 0, 255) if X % 10 == 0 else (0, 160, 0), width=1)
        if X % 10 == 0:
            d.text((ox + i * s + 1, 4), str(X), fill=(255, 255, 255))
            d.text((pad + i * s + 1, 4), str(X), fill=(200, 200, 200))
    for j in range(bh + 1):
        Y = ay0 + j
        col = (255, 255, 255) if Y % 10 == 0 else (60, 50, 70)
        if s >= 6 or Y % 10 == 0:
            d.line([(ox, pad + j * s), (ox + bw * s, pad + j * s)], fill=col, width=1)
        if Y % 5 == 0:
            d.line([(pad, pad + j * s), (pad + bw * s, pad + j * s)], fill=(255, 0, 255) if Y % 10 == 0 else (0, 160, 0), width=1)
        if Y % 10 == 0:
            d.text((ox - 24, pad + j * s + 1), str(Y), fill=(255, 255, 255))
            d.text((2, pad + j * s + 1), str(Y), fill=(200, 200, 200))
    out = a.out or os.path.join(OUT, '_view', f'{a.slug}{"_base" if a.base else ""}.png')
    os.makedirs(os.path.dirname(out), exist_ok=True)
    sheet.save(out)
    print(out, sheet.size)


if __name__ == '__main__':
    main()
