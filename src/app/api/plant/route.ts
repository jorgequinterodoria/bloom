import { NextResponse } from "next/server";
import { getPlantProgress } from "@/lib/db/premium";
import { requireUserId } from "@/lib/db/queries";

export async function GET() {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  return NextResponse.json(await getPlantProgress(userId));
}
