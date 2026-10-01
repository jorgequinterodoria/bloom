import { NextResponse } from "next/server";
import { getTodayLog, requireUserId } from "@/lib/db/queries";
import { answerCoach, buildCoachBrief } from "@/lib/coach";
import { createCoachMessage, getCoachMessages, getOrCreateProfile, getRecentLogs, getRecentSessions, trackWellnessEvent } from "@/lib/db/premium";
import { todayKey } from "@/lib/utils";

export async function GET() {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const day = todayKey();
  const [today, recent, sessions, profile, messages] = await Promise.all([
    getTodayLog(userId, day),
    getRecentLogs(userId, 14),
    getRecentSessions(userId, 30),
    getOrCreateProfile(userId),
    getCoachMessages(userId, 20),
  ]);
  const context = {
    latest: today ? { dayKey: today.dayKey, mood: recent.find((item) => item.dayKey === today.dayKey)?.mood ?? null, energy: today.energy, stress: today.stress, note: today.note } : (recent[0] ?? null),
    recent,
    sessions: sessions.map((session) => ({ beforeStress: session.beforeStress, afterStress: session.afterStress, beforeEnergy: session.beforeEnergy, afterEnergy: session.afterEnergy, durationSeconds: session.durationSeconds, dayKey: session.dayKey })),
    preferredDuration: profile.preferredDuration,
    focus: profile.focus,
  };
  const brief = buildCoachBrief(context);
  return NextResponse.json({ brief, messages, latest: context.latest ? { energy: context.latest.energy, stress: context.latest.stress, mood: context.latest.mood } : null });
}

export async function POST(req: Request) {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const body = await req.json().catch(() => null);
  const message = typeof body?.message === "string" ? body.message.trim().slice(0, 500) : "";
  if (!message) return NextResponse.json({ error: "Falta el mensaje" }, { status: 400 });

  const [today, recent, sessions, profile] = await Promise.all([
    getTodayLog(userId, todayKey()),
    getRecentLogs(userId, 14),
    getRecentSessions(userId, 30),
    getOrCreateProfile(userId),
  ]);
  const context = {
    latest: today ? { dayKey: today.dayKey, mood: recent.find((item) => item.dayKey === today.dayKey)?.mood ?? null, energy: today.energy, stress: today.stress, note: today.note } : (recent[0] ?? null),
    recent,
    sessions: sessions.map((session) => ({ beforeStress: session.beforeStress, afterStress: session.afterStress, beforeEnergy: session.beforeEnergy, afterEnergy: session.afterEnergy, durationSeconds: session.durationSeconds, dayKey: session.dayKey })),
    preferredDuration: profile.preferredDuration,
    focus: profile.focus,
  };
  const reply = answerCoach(message, context);
  await createCoachMessage(userId, "user", message);
  await createCoachMessage(userId, "assistant", reply.body);
  await trackWellnessEvent(userId, "coach_message_sent");
  return NextResponse.json({ reply });
}
