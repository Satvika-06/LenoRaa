-- ==========================================================================
-- MIGRATION: Restructure profiles table & update triggers/RLS references
-- ==========================================================================

-- 1. Drop triggers that depend on public.profiles
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_profile_admin_update ON public.profiles;
DROP TRIGGER IF EXISTS update_profiles_modtime ON public.profiles;

-- 2. Drop existing foreign key constraints on user_id in dependent tables
ALTER TABLE IF EXISTS public.cart_items DROP CONSTRAINT IF EXISTS cart_items_user_id_fkey;
ALTER TABLE IF EXISTS public.wishlist DROP CONSTRAINT IF EXISTS wishlist_user_id_fkey;
ALTER TABLE IF EXISTS public.addresses DROP CONSTRAINT IF EXISTS addresses_user_id_fkey;
ALTER TABLE IF EXISTS public.orders DROP CONSTRAINT IF EXISTS orders_user_id_fkey;
ALTER TABLE IF EXISTS public.reviews DROP CONSTRAINT IF EXISTS reviews_user_id_fkey;
ALTER TABLE IF EXISTS public.notifications DROP CONSTRAINT IF EXISTS notifications_user_id_fkey;
ALTER TABLE IF EXISTS public.search_history DROP CONSTRAINT IF EXISTS search_history_user_id_fkey;
ALTER TABLE IF EXISTS public.recently_viewed DROP CONSTRAINT IF EXISTS recently_viewed_user_id_fkey;

-- From enterprise schema migration
ALTER TABLE IF EXISTS public.google_accounts DROP CONSTRAINT IF EXISTS google_accounts_user_id_fkey;
ALTER TABLE IF EXISTS public.support_tickets DROP CONSTRAINT IF EXISTS support_tickets_user_id_fkey;
ALTER TABLE IF EXISTS public.activity_logs DROP CONSTRAINT IF EXISTS activity_logs_user_id_fkey;

-- 3. Drop profiles table
DROP TABLE IF EXISTS public.profiles CASCADE;

-- 4. Create profiles table with clean requested schema
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    profile_image TEXT,
    is_admin BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 6. Add new foreign key constraints referencing auth.users(id) directly
-- This satisfies the literal requirement: "Every table should reference auth.users.id"
ALTER TABLE public.cart_items ADD CONSTRAINT cart_items_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.wishlist ADD CONSTRAINT wishlist_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.addresses ADD CONSTRAINT addresses_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.orders ADD CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.reviews ADD CONSTRAINT reviews_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.notifications ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.search_history ADD CONSTRAINT search_history_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.recently_viewed ADD CONSTRAINT recently_viewed_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- From enterprise schema migration
ALTER TABLE public.google_accounts ADD CONSTRAINT google_accounts_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.support_tickets ADD CONSTRAINT support_tickets_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.activity_logs ADD CONSTRAINT activity_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 7. Update functions to reference auth_user_id instead of user_id
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN COALESCE(
    (SELECT is_admin FROM public.profiles WHERE auth_user_id = auth.uid()),
    false
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.protect_profile_admin_flag()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_admin <> OLD.is_admin THEN
    IF NOT COALESCE((SELECT is_admin FROM public.profiles WHERE auth_user_id = auth.uid()), false) THEN
      RAISE EXCEPTION 'Access Denied: Only administrators can modify role assignments.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, auth_user_id, full_name, email, phone, profile_image)
  VALUES (
    gen_random_uuid(),
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'Guest Soap Lover'),
    COALESCE(NEW.email, ''),
    NEW.phone,
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Recreate triggers with updated configurations
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER on_profile_admin_update
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_profile_admin_flag();

CREATE TRIGGER update_profiles_modtime
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_modified_column();

-- 9. Define RLS Policies for Profiles
-- Users can only view their own profile (or admins can view)
CREATE POLICY "Profiles: owner select" 
ON public.profiles FOR SELECT 
TO authenticated 
USING (auth.uid() = auth_user_id OR public.is_admin());

-- Users can only update their own profile (or admins can update)
CREATE POLICY "Profiles: owner update" 
ON public.profiles FOR UPDATE 
TO authenticated 
USING (auth.uid() = auth_user_id OR public.is_admin())
WITH CHECK (auth.uid() = auth_user_id OR public.is_admin());
