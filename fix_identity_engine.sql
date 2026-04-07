-- 🧬 SAMPLES_WALA :: IDENTITY_ENGINE_FIX
-- Re-establishes the 'profiles' table and the 'auth.users' trigger to fix registration failures.

-- 1. PROFILES TABLE (Standard Identity)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    avatar_url TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. ENABLE RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. POLICIES
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 4. TRIGGER FUNCTION: Synchronize Auth Identities to Public Tables
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into Profiles
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data->>'full_name', 
    NEW.raw_user_meta_data->>'avatar_url'
  );

  -- 🔋 BOOTSTRAP: Initialize User Account (0 credits for new registrants)
  -- This replaces separate triggers previously defined in commerce shards.
  INSERT INTO public.user_accounts (user_id, credits)
  VALUES (NEW.id, 10) -- Granting 10 free trial credits as a registration bonus
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. TRIGGER ACTIVATION
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 6. AUDIT: Ensure user_accounts exists with correct constraints
ALTER TABLE IF EXISTS user_accounts ADD COLUMN IF NOT EXISTS is_trial_used BOOLEAN DEFAULT false;
ALTER TABLE IF EXISTS user_accounts ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'INACTIVE';
ALTER TABLE IF EXISTS user_accounts ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'NONE';

-- End of Fix Protocol
