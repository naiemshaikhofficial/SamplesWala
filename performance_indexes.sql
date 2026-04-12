-- 🚀 SAMPLES WALA PERFORMANCE INDEXES

-- 1. Optimizing Categories
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);

-- 2. Optimizing Sample Packs
CREATE INDEX IF NOT EXISTS idx_sample_packs_created_at ON sample_packs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sample_packs_category_id ON sample_packs(category_id);
CREATE INDEX IF NOT EXISTS idx_sample_packs_is_featured ON sample_packs(is_featured) WHERE is_featured = true;

-- 3. Optimizing Samples (High Traffic)
CREATE INDEX IF NOT EXISTS idx_samples_created_at ON samples(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_samples_pack_id ON samples(pack_id);
CREATE INDEX IF NOT EXISTS idx_samples_bpm ON samples(bpm);
CREATE INDEX IF NOT EXISTS idx_samples_key ON samples(key);

-- 4. Advanced Search (GIN Index for Tags Array)
-- Requires pg_trgm for text search if needed, but for array 'contains' operator, GIN is standard.
CREATE INDEX IF NOT EXISTS idx_samples_tags ON samples USING GIN (tags);

-- 5. User Vault & Accounts (Stability)
CREATE INDEX IF NOT EXISTS idx_user_vault_user_id ON user_vault(user_id);
CREATE INDEX IF NOT EXISTS idx_user_vault_item_id ON user_vault(item_id);
CREATE INDEX IF NOT EXISTS idx_user_accounts_user_id ON user_accounts(user_id);

-- 6. Purchases & Analytics
CREATE INDEX IF NOT EXISTS idx_purchases_user_id ON purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_purchases_created_at ON purchases(created_at DESC);
