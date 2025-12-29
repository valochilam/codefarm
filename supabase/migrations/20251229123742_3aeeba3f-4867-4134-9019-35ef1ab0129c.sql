-- Block anonymous access to profiles table
CREATE POLICY "Block anonymous access to profiles"
  ON public.profiles FOR SELECT
  TO anon
  USING (false);

-- Block anonymous access to user_roles table
CREATE POLICY "Block anonymous access to user_roles"
  ON public.user_roles FOR SELECT
  TO anon
  USING (false);

-- Revoke any grants to anon role on these tables
REVOKE ALL ON public.profiles FROM anon;
REVOKE ALL ON public.user_roles FROM anon;