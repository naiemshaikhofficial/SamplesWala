-- 📸 UPGRADE SOFTWARE SCHEMA FOR RICHER CONTENT

ALTER TABLE software_products ADD COLUMN IF NOT EXISTS screenshots TEXT[];
ALTER TABLE software_products ADD COLUMN IF NOT EXISTS long_description TEXT;
ALTER TABLE software_products ADD COLUMN IF NOT EXISTS main_features TEXT[];
ALTER TABLE software_products ADD COLUMN IF NOT EXISTS system_requirements JSONB;
