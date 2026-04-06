-- 🧬 UPGRADE COMMERCE FIDELITY: SUBSCRIPTIONS & PACKS
-- Adding artifact-level metadata to commerce entities

ALTER TABLE subscription_plans ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE subscription_plans ADD COLUMN IF NOT EXISTS features TEXT[];

ALTER TABLE credit_packs ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE credit_packs ADD COLUMN IF NOT EXISTS features TEXT[];

-- 💿 SEEDING HIGH-FIDELITY METADATA: SUBSCRIPTION PLANS
UPDATE subscription_plans SET 
    description = 'The ultimate starting point for new sound designers.',
    features = ARRAY['100 Monthly Credits', 'Starter License Rights', 'Access to Exclusive Packs', 'Standard Support']
WHERE name = 'Starter';

UPDATE subscription_plans SET 
    description = 'High-octane artifact access for professional producers.',
    features = ARRAY['300 Monthly Credits', 'Professional License Rights', 'Early Access to Artifacts', 'Priority Support', 'Beta Module Access']
WHERE name = 'Professional';

UPDATE subscription_plans SET 
    description = 'Full-spectrum studio dominance. Every artifact at your command.',
    features = ARRAY['1000 Monthly Credits', 'Universal Commercial License', 'Private Artifact Requests', 'Mastermind Support', 'Internal Module Repository']
WHERE name = 'Producer';

-- 🎰 SEEDING HIGH-FIDELITY METADATA: CREDIT PACKS
UPDATE credit_packs SET 
    description = 'A quick signal-boost for your artifact vault.',
    features = ARRAY['50 Immediate Credits', 'Never Expires', 'Standard License']
WHERE name = 'Mini Pack';

UPDATE credit_packs SET 
    description = 'Optimized artifact bundle for heavy sessions.',
    features = ARRAY['250 Immediate Credits', 'Priority Signal', 'Pro License Included', 'Bonus Sample Artifact']
WHERE name = 'Mega Bundle';

UPDATE credit_packs SET 
    description = 'Maximum signal saturation. The ultimate vault top-up.',
    features = ARRAY['1000 Immediate Credits', 'Elite Signal Priority', 'Universal License Included', '3x Bonus Artifact Bundles']
WHERE name = 'Ultimate Stash';
