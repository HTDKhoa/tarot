"""Bút vẽ tay cho tranh lá bài: vẽ lên lớp `ve tay`, đọc màu từ lớp nền RWS.

Tọa độ theo ô tranh 110×157 (gốc ở góc trên-trái ô tranh, không phải góc lá); vẽ không tràn ra khung. Màu ghi bằng một ký tự trong KEY, cặp (dải, tông) như ('g', 2),
hoặc None để xóa (trả lại nền).
"""
from PIL import Image, ImageDraw

from rws_prep import BAYER, COLORS, NAMES, RAMPS, SKY_CH

# Một ký tự cho mỗi màu của bảng 32 màu gốc, mỗi dải xếp tối → sáng.
# Các dải 5 tông thêm sau được gán ký tự tự động (xem T()).
KEY = {
    'o': ('ink', 0),
    'q': ('cr', 0), 'W': ('cr', 1), 'c': ('cr', 2), 'w': ('cr', 3),
    'a': ('au', 0), 'A': ('au', 1), 'y': ('au', 2), 'Y': ('au', 3),
    'R': ('r', 0), 'r': ('r', 1), 'f': ('r', 2),
    'O': ('or', 0),
    'm': ('k', 0), 'K': ('k', 1), 'k': ('k', 2),
    'G': ('g', 0), 'g': ('g', 1), 'l': ('g', 2), 'L': ('g', 3),
    'B': ('b', 0), 'b': ('b', 1), 'i': ('b', 2), 'I': ('b', 3),
    'h': ('w', 0), 'H': ('w', 1), 'j': ('w', 2),
    'S': ('s', 0), 's': ('s', 1), 'x': ('s', 2),
    'V': ('v', 0), 'v': ('v', 1),
}
_POOL = iter('dentupzCDEFJMNPQTUXZ0123456789!#$%&*+=?@^<>/|:;,()[]{}-`')
for _n in NAMES:
    if _n not in KEY.values():
        KEY[next(_POOL)] = _n
assert len(KEY) == len(COLORS) and set(KEY.values()) == set(NAMES)
_INV = {n: ch for ch, n in KEY.items()}


def T(ramp):
    """Ký tự các tông của một dải, tối → sáng: T('tunic')[0] tối nhất."""
    return ''.join(_INV[(ramp, i)] for i in range(len(RAMPS[ramp])))
CLEAR = (0, 0, 0, 0)


def sky_char(sky, x, y):
    """Màu trời ở (x, y) theo ô tranh: tông nền, dither Bayer 4×4 sang tông sáng dần lên mép trên."""
    ramp, base, light, _, _, span = sky
    f = max(0.0, 1 - y / span) * 0.9
    up = f > (BAYER[y % 4][x % 4] + 0.5) / 16
    if isinstance(base, str):            # trời hai màu khác dải, ghi bằng ký tự KEY
        return light if up else base
    return (ramp, light) if up else (ramp, base)


def rgba(col):
    if col is None:
        return CLEAR
    if isinstance(col, str):
        col = KEY[col]
    return COLORS[NAMES.index(col)] + (255,)


def name_of(px):
    """Màu RGBA → ký tự KEY (None nếu trong suốt hoặc ngoài bảng)."""
    for ch, n in KEY.items():
        if COLORS[NAMES.index(n)] + (255,) == px:
            return ch
    return None


class Canvas:
    def __init__(self, base, layer, art, sky=None, grid_sky=()):
        self.base, self.layer = base, layer
        self.bp, self.lp = base.load(), layer.load()
        self.ox, self.oy, self.w, self.h = art
        self.sky_spec, self.grid_sky = sky, set(grid_sky)
        self.sky = set(grid_sky)          # pixel đang là trời, để rws_lint bỏ qua dither

    def get(self, x, y):
        """Ký tự màu đang thấy ở (x, y): lớp vẽ tay nếu có, không thì nền."""
        if not (0 <= x < self.w and 0 <= y < self.h):
            return None
        p = self.lp[x + self.ox, y + self.oy]
        return name_of(p if p[3] else self.bp[x + self.ox, y + self.oy])

    def px(self, x, y, col):
        if not (0 <= x < self.w and 0 <= y < self.h):
            return
        if col == SKY_CH:
            self.sky.add((x, y))
            col = sky_char(self.sky_spec, x, y)
        elif col is None and (x, y) in self.grid_sky:
            self.sky.add((x, y))
        else:
            self.sky.discard((x, y))
        self.lp[x + self.ox, y + self.oy] = rgba(col)

    def rows(self, x, y, rows, legend=None):
        """Mảng ký tự; '.' giữ nguyên, ' ' cũng giữ nguyên, '_' xóa về nền."""
        for j, row in enumerate(rows):
            for i, ch in enumerate(row):
                if ch in '. ':
                    continue
                col = None if ch == '_' else (legend[ch] if legend and ch in legend else ch)
                self.px(x + i, y + j, col)

    def rect(self, x0, y0, x1, y1, col):
        for y in range(y0, y1 + 1):
            for x in range(x0, x1 + 1):
                self.px(x, y, col)

    def line(self, x0, y0, x1, y1, col):
        """Bresenham; với nhịp đẹp nên chọn độ dốc 1:1, 1:2, 2:1, 1:3."""
        dx, dy = abs(x1 - x0), -abs(y1 - y0)
        sx, sy = (1 if x0 < x1 else -1), (1 if y0 < y1 else -1)
        err = dx + dy
        while True:
            self.px(x0, y0, col)
            if (x0, y0) == (x1, y1):
                break
            e2 = 2 * err
            if e2 >= dy:
                err += dy
                x0 += sx
            if e2 <= dx:
                err += dx
                y0 += sy

    def _mask(self, fn):
        m = Image.new('1', (self.w, self.h))
        fn(ImageDraw.Draw(m))
        mp = m.load()
        return [(x, y) for y in range(self.h) for x in range(self.w) if mp[x, y]]

    def poly(self, pts, col):
        for x, y in self._mask(lambda d: d.polygon(pts, fill=1)):
            self.px(x, y, col)

    def ellipse(self, x0, y0, x1, y1, col, outline=None):
        for x, y in self._mask(lambda d: d.ellipse((x0, y0, x1, y1), fill=1)):
            self.px(x, y, col)
        if outline:
            for x, y in self._mask(lambda d: d.ellipse((x0, y0, x1, y1), outline=1)):
                self.px(x, y, outline)

    def replace(self, box, mapping):
        """Đổi màu trong hộp theo bảng {ký tự cũ: ký tự mới} trên màu đang thấy."""
        x0, y0, x1, y1 = box
        for y in range(y0, y1 + 1):
            for x in range(x0, x1 + 1):
                k = self.get(x, y)
                if k in mapping:
                    self.px(x, y, mapping[k])

    def fill(self, x, y, col, box=None, members=None):
        """Tô loang từ (x, y) qua các pixel cùng màu (hoặc thuộc `members`), giới hạn trong hộp."""
        x0, y0, x1, y1 = box or (0, 0, self.w - 1, self.h - 1)
        members = set(members) if members else {self.get(x, y)}
        seen, stack = set(), [(x, y)]
        while stack:
            cx, cy = stack.pop()
            if (cx, cy) in seen or not (x0 <= cx <= x1 and y0 <= cy <= y1) or self.get(cx, cy) not in members:
                continue
            seen.add((cx, cy))
            stack += [(cx + 1, cy), (cx - 1, cy), (cx, cy + 1), (cx, cy - 1)]
        for cx, cy in seen:
            self.px(cx, cy, col)
        return seen

    def stamp(self, sprite, x, y, flip=False):
        """Đóng dấu sprite (danh sách hàng ký tự) từ rws_symbols."""
        rows = [r[::-1] for r in sprite] if flip else sprite
        self.rows(x, y, rows)

    def outline(self, pts, col='o'):
        """Viền 1 px quanh tập điểm (nối 4 hướng), chỉ ở ngoài tập."""
        pts = set(pts)
        for x, y in pts:
            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                if (x + dx, y + dy) not in pts:
                    self.px(x + dx, y + dy, col)


def region(pts):
    """Đa giác (tọa độ thực) → tập pixel, lấy mẫu ở tâm pixel."""
    from rws_symbols import raster
    return raster([(x + 0.5, y + 0.5) for x, y in pts])


def ellipse_pts(cx, cy, rx, ry, n=24):
    import math
    return [(cx + rx * math.cos(2 * math.pi * k / n), cy + ry * math.sin(2 * math.pi * k / n)) for k in range(n)]


def parts(c, items, ink='o'):
    """Vẽ một khối nhiều mảnh (người, thú, vật) theo thứ tự sau → trước.

    items: [(đa giác, (sáng, giữa, tối))] hoặc (đa giác, (sáng, giữa, tối), tùy chọn).
    Tùy chọn 'shade':
        'rim'  (mặc định) tông giữa, mép trên-trái sáng, mép dưới-phải tối — vải, da, gỗ
        'ball' sáng tối theo khối như quả cầu, sáng từ trên-trái — mây, bình, quả, tán lá
        False  phẳng một tông
    Tùy chọn 'sharp': giữ góc nhọn (mặc định đa giác được bo tròn bằng smooth).
    Tùy chọn 'sep': màu nét ngăn chỗ mảnh này đè mảnh phía sau; mặc định tông tối của chính
    mảnh (viền đen chỉ ở bóng ngoài), 'o' khi cần tách hẳn (kiếm trước giáp).
    ink: màu viền bao ngoài cả khối. 'o' cho người; vật mềm (mây, tay trắng) dùng tông tối
    của chính nó; None thì không viền.
    Trả về tập pixel của cả khối.
    """
    drawn, owner = set(), {}
    for k, it in enumerate(items):
        pts, (hi, mid, lo) = it[0], it[1]
        opt = it[2] if len(it) > 2 else {}
        shade = opt.get('shade', 'rim')
        # góc gãy làm người như ma-nơ-canh: bo tròn mọi đa giác trừ khi xin giữ góc (kiếm, bàn)
        reg = region(pts if opt.get('sharp') or len(pts) < 4 else smooth(list(pts)))
        if not reg:
            continue
        xs, ys = [p[0] for p in reg], [p[1] for p in reg]
        cx, cy = sum(xs) / len(xs), sum(ys) / len(ys)
        rx, ry = max(1, (max(xs) - min(xs)) / 2), max(1, (max(ys) - min(ys)) / 2)
        for x, y in reg:
            col = mid
            if shade == 'rim':
                if (x + 1, y) not in reg or (x, y + 1) not in reg:
                    col = lo
                elif (x - 1, y) not in reg or (x, y - 1) not in reg:
                    col = hi
            elif shade == 'ball':
                v = (x - cx) / rx * 0.55 + (y - cy) / ry * 0.85
                col = hi if v < -0.55 else lo if v > 0.45 else mid
            c.px(x, y, col)
            owner[(x, y)] = k
        # nét ngăn: mép mảnh này giáp phần đã vẽ của mảnh phía sau
        for x, y in reg:
            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                q = (x + dx, y + dy)
                if q not in reg and q in drawn and owner.get(q, k) != k:
                    c.px(x, y, opt.get('sep', lo))
                    break
        drawn |= reg
    if ink:
        c.outline(drawn, ink)
    return drawn


def mottle(c, chars, dark, light=None, seed=1, scale=6, amount=0.28):
    """Loang mảng sáng tối hữu cơ trên các pixel màu thuộc `chars` (cỏ, đồi, nước).

    Nhiễu giá trị tần số thấp nên mảng to, mép mềm, không có pixel lẻ — khác hẳn chấm li ti."""
    import random
    rnd = random.Random(seed)
    gw, gh = c.w // scale + 2, c.h // scale + 2
    g = [[rnd.random() for _ in range(gw)] for _ in range(gh)]

    def noise(x, y):
        fx, fy = x / scale, y / scale
        i, j = int(fx), int(fy)
        tx, ty = fx - i, fy - j
        tx, ty = tx * tx * (3 - 2 * tx), ty * ty * (3 - 2 * ty)
        top = g[j][i] * (1 - tx) + g[j][i + 1] * tx
        bot = g[j + 1][i] * (1 - tx) + g[j + 1][i + 1] * tx
        return top * (1 - ty) + bot * ty

    for y in range(c.h):
        for x in range(c.w):
            if c.get(x, y) in chars and (x, y) not in c.sky:
                n = noise(x, y)
                if n < amount:
                    c.px(x, y, dark)
                elif light and n > 1 - amount:
                    c.px(x, y, light)


def repaint(c, keep, fn):
    """Vẽ lại nền: pixel có màu không thuộc `keep` (người, vật, viền) lấy màu fn(x, y, màu cũ).

    Bước tách mảng cho hình người tốt nhưng mép nền (cỏ, nước, đồi) răng cưa; vẽ lại nền
    bằng hình trơn mà không đụng vào người. fn trả None thì giữ nguyên; fn cũng được gọi
    cho pixel thuộc `keep` với cờ kept=True để lá tự quyết những chỗ trùng màu (dây hoa đỏ
    trùng màu áo choàng đỏ...)."""
    body = set(keep) - {'o'}
    for y in range(c.h):
        for x in range(c.w):
            k = c.get(x, y)
            # viền mực chỉ giữ khi còn bám vào người/vật; viền mồ côi của mảng nền thì bỏ
            stray = k == 'o' and not any(c.get(x + dx, y + dy) in body
                                         for dx in (-1, 0, 1) for dy in (-1, 0, 1) if dx or dy)
            # trời có thể trùng màu với người/vật (quần xanh, cốc vàng): ô '~' của lưới không bao giờ là người
            kept = k in keep and not stray and (x, y) not in c.sky
            new = fn(x, y, k, kept) if fn.__code__.co_argcount == 4 else (None if kept else fn(x, y))
            if new is not None:
                c.px(x, y, new)


def inside(pts, x, y):
    from rws_symbols import inside as _inside
    return _inside(pts, x + 0.5, y + 0.5)


def smooth(pts, n=2):
    """Bo tròn góc đa giác kín (Chaikin): khối người, thú mềm như vẽ tay, không gãy góc."""
    for _ in range(n):
        out = []
        for (x0, y0), (x1, y1) in zip(pts, pts[1:] + pts[:1]):
            out += [(0.75 * x0 + 0.25 * x1, 0.75 * y0 + 0.25 * y1), (0.25 * x0 + 0.75 * x1, 0.25 * y0 + 0.75 * y1)]
        pts = out
    return pts


def capsule(x0, y0, x1, y1, r0, r1=None, n=8):
    """Ống tròn hai đầu (cánh tay, ống chân, cổ): bán kính r0 ở đầu (x0, y0), r1 ở đầu kia."""
    import math
    r1 = r0 if r1 is None else r1
    a = math.atan2(y1 - y0, x1 - x0)
    pts = []
    for k in range(n + 1):
        t = a + math.pi / 2 + math.pi * k / n
        pts.append((x0 + r0 * math.cos(t), y0 + r0 * math.sin(t)))
    for k in range(n + 1):
        t = a - math.pi / 2 + math.pi * k / n
        pts.append((x1 + r1 * math.cos(t), y1 + r1 * math.sin(t)))
    return pts


def scaled(items, px, py, k):
    """Co/giãn cả nhóm mảnh của parts quanh điểm (px, py) — chỉnh cỡ người mà không viết lại tọa độ."""
    out = []
    for it in items:
        pts = [(px + (x - px) * k, py + (y - py) * k) for x, y in it[0]]
        out.append((pts,) + tuple(it[1:]))
    return out


LIGHT = (-0.55, -0.7, 0.45)          # sáng từ trên-trái, hơi chếch trước mặt


def form(c, pts, tones, ink='o', round_px=4, light=LIGHT, levels=(0.12, 0.32, 0.6, 0.78)):
    """Tô khối theo hình (lá mẫu): coi mảng như gối phồng mép tròn round_px, tính pháp tuyến,
    chiếu ánh sáng `light` rồi lượng tử về các tông `tones` (tối → sáng, 5 ký tự).

    Viền: mép ngoài phía khuất sáng là mực `ink`, phía nhận sáng là tông tối nhất của chất liệu
    (sel-out) — khối mềm, không như hình dán. ink=None thì toàn sel-out.
    Trả về {pixel: chỉ số tông} để vẽ nếp vải theo sau."""
    import numpy as np
    from scipy import ndimage
    pts = set(pts)
    if not pts:
        return {}
    xs, ys = [p[0] for p in pts], [p[1] for p in pts]
    x0, y0 = min(xs) - 1, min(ys) - 1
    m = np.zeros((max(ys) - y0 + 2, max(xs) - x0 + 2), bool)
    for x, y in pts:
        m[y - y0, x - x0] = True
    d = ndimage.distance_transform_edt(m)
    r = float(round_px)
    t = np.clip(d / r, 0, 1)
    hgt = np.sqrt(1 - (1 - t) ** 2) * r
    gy, gx = np.gradient(hgt)
    n = np.stack([-gx, -gy, np.ones_like(hgt)], -1)
    n /= np.linalg.norm(n, axis=-1, keepdims=True)
    L = np.array(light) / np.linalg.norm(light)
    inten = (n * L).sum(-1)
    idx = {}
    for x, y in pts:
        v = inten[y - y0, x - x0]
        k = sum(v > lv for lv in levels)
        idx[(x, y)] = k
        c.px(x, y, tones[k])
    for x, y in pts:
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            q = (x + dx, y + dy)
            if q not in pts:
                lit = dx < 0 or dy < 0
                c.px(*q, tones[0] if (lit or ink is None) else ink)
    return idx
