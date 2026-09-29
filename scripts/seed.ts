import { loadEnv } from "../src/lib/load-env";

loadEnv();

const EXERCISE_DETAILS: Record<string, string> = {
  "Respiración 4-7-8":
    "Siéntate cómodo. Inhala por la nariz contando 4, sostén 7 y exhala por la boca contando 8. Repite suavemente.",
  "Estiramiento de cuello":
    "Inclina la oreja hacia el hombro y mantén 15 segundos. Cambia de lado sin forzar, con la espalda recta.",
  "Relajación de hombros":
    "Sube los hombros hacia las orejas, sostén 3 segundos y déjalos caer. Repite 5 veces respirando lento.",
  "Torsión suave de espalda":
    "Sentado, gira el torso hacia un lado apoyando la mano en la silla. Mantén 10 segundos y cambia.",
  "Respiración profunda":
    "Inhala contando 4 mientras inflas el vientre, pausa 2 y exhala contando 6. Sigue el ritmo del círculo.",
  "Mariposa sentado":
    "Junta las plantas de los pies y deja caer las rodillas. Sujeta los pies y mantente suave mientras respiras.",
  "Rodillas al pecho":
    "Tumbado, abraza una rodilla contra el pecho y mantén 15 segundos. Cambia de pierna sin levantar la cabeza.",
  "Abrazo con respiración":
    "Cruza los brazos sobre el pecho como un abrazo y aprieta suavemente. Inhala 4 y exhala 6 con los ojos cerrados.",
  "Marcha en el sitio":
    "Marcha levantando las rodillas a la altura de la cadera. Mueve los brazos al ritmo de la respiración.",
  "Rotación de brazos":
    "Extiende los brazos a los lados y haz círculos suaves, primero hacia adelante y luego hacia atrás.",
  "Sentadillas suaves":
    "Baja como si te sentaras en una silla, con las rodillas alineadas sobre los pies. Sube sin bloquearlas.",
  "Rebotes ligeros":
    "Salta muy suave en puntillas, casi sin despegarte. Mantén las rodillas blandas y respira estable.",
  "Bostezo con estiramiento":
    "Bosteza mientras estiras los brazos hacia arriba. Alarga la exhalación para soltar tensión.",
  "Gato-vaca":
    "Cuatro apoyos, redondea la espalda al inhalar y húndela al exhalar. Mueve despacio, vértebra a vértebra.",
  "Postura de la montaña":
    "Pies al ancho de los hombros, brazos a los lados, mirada al frente. Mantén la postura respirando calmado.",
  "Caminata lenta en el sitio":
    "Camina en el sitio muy despacio, notando cómo cada pie se apoya en el suelo. Dura todo el ejercicio.",
};

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

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
    const byName = new Map(existing.map((r) => [r.name, r]));

    for (const [i, ex] of flow.entries()) {
      const instructions = EXERCISE_DETAILS[ex.name] ?? null;
      const illustration = `/exercises/${slugify(ex.name)}.svg`;
      const found = byName.get(ex.name);
      if (found) {
        if (
          found.instructions !== instructions ||
          found.illustration !== illustration
        ) {
          await db
            .update(exercises)
            .set({ instructions, illustration })
            .where(eq(exercises.id, found.id));
        }
      } else {
        await db.insert(exercises).values({
          name: ex.name,
          durationSeconds: ex.durationSeconds,
          position: i,
          moodId: row.id,
          instructions,
          illustration,
        });
      }
    }
  }
  console.log("Seed completo: 4 ánimos + flujos con explicaciones.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
