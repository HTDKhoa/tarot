"""Build every web asset, write manifest.json and the preview sheet.

    python3 art/build_all.py
"""
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from PIL import Image, ImageChops, ImageDraw, ImageFont
from common import ROOT, PAL, PAL_LIST
import forest
import interior
import characters
import cards

PREVIEW = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'preview.png')


def load(rel):
    return Image.open(os.path.join(ROOT, rel)).convert('RGBA')


def add_glow(base_rgba, glows):
    """glows: list of (rel, (x, y)). Simple additive glow, as the engine would before bloom."""
    g = Image.new('RGBA', base_rgba.size)
    for rel, pos in glows:
        g.alpha_composite(load(rel), pos)
    rgb = Image.composite(g.convert('RGB'), Image.new('RGB', g.size), g.split()[3])
    return ImageChops.add(base_rgba.convert('RGB'), rgb.point(lambda v: int(v * .55)))


def forest_scene():
    im = load('forest/sky.png')
    im.alpha_composite(load('forest/far.png'))
    im.alpha_composite(load('forest/mid.png'))
    im.alpha_composite(load('forest/house.png'), forest.HOUSE_POS)
    im.alpha_composite(load('forest/ground.png'))
    im.alpha_composite(load('forest/near.png'))
    return add_glow(im, [('forest/sky_glow.png', (0, 0)), ('forest/house_glow.png', forest.HOUSE_POS),
                         ('forest/near_glow.png', (0, 0))])


def interior_scene():
    a = json.load(open(os.path.join(ROOT, 'characters/anchors.json')))
    kx = 240
    ky = interior.TABLE_Y - characters.KH + 1        # hands rest on the table's far edge
    ox, oy = a['owl_sprite_offset_in_keeper']
    im = load('interior/room.png')
    im.alpha_composite(load('characters/keeper_idle_0.png'), (kx, ky))
    im.alpha_composite(load('characters/owl_idle_0.png'), (kx + ox, ky + oy))
    im.alpha_composite(load('interior/table.png'), (0, interior.TABLE_Y))
    cx, cy = interior.CANDLE_POS
    im.alpha_composite(load('interior/candle.png'), (cx, cy))
    fx = cx + interior.WICK[0] - interior.FLAME_BASE[0]
    fy = cy + interior.WICK[1] - interior.FLAME_BASE[1] + 1
    im.alpha_composite(load('interior/flame_0.png'), (fx, fy))
    im.alpha_composite(load('interior/crystal.png'), interior.CRYSTAL_POS)
    return add_glow(im, [('interior/room_glow.png', (0, 0)),
                         ('characters/keeper_glow.png', (kx, ky)),
                         ('characters/owl_glow.png', (kx + ox, ky + oy)),
                         ('interior/flame_0.png', (fx, fy)),
                         ('interior/crystal_glow.png', interior.CRYSTAL_POS)])


def cards_row():
    row = Image.new('RGBA', (640, 100), PAL['out'] + (255,))
    x = 12
    for rel in ['cards/card_back.png', 'cards/card_frame.png']:
        row.alpha_composite(load(rel), (x, 10))
        x += 58
    # a card front with the window filled, to show how art sits inside
    demo = Image.new('RGBA', (48, 80))
    ImageDraw.Draw(demo).rectangle([4, 4, 43, 63], fill=PAL['n2'] + (255,))
    demo.alpha_composite(load('cards/card_frame.png'))
    demo.alpha_composite(load('cards/major_star.png'), (16, 26))
    row.alpha_composite(demo, (x, 10))
    x += 66
    for rel in ['cards/suit_wands.png', 'cards/suit_cups.png', 'cards/suit_swords.png', 'cards/suit_pentacles.png', 'cards/major_star.png']:
        row.alpha_composite(load(rel), (x, 42))
        x += 26
    x += 10
    for i in range(4):
        row.alpha_composite(load(f'characters/owl_idle_{i}.png'), (x, 28))
        x += 44
    for i in range(4):
        row.alpha_composite(load(f'interior/flame_{i}.png'), (x, 42))
        x += 14
    row.alpha_composite(load('interior/candle.png'), (x + 4, 30))
    return row


def write_manifest():
    files = []
    for dp, _, fns in os.walk(ROOT):
        for fn in sorted(fns):
            if fn == 'manifest.json':
                continue
            rel = os.path.relpath(os.path.join(dp, fn), ROOT)
            entry = {'path': rel}
            if fn.endswith('.png'):
                w, h = Image.open(os.path.join(dp, fn)).size
                entry.update(w=w, h=h)
                if '_glow' in fn:
                    entry['kind'] = 'glow'
            files.append(entry)
    files.sort(key=lambda e: e['path'])
    m = {
        'pixel_scale': 1,
        'filter': 'nearest',
        'palette': ['#%02x%02x%02x' % p for p in PAL_LIST],
        'files': files,
        'layout': {
            'forest': {'frame': [640, 360], 'order': ['sky', 'far', 'mid', 'house', 'ground', 'near'],
                       'house_pos': list(forest.HOUSE_POS),
                       'full_frame_layers_at': [0, 0]},
            'interior': {'frame': [640, 360], 'table_pos': [0, interior.TABLE_Y],
                         'keeper_pos': [240, interior.TABLE_Y - characters.KH + 1],
                         'candle_pos': list(interior.CANDLE_POS),
                         'flame_offset_in_candle': [interior.WICK[0] - interior.FLAME_BASE[0], interior.WICK[1] - interior.FLAME_BASE[1] + 1],
                         'crystal_pos': list(interior.CRYSTAL_POS)},
            'card_frame': {'art_window': [4, 4, 43, 63], 'name_band': [4, 66, 43, 76]},
        },
    }
    with open(os.path.join(ROOT, 'manifest.json'), 'w') as f:
        json.dump(m, f, indent=2, ensure_ascii=False)
    return files


def main():
    forest.build()
    interior.build()
    characters.build()
    cards.build()
    files = write_manifest()
    fs, ins, cr = forest_scene(), interior_scene(), cards_row().convert('RGB')
    gap = 8
    sheet = Image.new('RGB', (640, 360 * 2 + 100 + gap * 2), PAL['out'])
    sheet.paste(fs, (0, 0))
    sheet.paste(ins, (0, 360 + gap))
    sheet.paste(cr, (0, 720 + gap * 2))
    sheet = sheet.resize((sheet.width * 2, sheet.height * 2), Image.NEAREST)
    sheet.save(PREVIEW)
    print(len(files), 'files ->', ROOT)
    print('preview ->', PREVIEW, sheet.size)


if __name__ == '__main__':
    main()
