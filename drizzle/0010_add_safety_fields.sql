ALTER TABLE "patients" ADD COLUMN "blood_type" text;
ALTER TABLE "patients" ADD COLUMN "allergies" text;
ALTER TABLE "patients" ADD COLUMN "chronic_conditions" text;
ALTER TABLE "reservations" ADD COLUMN "type" text DEFAULT 'consultation' NOT NULL;
ALTER TABLE "consultations" ADD COLUMN "vital_signs" text;
