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

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  name: varchar("name", { length: 100 }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const moods = pgTable("moods", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 50 }).notNull().unique(),
});

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

export const dailyLogs = pgTable(
  "daily_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    date: timestamp("date", { withTimezone: true }).defaultNow().notNull(),
    // Fecha local del usuario ("YYYY-MM-DD"), enviada por el cliente.
    // Es la fuente de verdad de "hoy" (el servidor puede estar en UTC).
    dayKey: varchar("day_key", { length: 10 }).notNull(),
    userId: uuid("user_id")
      .references(() => users.id)
      .notNull(),
    moodId: uuid("mood_id").references(() => moods.id),
    workoutDone: boolean("workout_done").default(false).notNull(),
    isWeekendRide: boolean("is_weekend_ride").default(false).notNull(),
    sosTriggered: boolean("sos_triggered").default(false).notNull(),
  },
  (table) => ({
    userDay: unique("daily_logs_user_day_unique").on(table.userId, table.dayKey),
  }),
);

export const plantStages = pgTable("plant_stages", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => users.id),
  stage: integer("stage").notNull().default(0),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const usersRelations = relations(users, ({ one, many }) => ({
  dailyLogs: many(dailyLogs),
  plantStage: one(plantStages),
}));

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

export const plantStagesRelations = relations(plantStages, ({ one }) => ({
  user: one(users, {
    fields: [plantStages.userId],
    references: [users.id],
  }),
}));
