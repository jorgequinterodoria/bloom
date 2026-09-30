import { NextResponse } from "next/server";
import { getTodayLog, requireUserId, resolveDayKey } from "@/lib/db/queries";

export async function GET(req: Request) {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const dayKey = resolveDayKey(searchParams.get("day"));
  const log = await getTodayLog(userId, dayKey);
  return NextResponse.json({
    checkedIn: Boolean(log?.moodId),
    moodId: log?.moodId ?? null,
    energy: typeof log?.energy === "number" ? log.energy : 3,
    stress: typeof log?.stress === "number" ? log.stress : 3,
    note: log?.note ?? "",
    workoutDone: log?.workoutDone ?? false,
    weekendRide: log?.isWeekendRide ?? false,
    sosTriggered: log?.sosTriggered ?? false,
    dayKey,
  });
}
