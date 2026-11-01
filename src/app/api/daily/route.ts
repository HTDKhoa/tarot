import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getUser } from "@/lib/supabase/server";
import { dailyDraw } from "@/lib/tarot/draw";
import { composeDaily } from "@/lib/tarot/reader";
import { getCard, toPublic } from "@/lib/tarot/cards";
import { vnDateKey } from "@/lib/config";

/** Lá bài của ngày: miễn phí, không tính hạn mức, cố định trong ngày. */
export async function GET() {
  const { user } = await getUser();
  const jar = await cookies();
  let seed = user?.id ?? jar.get("nguyet_guest")?.value;
  if (!seed) {
    seed = crypto.randomUUID();
    jar.set("nguyet_guest", seed, { httpOnly: true, sameSite: "lax", maxAge: 60 * 60 * 24 * 365, path: "/" });
  }
  const d = await dailyDraw(seed, vnDateKey());
  const card = getCard(d.cardId);
  return NextResponse.json({
    card: { position: 0, positionLabel: "Lá của ngày", card: toPublic(card, d.reversed ? "nguoc" : "xuoi"), reversed: d.reversed, clarifier: false },
    lines: composeDaily(d),
  });
}
