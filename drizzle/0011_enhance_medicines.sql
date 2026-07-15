ALTER TABLE "medicines" ADD COLUMN "manufacturer" text;
ALTER TABLE "medicines" ADD COLUMN "is_active" boolean DEFAULT true NOT NULL;
