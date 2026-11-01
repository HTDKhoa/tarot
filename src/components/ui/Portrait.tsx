"use client";
import { useEffect, useState } from "react";
import { assetUrl } from "@/lib/assets";
import { useScene } from "@/lib/store";
import { EYE_GLOW } from "@/lib/tarot/emotion";

const P = "/assets/portrait";
const SPEAK = [0, 1, 2, 1];

/**
 * Ô chân dung Nguyệt trong hộp thoại, dùng ở góc mặt bàn (lúc không thấy mặt nàng).
 * Cắt từ chính sprite của Nguyệt: miệng mấp máy khi nói, thỉnh thoảng chớp mắt,
 * mắt trăng khuyết đổi màu theo cảm xúc như ở cảnh 3D.
 */
export function Portrait() {
  const speaking = useScene((s) => s.speaking);
  const tag = useScene((s) => s.tag);
  const [frame, setFrame] = useState(0);
  const [blink, setBlink] = useState(false);

  useEffect(() => {
    if (!speaking) return;
    const t = setInterval(() => setFrame((f) => (f + 1) % SPEAK.length), 110);
    return () => clearInterval(t);
  }, [speaking]);

  useEffect(() => {
    let alive = true;
    let timer: ReturnType<typeof setTimeout>;
    const next = () => {
      timer = setTimeout(() => {
        if (!alive) return;
        setBlink(true);
        setTimeout(() => alive && setBlink(false), 140);
        next();
      }, 2500 + Math.random() * 4000);
    };
    next();
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, []);

  const closed = blink && !speaking;
  const src = speaking ? `${P}/nguyet_speak_${SPEAK[frame]}.png` : closed ? `${P}/nguyet_blink.png` : `${P}/nguyet_idle.png`;
  const glow = assetUrl(`${P}/nguyet_glow.png`);
  return (
    <span className="portrait" aria-hidden>
      <img src={assetUrl(src)} alt="" />
      {!closed && (
        <span
          className="portrait-eye"
          style={{ maskImage: `url("${glow}")`, WebkitMaskImage: `url("${glow}")`, backgroundColor: EYE_GLOW[tag].color }}
        />
      )}
    </span>
  );
}
