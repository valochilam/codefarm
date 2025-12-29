import { supabase } from '@/integrations/supabase/client';

// Types for the new Supabase-based API
export interface Problem {
  id: string;
  title: string;
  slug: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'extreme';
  aura_reward: number;
  solved_count: number;
  submission_count: number;
}

export interface ProblemDetail extends Problem {
  description: string;
  time_limit_ms: number;
  memory_limit_mb: number;
  input_format: string | null;
  output_format: string | null;
  constraints: string | null;
  sample_input: string | null;
  sample_output: string | null;
}

export interface LeaderboardUser {
  id: string;
  username: string;
  aura: number;
  problems_solved: number;
  total_submissions: number;
  rank: number;
}

export interface Submission {
  id: string;
  user_id: string;
  problem_id: string;
  code: string;
  language: string;
  status: string;
  runtime_ms: number | null;
  memory_kb: number | null;
  error_message: string | null;
  test_results: unknown | null;
  created_at: string;
}

// Get problems with filters
export async function getProblems(params?: {
  limit?: number;
  offset?: number;
  difficulty?: string;
  search?: string;
}): Promise<{ problems: Problem[]; total: number }> {
  const limit = params?.limit || 20;
  const offset = params?.offset || 0;
  const difficulty = params?.difficulty || null;
  const search = params?.search || null;

  // Get problems using the database function
  const { data: problems, error: problemsError } = await supabase.rpc('get_problems', {
    p_limit: limit,
    p_offset: offset,
    p_difficulty: difficulty,
    p_search: search,
  });

  if (problemsError) {
    console.error('Error fetching problems:', problemsError);
    throw problemsError;
  }

  // Get total count
  const { data: total, error: countError } = await supabase.rpc('count_problems', {
    p_difficulty: difficulty,
    p_search: search,
  });

  if (countError) {
    console.error('Error counting problems:', countError);
    throw countError;
  }

  return {
    problems: (problems || []) as Problem[],
    total: total || 0,
  };
}

// Get single problem by slug
export async function getProblem(slug: string): Promise<ProblemDetail | null> {
  const { data, error } = await supabase
    .from('problems')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (error) {
    console.error('Error fetching problem:', error);
    throw error;
  }

  return data as ProblemDetail | null;
}

// Get leaderboard
export async function getLeaderboard(limit = 50, offset = 0): Promise<{ users: LeaderboardUser[]; total: number }> {
  const { data: users, error: usersError } = await supabase.rpc('get_leaderboard', {
    limit_count: limit,
    offset_count: offset,
  });

  if (usersError) {
    console.error('Error fetching leaderboard:', usersError);
    throw usersError;
  }

  // Get total count of profiles
  const { count, error: countError } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });

  if (countError) {
    console.error('Error counting profiles:', countError);
    throw countError;
  }

  return {
    users: (users || []) as LeaderboardUser[],
    total: count || 0,
  };
}

// Run code
export async function runCode(code: string, language: string, input: string): Promise<{
  output: string;
  status: string;
  runtimeMs: number;
  memoryKb: number;
}> {
  const { data, error } = await supabase.functions.invoke('run-code', {
    body: { code, language, input },
  });

  if (error) {
    console.error('Error running code:', error);
    throw error;
  }

  return data;
}

// Submit solution
export async function submitSolution(problemId: string, code: string, language: string): Promise<Submission> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('Not authenticated');
  }

  const { data, error } = await supabase
    .from('submissions')
    .insert({
      user_id: user.id,
      problem_id: problemId,
      code,
      language,
      status: 'pending',
    })
    .select()
    .single();

  if (error) {
    console.error('Error submitting solution:', error);
    throw error;
  }

  return data as Submission;
}

// Get user submissions for a problem
export async function getProblemSubmissions(problemId: string): Promise<Submission[]> {
  const { data, error } = await supabase
    .from('submissions')
    .select('*')
    .eq('problem_id', problemId)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    console.error('Error fetching submissions:', error);
    throw error;
  }

  return (data || []) as Submission[];
}
