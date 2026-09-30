import { NextResponse } from "next/server";
import { getWeeklyHistory, requireUserId } from "@/lib/db/queries";

export async function GET(req: Request) {
    const userId = await requireUserId();
    if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const days = Number(searchParams.get("days") ?? "7");
    const history = await getWeeklyHistory(userId, Number.isFinite(days) ? days : 7);

    return NextResponse.json({ history });
}
