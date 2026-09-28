import { and, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { nextStage, todayKey } from "@/lib/utils";
import { db } from ".";
import { dailyLogs, plantStages } from "./schema";

export async function requireUserId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id ?? null;
}

/** "YYYY-MM-DD" enviado por el cliente (fecha local); si falta, la del servidor. */
export function resolveDayKey(raw: unknown): string {
  if (typeof raw === "string" && /^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  return todayKey();
}

export async function getTodayLog(userId: string, dayKey: string) {
  const [row] = await db
    .select()
    .from(dailyLogs)
    .where(and(eq(dailyLogs.userId, userId), eq(dailyLogs.dayKey, dayKey)));
  return row ?? null;
}

export async function getPlantStage(userId: string): Promise<number> {
  const [row] = await db
    .select()
    .from(plantStages)
    .where(eq(plantStages.userId, userId));
  return row?.stage ?? 0;
}

export interface LogPatch {
  moodId?: string;
  workoutDone?: boolean;
  isWeekendRide?: boolean;
  sosTriggered?: boolean;
}

export async function recordLog(
  userId: string,
  dayKey: string,
  patch: LogPatch,
): Promise<{ before: Awaited<ReturnType<typeof getTodayLog>> }> {
  const before = await getTodayLog(userId, dayKey);
  if (before) {
    await db.update(dailyLogs).set(patch).where(eq(dailyLogs.id, before.id));
  } else {
    await db
      .insert(dailyLogs)
      .values({ userId, dayKey, ...patch })
      .onConflictDoUpdate({
        target: [dailyLogs.userId, dailyLogs.dayKey],
        set: patch,
      });
  }
  // `before` permite al caller saber si el evento es nuevo (p.ej. crecer la
  // planta solo en el primer check-in/paseo del día, nunca en re-POSTs).
  return { before };
}

export async function growPlant(userId: string): Promise<number> {
  const current = await getPlantStage(userId);
  const stage = nextStage(current);
  await db
    .insert(plantStages)
    .values({ userId, stage, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: plantStages.userId,
      set: { stage, updatedAt: new Date() },
    });
  return stage;
}
