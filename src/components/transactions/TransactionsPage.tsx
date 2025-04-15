
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
import { Plus, Trash2, Filter } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Transaction, TransactionCategory, TransactionType } from "@/types";
import { getTransactions, saveTransactions } from "@/utils/localStorage";
import { formatCurrency } from "@/utils/calculations";

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

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  
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

  const handleAddTransaction = () => {
    if (!newTransaction.amount || !newTransaction.description) {
      return; // Basic validation
    }
    
    const amount = parseFloat(newTransaction.amount);
    
    if (isNaN(amount) || amount <= 0) {
      return; // Validate amount
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
  };

  const resetFilters = () => {
    setFilterCategory("all");
    setFilterType("all");
    setSearchQuery("");
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header title="Transactions" />
      <main className="flex-1 p-4 lg:p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
          <div className="flex flex-col md:flex-row gap-4 w-full">
            <div className="flex-1">
              <Input
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex gap-4">
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={resetFilters}>
                <Filter className="mr-2 h-4 w-4" />
                Reset
              </Button>
            </div>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Transaction
              </Button>
            </DialogTrigger>
            <DialogContent>
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
                    className="col-span-3"
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
                    className="col-span-3"
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
                    className="col-span-3"
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
                <Button onClick={handleAddTransaction}>
                  Add Transaction
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="rounded-md border">
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
                filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      {new Date(transaction.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="capitalize">
                      {transaction.type}
                    </TableCell>
                    <TableCell>{transaction.category}</TableCell>
                    <TableCell>{transaction.description}</TableCell>
                    <TableCell className={`text-right ${
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
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6">
                    No transactions found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </main>
    </div>
  );
}
