import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api, LeaderboardUser } from '@/lib/api';
import { Button } from '@/components/ui/button';

const realmColors: Record<string, { border: string; text: string; bg: string }> = {
  mortal: { border: 'border-muted-foreground', text: 'text-muted-foreground', bg: 'bg-muted-foreground/10' },
  immortal: { border: 'border-violet-500', text: 'text-violet-500', bg: 'bg-violet-500/10' },
  divine: { border: 'border-accent', text: 'text-accent', bg: 'bg-accent/10' },
};

function getRealm(aura: number): { name: string; stage: string; colors: typeof realmColors.mortal } {
  if (aura >= 2800) return { name: 'Divine', stage: 'Immortal Sovereign', colors: realmColors.divine };
  if (aura >= 2400) return { name: 'Divine', stage: 'Immortal King', colors: realmColors.divine };
  if (aura >= 2000) return { name: 'Divine', stage: 'Golden Immortal', colors: realmColors.divine };
  if (aura >= 1600) return { name: 'Divine', stage: 'True Immortal', colors: realmColors.divine };
  if (aura >= 1200) return { name: 'Immortal', stage: 'Immortal Ascension', colors: realmColors.immortal };
  if (aura >= 850) return { name: 'Immortal', stage: 'Dao Integration', colors: realmColors.immortal };
  if (aura >= 600) return { name: 'Immortal', stage: 'Void Refinement', colors: realmColors.immortal };
  if (aura >= 400) return { name: 'Immortal', stage: 'Soul Transformation', colors: realmColors.immortal };
  if (aura >= 250) return { name: 'Mortal', stage: 'Nascent Soul', colors: realmColors.mortal };
  if (aura >= 125) return { name: 'Mortal', stage: 'Core Formation', colors: realmColors.mortal };
  if (aura >= 50) return { name: 'Mortal', stage: 'Foundation Establishment', colors: realmColors.mortal };
  return { name: 'Mortal', stage: 'Qi Condensation', colors: realmColors.mortal };
}

export default function Leaderboard() {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const limit = 50;

  useEffect(() => {
    loadLeaderboard();
  }, [page]);

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      const result = await api.getLeaderboard(limit, page * limit);
      setUsers(result.users);
      setTotal(result.total);
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
    } finally {
      setLoading(false);
    }
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
              <Link to="/problems" className="hover:text-accent transition-colors">Challenges</Link>
              <Link to="/leaderboard" className="text-accent">Leaderboard</Link>
            </div>
          </div>
        </nav>

        <main className="container mx-auto px-6 py-12">
          <h1 className="font-mono text-4xl font-bold uppercase tracking-wider mb-4">
            Global Rankings
          </h1>
          <p className="font-mono text-muted-foreground mb-12">
            The most powerful cultivators across all realms
          </p>

          {/* Leaderboard Table */}
          <div className="border-4 border-border bg-card">
            <div className="grid grid-cols-12 gap-4 p-4 border-b-4 border-border font-mono text-sm uppercase tracking-wider text-muted-foreground">
              <div className="col-span-1">Rank</div>
              <div className="col-span-3">Cultivator</div>
              <div className="col-span-4">Realm / Stage</div>
              <div className="col-span-2">Aura</div>
              <div className="col-span-2">Problems</div>
            </div>

            {loading ? (
              <div className="p-8 text-center font-mono text-muted-foreground">
                Loading rankings...
              </div>
            ) : users.length === 0 ? (
              <div className="p-8 text-center font-mono text-muted-foreground">
                No cultivators found. The server may not be running.
              </div>
            ) : (
              users.map((user) => {
                const realm = getRealm(user.aura);
                return (
                  <div
                    key={user.id}
                    className="grid grid-cols-12 gap-4 p-4 border-b border-border/50 hover:bg-secondary/50 transition-colors"
                  >
                    <div className="col-span-1 font-mono font-bold">
                      {user.rank <= 3 ? (
                        <span className={user.rank === 1 ? 'text-accent' : user.rank === 2 ? 'text-muted-foreground' : 'text-crimson'}>
                          #{user.rank}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">#{user.rank}</span>
                      )}
                    </div>
                    <div className="col-span-3 font-mono font-medium">
                      {user.username}
                    </div>
                    <div className="col-span-4">
                      <span className={`font-mono text-sm px-2 py-1 border-2 ${realm.colors.border} ${realm.colors.text} ${realm.colors.bg}`}>
                        {realm.name} · {realm.stage}
                      </span>
                    </div>
                    <div className="col-span-2 font-mono text-accent font-bold">
                      {user.aura.toLocaleString()}
                    </div>
                    <div className="col-span-2 font-mono text-muted-foreground">
                      {user.problemsSolved} solved
                    </div>
                  </div>
                );
              })
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
