CREATE TABLE "user_profiles" (
  "user_id" uuid PRIMARY KEY NOT NULL,
  "preferred_duration" integer DEFAULT 15 NOT NULL,
  "focus" varchar(40) DEFAULT 'balance' NOT NULL,
  "onboarding_completed" boolean DEFAULT false NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workout_sessions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL,
  "day_key" varchar(10) NOT NULL,
  "mood" varchar(50) NOT NULL,
  "before_energy" integer NOT NULL,
  "before_stress" integer NOT NULL,
  "after_energy" integer,
  "after_stress" integer,
  "duration_seconds" integer NOT NULL,
  "exercises_completed" integer DEFAULT 0 NOT NULL,
  "total_exercises" integer DEFAULT 0 NOT NULL,
  "started_at" timestamp with time zone DEFAULT now() NOT NULL,
  "completed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "user_goals" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL,
  "type" varchar(40) NOT NULL,
  "target" integer NOT NULL,
  "period" varchar(20) DEFAULT 'weekly' NOT NULL,
  "active" boolean DEFAULT true NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "achievements" (
  "id" varchar(60) PRIMARY KEY NOT NULL,
  "name" varchar(120) NOT NULL,
  "description" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_achievements" (
  "user_id" uuid NOT NULL,
  "achievement_id" varchar(60) NOT NULL,
  "unlocked_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "user_achievements_pk" PRIMARY KEY("user_id","achievement_id")
);
--> statement-breakpoint
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "workout_sessions" ADD CONSTRAINT "workout_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "user_goals" ADD CONSTRAINT "user_goals_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_achievement_id_achievements_id_fk" FOREIGN KEY ("achievement_id") REFERENCES "public"."achievements"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
INSERT INTO "achievements" ("id", "name", "description") VALUES
  ('first_session', 'Primer paso', 'Completaste tu primera sesión.'),
  ('seven_care_days', 'Siete días de cuidado', 'Registraste siete días de cuidado.'),
  ('thirty_minutes', 'Treinta minutos', 'Completaste al menos treinta minutos de movimiento.'),
  ('seven_sessions', 'Constancia', 'Completaste siete sesiones de movimiento.')
ON CONFLICT ("id") DO NOTHING;
