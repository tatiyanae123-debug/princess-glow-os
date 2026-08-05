CREATE TYPE "public"."import_batch_status" AS ENUM('previewed', 'confirmed', 'undone');--> statement-breakpoint
CREATE TABLE "import_batches" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"source" text NOT NULL,
	"source_version" text NOT NULL,
	"category" text NOT NULL,
	"status" "import_batch_status" DEFAULT 'previewed' NOT NULL,
	"summary" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"confirmed_at" timestamp,
	"undone_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "source" text;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "source_version" text;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "import_batch_id" text;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "editable" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "habits" ADD COLUMN "source" text;--> statement-breakpoint
ALTER TABLE "habits" ADD COLUMN "source_version" text;--> statement-breakpoint
ALTER TABLE "habits" ADD COLUMN "import_batch_id" text;--> statement-breakpoint
ALTER TABLE "habits" ADD COLUMN "editable" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "routines" ADD COLUMN "source" text;--> statement-breakpoint
ALTER TABLE "routines" ADD COLUMN "source_version" text;--> statement-breakpoint
ALTER TABLE "routines" ADD COLUMN "import_batch_id" text;--> statement-breakpoint
ALTER TABLE "routines" ADD COLUMN "editable" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "calendar_events" ADD COLUMN "source" text;--> statement-breakpoint
ALTER TABLE "calendar_events" ADD COLUMN "source_version" text;--> statement-breakpoint
ALTER TABLE "calendar_events" ADD COLUMN "import_batch_id" text;--> statement-breakpoint
ALTER TABLE "calendar_events" ADD COLUMN "editable" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "calendar_events" ADD COLUMN "recurrence_days_of_week" text[];--> statement-breakpoint
ALTER TABLE "beauty_routines" ADD COLUMN "source" text;--> statement-breakpoint
ALTER TABLE "beauty_routines" ADD COLUMN "source_version" text;--> statement-breakpoint
ALTER TABLE "beauty_routines" ADD COLUMN "import_batch_id" text;--> statement-breakpoint
ALTER TABLE "beauty_routines" ADD COLUMN "editable" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "import_batches" ADD CONSTRAINT "import_batches_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "import_batches_user_id_idx" ON "import_batches" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "import_batches_status_idx" ON "import_batches" USING btree ("status");