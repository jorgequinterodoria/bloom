import { NextResponse } from "next/server";
import { getPlantStage, requireUserId } from "@/lib/db/queries";

export async function GET() {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const stage = await getPlantStage(userId);
  return NextResponse.json({ stage });
}
