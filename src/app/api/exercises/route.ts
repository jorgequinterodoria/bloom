import { asc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { exercises, moods } from "@/lib/db/schema";
import { requireUserId } from "@/lib/db/queries";

export async function GET(req: Request) {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const moodName = searchParams.get("mood");
  if (!moodName) return NextResponse.json({ error: "Falta el ánimo" }, { status: 400 });

  const [mood] = await db
    .select()
    .from(moods)
    .where(eq(moods.name, moodName));
  if (!mood) return NextResponse.json({ error: "Ánimo no encontrado" }, { status: 404 });

  const rows = await db
    .select()
    .from(exercises)
    .where(eq(exercises.moodId, mood.id))
    .orderBy(asc(exercises.position));

  return NextResponse.json({
    mood: mood.name,
    exercises: rows.map((r) => ({
      name: r.name,
      durationSeconds: r.durationSeconds,
      instructions: r.instructions,
      illustration: r.illustration,
    })),
  });
}
