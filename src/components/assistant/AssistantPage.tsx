
import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { AIMessage, AIConversation } from "@/types";
import { getConversation, saveConversation, getTransactions, getBudget } from "@/utils/localStorage";
import { 
  calculateTotalIncome, 
  calculateTotalExpenses, 
  calculateBalance,
  calculateSpendingByCategory,
  formatCurrency
} from "@/utils/calculations";

export default function AssistantPage() {
  const [conversation, setConversation] = useState<AIConversation>({
    id: "",
    messages: []
  });
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const apiKeyInputRef = useRef<HTMLInputElement>(null);
  const [apiKey, setApiKey] = useState("");
  const [showApiKeyInput, setShowApiKeyInput] = useState(true);
  
  useEffect(() => {
    const savedConversation = getConversation();
    setConversation(savedConversation);
    
    // Check if API key is stored in session storage (temporary solution)
    const storedApiKey = sessionStorage.getItem("gemini_api_key");
    if (storedApiKey) {
      setApiKey(storedApiKey);
      setShowApiKeyInput(false);
    }
  }, []);
  
  useEffect(() => {
    scrollToBottom();
  }, [conversation.messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputMessage.trim()) return;
    
    // Check if API key is set
    if (!apiKey && showApiKeyInput) {
      alert("Please enter your Gemini API Key first");
      apiKeyInputRef.current?.focus();
      return;
    }
    
    // Add user message
    const userMessage: AIMessage = {
      id: Math.random().toString(36).substring(2, 11),
      content: inputMessage,
      sender: "user",
      timestamp: new Date().toISOString()
    };
    
    const updatedMessages = [...conversation.messages, userMessage];
    const updatedConversation = { ...conversation, messages: updatedMessages };
    
    setConversation(updatedConversation);
    saveConversation(updatedConversation);
    setInputMessage("");
    setIsLoading(true);
    
    try {
      // Get financial data for AI context
      const transactions = getTransactions();
      const budget = getBudget();
      
      const totalIncome = calculateTotalIncome(transactions);
      const totalExpenses = calculateTotalExpenses(transactions);
      const balance = calculateBalance(transactions);
      const spendingByCategory = calculateSpendingByCategory(transactions);
      
      // Convert financial data to string context for AI
      const financialContext = `
        User's financial snapshot:
        - Total Income: ${formatCurrency(totalIncome)}
        - Total Expenses: ${formatCurrency(totalExpenses)}
        - Current Balance: ${formatCurrency(balance)}
        - Spending by Category: ${Object.entries(spendingByCategory)
            .map(([category, amount]) => `${category}: ${formatCurrency(amount)}`)
            .join(', ')}
        - Monthly Budget: ${budget.budgets
            .map(b => `${b.category}: ${formatCurrency(b.amount)}`)
            .join(', ')}
      `;
      
      // For demo purposes, generate a mock AI response without actual API call
      let aiResponse = "";
      
      // Simple rule-based responses for demo
      const userQuery = inputMessage.toLowerCase();
      
      if (userQuery.includes("save") && userQuery.includes("more")) {
        aiResponse = `Based on your spending patterns, I see a few opportunities to save more:
        
1. Your ${Object.entries(spendingByCategory)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 2)
          .map(([category]) => category)
          .join(' and ')} expenses are your highest categories. 
   Try reducing these by 10-15% to save ${formatCurrency(
     (spendingByCategory[Object.entries(spendingByCategory)
       .sort(([, a], [, b]) => b - a)[0][0] as keyof typeof spendingByCategory] * 0.1)
   )} - ${formatCurrency(
     (spendingByCategory[Object.entries(spendingByCategory)
       .sort(([, a], [, b]) => b - a)[0][0] as keyof typeof spendingByCategory] * 0.15)
   )} per month.
        
2. Consider using the 50/30/20 rule: 50% for needs, 30% for wants, and 20% for savings.
        
3. Set up automatic transfers to a savings account on payday to build savings consistently.`;
      } 
      else if (userQuery.includes("summarize") && (userQuery.includes("spending") || userQuery.includes("expenses"))) {
        aiResponse = `Here's a summary of your recent spending:
        
Total Expenses: ${formatCurrency(totalExpenses)}
        
Top 3 Categories:
${Object.entries(spendingByCategory)
  .sort(([, a], [, b]) => b - a)
  .slice(0, 3)
  .map(([category, amount], index) => `${index + 1}. ${category}: ${formatCurrency(amount)} (${Math.round((amount / totalExpenses) * 100)}% of total)`)
  .join('\n')}
        
You've spent ${balance >= 0 ? formatCurrency(totalIncome - balance) : 'more than you earned'} this month.

${balance >= 0 
  ? `You have ${formatCurrency(balance)} remaining in your budget.` 
  : `You're currently ${formatCurrency(Math.abs(balance))} over budget.`}`;
      }
      else if (userQuery.includes("suggest") && userQuery.includes("budget")) {
        aiResponse = `Based on your income and spending patterns, here's a suggested budget:
        
Monthly Income: ${formatCurrency(totalIncome)}
        
Recommended Budget Allocation:
${Object.entries(spendingByCategory)
  .map(([category, amount]) => {
    // Adjust budget based on category (simplified logic for demo)
    const adjustment = category === 'Entertainment' || category === 'Shopping' 
      ? 0.9  // Reduce discretionary spending
      : category === 'Income' ? 0 : 1.0;
    const recommendedAmount = amount * adjustment;
    return `- ${category}: ${formatCurrency(recommendedAmount)} (${
      adjustment < 1 ? '10% reduction' : 'maintain current'
    })`;
  })
  .join('\n')}
        
I recommend allocating at least ${formatCurrency(totalIncome * 0.2)} (20% of income) to savings.`;
      }
      else {
        aiResponse = `I'm your Budget Buddy AI assistant, here to help with your financial questions.
        
Based on your current financial situation:
- Your income is ${formatCurrency(totalIncome)}
- Your expenses total ${formatCurrency(totalExpenses)}
- Your current balance is ${formatCurrency(balance)}
        
You can ask me questions like:
- "How can I save more this month?"
- "Summarize my spending in the last few weeks"
- "Suggest a budget based on my spending patterns"
        
What financial goal would you like help with today?`;
      }
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Add AI response
      const aiMessage: AIMessage = {
        id: Math.random().toString(36).substring(2, 11),
        content: aiResponse,
        sender: "assistant",
        timestamp: new Date().toISOString()
      };
      
      const finalMessages = [...updatedMessages, aiMessage];
      const finalConversation = { ...conversation, messages: finalMessages };
      
      setConversation(finalConversation);
      saveConversation(finalConversation);
    } catch (error) {
      console.error("Error generating AI response:", error);
      
      // Add error message
      const errorMessage: AIMessage = {
        id: Math.random().toString(36).substring(2, 11),
        content: "Sorry, I encountered an error processing your request. Please try again later.",
        sender: "assistant",
        timestamp: new Date().toISOString()
      };
      
      const errorMessages = [...updatedMessages, errorMessage];
      const errorConversation = { ...conversation, messages: errorMessages };
      
      setConversation(errorConversation);
      saveConversation(errorConversation);
    } finally {
      setIsLoading(false);
    }
  };
  
  const saveApiKey = () => {
    if (!apiKey.trim()) {
      alert("Please enter a valid API key");
      return;
    }
    
    // Store in session storage (temporary solution)
    sessionStorage.setItem("gemini_api_key", apiKey);
    setShowApiKeyInput(false);
  };
  
  const resetConversation = () => {
    const initialMessage: AIMessage = {
      id: Math.random().toString(36).substring(2, 11),
      content: "Hello! I'm your Budget Buddy assistant. How can I help you with your finances today?",
      sender: "assistant",
      timestamp: new Date().toISOString()
    };
    
    const newConversation: AIConversation = {
      id: Math.random().toString(36).substring(2, 11),
      messages: [initialMessage]
    };
    
    setConversation(newConversation);
    saveConversation(newConversation);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header title="AI Assistant" />
      <main className="flex-1 p-4 lg:p-8 flex flex-col">
        {showApiKeyInput && (
          <Card className="mb-6 animate-fade-in">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="text-lg font-medium">Enter your Gemini API Key</div>
                <p className="text-sm text-muted-foreground">
                  To use the AI assistant, you need to provide a Google Gemini API key. 
                  Get one for free at <a 
                    href="https://aistudio.google.com/app/apikey" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-budget-purple underline"
                  >
                    Google AI Studio
                  </a>.
                </p>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Paste your Gemini API key here"
                    ref={apiKeyInputRef}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={saveApiKey}>Save Key</Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Note: This key is stored in your browser session only and is not sent to our servers.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
        
        <Card className="flex-1 flex flex-col animate-fade-in">
          <CardContent className="flex-1 flex flex-col p-0 gap-0">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="font-semibold">Chat with Budget Buddy</h2>
              <Button variant="outline" size="sm" onClick={resetConversation}>
                New Chat
              </Button>
            </div>
            
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {conversation.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.sender === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.sender === "user"
                          ? "bg-budget-purple text-white"
                          : "bg-muted"
                      }`}
                    >
                      <div className="whitespace-pre-line">{message.content}</div>
                      <div
                        className={`text-xs mt-1 ${
                          message.sender === "user"
                            ? "text-budget-purple-light"
                            : "text-muted-foreground"
                        }`}
                      >
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="max-w-[80%] rounded-lg p-3 bg-muted">
                      <div className="flex space-x-2">
                        <div className="w-2 h-2 rounded-full bg-muted-foreground animate-pulse"></div>
                        <div className="w-2 h-2 rounded-full bg-muted-foreground animate-pulse" style={{ animationDelay: "0.2s" }}></div>
                        <div className="w-2 h-2 rounded-full bg-muted-foreground animate-pulse" style={{ animationDelay: "0.4s" }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
            
            <div className="p-4 border-t">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <Input
                  placeholder="Ask a question about your finances..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  disabled={isLoading || (showApiKeyInput && !apiKey)}
                />
                <Button 
                  type="submit" 
                  disabled={isLoading || !inputMessage.trim() || (showApiKeyInput && !apiKey)}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
