-- CODE_FARM Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User roles enum
CREATE TYPE user_role AS ENUM ('user', 'admin', 'moderator');

-- Problem difficulty enum
CREATE TYPE problem_difficulty AS ENUM ('easy', 'medium', 'hard', 'extreme');

-- Submission status enum
CREATE TYPE submission_status AS ENUM ('pending', 'running', 'accepted', 'wrong_answer', 'time_limit', 'memory_limit', 'runtime_error', 'compile_error');

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    aura INTEGER DEFAULT 0,
    problems_solved INTEGER DEFAULT 0,
    total_submissions INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User roles table (separate for security)
CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    role user_role NOT NULL DEFAULT 'user',
    UNIQUE(user_id, role)
);

-- Categories/Tags for problems
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Problems table
CREATE TABLE problems (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    difficulty problem_difficulty NOT NULL,
    aura_reward INTEGER NOT NULL,
    time_limit_ms INTEGER DEFAULT 2000,
    memory_limit_mb INTEGER DEFAULT 256,
    input_format TEXT,
    output_format TEXT,
    constraints TEXT,
    sample_input TEXT,
    sample_output TEXT,
    hidden_test_cases JSONB, -- [{input: "", expected_output: ""}]
    solved_count INTEGER DEFAULT 0,
    submission_count INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Problem categories junction table
CREATE TABLE problem_categories (
    problem_id UUID REFERENCES problems(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    PRIMARY KEY (problem_id, category_id)
);

-- Submissions table
CREATE TABLE submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    problem_id UUID REFERENCES problems(id) ON DELETE CASCADE NOT NULL,
    code TEXT NOT NULL,
    language VARCHAR(50) NOT NULL,
    status submission_status DEFAULT 'pending',
    runtime_ms INTEGER,
    memory_kb INTEGER,
    error_message TEXT,
    test_results JSONB, -- [{passed: true/false, runtime: ms, memory: kb}]
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User solved problems (for quick lookup)
CREATE TABLE user_solved_problems (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    problem_id UUID REFERENCES problems(id) ON DELETE CASCADE,
    first_solved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    best_submission_id UUID REFERENCES submissions(id),
    PRIMARY KEY (user_id, problem_id)
);

-- Leaderboard view
CREATE OR REPLACE VIEW leaderboard AS
SELECT 
    u.id,
    u.username,
    u.aura,
    u.problems_solved,
    u.total_submissions,
    RANK() OVER (ORDER BY u.aura DESC, u.problems_solved DESC) as rank
FROM users u
ORDER BY u.aura DESC, u.problems_solved DESC;

-- Indexes for performance
CREATE INDEX idx_users_aura ON users(aura DESC);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_problems_difficulty ON problems(difficulty);
CREATE INDEX idx_problems_slug ON problems(slug);
CREATE INDEX idx_submissions_user_id ON submissions(user_id);
CREATE INDEX idx_submissions_problem_id ON submissions(problem_id);
CREATE INDEX idx_submissions_created_at ON submissions(created_at DESC);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_problems_updated_at BEFORE UPDATE ON problems
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default categories
INSERT INTO categories (name, description) VALUES
    ('Arrays', 'Problems involving array manipulation and traversal'),
    ('Strings', 'String processing and manipulation'),
    ('Dynamic Programming', 'DP and memoization problems'),
    ('Trees', 'Binary trees, BST, and tree traversal'),
    ('Graphs', 'Graph algorithms and traversal'),
    ('Math', 'Mathematical and number theory problems'),
    ('Sorting', 'Sorting algorithms and applications'),
    ('Searching', 'Binary search and search algorithms'),
    ('Recursion', 'Recursive problem solving'),
    ('Greedy', 'Greedy algorithm problems');

-- Insert sample problems
INSERT INTO problems (title, slug, description, difficulty, aura_reward, input_format, output_format, sample_input, sample_output, is_published) VALUES
    ('Two Sum', 'two-sum', 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.', 'easy', 10, 'First line: n (array size)\nSecond line: n space-separated integers\nThird line: target sum', 'Two space-separated indices', '4\n2 7 11 15\n9', '0 1', true),
    ('Reverse String', 'reverse-string', 'Write a function that reverses a string. The input string is given as an array of characters.', 'easy', 5, 'A single line containing the string', 'The reversed string', 'hello', 'olleh', true),
    ('Binary Search', 'binary-search', 'Given a sorted array of distinct integers and a target value, return the index if the target is found. If not, return -1.', 'easy', 15, 'First line: n (array size)\nSecond line: n sorted integers\nThird line: target', 'Index of target or -1', '6\n-1 0 3 5 9 12\n9', '4', true);
