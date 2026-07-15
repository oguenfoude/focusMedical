-- GIN trigram indexes on form and manufacturer for search
CREATE INDEX "medicines_form_trgm_idx" ON "medicines" USING gin ("form" gin_trgm_ops);
CREATE INDEX "medicines_manufacturer_trgm_idx" ON "medicines" USING gin ("manufacturer" gin_trgm_ops);
