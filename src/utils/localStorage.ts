
import { Transaction, MonthlyBudget, AIConversation } from "@/types";
import { dummyTransactions, dummyBudget, dummyConversation } from "./dummyData";

// Keys for localStorage
const TRANSACTIONS_KEY = "budget_buddy_transactions";
const BUDGET_KEY = "budget_buddy_budget";
const CONVERSATION_KEY = "budget_buddy_conversation";
const THEME_KEY = "budget_buddy_theme";

// Get transactions from localStorage or use dummy data
export const getTransactions = (): Transaction[] => {
  const storedTransactions = localStorage.getItem(TRANSACTIONS_KEY);
  
  if (storedTransactions) {
    return JSON.parse(storedTransactions);
  }
  
  // Initialize with dummy data
  saveTransactions(dummyTransactions);
  return dummyTransactions;
};

// Save transactions to localStorage
export const saveTransactions = (transactions: Transaction[]): void => {
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
};

// Get budget from localStorage or use dummy data
export const getBudget = (): MonthlyBudget => {
  const storedBudget = localStorage.getItem(BUDGET_KEY);
  
  if (storedBudget) {
    return JSON.parse(storedBudget);
  }
  
  // Initialize with dummy data
  saveBudget(dummyBudget);
  return dummyBudget;
};

// Save budget to localStorage
export const saveBudget = (budget: MonthlyBudget): void => {
  localStorage.setItem(BUDGET_KEY, JSON.stringify(budget));
};

// Get conversation from localStorage or use dummy data
export const getConversation = (): AIConversation => {
  const storedConversation = localStorage.getItem(CONVERSATION_KEY);
  
  if (storedConversation) {
    return JSON.parse(storedConversation);
  }
  
  // Initialize with dummy data
  saveConversation(dummyConversation);
  return dummyConversation;
};

// Save conversation to localStorage
export const saveConversation = (conversation: AIConversation): void => {
  localStorage.setItem(CONVERSATION_KEY, JSON.stringify(conversation));
};

// Get theme from localStorage
export const getTheme = (): string => {
  return localStorage.getItem(THEME_KEY) || "light";
};

// Save theme to localStorage
export const saveTheme = (theme: string): void => {
  localStorage.setItem(THEME_KEY, theme);
};
