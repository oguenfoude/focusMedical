-- Fix 14 missing columns across 5 tables + type/nullability mismatches
-- Run via Supabase SQL Editor or `npx drizzle-kit migrate`

-- 1. clinics: add prescription_template
ALTER TABLE "clinics" ADD COLUMN "prescription_template" text DEFAULT 'standard' NOT NULL;

-- 2. clinic_users: add phone, specialty, ordre_registration_number
ALTER TABLE "clinic_users" ADD COLUMN "phone" text;
ALTER TABLE "clinic_users" ADD COLUMN "specialty" text;
ALTER TABLE "clinic_users" ADD COLUMN "ordre_registration_number" text;

-- 3. patients: add 7 missing columns
ALTER TABLE "patients" ADD COLUMN "gender" text;
ALTER TABLE "patients" ADD COLUMN "note" text;
ALTER TABLE "patients" ADD COLUMN "weight_kg" integer;
ALTER TABLE "patients" ADD COLUMN "height_cm" integer;
ALTER TABLE "patients" ADD COLUMN "price" integer;
ALTER TABLE "patients" ADD COLUMN "is_regular" boolean DEFAULT false;
ALTER TABLE "patients" ADD COLUMN "price_note" text;

-- 4. patients: fix age type from integer to text
ALTER TABLE "patients" ADD COLUMN "age_text" text;
UPDATE "patients" SET "age_text" = "age"::text WHERE "age" IS NOT NULL;
ALTER TABLE "patients" DROP COLUMN "age";
ALTER TABLE "patients" RENAME COLUMN "age_text" TO "age";

-- 5. reservations: add time
ALTER TABLE "reservations" ADD COLUMN "time" text;

-- 6. consultations: add clinic_user_id and price_items
ALTER TABLE "consultations" ADD COLUMN "clinic_user_id" uuid;
ALTER TABLE "consultations" ADD CONSTRAINT "consultations_clinic_user_id_clinic_users_id_fk" FOREIGN KEY ("clinic_user_id") REFERENCES "public"."clinic_users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "consultations" ADD COLUMN "price_items" text;

-- 7. clinic_schedule: fix day_of_week NOT NULL + add unique constraint
ALTER TABLE "clinic_schedule" ALTER COLUMN "day_of_week" SET NOT NULL;
ALTER TABLE "clinic_schedule" ADD CONSTRAINT "clinic_schedule_clinic_day_unique" UNIQUE("clinic_id", "day_of_week");
