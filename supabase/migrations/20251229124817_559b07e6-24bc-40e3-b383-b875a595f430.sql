-- Create categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create problems table
CREATE TABLE public.problems (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard', 'extreme')),
  aura_reward INTEGER NOT NULL DEFAULT 10,
  time_limit_ms INTEGER NOT NULL DEFAULT 1000,
  memory_limit_mb INTEGER NOT NULL DEFAULT 256,
  input_format TEXT,
  output_format TEXT,
  constraints TEXT,
  sample_input TEXT,
  sample_output TEXT,
  solved_count INTEGER NOT NULL DEFAULT 0,
  submission_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create problem_categories junction table
CREATE TABLE public.problem_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  problem_id UUID NOT NULL REFERENCES public.problems(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  UNIQUE(problem_id, category_id)
);

-- Create submissions table
CREATE TABLE public.submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  problem_id UUID NOT NULL REFERENCES public.problems(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  language TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  runtime_ms INTEGER,
  memory_kb INTEGER,
  error_message TEXT,
  test_results JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create solved_problems table to track first solves
CREATE TABLE public.solved_problems (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  problem_id UUID NOT NULL REFERENCES public.problems(id) ON DELETE CASCADE,
  first_solved_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, problem_id)
);

-- Enable RLS on all tables
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.problem_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solved_problems ENABLE ROW LEVEL SECURITY;

-- Categories: Public read access
CREATE POLICY "Categories are publicly readable"
  ON public.categories FOR SELECT
  TO authenticated
  USING (true);

-- Problems: Public read access for authenticated users
CREATE POLICY "Problems are readable by authenticated users"
  ON public.problems FOR SELECT
  TO authenticated
  USING (true);

-- Problem categories: Public read access
CREATE POLICY "Problem categories are readable by authenticated users"
  ON public.problem_categories FOR SELECT
  TO authenticated
  USING (true);

-- Submissions: Users can only see their own submissions
CREATE POLICY "Users can view their own submissions"
  ON public.submissions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own submissions"
  ON public.submissions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own submissions"
  ON public.submissions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Solved problems: Users can see their own solved problems
CREATE POLICY "Users can view their own solved problems"
  ON public.solved_problems FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own solved problems"
  ON public.solved_problems FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create function to get problems with filters
CREATE OR REPLACE FUNCTION public.get_problems(
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0,
  p_difficulty TEXT DEFAULT NULL,
  p_search TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  slug TEXT,
  difficulty TEXT,
  aura_reward INTEGER,
  solved_count INTEGER,
  submission_count INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.title,
    p.slug,
    p.difficulty,
    p.aura_reward,
    p.solved_count,
    p.submission_count
  FROM public.problems p
  WHERE 
    (p_difficulty IS NULL OR p.difficulty = p_difficulty)
    AND (p_search IS NULL OR p.title ILIKE '%' || p_search || '%')
  ORDER BY p.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- Create function to count problems
CREATE OR REPLACE FUNCTION public.count_problems(
  p_difficulty TEXT DEFAULT NULL,
  p_search TEXT DEFAULT NULL
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  total INTEGER;
BEGIN
  SELECT COUNT(*)::INTEGER INTO total
  FROM public.problems p
  WHERE 
    (p_difficulty IS NULL OR p.difficulty = p_difficulty)
    AND (p_search IS NULL OR p.title ILIKE '%' || p_search || '%');
  RETURN total;
END;
$$;

-- Insert sample problems
INSERT INTO public.problems (title, slug, description, difficulty, aura_reward, input_format, output_format, sample_input, sample_output, constraints) VALUES
('Two Sum', 'two-sum', 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.', 'easy', 10, 'First line: n (size of array)\nSecond line: n space-separated integers\nThird line: target integer', 'Two space-separated indices', '4\n2 7 11 15\n9', '0 1', '2 <= nums.length <= 10^4'),
('Reverse String', 'reverse-string', 'Write a function that reverses a string. The input string is given as an array of characters.', 'easy', 10, 'A single line containing the string', 'The reversed string', 'hello', 'olleh', '1 <= s.length <= 10^5'),
('Maximum Subarray', 'maximum-subarray', 'Given an integer array nums, find the contiguous subarray which has the largest sum and return its sum.', 'medium', 25, 'First line: n\nSecond line: n space-separated integers', 'Maximum subarray sum', '9\n-2 1 -3 4 -1 2 1 -5 4', '6', '1 <= nums.length <= 10^5'),
('Binary Search', 'binary-search', 'Given a sorted array of integers and a target value, return the index if the target is found. If not, return -1.', 'easy', 10, 'First line: n\nSecond line: n sorted integers\nThird line: target', 'Index of target or -1', '6\n-1 0 3 5 9 12\n9', '4', '1 <= nums.length <= 10^4'),
('Merge Intervals', 'merge-intervals', 'Given an array of intervals, merge all overlapping intervals.', 'medium', 25, 'First line: n\nNext n lines: two integers representing interval start and end', 'Merged intervals, one per line', '4\n1 3\n2 6\n8 10\n15 18', '1 6\n8 10\n15 18', '1 <= intervals.length <= 10^4'),
('LRU Cache', 'lru-cache', 'Design a data structure that follows the constraints of a Least Recently Used (LRU) cache.', 'hard', 50, 'Operations on the cache', 'Results of get operations', 'See problem description', 'See problem description', 'Capacity is between 1 and 3000'),
('Median of Two Sorted Arrays', 'median-two-sorted-arrays', 'Given two sorted arrays, return the median of the two sorted arrays. The overall run time complexity should be O(log (m+n)).', 'hard', 50, 'Two lines of sorted integers', 'The median value', '1 3\n2', '2.0', 'Arrays can be empty'),
('N-Queens', 'n-queens', 'Place N chess queens on an N×N chessboard so that no two queens threaten each other.', 'extreme', 100, 'A single integer N', 'Number of distinct solutions', '4', '2', '1 <= n <= 9');

-- Create trigger to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_problems_updated_at
  BEFORE UPDATE ON public.problems
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();