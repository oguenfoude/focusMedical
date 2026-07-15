ALTER TABLE "clinics" ADD COLUMN "logo_url" text;--> statement-breakpoint
ALTER TABLE "ordonnances" ADD CONSTRAINT "ordonnances_consultation_id_unique" UNIQUE("consultation_id");