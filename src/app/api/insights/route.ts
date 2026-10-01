import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/db/queries";
import { getRecentLogs, getRecentSessions } from "@/lib/db/premium";

export async function GET(req: Request) {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const days = Math.min(90, Math.max(7, Number(searchParams.get("days") ?? 30)));
  const [logs, sessions] = await Promise.all([getRecentLogs(userId, days), getRecentSessions(userId, days)]);

  const energy = logs.map((x) => x.energy);
  const stress = logs.map((x) => x.stress);
  const completed = sessions.filter((session) => session.completedAt);
  const avg = (values: number[]) => values.length ? Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10 : 0;
  const previous = logs.slice(Math.floor(logs.length / 2));
  const current = logs.slice(0, Math.ceil(logs.length / 2));
  const currentStress = avg(current.map((x) => x.stress));
  const previousStress = avg(previous.map((x) => x.stress));
  const deltaStress = previousStress && currentStress ? Math.round((currentStress - previousStress) * 10) / 10 : 0;
  const currentEnergy = avg(current.map((x) => x.energy));
  const previousEnergy = avg(previous.map((x) => x.energy));
  const deltaEnergy = previousEnergy && currentEnergy ? Math.round((currentEnergy - previousEnergy) * 10) / 10 : 0;
  const workoutMinutes = Math.round(completed.reduce((sum, session) => sum + session.durationSeconds, 0) / 60);
  const stressHighDays = logs.filter((x) => x.stress >= 4).length;
  const measured = completed.filter((session) => session.afterStress !== null || session.afterEnergy !== null);
  const avgDelta = (values: number[]) => values.length ? Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 10) / 10 : 0;
  const stressDeltas = measured.filter((session) => session.afterStress !== null).map((session) => session.afterStress! - session.beforeStress);
  const energyDeltas = measured.filter((session) => session.afterEnergy !== null).map((session) => session.afterEnergy! - session.beforeEnergy);
  const helpedSessions = measured.filter((session) => (session.afterStress ?? session.beforeStress) < session.beforeStress || (session.afterEnergy ?? session.beforeEnergy) > session.beforeEnergy).length;

  return NextResponse.json({
    periodDays: days,
    totals: { checkins: logs.length, sessions: completed.length, workoutMinutes },
    averages: { energy: avg(energy), stress: avg(stress) },
    deltas: { energy: deltaEnergy, stress: deltaStress },
    impact: { avgStressDelta: avgDelta(stressDeltas), avgEnergyDelta: avgDelta(energyDeltas), measuredSessions: measured.length, helpedSessions },
    patterns: {
      stressHighDays,
      favoriteMood: logs.reduce<Record<string, number>>((acc, item) => {
        if (item.mood) acc[item.mood] = (acc[item.mood] ?? 0) + 1;
        return acc;
      }, {}),
    },
    sessions: completed.slice(0, 12).map((session) => ({
      id: session.id,
      dayKey: session.dayKey,
      mood: session.mood,
      durationSeconds: session.durationSeconds,
      beforeStress: session.beforeStress,
      afterStress: session.afterStress,
      beforeEnergy: session.beforeEnergy,
      afterEnergy: session.afterEnergy,
    })),
    series: logs.slice().reverse().map((item) => ({ dayKey: item.dayKey, energy: item.energy, stress: item.stress })),
  });
}
