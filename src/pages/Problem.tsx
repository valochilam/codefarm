import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api, ProblemDetail } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { CodeEditor } from '@/components/CodeEditor';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

const difficultyColors: Record<string, string> = {
  easy: 'text-jade border-jade bg-jade/10',
  medium: 'text-accent border-accent bg-accent/10',
  hard: 'text-crimson border-crimson bg-crimson/10',
  extreme: 'text-violet-500 border-violet-500 bg-violet-500/10',
};

const defaultCode: Record<string, string> = {
  python: `# Your solution here
def solve():
    pass

if __name__ == "__main__":
    solve()
`,
  javascript: `// Your solution here
function solve() {
  
}

solve();
`,
  cpp: `#include <iostream>
using namespace std;

int main() {
    // Your solution here
    return 0;
}
`,
  java: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        // Your solution here
    }
}
`,
};

export default function Problem() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  const [problem, setProblem] = useState<ProblemDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('python');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (slug) {
      loadProblem();
    }
  }, [slug]);

  useEffect(() => {
    setCode(defaultCode[language] || '');
  }, [language]);

  const loadProblem = async () => {
    setLoading(true);
    try {
      const data = await api.getProblem(slug!);
      setProblem(data);
    } catch (error) {
      console.error('Failed to load problem:', error);
      toast({
        title: 'Error',
        description: 'Failed to load problem. Is the server running?',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }

    if (!code.trim()) {
      toast({
        title: 'Error',
        description: 'Please write some code before submitting.',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    try {
      const result = await api.submitSolution(problem!.id, code, language);
      toast({
        title: 'Submission Received',
        description: result.message,
      });
    } catch (error) {
      toast({
        title: 'Submission Failed',
        description: error instanceof Error ? error.message : 'Failed to submit',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="font-mono text-muted-foreground">Loading problem...</div>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="font-mono text-2xl mb-4">Problem Not Found</div>
          <Link to="/problems" className="text-accent hover:underline font-mono">
            Back to Problems
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground dark">
      <div className="dark bg-background text-foreground">
        {/* Navigation */}
        <nav className="border-b-4 border-border bg-card">
          <div className="container mx-auto px-6 py-4 flex justify-between items-center">
            <Link to="/" className="font-mono text-2xl font-bold tracking-wider uppercase">
              CODE_FARM
            </Link>
            <div className="flex gap-4 font-mono text-sm uppercase tracking-wider">
              <Link to="/problems" className="hover:text-accent transition-colors">Challenges</Link>
              <Link to="/leaderboard" className="hover:text-accent transition-colors">Leaderboard</Link>
            </div>
          </div>
        </nav>

        <main className="container mx-auto px-6 py-8">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Problem Description */}
            <div className="space-y-6">
              <div>
                <Link to="/problems" className="font-mono text-sm text-muted-foreground hover:text-accent">
                  ← Back to Problems
                </Link>
              </div>

              <div className="flex items-center gap-4">
                <h1 className="font-mono text-3xl font-bold">{problem.title}</h1>
                <span className={`font-mono text-sm uppercase px-3 py-1 border-2 ${difficultyColors[problem.difficulty]}`}>
                  {problem.difficulty}
                </span>
              </div>

              <div className="flex gap-4 font-mono text-sm">
                <span className="text-accent">+{problem.auraReward} Aura</span>
                <span className="text-muted-foreground">|</span>
                <span className="text-muted-foreground">{problem.timeLimitMs}ms time limit</span>
                <span className="text-muted-foreground">|</span>
                <span className="text-muted-foreground">{problem.memoryLimitMb}MB memory</span>
              </div>

              <div className="border-4 border-border bg-card p-6 space-y-4">
                <div>
                  <h3 className="font-mono text-sm uppercase tracking-wider text-muted-foreground mb-2">Description</h3>
                  <p className="font-mono text-sm whitespace-pre-wrap">{problem.description}</p>
                </div>

                {problem.inputFormat && (
                  <div>
                    <h3 className="font-mono text-sm uppercase tracking-wider text-muted-foreground mb-2">Input Format</h3>
                    <p className="font-mono text-sm whitespace-pre-wrap">{problem.inputFormat}</p>
                  </div>
                )}

                {problem.outputFormat && (
                  <div>
                    <h3 className="font-mono text-sm uppercase tracking-wider text-muted-foreground mb-2">Output Format</h3>
                    <p className="font-mono text-sm whitespace-pre-wrap">{problem.outputFormat}</p>
                  </div>
                )}

                {problem.constraints && (
                  <div>
                    <h3 className="font-mono text-sm uppercase tracking-wider text-muted-foreground mb-2">Constraints</h3>
                    <p className="font-mono text-sm whitespace-pre-wrap">{problem.constraints}</p>
                  </div>
                )}
              </div>

              <div className="border-4 border-border bg-card p-6">
                <h3 className="font-mono text-sm uppercase tracking-wider text-muted-foreground mb-4">Sample</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <div className="font-mono text-xs text-muted-foreground mb-2">INPUT</div>
                    <pre className="bg-background border-2 border-border p-4 font-mono text-sm overflow-x-auto">
                      {problem.sampleInput}
                    </pre>
                  </div>
                  <div>
                    <div className="font-mono text-xs text-muted-foreground mb-2">OUTPUT</div>
                    <pre className="bg-background border-2 border-border p-4 font-mono text-sm overflow-x-auto">
                      {problem.sampleOutput}
                    </pre>
                  </div>
                </div>
              </div>
            </div>

            {/* Code Editor */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="font-mono text-xl font-bold uppercase">Your Solution</h2>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="w-[150px] font-mono border-4 border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="python">Python</SelectItem>
                    <SelectItem value="javascript">JavaScript</SelectItem>
                    <SelectItem value="cpp">C++</SelectItem>
                    <SelectItem value="java">Java</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <CodeEditor
                value={code}
                onChange={setCode}
                language={language}
                height="500px"
              />

              <div className="flex gap-4">
                <Button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex-1 font-mono uppercase tracking-wider border-4 border-border bg-jade text-jade-foreground hover:bg-jade/90"
                >
                  {submitting ? 'Submitting...' : 'Submit Solution'}
                </Button>
              </div>

              {!isAuthenticated && (
                <p className="font-mono text-sm text-muted-foreground text-center">
                  <Link to="/auth" className="text-accent hover:underline">Login</Link> to submit your solution
                </p>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
