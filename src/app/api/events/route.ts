import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/db/queries";
import { trackWellnessEvent } from "@/lib/db/premium";

const allowed = new Set([
  "home_viewed",
  "checkin_created",
  "recommendation_started",
  "session_started",
  "session_completed",
  "session_after_checkin",
  "coach_opened",
  "coach_message_sent",
  "soundscape_started",
  "garden_opened",
  "insights_opened",
]);

export async function POST(req: Request) {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const body = await req.json().catch(() => null);
  const event = typeof body?.event === "string" ? body.event : "";
  if (!allowed.has(event)) return NextResponse.json({ error: "Evento no permitido" }, { status: 400 });
  await trackWellnessEvent(userId, event);
  return NextResponse.json({ ok: true });
}
