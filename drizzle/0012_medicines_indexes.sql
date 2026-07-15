CREATE INDEX "medicines_brand_name_idx" ON "medicines" USING btree ("brand_name" text_pattern_ops);
CREATE INDEX "medicines_dci_idx" ON "medicines" USING btree ("dci" text_pattern_ops);
CREATE INDEX "medicines_form_idx" ON "medicines" ("form");
CREATE INDEX "medicines_manufacturer_idx" ON "medicines" ("manufacturer");
CREATE INDEX "medicines_is_active_idx" ON "medicines" ("is_active");
CREATE INDEX "medications_name_idx" ON "medications" USING btree ("name" text_pattern_ops);
