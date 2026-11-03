"""Tách scan RWS thành các mảng chất liệu phẳng theo điểm mẫu của lá, rồi dựng lưới ký tự.

Scan 1909 tô màu bằng khuôn: mỗi mảng một màu giữa các nét mực. Lá khai báo MATERIALS:

    MATERIALS = [
        # tên, điểm mẫu (tọa độ ô tranh), tông, tùy chọn — xếp từ sau ra trước
        ('trời', [(5, 30), (40, 60)], '~'),
        ('cỏ',   [(10, 85)], 'l'),
        ('da',   [(50, 60)], 'kKm', {'inner': 'm'}),
    ]

tông: '~' (trời), một ký tự (mảng phẳng) hoặc ba ký tự sáng–giữa–tối (mép trên-trái sáng,
mép dưới-phải tối, sáng từ trên-trái). Tùy chọn:
    line   viền mực ở chỗ mảng này nằm trước mảng phía sau (mặc định True với mảng ba tông)
    inner  ký tự cho nét mực của scan nằm trọn trong mảng (khớp gối, ngực, nếp áo); mặc định bỏ
    min    mảng nhỏ hơn số pixel này thì nhập vào mảng xung quanh (mặc định 3)

    python art/rws_material.py sample the-star 10,80 50,60   # màu scan ở các điểm (kiểm điểm mẫu)

Mỗi pixel scan được xếp vào chất liệu có màu mẫu gần nhất; pixel mực lấy chất liệu của pixel
không-mực gần nhất, nên nét mực thành ranh giới chứ không thành mảng. Thu về 86×125 theo đa số.
"""
import os

import numpy as np
from PIL import Image
from scipy import ndimage

import rws_prep as P

INK_L = 38


def classify(card):
    mats = card.MATERIALS
    src = Image.open(os.path.join(P.SRC, card.SCAN)).crop(card.CROP)
    src = src.resize((src.width // 2, src.height // 2), Image.LANCZOS)
    lab = P.to_lab(np.asarray(src.convert('RGB')).astype(float))
    H, W = lab.shape[:2]
    w, h = P.ART[2], P.ART[3]
    sx, sy = W / w, H / h
    ink = lab[..., 0] < getattr(card, 'INK_L', INK_L)

    cents, cls = [], []
    for k, m in enumerate(mats):
        for x, y in m[1]:
            X, Y = int((x + 0.5) * sx), int((y + 0.5) * sy)
            patch = lab[max(0, Y - 2):Y + 3, max(0, X - 2):X + 3].reshape(-1, 3)
            keep = patch[patch[:, 0] >= INK_L]
            cents.append((keep if len(keep) else patch).mean(0))
            cls.append(k)
    cents, cls = np.array(cents), np.array(cls)
    d = ((lab[..., None, :] - cents) ** 2).sum(-1)
    full = cls[d.argmin(-1)]
    near = ndimage.distance_transform_edt(ink, return_distances=False, return_indices=True)
    full = full[near[0], near[1]]

    ys = np.linspace(0, H, h + 1).astype(int)
    xs = np.linspace(0, W, w + 1).astype(int)
    out = np.zeros((h, w), dtype=int)
    inkf = np.zeros((h, w))
    for j in range(h):
        for i in range(w):
            cell = full[ys[j]:ys[j + 1], xs[i]:xs[i + 1]]
            out[j, i] = np.bincount(cell.ravel(), minlength=len(mats)).argmax()
            inkf[j, i] = ink[ys[j]:ys[j + 1], xs[i]:xs[i + 1]].mean()
    return clean(out, mats), inkf


def opt(m):
    return m[3] if len(m) > 3 else {}


def clean(out, mats):
    """Làm mượt mép rồi nhập mảng nhỏ hơn `min` pixel vào chất liệu chiếm nhiều nhất quanh nó.

    Làm mượt: pixel chỉ có ≤ 1 trong 8 ô quanh cùng chất liệu mà một chất liệu khác chiếm ≥ 6
    thì đổi sang chất liệu đó — bỏ gai lẻ ở mép mảng mà không lấp khe hở 1–2 px giữa tay và chân."""
    h, w = out.shape
    for _ in range(2):
        b = out.copy()
        for y in range(h):
            for x in range(w):
                win = out[max(0, y - 1):y + 2, max(0, x - 1):x + 2].ravel()
                cnt = np.bincount(win, minlength=len(mats))
                cnt[out[y, x]] -= 1
                top = cnt.argmax()
                if cnt[out[y, x]] <= 1 and cnt[top] >= 6:
                    b[y, x] = top
        out = b
    for k, m in enumerate(mats):
        lab, n = ndimage.label(out == k)
        for r in range(1, n + 1):
            pts = np.argwhere(lab == r)
            if len(pts) >= opt(m).get('min', 3):
                continue
            ring = {}
            for y, x in pts:
                for yy, xx in ((y - 1, x), (y + 1, x), (y, x - 1), (y, x + 1)):
                    if 0 <= yy < h and 0 <= xx < w and out[yy, xx] != k:
                        ring[out[yy, xx]] = ring.get(out[yy, xx], 0) + 1
            if ring:
                out[tuple(pts.T)] = max(ring, key=ring.get)
    return out


def render(card, out, inkf):
    """Bản đồ chất liệu → lưới ký tự: tông, đổ bóng mép, viền mực, nét trong."""
    mats = card.MATERIALS
    h, w = out.shape
    rows = [[''] * w for _ in range(h)]
    for k, m in enumerate(mats):
        tone = m[2]
        lab, _ = ndimage.label(out == k)
        for y, x in np.argwhere(out == k):
            if len(tone) == 1:
                rows[y][x] = tone
                continue
            hi, mid, lo = tone
            same = lambda yy, xx: 0 <= yy < h and 0 <= xx < w and lab[yy, xx] == lab[y, x]
            if not same(y, x + 1) or not same(y + 1, x):
                rows[y][x] = lo
            elif not same(y, x - 1) or not same(y - 1, x):
                rows[y][x] = hi
            else:
                rows[y][x] = mid
    for y in range(h):
        for x in range(w):
            k = out[y, x]
            m = mats[k]
            line = opt(m).get('line', len(m[2]) == 3)
            nb = [out[yy, xx] for yy, xx in ((y - 1, x), (y + 1, x), (y, x - 1), (y, x + 1)) if 0 <= yy < h and 0 <= xx < w]
            behind = [q for q in nb if q < k]
            if line and behind:
                # vật đè lên nền: viền mực; hai mảng của cùng một người/vật gặp nhau: nét tông tối
                # của mảng phía trước, không đen (giữ khối liền, viền đen chỉ ở bóng ngoài)
                fig = all(len(mats[q][2]) == 3 for q in behind)
                rows[y][x] = m[2][2] if fig else 'o'
            elif opt(m).get('inner') and inkf[y, x] > 0.45 and all(q == k for q in nb):
                rows[y][x] = opt(m)['inner']
    return [''.join(r) for r in rows]


def grid(card):
    return render(card, *classify(card))


def sample(slug, pts):
    """In màu scan (bỏ mực) quanh các điểm, để chọn điểm mẫu không rơi nhầm chất liệu."""
    import rws
    from rws_draw import KEY
    card = rws.load(slug)
    src = Image.open(os.path.join(P.SRC, card.SCAN)).crop(card.CROP).convert('RGB')
    sx, sy = src.width / P.ART[2], src.height / P.ART[3]
    inv = {P.NAMES.index(n): ch for ch, n in KEY.items()}
    for x, y in pts:
        X, Y = int((x + 0.5) * sx), int((y + 0.5) * sy)
        a = np.asarray(src.crop((X - 4, Y - 4, X + 5, Y + 5))).reshape(-1, 3).astype(float)
        keep = a[P.to_lab(a)[:, 0] >= INK_L]
        if not len(keep):
            print((x, y), 'toàn mực')
            continue
        m = keep.mean(0)
        print((x, y), '#%02x%02x%02x' % tuple(int(v) for v in m), 'gần', inv[P.nearest(P.to_lab(m[None]))[0]],
              f'{len(keep)}/81 không mực')


if __name__ == '__main__':
    import sys
    if sys.argv[1] == 'sample':
        sample(sys.argv[2], [tuple(int(v) for v in a.split(',')) for a in sys.argv[3:]])
