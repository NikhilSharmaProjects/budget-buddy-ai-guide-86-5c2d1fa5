
export type TransactionCategory = 
  | "Housing" 
  | "Food" 
  | "Transportation" 
  | "Entertainment" 
  | "Healthcare" 
  | "Shopping" 
  | "Utilities" 
  | "Income" 
  | "Other";

export type TransactionType = "expense" | "income";

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  description: string;
  category: TransactionCategory;
  type: TransactionType;
}

export interface Budget {
  category: TransactionCategory;
  amount: number;
}

export interface MonthlyBudget {
  month: string; // Format: "YYYY-MM"
  budgets: Budget[];
}

export interface AIMessage {
  id: string;
  content: string;
  sender: "user" | "assistant" | "thinking";
  timestamp: string;
}

export interface AIConversation {
  id: string;
  messages: AIMessage[];
}

export interface ChartData {
  name: string;
  value: number;
  color?: string;
}
