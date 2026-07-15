-- Enable trigram extension for fast %query% substring search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Drop old btree indexes (they don't work with %query% leading wildcard)
DROP INDEX IF EXISTS "medicines_brand_name_idx";
DROP INDEX IF EXISTS "medicines_dci_idx";
DROP INDEX IF EXISTS "medications_name_idx";

-- GIN trigram indexes for ILIKE '%query%' pattern
CREATE INDEX "medicines_brand_name_trgm_idx" ON "medicines" USING gin ("brand_name" gin_trgm_ops);
CREATE INDEX "medicines_dci_trgm_idx" ON "medicines" USING gin ("dci" gin_trgm_ops);
CREATE INDEX "medications_name_trgm_idx" ON "medications" USING gin ("name" gin_trgm_ops);

-- Index for getAuthUser() query (queried on every request)
CREATE INDEX "clinic_users_auth_user_id_idx" ON "clinic_users" ("auth_user_id");
