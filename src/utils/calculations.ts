
import { Transaction, Budget, ChartData, TransactionCategory } from "@/types";
import { categoryColors } from "./dummyData";

// Calculate total income
export const calculateTotalIncome = (transactions: Transaction[]): number => {
  return transactions
    .filter(transaction => transaction.type === "income")
    .reduce((sum, transaction) => sum + transaction.amount, 0);
};

// Calculate total expenses
export const calculateTotalExpenses = (transactions: Transaction[]): number => {
  return transactions
    .filter(transaction => transaction.type === "expense")
    .reduce((sum, transaction) => sum + transaction.amount, 0);
};

// Calculate current balance
export const calculateBalance = (transactions: Transaction[]): number => {
  return calculateTotalIncome(transactions) - calculateTotalExpenses(transactions);
};

// Calculate spending by category
export const calculateSpendingByCategory = (transactions: Transaction[]): Record<TransactionCategory, number> => {
  const spendingByCategory: Partial<Record<TransactionCategory, number>> = {};
  
  transactions
    .filter(transaction => transaction.type === "expense")
    .forEach(transaction => {
      const { category, amount } = transaction;
      spendingByCategory[category] = (spendingByCategory[category] || 0) + amount;
    });
    
  return spendingByCategory as Record<TransactionCategory, number>;
};

// Format spending by category for charts
export const formatCategoryDataForChart = (transactions: Transaction[]): ChartData[] => {
  const spendingByCategory = calculateSpendingByCategory(transactions);
  
  return Object.entries(spendingByCategory)
    .map(([category, value]) => ({
      name: category,
      value,
      color: categoryColors[category] || "#94a3b8"
    }))
    .sort((a, b) => b.value - a.value);
};

// Calculate budget vs. actual spending
export const calculateBudgetVsActual = (
  transactions: Transaction[],
  budgets: Budget[]
): { category: string; budgeted: number; spent: number; remaining: number }[] => {
  const spendingByCategory = calculateSpendingByCategory(transactions);
  
  return budgets.map(budget => {
    const spent = spendingByCategory[budget.category] || 0;
    return {
      category: budget.category,
      budgeted: budget.amount,
      spent,
      remaining: budget.amount - spent
    };
  });
};

// Format currency
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(amount);
};

// Format percentage
export const formatPercentage = (value: number, total: number): string => {
  if (total === 0) return "0%";
  return `${Math.round((value / total) * 100)}%`;
};

// Format date
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date);
};
