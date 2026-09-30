# Diseño: rutinas de 15–30 minutos por ánimo

**Fecha:** 2026-09-30
**Decisión del usuario:** duración variable por ánimo; más ejercicios con duraciones cortas; reutilizar ejercicios entre ánimos; solo peso corporal (sin máquinas ni pesas).

## Problema

Las rutinas actuales (`src/lib/constants.ts`) duran 3:15–3:30 por ánimo — muy por debajo del mínimo de 15 min exigido (máximo 30 min).

## Objetivos validados

| Ánimo | Duración objetivo | Ejercicios | Total real |
|---|---|---|---|
| Estresada | ~16 min | 18 | **960 s (16:00)** |
| Ansiosa | ~15:30 | 17 | **945 s (15:45)** |
| Energética | ~22 min | 20 | **1320 s (22:00)** |
| Sin motivación | ~15:30 | 18 | **945 s (15:45)** |

Restricciones verificadas por script sobre el diseño:

- Total por rutina ∈ **[900, 1800] s** (15–30 min) — todas con margen ≥45 s sobre el mínimo.
- Cada ejercicio ∈ **[30, 90] s** (regla existente del test se mantiene).
- Sin nombres repetidos dentro de una misma rutina.
- 31 ejercicios únicos en total: 16 existentes + **15 nuevos** (todos peso corporal/respiración/estiramiento).
- Las duraciones pueden variar por ánimo (la fila en BD es por ánimo; p.ej. "Jumping jack suave" es 90 s en Energética).

## Ejercicios nuevos (15)

Todos solo peso corporal, sin material:

`Respiración lateral`, `Respiración en caja`, `Relajación facial`, `Estiramiento de pecho`, `Círculos de hombros`, `Estiramiento de isquiotibiales sentado`, `Círculos de cadera`, `Inclinaciones laterales`, `Estiramiento al despertar`, `Zancadas alternas`, `Jumping jack suave`, `Puente de glúteos`, `Escaladores lentos`, `Supermán`, `Flexiones en pared`.

Cada uno necesita: entrada en `EXERCISE_LIBRARY`, texto en `EXERCISE_DETAILS` (seed) y SVG en `public/exercises/<slug>.svg` (paleta y viewBox ya usados por las 16 ilustraciones existentes). Los slugs derivan del `slugify()` del seed.

## Cambios técnicos

1. **`src/lib/constants.ts`** — reemplazar los 4 flujos por los de arriba (duraciones exactas por ánimo).
2. **`src/lib/constants.test.ts`** — el test "3-4 ejercicios de 30-90s" pasa a: **total del flujo ∈ [900, 1800] s** + cada ejercicio ∈ [30, 90] s + sin duplicados (ya existente). Sin cambios en los otros tests.
3. **`scripts/seed.ts`** — el backfill debe sincronizar además `durationSeconds` y `position` (hoy solo `instructions`/`illustration`); si no, los cambios no llegan a la BD y el orden por `position` se rompe al insertar ejercicios nuevos.
4. **BD** — sin migración (ya existen todas las columnas). El seed inserta las 15 filas nuevas por ánimo donde falten y actualiza las existentes.
5. **SVGs** — 15 archivos nuevos en `public/exercises/`; el service worker ya cachea `/exercises/`.
6. **API/UI** — sin cambios: `/api/exercises` devuelve el flujo completo; `WorkoutPlayer` ya muestra timer por ejercicio y autoavanza.

## Riesgos y mitigaciones

- **Seed no sincroniza duraciones/posición** → corregido en el paso 3 (es el bug latente más importante).
- **SVGs faltantes → 404 en la ilustración** → verificar 1:1 rutas de BD vs archivos, como en la feature anterior.
- **Rutina larga ×15 en tests manuales** → el smoke verifica conteos y sumas vía API, no reproduce las rutinas completas.

## Fuera de alcance

- Navegación/salto de ejercicios, guardado parcial, cambios en la animación de respiración.
- Reordenamiento de ejercicios ya existentes fuera de las rutinas nuevas.
