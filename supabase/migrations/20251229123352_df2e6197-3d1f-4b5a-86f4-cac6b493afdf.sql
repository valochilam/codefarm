-- Add explicit DELETE policy for profiles to prevent direct deletion
CREATE POLICY "Profiles cannot be deleted directly"
  ON public.profiles FOR DELETE
  USING (false);