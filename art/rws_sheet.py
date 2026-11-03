"""Bảng so sánh một nhóm lá để duyệt: hàng scan, hàng 1× (cỡ thật trên bàn), hàng 3× (thư viện).

    python art/rws_sheet.py mau the-magician the-star four-of-cups

Ghi ra art/aseprite/cards/_sheets/<tên nhóm>.png.
"""
import os
import sys

from PIL import Image, ImageDraw

import rws
from rws_prep import CW, CH, OUT, SRC

BG = (24, 18, 30)


def main():
    name, slugs = sys.argv[1], sys.argv[2:]
    gap, s = 16, 3
    col_w = CW * s + gap
    width = gap + col_w * len(slugs)
    height = gap + 20 + CH * s + gap + CH + gap + CH * s + gap
    sheet = Image.new('RGB', (width, height), BG)
    d = ImageDraw.Draw(sheet)
    for i, slug in enumerate(slugs):
        card = rws.load(slug)
        x = gap + i * col_w
        d.text((x, gap), slug, fill=(235, 222, 190))
        y = gap + 20
        scan = Image.open(os.path.join(SRC, card.SCAN)).convert('RGB')
        scan.thumbnail((CW * s, CH * s), Image.LANCZOS)
        sheet.paste(scan, (x, y))
        y += CH * s + gap
        im = Image.open(os.path.join(OUT, f'{slug}.png')).convert('RGBA')
        bg = Image.new('RGBA', im.size, BG + (255,))
        bg.alpha_composite(im)
        sheet.paste(bg.convert('RGB'), (x, y))
        y += CH + gap
        sheet.paste(bg.convert('RGB').resize((CW * s, CH * s), Image.NEAREST), (x, y))
    out = os.path.join(OUT, '_sheets', f'{name}.png')
    os.makedirs(os.path.dirname(out), exist_ok=True)
    sheet.save(out)
    print(out, sheet.size)


if __name__ == '__main__':
    main()
