-- ==========================================================================
-- MIGRATION: ALTER profiles table columns & reload schema cache
-- ==========================================================================

-- 1. Safely add id column if it does not exist (ensure UUID type & default gen_random_uuid())
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS id UUID DEFAULT gen_random_uuid();

-- 2. Safely add auth_user_id column if it does not exist
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS auth_user_id UUID REFERENCES auth.users(id);

-- 3. If database originally used user_id as PK, migrate references to auth_user_id
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'user_id'
    ) THEN
        UPDATE public.profiles SET auth_user_id = user_id WHERE auth_user_id IS NULL;
    END IF;
END $$;

-- 4. Apply NOT NULL and UNIQUE constraint on auth_user_id column
ALTER TABLE public.profiles ALTER COLUMN auth_user_id SET NOT NULL;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_auth_user_id_key UNIQUE (auth_user_id);

-- 5. Transition primary key from user_id to id
-- Drop old primary key constraint if it references user_id
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_pkey;
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_user_id_pkey;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_id_pkey PRIMARY KEY (id);

-- 6. Add new fields requested for Google OAuth & returning login states
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS provider TEXT DEFAULT 'email';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS provider_id TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE;

-- 7. Update triggers and setup function to correctly map raw metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    auth_user_id, 
    full_name, 
    email, 
    phone, 
    avatar_url, 
    provider, 
    provider_id,
    last_login
  )
  VALUES (
    gen_random_uuid(),
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'Guest Soap Lover'),
    COALESCE(NEW.email, ''),
    NEW.phone,
    NEW.raw_user_meta_data->>'avatar_url',
    COALESCE(NEW.raw_app_meta_data->>'provider', 'email'),
    COALESCE(NEW.raw_user_meta_data->>'sub', NEW.id::text),
    now()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Re-apply RLS policies on profiles table for owner/admin selectors
DROP POLICY IF EXISTS "Profiles: owner select" ON public.profiles;
DROP POLICY IF EXISTS "Profiles: owner update" ON public.profiles;

CREATE POLICY "Profiles: owner select" 
ON public.profiles FOR SELECT 
TO authenticated 
USING (auth.uid() = auth_user_id OR public.is_admin());

CREATE POLICY "Profiles: owner update" 
ON public.profiles FOR UPDATE 
TO authenticated 
USING (auth.uid() = auth_user_id OR public.is_admin())
WITH CHECK (auth.uid() = auth_user_id OR public.is_admin());

-- 9. Force PostgREST reload schema cache immediately
NOTIFY pgrst, 'reload schema';
