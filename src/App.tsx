import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Problems from "./pages/Problems";
import Problem from "./pages/Problem";
import Leaderboard from "./pages/Leaderboard";
import Playground from "./pages/Playground";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// App component with AuthProvider wrapping all routes
const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/problems" element={<Problems />} />
            <Route path="/problems/:slug" element={<Problem />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/playground" element={<Playground />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
