-- Drop the security definer view - it's not needed
DROP VIEW IF EXISTS public.public_profiles;

-- The "Authenticated users can view public profile data" policy was already dropped
-- The only remaining SELECT policy should be "Users can view their own profile"

-- For leaderboard functionality, create a security definer function 
-- that returns public data only (no email)
CREATE OR REPLACE FUNCTION public.get_leaderboard(limit_count INTEGER DEFAULT 50, offset_count INTEGER DEFAULT 0)
RETURNS TABLE(
  id UUID,
  username TEXT,
  aura INTEGER,
  problems_solved INTEGER,
  total_submissions INTEGER,
  rank BIGINT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    p.id,
    p.username,
    p.aura,
    p.problems_solved,
    p.total_submissions,
    ROW_NUMBER() OVER (ORDER BY p.aura DESC, p.problems_solved DESC) as rank
  FROM public.profiles p
  ORDER BY p.aura DESC, p.problems_solved DESC
  LIMIT limit_count
  OFFSET offset_count
$$;

-- Function to get public profile by username (no email)
CREATE OR REPLACE FUNCTION public.get_public_profile(profile_username TEXT)
RETURNS TABLE(
  id UUID,
  username TEXT,
  aura INTEGER,
  problems_solved INTEGER,
  total_submissions INTEGER,
  created_at TIMESTAMPTZ
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    p.id,
    p.username,
    p.aura,
    p.problems_solved,
    p.total_submissions,
    p.created_at
  FROM public.profiles p
  WHERE p.username = profile_username
  LIMIT 1
$$;