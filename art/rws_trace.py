"""Dựng lưới lá bài từ scan RWS, giữ nguyên đường nét của Pamela Colman Smith.

Ở cỡ ô tranh 110×157, mỗi pixel ứng với ~9 px scan nên nét mực RWS rộng ~1 pixel: dùng
thẳng nét đó làm viền thay vì tự vẽ đa giác. Lá khai báo TRACE = True và MATERIALS như
rws_material, với tông:

    '~'      trời (dither theo SKY)
    'x'      một tông phẳng
    'hml'    ba tông sáng–giữa–tối: mép trên-trái sáng, mép dưới-phải tối (vải, da)
    'hmld'   bốn tông theo khối: sáng 2 px trên-trái, tối 2 px dưới-phải, đáy tối nhất (lá, cốc)

Tùy chọn (dict thứ tư): 'hatch' ký tự cho nét gạch nhỏ nằm trong mảng (mặc định tông tối nhất,
trời thì xóa), 'inner' ký tự cho nét dài nằm trong mảng (nếp vải; mặc định tông tối nhất).

Nét mực:
  - cụm nhỏ (< HATCH px) nằm trọn trong một mảng → nét gạch của chất liệu (cỏ, vỏ cây)
  - nét nằm giữa một mảng → tông tối của mảng (nếp áo, ngón tay), như lá mẫu
  - nét giữa hai mảng khác nhau → mực
"""
import os

import numpy as np
from PIL import Image
from scipy import ndimage

import rws_prep as P
from rws_material import classify, opt

INK_T = 0.3
HATCH = 10


def _shade(tones, same, x, y):
    if len(tones) == 3:
        hi, mid, lo = tones
        if not same(x + 1, y) or not same(x, y + 1):
            return lo
        if not same(x - 1, y) or not same(x, y - 1):
            return hi
        return mid
    hi, mid, lo, deep = tones
    if not same(x, y + 1):
        return deep
    if not same(x - 1, y - 1) or not same(x - 2, y - 2) or not same(x, y - 1) or not same(x - 1, y):
        return hi
    if not same(x + 1, y + 1) or not same(x + 2, y + 2) or not same(x + 1, y):
        return lo
    return mid


def build(card):
    mats = card.MATERIALS
    out, inkf = classify(card)
    h, w = out.shape
    ink = inkf > getattr(card, 'INK_T', INK_T)
    tones = [m[2] for m in mats]
    darkest = [t[-1] if t != '~' else '~' for t in tones]

    # nét gạch nhỏ trong một mảng → chất liệu của mảng
    lab, n = ndimage.label(ink, structure=np.ones((3, 3)))
    rows = [[''] * w for _ in range(h)]
    for r in range(1, n + 1):
        pts = np.argwhere(lab == r)
        if len(pts) >= getattr(card, 'HATCH', HATCH):
            continue
        touch = set()
        for y, x in pts:
            for yy, xx in ((y - 1, x), (y + 1, x), (y, x - 1), (y, x + 1)):
                if 0 <= yy < h and 0 <= xx < w and not ink[yy, xx]:
                    touch.add(out[yy, xx])
        if len(touch) == 1:
            k = touch.pop()
            for y, x in pts:
                ink[y, x] = False
                rows[y][x] = opt(mats[k]).get('hatch', darkest[k])

    # vùng liền của từng chất liệu, ngăn bởi nét mực: để đổ bóng theo mép
    region = np.zeros_like(out)
    nid = 0
    for k in range(len(mats)):
        lab, n = ndimage.label((out == k) & ~ink)
        region[lab > 0] = lab[lab > 0] + nid
        nid += n

    def same_fn(y, x):
        rid = region[y, x]
        return lambda xx, yy: 0 <= yy < h and 0 <= xx < w and not ink[yy, xx] and region[yy, xx] == rid

    for y in range(h):
        for x in range(w):
            if rows[y][x]:
                continue
            k = out[y, x]
            t = tones[k]
            if ink[y, x]:
                near = {out[yy, xx] for yy in range(max(0, y - 1), min(h, y + 2))
                        for xx in range(max(0, x - 1), min(w, x + 2)) if not ink[yy, xx]}
                if len(near) == 1:
                    kk = near.pop()
                    rows[y][x] = opt(mats[kk]).get('inner', darkest[kk]) if tones[kk] != '~' else 'o'
                else:
                    rows[y][x] = 'o'
            elif t == '~' or len(t) == 1:
                rows[y][x] = t
            else:
                rows[y][x] = _shade(t, same_fn(y, x), x, y)
    return [''.join(r) for r in rows], out


def grid(card, slug):
    rows, out = build(card)
    Image.fromarray(out.astype(np.uint8), 'L').save(os.path.join(P.OUT, '_base', f'{slug}_mat.png'))
    return rows


def material_sets(card, slug):
    """{tên chất liệu: tập pixel} theo bản đồ đã lưu lúc dựng lưới, cho bước tô chất liệu."""
    path = os.path.join(P.OUT, '_base', f'{slug}_mat.png')
    if not os.path.exists(path):
        return {}
    a = np.asarray(Image.open(path))
    return {m[0]: {(int(x), int(y)) for y, x in np.argwhere(a == k)} for k, m in enumerate(card.MATERIALS)}
