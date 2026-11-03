"""Ghi file .aseprite nhiều layer (RGBA, một frame) từ ảnh PIL.

Theo đặc tả https://github.com/aseprite/aseprite/blob/main/docs/ase-file-specs.md
— chỉ phần cần cho tranh lá bài: layer thường, cel nén zlib, một bảng màu.
"""
import struct
import zlib


def _string(s):
    b = s.encode('utf-8')
    return struct.pack('<H', len(b)) + b


def _chunk(kind, data):
    return struct.pack('<IH', len(data) + 6, kind) + data


def write(path, size, layers, palette=()):
    """layers: [(tên, ảnh RGBA cỡ bằng sprite, hiện?)] từ dưới lên trên. palette: [(r, g, b)]."""
    w, h = size
    chunks = []
    if palette:
        n = len(palette)
        data = struct.pack('<III', n, 0, n - 1) + bytes(8)
        for r, g, b in palette:
            data += struct.pack('<HBBBB', 0, r, g, b, 255)
        chunks.append(_chunk(0x2019, data))
    for name, _, visible in layers:
        flags = (1 if visible else 0) | 2
        data = struct.pack('<HHHHHHB3s', flags, 0, 0, 0, 0, 0, 255, bytes(3)) + _string(name)
        chunks.append(_chunk(0x2004, data))
    for i, (_, img, _) in enumerate(layers):
        img = img.convert('RGBA')
        assert img.size == (w, h), (img.size, size)
        data = struct.pack('<HhhBHh5s', i, 0, 0, 255, 2, 0, bytes(5))
        data += struct.pack('<HH', w, h) + zlib.compress(img.tobytes())
        chunks.append(_chunk(0x2005, data))
    body = b''.join(chunks)
    frame = struct.pack('<IHHH2sI', 16 + len(body), 0xF1FA, min(len(chunks), 0xFFFF), 100, bytes(2), len(chunks)) + body
    header = struct.pack('<IHHHHHIHIIB3sHBBhhHH84s',
                         128 + len(frame), 0xA5E0, 1, w, h, 32, 1, 100, 0, 0,
                         0, bytes(3), len(palette) or 256, 1, 1, 0, 0, 16, 16, bytes(84))
    assert len(header) == 128
    with open(path, 'wb') as f:
        f.write(header + frame)
