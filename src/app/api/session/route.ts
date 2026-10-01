import { NextResponse } from "next/server";
import { recordLog, requireUserId, resolveDayKey } from "@/lib/db/queries";
import { completeWorkoutSession, createWorkoutSession, syncAchievements, trackWellnessEvent } from "@/lib/db/premium";

const clamp = (value: unknown, fallback = 3) => {
  const number = Number(value);
  return Number.isFinite(number) ? Math.min(5, Math.max(1, Math.round(number))) : fallback;
};

export async function POST(req: Request) {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const body = await req.json().catch(() => null);
  const action = body?.action;

  if (action === "start") {
    const mood = typeof body?.mood === "string" ? body.mood.slice(0, 50) : null;
    const totalExercises = Math.max(0, Math.min(100, Math.round(Number(body?.totalExercises) || 0)));
    const durationSeconds = Math.max(0, Math.min(7200, Math.round(Number(body?.durationSeconds) || 0)));
    if (!mood || !totalExercises || !durationSeconds) {
      return NextResponse.json({ error: "Sesión incompleta" }, { status: 400 });
    }
    const dayKey = resolveDayKey(body?.day);
    const session = await createWorkoutSession(userId, {
      dayKey,
      mood,
      beforeEnergy: clamp(body?.beforeEnergy),
      beforeStress: clamp(body?.beforeStress),
      durationSeconds,
      totalExercises,
      exercisesCompleted: 0,
    });
    await trackWellnessEvent(userId, "session_started", { duration: durationSeconds, exercises: totalExercises });
    return NextResponse.json({ ok: true, sessionId: session.id });
  }

  if (action === "complete") {
    const sessionId = typeof body?.sessionId === "string" ? body.sessionId : null;
    if (!sessionId) return NextResponse.json({ error: "Falta la sesión" }, { status: 400 });
    const session = await completeWorkoutSession(userId, sessionId, {
      afterEnergy: clamp(body?.afterEnergy),
      afterStress: clamp(body?.afterStress),
      durationSeconds: Math.max(0, Math.min(7200, Math.round(Number(body?.durationSeconds) || 0))),
      exercisesCompleted: Math.max(0, Math.min(100, Math.round(Number(body?.exercisesCompleted) || 0))),
      totalExercises: Math.max(0, Math.min(100, Math.round(Number(body?.totalExercises) || 0))),
    });
    if (!session) return NextResponse.json({ error: "Sesión no encontrada" }, { status: 404 });
    await recordLog(userId, session.dayKey, { workoutDone: true });
    await Promise.all([syncAchievements(userId), trackWellnessEvent(userId, "session_completed", { duration: session.durationSeconds, exercises: session.exercisesCompleted })]);
    await trackWellnessEvent(userId, "session_after_checkin", { stressDelta: (session.afterStress ?? session.beforeStress) - session.beforeStress, energyDelta: (session.afterEnergy ?? session.beforeEnergy) - session.beforeEnergy });
    return NextResponse.json({ ok: true, session });
  }

  return NextResponse.json({ error: "Acción no válida" }, { status: 400 });
}
