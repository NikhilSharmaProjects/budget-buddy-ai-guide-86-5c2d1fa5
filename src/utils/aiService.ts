
import OpenAI from 'openai';

// NVIDIA AI API integration
const API_KEY = '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';
const BASE_URL = 'https://integrate.api.nvidia.com/v1';

// Initialize the OpenAI client with NVIDIA API credentials
const openai = new OpenAI({
  apiKey: API_KEY,
  baseURL: BASE_URL,
});

// Generate AI response for financial assistant
export async function generateAIResponse(userMessage: string, financialContext: any): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      model: "writer/palmyra-fin-70b-32k",
      messages: [
        {
          role: "system",
          content: "You are a financial advisor assistant called Budget Buddy. Provide helpful, concise advice about personal finances. Use bullet points and sections for readability. Be encouraging and positive. Focus on practical, actionable advice."
        },
        {
          role: "user",
          content: `
            Here's my financial data:
            - Total Income: ${financialContext.totalIncome}
            - Total Expenses: ${financialContext.totalExpenses}
            - Current Balance: ${financialContext.balance}
            - Top expenses by category: ${JSON.stringify(financialContext.spendingByCategory)}
            
            My question is: ${userMessage}
          `
        }
      ],
      temperature: 0.2,
      top_p: 0.7,
      max_tokens: 1024,
    });

    return completion.choices[0]?.message?.content || "Sorry, I couldn't generate a response at this time.";
  } catch (error) {
    console.error("Error generating AI response:", error);
    return "Sorry, I encountered an error processing your request. Please try again later.";
  }
}

// Generate budget tips using AI
export async function generateAIBudgetTips(transactions: any[]): Promise<string> {
  try {
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

    // Get AI analysis of spending patterns
    const completion = await openai.chat.completions.create({
      model: "writer/palmyra-fin-70b-32k",
      messages: [
        {
          role: "system",
          content: "You are a financial advisor assistant. Analyze spending patterns and provide budget recommendations in markdown format. Break down your response into titled sections with bullet points. Be concise and actionable."
        },
        {
          role: "user",
          content: `
            Here's my financial data:
            - Total Income: ${totalIncome}
            - Total Expenses: ${totalExpense}
            - Savings Rate: ${totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome * 100).toFixed(1) : 0}%
            - Category Expenses: ${JSON.stringify(categoryExpenses)}
            
            Please provide budget recommendations and savings tips based on my spending pattern. Format your response with markdown headers and bullet points.
          `
        }
      ],
      temperature: 0.2,
      top_p: 0.7,
      max_tokens: 1024,
    });

    return completion.choices[0]?.message?.content || "# Budget Tips\n\nCouldn't generate personalized tips at this time.";
  } catch (error) {
    console.error("Error generating AI budget tips:", error);
    return "# Budget Tips\n\nCouldn't generate personalized tips at this time. Please try again later.";
  }
}
