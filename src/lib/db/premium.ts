import { and, desc, eq, sql } from "drizzle-orm";
import { db } from ".";
import { achievements, dailyLogs, moods, plantStages, userAchievements, userGoals, userProfiles, workoutSessions } from "./schema";

export type Focus = "stress" | "energy" | "movement" | "balance";

export async function getOrCreateProfile(userId: string) {
  const [existing] = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId));
  if (existing) return existing;
  const [created] = await db.insert(userProfiles).values({ userId }).returning();
  return created;
}

export async function updateProfile(userId: string, patch: Partial<Pick<typeof userProfiles.$inferInsert, "preferredDuration" | "focus" | "onboardingCompleted">>) {
  const current = await getOrCreateProfile(userId);
  const [updated] = await db.update(userProfiles)
    .set({ ...patch, updatedAt: new Date() })
    .where(eq(userProfiles.userId, userId))
    .returning();
  return updated ?? current;
}

export async function getRecentLogs(userId: string, days = 30) {
  const rows = await db.select({
    dayKey: dailyLogs.dayKey,
    mood: moods.name,
    energy: dailyLogs.energy,
    stress: dailyLogs.stress,
    workoutDone: dailyLogs.workoutDone,
  }).from(dailyLogs)
    .leftJoin(moods, eq(dailyLogs.moodId, moods.id))
    .where(eq(dailyLogs.userId, userId))
    .orderBy(desc(dailyLogs.dayKey));
  return rows.slice(0, Math.min(Math.max(days, 1), 90));
}

export async function createWorkoutSession(userId: string, values: typeof workoutSessions.$inferInsert) {
  const [session] = await db.insert(workoutSessions).values({ ...values, userId }).returning();
  return session;
}

export async function completeWorkoutSession(userId: string, sessionId: string, values: Pick<typeof workoutSessions.$inferInsert, "afterEnergy" | "afterStress" | "durationSeconds" | "exercisesCompleted" | "totalExercises">) {
  const [session] = await db.update(workoutSessions)
    .set({ ...values, completedAt: new Date() })
    .where(and(eq(workoutSessions.id, sessionId), eq(workoutSessions.userId, userId)))
    .returning();
  return session;
}

export async function getRecentSessions(userId: string, limit = 30) {
  return db.select().from(workoutSessions)
    .where(eq(workoutSessions.userId, userId))
    .orderBy(desc(workoutSessions.startedAt))
    .limit(Math.min(Math.max(limit, 1), 90));
}

export async function getGoals(userId: string) {
  return db.select().from(userGoals)
    .where(and(eq(userGoals.userId, userId), eq(userGoals.active, true)))
    .orderBy(desc(userGoals.createdAt));
}

export async function upsertDefaultGoal(userId: string, type: string, target: number) {
  const current = await db.select().from(userGoals).where(and(eq(userGoals.userId, userId), eq(userGoals.type, type), eq(userGoals.active, true)));
  if (current.length) {
    const [updated] = await db.update(userGoals).set({ target }).where(eq(userGoals.id, current[0].id)).returning();
    return updated ?? current[0];
  }
  const [created] = await db.insert(userGoals).values({ userId, type, target }).returning();
  return created;
}

export async function getPlantProgress(userId: string) {
  const [plant] = await db.select().from(plantStages).where(eq(plantStages.userId, userId));
  const logs = await db.select({ dayKey: dailyLogs.dayKey, workoutDone: dailyLogs.workoutDone, isWeekendRide: dailyLogs.isWeekendRide })
    .from(dailyLogs)
    .where(eq(dailyLogs.userId, userId));
  const sessions = await db.select({ durationSeconds: workoutSessions.durationSeconds })
    .from(workoutSessions)
    .where(and(eq(workoutSessions.userId, userId), sql`${workoutSessions.completedAt} is not null`));
  const careDays = new Set(logs.map((row) => row.dayKey)).size;
  const minutes = Math.round(sessions.reduce((sum, row) => sum + row.durationSeconds, 0) / 60);
  const completedSessions = sessions.length;
  const stage = plant?.stage ?? 0;
  const unlocked = await getAchievements(userId);
  return { stage, careDays, minutes, completedSessions, growthPercent: Math.round((stage / 12) * 100), achievements: unlocked };
}


export async function syncAchievements(userId: string) {
  const logs = await db.select({ dayKey: dailyLogs.dayKey }).from(dailyLogs).where(eq(dailyLogs.userId, userId));
  const sessions = await db.select({ durationSeconds: workoutSessions.durationSeconds }).from(workoutSessions).where(and(eq(workoutSessions.userId, userId), sql`${workoutSessions.completedAt} is not null`));
  const careDays = new Set(logs.map((row) => row.dayKey)).size;
  const completedSessions = sessions.length;
  const minutes = Math.round(sessions.reduce((sum, row) => sum + row.durationSeconds, 0) / 60);
  const unlocked: string[] = [];
  if (completedSessions >= 1) unlocked.push("first_session");
  if (careDays >= 7) unlocked.push("seven_care_days");
  if (minutes >= 30) unlocked.push("thirty_minutes");
  if (completedSessions >= 7) unlocked.push("seven_sessions");
  for (const achievementId of unlocked) {
    await db.insert(userAchievements).values({ userId, achievementId }).onConflictDoNothing();
  }
  return unlocked;
}

export async function getAchievements(userId: string) {
  return db.select({ id: achievements.id, name: achievements.name, description: achievements.description, unlockedAt: userAchievements.unlockedAt })
    .from(userAchievements)
    .innerJoin(achievements, eq(userAchievements.achievementId, achievements.id))
    .where(eq(userAchievements.userId, userId))
    .orderBy(desc(userAchievements.unlockedAt));
}
