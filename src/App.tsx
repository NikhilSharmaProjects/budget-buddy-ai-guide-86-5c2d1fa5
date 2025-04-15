
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import DashboardPage from "./components/dashboard/DashboardPage";
import TransactionsPage from "./components/transactions/TransactionsPage";
import BudgetPage from "./components/budget/BudgetPage";
import AssistantPage from "./components/assistant/AssistantPage";

const queryClient = new QueryClient();

const App = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // On first render, check if there's a theme in localStorage
  useEffect(() => {
    const theme = localStorage.getItem("budget_buddy_theme") || "light";
    document.documentElement.classList.add(theme);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="flex h-screen">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/transactions" element={<TransactionsPage />} />
                <Route path="/budget" element={<BudgetPage />} />
                <Route path="/assistant" element={<AssistantPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
