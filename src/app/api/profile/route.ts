import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/db/queries";
import { getOrCreateProfile, updateProfile } from "@/lib/db/premium";

const allowedFocus = new Set(["stress", "energy", "movement", "balance"]);
const allowedDurations = new Set([5, 10, 15, 20, 25, 30]);

export async function GET() {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  return NextResponse.json({ profile: await getOrCreateProfile(userId) });
}

export async function PATCH(req: Request) {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const body = await req.json().catch(() => null);
  const preferredDuration = Number(body?.preferredDuration);
  const focus = typeof body?.focus === "string" ? body.focus : null;
  const onboardingCompleted = typeof body?.onboardingCompleted === "boolean" ? body.onboardingCompleted : undefined;

  if (!allowedDurations.has(preferredDuration) || !focus || !allowedFocus.has(focus)) {
    return NextResponse.json({ error: "Preferencias no válidas" }, { status: 400 });
  }

  const profile = await updateProfile(userId, { preferredDuration, focus, onboardingCompleted });
  return NextResponse.json({ profile });
}
