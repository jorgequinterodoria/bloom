# Timer de ejercicio e ilustraciones — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Mostrar temporizador visible (segundos restantes + barra) e ilustración SVG + pasos de texto por ejercicio en el WorkoutPlayer, con datos servidos desde la BD.

**Architecture:** Dos columnas nuevas en `exercises` (`instructions`, `illustration`) con migración Drizzle y backfill idempotente en el seed; la API `GET /api/exercises` amplía su respuesta (aditivo); `WorkoutPlayer` renderiza timer, `<Image>` del SVG y pasos; 16 SVGs propios en `public/exercises/` entran al allowlist del service worker.

**Tech Stack:** Next.js 15 App Router, Drizzle ORM + Neon, Vitest + RTL, Tailwind v4 (tokens semánticos), next/image (`unoptimized`).

**Diseño validado:** `docs/plans/2026-09-29-exercises-timer-illustrations-design.md`

**Notas de entorno:** se trabaja directamente en `main` (el usuario pidió una sola rama). Gates en cada tarea: `npm run lint && npm run typecheck && npm test && npm run build`. Baseline de tests: **55 (11 suites)** → final **58**.

---

### Task 1: Esquema + migración

**Files:**
- Modify: `src/lib/db/schema.ts:1-10,27-35`
- Create (generado): `drizzle/0001_*.sql` (resultado de `db:generate`)

**Step 1: Añadir columnas al esquema**

En `src/lib/db/schema.ts` — añade `text` al import de `drizzle-orm/pg-core` (líneas 1-10) y las dos columnas en `exercises` (tras `position`, antes de `moodId`):

```ts
import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
```

```ts
export const exercises = pgTable("exercises", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  durationSeconds: integer("duration_seconds").notNull(),
  position: integer("position").notNull().default(0),
  instructions: text("instructions"),
  illustration: varchar("illustration", { length: 255 }),
  moodId: uuid("mood_id")
    .references(() => moods.id)
    .notNull(),
});
```

(Deja el resto del archivo intacto — relaciones, otras tablas.)

**Step 2: Generar la migración**

```bash
npm run db:generate
```

Expected: crea un archivo nuevo `drizzle/0001_<nombre>.sql` con dos `ALTER TABLE "exercises" ADD COLUMN ...` (ambos nullable, sin DROP). Verifica con `cat drizzle/0001_*.sql`.

**Step 3: Aplicar a Neon**

```bash
npm run db:migrate
```

Expected: termina sin error (el `DATABASE_URL` real vive en `.env`, nunca imprimirlo).

**Step 4: Verificar en la BD**

```bash
psql "$DATABASE_URL" -c "select count(*) as total, count(instructions) as con_instr, count(illustration) as con_img from exercises;"
```

Expected: `total=16, con_instr=0, con_img=0` (columnas creadas, seed aún sin backfill).

**Step 5: Gates**

```bash
npm run typecheck && npm test
```

Expected: PASS (55 tests — nadie consume las columnas aún).

**Step 6: Commit**

```bash
git add -A && git commit -m "feat: columnas de instrucciones e ilustración en ejercicios"
```

---

### Task 2: Seed con backfill

**Files:**
- Modify: `scripts/seed.ts` (reemplazo completo abajo)

**Step 1: Reemplazar `scripts/seed.ts`**

```ts
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
```

Cambios clave: se elimina el `if (existing.length > 0) continue;` (antes saltaba el backfill) y cada ejercicio existente se actualiza si sus campos difieren → idempotente Y correctivo.

**Step 2: Ejecutar dos veces (idempotencia)**

```bash
npm run db:seed && npm run db:seed
```

Expected: ambas veces "Seed completo: 4 ánimos + flujos con explicaciones."

**Step 3: Verificar backfill**

```bash
psql "$DATABASE_URL" -c "select count(*) as total, count(instructions) as con_instr, count(illustration) as con_img from exercises;"
psql "$DATABASE_URL" -c "select name, illustration from exercises order by position limit 4;"
```

Expected: `total=16, con_instr=16, con_img=16`; rutas tipo `/exercises/respiracion-4-7-8.svg`.

**Step 4: Gates**

```bash
npm run lint && npm run typecheck && npm test
```

Expected: PASS (55).

**Step 5: Commit**

```bash
git add -A && git commit -m "feat: seed con instrucciones e ilustraciones de ejercicios"
```

---

### Task 3: API ampliada

**Files:**
- Modify: `src/app/api/exercises/route.ts:27-33`

**Step 1: Devolver los campos nuevos**

Reemplaza el `NextResponse.json` final por:

```ts
  return NextResponse.json({
    mood: mood.name,
    exercises: rows.map((r) => ({
      name: r.name,
      durationSeconds: r.durationSeconds,
      instructions: r.instructions,
      illustration: r.illustration,
    })),
  });
}
```

**Step 2: Gates**

```bash
npm run lint && npm run typecheck && npm test
```

Expected: PASS (55). (Smoke vivo de la API → Task 6.)

**Step 3: Commit**

```bash
git add -A && git commit -m "feat: API de ejercicios incluye instrucciones e ilustración"
```

---

### Task 4: WorkoutPlayer — timer + explicación (TDD)

**Files:**
- Modify: `src/components/workout/WorkoutPlayer.tsx`
- Test: `src/components/workout/WorkoutPlayer.test.tsx`

**Step 1: Tests fallidos (añadir al final del `describe` existente)**

```tsx
  it("muestra el temporizador y descuenta los segundos", async () => {
    vi.useFakeTimers();
    render(<WorkoutPlayer />);
    await flushLoad();

    expect(screen.getByText("60 s")).toBeInTheDocument();
    const bar = screen.getByRole("progressbar", { name: /progreso del ejercicio/i });
    expect(bar).toHaveAttribute("aria-valuenow", "0");

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByText("59 s")).toBeInTheDocument();
    expect(bar).toHaveAttribute("aria-valuenow", "1");
  });

  it("muestra la ilustración y las instrucciones del ejercicio", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              mood: "Ansiosa",
              exercises: [
                {
                  name: "Respiración profunda",
                  durationSeconds: 60,
                  instructions: "Inhala contando 4 y exhala contando 6.",
                  illustration: "/exercises/respiracion-profunda.svg",
                },
              ],
            }),
        }),
      ),
    );
    render(<WorkoutPlayer />);
    expect(
      await screen.findByText("Inhala contando 4 y exhala contando 6."),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: "Respiración profunda" }),
    ).toHaveAttribute("src", "/exercises/respiracion-profunda.svg");
  });

  it("omite la explicación cuando faltan instrucciones o ilustración", async () => {
    const { container } = render(<WorkoutPlayer />);
    expect(await screen.findByText("Respiración profunda")).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(container.querySelector("p.mx-auto.max-w-sm")).toBeNull();
  });
```

(El fixture base ya no incluye los campos nuevos → sirve para el test de "faltan datos". `getByRole("progressbar", {name})` requiere `aria-label` en el componente del paso 3.)

**Amendamiento durante la ejecución:** el matcher original `queryByText(/inhala/i)` colisionaba con el párrafo `sr-only` existente ("inhala lentamente"), que sí debe seguir renderizándose; se reemplazó por un selector del párrafo de instrucciones (`p.mx-auto.max-w-sm`), que conserva la intención del test.

**Step 2: Ejecutar → FAIL**

```bash
npx vitest run src/components/workout/WorkoutPlayer.test.tsx
```

Expected: FAIL — "60 s" no existe (el `timeLeft` nunca se renderiza), progressbar no existe, y con el fixture nuevo tampoco hay img/instrucciones.

**Step 3: Implementar en `WorkoutPlayer.tsx`**

3a. Añade el import de `next/image` (junto a los otros imports):

```tsx
import Image from "next/image";
```

3b. Amplía la interfaz:

```tsx
interface Exercise {
  name: string;
  durationSeconds: number;
  instructions?: string | null;
  illustration?: string | null;
}
```

3c. En el bloque `return` principal, reemplaza el contenido del `div` central (el que tiene `className="flex flex-col items-center gap-8"`, desde el `<p className="sr-only">` hasta el `<p aria-live="polite">` de "Ejercicio N de M") por:

```tsx
      <div className="flex flex-col items-center gap-6">
        <p className="sr-only">
          Respira siguiendo el círculo: inhala lentamente y exhala despacio.
        </p>
        <div className="relative flex h-64 w-64 items-center justify-center">
          <motion.div
            aria-hidden
            className="absolute inset-0 rounded-full bg-primary-soft"
            animate={reduce ? {} : paused ? { scale: 1 } : { scale: [1, 1.18, 1] }}
            transition={
              paused
                ? { duration: 0.4 }
                : { duration: 8, repeat: Infinity, ease: "easeInOut" }
            }
          />
          <motion.div
            aria-hidden
            className="absolute inset-6 rounded-full bg-accent-soft/70"
            animate={reduce ? {} : paused ? { scale: 1 } : { scale: [1, 1.12, 1] }}
            transition={
              paused
                ? { duration: 0.4 }
                : { duration: 8, repeat: Infinity, ease: "easeInOut", delay: 0.4 }
            }
          />
          <h1 className="relative z-10 max-w-[10rem] font-serif text-2xl leading-snug text-ink">
            {current.name}
          </h1>
        </div>

        <div className="w-full max-w-xs space-y-1.5">
          <p className="text-sm text-ink">{timeLeft} s</p>
          <div
            role="progressbar"
            aria-label="Progreso del ejercicio"
            aria-valuemin={0}
            aria-valuemax={current.durationSeconds}
            aria-valuenow={current.durationSeconds - timeLeft}
            className="h-2 w-full overflow-hidden rounded-full bg-primary-soft"
          >
            <div
              className="h-full rounded-full bg-primary"
              style={{
                width: `${((current.durationSeconds - timeLeft) / current.durationSeconds) * 100}%`,
              }}
            />
          </div>
        </div>

        <p aria-live="polite" className="text-sm text-ink-muted">
          Ejercicio {index + 1} de {exercises.length}
        </p>

        {current.illustration && (
          <Image
            unoptimized
            src={current.illustration}
            alt={current.name}
            width={320}
            height={160}
            className="h-40 w-auto"
          />
        )}
        {current.instructions && (
          <p className="mx-auto max-w-sm text-sm leading-relaxed text-ink-muted">
            {current.instructions}
          </p>
        )}
      </div>
```

Notas:
- `gap-8` → `gap-6` para acomodar el contenido extra; sin `transition` en la barra (se actualiza discretamente, permite reduced-motion).
- `Image unoptimized` evita el optimizer de next/image para SVGs (sin `dangerouslyAllowSVG`) y la regla `@next/next/no-img-element`. Si en jsdom `next/image` diera problemas de render, fallback: `<img>` plano con `// eslint-disable-next-line @next/next/no-img-element` — reporta cuál usaste.
- Todo lo demás del componente (estados, efectos, botones, finished/error) queda intacto.

**Step 4: Ejecutar → PASS**

```bash
npx vitest run src/components/workout/WorkoutPlayer.test.tsx
```

Expected: 8/8 (5 existentes + 3 nuevos).

**Step 5: Gates**

```bash
npm run lint && npm run typecheck && npm test && npm run build
```

Expected: PASS — **58 tests / 11 suites**.

**Step 6: Commit**

```bash
git add -A && git commit -m "feat: timer visible e ilustración en el reproductor de ejercicio"
```

---

### Task 5: 16 SVGs + allowlist del service worker

**Files:**
- Create: `public/exercises/<slug>.svg` × 16 (bloques abajo)
- Modify: `public/sw.js:2`

**Step 1: Allowlist**

`public/sw.js` línea 2:

```js
const STATIC_PREFIXES = ["/_next/static/", "/icons/", "/exercises/"];
```

(Actuliza también el comentario de la línea 26 si aplica — no hace falta, el comentario habla de HTML.)

**Step 2: Crear los 16 SVGs**

Paleta interna (documentos aislados vía `<img>`): fondo `#f7f4ee`, figura `#8faf8f`, cabeza/líneas `#55524c`, acento `#a088c4`, suelo `#b7ccb8`. Mismo `viewBox="0 0 320 160"` en todos. Sin texto dentro.

`public/exercises/respiracion-4-7-8.svg`:
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 160">
  <rect width="320" height="160" rx="16" fill="#f7f4ee"/>
  <line x1="40" y1="132" x2="280" y2="132" stroke="#b7ccb8" stroke-width="4" stroke-linecap="round"/>
  <circle cx="160" cy="52" r="13" fill="#55524c"/>
  <path d="M160 66 L160 96" stroke="#8faf8f" stroke-width="6" stroke-linecap="round"/>
  <path d="M160 96 Q136 118 128 124 M160 96 Q184 118 192 124" stroke="#8faf8f" stroke-width="6" fill="none" stroke-linecap="round"/>
  <path d="M214 48 a14 14 0 0 1 0 20" stroke="#a088c4" stroke-width="4" fill="none" stroke-linecap="round"/>
  <path d="M226 42 a22 22 0 0 1 0 32" stroke="#a088c4" stroke-width="4" fill="none" stroke-linecap="round"/>
</svg>
```

`public/exercises/estiramiento-de-cuello.svg`:
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 160">
  <rect width="320" height="160" rx="16" fill="#f7f4ee"/>
  <line x1="40" y1="132" x2="280" y2="132" stroke="#b7ccb8" stroke-width="4" stroke-linecap="round"/>
  <circle cx="176" cy="54" r="13" fill="#55524c"/>
  <path d="M146 76 L194 76" stroke="#8faf8f" stroke-width="6" stroke-linecap="round"/>
  <path d="M170 76 L168 112 M168 112 L156 132 M168 112 L180 132" stroke="#8faf8f" stroke-width="6" fill="none" stroke-linecap="round"/>
  <path d="M130 58 q8 10 22 8" stroke="#a088c4" stroke-width="4" fill="none" stroke-linecap="round"/>
</svg>
```

`public/exercises/relajacion-de-hombros.svg`:
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 160">
  <rect width="320" height="160" rx="16" fill="#f7f4ee"/>
  <line x1="40" y1="132" x2="280" y2="132" stroke="#b7ccb8" stroke-width="4" stroke-linecap="round"/>
  <circle cx="160" cy="50" r="13" fill="#55524c"/>
  <path d="M136 74 Q160 60 184 74" stroke="#8faf8f" stroke-width="6" fill="none" stroke-linecap="round"/>
  <path d="M160 74 L160 112 M160 112 L148 132 M160 112 L172 132" stroke="#8faf8f" stroke-width="6" fill="none" stroke-linecap="round"/>
  <path d="M132 64 L132 44 M126 50 L132 44 L138 50" stroke="#a088c4" stroke-width="4" fill="none" stroke-linecap="round"/>
  <path d="M188 64 L188 44 M182 50 L188 44 L194 50" stroke="#a088c4" stroke-width="4" fill="none" stroke-linecap="round"/>
</svg>
```

`public/exercises/torsion-suave-de-espalda.svg`:
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 160">
  <rect width="320" height="160" rx="16" fill="#f7f4ee"/>
  <line x1="40" y1="132" x2="280" y2="132" stroke="#b7ccb8" stroke-width="4" stroke-linecap="round"/>
  <rect x="146" y="106" width="36" height="26" rx="6" fill="#b7ccb8"/>
  <circle cx="158" cy="48" r="13" fill="#55524c"/>
  <path d="M158 62 Q172 84 160 104" stroke="#8faf8f" stroke-width="6" fill="none" stroke-linecap="round"/>
  <path d="M164 74 L196 88" stroke="#8faf8f" stroke-width="6" stroke-linecap="round"/>
  <path d="M196 68 a18 18 0 0 1 6 24" stroke="#a088c4" stroke-width="4" fill="none" stroke-linecap="round"/>
</svg>
```

`public/exercises/respiracion-profunda.svg`:
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 160">
  <rect width="320" height="160" rx="16" fill="#f7f4ee"/>
  <line x1="40" y1="132" x2="280" y2="132" stroke="#b7ccb8" stroke-width="4" stroke-linecap="round"/>
  <circle cx="160" cy="44" r="13" fill="#55524c"/>
  <path d="M160 58 L160 98 M160 98 L148 132 M160 98 L172 132" stroke="#8faf8f" stroke-width="6" fill="none" stroke-linecap="round"/>
  <circle cx="160" cy="78" r="14" stroke="#a088c4" stroke-width="4" fill="none"/>
  <circle cx="160" cy="78" r="24" stroke="#a088c4" stroke-width="4" fill="none" opacity="0.6"/>
</svg>
```

`public/exercises/mariposa-sentado.svg`:
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 160">
  <rect width="320" height="160" rx="16" fill="#f7f4ee"/>
  <line x1="40" y1="132" x2="280" y2="132" stroke="#b7ccb8" stroke-width="4" stroke-linecap="round"/>
  <circle cx="160" cy="46" r="13" fill="#55524c"/>
  <path d="M160 60 L160 94" stroke="#8faf8f" stroke-width="6" stroke-linecap="round"/>
  <path d="M160 94 Q134 112 130 120 Q148 128 160 116 M160 94 Q186 112 190 120 Q172 128 160 116" stroke="#8faf8f" stroke-width="6" fill="none" stroke-linecap="round"/>
  <circle cx="160" cy="120" r="5" fill="#a088c4"/>
</svg>
```

`public/exercises/rodillas-al-pecho.svg`:
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 160">
  <rect width="320" height="160" rx="16" fill="#f7f4ee"/>
  <line x1="40" y1="132" x2="280" y2="132" stroke="#b7ccb8" stroke-width="4" stroke-linecap="round"/>
  <circle cx="86" cy="104" r="12" fill="#55524c"/>
  <path d="M98 108 L168 110" stroke="#8faf8f" stroke-width="6" stroke-linecap="round"/>
  <path d="M168 110 Q176 88 152 82" stroke="#8faf8f" stroke-width="6" fill="none" stroke-linecap="round"/>
  <path d="M118 106 Q142 96 152 84" stroke="#8faf8f" stroke-width="6" fill="none" stroke-linecap="round"/>
  <path d="M176 110 L206 118" stroke="#8faf8f" stroke-width="6" stroke-linecap="round"/>
</svg>
```

`public/exercises/abrazo-con-respiracion.svg`:
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 160">
  <rect width="320" height="160" rx="16" fill="#f7f4ee"/>
  <line x1="40" y1="132" x2="280" y2="132" stroke="#b7ccb8" stroke-width="4" stroke-linecap="round"/>
  <circle cx="160" cy="46" r="13" fill="#55524c"/>
  <path d="M160 60 L160 104" stroke="#8faf8f" stroke-width="6" stroke-linecap="round"/>
  <path d="M136 74 L184 92 M184 74 L136 92" stroke="#8faf8f" stroke-width="6" stroke-linecap="round"/>
  <path d="M160 104 L146 132 M160 104 L174 132" stroke="#8faf8f" stroke-width="6" fill="none" stroke-linecap="round"/>
  <circle cx="160" cy="83" r="4" fill="#a088c4"/>
</svg>
```

`public/exercises/marcha-en-el-sitio.svg`:
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 160">
  <rect width="320" height="160" rx="16" fill="#f7f4ee"/>
  <line x1="40" y1="132" x2="280" y2="132" stroke="#b7ccb8" stroke-width="4" stroke-linecap="round"/>
  <circle cx="156" cy="42" r="13" fill="#55524c"/>
  <path d="M156 56 L158 96" stroke="#8faf8f" stroke-width="6" stroke-linecap="round"/>
  <path d="M158 96 L152 132" stroke="#8faf8f" stroke-width="6" stroke-linecap="round"/>
  <path d="M158 96 L188 98 L182 120" stroke="#8faf8f" stroke-width="6" fill="none" stroke-linecap="round"/>
  <path d="M156 66 L132 84 M156 66 L182 60" stroke="#8faf8f" stroke-width="6" stroke-linecap="round"/>
</svg>
```

`public/exercises/rotacion-de-brazos.svg`:
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 160">
  <rect width="320" height="160" rx="16" fill="#f7f4ee"/>
  <line x1="40" y1="132" x2="280" y2="132" stroke="#b7ccb8" stroke-width="4" stroke-linecap="round"/>
  <circle cx="160" cy="46" r="13" fill="#55524c"/>
  <path d="M160 60 L160 100 M160 100 L148 132 M160 100 L172 132" stroke="#8faf8f" stroke-width="6" fill="none" stroke-linecap="round"/>
  <path d="M112 72 L208 72" stroke="#8faf8f" stroke-width="6" stroke-linecap="round"/>
  <circle cx="106" cy="72" r="9" stroke="#a088c4" stroke-width="4" fill="none" stroke-dasharray="4 4"/>
  <circle cx="214" cy="72" r="9" stroke="#a088c4" stroke-width="4" fill="none" stroke-dasharray="4 4"/>
</svg>
```

`public/exercises/sentadillas-suaves.svg`:
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 160">
  <rect width="320" height="160" rx="16" fill="#f7f4ee"/>
  <line x1="40" y1="132" x2="280" y2="132" stroke="#b7ccb8" stroke-width="4" stroke-linecap="round"/>
  <circle cx="146" cy="52" r="13" fill="#55524c"/>
  <path d="M150 66 L172 90" stroke="#8faf8f" stroke-width="6" stroke-linecap="round"/>
  <path d="M172 90 L140 102 L146 130" stroke="#8faf8f" stroke-width="6" fill="none" stroke-linecap="round"/>
  <path d="M154 72 L196 74" stroke="#8faf8f" stroke-width="6" stroke-linecap="round"/>
</svg>
```

`public/exercises/rebotes-ligeros.svg`:
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 160">
  <rect width="320" height="160" rx="16" fill="#f7f4ee"/>
  <line x1="40" y1="132" x2="280" y2="132" stroke="#b7ccb8" stroke-width="4" stroke-linecap="round"/>
  <circle cx="160" cy="38" r="13" fill="#55524c"/>
  <path d="M160 52 L160 92 M160 92 L148 124 M160 92 L172 124" stroke="#8faf8f" stroke-width="6" fill="none" stroke-linecap="round"/>
  <path d="M148 124 L144 132 M172 124 L176 132" stroke="#8faf8f" stroke-width="6" stroke-linecap="round"/>
  <path d="M132 112 q4 10 0 16 M188 112 q-4 10 0 16" stroke="#a088c4" stroke-width="4" fill="none" stroke-linecap="round"/>
</svg>
```

`public/exercises/bostezo-con-estiramiento.svg`:
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 160">
  <rect width="320" height="160" rx="16" fill="#f7f4ee"/>
  <line x1="40" y1="132" x2="280" y2="132" stroke="#b7ccb8" stroke-width="4" stroke-linecap="round"/>
  <circle cx="160" cy="54" r="13" fill="#55524c"/>
  <path d="M160 68 L160 106 M160 106 L148 132 M160 106 L172 132" stroke="#8faf8f" stroke-width="6" fill="none" stroke-linecap="round"/>
  <path d="M160 76 L138 40 M160 76 L182 40" stroke="#8faf8f" stroke-width="6" stroke-linecap="round"/>
  <path d="M170 62 q8 -4 14 2" stroke="#a088c4" stroke-width="4" fill="none" stroke-linecap="round"/>
</svg>
```

`public/exercises/gato-vaca.svg`:
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 160">
  <rect width="320" height="160" rx="16" fill="#f7f4ee"/>
  <line x1="40" y1="132" x2="280" y2="132" stroke="#b7ccb8" stroke-width="4" stroke-linecap="round"/>
  <circle cx="102" cy="86" r="12" fill="#55524c"/>
  <path d="M114 84 Q160 56 208 80" stroke="#8faf8f" stroke-width="6" fill="none" stroke-linecap="round"/>
  <path d="M118 92 L116 130 M204 88 L206 130" stroke="#8faf8f" stroke-width="6" stroke-linecap="round"/>
  <path d="M128 90 L126 130 M194 86 L192 130" stroke="#8faf8f" stroke-width="6" stroke-linecap="round"/>
  <path d="M146 68 q14 -6 28 -2" stroke="#a088c4" stroke-width="4" fill="none" stroke-linecap="round"/>
</svg>
```

`public/exercises/postura-de-la-montana.svg`:
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 160">
  <rect width="320" height="160" rx="16" fill="#f7f4ee"/>
  <line x1="40" y1="132" x2="280" y2="132" stroke="#b7ccb8" stroke-width="4" stroke-linecap="round"/>
  <circle cx="160" cy="44" r="13" fill="#55524c"/>
  <path d="M160 58 L160 104" stroke="#8faf8f" stroke-width="6" stroke-linecap="round"/>
  <path d="M146 74 L143 102 M174 74 L177 102" stroke="#8faf8f" stroke-width="6" stroke-linecap="round"/>
  <path d="M160 104 L152 132 M160 104 L168 132" stroke="#8faf8f" stroke-width="6" fill="none" stroke-linecap="round"/>
</svg>
```

`public/exercises/caminata-lenta-en-el-sitio.svg`:
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 160">
  <rect width="320" height="160" rx="16" fill="#f7f4ee"/>
  <line x1="40" y1="132" x2="280" y2="132" stroke="#b7ccb8" stroke-width="4" stroke-linecap="round"/>
  <circle cx="154" cy="44" r="13" fill="#55524c"/>
  <path d="M156 58 L160 98" stroke="#8faf8f" stroke-width="6" stroke-linecap="round"/>
  <path d="M160 98 L186 130 M160 98 L136 126" stroke="#8faf8f" stroke-width="6" fill="none" stroke-linecap="round"/>
  <path d="M157 68 L134 86 M157 68 L182 84" stroke="#8faf8f" stroke-width="6" stroke-linecap="round"/>
</svg>
```

**Step 3: Verificar SVGs y service worker**

```bash
for f in public/exercises/*.svg; do python3 -c "import xml.dom.minidom,sys; xml.dom.minidom.parse(sys.argv[1])" "$f" || echo "XML INVÁLIDO: $f"; done
node --check public/sw.js
ls public/exercises | wc -l
```

Expected: sin "XML INVÁLIDO", `node --check` OK, **16** archivos.

**Step 4: Smoke estático**

```bash
npm run build && (npx next start -p 4400 &) && sleep 3
curl -s -o /dev/null -w "%{http_code} %{content_type}\n" http://localhost:4400/exercises/respiracion-4-7-8.svg
curl -s http://localhost:4400/sw.js | head -2
kill %1 2>/dev/null; pkill -f "next start -p 4400" 2>/dev/null; true
```

Expected: `200 image/svg+xml`; la línea del allowlist de sw.js incluye `/exercises/`. Confirma puerto cerrado después.

**Step 5: Gates**

```bash
npm run lint && npm run typecheck && npm test
```

Expected: PASS (58).

**Step 6: Commit**

```bash
git add -A && git commit -m "feat: ilustraciones SVG de ejercicios y cacheo del service worker"
```

---

### Task 6: Verificación final

**Step 1: Suite completa**

```bash
npm run lint && npm run typecheck && npm test && npm run build
```

Expected: todo verde, **58 tests / 11 suites**.

**Step 2: Smoke vivo (dev server + temp user)**

Arranca `npm run dev`. Registra temp user `timer-smoke@bloom.dev` ( CSRF dance con cookie jar como en verificaciones anteriores) y con la sesión:

1. `GET /api/exercises?mood=Ansiosa` → 200; cada ejercicio tiene `instructions` (string no vacío) e `illustration` (`/exercises/…svg`), `name`/`durationSeconds` intactos.
2. `curl -o /dev/null -w "%{http_code}" http://localhost:3000/exercises/respiracion-profunda.svg` → `200` (servido por el dev server).
3. `GET /api/exercises?mood=NoExiste` → 404 (sin regresiones); sin sesión → 401.
4. Idempotencia del día: `POST /api/checkin {"mood":"Ansiosa"}` → `stage` crece solo la primera vez (regresión de Task 8).

**Step 3: Limpieza**

Borra filas del temp user (`daily_logs`, `plant_stages`, `users` — credenciales vía env, nunca imprimir). Verifica: solo queda `jquintedori@gmail.com`, `moods=4`, `exercises=16`. Mata el dev server, puerto cerrado.

**Step 4: Commit (solo si hubo fixes)**

```bash
git add -A && git commit -m "fix: ajustes de verificación final del timer"
```

Si no hubo cambios: no commitear nada.

---

## Resumen

| Task | Commit esperado |
|---|---|
| 1 | `feat: columnas de instrucciones e ilustración en ejercicios` |
| 2 | `feat: seed con instrucciones e ilustraciones de ejercicios` |
| 3 | `feat: API de ejercicios incluye instrucciones e ilustración` |
| 4 | `feat: timer visible e ilustración en el reproductor de ejercicio` |
| 5 | `feat: ilustraciones SVG de ejercicios y cacheo del service worker` |
| 6 | solo si fixes |
