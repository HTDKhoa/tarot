-- The Fool, 120×200, vẽ bằng Aseprite (Lua), can từ scan RWS 1909 (Pamela Colman Smith, public domain):
-- art/src/rws/RWS_Tarot_00_Fool.jpg, cắt x 70–1068, y 150–1574, thu về 110×157 (RWS_Tarot_00_Fool_110x157.png).
-- Tô theo "Quy tắc đặt từng pixel" trong docs/CARD_ART.md.
-- Chạy: aseprite -b --script-param out=<thư mục lá> --script-param ref=<ảnh 110×157> --script art/aseprite/the-fool.lua

local OUT = app.params.out or "."
local REF = app.params.ref
local W, H = 120, 200
local OX, OY = 5, 5        -- gốc ô tranh trong lá
local AW, AH = 110, 157    -- ô tranh

local function hex(s)
  return app.pixelColor.rgba(tonumber(s:sub(2, 3), 16), tonumber(s:sub(4, 5), 16), tonumber(s:sub(6, 7), 16), 255)
end
local function ramp(t) local r = {} for i, s in ipairs(t) do r[i] = hex(s) end return r end

-- Dải màu tối → sáng, phần lớn lấy từ RAMPS trong art/rws_prep.py.
local INK   = hex('#160c1c')
local GOLD  = ramp{'#5a2c08', '#a0560c', '#d8860e', '#f4b81c', '#fce67a'}
local CLOUD = ramp{'#7e8c94', '#b0b8bc', '#d4d6d2', '#ece6da', '#fffaf0'}
local SKY   = ramp{'#3a7e94', '#5ea6b8', '#7ec2cc', '#a4d8dc', '#d0eeea'}
local GRASS = ramp{'#2a4210', '#467018', '#6c9a1a', '#a4c018', '#d8dc3a'}
local LEAF  = ramp{'#141e0c', '#1e2e10', '#3a5a14', '#62881a', '#9cb818'}
local BARK  = ramp{'#2a140e', '#5e2412', '#8e3a18', '#bc5220', '#d88a40'}
local SKIN  = ramp{'#6a2e1c', '#a85a30', '#d88a48', '#f0b46c', '#fcd8a0'}
local RED   = ramp{'#5a1410', '#a01e0c', '#d8340c', '#f45a10', '#ff9a40'}
local COAT  = ramp{'#0e0c16', '#181624', '#242234', '#34344a', '#4c4e66'}  -- áo đen RWS, ngả xanh đêm
local TAN   = ramp{'#3e3020', '#6a5634', '#94804e', '#b8a46a', '#d8c896'}  -- quần bó, đá vàng xám
local BOOT  = ramp{'#6a4a1a', '#a88234', '#d0b056', '#ecd488', '#fff2c0'}
local BAG   = ramp{'#3e1810', '#6a2a18', '#9a4a2a', '#c4704a', '#e0a070'}
local CREAM = hex('#ebdebe')

local function hash(a, b)
  local n = ((a * 73856093) ~ (b * 19349663)) & 0x7fffffff
  n = (n * 1103515245 + 12345) & 0x7fffffff
  return ((n >> 8) % 1000) / 1000
end
local function checker(x, y) return (x + y) % 2 == 0 end

local bg  = Image(W, H, ColorMode.RGB)
local fig = Image(W, H, ColorMode.RGB)
-- tông dùng cho viền phía sáng tại từng pixel; false = vật sáng, bỏ viền phía sáng (mục 3)
local dark = {}

local function put(img, x, y, c)
  if x >= 0 and x < AW and y >= 0 and y < AH then img:drawPixel(x + OX, y + OY, c) end
end
local function opaque(img, x, y)
  if x < 0 or x >= AW or y < 0 or y >= AH then return false end
  return app.pixelColor.rgbaA(img:getPixel(x + OX, y + OY)) > 0
end

-- Hình cơ bản: hàm (x, y) → có nằm trong không, đo ở tâm pixel.
local function poly(p)
  return function(x, y)
    local px, py, inside, n = x + 0.5, y + 0.5, false, #p // 2
    local j = n
    for i = 1, n do
      local xi, yi, xj, yj = p[2 * i - 1], p[2 * i], p[2 * j - 1], p[2 * j]
      if (yi > py) ~= (yj > py) and px < (xj - xi) * (py - yi) / (yj - yi) + xi then inside = not inside end
      j = i
    end
    return inside
  end
end
local function capsule(x1, y1, x2, y2, r)
  return function(x, y)
    local px, py, dx, dy = x + 0.5, y + 0.5, x2 - x1, y2 - y1
    local t = math.max(0, math.min(1, ((px - x1) * dx + (py - y1) * dy) / (dx * dx + dy * dy)))
    local ex, ey = px - (x1 + t * dx), py - (y1 + t * dy)
    return ex * ex + ey * ey <= r * r
  end
end
local function ellipse(cx, cy, rx, ry)
  return function(x, y)
    local u, v = (x + 0.5 - cx) / rx, (y + 0.5 - cy) / ry
    return u * u + v * v <= 1
  end
end
local function union(...)
  local fs = {...}
  return function(x, y) for _, f in ipairs(fs) do if f(x, y) then return true end end return false end
end

-- Một mảng, tô theo mục 2: mép dưới-phải tông 1, dải tông 2, tông 3 phủ phần lớn, vệt tông 4 dọc mép
-- trên-trái, tông 5 vài pixel ở góc trên-trái. Mép chạm mảng trước tự thành tông tối (mục 3).
local function part(f, r, opt)
  opt = opt or {}
  local m, x0, y0, x1, y1 = {}, AW, AH, 0, 0
  for y = 0, AH - 1 do for x = 0, AW - 1 do
    if f(x, y) then
      m[y * AW + x] = true
      x0, y0, x1, y1 = math.min(x0, x), math.min(y0, y), math.max(x1, x), math.max(y1, y)
    end
  end end
  local function inm(x, y) return x >= 0 and x < AW and y >= 0 and y < AH and m[y * AW + x] end
  local qx, qy = x0 + (x1 - x0) * 0.45, y0 + (y1 - y0) * 0.45
  local tone = {}
  for k in pairs(m) do
    local x, y = k % AW, k // AW
    local t = 3
    if not inm(x + 1, y) or not inm(x, y + 1) then t = 1
    elseif not inm(x + 2, y + 1) or not inm(x + 1, y + 2) then t = 2
    elseif not inm(x - 1, y) or not inm(x, y - 1) then t = 4
    elseif opt.hi and x < qx and y < qy and (not inm(x - 2, y) or not inm(x, y - 2)) then t = 5 end
    put(fig, x, y, r[t])
    tone[k] = t
    dark[k] = (not opt.soft) and r[1]
  end
  return tone
end
local function each(tone, fn) for k, t in pairs(tone) do fn(k % AW, k // AW, t) end end

-- Đoạn thẳng Bresenham (tia nắng).
local function line(img, x0, y0, x1, y1, c)
  local dx, dy = math.abs(x1 - x0), -math.abs(y1 - y0)
  local sx, sy = x0 < x1 and 1 or -1, y0 < y1 and 1 or -1
  local err = dx + dy
  while true do
    put(img, x0, y0, c)
    if x0 == x1 and y0 == y1 then break end
    local e2 = 2 * err
    if e2 >= dy then err = err + dy; x0 = x0 + sx end
    if e2 <= dx then err = err + dx; y0 = y0 + sy end
  end
end

------------------------------------------------------------------ trời, mặt trời
for y = 0, AH - 1 do
  for x = 0, AW - 1 do
    -- hai mảng phẳng, nối bằng dải bàn cờ 3 hàng (mục 6)
    put(bg, x, y, (y < 8 or (y < 11 and checker(x, y))) and GOLD[5] or GOLD[4])
  end
end
-- tia nắng: đoạn thẳng tỏa từ tâm mặt trời, dài ngắn xen nhau như RWS
local SX, SY, SR = 104, -4, 13
for i = 0, 13 do
  local a = math.rad(92 + i * 6.5)
  local r1 = SR + 4
  local r2 = SR + (i % 2 == 0 and 30 or 20)
  line(bg, math.floor(SX + r1 * math.cos(a) + 0.5), math.floor(SY + r1 * math.sin(a) + 0.5),
           math.floor(SX + r2 * math.cos(a) + 0.5), math.floor(SY + r2 * math.sin(a) + 0.5), GOLD[2])
end
for y = 0, 12 do for x = 88, AW - 1 do
  local d = math.sqrt((x + 0.5 - SX) ^ 2 + (y + 0.5 - SY) ^ 2)
  if d <= SR - 1.2 then put(bg, x, y, (x - SX) + (y - SY) > 6 and CLOUD[4] or CLOUD[5])
  elseif d <= SR then put(bg, x, y, CLOUD[2]) end
end end

------------------------------------------------------------------ núi tuyết (vật sáng: không viền phía sáng)
local SNOW = {hi = true, soft = true}
-- dãy phải, sau chó
part(poly{70, 130, 72, 118, 76, 112, 78, 106, 82, 104, 86, 100, 89, 104, 92, 98, 96, 96, 100, 92, 103, 88, 106, 93, 110, 92, 110, 132, 70, 132}, CLOUD, SNOW)
part(poly{74, 132, 77, 122, 81, 124, 85, 116, 89, 120, 93, 110, 97, 114, 101, 104, 105, 108, 110, 103, 110, 132}, SKY, {soft = true})
-- dãy sau chân
part(poly{52, 136, 55, 126, 59, 121, 63, 124, 67, 120, 71, 124, 74, 136}, CLOUD, SNOW)
part(poly{54, 136, 57, 130, 61, 132, 65, 128, 69, 131, 73, 129, 74, 136}, SKY, {soft = true})
-- dãy trái, dưới vực
part(poly{0, 132, 6, 127, 12, 125, 17, 122, 25, 118, 30, 121, 36, 123, 44, 125, 50, 127, 53, 134, 30, 146, 14, 157, 0, 157}, CLOUD, SNOW)
part(poly{0, 139, 4, 136, 8, 138, 12, 134, 16, 137, 20, 133, 26, 136, 32, 132, 38, 135, 44, 131, 50, 134, 52, 138, 14, 157, 0, 157}, SKY, {soft = true})

------------------------------------------------------------------ vách đá
-- khối đá nâu đỏ: mặt trên vệt ngang, mặt vách dưới vệt dọc như RWS
local rock = part(poly{14, 134, 20, 130, 28, 128, 38, 127, 46, 129, 56, 134, 66, 133, 76, 131, 86, 134, 96, 130, 102, 128,
  110, 126, 110, 157, 22, 157, 18, 150, 14, 144, 12, 138}, BARK)
each(rock, function(x, y, t)
  if t ~= 3 then return end
  if y >= 141 then
    if x % 6 == 0 and hash(x, y // 5) < 0.55 then put(fig, x, y, BARK[1])          -- khe dọc, đứt đoạn
    elseif x % 6 == 1 and hash(x, y // 5) < 0.55 then put(fig, x, y, BARK[4])      -- mép sáng bên trái khe
    elseif hash(x // 6, y // 5 + 40) < 0.25 then put(fig, x, y, BARK[2]) end        -- mảng tối loang theo cột
  elseif y % 4 == 0 and hash(x // 6, y) < 0.7 then put(fig, x, y, BARK[2])         -- lớp ngang
  elseif y % 4 == 1 and hash(x // 6, y - 1) < 0.7 and x % 7 < 4 then put(fig, x, y, BARK[4]) end
end)
-- trụ đá mép phải
part(poly{100, 104, 104, 100, 110, 98, 110, 128, 102, 130, 100, 118}, TAN, {hi = true})
-- phiến đá vàng xám nhô ra mép vực, và hai phiến thấp
local slab = part(poly{13, 134, 20, 130, 30, 128, 40, 128, 46, 131, 44, 136, 36, 138, 28, 141, 20, 143, 14, 140}, TAN, {hi = true})
part(poly{30, 146, 40, 144, 52, 143, 60, 146, 56, 150, 44, 151, 34, 151}, TAN, {hi = true})
part(poly{62, 140, 72, 138, 80, 141, 76, 145, 66, 145}, TAN, {hi = true})
each(slab, function(x, y, t)
  if t == 3 and y % 4 == 2 and hash(x // 5, y) < 0.6 then put(fig, x, y, TAN[2]) end   -- vân phiến
end)

------------------------------------------------------------------ chó trắng nhảy theo (vật sáng)
local DOG = {soft = true}
-- chân sau xa, đuôi cuộn
part(capsule(94, 148, 93, 157, 1.3), CLOUD, DOG)
part(union(capsule(100, 139, 103, 133, 1.9), capsule(103, 133, 100.5, 130, 1.5)), CLOUD, DOG)
-- thân: ngực cao bên trái, lưng dốc xuống mông bên phải
local dog = part(poly{84, 121, 90, 119, 95, 126, 100, 137, 101, 144, 96, 148, 91, 140, 86, 131}, CLOUD, {hi = true, soft = true})
part(union(ellipse(98, 144, 3.4, 4.5), capsule(99, 148, 100, 157, 1.5)), CLOUD, DOG)   -- đùi sau gần
-- hai chân trước giơ lên chạm ủng
part(union(capsule(86, 125, 77, 128, 1.3), capsule(87, 129, 79, 132, 1.3)), CLOUD, DOG)
-- đầu ngẩng nhìn người, mõm hướng lên-trái, tai dựng
part(union(ellipse(87, 117, 3.8, 3.4), capsule(85, 115, 82, 111, 1.5)), CLOUD, {hi = true, soft = true})
part(poly{89, 114.5, 91.5, 110, 92, 116}, CLOUD, DOG)
put(fig, 81, 111, INK)                                                            -- mũi
-- vài đốm lông xám, cụm 2 px (mục 5)
for _, p in ipairs({{92, 128}, {95, 135}, {90, 134}}) do
  if dog[p[2] * AW + p[1]] == 3 then put(fig, p[1], p[2], CLOUD[2]); put(fig, p[1] + 1, p[2], CLOUD[2]) end
end

------------------------------------------------------------------ người
-- tay nải treo ở đầu gậy
part(union(ellipse(82, 25, 7, 6), capsule(82, 13, 82, 19, 1.5)), BAG, {hi = true})
-- gậy: xiên 3:2 đều nhịp (mục 4), dày 2 px, từ tay trái qua vai lên tay nải
for x = 4, 82 do
  local y = 64 - ((x - 4) * 2) // 3
  put(fig, x, y, BARK[3]); put(fig, x, y + 1, BARK[1])
  dark[y * AW + x], dark[(y + 1) * AW + x] = BARK[1], BARK[1]
end
-- chân sau co, ủng sau chạm đá
part(union(capsule(55, 98, 66, 112, 3.2), capsule(66, 112, 71, 120, 2.6)), TAN)
part(union(capsule(70, 119, 73, 128, 2.8), capsule(72, 129, 77, 131, 2)), BOOT, {hi = true})
-- chân trước đứng thẳng, ủng có cổ lật
part(union(capsule(45, 97, 46, 112, 3.3), capsule(46, 112, 49, 121, 2.8)), TAN, {hi = true})
part(union(capsule(49, 121, 50, 130, 3), capsule(46, 131, 54, 132, 2), ellipse(49, 121, 4.2, 2)), BOOT, {hi = true})
-- tay áo phải xòe, lót đỏ
part(poly{63, 42, 68, 46, 74, 52, 82, 54, 88, 56, 90, 60, 96, 70, 100, 78, 96, 82, 88, 80, 80, 74, 74, 68, 66, 60, 66, 50}, COAT)
part(poly{80, 62, 86, 62, 92, 68, 98, 76, 94, 80, 86, 78, 80, 72}, RED, {hi = true})
-- thân áo đen, gấu xòe
-- hông đẩy về trước-trái, ngực ngả ra sau-phải; vai trái thấp hơn vai phải
local coat = part(poly{40, 46, 49, 41, 61, 40, 66, 43, 66, 54, 62, 66, 64, 76, 70, 84, 73, 89, 68, 93, 60, 96, 50, 97,
  40, 96, 33, 93, 31, 88, 35, 78, 39, 68, 41, 56}, COAT, {hi = true})
-- tay áo trái rủ, lót đỏ
part(poly{41, 45, 30, 48, 22, 54, 16, 58, 20, 64, 24, 72, 30, 80, 34, 80, 37, 64, 42, 52}, COAT)
part(poly{20, 64, 24, 62, 30, 66, 32, 76, 30, 80, 26, 76, 22, 70}, RED, {hi = true})
-- hoa văn áo: lá xanh theo lưới so le, phía tối dùng tông tối (mục 7)
local function leaves(tone)
  each(tone, function(x, y, t)
    if t >= 2 and x % 5 == 1 and y % 5 == (x // 5 % 2) * 2 + 1 then put(fig, x, y, t == 2 and LEAF[3] or GRASS[2]) end
  end)
end
leaves(coat)
-- huy hiệu tròn cam: bánh xe tám nan trên áo RWS, thu về chấm 3×3
for _, p in ipairs({{32, 52}, {41, 51}, {52, 53}, {72, 58}, {40, 63}, {50, 79}, {37, 86}, {57, 88}, {65, 86}, {53, 93}}) do
  local x, y = p[1], p[2]
  for dy = -1, 1 do for dx = -1, 1 do
    if dx == 0 or dy == 0 then put(fig, x + dx, y + dy, (dx == 0 and dy == 0) and RED[2] or GOLD[4]) end
  end end
  put(fig, x - 1, y - 1, GOLD[3]); put(fig, x + 1, y + 1, GOLD[2])
end
-- thắt lưng
part(poly{38, 67, 62, 65, 62, 68, 38, 70}, COAT)
-- cổ tay áo trắng, tay
part(capsule(28, 60, 18, 62, 3), CLOUD, {hi = true, soft = true})
part(capsule(14, 62, 5, 63, 2.4), SKIN, {hi = true})
part(ellipse(86, 55, 2.6, 2.6), CLOUD, {soft = true})
part(capsule(88, 54, 97, 51, 2), SKIN, {hi = true})
-- cổ áo xếp nếp trắng, cổ, đầu ngửa nhìn trời (mặt để trống), mũ vòng lá, lông đỏ
part(poly{46, 42, 52, 40, 60, 40, 63, 44, 56, 47, 48, 47}, CLOUD, {hi = true, soft = true})
part(poly{58, 19, 64, 15, 72, 12, 80, 11, 80, 14, 72, 16, 64, 20, 60, 22}, RED, {hi = true})

-- viền (mục 3): phía khuất sáng là mực; phía nhận sáng là tông 1 của vật, vật sáng thì bỏ trống
local edge = {}
for y = 0, AH - 1 do
  for x = 0, AW - 1 do
    if not opaque(fig, x, y) then
      local lit
      if opaque(fig, x + 1, y) then lit = dark[y * AW + x + 1]
      elseif opaque(fig, x, y + 1) then lit = dark[(y + 1) * AW + x] end
      if lit ~= nil then
        if lit then edge[#edge + 1] = {x, y, lit} end
      elseif opaque(fig, x - 1, y) or opaque(fig, x, y - 1) then edge[#edge + 1] = {x, y, INK} end
    end
  end
end
for _, e in ipairs(edge) do put(fig, e[1], e[2], e[3]) end

-- Đầu vẽ tay từng pixel (hình khối ghép tròn trông như khúc xúc xích). Ngửa nhìn trời: mặt là mặt phẳng
-- chéo 45° hướng lên trên-trái, sống mũi–miệng đứng, cằm hất ra; dải tông 1 dưới hàm tách đầu khỏi cổ;
-- mũ vòng lá phủ đỉnh và gáy (đỉnh đầu ngả ra sau). Cổ ngả theo thân. Mặt để trống.
-- k mực · o viền phía sáng (da tông 1) · 1–5 da · a–d mũ lá sáng → tối
local HEAD = {
  ".....dd.ddd.....",
  "....dabddabbd...",
  "....oabbcabbcdd.",
  "...o4dccdabbccd.",
  "..o44abbdcccdabk",
  "..o443abbcdabbck",
  ".o4443dccabbccdk",
  ".o44333abbdcccdk",
  "o444333abbcabdk.",
  "o443333hdccbcdk.",
  "o443333hhdccdk..",
  ".o4333322hhddk..",
  ".o4333221hhdk...",
  "..o111111khhk...",
  "....o33321kk....",
  "....o333321k....",
  ".....o33321k....",
  ".....o333321k...",
  "......o33321k...",
}
-- mũ vòng lá như RWS: từng lá là cụm 3–4 px (a sáng trên-trái, b thân, c tối), bóng dưới lá là d;
-- mép trên lồi lõm theo đầu lá thay vì vòm trơn. h là tóc nâu lộ ở gáy
local HC = {k = INK, o = SKIN[1], ['1'] = SKIN[1], ['2'] = SKIN[2], ['3'] = SKIN[3], ['4'] = SKIN[4], ['5'] = SKIN[5],
            a = LEAF[4], b = LEAF[3], c = LEAF[2], d = LEAF[1], h = BARK[2]}
for r, row in ipairs(HEAD) do
  for i = 1, #row do
    local ch = row:sub(i, i)
    if ch ~= '.' then put(fig, 44 + i, 21 + r, HC[ch]) end
  end
end

-- hồng trắng là vật mềm: không viền mực
for _, p in ipairs({{97, 49, GRASS[1]}, {98, 47, GRASS[2]}, {98, 46, GRASS[2]}, {99, 45, GRASS[2]}, {99, 44, GRASS[2]},
                    {96, 46, GRASS[3]}, {97, 46, GRASS[2]}, {100, 47, GRASS[3]}, {101, 47, GRASS[2]}}) do
  put(fig, p[1], p[2], p[3])
end
local rose = ellipse(100, 41, 2.6, 2.3)
for y = 37, 45 do for x = 96, 104 do
  if rose(x, y) then put(fig, x, y, (x > 100 and y > 41) and CLOUD[3] or CLOUD[5]) end
end end

------------------------------------------------------------------ số 0 giữa mép trên
for y = 0, 9 do for x = 50, 60 do
  put(fig, x, y, (x == 50 or x == 60 or y == 9) and INK or CREAM)
end end
local ZERO = {"0110", "1001", "1001", "1001", "1001", "0110"}
for r, row in ipairs(ZERO) do
  for i = 1, 4 do if row:sub(i, i) == "1" then put(fig, 52 + i, r + 1, INK) end end
end

------------------------------------------------------------------ ghép lá
local spr = Sprite(W, H, ColorMode.RGB)
local lbg = spr.layers[1]
lbg.name = "nen"
spr.cels[1].image = bg
if REF then
  local ref = Image{fromFile = REF}
  if ref then
    local lref = spr:newLayer()
    lref.name = "tham chieu scan"
    lref.isVisible = false
    spr:newCel(lref, 1, ref, Point(OX, OY))
    lref.stackIndex = 1
  end
end
local lfig = spr:newLayer()
lfig.name = "ve tay"
spr:newCel(lfig, 1, fig, Point(0, 0))
local frame = Image{fromFile = app.fs.joinPath(OUT, "_frame.png")}
if frame then
  local lfr = spr:newLayer()
  lfr.name = "khung"
  spr:newCel(lfr, 1, frame, Point(0, 0))
end
spr:saveAs(app.fs.joinPath(OUT, "the-fool.aseprite"))
spr:saveCopyAs(app.fs.joinPath(OUT, "the-fool.png"))
