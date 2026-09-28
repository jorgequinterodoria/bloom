CREATE TABLE "daily_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"date" timestamp with time zone DEFAULT now() NOT NULL,
	"day_key" varchar(10) NOT NULL,
	"user_id" uuid NOT NULL,
	"mood_id" uuid,
	"workout_done" boolean DEFAULT false NOT NULL,
	"is_weekend_ride" boolean DEFAULT false NOT NULL,
	"sos_triggered" boolean DEFAULT false NOT NULL,
	CONSTRAINT "daily_logs_user_day_unique" UNIQUE("user_id","day_key")
);
--> statement-breakpoint
CREATE TABLE "exercises" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"duration_seconds" integer NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"mood_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "moods" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(50) NOT NULL,
	CONSTRAINT "moods_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "plant_stages" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"stage" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"name" varchar(100),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "daily_logs" ADD CONSTRAINT "daily_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_logs" ADD CONSTRAINT "daily_logs_mood_id_moods_id_fk" FOREIGN KEY ("mood_id") REFERENCES "public"."moods"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exercises" ADD CONSTRAINT "exercises_mood_id_moods_id_fk" FOREIGN KEY ("mood_id") REFERENCES "public"."moods"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plant_stages" ADD CONSTRAINT "plant_stages_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;