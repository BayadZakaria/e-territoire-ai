-- =================================================================================
-- e-Territoire AI - Supabase Schema
-- =================================================================================

-- 1. Create custom types for roles and status
CREATE TYPE public.user_role AS ENUM ('citizen', 'official', 'admin_central', 'super_admin');
CREATE TYPE public.user_status AS ENUM ('pending', 'active', 'pending_deletion');
CREATE TYPE public.doc_status AS ENUM ('pending', 'processed', 'failed');

-- 2. Create the profiles table
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  surname TEXT NOT NULL,
  phone TEXT NOT NULL,
  cnie TEXT,
  grade TEXT,
  matricule TEXT,
  city TEXT NOT NULL,
  role public.user_role DEFAULT 'citizen'::public.user_role NOT NULL,
  status public.user_status DEFAULT 'pending'::public.user_status NOT NULL,
  is_approved BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Create the scanned_documents table
CREATE TABLE public.scanned_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  file_url TEXT NOT NULL,
  extracted_data JSONB,
  doc_type TEXT NOT NULL,
  status public.doc_status DEFAULT 'pending'::public.doc_status NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scanned_documents ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS Policies for profiles

-- Policy: Users can read their own profile
CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

-- Policy: Super admins can read all profiles
CREATE POLICY "Super admins can view all profiles" 
ON public.profiles FOR SELECT 
USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin')
);

-- Policy: Admin centrals can read profiles in their city
CREATE POLICY "Admin centrals can view profiles in their city" 
ON public.profiles FOR SELECT 
USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin_central' AND city = profiles.city)
);

-- Policy: Super admins can update all profiles
CREATE POLICY "Super admins can update all profiles" 
ON public.profiles FOR UPDATE 
USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin')
);

-- Policy: Admin centrals can update official profiles in their city
CREATE POLICY "Admin centrals can update official profiles in their city" 
ON public.profiles FOR UPDATE 
USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin_central' AND city = profiles.city) 
  AND profiles.role = 'official'
);

-- 6. Create RLS Policies for scanned_documents

-- Policy: Users can read their own documents
CREATE POLICY "Users can view own documents" 
ON public.scanned_documents FOR SELECT 
USING (auth.uid() = user_id);

-- Policy: Users can insert their own documents
CREATE POLICY "Users can insert own documents" 
ON public.scanned_documents FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Policy: Officials and Admins can read all documents in their city
CREATE POLICY "Officials and Admins can view city documents" 
ON public.scanned_documents FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.id = auth.uid() 
    AND p.role IN ('official', 'admin_central', 'super_admin')
    AND (p.role = 'super_admin' OR p.city = (SELECT city FROM public.profiles WHERE id = scanned_documents.user_id))
  )
);

-- 7. Create a trigger to automatically create a profile when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  is_google boolean;
  assigned_role public.user_role;
  assigned_status public.user_status;
  assigned_approved boolean;
  assigned_city text;
  assigned_cnie text;
  assigned_grade text;
  assigned_matricule text;
BEGIN
  -- Check if the user signed up via Google OAuth
  is_google := (new.raw_app_meta_data->>'provider' = 'google');

  IF is_google THEN
    -- Force citizen role and default values for Google users
    assigned_role := 'citizen'::public.user_role;
    assigned_status := 'active'::public.user_status;
    assigned_approved := TRUE;
    assigned_city := 'Non spécifiée';
    assigned_cnie := NULL;
    assigned_grade := NULL;
    assigned_matricule := NULL;
  ELSE
    -- Use provided metadata for email/password signups
    assigned_role := COALESCE((new.raw_user_meta_data->>'role')::public.user_role, 'citizen'::public.user_role);
    assigned_status := CASE WHEN assigned_role = 'citizen' THEN 'active'::public.user_status ELSE 'pending'::public.user_status END;
    assigned_approved := CASE WHEN assigned_role = 'citizen' THEN TRUE ELSE FALSE END;
    assigned_city := COALESCE(new.raw_user_meta_data->>'city', 'Non renseignée');
    assigned_cnie := new.raw_user_meta_data->>'cnie';
    assigned_grade := new.raw_user_meta_data->>'grade';
    assigned_matricule := new.raw_user_meta_data->>'matricule';
  END IF;

  INSERT INTO public.profiles (id, email, name, surname, phone, cnie, grade, matricule, city, role, status, is_approved)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'surname', ''),
    COALESCE(new.raw_user_meta_data->>'phone', ''),
    assigned_cnie,
    assigned_grade,
    assigned_matricule,
    assigned_city,
    assigned_role,
    assigned_status,
    assigned_approved
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists to allow re-running
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 8. Create a trigger to prevent privilege escalation on profile updates
CREATE OR REPLACE FUNCTION public.prevent_privilege_escalation()
RETURNS trigger AS $$
DECLARE
  current_user_role public.user_role;
BEGIN
  -- Get the role of the user performing the update
  SELECT role INTO current_user_role FROM public.profiles WHERE id = auth.uid();
  
  -- If the user is not an admin, they cannot change sensitive fields
  IF current_user_role NOT IN ('admin_central', 'super_admin') THEN
    NEW.role := OLD.role;
    NEW.status := OLD.status;
    NEW.is_approved := OLD.is_approved;
    NEW.grade := OLD.grade;
    NEW.matricule := OLD.matricule;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS ensure_no_privilege_escalation ON public.profiles;

CREATE TRIGGER ensure_no_privilege_escalation
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.prevent_privilege_escalation();
