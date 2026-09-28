# Bloom — PWA de movimiento gamificado (diseño)

Fecha: 2026-09-28

## Resumen

Bloom es una PWA mobile-first de seguimiento de hábitos sin ansiedad: check-in de ánimo, paseos de fin de semana y un flujo de ejercicio suave. La gamificación es una planta viva que crece con cada check-in/paseo — sin números, sin rachas. Backend con Neon Postgres + Drizzle, autenticación por email/contraseña. Toda la interfaz en español latinoamericano.

## Decisiones validadas

| Tema | Decisión |
|---|---|
| Datos | Full Drizzle + Neon Postgres (no solo localStorage) |
| Auth | Email + contraseña (NextAuth Credentials, JWT) |
| Idioma | Español LatAm hardcodeado (sin next-intl) |
| Animación planta | react-spring |
| Animación respiración workout | Framer Motion (según brief original) |
| Flujo de ejercicio | Cada ánimo → secuencia predefinida (3–4 ejercicios) |
| PWA | Soporte built-in de Next.js (sin next-pwa) |
| Iconos | Lucide React |

## Stack técnico

- Next.js 15 (App Router) + TypeScript
- Tailwind v4, config CSS-first en `src/styles.css` (tokens OKLCH, nombres semánticos — sin clases de color hardcodeadas en componentes)
- Drizzle ORM + Neon Postgres
- NextAuth.js (Credentials provider, bcrypt)
- react-spring (planta), framer-motion (círculo de respiración)
- Lucide React

## Estructura del proyecto

```
src/
├── app/
│   ├── (auth)/login/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx          # layout protegido (session check)
│   │   ├── page.tsx            # Home: check-in, planta, estado fin de semana
│   │   └── move/page.tsx       # Reproductor de ejercicio
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts
│   │   ├── checkin/route.ts    # POST check-in de ánimo + crecimiento
│   │   ├── ride/route.ts       # POST paseo de fin de semana
│   │   ├── plant/route.ts      # GET etapa de crecimiento
│   │   └── exercises/route.ts  # GET ejercicios del ánimo
│   ├── layout.tsx              # layout raíz, providers, metadata
│   └── globals.css
├── components/
│   ├── plant/PlantGrowth.tsx   # planta SVG animada (react-spring)
│   ├── mood/MoodButtons.tsx    # 4 botones pill + tarjeta fin de semana
│   ├── sos/SOSModal.tsx        # overlay glassmorphism
│   ├── workout/WorkoutPlayer.tsx # círculo respiración + flujo
│   └── ui/                     # Button, Card, Modal…
├── lib/
│   ├── auth.ts                 # config NextAuth
│   ├── db/                     # cliente, schema, queries
│   ├── utils.ts                # fechas, etapa de planta
│   └── constants.ts            # ánimos, biblioteca de ejercicios
├── hooks/
│   ├── usePlantStage.ts
│   ├── useCheckin.ts
│   └── useAuth.ts
└── styles.css                  # tokens Tailwind v4 (OKLCH)
```

## Modelo de datos (Drizzle)

- **users** — tabla del adaptador NextAuth (id, email, passwordHash, name, createdAt)
- **moods** — catálogo: Estresada, Ansiosa, Energética, Sin motivación (seed)
- **exercises** — name, durationSeconds, moodId FK (flujo predefinido por ánimo, 3–4 c/u)
- **dailyLogs** — date, userId FK, moodId FK, workoutDone, isWeekendRide, sosTriggered
- **plantStages** — userId FK, stage (0–N), derivado de check-ins + paseos

### Schema modelo (mantenido tal cual fue provisto)

```ts
// db/schema.ts
import { pgTable, uuid, varchar, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const moods = pgTable("moods", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 50 }).notNull().unique(),
});

export const exercises = pgTable("exercises", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  durationSeconds: integer("duration_seconds").notNull(),
  moodId: uuid("mood_id").references(() => moods.id).notNull(),
});

export const dailyLogs = pgTable("daily_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  date: timestamp("date", { withTimezone: true }).defaultNow().notNull(),
  moodId: uuid("mood_id").references(() => moods.id),
  workoutDone: boolean("workout_done").default(false).notNull(),
  isWeekendRide: boolean("is_weekend_ride").default(false).notNull(),
  sosTriggered: boolean("sos_triggered").default(false).notNull(),
});

export const moodsRelations = relations(moods, ({ many }) => ({
  exercises: many(exercises),
  dailyLogs: many(dailyLogs),
}));

export const exercisesRelations = relations(exercises, ({ one }) => ({
  mood: one(moods, {
    fields: [exercises.moodId],
    references: [moods.id],
  }),
}));

export const dailyLogsRelations = relations(dailyLogs, ({ one }) => ({
  mood: one(moods, {
    fields: [dailyLogs.moodId],
    references: [moods.id],
  }),
}));
```

(Se extiende con `users` y `plantStages`, y `dailyLogs.userId` para multi-usuario.)

## API

| Ruta | Método | Propósito |
|---|---|---|
| `/api/auth/[...nextauth]` | GET/POST | login/logout |
| `/api/checkin` | POST | registrar check-in, incrementar etapa de planta |
| `/api/ride` | POST | registrar paseo fin de semana, incrementar etapa |
| `/api/plant` | GET | etapa actual de crecimiento |
| `/api/exercises?mood=` | GET | flujo de ejercicios del ánimo |
| `/api/log` | GET | estado del día (¿ya hizo check-in?) |

**Lógica de crecimiento**: `stage = min(checkins + rides, MAX_STAGE)` — nunca se muestra el número; solo la planta crece. Umbrales visuales: semilla → brote → hojas → flor (4 estados).

**Auth**: Credentials + bcrypt, sesión JWT (sin tabla de sesiones). `/` redirige a `/login` sin sesión; layout `(dashboard)` exige sesión.

## Diseño UI

- Tokens en `src/styles.css`: `--color-sage-*` (verdes apagados), `--color-cream-*` (blancos cálidos), `--color-lavender-*` (acentos lavanda), `--color-ink-*` (texto). Esquinas `rounded-2xl/3xl`, ≥48px por target, columna centrada max 430px en desktop, light theme por defecto.
- **Home**: planta central (react-spring) que agrega hoja/flor al check-in; "¿Cómo te sientes hoy?" + 4 pills grandes (Estresada/Viento, Ansiosa/Nube, Energética/Rayo, Sin motivación/Batería); FAB Heart → SOS; fin de semana: pills ocultos → tarjeta naturaleza (Bike) + "Registrar paseo del fin de semana".
- **Workout**: círculo de respiración grande y lento (Framer Motion), nombre del ejercicio en tipografía elegante, controles "Pausar" y "Siguiente movimiento"; al terminar registra `workoutDone`.
- **SOS**: overlay glassmorphism pantalla completa; arriba círculo de respiración de 3 min; abajo tarjeta "Sugerencia de consuelo" (ej. batido de plátano con proteína); registra `sosTriggered` en silencio.
- Estado de fin de semana y lecturas de localStorage solo en `useEffect` (SSR-safe, sin mismatch).

## Pruebas y verificación

- Unit (Vitest): cálculo de etapa, detección de fin de semana, mapeo ánimo→flujo, utilidades de fecha
- Integración: rutas API contra BD de test
- Componentes (React Testing Library): MoodButtons (entre semana/fin de semana), lógica pause/next de WorkoutPlayer, abrir/cerrar SOS
- Manual: hidratación sin warnings, install prompt PWA, flujos de auth
- Antes de declarar completo: `npm run lint`, `npm run typecheck`, `npm test`

## Manejo de errores

- Rutas API con errores tipados; mutaciones no rompen la UI si fallan (log silencioso)
- Sin sesión → redirect a `/login`; expiración manejada por NextAuth
- Acceso a localStorage/DOM solo tras hidratación

## Fases de implementación

1. Scaffold: Next.js + TS, tokens Tailwind v4, deps, estructura
2. Capa de datos: schema, cliente Neon, migraciones, seed de moods + ejercicios
3. Auth: NextAuth, página de login, layout protegido
4. Home: planta, mood buttons, estado fin de semana, mutaciones, SOS
5. Workout Player: círculo respiración, flujo, controles, registro
6. PWA: manifest, íconos, service worker, metadata por ruta
7. Pruebas + verificación

## Fuera de alcance (YAGNI)

- UI de sync multi-dispositivo, multi-idioma, features sociales, dashboards de métricas.
