import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { PLANS, type PlanId } from "./plans";
import { vnMonthStart } from "./config";
import { getCard, toPublic } from "./tarot/cards";
import type { Draw } from "./tarot/draw";
import type { DrawnCard, ReaderLine } from "./tarot/types";

export interface PlanStatus {
  plan: PlanId;
  expiresAt: string | null;
  used: number;
  limit: number;
}

export async function getPlanStatus(supabase: SupabaseClient, userId: string): Promise<PlanStatus> {
  const [{ data: sub }, { count }] = await Promise.all([
    supabase.from("subscriptions").select("plan, expires_at").eq("user_id", userId).maybeSingle(),
    supabase
      .from("readings")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", vnMonthStart().toISOString()),
  ]);
  const active = sub && new Date(sub.expires_at) > new Date();
  const plan: PlanId = active ? (sub.plan as PlanId) : "free";
  return { plan, expiresAt: active ? sub.expires_at : null, used: count ?? 0, limit: PLANS[plan].readingsPerMonth };
}

export function toDrawnCards(draws: Draw[], labels: string[], clarifier = false, offset = 0): DrawnCard[] {
  return draws.map((d, i) => ({
    position: offset + i,
    positionLabel: clarifier ? `Làm rõ ${offset + i - labels.length + 1}` : labels[i],
    card: toPublic(getCard(d.cardId), d.reversed ? "nguoc" : "xuoi"),
    reversed: d.reversed,
    clarifier,
  }));
}

export async function saveLines(supabase: SupabaseClient, readingId: string, lines: ReaderLine[]) {
  if (!lines.length) return;
  await supabase.from("messages").insert(lines.map((l) => ({ reading_id: readingId, role: "nguyet", tag: l.tag, text: l.text })));
}
