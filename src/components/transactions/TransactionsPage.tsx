
import { useEffect, useState } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Trash2, Filter, Star, Trophy, TrendingUp, Zap, PiggyBank } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Transaction, TransactionCategory, TransactionType } from "@/types";
import { getTransactions, saveTransactions } from "@/utils/localStorage";
import { formatCurrency } from "@/utils/calculations";
import { toast } from "@/components/ui/sonner";

const categories: TransactionCategory[] = [
  "Housing", 
  "Food", 
  "Transportation", 
  "Entertainment", 
  "Healthcare", 
  "Shopping", 
  "Utilities", 
  "Income", 
  "Other"
];

// Gamification levels and achievements
const levels = [
  { level: 1, threshold: 0, title: "Budget Beginner" },
  { level: 2, threshold: 5, title: "Saving Scout" },
  { level: 3, threshold: 10, title: "Money Manager" },
  { level: 4, threshold: 20, title: "Finance Master" },
  { level: 5, threshold: 30, title: "Budget Guru" }
];

const achievements = [
  { id: "first_transaction", title: "First Transaction", description: "Record your first transaction", icon: <Star className="text-yellow-400" /> },
  { id: "five_transactions", title: "Getting Started", description: "Record 5 transactions", icon: <TrendingUp className="text-green-400" /> },
  { id: "first_income", title: "Income Tracking", description: "Record your first income", icon: <PiggyBank className="text-blue-400" /> },
  { id: "save_money", title: "Money Saver", description: "Keep a positive balance", icon: <Trophy className="text-purple-400" /> }
];

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [userLevel, setUserLevel] = useState(1);
  const [userPoints, setUserPoints] = useState(0);
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>([]);
  const [showAchievement, setShowAchievement] = useState<{id: string, title: string, icon: React.ReactNode} | null>(null);
  const [streakDays, setStreakDays] = useState(0);
  
  // New transaction form state
  const [newTransaction, setNewTransaction] = useState<{
    date: string;
    amount: string;
    description: string;
    category: TransactionCategory;
    type: TransactionType;
  }>({
    date: new Date().toISOString().split('T')[0],
    amount: "",
    description: "",
    category: "Other",
    type: "expense"
  });

  useEffect(() => {
    const loadedTransactions = getTransactions();
    setTransactions(loadedTransactions);
    setFilteredTransactions(loadedTransactions);
    
    // Initialize gamification data
    const savedUserPoints = localStorage.getItem("budget_buddy_points") || "0";
    const savedUserLevel = localStorage.getItem("budget_buddy_level") || "1";
    const savedAchievements = JSON.parse(localStorage.getItem("budget_buddy_achievements") || "[]");
    const savedStreak = localStorage.getItem("budget_buddy_streak") || "0";
    
    setUserPoints(parseInt(savedUserPoints));
    setUserLevel(parseInt(savedUserLevel));
    setUnlockedAchievements(savedAchievements);
    setStreakDays(parseInt(savedStreak));
    
    // Check for daily streak
    const lastLoginDate = localStorage.getItem("budget_buddy_last_login");
    const today = new Date().toDateString();
    
    if (lastLoginDate !== today) {
      localStorage.setItem("budget_buddy_last_login", today);
      
      // If last login was yesterday, increase streak
      if (lastLoginDate) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (lastLoginDate === yesterday.toDateString()) {
          const newStreak = streakDays + 1;
          setStreakDays(newStreak);
          localStorage.setItem("budget_buddy_streak", newStreak.toString());
          
          // Reward for streak
          if (newStreak % 3 === 0) { // Every 3 days
            addPoints(10);
            toast("3 Day Streak! +10 points", {
              description: "You've used Budget Buddy for 3 days in a row!",
              duration: 3000
            });
          }
        }
      }
    }
  }, []);

  useEffect(() => {
    applyFilters();
  }, [transactions, filterCategory, filterType, searchQuery]);

  const applyFilters = () => {
    let filtered = [...transactions];
    
    // Apply category filter
    if (filterCategory !== "all") {
      filtered = filtered.filter(t => t.category === filterCategory);
    }
    
    // Apply type filter
    if (filterType !== "all") {
      filtered = filtered.filter(t => t.type === filterType);
    }
    
    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(t => 
        t.description.toLowerCase().includes(query) || 
        t.category.toLowerCase().includes(query)
      );
    }
    
    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    setFilteredTransactions(filtered);
  };

  const addPoints = (points: number) => {
    const newPoints = userPoints + points;
    setUserPoints(newPoints);
    localStorage.setItem("budget_buddy_points", newPoints.toString());
    
    // Check for level up
    const nextLevel = levels.find(l => l.level > userLevel && newPoints >= l.threshold);
    if (nextLevel) {
      setUserLevel(nextLevel.level);
      localStorage.setItem("budget_buddy_level", nextLevel.level.toString());
      
      toast("Level Up!", {
        description: `You are now a ${nextLevel.title}!`,
        duration: 4000
      });
    }
  };

  const unlockAchievement = (achievementId: string) => {
    if (!unlockedAchievements.includes(achievementId)) {
      const newAchievements = [...unlockedAchievements, achievementId];
      setUnlockedAchievements(newAchievements);
      localStorage.setItem("budget_buddy_achievements", JSON.stringify(newAchievements));
      
      const achievement = achievements.find(a => a.id === achievementId);
      if (achievement) {
        setShowAchievement(achievement);
        addPoints(15); // Points for achievement
        
        toast("Achievement Unlocked!", {
          description: achievement.title,
          duration: 4000
        });
        
        setTimeout(() => setShowAchievement(null), 3000);
      }
    }
  };

  const checkAchievements = (updatedTransactions: Transaction[]) => {
    // First transaction
    if (updatedTransactions.length === 1) {
      unlockAchievement("first_transaction");
    }
    
    // 5 transactions
    if (updatedTransactions.length === 5) {
      unlockAchievement("five_transactions");
    }
    
    // First income
    if (updatedTransactions.some(t => t.type === "income") && 
        !unlockedAchievements.includes("first_income")) {
      unlockAchievement("first_income");
    }
    
    // Positive balance
    const totalIncome = updatedTransactions
      .filter(t => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
      
    const totalExpenses = updatedTransactions
      .filter(t => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
      
    if (totalIncome > totalExpenses && !unlockedAchievements.includes("save_money")) {
      unlockAchievement("save_money");
    }
  };

  const handleAddTransaction = () => {
    if (!newTransaction.amount || !newTransaction.description) {
      toast.error("Please fill in all required fields", {
        description: "Amount and description are required",
        duration: 3000
      });
      return;
    }
    
    const amount = parseFloat(newTransaction.amount);
    
    if (isNaN(amount) || amount <= 0) {
      toast.error("Invalid amount", {
        description: "Please enter a valid positive number",
        duration: 3000
      });
      return;
    }
    
    const newTransactionObj: Transaction = {
      id: Math.random().toString(36).substring(2, 11),
      date: newTransaction.date,
      amount,
      description: newTransaction.description,
      category: newTransaction.category,
      type: newTransaction.type
    };
    
    const updatedTransactions = [...transactions, newTransactionObj];
    setTransactions(updatedTransactions);
    saveTransactions(updatedTransactions);
    
    // Add points and check achievements
    addPoints(5); // Points for adding transaction
    checkAchievements(updatedTransactions);
    
    // Show success message
    toast.success("Transaction added", {
      description: `${newTransaction.type === "income" ? "Income" : "Expense"} of ${formatCurrency(amount)} added successfully`,
      duration: 2000
    });
    
    // Reset form
    setNewTransaction({
      date: new Date().toISOString().split('T')[0],
      amount: "",
      description: "",
      category: "Other",
      type: "expense"
    });
    
    setIsDialogOpen(false);
  };

  const handleDeleteTransaction = (id: string) => {
    const updatedTransactions = transactions.filter(t => t.id !== id);
    setTransactions(updatedTransactions);
    saveTransactions(updatedTransactions);
    
    toast("Transaction deleted", {
      description: "Transaction has been permanently removed",
      duration: 2000
    });
  };

  const resetFilters = () => {
    setFilterCategory("all");
    setFilterType("all");
    setSearchQuery("");
    
    toast("Filters reset", {
      description: "Viewing all transactions",
      duration: 1500
    });
  };

  // Get budget suggestions based on spending
  const getBudgetSuggestion = () => {
    const categories = transactions
      .filter(t => t.type === "expense")
      .reduce((acc, transaction) => {
        const category = transaction.category;
        if (!acc[category]) {
          acc[category] = 0;
        }
        acc[category] += transaction.amount;
        return acc;
      }, {} as Record<string, number>);
    
    const highestCategory = Object.keys(categories).sort((a, b) => categories[b] - categories[a])[0];
    
    if (highestCategory) {
      toast("Budget Tip", {
        description: `You spend most on ${highestCategory}. Consider setting a budget for this category.`,
        duration: 5000
      });
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background overflow-hidden">
      <Header title="Transactions" />
      
      {/* Gamification Status Bar */}
      <div className="px-4 py-2 bg-budget-purple-light dark:bg-gradient-to-r dark:from-budget-purple-dark/40 dark:to-budget-purple/40 animate-fade-in">
        <div className="container mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="level-badge w-10 h-10 text-lg">
              {userLevel}
            </div>
            <div>
              <p className="text-sm font-medium">{levels.find(l => l.level === userLevel)?.title}</p>
              <p className="text-xs text-muted-foreground">Level {userLevel} • {userPoints} points</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex space-x-1">
              {achievements.slice(0, 4).map((achievement, index) => (
                <div 
                  key={achievement.id}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                    unlockedAchievements.includes(achievement.id) 
                      ? 'bg-budget-purple text-white' 
                      : 'bg-muted text-muted-foreground'
                  }`}
                  title={achievement.title}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {unlockedAchievements.includes(achievement.id) ? (
                    <Star className="h-4 w-4" />
                  ) : (
                    <span className="text-xs">?</span>
                  )}
                </div>
              ))}
            </div>
            
            <div className="text-sm">
              <span className="font-medium">{streakDays}</span> day streak{streakDays > 0 ? '! 🔥' : ''}
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs h-8" 
              onClick={getBudgetSuggestion}
            >
              <Zap className="h-3 w-3 mr-1 text-budget-purple" />
              Budget Tip
            </Button>
          </div>
        </div>
      </div>
      
      <main className="flex-1 p-4 lg:p-8 overflow-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4 animate-slide-in">
          <div className="flex flex-col md:flex-row gap-4 w-full">
            <div className="flex-1">
              <Input
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full transition-all duration-300 border-budget-purple/30 focus:border-budget-purple focus:ring-budget-purple"
              />
            </div>
            <div className="flex gap-4">
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-[160px] bg-white dark:bg-card transition-all duration-300 hover:border-budget-purple">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-card">
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[160px] bg-white dark:bg-card transition-all duration-300 hover:border-budget-purple">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-card">
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={resetFilters} className="transition-all duration-300">
                <Filter className="mr-2 h-4 w-4" />
                Reset
              </Button>
            </div>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="game-button">
                <Plus className="mr-2 h-4 w-4" />
                Add Transaction
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white dark:bg-card border-budget-purple/20 animate-scale-in">
              <DialogHeader>
                <DialogTitle>Add New Transaction</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="transaction-date" className="text-right">
                    Date
                  </Label>
                  <Input
                    id="transaction-date"
                    type="date"
                    value={newTransaction.date}
                    onChange={(e) => setNewTransaction({...newTransaction, date: e.target.value})}
                    className="col-span-3 focus:border-budget-purple focus:ring-budget-purple"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="transaction-type" className="text-right">
                    Type
                  </Label>
                  <Select 
                    value={newTransaction.type}
                    onValueChange={(value) => setNewTransaction({
                      ...newTransaction, 
                      type: value as TransactionType,
                      // Automatically set Income category for income transactions
                      category: value === 'income' ? 'Income' : newTransaction.category
                    })}
                  >
                    <SelectTrigger id="transaction-type" className="col-span-3">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="income">Income</SelectItem>
                      <SelectItem value="expense">Expense</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="transaction-amount" className="text-right">
                    Amount
                  </Label>
                  <Input
                    id="transaction-amount"
                    type="number"
                    placeholder="0.00"
                    min="0.01"
                    step="0.01"
                    value={newTransaction.amount}
                    onChange={(e) => setNewTransaction({...newTransaction, amount: e.target.value})}
                    className="col-span-3 focus:border-budget-purple focus:ring-budget-purple"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="transaction-description" className="text-right">
                    Description
                  </Label>
                  <Input
                    id="transaction-description"
                    placeholder="Transaction description"
                    value={newTransaction.description}
                    onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})}
                    className="col-span-3 focus:border-budget-purple focus:ring-budget-purple"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="transaction-category" className="text-right">
                    Category
                  </Label>
                  <Select 
                    value={newTransaction.category}
                    onValueChange={(value) => setNewTransaction({
                      ...newTransaction, 
                      category: value as TransactionCategory
                    })}
                  >
                    <SelectTrigger 
                      id="transaction-category" 
                      className="col-span-3"
                      disabled={newTransaction.type === 'income'}
                    >
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem 
                          key={category} 
                          value={category}
                          disabled={newTransaction.type === 'income' && category !== 'Income'}
                        >
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddTransaction} className="game-button">
                  Add Transaction
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="rounded-md border shadow-sm bg-white dark:bg-card transition-all duration-300 hover:shadow-md animate-fade-in">
          <ScrollArea className="h-[calc(100vh-280px)] rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map((transaction, index) => (
                    <TableRow 
                      key={transaction.id} 
                      className="transaction-row" 
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <TableCell>
                        {new Date(transaction.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="capitalize">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          transaction.type === "income" 
                            ? "bg-budget-green/20 text-budget-green" 
                            : "bg-budget-red/20 text-budget-red"
                        }`}>
                          {transaction.type}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center">
                          <span 
                            className="w-2 h-2 rounded-full mr-2" 
                            style={{ 
                              backgroundColor: transaction.category === 'Income' 
                                ? '#4ade80' // green for income
                                : ['#9b87f5', '#60a5fa', '#fb923c', '#facc15', '#f87171'][
                                    categories.indexOf(transaction.category) % 5
                                  ] // cycle through colors for expense categories
                            }}
                          />
                          {transaction.category}
                        </span>
                      </TableCell>
                      <TableCell>{transaction.description}</TableCell>
                      <TableCell className={`text-right font-medium ${
                        transaction.type === "income" ? "text-budget-green" : "text-budget-red"
                      }`}>
                        {transaction.type === "income" ? "+" : "-"}
                        {formatCurrency(transaction.amount)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteTransaction(transaction.id)}
                          className="hover:bg-red-100 hover:text-red-500 dark:hover:bg-red-900/30"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6">
                      <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                        <PiggyBank className="h-16 w-16 mb-4 text-muted" />
                        <p>No transactions found.</p>
                        <p className="text-sm">Click "Add Transaction" to get started!</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </div>
      </main>
      
      {/* Achievement notification popup */}
      {showAchievement && (
        <div className="achievement-notification">
          <div className="p-2 bg-white/10 rounded-full">
            {showAchievement.icon}
          </div>
          <div>
            <div className="font-bold">Achievement Unlocked!</div>
            <div className="text-sm">{showAchievement.title}</div>
          </div>
        </div>
      )}
    </div>
  );
}
