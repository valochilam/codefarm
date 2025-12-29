import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api, Problem as ProblemType } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const difficultyColors: Record<string, string> = {
  easy: 'text-jade border-jade',
  medium: 'text-accent border-accent',
  hard: 'text-crimson border-crimson',
  extreme: 'text-violet-500 border-violet-500',
};

export default function Problems() {
  const [problems, setProblems] = useState<ProblemType[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState<string>('');
  const [page, setPage] = useState(0);
  const limit = 20;

  useEffect(() => {
    loadProblems();
  }, [page, difficulty, search]);

  const loadProblems = async () => {
    setLoading(true);
    try {
      const result = await api.getProblems({
        limit,
        offset: page * limit,
        difficulty: difficulty || undefined,
        search: search || undefined,
      });
      setProblems(result.problems);
      setTotal(result.total);
    } catch (error) {
      console.error('Failed to load problems:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    loadProblems();
  };

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
              <Link to="/problems" className="text-accent">Challenges</Link>
              <Link to="/leaderboard" className="hover:text-accent transition-colors">Leaderboard</Link>
            </div>
          </div>
        </nav>

        <main className="container mx-auto px-6 py-12">
          <h1 className="font-mono text-4xl font-bold uppercase tracking-wider mb-8">
            The Problem Forge
          </h1>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <form onSubmit={handleSearch} className="flex-1">
              <Input
                placeholder="Search problems..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="font-mono border-4 border-border"
              />
            </form>
            <Select value={difficulty || 'all'} onValueChange={(v) => { setDifficulty(v === 'all' ? '' : v); setPage(0); }}>
              <SelectTrigger className="w-[180px] font-mono border-4 border-border">
                <SelectValue placeholder="All Difficulties" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Difficulties</SelectItem>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
                <SelectItem value="extreme">Extreme</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Problems Table */}
          <div className="border-4 border-border bg-card">
            <div className="grid grid-cols-12 gap-4 p-4 border-b-4 border-border font-mono text-sm uppercase tracking-wider text-muted-foreground">
              <div className="col-span-1">#</div>
              <div className="col-span-5">Title</div>
              <div className="col-span-2">Difficulty</div>
              <div className="col-span-2">Aura</div>
              <div className="col-span-2">Solved</div>
            </div>

            {loading ? (
              <div className="p-8 text-center font-mono text-muted-foreground">
                Loading challenges...
              </div>
            ) : problems.length === 0 ? (
              <div className="p-8 text-center font-mono text-muted-foreground">
                No problems found. The server may not be running.
              </div>
            ) : (
              problems.map((problem, index) => (
                <Link
                  key={problem.id}
                  to={`/problems/${problem.slug}`}
                  className="grid grid-cols-12 gap-4 p-4 border-b border-border/50 hover:bg-secondary/50 transition-colors"
                >
                  <div className="col-span-1 font-mono text-muted-foreground">
                    {page * limit + index + 1}
                  </div>
                  <div className="col-span-5 font-mono font-medium">
                    {problem.title}
                  </div>
                  <div className={`col-span-2 font-mono uppercase text-sm ${difficultyColors[problem.difficulty]}`}>
                    {problem.difficulty}
                  </div>
                  <div className="col-span-2 font-mono text-accent">
                    +{problem.auraReward}
                  </div>
                  <div className="col-span-2 font-mono text-muted-foreground">
                    {problem.solvedCount}
                  </div>
                </Link>
              ))
            )}
          </div>

          {/* Pagination */}
          {total > limit && (
            <div className="flex justify-center gap-4 mt-8">
              <Button
                variant="outline"
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                className="font-mono uppercase border-4"
              >
                Previous
              </Button>
              <span className="font-mono py-2">
                Page {page + 1} of {Math.ceil(total / limit)}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage(page + 1)}
                disabled={(page + 1) * limit >= total}
                className="font-mono uppercase border-4"
              >
                Next
              </Button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
