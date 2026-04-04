-- =================================================================================
-- e-Territoire AI - Supabase Schema (RBAC & Approval System)
-- =================================================================================

-- 1. Drop existing tables and types to start from scratch
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TYPE IF EXISTS public.user_role CASCADE;

-- 2. Create custom type for roles
CREATE TYPE public.user_role AS ENUM ('super_admin', 'admin_central', 'fonctionnaire', 'citizen');

-- 3. Create the profiles table
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  role public.user_role DEFAULT 'citizen'::public.user_role NOT NULL,
  is_approved BOOLEAN DEFAULT FALSE NOT NULL,
  city TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS Policies for profiles

-- Policy: Users can read their own profile
CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

-- Policy: Super Admins can see all profiles
CREATE POLICY "Super admins can view all profiles" 
ON public.profiles FOR SELECT 
USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin')
);

-- Policy: Super Admins can update all profiles
CREATE POLICY "Super admins can update all profiles" 
ON public.profiles FOR UPDATE 
USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin')
);

-- Policy: Admin Centrals can see users where role='fonctionnaire' AND city matches
CREATE POLICY "Admin centrals can view fonctionnaires in their city" 
ON public.profiles FOR SELECT 
USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin_central' AND city = profiles.city)
  AND profiles.role = 'fonctionnaire'
);

-- Policy: Admin Centrals can update (approve) users where role='fonctionnaire' AND city matches
CREATE POLICY "Admin centrals can update fonctionnaires in their city" 
ON public.profiles FOR UPDATE 
USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin_central' AND city = profiles.city) 
  AND profiles.role = 'fonctionnaire'
);

-- 6. Create a trigger to automatically create a profile when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role, city, is_approved)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    COALESCE((new.raw_user_meta_data->>'role')::public.user_role, 'citizen'::public.user_role),
    new.raw_user_meta_data->>'city',
    -- Special Rule: If role is 'citizen', set is_approved to TRUE automatically. For others, it remains FALSE.
    CASE WHEN (new.raw_user_meta_data->>'role') = 'citizen' THEN TRUE ELSE FALSE END
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 7. Hardcoded Admins
-- Note: You must run this AFTER the users have signed up in Supabase Auth.
-- Replace the emails with the actual emails used during sign up.
/*
UPDATE public.profiles
SET role = 'super_admin', is_approved = true
WHERE id IN (
  SELECT id FROM auth.users WHERE email IN ('bayadzakaria6@gmail.com', 'superadmin@gov.ma')
);
*/
