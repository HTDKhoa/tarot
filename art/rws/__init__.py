"""Dữ liệu từng lá: mỗi lá một file art/rws/<slug>.py.

Mỗi file khai báo:
    SCAN      tên file scan trong art/src/rws/
    CROP      (x0, y0, x1, y1) vùng tranh trong scan, tỉ lệ 86:125
    NUMERAL   số La Mã ('' cho lá triều đình và lá Ace)
    SKY       (dải, tông nền, tông sáng, các tông thuộc trời, điểm gieo trong ô tranh, số hàng chuyển) hoặc None
    SYMBOLS   biểu tượng phải giữ (danh sách chữ, để soát khi tối giản)
và tùy chọn:
    SIMPLIFY  số lượt làm gọn nền (mặc định 2)
    RECOLOR   [(hộp, {màu cũ: màu mới})] theo tọa độ cả lá
    SKIN      [(hộp, [điểm gieo])]
    PATCHES   [(x, y, hàng)] mảng ký tự theo KEY của rws_draw
    draw(c)   hàm vẽ tay trên Canvas của rws_draw
    LINT_OK   [hộp] chỗ pixel lẻ có chủ đích (mắt, đốm sáng)
"""
import importlib.util
import os

HERE = os.path.dirname(os.path.abspath(__file__))


def load(slug):
    path = os.path.join(HERE, f'{slug}.py')
    spec = importlib.util.spec_from_file_location(f'rws_card_{slug.replace("-", "_")}', path)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def slugs():
    return sorted(f[:-3] for f in os.listdir(HERE) if f.endswith('.py') and not f.startswith('_'))
