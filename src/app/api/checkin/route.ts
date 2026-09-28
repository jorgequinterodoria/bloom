import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { moods } from "@/lib/db/schema";
import { getPlantStage, growPlant, recordLog, requireUserId, resolveDayKey } from "@/lib/db/queries";

export async function POST(req: Request) {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const moodName = typeof body?.mood === "string" ? body.mood : null;
  if (!moodName) return NextResponse.json({ error: "Falta el ánimo" }, { status: 400 });

  const [mood] = await db.select().from(moods).where(eq(moods.name, moodName));
  if (!mood) return NextResponse.json({ error: "Ánimo no encontrado" }, { status: 404 });

  const dayKey = resolveDayKey(body?.day);
  const { before } = await recordLog(userId, dayKey, { moodId: mood.id });
  const stage = before?.moodId
    ? await getPlantStage(userId)
    : await growPlant(userId);
  return NextResponse.json({ ok: true, stage, dayKey });
}
