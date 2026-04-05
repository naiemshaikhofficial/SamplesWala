-- 1. Enable RLS on the table (if not already enabled)
ALTER TABLE IF EXISTS unlocked_samples ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing restrictive policies if any (Clean slate)
DROP POLICY IF EXISTS "Users can view their own unlocks" ON unlocked_samples;
DROP POLICY IF EXISTS "Authenticated users can unlock samples" ON unlocked_samples;

-- 3. Policy: User can view only THEIR OWN unlocked samples 🕵️‍♂️🛡️
CREATE POLICY "Users can view their own unlocks" 
ON unlocked_samples FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

-- 4. Policy: Authenticated users can INSERT an unlock record 💎🎰
-- We specify CHECK (auth.uid() = user_id) to ensure they can't unlock for someone else
CREATE POLICY "Authenticated users can unlock samples" 
ON unlocked_samples FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);
