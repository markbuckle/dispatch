ALTER TABLE "request_logs" DROP CONSTRAINT "request_logs_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "request_logs" ADD CONSTRAINT "request_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE set null ON UPDATE no action;