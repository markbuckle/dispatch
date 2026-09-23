CREATE TYPE "public"."email_event_type" AS ENUM('sent', 'delivered', 'bounced', 'complained', 'delivery_delayed');--> statement-breakpoint
CREATE TYPE "public"."webhook_delivery_status" AS ENUM('pending', 'succeeded', 'failed');--> statement-breakpoint
ALTER TYPE "public"."email_status" ADD VALUE 'delivered';--> statement-breakpoint
ALTER TYPE "public"."email_status" ADD VALUE 'bounced';--> statement-breakpoint
ALTER TYPE "public"."email_status" ADD VALUE 'complained';--> statement-breakpoint
ALTER TYPE "public"."email_status" ADD VALUE 'delivery_delayed';--> statement-breakpoint
CREATE TABLE "email_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"type" "email_event_type" NOT NULL,
	"occurred_at" timestamp with time zone NOT NULL,
	"payload" jsonb NOT NULL,
	"provider_event_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "email_events" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "webhook_deliveries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"webhook_id" uuid NOT NULL,
	"message_id" text NOT NULL,
	"event_type" "email_event_type" NOT NULL,
	"payload" jsonb NOT NULL,
	"status" "webhook_delivery_status" NOT NULL,
	"attempt_count" integer DEFAULT 0 NOT NULL,
	"last_response_status" integer,
	"last_error" text,
	"next_attempt_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "webhook_deliveries" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "webhooks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"url" text NOT NULL,
	"events" "email_event_type"[] NOT NULL,
	"signing_secret" text NOT NULL,
	"disabled_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "webhooks" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "email_events" ADD CONSTRAINT "email_events_email_id_emails_id_fk" FOREIGN KEY ("email_id") REFERENCES "public"."emails"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_events" ADD CONSTRAINT "email_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "webhook_deliveries" ADD CONSTRAINT "webhook_deliveries_webhook_id_webhooks_id_fk" FOREIGN KEY ("webhook_id") REFERENCES "public"."webhooks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "webhooks" ADD CONSTRAINT "webhooks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "email_events_provider_event_id_idx" ON "email_events" USING btree ("provider_event_id");--> statement-breakpoint
CREATE INDEX "email_events_email_id_idx" ON "email_events" USING btree ("email_id");--> statement-breakpoint
CREATE INDEX "email_events_user_id_occurred_at_idx" ON "email_events" USING btree ("user_id","occurred_at");--> statement-breakpoint
CREATE INDEX "webhook_deliveries_webhook_id_idx" ON "webhook_deliveries" USING btree ("webhook_id");--> statement-breakpoint
CREATE INDEX "webhooks_user_id_idx" ON "webhooks" USING btree ("user_id");