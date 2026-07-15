ALTER TABLE "clinics" ADD COLUMN "invite_code" text;--> statement-breakpoint
ALTER TABLE "clinics" ADD CONSTRAINT "clinics_invite_code_unique" UNIQUE("invite_code");