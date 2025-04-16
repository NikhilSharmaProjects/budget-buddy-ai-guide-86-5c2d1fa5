
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState, createContext } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import DashboardPage from "./components/dashboard/DashboardPage";
import TransactionsPage from "./components/transactions/TransactionsPage";
import BudgetPage from "./components/budget/BudgetPage";
import AssistantPage from "./components/assistant/AssistantPage";
import LoginPage from "./components/auth/LoginPage";
import SignupPage from "./components/auth/SignupPage";
import { toast } from "@/components/ui/sonner";
import { GameProvider } from "./components/game/GameContext";

const queryClient = new QueryClient();

// Create an auth context
export const AuthContext = createContext<{
  isAuthenticated: boolean;
  login: (email: string, password: string) => void;
  signup: (email: string, password: string) => void;
  logout: () => void;
}>({
  isAuthenticated: false,
  login: () => {},
  signup: () => {},
  logout: () => {}
});

const App = () => {
  const [mounted, setMounted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check if user is logged in from localStorage
    const user = localStorage.getItem("budget_buddy_user");
    if (user) {
      setIsAuthenticated(true);
    }
  }, []);

  // On first render, check if there's a theme in localStorage
  useEffect(() => {
    const theme = localStorage.getItem("budget_buddy_theme") || "light";
    document.documentElement.classList.add(theme);
  }, []);

  const login = (email: string, password: string) => {
    // Simple authentication for demo purposes
    if (email && password) {
      localStorage.setItem("budget_buddy_user", JSON.stringify({ email }));
      setIsAuthenticated(true);
      toast.success("Welcome back!", {
        description: "You have successfully logged in to Budget Buddy",
      });
    }
  };

  const signup = (email: string, password: string) => {
    // Simple registration for demo purposes
    if (email && password) {
      localStorage.setItem("budget_buddy_user", JSON.stringify({ email }));
      setIsAuthenticated(true);
      toast.success("Account created!", {
        description: "Welcome to Budget Buddy! Let's start your financial journey.",
      });
    }
  };

  const logout = () => {
    localStorage.removeItem("budget_buddy_user");
    setIsAuthenticated(false);
    toast.info("Logged out", {
      description: "You have been successfully logged out.",
    });
  };

  if (!mounted) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={{ isAuthenticated, login, signup, logout }}>
        <GameProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <div className="flex h-screen">
                {isAuthenticated && <Sidebar />}
                <div className="flex-1 flex flex-col overflow-hidden">
                  <Routes>
                    {/* Public routes */}
                    <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/dashboard" />} />
                    <Route path="/signup" element={!isAuthenticated ? <SignupPage /> : <Navigate to="/dashboard" />} />
                    
                    {/* Protected routes */}
                    <Route path="/" element={isAuthenticated ? <Index /> : <Navigate to="/login" />} />
                    <Route path="/dashboard" element={isAuthenticated ? <DashboardPage /> : <Navigate to="/login" />} />
                    <Route path="/transactions" element={isAuthenticated ? <TransactionsPage /> : <Navigate to="/login" />} />
                    <Route path="/budget" element={isAuthenticated ? <BudgetPage /> : <Navigate to="/login" />} />
                    <Route path="/assistant" element={isAuthenticated ? <AssistantPage /> : <Navigate to="/login" />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </div>
              </div>
            </BrowserRouter>
          </TooltipProvider>
        </GameProvider>
      </AuthContext.Provider>
    </QueryClientProvider>
  );
};

export default App;
