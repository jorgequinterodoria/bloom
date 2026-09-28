import { NextResponse } from "next/server";
import { recordLog, requireUserId, resolveDayKey } from "@/lib/db/queries";

export async function POST(req: Request) {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const dayKey = resolveDayKey(body?.day);
  await recordLog(userId, dayKey, { workoutDone: true });
  return NextResponse.json({ ok: true, dayKey });
}
