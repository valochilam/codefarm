// API Configuration - Update this URL when deploying
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface ApiError {
  error: string;
}

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.token = localStorage.getItem('auth_token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  getToken(): string | null {
    return this.token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error((data as ApiError).error || 'Request failed');
    }

    return data as T;
  }

  // Auth endpoints
  async register(username: string, email: string, password: string) {
    const data = await this.request<{ user: User; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    });
    this.setToken(data.token);
    return data;
  }

  async login(email: string, password: string) {
    const data = await this.request<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(data.token);
    return data;
  }

  async getMe() {
    return this.request<UserProfile>('/auth/me');
  }

  logout() {
    this.setToken(null);
  }

  // Users endpoints
  async getLeaderboard(limit = 50, offset = 0) {
    return this.request<{ users: LeaderboardUser[]; total: number }>(
      `/users/leaderboard?limit=${limit}&offset=${offset}`
    );
  }

  async getUserProfile(username: string) {
    return this.request<UserProfileFull>(`/users/profile/${username}`);
  }

  async getMyRank() {
    return this.request<{ rank: number | null }>('/users/my-rank');
  }

  // Problems endpoints
  async getProblems(params?: { limit?: number; offset?: number; difficulty?: string; category?: string; search?: string }) {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.set('limit', String(params.limit));
    if (params?.offset) queryParams.set('offset', String(params.offset));
    if (params?.difficulty) queryParams.set('difficulty', params.difficulty);
    if (params?.category) queryParams.set('category', params.category);
    if (params?.search) queryParams.set('search', params.search);
    
    const query = queryParams.toString();
    return this.request<{ problems: Problem[]; total: number }>(
      `/problems${query ? `?${query}` : ''}`
    );
  }

  async getCategories() {
    return this.request<Category[]>('/problems/categories');
  }

  async getProblem(slug: string) {
    return this.request<ProblemDetail>(`/problems/${slug}`);
  }

  // Submissions endpoints
  async submitSolution(problemId: string, code: string, language: string) {
    return this.request<{ id: string; status: string; createdAt: string; message: string }>('/submissions', {
      method: 'POST',
      body: JSON.stringify({ problemId, code, language }),
    });
  }

  async getSubmission(id: string) {
    return this.request<SubmissionDetail>(`/submissions/${id}`);
  }

  async getProblemSubmissions(problemId: string, limit = 20) {
    return this.request<Submission[]>(`/submissions/problem/${problemId}?limit=${limit}`);
  }
}

// Types
export interface User {
  id: string;
  username: string;
  email: string;
  aura: number;
  problemsSolved: number;
}

export interface UserProfile extends User {
  totalSubmissions: number;
  roles: string[];
  createdAt: string;
}

export interface UserProfileFull extends UserProfile {
  rank: number;
  recentSubmissions: {
    id: string;
    status: string;
    language: string;
    created_at: string;
    title: string;
    slug: string;
  }[];
  solvedProblems: {
    id: string;
    title: string;
    slug: string;
    difficulty: string;
    aura_reward: number;
    first_solved_at: string;
  }[];
}

export interface LeaderboardUser {
  id: string;
  username: string;
  aura: number;
  problemsSolved: number;
  totalSubmissions: number;
  rank: number;
}

export interface Problem {
  id: string;
  title: string;
  slug: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'extreme';
  auraReward: number;
  solvedCount: number;
  submissionCount: number;
}

export interface ProblemDetail extends Problem {
  description: string;
  timeLimitMs: number;
  memoryLimitMb: number;
  inputFormat: string;
  outputFormat: string;
  constraints: string;
  sampleInput: string;
  sampleOutput: string;
  categories: string[];
}

export interface Category {
  id: string;
  name: string;
  description: string;
}

export interface Submission {
  id: string;
  language: string;
  status: string;
  runtimeMs: number | null;
  memoryKb: number | null;
  createdAt: string;
}

export interface SubmissionDetail extends Submission {
  code: string;
  errorMessage: string | null;
  testResults: { passed: boolean; runtime: number; memory: number }[] | null;
  problem: {
    title: string;
    slug: string;
  };
}

export const api = new ApiClient(API_BASE_URL);
