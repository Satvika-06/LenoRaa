-- ==========================================================================
-- MIGRATION: Make user_id nullable in profiles table to prevent signup errors
-- ==========================================================================

-- Remove the NOT NULL constraint from the deprecated user_id column in public.profiles
ALTER TABLE public.profiles ALTER COLUMN user_id DROP NOT NULL;
