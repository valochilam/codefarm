import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export function NavBar() {
  const { profile, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="border-b-4 border-border bg-card">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <Link to="/" className="font-mono text-2xl font-bold tracking-wider uppercase">
          CODE_FARM
        </Link>
        <div className="flex gap-4 items-center font-mono text-sm uppercase tracking-wider">
          <Link 
            to="/problems" 
            className={isActive('/problems') ? 'text-accent' : 'hover:text-accent transition-colors'}
          >
            Challenges
          </Link>
          {isAuthenticated && (
            <Link 
              to="/playground" 
              className={isActive('/playground') ? 'text-accent' : 'hover:text-accent transition-colors'}
            >
              Playground
            </Link>
          )}
          <Link 
            to="/leaderboard" 
            className={isActive('/leaderboard') ? 'text-accent' : 'hover:text-accent transition-colors'}
          >
            Leaderboard
          </Link>
          {isAuthenticated ? (
            <>
              <span className="text-accent">{profile?.username}</span>
              <span className="text-muted-foreground">|</span>
              <span className="text-primary">{profile?.aura || 0} AURA</span>
              <button onClick={logout} className="hover:text-destructive transition-colors">
                Logout
              </button>
            </>
          ) : (
            <Link to="/auth" className="hover:text-accent transition-colors">Login</Link>
          )}
        </div>
      </div>
    </nav>
  );
}
