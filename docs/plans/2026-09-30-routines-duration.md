# Rutinas de 15–30 minutos Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Que cada rutina dure entre 15 y 30 minutos (variable por ánimo: 16:00 / 15:45 / 22:00 / 15:45) con ejercicios solo de peso corporal.

**Architecture:** Reemplazo de los 4 flujos en `EXERCISE_LIBRARY` (31 ejercicios únicos: 16 existentes + 15 nuevos) con duraciones por ánimo; test que fija el contrato de 900–1800 s por rutina; seed corregido para sincronizar `durationSeconds` y `position` (bug latente: hoy solo backfillea instructions/illustration); 15 SVGs nuevos en `public/exercises/`.

**Tech Stack:** Next.js 15, Vitest, Drizzle + Neon, Tailwind v4. Sin migración de esquema (columnas ya existen).

**Diseño validado:** `docs/plans/2026-09-30-routines-duration-design.md`

**Notas de entorno:** se trabaja directamente en `main` (una sola rama). Gates en cada tarea: `npm run lint && npm run typecheck && npm test && npm run build`. Baseline de tests: **58 (11 suites)** → final **59**. El seed corre contra el `DATABASE_URL` real de `.env` (nunca imprimirlo).

Totales esperados (verificar con SQL en Task 2):

| Ánimo | Ejercicios | Total |
|---|---|---|
| Estresada | 18 | 960 s (16:00) |
| Ansiosa | 17 | 945 s (15:45) |
| Energética | 20 | 1320 s (22:00) |
| Sin motivación | 18 | 945 s (15:45) |
| **Total filas** | **73** | — |

---

### Task 1: Test del contrato de duración + nuevos flujos (TDD)

**Files:**
- Modify: `src/lib/constants.test.ts:15-26`
- Modify: `src/lib/constants.ts:47-72`

**Step 1: Reemplazar el test de duraciones (debe fallar)**

En `src/lib/constants.test.ts`, reemplaza el primer test del describe `"flujos de ejercicios"` por dos tests:

```ts
  it("cada rutina dura entre 15 y 30 minutos", () => {
    for (const mood of MOODS) {
      const flow = findFlow(mood.name);
      const total = flow.reduce((sum, ex) => sum + ex.durationSeconds, 0);
      expect(total).toBeGreaterThanOrEqual(900);
      expect(total).toBeLessThanOrEqual(1800);
    }
  });

  it("cada rutina tiene al menos 10 ejercicios de 30-90 s", () => {
    for (const mood of MOODS) {
      const flow = findFlow(mood.name);
      expect(flow.length).toBeGreaterThanOrEqual(10);
      for (const ex of flow) {
        expect(ex.durationSeconds).toBeGreaterThanOrEqual(30);
        expect(ex.durationSeconds).toBeLessThanOrEqual(90);
      }
    }
  });
```

(Los tests `"EXERCISE_LIBRARY cubre exactamente los 4 ánimos"`, `"findFlow devuelve []..."` y `"los ejercicios no se repiten..."` quedan intactos.)

**Step 2: Ejecutar → FAIL**

```bash
npx vitest run src/lib/constants.test.ts
Expected: FAIL — los totales actuales son 195-210 s (< 900) y los flujos tienen 4 ejercicios (< 10).
```

**Step 3: Reemplazar `EXERCISE_LIBRARY` en `src/lib/constants.ts`**

Sustituye la exportación completa (líneas 47-72) por:

```ts
export const EXERCISE_LIBRARY: Record<MoodName, FlowExercise[]> = {
  Estresada: [
    { name: "Respiración 4-7-8", durationSeconds: 60 },
    { name: "Respiración lateral", durationSeconds: 60 },
    { name: "Estiramiento de cuello", durationSeconds: 45 },
    { name: "Relajación de hombros", durationSeconds: 45 },
    { name: "Círculos de hombros", durationSeconds: 45 },
    { name: "Torsión suave de espalda", durationSeconds: 60 },
    { name: "Gato-vaca", durationSeconds: 60 },
    { name: "Estiramiento de pecho", durationSeconds: 60 },
    { name: "Inclinaciones laterales", durationSeconds: 60 },
    { name: "Círculos de cadera", durationSeconds: 60 },
    { name: "Estiramiento de isquiotibiales sentado", durationSeconds: 60 },
    { name: "Mariposa sentado", durationSeconds: 45 },
    { name: "Rodillas al pecho", durationSeconds: 45 },
    { name: "Relajación facial", durationSeconds: 60 },
    { name: "Abrazo con respiración", durationSeconds: 45 },
    { name: "Bostezo con estiramiento", durationSeconds: 45 },
    { name: "Postura de la montaña", durationSeconds: 45 },
    { name: "Respiración profunda", durationSeconds: 60 },
  ],
  Ansiosa: [
    { name: "Respiración profunda", durationSeconds: 60 },
    { name: "Respiración en caja", durationSeconds: 60 },
    { name: "Respiración 4-7-8", durationSeconds: 60 },
    { name: "Mariposa sentado", durationSeconds: 60 },
    { name: "Rodillas al pecho", durationSeconds: 45 },
    { name: "Abrazo con respiración", durationSeconds: 60 },
    { name: "Estiramiento de cuello", durationSeconds: 45 },
    { name: "Relajación de hombros", durationSeconds: 45 },
    { name: "Gato-vaca", durationSeconds: 60 },
    { name: "Torsión suave de espalda", durationSeconds: 60 },
    { name: "Estiramiento de isquiotibiales sentado", durationSeconds: 60 },
    { name: "Relajación facial", durationSeconds: 60 },
    { name: "Respiración lateral", durationSeconds: 60 },
    { name: "Círculos de cadera", durationSeconds: 60 },
    { name: "Estiramiento de pecho", durationSeconds: 60 },
    { name: "Círculos de hombros", durationSeconds: 45 },
    { name: "Postura de la montaña", durationSeconds: 45 },
  ],
  "Energética": [
    { name: "Marcha en el sitio", durationSeconds: 60 },
    { name: "Rotación de brazos", durationSeconds: 60 },
    { name: "Jumping jack suave", durationSeconds: 90 },
    { name: "Sentadillas suaves", durationSeconds: 90 },
    { name: "Zancadas alternas", durationSeconds: 90 },
    { name: "Puente de glúteos", durationSeconds: 75 },
    { name: "Escaladores lentos", durationSeconds: 75 },
    { name: "Flexiones en pared", durationSeconds: 90 },
    { name: "Supermán", durationSeconds: 75 },
    { name: "Rebotes ligeros", durationSeconds: 60 },
    { name: "Caminata lenta en el sitio", durationSeconds: 60 },
    { name: "Gato-vaca", durationSeconds: 60 },
    { name: "Círculos de cadera", durationSeconds: 60 },
    { name: "Inclinaciones laterales", durationSeconds: 60 },
    { name: "Estiramiento de pecho", durationSeconds: 60 },
    { name: "Torsión suave de espalda", durationSeconds: 60 },
    { name: "Bostezo con estiramiento", durationSeconds: 45 },
    { name: "Rodillas al pecho", durationSeconds: 45 },
    { name: "Postura de la montaña", durationSeconds: 45 },
    { name: "Respiración profunda", durationSeconds: 60 },
  ],
  "Sin motivación": [
    { name: "Estiramiento al despertar", durationSeconds: 45 },
    { name: "Bostezo con estiramiento", durationSeconds: 45 },
    { name: "Círculos de hombros", durationSeconds: 45 },
    { name: "Caminata lenta en el sitio", durationSeconds: 60 },
    { name: "Marcha en el sitio", durationSeconds: 60 },
    { name: "Gato-vaca", durationSeconds: 60 },
    { name: "Postura de la montaña", durationSeconds: 45 },
    { name: "Torsión suave de espalda", durationSeconds: 60 },
    { name: "Inclinaciones laterales", durationSeconds: 60 },
    { name: "Círculos de cadera", durationSeconds: 60 },
    { name: "Sentadillas suaves", durationSeconds: 60 },
    { name: "Rotación de brazos", durationSeconds: 45 },
    { name: "Mariposa sentado", durationSeconds: 45 },
    { name: "Rodillas al pecho", durationSeconds: 45 },
    { name: "Estiramiento de cuello", durationSeconds: 45 },
    { name: "Relajación de hombros", durationSeconds: 45 },
    { name: "Respiración profunda", durationSeconds: 60 },
    { name: "Respiración 4-7-8", durationSeconds: 60 },
  ],
};
```

La misma duración puede variar por ánimo (la fila en BD es por ánimo): p.ej. `Jumping jack suave` 90 s en Energética, `Mariposa sentado` 60 s en Ansiosa.

**Step 4: Ejecutar → PASS**

```bash
npx vitest run src/lib/constants.test.ts
Expected: PASS — 5 tests (1 MOODS + 4 flujos).
```

**Step 5: Gates**

```bash
npm run lint && npm run typecheck && npm test
Expected: PASS — 59 tests / 11 suites (58 + 1 neto nuevo).
```

**Step 6: Commit**

```bash
git add -A && git commit -m "feat: rutinas de 15 a 30 minutos por ánimo"
```

---

### Task 2: Seed — 15 ejercicios nuevos + sync de duración y posición

**Files:**
- Modify: `scripts/seed.ts` (EXERCISE_DETAILS + bloque de actualización)

**Step 1: Añadir los 15 ejercicios nuevos a `EXERCISE_DETAILS`**

Dentro del objeto `EXERCISE_DETAILS`, añade (después de los 16 existentes):

```ts
  "Respiración lateral":
    "Siéntate derecho. Inhala lento por la nariz y exhala contando hasta 6, llevando el aire a un costado del pecho. Cambia de costado suavemente.",
  "Respiración en caja":
    "Inhala contando 4, sostén 4, exhala 4 y espera 4. Repite el cuadro completo hasta terminar el ejercicio.",
  "Relajación facial":
    "Aprieta suavemente los ojos, la mandíbula y los hombros durante 3 segundos y suéltalos. Repite 6 veces notando cómo se afloja la cara.",
  "Estiramiento de pecho":
    "Entrelaza las manos detrás de la espalda y abre el pecho llevando los hombros hacia abajo. Mantén 20 segundos respirando hondo.",
  "Círculos de hombros":
    "Sube los hombros hacia las orejas y dibuja círculos grandes, primero hacia adelante y luego hacia atrás. Lento y sin subir la cabeza.",
  "Estiramiento de isquiotibiales sentado":
    "Siéntate con las piernas extendidas y acerca el pecho a las rodillas sin forzar. Mantén 20 segundos con la espalda larga.",
  "Círculos de cadera":
    "De pie con las manos en la cintura, dibuja círculos amplios con la cadera, primero en un sentido y luego en el otro.",
  "Inclinaciones laterales":
    "De pie, sube un brazo e inclínate suavemente hacia el lado contrario. Vuelve al centro y cambia, sin mover las caderas.",
  "Estiramiento al despertar":
    "Estira los brazos hacia arriba y alarga todo el cuerpo de puntillas. Aguanta 5 segundos y suelta con un bostezo.",
  "Zancadas alternas":
    "Da un paso adelante y baja la cadera hasta que ambas rodillas queden a 90°. Regresa y alterna piernas sin golpear el suelo.",
  "Jumping jack suave":
    "Abre y cierra brazos y piernas dando pasos laterales en lugar de saltos. Mantén un ritmo constante y estable.",
  "Puente de glúteos":
    "Tumbado con las rodillas dobladas, empuja la cadera hacia el arriba apretando los glúteos. Baja despacio y repite.",
  "Escaladores lentos":
    "En posición de plancha, lleva una rodilla hacia el pecho muy despacio y alterna. Mantén el abdomen firme y el cuello largo.",
  "Supermán":
    "Tumbado boca abajo, eleva brazos y piernas a la vez contando 3 segundos y baja. Sin levantar la cabeza bruscamente.",
  "Flexiones en pared":
    "Apoya las manos en la pared al alto de los hombros y acerca el pecho doblando los codos. Mantén la espalda recta.",
```

**Step 2: Sincronizar `durationSeconds` y `position` en el backfill**

Reemplaza el bloque `if (found) {...}` dentro del loop por:

```ts
      if (found) {
        if (
          found.instructions !== instructions ||
          found.illustration !== illustration ||
          found.durationSeconds !== ex.durationSeconds ||
          found.position !== i
        ) {
          await db
            .update(exercises)
            .set({
              instructions,
              illustration,
              durationSeconds: ex.durationSeconds,
              position: i,
            })
            .where(eq(exercises.id, found.id));
        }
      } else {
```

(Sin este cambio, las duraciones nuevas jamás llegan a la BD y el orden por `position` se rompe al insertar ejercicios en el medio.)

**Step 3: Ejecutar dos veces (idempotencia)**

```bash
npm run db:seed && npm run db:seed
Expected: ambas veces "Seed completo: 4 ánimos + flujos con explicaciones."
```

**Step 4: Verificar totales y backfill en la BD**

```bash
export $(grep -E '^DATABASE_URL=' .env | xargs)
psql "$DATABASE_URL" -c "select m.name, count(*), sum(e.duration_seconds) from exercises e join moods m on m.id = e.mood_id group by m.name order by m.name;"
psql "$DATABASE_URL" -c "select count(*), count(instructions), count(illustration) from exercises;"
```

Expected:

- Filas por ánimo: `Ansiosa 17 945`, `Energética 20 1320`, `Estresada 18 960`, `Sin motivación 18 945`.
- `73 | 73 | 73`.

**Step 5: Gates**

```bash
npm run lint && npm run typecheck && npm test
Expected: PASS (59).
```

**Step 6: Commit**

```bash
git add -A && git commit -m "feat: seed con 15 ejercicios nuevos y sync de duración"
```

---

### Task 3: 15 SVGs nuevos + verificación de rutas

**Files:**
- Create: `public/exercises/<slug>.svg` × 15

Slugs (derivados de `slugify()`): `respiracion-lateral`, `respiracion-en-caja`, `relajacion-facial`, `estiramiento-de-pecho`, `circulos-de-hombros`, `estiramiento-de-isquiotibiales-sentado`, `circulos-de-cadera`, `inclinaciones-laterales`, `estiramiento-al-despertar`, `zancadas-alternas`, `jumping-jack-suave`, `puente-de-gluteos`, `escaladores-lentos`, `superman`, `flexiones-en-pared`.

Paleta idéntica a las existentes: fondo `#f7f4ee`, figura `#8faf8f`, cabeza/líneas `#55524c`, acento `#a088c4`, suelo `#b7ccb8`. `viewBox="0 0 320 160"`, sin texto, sin gradientes.

`public/exercises/respiracion-lateral.svg`:
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 160">
  <rect width="320" height="160" rx="16" fill="#f7f4ee"/>
  <line x1="40" y1="132" x2="280" y2="132" stroke="#b7ccb8" stroke-width="4" stroke-linecap="round"/>
  <circle cx="160" cy="52" r="13" fill="#55524c"/>
  <path d="M160 66 L160 104 M160 104 L148 132 M160 104 L172 132" stroke="#8faf8f" stroke-width="6" fill="none" stroke-linecap="round"/>
  <path d="M160 76 Q136 84 136 104 M160 76 Q184 84 184 104" stroke="#8faf8f" stroke-width="6" fill="none" stroke-linecap="round"/>
  <path d="M108 62 a16 16 0 0 1 0 24" stroke="#a088c4" stroke-width="4" fill="none" stroke-linecap="round"/>
  <path d="M212 62 a16 16 0 0 0 0 24" stroke="#a088c4" stroke-width="4" fill="none" stroke-linecap="round"/>
</svg>
```

`public/exercises/respiracion-en-caja.svg`:
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 160">
  <rect width="320" height="160" rx="16" fill="#f7f4ee"/>
  <line x1="40" y1="132" x2="280" y2="132" stroke="#b7ccb8" stroke-width="4" stroke-linecap="round"/>
  <circle cx="120" cy="54" r="13" fill="#55524c"/>
  <path d="M120 68 L120 104 M120 104 L108 132 M120 104 L132 132" stroke="#8faf8f" stroke-width="6" fill="none" stroke-linecap="round"/>
  <path d="M120 78 L100 96" stroke="#8faf8f" stroke-width="6" stroke-linecap="round"/>
  <rect x="176" y="44" width="72" height="72" rx="8" stroke="#a088c4" stroke-width="4" fill="none"/>
  <path d="M176 44 L248 44" stroke="#a088c4" stroke-width="4" stroke-linecap="round"/>
</svg>
```

`public/exercises/relajacion-facial.svg`:
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 160">
  <rect width="320" height="160" rx="16" fill="#f7f4ee"/>
  <line x1="40" y1="132" x2="280" y2="132" stroke="#b7ccb8" stroke-width="4" stroke-linecap="round"/>
  <circle cx="160" cy="66" r="30" fill="#55524c"/>
  <path d="M148 62 q6 -6 12 0 M160 62 q6 -6 12 0" stroke="#f7f4ee" stroke-width="4" fill="none" stroke-linecap="round"/>
  <path d="M150 80 q10 8 20 0" stroke="#f7f4ee" stroke-width="4" fill="none" stroke-linecap="round"/>
  <path d="M160 96 L160 116 M160 116 L148 132 M160 116 L172 132" stroke="#8faf8f" stroke-width="6" fill="none" stroke-linecap="round"/>
  <path d="M112 40 l-8 -10 M208 40 l8 -10 M160 26 L160 14" stroke="#a088c4" stroke-width="4" fill="none" stroke-linecap="round"/>
</svg>
```

`public/exercises/estiramiento-de-pecho.svg`:
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 160">
  <rect width="320" height="160" rx="16" fill="#f7f4ee"/>
  <line x1="40" y1="132" x2="280" y2="132" stroke="#b7ccb8" stroke-width="4" stroke-linecap="round"/>
  <circle cx="160" cy="48" r="13" fill="#55524c"/>
  <path d="M160 62 L160 104 M160 104 L148 132 M160 104 L172 132" stroke="#8faf8f" stroke-width="6" fill="none" stroke-linecap="round"/>
  <path d="M160 74 Q136 92 130 104" stroke="#8faf8f" stroke-width="6" fill="none" stroke-linecap="round"/>
  <path d="M160 74 Q184 92 190 104" stroke="#8faf8f" stroke-width="6" fill="none" stroke-linecap="round"/>
  <path d="M160 68 Q176 68 184 76" stroke="#a088c4" stroke-width="4" fill="none" stroke-linecap="round"/>
</svg>
```

`public/exercises/circulos-de-hombros.svg`:
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 160">
  <rect width="320" height="160" rx="16" fill="#f7f4ee"/>
  <line x1="40" y1="132" x2="280" y2="132" stroke="#b7ccb8" stroke-width="4" stroke-linecap="round"/>
  <circle cx="160" cy="56" r="13" fill="#55524c"/>
  <path d="M160 70 L160 104 M160 104 L148 132 M160 104 L172 132" stroke="#8faf8f" stroke-width="6" fill="none" stroke-linecap="round"/>
  <path d="M132 80 Q160 66 188 80" stroke="#8faf8f" stroke-width="6" fill="none" stroke-linecap="round"/>
  <path d="M126 60 a18 18 0 1 1 12 26" stroke="#a088c4" stroke-width="4" fill="none" stroke-linecap="round"/>
  <path d="M136 82 l4 -8 l9 3" stroke="#a088c4" stroke-width="4" fill="none" stroke-linecap="round"/>
  <path d="M194 60 a18 18 0 1 0 -12 26" stroke="#a088c4" stroke-width="4" fill="none" stroke-linecap="round"/>
  <path d="M184 82 l-4 -8 l-9 3" stroke="#a088c4" stroke-width="4" fill="none" stroke-linecap="round"/>
</svg>
```

`public/exercises/estiramiento-de-isquiotibiales-sentado.svg`:
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 160">
  <rect width="320" height="160" rx="16" fill="#f7f4ee"/>
  <line x1="40" y1="132" x2="280" y2="132" stroke="#b7ccb8" stroke-width="4" stroke-linecap="round"/>
  <circle cx="120" cy="74" r="13" fill="#55524c"/>
  <path d="M130 84 L160 118" stroke="#8faf8f" stroke-width="6" fill="none" stroke-linecap="round"/>
  <path d="M160 118 L242 122" stroke="#8faf8f" stroke-width="6" stroke-linecap="round"/>
  <path d="M134 92 L212 116" stroke="#8faf8f" stroke-width="6" stroke-linecap="round"/>
  <path d="M246 114 q8 4 6 12" stroke="#a088c4" stroke-width="4" fill="none" stroke-linecap="round"/>
</svg>
```

`public/exercises/circulos-de-cadera.svg`:
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 160">
  <rect width="320" height="160" rx="16" fill="#f7f4ee"/>
  <line x1="40" y1="132" x2="280" y2="132" stroke="#b7ccb8" stroke-width="4" stroke-linecap="round"/>
  <circle cx="160" cy="44" r="13" fill="#55524c"/>
  <path d="M160 58 L160 90 M160 90 L150 132 M160 90 L170 132" stroke="#8faf8f" stroke-width="6" fill="none" stroke-linecap="round"/>
  <path d="M160 90 L136 86 M160 90 L184 86" stroke="#8faf8f" stroke-width="6" stroke-linecap="round"/>
  <ellipse cx="160" cy="92" rx="34" ry="12" stroke="#a088c4" stroke-width="4" fill="none" stroke-dasharray="6 6"/>
  <path d="M192 86 l6 -6 l2 9" stroke="#a088c4" stroke-width="4" fill="none" stroke-linecap="round"/>
</svg>
```

`public/exercises/inclinaciones-laterales.svg`:
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 160">
  <rect width="320" height="160" rx="16" fill="#f7f4ee"/>
  <line x1="40" y1="132" x2="280" y2="132" stroke="#b7ccb8" stroke-width="4" stroke-linecap="round"/>
  <circle cx="164" cy="50" r="13" fill="#55524c"/>
  <path d="M162 64 Q158 92 154 116 M154 116 L146 132 M154 116 L166 132" stroke="#8faf8f" stroke-width="6" fill="none" stroke-linecap="round"/>
  <path d="M162 72 Q178 56 196 44" stroke="#8faf8f" stroke-width="6" fill="none" stroke-linecap="round"/>
  <path d="M166 78 Q184 70 200 74" stroke="#8faf8f" stroke-width="6" fill="none" stroke-linecap="round"/>
  <path d="M212 52 q12 14 4 32" stroke="#a088c4" stroke-width="4" fill="none" stroke-linecap="round"/>
</svg>
```

`public/exercises/estiramiento-al-despertar.svg`:
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 160">
  <rect width="320" height="160" rx="16" fill="#f7f4ee"/>
  <line x1="40" y1="132" x2="280" y2="132" stroke="#b7ccb8" stroke-width="4" stroke-linecap="round"/>
  <circle cx="160" cy="56" r="13" fill="#55524c"/>
  <path d="M160 70 L160 108 M152 132 L156 120 M168 132 L164 120" stroke="#8faf8f" stroke-width="6" fill="none" stroke-linecap="round"/>
  <path d="M160 80 L140 48 M160 80 L180 48" stroke="#8faf8f" stroke-width="6" stroke-linecap="round"/>
  <path d="M132 40 L132 26 M126 32 L132 26 L138 32" stroke="#a088c4" stroke-width="4" fill="none" stroke-linecap="round"/>
  <path d="M188 40 L188 26 M182 32 L188 26 L194 32" stroke="#a088c4" stroke-width="4" fill="none" stroke-linecap="round"/>
</svg>
```

`public/exercises/zancadas-alternas.svg`:
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 160">
  <rect width="320" height="160" rx="16" fill="#f7f4ee"/>
  <line x1="40" y1="132" x2="280" y2="132" stroke="#b7ccb8" stroke-width="4" stroke-linecap="round"/>
  <circle cx="158" cy="40" r="13" fill="#55524c"/>
  <path d="M158 54 L158 88" stroke="#8faf8f" stroke-width="6" stroke-linecap="round"/>
  <path d="M158 88 L126 104 L124 132" stroke="#8faf8f" stroke-width="6" fill="none" stroke-linecap="round"/>
  <path d="M158 88 L196 104 L206 132" stroke="#8faf8f" stroke-width="6" fill="none" stroke-linecap="round"/>
  <path d="M158 66 L136 76 M158 66 L180 76" stroke="#8faf8f" stroke-width="6" stroke-linecap="round"/>
  <path d="M140 120 q-10 6 -10 12" stroke="#a088c4" stroke-width="4" fill="none" stroke-linecap="round"/>
</svg>
```

`public/exercises/jumping-jack-suave.svg`:
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 160">
  <rect width="320" height="160" rx="16" fill="#f7f4ee"/>
  <line x1="40" y1="132" x2="280" y2="132" stroke="#b7ccb8" stroke-width="4" stroke-linecap="round"/>
  <circle cx="160" cy="40" r="13" fill="#55524c"/>
  <path d="M160 54 L160 92" stroke="#8faf8f" stroke-width="6" stroke-linecap="round"/>
  <path d="M160 92 L138 132 M160 92 L182 132" stroke="#8faf8f" stroke-width="6" fill="none" stroke-linecap="round"/>
  <path d="M160 66 L134 52 M160 66 L186 52" stroke="#8faf8f" stroke-width="6" stroke-linecap="round"/>
  <path d="M126 66 L118 44 M118 44 L110 50 M118 44 L124 36" stroke="#a088c4" stroke-width="4" fill="none" stroke-linecap="round"/>
  <path d="M194 66 L202 44 M202 44 L210 50 M202 44 L196 36" stroke="#a088c4" stroke-width="4" fill="none" stroke-linecap="round"/>
</svg>
```

`public/exercises/puente-de-gluteos.svg`:
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 160">
  <rect width="320" height="160" rx="16" fill="#f7f4ee"/>
  <line x1="40" y1="132" x2="280" y2="132" stroke="#b7ccb8" stroke-width="4" stroke-linecap="round"/>
  <circle cx="96" cy="112" r="12" fill="#55524c"/>
  <path d="M108 112 L150 96" stroke="#8faf8f" stroke-width="6" stroke-linecap="round"/>
  <path d="M150 96 Q186 84 214 104" stroke="#8faf8f" stroke-width="6" fill="none" stroke-linecap="round"/>
  <path d="M214 104 L222 130 M222 130 L238 130" stroke="#8faf8f" stroke-width="6" fill="none" stroke-linecap="round"/>
  <path d="M168 84 L168 70 M162 76 L168 70 L174 76" stroke="#a088c4" stroke-width="4" fill="none" stroke-linecap="round"/>
</svg>
```

`public/exercises/escaladores-lentos.svg`:
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 160">
  <rect width="320" height="160" rx="16" fill="#f7f4ee"/>
  <line x1="40" y1="132" x2="280" y2="132" stroke="#b7ccb8" stroke-width="4" stroke-linecap="round"/>
  <circle cx="92" cy="80" r="12" fill="#55524c"/>
  <path d="M104 84 L176 96" stroke="#8faf8f" stroke-width="6" stroke-linecap="round"/>
  <path d="M176 96 L236 116" stroke="#8faf8f" stroke-width="6" stroke-linecap="round"/>
  <path d="M104 88 L104 130 M118 90 L118 130" stroke="#8faf8f" stroke-width="6" fill="none" stroke-linecap="round"/>
  <path d="M176 96 Q160 108 152 124" stroke="#8faf8f" stroke-width="6" fill="none" stroke-linecap="round"/>
  <path d="M196 104 q10 -8 24 -6" stroke="#a088c4" stroke-width="4" fill="none" stroke-linecap="round"/>
</svg>
```

`public/exercises/superman.svg`:
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 160">
  <rect width="320" height="160" rx="16" fill="#f7f4ee"/>
  <line x1="40" y1="132" x2="280" y2="132" stroke="#b7ccb8" stroke-width="4" stroke-linecap="round"/>
  <circle cx="118" cy="88" r="12" fill="#55524c"/>
  <path d="M130 92 Q170 84 214 94" stroke="#8faf8f" stroke-width="6" fill="none" stroke-linecap="round"/>
  <path d="M138 90 L112 66 M142 94 L116 74" stroke="#8faf8f" stroke-width="6" stroke-linecap="round"/>
  <path d="M214 94 Q238 82 252 68" stroke="#8faf8f" stroke-width="6" fill="none" stroke-linecap="round"/>
  <path d="M170 78 L170 66 M164 72 L170 66 L176 72" stroke="#a088c4" stroke-width="4" fill="none" stroke-linecap="round"/>
</svg>
```

`public/exercises/flexiones-en-pared.svg`:
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 160">
  <rect width="320" height="160" rx="16" fill="#f7f4ee"/>
  <line x1="40" y1="132" x2="280" y2="132" stroke="#b7ccb8" stroke-width="4" stroke-linecap="round"/>
  <line x1="232" y1="24" x2="232" y2="132" stroke="#b7ccb8" stroke-width="6" stroke-linecap="round"/>
  <circle cx="150" cy="50" r="13" fill="#55524c"/>
  <path d="M156 62 L172 88" stroke="#8faf8f" stroke-width="6" fill="none" stroke-linecap="round"/>
  <path d="M172 88 L164 132" stroke="#8faf8f" stroke-width="6" stroke-linecap="round"/>
  <path d="M160 70 L226 62" stroke="#8faf8f" stroke-width="6" stroke-linecap="round"/>
  <path d="M186 68 L198 84 L222 74" stroke="#a088c4" stroke-width="4" fill="none" stroke-linecap="round"/>
</svg>
```

**Step 1: Verificar XML, sw y conteo**

```bash
for f in public/exercises/*.svg; do python3 -c "import xml.dom.minidom,sys; xml.dom.minidom.parse(sys.argv[1])" "$f" || echo "XML INVÁLIDO: $f"; done
node --check public/sw.js
ls public/exercises | wc -l
```

Expected: sin "XML INVÁLIDO", `node --check` OK, **31** archivos.

**Step 2: Verificar que toda ruta en la BD existe como archivo**

```bash
export $(grep -E '^DATABASE_URL=' .env | xargs)
psql "$DATABASE_URL" -t -c "select illustration from exercises order by position;" | sed 's/^ //' | grep -v '^$' | while read r; do [ -f "public$r" ] || echo "FALTA: $r"; done
echo "chequeo listo"
```

Expected: sin "FALTA".

**Step 3: Smoke estático**

```bash
npm run build && (npx next start -p 4400 &) && sleep 4
curl -s -o /dev/null -w "%{http_code} %{content_type}\n" http://localhost:4400/exercises/superman.svg
pkill -f "next start -p 4400"; sleep 1
curl -s -o /dev/null -m 2 http://localhost:4400/ && echo "PUERTO ABIERTO" || echo "puerto cerrado"
```

Expected: `200 image/svg+xml`; puerto cerrado al final.

**Step 4: Gates**

```bash
npm run lint && npm run typecheck && npm test
Expected: PASS (59).
```

**Step 5: Commit**

```bash
git add -A && git commit -m "feat: ilustraciones SVG de los 15 ejercicios nuevos"
```

---

### Task 4: Verificación final + smoke vivo

**Step 1: Suite completa**

```bash
npm run lint && npm run typecheck && npm test && npm run build
Expected: todo verde, 59 tests / 11 suites.
```

**Step 2: Seed idempotente una vez más (regresión)**

```bash
npm run db:seed
Expected: "Seed completo: 4 ánimos + flujos con explicaciones." (segunda pasada sin cambios: el backfill es idempotente)
```

**Step 3: Smoke vivo (dev server + temp user)**

Arranca `npm run dev`. Registra temp user `routines-smoke@bloom.dev` (cookie jar, credenciales generadas en variables de shell, nunca impresas) y con la sesión:

1. `GET /api/exercises?mood=<cada ánimo>` → 200; contar ejercicios y sumar `durationSeconds` en el cliente:

```bash
for m in "Estresada" "Ansiosa" "Energ%C3%A9tica" "Sin%20motivaci%C3%B3n"; do
  curl -s -b $JAR "http://localhost:3000/api/exercises?mood=$m" | python3 -c "
import sys,json
d=json.load(sys.stdin)
total=sum(e['durationSeconds'] for e in d['exercises'])
print(d['mood'], len(d['exercises']), total, 'OK' if 900<=total<=1800 else 'FUERA DE RANGO')"
done
```

Expected: `Estresada 18 960 OK`, `Ansiosa 17 945 OK`, `Energética 20 1320 OK`, `Sin motivación 18 945 OK`.

2. Todos los `illustration` responden 200:

```bash
curl -s -b $JAR "http://localhost:3000/api/exercises?mood=Energ%C3%A9tica" | python3 -c "import sys,json;[print(e['illustration']) for e in json.load(sys.stdin)['exercises']]" | while read r; do code=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000$r"); [ "$code" = "200" ] || echo "FALLO $code $r"; done; echo "svg check listo"
```

Expected: sin "FALLO".

3. Regresiones: sin sesión → `401`; `?mood=NoExiste` → `404`; `POST /api/checkin` dos veces → `stage` crece solo la primera vez.

**Step 4: Limpieza**

Borra filas del temp user (`daily_logs`, `plant_stages`, `users`). Verifica: solo `jquintedori@gmail.com`, `moods=4`, `exercises=73`. Mata el dev server, puerto cerrado. Borra cookies/credenciales temporales de `/tmp`.

**Step 5: Commit (solo si hubo fixes)**

```bash
git add -A && git commit -m "fix: ajustes de verificación final de rutinas"
```

Si no hubo cambios: no commitear nada.

---

## Resumen

| Task | Commit esperado |
|---|---|
| 1 | `feat: rutinas de 15 a 30 minutos por ánimo` |
| 2 | `feat: seed con 15 ejercicios nuevos y sync de duración` |
| 3 | `feat: ilustraciones SVG de los 15 ejercicios nuevos` |
| 4 | solo si fixes |
