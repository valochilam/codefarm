-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Authenticated users can view public profile data" ON public.profiles;

-- Create a view that exposes only public profile data (no email)
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT 
  id,
  username,
  aura,
  problems_solved,
  total_submissions,
  created_at
FROM public.profiles;

-- Grant access to the view for authenticated users
GRANT SELECT ON public.public_profiles TO authenticated;
GRANT SELECT ON public.public_profiles TO anon;