import { NextResponse } from "next/server";
import { getTodayLog, requireUserId } from "@/lib/db/queries";
import { todayKey } from "@/lib/utils";
import { getOrCreateProfile, getRecentLogs } from "@/lib/db/premium";
import { buildRecommendation } from "@/lib/recommendations";

export async function GET() {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const dayKey = todayKey();
  const today = await getTodayLog(userId, dayKey);
  const profile = await getOrCreateProfile(userId);
  const recent = await getRecentLogs(userId, 7);
  const currentEnergy = today?.energy ?? recent[0]?.energy ?? 3;
  const currentStress = today?.stress ?? recent[0]?.stress ?? 3;
  const recommendation = buildRecommendation({
    energy: currentEnergy,
    stress: currentStress,
    mood: null,
    preferredDuration: profile?.preferredDuration ?? 15,
    recentStress: recent.map((item) => item.stress),
    recentEnergy: recent.map((item) => item.energy),
  });

  return NextResponse.json({
    recommendation,
    profile: {
      preferredDuration: profile?.preferredDuration ?? 15,
      focus: profile?.focus ?? "balance",
      onboardingCompleted: Boolean(profile?.onboardingCompleted),
    },
    current: { energy: currentEnergy, stress: currentStress, mood: recent[0]?.mood ?? null },
  });
}
