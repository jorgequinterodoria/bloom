# Bloom — Timer de ejercicio e ilustraciones

**Fecha:** 2026-09-29
**Estado:** aprobado por el usuario (4 decisiones de brainstorming)
**Alcance:** ampliación del WorkoutPlayer con temporizador visible e ilustración + pasos por ejercicio.

## Decisiones validadas

1. **Ilustraciones:** SVGs propios (16 archivos, estilo plano Bloom) — sin dependencias externas ni copyright.
2. **Datos:** columnas nuevas en la tabla `exercises` (migración + seed), no un mapa en constants.
3. **Timer:** barra de progreso + segundos restantes (no anillo, no solo números).
4. **Ubicación:** siempre visible dentro del reproductor (no colapsable, no reemplaza al círculo de respiración).

## 1. Datos y API

- Migración Drizzle (`drizzle-kit generate` → aplicar a Neon):
  - `exercises.instructions text` (nullable) — pasos en español, 1–3 frases.
  - `exercises.illustration varchar(255)` (nullable) — ruta `/exercises/<slug>.svg`.
- `scripts/seed.ts`: actualiza los 16 ejercicios existentes con instructions + illustration (idempotente). Nombres y duraciones no cambian.
- `GET /api/exercises?mood=` → `{ mood, exercises: [{ name, durationSeconds, instructions, illustration }] }` — aditivo; único consumidor: WorkoutPlayer.
- 16 SVGs en `public/exercises/`.
- `public/sw.js`: añadir `/exercises/` al allowlist `STATIC_PREFIXES` (asset estático, sin datos de usuario).

## 2. UI (WorkoutPlayer)

Layout por ejercicio, de arriba a abajo:

1. Nombre del ejercicio (ya existe)
2. **Timer:** `Ns` (segundos restantes) + barra `h-2` que se llena 0→100%, `bg-primary` sobre `bg-primary-soft`; `role="progressbar"` con `aria-valuenow/min/max`. El número NO lleva `aria-live` (se anunciaría cada segundo); el `aria-live` de "Ejercicio N de M" sigue siendo el anuncio de cambio.
3. Círculo de respiración (sin cambios)
4. `<img src={illustration} alt={name}>` ~160 px de alto
5. `instructions` en `text-sm text-ink-muted`, centrado

- `instructions`/`illustration` null o vacío → simplemente no se renderiza ese bloque, sin errores.
- Controles (Pausar / Siguiente) fijos abajo; el centro scrollea si hace falta en 430 px.
- Reduced-motion: la barra es cambio de ancho (permitido), sin animación añadida.

## 3. Ilustraciones

- Slugs: `Respiración 4-7-8` → `respiracion-4-7-8.svg`.
- Servidas como `<img>` = documento aislado → cada SVG define su propia paleta hex interna (mismos valores que los tokens: fondo `#f7f4ee`, figuras sage `#b7ccb8`/`#8faf8f`, acento lavender `#a088c4`, líneas `#55524c`).
- Figura humana plana minimalista por ejercicio; mismo `viewBox` en todos; sin texto dentro del SVG (el texto va en `instructions`).

## 4. Tests (TDD, WorkoutPlayer.test.tsx)

1. Timer: muestra la duración inicial (`60 s`); con fake timers baja a `59 s` y `aria-valuenow` cambia.
2. Instrucciones: API con `instructions`/`illustration` → texto + `img` con `alt` = nombre.
3. Datos faltantes → no hay bloque de explicación, sin error.
4. Los 55 tests existentes siguen verdes (forma de API aditiva).

## 5. Verificación final

- `npm run lint && npm run typecheck && npm test && npm run build`
- Smoke vivo con temp user: `GET /api/exercises?mood=Ansiosa` devuelve campos nuevos; SVGs responden 200; limpieza del temp user al final.
- Confirmar que `sw.js` con `/exercises/` en allowlist sigue sin cachear HTML autenticado.

## Fuera de alcance

- GIFs/videos reales.
- Cambios a nombres, duraciones o cantidad de ejercicios.
