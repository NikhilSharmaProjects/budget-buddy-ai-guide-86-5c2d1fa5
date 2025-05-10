
import { Transaction, TransactionCategory, TransactionType } from "@/types";
import { saveTransactions, getTransactions } from "./localStorage";
import { toast } from "@/hooks/use-toast";

// Function to parse CSV data into Transaction objects
export const parseCSV = (csvContent: string): Transaction[] => {
  try {
    // Split into lines and remove any empty lines
    const lines = csvContent.split('\n').filter(line => line.trim() !== '');
    
    // Extract header and data rows
    const headers = lines[0].split(',').map(header => header.trim());
    const dataRows = lines.slice(1);
    
    // Validate required columns
    const requiredColumns = ['date', 'amount', 'description', 'category', 'type'];
    const hasRequiredColumns = requiredColumns.every(col => 
      headers.some(header => header.toLowerCase() === col.toLowerCase())
    );
    
    if (!hasRequiredColumns) {
      throw new Error("CSV file is missing required columns. Required: date, amount, description, category, type");
    }

    // Map indices for each required column
    const dateIndex = headers.findIndex(h => h.toLowerCase() === 'date');
    const amountIndex = headers.findIndex(h => h.toLowerCase() === 'amount');
    const descriptionIndex = headers.findIndex(h => h.toLowerCase() === 'description');
    const categoryIndex = headers.findIndex(h => h.toLowerCase() === 'category');
    const typeIndex = headers.findIndex(h => h.toLowerCase() === 'type');

    // Parse each data row into a Transaction object
    return dataRows.map((row, index) => {
      const values = row.split(',').map(val => val.trim());
      
      // Skip rows with incorrect number of values
      if (values.length !== headers.length) {
        console.warn(`Skipping row ${index + 2} due to incorrect format`);
        return null;
      }
      
      // Parse amount as a number
      const amount = parseFloat(values[amountIndex]);
      
      // Validate the category is in our allowed categories
      let category = values[categoryIndex] as TransactionCategory;
      if (!isValidCategory(category)) {
        category = "Other";
      }
      
      // Validate the type is either expense or income
      let type = values[typeIndex].toLowerCase() as TransactionType;
      if (type !== "expense" && type !== "income") {
        type = amount >= 0 ? "income" : "expense";
      }

      return {
        id: Math.random().toString(36).substring(2, 11),
        date: values[dateIndex],
        amount: Math.abs(amount), // Store amount as positive
        description: values[descriptionIndex],
        category: category,
        type: type
      };
    }).filter((t): t is Transaction => t !== null);
  } catch (error) {
    console.error("Error parsing CSV:", error);
    throw new Error("Failed to parse CSV file. Please check the format and try again.");
  }
};

// Function to convert Transaction array to CSV string
export const generateCSV = (transactions: Transaction[]): string => {
  // Define CSV headers
  const headers = ['date', 'amount', 'description', 'category', 'type'];
  
  // Create CSV header row
  let csv = headers.join(',') + '\n';
  
  // Add transaction data rows
  transactions.forEach(transaction => {
    const row = [
      transaction.date,
      transaction.amount.toString(),
      // Escape description if it contains commas
      transaction.description.includes(',') 
        ? `"${transaction.description}"`
        : transaction.description,
      transaction.category,
      transaction.type
    ];
    csv += row.join(',') + '\n';
  });
  
  return csv;
};

// Function to import transactions from CSV
export const importTransactionsFromCSV = (csvContent: string): Transaction[] | number => {
  try {
    // Check if this is a preview request
    const isPreview = csvContent.includes('preview');
    // Remove the preview flag if present
    const cleanContent = isPreview ? csvContent.replace('preview', '') : csvContent;
    
    // Parse CSV content
    const importedTransactions = parseCSV(cleanContent);
    
    if (importedTransactions.length === 0) {
      throw new Error("No valid transactions found in the CSV file.");
    }
    
    // For preview, just return the transactions without saving
    if (isPreview) {
      return importedTransactions;
    }
    
    // Get existing transactions
    const existingTransactions = getTransactions();
    
    // Merge transactions (avoiding duplicates based on description and date)
    const combinedTransactions = [...existingTransactions];
    
    let newTransactionsCount = 0;
    
    importedTransactions.forEach(importedTx => {
      // Check if the transaction might be a duplicate
      const isDuplicate = existingTransactions.some(existingTx => 
        existingTx.date === importedTx.date && 
        existingTx.description === importedTx.description &&
        existingTx.amount === importedTx.amount
      );
      
      if (!isDuplicate) {
        combinedTransactions.push(importedTx);
        newTransactionsCount++;
      }
    });
    
    // If no new transactions were added, return the count (0)
    if (newTransactionsCount === 0) {
      return 0;
    }
    
    // Save the updated transactions
    saveTransactions(combinedTransactions);
    
    // Return the count of new transactions added
    return newTransactionsCount;
  } catch (error) {
    console.error("Error importing transactions:", error);
    throw error;
  }
};

// Function to download transactions as CSV
export const exportTransactionsToCSV = (): string => {
  const transactions = getTransactions();
  return generateCSV(transactions);
};

// Helper function to validate transaction category
const isValidCategory = (category: string): category is TransactionCategory => {
  const validCategories: TransactionCategory[] = [
    "Housing", "Food", "Transportation", "Entertainment", 
    "Healthcare", "Shopping", "Utilities", "Income", "Other"
  ];
  return validCategories.includes(category as TransactionCategory);
};

// Function to get AI budget tips based on spending patterns
export const getAIBudgetTips = (transactions: Transaction[]): string => {
  // Calculate total expenses by category
  const categoryExpenses: Record<string, number> = {};
  let totalExpense = 0;
  let totalIncome = 0;

  transactions.forEach(transaction => {
    if (transaction.type === "expense") {
      categoryExpenses[transaction.category] = (categoryExpenses[transaction.category] || 0) + transaction.amount;
      totalExpense += transaction.amount;
    } else {
      totalIncome += transaction.amount;
    }
  });

  // Sort categories by expense amount
  const sortedCategories = Object.entries(categoryExpenses)
    .sort(([, a], [, b]) => b - a);

  // Generate tips based on spending patterns
  let tips = "# 💰 Smart Budget Recommendations\n\n";

  // Overall budget health
  const savingsRate = (totalIncome - totalExpense) / totalIncome;
  
  if (savingsRate < 0) {
    tips += "## 🚨 Spending Alert\n";
    tips += "You're spending more than you earn. Consider reducing expenses immediately.\n\n";
  } else if (savingsRate < 0.1) {
    tips += "## ⚠️ Low Savings Rate\n";
    tips += "Your savings rate is below 10%. Financial experts recommend saving at least 20% of income.\n\n";
  } else if (savingsRate >= 0.2) {
    tips += "## 🌟 Great Savings Rate\n";
    tips += `You're saving ${(savingsRate * 100).toFixed(0)}% of your income. Keep up the good work!\n\n`;
  }

  // Category-specific recommendations
  tips += "## 📊 Category Recommendations\n\n";

  // Get top 3 expense categories
  const topCategories = sortedCategories.slice(0, 3);
  
  topCategories.forEach(([category, amount]) => {
    const percentage = (amount / totalExpense * 100).toFixed(0);
    
    tips += `### ${category} (${percentage}% of expenses)\n`;
    
    // Category-specific advice
    switch(category) {
      case "Housing":
        tips += "- Housing should ideally be under 30% of income\n";
        tips += "- Consider negotiating rent or refinancing mortgage\n";
        tips += "- Evaluate if downsizing could benefit your finances\n\n";
        break;
      case "Food":
        tips += "- Try meal planning to reduce grocery costs\n";
        tips += "- Limit dining out to special occasions\n";
        tips += "- Consider bulk purchases for non-perishables\n\n";
        break;
      case "Transportation":
        tips += "- Evaluate if public transport could replace car usage\n";
        tips += "- Consider carpooling to reduce fuel costs\n";
        tips += "- Look into fuel rewards programs\n\n";
        break;
      case "Entertainment":
        tips += "- Look for free or low-cost entertainment options\n";
        tips += "- Review subscription services - keep only what you use regularly\n";
        tips += "- Set a monthly entertainment budget and stick to it\n\n";
        break;
      case "Shopping":
        tips += "- Implement a 24-hour rule before non-essential purchases\n";
        tips += "- Look for sales and use cashback apps\n";
        tips += "- Consider quality over quantity for lasting value\n\n";
        break;
      default:
        tips += "- Analyze if expenses in this category align with your priorities\n";
        tips += "- Look for ways to reduce costs without sacrificing quality\n";
        tips += "- Track this category closely for the next month\n\n";
    }
  });

  // General advice
  tips += "## 💡 Smart Money Moves\n\n";
  tips += "1. **Emergency Fund**: Aim to save 3-6 months of expenses\n";
  tips += "2. **Debt Reduction**: Prioritize high-interest debt\n";
  tips += "3. **Automate Savings**: Set up automatic transfers on payday\n";
  tips += "4. **Review Regularly**: Check your budget monthly to stay on track\n";

  return tips;
};
