import { loadEnv } from "../src/lib/load-env";

loadEnv();

async function main() {
  const { db } = await import("../src/lib/db");
  const { moods, exercises } = await import("../src/lib/db/schema");
  const { MOODS, EXERCISE_LIBRARY } = await import("../src/lib/constants");
  const { eq } = await import("drizzle-orm");

  for (const moodDef of MOODS) {
    const [inserted] = await db
      .insert(moods)
      .values({ name: moodDef.name })
      .onConflictDoNothing({ target: moods.name })
      .returning();
    const [row] = inserted
      ? [inserted]
      : await db.select().from(moods).where(eq(moods.name, moodDef.name));
    const flow = EXERCISE_LIBRARY[moodDef.name];
    const existing = await db
      .select()
      .from(exercises)
      .where(eq(exercises.moodId, row.id));
    if (existing.length > 0) continue;
    await db.insert(exercises).values(
      flow.map((ex, i) => ({
        name: ex.name,
        durationSeconds: ex.durationSeconds,
        position: i,
        moodId: row.id,
      })),
    );
  }
  console.log("Seed completo: 4 ánimos + flujos de ejercicios.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
