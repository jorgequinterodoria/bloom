import { NextResponse } from "next/server";
import { getWellnessEventCounts } from "@/lib/db/premium";
import { requireUserId } from "@/lib/db/queries";

export async function GET() {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  return NextResponse.json({ events: await getWellnessEventCounts(userId) });
}
