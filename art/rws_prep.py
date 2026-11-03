"""Chuẩn bị bản nền cho tranh lá bài từ scan RWS 1910 (public domain).

Không phải tranh cuối: script cắt khung, ép về bảng màu lá bài, thu về 86×125,
làm gọn nền và dither trời, rồi sinh lưới ký tự art/rws/<slug>.txt (chỉ khi chưa có).
Từ đó lưới là bản gốc của tranh: mọi phần vẽ lại làm trên lưới (rws_grid.py).

    python art/rws_prep.py                # mọi lá có trong art/rws/
    python art/rws_prep.py the-magician   # một lá
    python art/rws_prep.py the-star --reseed   # sinh lại lưới (mất phần đã sửa tay trên lưới)

Scan đặt ở art/src/rws/ (không đưa vào git). Vùng cắt, số, trời của từng lá ở art/rws/<slug>.py.
"""
import os
import sys

import numpy as np
from PIL import Image

import rws

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, 'src', 'rws')
OUT = os.path.join(HERE, 'aseprite', 'cards')

CW, CH = 120, 200
ART = (5, 5, 110, 157)         # x, y, w, h của ô tranh trong khung
# dải tên khớp .tarot-band (bottom 4%, cao 13%): y 166–191
BAND = (round(CH * 0.83), round(CH * 0.96) - 1)

# Bảng màu lá bài: màu biểu tượng RWS, hài hòa với bảng màu web (vàng nến, kem giấy, mực tím than).
# Mỗi dải xếp tối → sáng; tên dải dùng cho bước đổ bóng.
RAMPS = {
    'ink': ['#160c1c'],
    'cr': ['#a89a86', '#d2c4a6', '#ebdebe', '#f6eed8'],
    'au': ['#8a5a26', '#d9ae55', '#f3d68b', '#fff4d6'],       # vàng nến của web (--gold, --gold-hi, --candle-cream)
    'r': ['#6a1c2a', '#b8402e', '#e0704a'],
    'or': ['#e08a3a'],
    'k': ['#a8644a', '#d48a62', '#ecb88c'],
    'g': ['#1e3a34', '#3f6438', '#76923e', '#b4c45e'],       # bóng ngả xanh đêm, sáng ngả vàng nến
    'b': ['#2e4a6e', '#4e7aa0', '#86b2c8', '#bcd8da'],
    'w': ['#3e2220', '#74402a', '#a8643a'],
    's': ['#4e4c5e', '#7e7c8e', '#b9b0c9'],                  # sáng = --muted của web
    'v': ['#5e4670', '#8a6e96'],
    # Dải 5 tông có lệch sắc (tối ngả đỏ nâu/tím, sáng ngả vàng), lấy từ lá mẫu trong reference/
    # theo lựa chọn của chủ dự án: rực và nhiều tông hơn bảng 32 màu gốc.
    'sky': ['#3a7e94', '#5ea6b8', '#7ec2cc', '#a4d8dc', '#d0eeea'],
    'cloud': ['#7e8c94', '#b0b8bc', '#d4d6d2', '#ece6da', '#fffaf0'],
    'grass': ['#2a4210', '#467018', '#6c9a1a', '#a4c018', '#d8dc3a'],
    'leaf': ['#1e2e10', '#3a5a14', '#62881a', '#9cb818', '#d4e040'],
    'bark': ['#2a140e', '#5e2412', '#8e3a18', '#bc5220', '#d88a40'],
    'gold': ['#5a2c08', '#a0560c', '#d8860e', '#f4b81c', '#fce67a'],
    'skin': ['#6a2e1c', '#a85a30', '#d88a48', '#f0b46c', '#fcd8a0'],
    'hair': ['#2e2410', '#54441a', '#7c6824', '#a08a34', '#c4ae52'],
    'tunic': ['#4a3418', '#7a5a22', '#a8862e', '#c4a83e', '#e0cc6a'],
    'sleeve': ['#5a1410', '#a01e0c', '#d8340c', '#f45a10', '#ff9a40'],
    'pants': ['#5a4a5e', '#8c7c96', '#b8a8c4', '#d8cad8', '#f4ecf0'],
}
BASE_N = 32                          # 32 màu đầu: bảng gốc, bước ép màu từ scan chỉ dùng phần này
NAMES, COLORS = [], []
for ramp, cols in RAMPS.items():
    for i, h in enumerate(cols):
        NAMES.append((ramp, i))
        COLORS.append(tuple(int(h[k:k + 2], 16) for k in (1, 3, 5)))
PAL = np.array(COLORS, dtype=float)
INK = 0

BAYER = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]]


def to_lab(rgb):
    c = rgb / 255.0
    c = np.where(c > 0.04045, ((c + 0.055) / 1.055) ** 2.4, c / 12.92)
    m = np.array([[0.4124, 0.3576, 0.1805], [0.2126, 0.7152, 0.0722], [0.0193, 0.1192, 0.9505]])
    xyz = c @ m.T / np.array([0.9505, 1.0, 1.089])
    f = np.where(xyz > 0.008856, np.cbrt(xyz), 7.787 * xyz + 16 / 116)
    return np.stack([116 * f[..., 1] - 16, 500 * (f[..., 0] - f[..., 1]), 200 * (f[..., 1] - f[..., 2])], -1)


PAL_LAB = to_lab(PAL)


def nearest(lab):
    d = ((lab[..., None, :] - PAL_LAB) ** 2).sum(-1)
    d[..., INK] = np.inf                     # mực chỉ đến từ mặt nạ nét
    d[..., BASE_N:] = np.inf                 # dải vẽ tay không dùng khi ép màu
    return d.argmin(-1)


def convert(img, w, h, ink_t=0.6):
    """Mỗi ô ảnh lớn → một pixel: mực nếu nét phủ trên ink_t, còn lại lấy màu chiếm nhiều nhất (bỏ qua mực).

    Scan RWS tô màu bằng khuôn: mỗi mảng một màu phẳng giữa hai nét mực. Ngưỡng cao để nét
    mảnh, chấm cỏ, nét gạch bóng tan vào mảng màu; viền được vẽ lại ở outline_boundaries."""
    a = np.asarray(img.convert('RGB')).astype(float)
    lab = to_lab(a)
    ink = lab[..., 0] < 30
    idx = nearest(lab)
    H, W = ink.shape
    ys = np.linspace(0, H, h + 1).astype(int)
    xs = np.linspace(0, W, w + 1).astype(int)
    out = np.zeros((h, w), dtype=int)
    for j in range(h):
        for i in range(w):
            cell_ink = ink[ys[j]:ys[j + 1], xs[i]:xs[i + 1]]
            if cell_ink.mean() > ink_t:
                out[j, i] = INK
                continue
            cell = idx[ys[j]:ys[j + 1], xs[i]:xs[i + 1]][~cell_ink]
            out[j, i] = np.bincount(cell, minlength=len(COLORS)).argmax()
    return out


def outline_boundaries(a, min_region=6):
    """Viền mực 1 px ở chỗ hai chất liệu gặp nhau, đặt phía mảng nhỏ hơn (vật nằm trên nền).

    Mảng nhỏ hơn min_region pixel giữ màu (chi tiết nhỏ, vẽ tay sau)."""
    h, w = a.shape
    ramp = np.where(a == INK, -1, RAMP_OF[a])
    size = np.zeros_like(a)
    for _, pts in components(ramp):
        for y, x in pts:
            size[y, x] = len(pts)
    b = a.copy()
    for y in range(h):
        for x in range(w):
            if ramp[y, x] < 0 or size[y, x] < min_region:
                continue
            for yy, xx in ((y - 1, x), (y + 1, x), (y, x - 1), (y, x + 1)):
                if 0 <= yy < h and 0 <= xx < w and ramp[yy, xx] >= 0 and ramp[yy, xx] != ramp[y, x]                         and size[y, x] < size[yy, xx]:
                    b[y, x] = INK
                    break
    return b


def soften_inner_ink(a):
    """Nét mực nằm giữa một mảng cùng chất liệu → đổi thành tông tối nhất của dải đó."""
    h, w = a.shape
    b = a.copy()
    for y in range(h):
        for x in range(w):
            if a[y, x] != INK:
                continue
            ramps = set()
            for dy in (-1, 0, 1):
                for dx in (-1, 0, 1):
                    yy, xx = y + dy, x + dx
                    if 0 <= yy < h and 0 <= xx < w and a[yy, xx] != INK:
                        ramps.add(NAMES[a[yy, xx]][0])
            if len(ramps) == 1:
                r = ramps.pop()
                if r not in ('ink',) and len(RAMPS[r]) > 1:
                    b[y, x] = NAMES.index((r, 0))
    return b


def despeckle(a, passes=2):
    """Bỏ hạt giấy/bản in: pixel lẻ loi đổi sang màu chiếm đa số quanh nó (không đụng mực)."""
    h, w = a.shape
    for _ in range(passes):
        b = a.copy()
        for y in range(h):
            for x in range(w):
                if a[y, x] == INK:
                    continue
                nb = [a[yy, xx] for yy in range(max(0, y - 1), min(h, y + 2))
                      for xx in range(max(0, x - 1), min(w, x + 2)) if (yy, xx) != (y, x)]
                same = sum(1 for v in nb if v == a[y, x])
                if same <= 1:
                    vals = [v for v in nb if v != INK]
                    if vals:
                        top = max(set(vals), key=vals.count)
                        if vals.count(top) >= 4:
                            b[y, x] = top
        a = b
    return a


RAMP_OF = np.array([list(RAMPS).index(r) for r, _ in NAMES])
TONE_OF = np.array([t for _, t in NAMES])
LUM = PAL_LAB[:, 0]


def same_ramp_tone(idx, ramp):
    """Tông trong dải `ramp` có độ sáng gần màu idx nhất."""
    cand = [i for i, (r, _) in enumerate(NAMES) if r == ramp]
    return min(cand, key=lambda i: abs(LUM[i] - LUM[idx]))


def components(a, conn8=False):
    """Các cụm cùng màu: danh sách (màu, [(y, x)])."""
    h, w = a.shape
    seen = np.zeros_like(a, dtype=bool)
    steps = [(1, 0), (-1, 0), (0, 1), (0, -1)]
    if conn8:
        steps += [(1, 1), (1, -1), (-1, 1), (-1, -1)]
    out = []
    for y in range(h):
        for x in range(w):
            if seen[y, x]:
                continue
            col, pts, stack = a[y, x], [], [(y, x)]
            seen[y, x] = True
            while stack:
                cy, cx = stack.pop()
                pts.append((cy, cx))
                for dy, dx in steps:
                    yy, xx = cy + dy, cx + dx
                    if 0 <= yy < h and 0 <= xx < w and not seen[yy, xx] and a[yy, xx] == col:
                        seen[yy, xx] = True
                        stack.append((yy, xx))
            out.append((col, pts))
    return out


def simplify(a, passes=2, min_cluster=3):
    """Làm gọn nền kiểu tối giản: mỗi chất liệu về mảng phẳng, bỏ cụm màu nhỏ hơn min_cluster.

    1. Chất liệu: pixel thuộc dải gần như một mình giữa dải khác → đổi sang dải đa số, giữ độ sáng.
    2. Tông: trong cùng dải, tông lẻ → tông đa số.
    3. Cụm nhỏ (mực tính nối chéo) → màu chiếm nhiều nhất quanh cụm.
    """
    h, w = a.shape
    for _ in range(passes):
        b = a.copy()
        for y in range(h):
            for x in range(w):
                if a[y, x] == INK:
                    continue
                win = a[max(0, y - 1):y + 2, max(0, x - 1):x + 2].ravel()
                win = win[win != INK]
                ramps = np.bincount(RAMP_OF[win], minlength=len(RAMPS))
                own = RAMP_OF[a[y, x]]
                top = ramps.argmax()
                if ramps[own] <= 2 and ramps[top] >= 5:
                    b[y, x] = same_ramp_tone(a[y, x], list(RAMPS)[top])
                    continue
                same = win[RAMP_OF[win] == own]
                tones = np.bincount(same, minlength=len(COLORS))
                if tones[a[y, x]] <= 2 and tones.max() >= 5:
                    b[y, x] = tones.argmax()
        a = b
    for conn8, only_ink in ((False, False), (True, True)):
        for col, pts in components(a, conn8):
            if (col == INK) != only_ink or len(pts) >= min_cluster:
                continue
            ring = {}
            inside = set(pts)
            for y, x in pts:
                for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    yy, xx = y + dy, x + dx
                    if 0 <= yy < h and 0 <= xx < w and (yy, xx) not in inside and a[yy, xx] != INK:
                        ring[a[yy, xx]] = ring.get(a[yy, xx], 0) + 1
            if ring:
                new = max(ring, key=ring.get)
                for y, x in pts:
                    a[y, x] = new
    return a


def sky(a, spec):
    ramp, base, light, members, seeds, rows = spec
    allowed = {NAMES.index((ramp, i)) for i in members}
    h, w = a.shape
    mask = np.zeros_like(a, dtype=bool)
    stack = [(y, x) for (x, y) in seeds if a[y, x] in allowed]
    while stack:
        y, x = stack.pop()
        if mask[y, x] or a[y, x] not in allowed:
            continue
        mask[y, x] = True
        for yy, xx in ((y - 1, x), (y + 1, x), (y, x - 1), (y, x + 1)):
            if 0 <= yy < h and 0 <= xx < w:
                stack.append((yy, xx))
    # viền xanh sẫm do JPEG quanh nét mực trên trời xanh: nhập vào trời
    if ramp == 'b':
        fringe = {NAMES.index(('b', 0)), NAMES.index(('b', 1))}
        for _ in range(2):
            for y in range(h):
                for x in range(w):
                    if a[y, x] in fringe and not mask[y, x]:
                        n = sum(mask[yy, xx] for yy, xx in ((y - 1, x), (y + 1, x), (y, x - 1), (y, x + 1))
                                if 0 <= yy < h and 0 <= xx < w)
                        if n >= 2:
                            mask[y, x] = True
    b = a.copy()
    bi, li = NAMES.index((ramp, base)), NAMES.index((ramp, light))
    for y in range(h):
        f = max(0.0, 1 - y / rows) * 0.9
        for x in range(w):
            if mask[y, x]:
                b[y, x] = li if f > (BAYER[y % 4][x % 4] + 0.5) / 16 else bi
    return b, mask


def to_image(a):
    return Image.fromarray(PAL[a].astype(np.uint8), 'RGB').convert('RGBA')


GLYPHS = {
    '0': ['###', '#.#', '#.#', '#.#', '###'],
    'I': ['#', '#', '#', '#', '#'],
    'V': ['#.#', '#.#', '#.#', '.#.', '.#.'],
    'X': ['#.#', '#.#', '.#.', '#.#', '#.#'],
}


def hexc(h):
    return tuple(int(h[k:k + 2], 16) for k in (1, 3, 5)) + (255,)


def frame():
    """Khung 120×200: viền mực, chỉ vàng, nền kem; ô tranh và dải tên trong suốt/kem."""
    im = Image.new('RGBA', (CW, CH), hexc(RAMPS['cr'][2]))
    px = im.load()

    def rect(x0, y0, x1, y1, col, fill=False):
        for y in range(y0, y1 + 1):
            for x in range(x0, x1 + 1):
                if fill or x in (x0, x1) or y in (y0, y1):
                    px[x, y] = col
    rect(0, 0, CW - 1, CH - 1, hexc(RAMPS['ink'][0]))
    rect(1, 1, CW - 2, CH - 2, hexc(RAMPS['au'][1]))
    x0, y0, w, h = ART
    rect(x0 - 1, y0 - 1, x0 + w, y0 + h, hexc(RAMPS['au'][0]))
    rect(x0, y0, x0 + w - 1, y0 + h - 1, (0, 0, 0, 0), fill=True)
    # dải tên khớp .tarot-band (bottom 4%, cao 13%): chữ do DOM vẽ
    rect(4, BAND[0], CW - 5, BAND[1], hexc(RAMPS['au'][0]))
    for x in range(5, CW - 5):
        px[x, BAND[0]] = hexc(RAMPS['au'][1])
    # góc bậc 2 px như sprite cũ
    for (x, y) in [(0, 0), (1, 0), (0, 1)]:
        for (fx, fy) in [(x, y), (CW - 1 - x, y), (x, CH - 1 - y), (CW - 1 - x, CH - 1 - y)]:
            px[fx, fy] = (0, 0, 0, 0)
    for (x, y) in [(1, 1), (CW - 2, 1), (1, CH - 2), (CW - 2, CH - 2)]:
        px[x, y] = hexc(RAMPS['ink'][0])
    for (x, y) in [(2, 2), (CW - 3, 2)]:
        px[x, y] = hexc(RAMPS['au'][3])
    return im


def numeral(text):
    """Ô số La Mã treo ở mép trên ô tranh, như chữ số trên lá RWS."""
    cols = []
    for k, ch in enumerate(text):
        if k:
            cols.append(['.'] * 5)
        g = GLYPHS[ch]
        for i in range(len(g[0])):
            cols.append([row[i] for row in g])
    gw = len(cols)
    im = Image.new('RGBA', (gw + 6, 10), hexc(RAMPS['au'][0]))
    px = im.load()
    for y in range(0, 9):
        for x in range(1, gw + 5):
            px[x, y] = hexc(RAMPS['cr'][2])
    for i, col in enumerate(cols):
        for j, v in enumerate(col):
            if v == '#':
                px[3 + i, 2 + j] = hexc(RAMPS['ink'][0])
    return im


SKY_CH = '~'


def seed_grid(a, mask, path):
    """Lưới ký tự đầu tiên của lá, sinh từ bản nền. Sau đó lưới là bản gốc: vẽ tay trên lưới."""
    from rws_draw import KEY
    inv = {NAMES.index(n): ch for ch, n in KEY.items()}
    rows = [''.join(SKY_CH if mask[y, x] else inv[a[y, x]] for x in range(a.shape[1])) for y in range(a.shape[0])]
    with open(path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(rows) + '\n')


def build(slug, reseed=False):
    """reseed: sinh lại lưới dù đã có — XÓA mọi chỗ đã sửa trên lưới."""
    card = rws.load(slug)
    src = Image.open(os.path.join(SRC, card.SCAN)).crop(card.CROP)
    x0, y0, w, h = ART
    a = simplify(despeckle(convert(src, w, h, getattr(card, 'INK_T', 0.6))), getattr(card, 'SIMPLIFY', 2))
    a = soften_inner_ink(outline_boundaries(a))
    mask = np.zeros_like(a, dtype=bool)
    if card.SKY and card.SKY[0]:          # trời ghi bằng ký tự (dải None) chỉ dùng khi vẽ tay
        a, mask = sky(a, card.SKY)
    os.makedirs(os.path.join(OUT, '_base'), exist_ok=True)
    to_image(a).save(os.path.join(OUT, '_base', f'{slug}_art.png'))
    grid = os.path.join(rws.HERE, f'{slug}.txt')
    if not os.path.exists(grid) or reseed:
        if getattr(card, 'TRACE', False):
            import rws_trace
            with open(grid, 'w', encoding='utf-8') as f:
                f.write('\n'.join(rws_trace.grid(card, slug)) + '\n')
        elif hasattr(card, 'MATERIALS'):
            import rws_material
            with open(grid, 'w', encoding='utf-8') as f:
                f.write('\n'.join(rws_material.grid(card)) + '\n')
        else:
            seed_grid(a, mask, grid)
    n = numeral(card.NUMERAL) if card.NUMERAL else Image.new('RGBA', (1, 1))
    n.save(os.path.join(OUT, '_base', f'{slug}_numeral.png'))
    return (CW - n.width) // 2


if __name__ == '__main__':
    os.makedirs(os.path.join(OUT, '_base'), exist_ok=True)
    with open(os.path.join(OUT, '_base', 'palette.txt'), 'w') as f:
        f.write('\n'.join('#%02x%02x%02x' % c for c in COLORS))
    reseed = '--reseed' in sys.argv
    for slug in ([a for a in sys.argv[1:] if not a.startswith('-')] or rws.slugs()):
        print(slug, 'numeral x =', build(slug, reseed))
