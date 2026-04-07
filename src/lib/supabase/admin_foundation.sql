-- 🛡️ WALA_CORE: SEPARATE_ADMINS_REGISTRY
-- Dedicated table to manage administrative access independent of profile data

-- 1. ADMINS TABLE
CREATE TABLE IF NOT EXISTS public.admins (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. ENABLE RLS
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- 3. POLICIES
-- Only existing admins can see the list of other admins
CREATE POLICY "Admins are viewable by admins only"
ON public.admins
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.admins WHERE user_id = auth.uid()
    )
);

-- 4. BOOTSTRAP: Add initial admin by ID or Email (Requires knowing the UID from auth.users)
-- INSERT INTO public.admins (user_id) VALUES ('YOUR_USER_UUID_HERE');

-- Simple function to verify admin status
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.admins WHERE admins.user_id = $1
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
