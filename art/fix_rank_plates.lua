-- Vẽ lại bảng chữ trên đầu lá (PAGE, KNIGHT, QUEEN, KING) trong lớp Rank/Number của một lá .aseprite.
-- Font 3×5 của bộ lá mới có P hở góc (đọc thành F), Q khép kín (như số 9), N đặc giữa (như H);
-- ở đây P đóng góc, N và Q rộng 4 px. Bảng giữ nguyên kiểu: viền vàng 1 px, nền navy, chữ sát viền trên,
-- một hàng đệm dưới, đặt lại giữa đúng tâm bảng cũ.
-- Gọi: aseprite -b --script-param file=<.aseprite> --script-param text=KING --script-param cx=49.5
--      --script-param ink=242,213,140 --script art/fix_rank_plates.lua
local G = {
  A = { ".#.", "#.#", "###", "#.#", "#.#" },
  E = { "###", "#..", "##.", "#..", "###" },
  G = { ".##", "#..", "#.#", "#.#", ".##" },
  H = { "#.#", "#.#", "###", "#.#", "#.#" },
  I = { "###", ".#.", ".#.", ".#.", "###" },
  K = { "#.#", "#.#", "##.", "#.#", "#.#" },
  N = { "#..#", "##.#", "#.##", "#..#", "#..#" },
  P = { "###", "#.#", "###", "#..", "#.." },
  Q = { ".##.", "#..#", "#..#", "#.#.", ".#.#" },
  T = { "###", ".#.", ".#.", ".#.", ".#." },
  U = { "#.#", "#.#", "#.#", "#.#", "###" },
}

local p = app.params
local text, cx = p.text, tonumber(p.cx)
local ir, ig, ib = p.ink:match("(%d+),(%d+),(%d+)")
local INK = app.pixelColor.rgba(tonumber(ir), tonumber(ig), tonumber(ib), 255)
local BG = app.pixelColor.rgba(38, 41, 56, 255)
local RIM = app.pixelColor.rgba(182, 140, 67, 255)

local spr = app.open(p.file)
local layer
for _, l in ipairs(spr.layers) do
  if l.name == "Rank" or l.name == "Number" then layer = l end
end
assert(layer, "không thấy lớp Rank/Number")
local cel = layer:cel(1)

-- chép cel cũ vào một ảnh cỡ cả lá để bảng rộng hơn vẫn nằm trọn trong cel
local img = Image(spr.width, spr.height, spr.colorMode)
img:drawImage(cel.image, cel.position)

local textW = 0
for i = 1, #text do
  textW = textW + #G[text:sub(i, i)][1] + (i > 1 and 1 or 0)
end
local w = textW + 4 -- viền 1 + đệm 1 mỗi bên
local x0 = math.floor(cx - w / 2 + 0.5)
local y0 = 4

for y = y0, y0 + 7 do
  for x = x0, x0 + w - 1 do
    local rim = y == y0 or y == y0 + 7 or x == x0 or x == x0 + w - 1
    img:drawPixel(x, y, rim and RIM or BG)
  end
end
local x = x0 + 2
for i = 1, #text do
  local g = G[text:sub(i, i)]
  for r = 1, 5 do
    for c = 1, #g[r] do
      if g[r]:sub(c, c) == "#" then img:drawPixel(x + c - 1, y0 + r, INK) end
    end
  end
  x = x + #g[1] + 1
end

cel.image = img
cel.position = Point(0, 0)
spr:saveAs(p.file)
