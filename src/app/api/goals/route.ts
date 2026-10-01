import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/db/queries";
import { getGoals, upsertDefaultGoal } from "@/lib/db/premium";

const goalTypes = new Set(["stress", "energy", "movement", "consistency"]);

export async function GET() {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  return NextResponse.json({ goals: await getGoals(userId) });
}

export async function POST(req: Request) {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const body = await req.json().catch(() => null);
  const type = typeof body?.type === "string" ? body.type : "consistency";
  const target = Math.round(Number(body?.target));
  if (!goalTypes.has(type) || !Number.isFinite(target) || target < 1 || target > 100) {
    return NextResponse.json({ error: "Meta no válida" }, { status: 400 });
  }
  return NextResponse.json({ goal: await upsertDefaultGoal(userId, type, target) });
}
