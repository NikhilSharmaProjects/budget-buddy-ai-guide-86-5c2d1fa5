
import { Transaction, Budget, MonthlyBudget, AIConversation } from "@/types";

// Current month for default data
const currentDate = new Date();
const currentMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;

// Generate a random ID
const generateId = () => Math.random().toString(36).substring(2, 11);

// Sample transactions for the current month
export const dummyTransactions: Transaction[] = [
  {
    id: generateId(),
    date: `${currentMonth}-01`,
    amount: 2500,
    description: "Monthly Salary",
    category: "Income",
    type: "income"
  },
  {
    id: generateId(),
    date: `${currentMonth}-02`,
    amount: 1000,
    description: "Rent Payment",
    category: "Housing",
    type: "expense"
  },
  {
    id: generateId(),
    date: `${currentMonth}-03`,
    amount: 200,
    description: "Grocery Shopping",
    category: "Food",
    type: "expense"
  },
  {
    id: generateId(),
    date: `${currentMonth}-05`,
    amount: 50,
    description: "Gas",
    category: "Transportation",
    type: "expense"
  },
  {
    id: generateId(),
    date: `${currentMonth}-07`,
    amount: 80,
    description: "Dinner with friends",
    category: "Food",
    type: "expense"
  },
  {
    id: generateId(),
    date: `${currentMonth}-09`,
    amount: 120,
    description: "Electric Bill",
    category: "Utilities",
    type: "expense"
  },
  {
    id: generateId(),
    date: `${currentMonth}-11`,
    amount: 60,
    description: "Movie Night",
    category: "Entertainment",
    type: "expense"
  },
  {
    id: generateId(),
    date: `${currentMonth}-14`,
    amount: 150,
    description: "New Shoes",
    category: "Shopping",
    type: "expense"
  },
  {
    id: generateId(),
    date: `${currentMonth}-15`,
    amount: 500,
    description: "Freelance Work",
    category: "Income",
    type: "income"
  },
  {
    id: generateId(),
    date: `${currentMonth}-18`,
    amount: 45,
    description: "Pharmacy",
    category: "Healthcare",
    type: "expense"
  },
  {
    id: generateId(),
    date: `${currentMonth}-21`,
    amount: 35,
    description: "Internet Bill",
    category: "Utilities",
    type: "expense"
  },
  {
    id: generateId(),
    date: `${currentMonth}-25`,
    amount: 70,
    description: "Birthday Gift",
    category: "Shopping",
    type: "expense"
  },
  {
    id: generateId(),
    date: `${currentMonth}-28`,
    amount: 25,
    description: "Mobile Recharge",
    category: "Utilities",
    type: "expense"
  }
];

// Sample budget data
export const dummyBudget: MonthlyBudget = {
  month: currentMonth,
  budgets: [
    { category: "Housing", amount: 1200 },
    { category: "Food", amount: 400 },
    { category: "Transportation", amount: 150 },
    { category: "Entertainment", amount: 100 },
    { category: "Healthcare", amount: 100 },
    { category: "Shopping", amount: 200 },
    { category: "Utilities", amount: 200 },
    { category: "Other", amount: 150 }
  ]
};

// Sample AI conversation
export const dummyConversation: AIConversation = {
  id: generateId(),
  messages: [
    {
      id: generateId(),
      content: "Hello! I'm your Budget Buddy assistant. How can I help you with your finances today?",
      sender: "assistant",
      timestamp: new Date().toISOString()
    }
  ]
};

// Category colors for charts
export const categoryColors: Record<string, string> = {
  Housing: "#9b87f5",      // Purple
  Food: "#60a5fa",         // Blue
  Transportation: "#fb923c", // Orange
  Entertainment: "#facc15", // Yellow
  Healthcare: "#4ade80",    // Green
  Shopping: "#f87171",      // Red
  Utilities: "#38bdf8",     // Light Blue
  Income: "#4ade80",        // Green
  Other: "#94a3b8"          // Gray
};
