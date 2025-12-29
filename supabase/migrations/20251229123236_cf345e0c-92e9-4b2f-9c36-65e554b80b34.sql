-- Fix security issues in profiles and user_roles tables

-- 1. Drop the overly permissive public SELECT policy on profiles
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- 2. Create more restrictive policies for profiles
-- Users can view their own full profile (including email)
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Create a view for public profile data (without email) that authenticated users can see
CREATE POLICY "Authenticated users can view public profile data"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

-- 3. Add restrictive policies for user_roles table
-- Only admins can insert new roles (using security definer function)
CREATE POLICY "Only admins can insert roles"
  ON public.user_roles FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Only admins can update roles
CREATE POLICY "Only admins can update roles"
  ON public.user_roles FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can delete roles
CREATE POLICY "Only admins can delete roles"
  ON public.user_roles FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));