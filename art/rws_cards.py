"""Ghép tranh lá bài 96×160: lưới art/rws/<slug>.txt + lớp vẽ tay (draw/PATCHES) + khung + số.

Ghi ra art/aseprite/cards/<slug>.aseprite (các layer tách riêng để sửa tiếp
trong Aseprite), <slug>.png là ảnh cả lá và <slug>_art.png là ô tranh cho web.

Layer `sua tay` là của người vẽ trong Aseprite: nếu file .aseprite đã có, script
đọc layer đó ra bằng Aseprite CLI và ghi lại nguyên vẹn, không bao giờ ghi đè.

    python art/rws_prep.py && python art/rws_cards.py [slug ...]
"""
import json
import os
import subprocess
import sys
import tempfile

from PIL import Image

import aseprite_file
import rws
import rws_grid
from rws_draw import Canvas, KEY
from rws_prep import ART, COLORS, CW, CH, OUT, SKY_CH, SRC, frame

SKIN_TONES = {'R', 'r', 'f', 'm', 'K', 'k'}


def aseprite_exe():
    if os.environ.get('ASEPRITE'):
        return os.environ['ASEPRITE']
    cfg = os.path.expanduser('~/.config/pixel-mcp/config.json')
    if os.path.exists(cfg):
        return json.load(open(cfg))['aseprite_path']
    return 'aseprite'


def read_manual_layer(path):
    """Layer `sua tay` của file .aseprite có sẵn, hoặc ảnh trống."""
    empty = Image.new('RGBA', (CW, CH))
    if not os.path.exists(path):
        return empty
    names = subprocess.run([aseprite_exe(), '-b', '--list-layers', path], check=True, capture_output=True, text=True)
    # không có layer thì --layer sẽ xuất cả lá: phải kiểm trước
    if 'sua tay' not in names.stdout.splitlines():
        return empty
    with tempfile.TemporaryDirectory() as tmp:
        png = os.path.join(tmp, 'sua_tay.png')
        subprocess.run([aseprite_exe(), '-b', path, '--layer', 'sua tay', '--save-as', png],
                       check=True, capture_output=True)
        if not os.path.exists(png):
            return empty
        im = Image.open(png).convert('RGBA')
        if im.size != (CW, CH):
            raise SystemExit(f'{path}: layer "sua tay" xuất ra {im.size}, cần {(CW, CH)}')
        return im


def skin_pass(c, box, seeds):
    """Làm phẳng một mảng da về tông giữa; mép giáp nét mực bên phải/dưới tối, trái/trên sáng."""
    region = c.fill(*seeds[0], 'K', box=box, members=SKIN_TONES)
    for s in seeds[1:]:
        region |= c.fill(*s, 'K', box=box, members=SKIN_TONES | {'K'})
    for (x, y) in region:
        if c.get(x + 1, y) == 'o' or c.get(x, y + 1) == 'o':
            c.px(x, y, 'm')
        elif c.get(x - 1, y) == 'o' or c.get(x, y - 1) == 'o':
            c.px(x, y, 'k')


def numeral_layer(slug):
    im = Image.new('RGBA', (CW, CH))
    n = Image.open(os.path.join(OUT, '_base', f'{slug}_numeral.png'))
    if n.width > 1:
        im.alpha_composite(n, ((CW - n.width) // 2, ART[1]))
    return im


def build(slug):
    card = rws.load(slug)
    x0, y0, w, h = ART
    base = Image.new('RGBA', (CW, CH))
    base.alpha_composite(rws_grid.image(slug, card.SKY), (x0, y0))
    ref = Image.new('RGBA', (CW, CH))
    ref.alpha_composite(Image.open(os.path.join(SRC, card.SCAN)).convert('RGBA').crop(card.CROP).resize((w, h), Image.BOX), (x0, y0))

    hand = Image.new('RGBA', (CW, CH))
    grid = rws_grid.read(slug)
    c = Canvas(base, hand, ART, card.SKY, [(x, y) for y, r in enumerate(grid) for x, ch in enumerate(r) if ch == SKY_CH])
    if getattr(card, 'TRACE', False):
        import rws_trace
        c.mat = rws_trace.material_sets(card, slug)      # {chất liệu: pixel} để tô chất liệu trong draw()
    for box, seeds in getattr(card, 'SKIN', []):
        skin_pass(c, box, seeds)
    for box, mapping in getattr(card, 'RECOLOR', []):
        c.replace(box, mapping)
    for px0, py0, rows in getattr(card, 'PATCHES', []):
        c.rows(px0, py0, rows)
    if hasattr(card, 'draw'):
        card.draw(c)

    sky = Image.new('L', (w, h))
    for p in c.sky:
        sky.putpixel(p, 255)
    sky.save(os.path.join(OUT, '_base', f'{slug}_sky.png'))   # cho rws_lint

    path = os.path.join(OUT, f'{slug}.aseprite')
    manual = read_manual_layer(path)
    layers = [('tham chieu scan', ref, False), ('luoi', base, True), ('ve tay', hand, True),
              ('sua tay', manual, True), ('khung', frame(), True), ('so', numeral_layer(slug), True)]
    aseprite_file.write(path, (CW, CH), layers, COLORS)
    flat = Image.new('RGBA', (CW, CH))
    for _, im, visible in layers:
        if visible:
            flat.alpha_composite(im)
    flat.save(os.path.join(OUT, f'{slug}.png'))
    # bản cho web: chỉ ô tranh (kèm số), để lá ngược xoay tranh mà dải tên vẫn nằm dưới; khung dùng chung
    flat.crop((x0, y0, x0 + w, y0 + h)).save(os.path.join(OUT, f'{slug}_art.png'))
    frame().save(os.path.join(OUT, '_frame.png'))
    return flat


if __name__ == '__main__':
    assert len(KEY) == len(COLORS)
    for slug in (sys.argv[1:] or rws.slugs()):
        build(slug)
        print(slug, '->', os.path.join(OUT, f'{slug}.aseprite'))
