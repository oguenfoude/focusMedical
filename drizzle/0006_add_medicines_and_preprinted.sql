CREATE TABLE "medicines" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"brand_name" text NOT NULL,
	"dci" text,
	"dosage" text,
	"form" text
);
--> statement-breakpoint
ALTER TABLE "clinics" ADD COLUMN "pre_printed_template" boolean DEFAULT false NOT NULL;