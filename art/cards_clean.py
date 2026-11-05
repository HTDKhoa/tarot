"""Làm sạch 78 lá chủ dự án vẽ tay (art/aseprite/cards/) và xuất ra web.

    python art/cards_clean.py measure          # đo ô tranh mọi lá → _view/measure.png
    python art/cards_clean.py build [--force]  # làm sạch cả bộ → cards/clean/*.aseprite (giữ file đã sửa tay)
    python art/cards_clean.py publish          # xuất cards/clean/ ra public/assets/cards/
    python art/cards_clean.py sheet major      # bảng trước | sau của một nhóm → _sheets/clean_<nhóm>.png
    python art/cards_clean.py publish-new      # xuất bộ lá mới (art/aseprite/new_cards/) ra public/assets/cards/art/

Ảnh .aseprite được Aseprite xuất ra PNG ở art/aseprite/cards/_png/ trước khi xử lý.
Lá mới 97×181: khung 4 px, tranh 89×156 tại (4, 4), dải tên kem ở dưới (web viết tên bằng DOM).
Ảnh trên web phóng sẵn ×4 (388×724, tranh 356×624); web thu nhỏ mượt.
"""
import glob
import json
import os
import subprocess
import sys

import numpy as np
from PIL import Image, ImageDraw

import cards
from aseprite_file import write as write_aseprite

HERE = os.path.dirname(os.path.abspath(__file__))
CARDS = os.path.join(HERE, 'aseprite', 'cards')
PNG = os.path.join(CARDS, '_png')
VIEW = os.path.join(CARDS, '_view')
SHEETS = os.path.join(CARDS, '_sheets')
CLEAN = os.path.join(CARDS, 'clean')
DATA = os.path.join(HERE, '..', 'src', 'data', 'tarot_vi.json')
ASEPRITE = os.environ.get('ASEPRITE', 'E:/aseprite/build/bin/aseprite.exe')
TRIM = 1  # bỏ thêm mép vát sáng trong khung cũ

W, H = 97, 181            # lá mới
AW, AH = 89, 156          # ô tranh, đặt tại (4, 4)
BAND = (162, 177)         # hàng kem của dải tên (y đầu, y cuối không tính)
TITLE = 7                 # số hàng chữ tên cũ ở đáy tranh, cắt bỏ
MINOR = (77, 135)         # ô tranh lá phụ trước khi phóng, cùng tỉ lệ với AW×AH (×1,156)
COLORS = 160              # cỡ bảng màu chung cả bộ
WEB_SCALE = 4             # ảnh trên web phóng sẵn 4 lần (xem cmd_publish)
# Lá mà cách chọn tự động lấy nhầm nguồn vá số La Mã: chỉ định 'right' (chép ngang) hoặc 'down'.
PATCH_FROM = {'major_21_the_world': 'right'}  # vá từ dưới kéo đầu thiên thần lên thành vệt cam
# File lá chính đặt tên lệch với tranh bên trong (soát theo chữ tên vẽ trên lá gốc): tên file → số lá thật.
MAJOR_IS = {'major_12_the_hanged_man': 14, 'major_13_death': 15, 'major_14_temperance': 12, 'major_15_the_devil': 13}

INK = (22, 12, 28)
GOLD_DK = (150, 112, 52)
GOLD = (214, 172, 80)
GOLD_HI = (246, 216, 140)
CREAM = (235, 222, 190)
NAVY = (20, 24, 50)
SUITS = {'wands': 'wands', 'cups': 'cups', 'swords': 'swords', 'coins': 'pentacles'}
ROMAN = ['0', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV',
         'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX', 'XXI']


def lum(p):
    return 0.3 * p[0] + 0.59 * p[1] + 0.11 * p[2]


def sat(p):
    return max(p[:3]) - min(p[:3])


def export():
    """Xuất mọi lá lẻ (bỏ các sheet) ra PNG; trả về [(tên, đường dẫn png)] theo thứ tự tên."""
    os.makedirs(PNG, exist_ok=True)
    out = []
    for f in sorted(glob.glob(os.path.join(CARDS, 'tarot_*', '**', '*.aseprite'), recursive=True)):
        name = os.path.splitext(os.path.basename(f))[0]
        if name.endswith('_sheet'):
            continue
        group = 'major' if 'major' in f else os.path.basename(os.path.dirname(f)).replace('aseprite_', '')
        png = os.path.join(PNG, f'{group}_{name}.png')
        if not os.path.exists(png) or os.path.getmtime(png) < os.path.getmtime(f):
            subprocess.run([ASEPRITE, '-b', f, '--save-as', png], check=True, capture_output=True)
        out.append((f'{group}_{name}', png))
    return out


def measure(im):
    """Ô tranh (x0, y0, x1, y1), x1/y1 không tính: bên trong mọi nét của khung cũ.

    Khung cũ: viền trắng, một (đôi khi hai) đường tối xám, một hàng xám nhạt, rồi tới tranh.
    Mỗi cạnh lấy đường tối nằm trong cùng (trong 10 px đầu), bỏ thêm hàng xám sau nó và
    TRIM px mép vát sáng của tranh. Đường tối phải tối, không sắc và chạy suốt 2/3 cạnh,
    nên trời đêm (có sắc navy) hay mảng tối trong tranh không bị nhận nhầm.
    """
    im = im.convert('RGBA')
    w, h = im.size
    px = im.load()

    def line(side, i):
        if side == 'L':
            return [px[i, y] for y in range(h // 6, 5 * h // 6)]
        if side == 'R':
            return [px[w - 1 - i, y] for y in range(h // 6, 5 * h // 6)]
        if side == 'T':
            return [px[x, i] for x in range(w // 6, 5 * w // 6)]
        return [px[x, h - 1 - i] for x in range(w // 6, 5 * w // 6)]

    def is_dark_line(vals):
        return sum(1 for v in vals if v[3] > 128 and lum(v) < 130 and sat(v) < 20) >= 0.8 * len(vals)

    inset = {}
    for side in 'LRTB':
        dark = [i for i in range(10) if is_dark_line(line(side, i))]
        inset[side] = (dark[-1] if dark else 4) + 2 + TRIM
    return inset['L'], inset['T'], w - inset['R'], h - inset['B']


RANKS = {'ace': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5, 'six': 6, 'seven': 7, 'eight': 8,
         'nine': 9, 'ten': 10, 'page': 11, 'knight': 12, 'queen': 13, 'king': 14}


def card_ids():
    """tên file → (id trong tarot_vi.json, arcana, số, slug theo tên Anh). Lá phụ nhận theo chữ trong
    tên, không theo số đầu tên file (bộ kiếm, gậy để số 13/14 ngược với chữ); lá chính lệch tên sửa
    bằng MAJOR_IS."""
    with open(DATA, encoding='utf-8') as f:
        data = json.load(f)['cards']
    by = {(c['arcana'], c.get('suit'), c['number']): c for c in data}
    out = {}
    for name, _ in export():
        group, num, *words = name.split('_')
        if group == 'major':
            key = ('major', None, MAJOR_IS.get(name, int(num)))
        else:
            key = ('minor', SUITS[group], RANKS[words[0]])
        c = by[key]
        out[name] = (c['id'], key[0], key[2], c['name_en'].lower().replace(' ', '_'))
    return out


def crop_art(im, minor):
    """Cắt ô tranh về cỡ chuẩn: canh giữa ngang, canh đáy ngay trên TITLE hàng chữ tên cũ."""
    x0, y0, x1, y1 = measure(im)
    w, h = MINOR if minor else (AW, AH)
    cx = (x0 + x1) // 2
    bottom = y1 - TITLE
    return im.convert('RGB').crop((cx - w // 2, bottom - h, cx - w // 2 + w, bottom))


def patch_numeral(art, source=None):
    """Xóa số La Mã vẽ sẵn ở góc trên-trái cùng ô khung khuyết quanh nó (chữ + 3 px viền phải,
    2 px viền dưới). Chép đè cả khối từ bên phải hoặc từ dưới, bước là bội số của 4 để khớp nhịp
    dither, chọn nguồn có đường nối ít lệch màu nhất. Trả về (ảnh, hộp đã vá hay None)."""
    a = np.asarray(art).astype(int)
    dark = np.array([[lum(a[y, x]) < 80 for x in range(24)] for y in range(9)])
    cols = [x for x in range(24) if dark[:, x].any()]
    if not cols or cols[0] > 3:
        return art, None
    right = cols[0]
    for x in cols:
        if x - right > 2:
            break
        right = x
    rows = [y for y in range(9) if dark[y, :right + 1].any()]
    bw, bh = min(right + 5, 24), min(max(rows[-1] + 3, 6), 10)

    def seam(dx, dy):
        p = a.copy()
        p[:bh, :bw] = a[dy:dy + bh, dx:dx + bw]
        return np.abs(p[:bh, bw - 1] - a[:bh, bw]).sum() + np.abs(p[bh - 1, :bw] - a[bh, :bw]).sum(), p

    rx, ry = (bw + 3) // 4 * 4, (bh + 3) // 4 * 4
    cands = ([(rx + k, 0) for k in (0, 4, 8)] if source != 'down' else []) + \
            ([(0, ry + k) for k in (0, 4)] if source != 'right' else [])
    _, best = min((seam(dx, dy) for dx, dy in cands), key=lambda t: t[0])
    return Image.fromarray(best.astype(np.uint8)), (0, 0, bw, bh)


def repair_edges(art):
    """Mép tranh còn sót nét khung cũ → chép hàng sạch đầu tiên đè lên các hàng đó.

    Khung cũ để lại ở mỗi cạnh: 1–2 hàng vát sáng (có thể ngả màu trời), đôi khi thêm một hàng
    bóng tối ngay sau; hoặc một hàng xám không sắc. So độ sáng trung bình từng hàng với hàng
    3–6 tính từ mép (đã là tranh).
    """
    a = np.asarray(art).copy()
    for side in 'LRTB':
        # nhìn cạnh nào cũng như cạnh trên: hàng 0 là mép
        v = {'T': a, 'B': a[::-1], 'L': a.transpose(1, 0, 2), 'R': a.transpose(1, 0, 2)[::-1]}[side]
        lines = to_lab(v[:7].astype(int))[..., 0].mean(1)
        ref = np.median(lines[3:7])
        k = 0
        while k < 2 and lines[k] > ref + 10:
            k += 1
        if k and lines[k] < ref - 5:
            k += 1
        grey = (np.ptp(v[0].astype(int), axis=1) < 25).mean()
        if not k and grey >= 0.7 and np.abs(to_lab(v[0].astype(int)) - to_lab(v[1].astype(int))).sum(1).mean() > 10:
            k = 1
        v[:k] = v[k]
    return Image.fromarray(a)


def scale2x(im):
    """EPX: phóng 2 lần mà giữ nét chéo, không sinh màu mới."""
    a = np.asarray(im)
    p = np.pad(a, ((1, 1), (1, 1), (0, 0)), mode='edge')
    c, up, dn, lf, rt = p[1:-1, 1:-1], p[:-2, 1:-1], p[2:, 1:-1], p[1:-1, :-2], p[1:-1, 2:]
    eq = lambda u, v: np.all(u == v, axis=-1, keepdims=True)
    e0 = np.where(eq(up, lf) & ~eq(up, rt) & ~eq(lf, dn), up, c)
    e1 = np.where(eq(up, rt) & ~eq(up, lf) & ~eq(rt, dn), rt, c)
    e2 = np.where(eq(dn, lf) & ~eq(dn, rt) & ~eq(lf, up), lf, c)
    e3 = np.where(eq(dn, rt) & ~eq(dn, lf) & ~eq(rt, up), rt, c)
    h, w = c.shape[:2]
    out = np.empty((h * 2, w * 2, 3), a.dtype)
    out[0::2, 0::2], out[0::2, 1::2], out[1::2, 0::2], out[1::2, 1::2] = e0, e1, e2, e3
    return Image.fromarray(out)


def downsample_mode(im, size):
    """Thu nhỏ bằng màu chiếm nhiều nhất trong mỗi ô đích: không trộn màu, không nhòe."""
    a = np.asarray(im)
    h, w = a.shape[:2]
    tw, th = size
    out = np.empty((th, tw, 3), a.dtype)
    for ty in range(th):
        ys = slice(ty * h // th, max((ty + 1) * h // th, ty * h // th + 1))
        for tx in range(tw):
            xs = slice(tx * w // tw, max((tx + 1) * w // tw, tx * w // tw + 1))
            cell = a[ys, xs].reshape(-1, 3)
            vals, counts = np.unique(cell, axis=0, return_counts=True)
            out[ty, tx] = vals[counts.argmax()]
    return Image.fromarray(out)


def scale_minor(art):
    """Lá phụ 77×135 → 89×156: EPX ×4 rồi lấy màu trội, để mọi lá cùng cỡ pixel với lá chính."""
    return downsample_mode(scale2x(scale2x(art)), (AW, AH))


def to_lab(rgb):
    c = np.asarray(rgb, float) / 255
    c = np.where(c > 0.04045, ((c + 0.055) / 1.055) ** 2.4, c / 12.92)
    m = np.array([[0.4124, 0.3576, 0.1805], [0.2126, 0.7152, 0.0722], [0.0193, 0.1192, 0.9505]])
    xyz = c @ m.T / np.array([0.9505, 1, 1.089])
    f = np.where(xyz > 0.008856, np.cbrt(xyz), 7.787 * xyz + 16 / 116)
    return np.stack([116 * f[..., 1] - 16, 500 * (f[..., 0] - f[..., 1]), 200 * (f[..., 1] - f[..., 2])], -1)


def deck_palette(arts, k=COLORS):
    """Bảng màu chung: k-means trong Lab có trọng số số pixel. Hạt giống lấy tham lam từ màu
    nhiều pixel nhất (trời dither chiếm diện tích lớn nên giữ đúng tông). Mỗi cụm lấy màu thật
    nhiều pixel nhất của nó, không lấy trung bình, để bảng chỉ gồm màu chủ dự án đã dùng."""
    cols, counts = np.unique(np.concatenate([np.asarray(a).reshape(-1, 3) for a in arts]), axis=0, return_counts=True)
    lab = to_lab(cols)
    order = np.argsort(-counts)
    seeds = [order[0]]
    for t in (14, 12, 10, 8, 6, 4, 0):
        for i in order:
            if len(seeds) >= k:
                break
            if np.min(np.linalg.norm(lab[seeds] - lab[i], axis=1)) > t:
                seeds.append(i)
    centers = lab[seeds].copy()
    for _ in range(20):
        lbl = np.argmin(((lab[:, None] - centers[None]) ** 2).sum(-1), axis=1)
        for j in range(len(centers)):
            m = lbl == j
            if m.any():
                centers[j] = (lab[m] * counts[m, None]).sum(0) / counts[m].sum()
    lbl = np.argmin(((lab[:, None] - centers[None]) ** 2).sum(-1), axis=1)
    pal = []
    for j in range(len(centers)):
        m = np.where(lbl == j)[0]
        if len(m):
            pal.append(tuple(int(v) for v in cols[m[np.argmax(counts[m])]]))
    return sorted(set(pal), key=lambda c: (round(lum(c) / 32), c))


def remap(art, pal):
    a = np.asarray(art).reshape(-1, 3)
    cols, inv = np.unique(a, axis=0, return_inverse=True)
    near = np.argmin(((to_lab(cols)[:, None] - to_lab(pal)[None]) ** 2).sum(-1), axis=1)
    return Image.fromarray(np.asarray(pal, np.uint8)[near][inv.ravel()].reshape(art.size[1], art.size[0], 3))


def despeckle(art, max_de=15):
    """Pixel lẻ (khác cả 8 pixel quanh nó) mà gần màu đa số xung quanh → đổi thành màu đó.
    Pixel lẻ tương phản mạnh (sao, điểm sáng) là cố ý nên giữ. Dither bàn cờ không bị đụng vì
    pixel chéo cùng màu với nó."""
    a = np.asarray(art).copy()
    h, w = a.shape[:2]
    fixed = 0
    for y in range(1, h - 1):
        for x in range(1, w - 1):
            c = a[y, x]
            nb = [tuple(a[y + dy, x + dx]) for dy in (-1, 0, 1) for dx in (-1, 0, 1) if dy or dx]
            if any(n == tuple(c) for n in nb):
                continue
            mode = max(set(nb), key=nb.count)
            if nb.count(mode) >= 5 and np.linalg.norm(to_lab(c) - to_lab(mode)) < max_de:
                a[y, x] = mode
                fixed += 1
    return Image.fromarray(a), fixed


# Số La Mã 3×5 (I hẹp 1 px)
GLYPHS = {
    'I': ['#', '#', '#', '#', '#'],
    'V': ['#.#', '#.#', '#.#', '#.#', '.#.'],
    'X': ['#.#', '#.#', '.#.', '#.#', '#.#'],
    '0': ['###', '#.#', '#.#', '#.#', '###'],
}


def plaque(art, text):
    """Bảng số treo ở giữa mép trên tranh: nền navy, viền vàng sẫm, chữ vàng sáng. Cạnh trên
    nối vào nét vàng sẫm trong cùng của khung nên trông như gắn liền khung."""
    glyphs = [GLYPHS[ch] for ch in text]
    gw = sum(len(g[0]) for g in glyphs) + len(glyphs) - 1
    pw, ph = gw + 4, 8
    x0 = (AW - pw) // 2
    corners = [(x0, ph - 1), (x0 + pw - 1, ph - 1)]
    keep = [art.getpixel(p) for p in corners]
    d = ImageDraw.Draw(art)
    d.rectangle((x0, 0, x0 + pw - 1, ph - 1), fill=GOLD_DK)
    d.rectangle((x0 + 1, 0, x0 + pw - 2, ph - 2), fill=NAVY)
    for p, c in zip(corners, keep):  # bo góc dưới
        art.putpixel(p, c)
    x = x0 + 2
    for g in glyphs:
        for gy, row in enumerate(g):
            for gx, ch in enumerate(row):
                if ch == '#':
                    art.putpixel((x + gx, 1 + gy), GOLD_HI)
        x += len(g[0]) + 1
    return art


def numeral(arcana, number):
    if arcana == 'major':
        return ROMAN[number]
    return ROMAN[number] if 2 <= number <= 10 else None


def frame():
    """Khung 97×181 theo card_frame.png của web: mực, vàng, kem, vàng sẫm từ ngoài vào, góc bậc
    2 px, chấm vàng sáng ở góc trong; dải tên kem ngăn với tranh bằng vàng sẫm + vàng."""
    im = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    for i, c in enumerate((INK, GOLD, CREAM, GOLD_DK)):
        d.rectangle((i, i, W - 1 - i, H - 1 - i), outline=c + (255,))
    for x, y in ((0, 0), (1, 0), (0, 1), (W - 1, 0), (W - 2, 0), (W - 1, 1),
                 (0, H - 1), (1, H - 1), (0, H - 2), (W - 1, H - 1), (W - 2, H - 1), (W - 1, H - 2)):
        im.putpixel((x, y), (0, 0, 0, 0))
    for x, y in ((1, 1), (W - 2, 1), (1, H - 2), (W - 2, H - 2)):
        im.putpixel((x, y), INK + (255,))
    for x, y in ((2, 2), (W - 3, 2)):
        im.putpixel((x, y), GOLD_HI + (255,))
    d.line((4, BAND[0] - 2, W - 5, BAND[0] - 2), fill=GOLD_DK + (255,))
    d.line((4, BAND[0] - 1, W - 5, BAND[0] - 1), fill=GOLD + (255,))
    d.rectangle((4, BAND[0], W - 5, BAND[1] - 1), fill=CREAM + (255,))
    return im


def back():
    """Mặt sau 97×181 từ thiết kế 48×80 cũ (cards.card_back): đèn lồng giữa vòng trăng, hoa
    văn góc trên/dưới, viền chấm. Họa tiết phóng EPX ×2; khung và viền chấm vẽ lại ở cỡ thật để
    nét mảnh như mặt trước. Hoa văn trên/dưới bám mép, đèn lồng ở giữa, phần dư là nền navy."""
    src = cards.card_back().convert('RGB')
    navy = src.getpixel((5, 5))
    inner = src.crop((4, 4, 44, 76))  # 40×72, trong khung cũ
    d = ImageDraw.Draw(inner)
    d.rectangle((0, 0, 39, 71), outline=navy)  # viền chấm cũ (cột 2, hàng 2 / 69) vẽ lại sau
    for x in (2, 37):
        d.line((x, 0, x, 71), fill=navy)
    for y in (2, 69):
        d.line((0, y, 39, y), fill=navy)
    big = scale2x(inner)  # 80×144
    iw, ih = W - 8, H - 8
    im = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(im).rectangle((4, 4, W - 5, H - 5), fill=navy)
    ox = 4 + (iw - 80) // 2
    im.paste(big.crop((0, 0, 80, 36)), (ox, 4 + 6))                    # hoa văn trên
    im.paste(big.crop((0, 108, 80, 144)), (ox, H - 4 - 6 - 36))        # hoa văn dưới
    im.paste(big.crop((0, 36, 80, 108)), (ox, 4 + (ih - 72) // 2))     # đèn lồng
    dot = src.getpixel((6, 6))
    for x in range(8, W - 8, 2):
        im.putpixel((x, 7), dot)
        im.putpixel((x, H - 8), dot)
    for y in range(9, H - 9, 2):
        im.putpixel((7, y), dot)
        im.putpixel((W - 8, y), dot)
    d = ImageDraw.Draw(im)
    for i, c in enumerate((INK, src.getpixel((2, 1)), GOLD, GOLD_DK)):
        d.rectangle((i, i, W - 1 - i, H - 1 - i), outline=c + (255,))
    for x, y in ((0, 0), (1, 0), (0, 1), (W - 1, 0), (W - 2, 0), (W - 1, 1),
                 (0, H - 1), (1, H - 1), (0, H - 2), (W - 1, H - 1), (W - 2, H - 1), (W - 1, H - 2)):
        im.putpixel((x, y), (0, 0, 0, 0))
    for x, y in ((1, 1), (W - 2, 1), (1, H - 2), (W - 2, H - 2)):
        im.putpixel((x, y), INK + (255,))
    return im


def compose(art):
    card = frame()
    card.paste(art, (4, 4))
    return card


def clean_all():
    """Chạy cả bộ; trả về {tên: dict(id, arcana, number, before, art, patch, specks)}."""
    ids = card_ids()
    cards = {}
    for name, png in export():
        src = Image.open(png).convert('RGBA')
        minor = not name.startswith('major')
        art, box = patch_numeral(crop_art(src, minor), PATCH_FROM.get(name))
        art = repair_edges(art)
        cid, arcana, number, slug = ids[name]
        cards[name] = dict(id=cid, arcana=arcana, number=number, slug=slug, before=src, art=art, patch=box, minor=minor)
    # Về bảng màu chung trước khi phóng lá phụ: dither trời mới lặp đúng từng màu để nhận ra,
    # và phóng (EPX + màu trội) không sinh màu mới nên không cần ánh xạ lại.
    pal = deck_palette([c['art'] for c in cards.values()])
    for c in cards.values():
        art = remap(c['art'], pal)
        if c['minor']:
            art = scale_minor(art)
        c['art'], c['specks'] = despeckle(art)
        text = numeral(c['arcana'], c['number'])
        if text:
            plaque(c['art'], text)
    return cards, pal


def save_indexed(art, pal, path):
    """PNG chỉ mục trên bảng màu chung: cỡ file bằng khoảng 1/3 PNG RGB."""
    extra = sorted(set(art.getdata()) - set(pal))  # màu bảng số (vàng, navy) không nằm trong bảng
    colors = list(pal) + extra
    index = {c: i for i, c in enumerate(colors)}
    im = Image.new('P', art.size)
    im.putpalette([v for c in colors for v in c])
    im.putdata([index[c] for c in art.getdata()])
    im.save(path, optimize=True)


def cmd_build(*flags):
    """Ghi cards/clean/<id>_<slug>.aseprite (layer khung + tranh). File đã có thì giữ nguyên, vì
    có thể đã sửa tay trong Aseprite; thêm --force để ghi đè."""
    cards, pal = clean_all()
    os.makedirs(CLEAN, exist_ok=True)
    for name, c in cards.items():
        path = os.path.join(CLEAN, f"{c['id']:02d}_{c['slug']}.aseprite")
        if os.path.exists(path) and '--force' not in flags:
            print(f"{c['id']:2d} {name:34s} giữ bản đã có")
            continue
        layers = [('khung', frame(), True), ('tranh', Image.new('RGBA', (W, H)), True)]
        layers[1][1].paste(c['art'], (4, 4))
        write_aseprite(path, (W, H), layers, pal)
        print(f"{c['id']:2d} {name:34s} vá số {c['patch']}  pixel lẻ {c['specks']}")
    frame().save(os.path.join(CLEAN, 'card_frame.png'))
    back().save(os.path.join(CLEAN, 'card_back.png'))
    print('bảng màu', len(pal))


def cmd_publish():
    """Xuất tranh từ cards/clean/*.aseprite (kể cả chỗ sửa tay) ra public/assets/cards/art/<id>.png,
    cùng khung và mặt sau, phóng sẵn WEB_SCALE lần bằng nearest. Web thu nhỏ mượt từ ảnh này nên
    pixel đều nhau ở mọi cỡ lá (thu nhỏ nearest ở tỉ lệ lẻ làm nét dày mỏng không đều)."""
    out = os.path.join(HERE, '..', 'public', 'assets', 'cards')
    os.makedirs(os.path.join(out, 'art'), exist_ok=True)
    total = 0
    for f in sorted(glob.glob(os.path.join(CLEAN, '[0-9][0-9]_*.aseprite'))):
        png = os.path.join(PNG, 'clean_' + os.path.basename(f)[:-9] + '.png')
        subprocess.run([ASEPRITE, '-b', f, '--save-as', png], check=True, capture_output=True)
        art = Image.open(png).convert('RGB').crop((4, 4, 4 + AW, 4 + AH))
        art = art.resize((AW * WEB_SCALE, AH * WEB_SCALE), Image.NEAREST)
        dest = os.path.join(out, 'art', os.path.basename(f)[:2] + '.png')
        save_indexed(art, sorted(set(art.getdata())), dest)
        total += os.path.getsize(dest)
    for name in ('card_frame.png', 'card_back.png'):
        Image.open(os.path.join(CLEAN, name)).resize((W * WEB_SCALE, H * WEB_SCALE), Image.NEAREST)             .save(os.path.join(out, name), optimize=True)
    print(f'đã xuất tranh, {total // 1024} KB')


NEW_CARDS = os.path.join(HERE, 'aseprite', 'new_cards')


def cmd_publish_new():
    """Xuất bộ lá mới (art/aseprite/new_cards/, 97×181, ba lớp Frame / Artwork / Number|Rank, khung trùng từng pixel
    với khung web) ra public/assets/cards/art/<id>.png: ô tranh 89×156 tại (4, 4) gồm cả bảng số, phóng WEB_SCALE lần.
    Khung và mặt sau trên web giữ nguyên. Số đầu tên file là id lá; soát slug với tarot_vi.json trước khi ghi."""
    with open(DATA, encoding='utf-8') as fh:
        slugs = {c['id']: c['slug'] for c in json.load(fh)['cards']}
    files = sorted(glob.glob(os.path.join(NEW_CARDS, '**', '[0-9][0-9]_*.aseprite'), recursive=True))
    assert len(files) == 78, f'cần 78 lá, có {len(files)}'
    for f in files:
        name = os.path.basename(f)[:-9]
        cid, slug = int(name[:2]), name[3:].replace('_', '-')
        assert slugs[cid] == slug, f'{name}: id {cid} trong dữ liệu là {slugs[cid]}'
    out = os.path.join(HERE, '..', 'public', 'assets', 'cards', 'art')
    os.makedirs(out, exist_ok=True)
    os.makedirs(PNG, exist_ok=True)
    total = 0
    for f in files:
        name = os.path.basename(f)[:-9]
        png = os.path.join(PNG, 'new_' + name + '.png')
        subprocess.run([ASEPRITE, '-b', f, '--save-as', png], check=True, capture_output=True)
        card = Image.open(png).convert('RGB')
        assert card.size == (W, H), f'{name}: cỡ {card.size}'
        art = card.crop((4, 4, 4 + AW, 4 + AH)).resize((AW * WEB_SCALE, AH * WEB_SCALE), Image.NEAREST)
        dest = os.path.join(out, name[:2] + '.png')
        save_indexed(art, sorted(set(art.getdata())), dest)
        total += os.path.getsize(dest)
    print(f'đã xuất {len(files)} lá mới, {total // 1024} KB')


def cmd_sheet(*groups):
    cards, _ = clean_all()
    for group in groups:
        sheet_group(cards, group)


def sheet_group(cards, group):
    picked = [(n, c) for n, c in cards.items() if n.startswith(group)]
    s, gap = 3, 12
    col = W * s + gap
    sheet = Image.new('RGB', (gap + col * len(picked), gap + 179 * s + gap + 181 * s + gap + H + gap), (24, 18, 30))
    for k, (_, c) in enumerate(picked):
        x = gap + k * col
        b = c['before']
        sheet.paste(b.resize((b.width * s, b.height * s), Image.NEAREST), (x, gap), b.resize((b.width * s, b.height * s), Image.NEAREST))
        card = compose(c['art'])
        y = gap + 179 * s + gap
        sheet.paste(card.resize((W * s, H * s), Image.NEAREST), (x, y), card.resize((W * s, H * s), Image.NEAREST))
        sheet.paste(card, (x, y + H * s + gap), card)
    os.makedirs(SHEETS, exist_ok=True)
    out = os.path.join(SHEETS, f'clean_{group}.png')
    sheet.save(out)
    print(out, sheet.size)


def cmd_measure():
    cards = export()
    s, gap, cols = 3, 6, 10
    ims = [(n, Image.open(p).convert('RGBA')) for n, p in cards]
    cw = max(im.width for _, im in ims) * s + gap
    ch = max(im.height for _, im in ims) * s + gap + 14
    sheet = Image.new('RGB', (cols * cw + gap, (len(ims) + cols - 1) // cols * ch + gap), (24, 18, 30))
    d = ImageDraw.Draw(sheet)
    for k, (n, im) in enumerate(ims):
        x0, y0, x1, y1 = box = measure(im)
        ox, oy = gap + k % cols * cw, gap + k // cols * ch
        sheet.paste(im.resize((im.width * s, im.height * s), Image.NEAREST), (ox, oy), im.resize((im.width * s, im.height * s), Image.NEAREST))
        d.rectangle((ox + x0 * s, oy + y0 * s, ox + x1 * s - 1, oy + y1 * s - 1), outline=(255, 0, 255))
        d.text((ox, oy + im.height * s + 2), f'{n[:18]} {x1 - x0}x{y1 - y0}', fill=(230, 220, 200))
        print(n.ljust(34), im.size, box, (x1 - x0, y1 - y0))
    os.makedirs(VIEW, exist_ok=True)
    sheet.save(os.path.join(VIEW, 'measure.png'))


if __name__ == '__main__':
    sys.stdout.reconfigure(encoding='utf-8')  # console Windows mặc định cp1252
    {'measure': cmd_measure, 'build': cmd_build, 'sheet': cmd_sheet, 'publish': cmd_publish, 'publish-new': cmd_publish_new}[sys.argv[1]](*sys.argv[2:])
