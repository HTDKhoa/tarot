"""Đè một vùng của lá mẫu (reference/) lên tranh của mình để soát tỷ lệ.

    python art/rws_overlay.py four-of-cups ../reference/4.jpg --ref 520 160 585 240 --at 52 62

--ref là hộp (x0 y0 x1 y1) trong ảnh mẫu, --at là góc trên-trái (theo ô tranh) đặt hộp đó,
--k là tỉ lệ co ảnh mẫu (mặc định 1). Ghi ra art/aseprite/cards/_view/<slug>_overlay.png gồm ba
khung phóng to cùng lưới: tranh của mình, đè 50%, ảnh mẫu đã căn.
Ảnh mẫu là tác phẩm thương mại: chỉ dùng để học, không đưa vào asset.
"""
import argparse
import os

from PIL import Image, ImageDraw

from rws_prep import ART, OUT


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('slug')
    ap.add_argument('ref')
    ap.add_argument('--ref', dest='box', type=int, nargs=4, required=True)
    ap.add_argument('--at', type=int, nargs=2, required=True)
    ap.add_argument('--k', type=float, default=1.0)
    ap.add_argument('--scale', type=int, default=8)
    a = ap.parse_args()

    x0, y0, w, h = ART
    ours = Image.open(os.path.join(OUT, f'{a.slug}.png')).convert('RGBA').crop((x0, y0, x0 + w, y0 + h))
    ref = Image.open(a.ref).convert('RGBA').crop(a.box)
    ref = ref.resize((round(ref.width * a.k), round(ref.height * a.k)), Image.LANCZOS)
    ax, ay = a.at
    bx1, by1 = min(w, ax + ref.width), min(h, ay + ref.height)
    box = (ax, ay, bx1, by1)
    mine = ours.crop(box)
    theirs = Image.new('RGBA', mine.size)
    theirs.alpha_composite(ref.crop((0, 0, mine.width, mine.height)))
    blend = Image.blend(mine, theirs, 0.5)

    s, pad = a.scale, 24
    bw, bh = mine.width * s, mine.height * s
    sheet = Image.new('RGB', (bw * 3 + pad * 4, bh + pad * 2), (24, 18, 30))
    d = ImageDraw.Draw(sheet)
    for i, im in enumerate((mine, blend, theirs)):
        ox = pad + i * (bw + pad)
        sheet.paste(im.convert('RGB').resize((bw, bh), Image.NEAREST), (ox, pad))
        for X in range(box[0], box[2] + 1):
            if X % 5 == 0:
                d.line([(ox + (X - box[0]) * s, pad), (ox + (X - box[0]) * s, pad + bh)],
                       fill=(255, 0, 255) if X % 10 == 0 else (90, 90, 90))
                if X % 10 == 0:
                    d.text((ox + (X - box[0]) * s + 2, 4), str(X), fill=(255, 255, 255))
        for Y in range(box[1], box[3] + 1):
            if Y % 5 == 0:
                d.line([(ox, pad + (Y - box[1]) * s), (ox + bw, pad + (Y - box[1]) * s)],
                       fill=(255, 0, 255) if Y % 10 == 0 else (90, 90, 90))
                if Y % 10 == 0 and i == 0:
                    d.text((2, pad + (Y - box[1]) * s + 2), str(Y), fill=(255, 255, 255))
    out = os.path.join(OUT, '_view', f'{a.slug}_overlay.png')
    os.makedirs(os.path.dirname(out), exist_ok=True)
    sheet.save(out)
    print(out, sheet.size)


if __name__ == '__main__':
    main()
