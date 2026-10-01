import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  jsonb,
  pgTable,
  primaryKey,
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
    energy: integer("energy").default(3).notNull(),
    stress: integer("stress").default(3).notNull(),
    note: text("note"),
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



export const userProfiles = pgTable("user_profiles", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => users.id),
  preferredDuration: integer("preferred_duration").default(15).notNull(),
  focus: varchar("focus", { length: 40 }).default("balance").notNull(),
  onboardingCompleted: boolean("onboarding_completed").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const workoutSessions = pgTable("workout_sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  dayKey: varchar("day_key", { length: 10 }).notNull(),
  mood: varchar("mood", { length: 50 }).notNull(),
  beforeEnergy: integer("before_energy").notNull(),
  beforeStress: integer("before_stress").notNull(),
  afterEnergy: integer("after_energy"),
  afterStress: integer("after_stress"),
  durationSeconds: integer("duration_seconds").notNull(),
  exercisesCompleted: integer("exercises_completed").notNull().default(0),
  totalExercises: integer("total_exercises").notNull().default(0),
  startedAt: timestamp("started_at", { withTimezone: true }).defaultNow().notNull(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
});

export const userGoals = pgTable("user_goals", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  type: varchar("type", { length: 40 }).notNull(),
  target: integer("target").notNull(),
  period: varchar("period", { length: 20 }).notNull().default("weekly"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const achievements = pgTable("achievements", {
  id: varchar("id", { length: 60 }).primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  description: text("description").notNull(),
});


export const coachMessages = pgTable("coach_messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  role: varchar("role", { length: 20 }).notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const wellnessEvents = pgTable("wellness_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  eventName: varchar("event_name", { length: 80 }).notNull(),
  metadata: jsonb("metadata").$type<Record<string, string | number | boolean | null>>(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const userAchievements = pgTable("user_achievements", {
  userId: uuid("user_id").references(() => users.id).notNull(),
  achievementId: varchar("achievement_id", { length: 60 }).references(() => achievements.id).notNull(),
  unlockedAt: timestamp("unlocked_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.userId, table.achievementId] }),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  dailyLogs: many(dailyLogs),
  plantStage: one(plantStages),
  profile: one(userProfiles),
  workoutSessions: many(workoutSessions),
  goals: many(userGoals),
  achievements: many(userAchievements),
  coachMessages: many(coachMessages),
  wellnessEvents: many(wellnessEvents),
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

export const userProfilesRelations = relations(userProfiles, ({ one }) => ({
  user: one(users, {
    fields: [userProfiles.userId],
    references: [users.id],
  }),
}));

export const workoutSessionsRelations = relations(workoutSessions, ({ one }) => ({
  user: one(users, {
    fields: [workoutSessions.userId],
    references: [users.id],
  }),
}));

export const userGoalsRelations = relations(userGoals, ({ one }) => ({
  user: one(users, {
    fields: [userGoals.userId],
    references: [users.id],
  }),
}));

export const coachMessagesRelations = relations(coachMessages, ({ one }) => ({
  user: one(users, { fields: [coachMessages.userId], references: [users.id] }),
}));

export const wellnessEventsRelations = relations(wellnessEvents, ({ one }) => ({
  user: one(users, { fields: [wellnessEvents.userId], references: [users.id] }),
}));

export const userAchievementsRelations = relations(userAchievements, ({ one }) => ({
  user: one(users, {
    fields: [userAchievements.userId],
    references: [users.id],
  }),
  achievement: one(achievements, {
    fields: [userAchievements.achievementId],
    references: [achievements.id],
  }),
}));
