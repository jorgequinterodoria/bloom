import { NextResponse } from "next/server";
import { getPlantStage, growPlant, recordLog, requireUserId, resolveDayKey } from "@/lib/db/queries";

export async function POST(req: Request) {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const dayKey = resolveDayKey(body?.day);
  const { before } = await recordLog(userId, dayKey, { isWeekendRide: true });
  const stage = before?.isWeekendRide
    ? await getPlantStage(userId)
    : await growPlant(userId);
  return NextResponse.json({ ok: true, stage, dayKey });
}
