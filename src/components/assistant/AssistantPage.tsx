import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Bot, Send, Sparkles, Brain, Trash2, 
  FileText, Upload, Download 
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { AIMessage, AIConversation, Transaction } from "@/types";
import { 
  getConversation, saveConversation, getTransactions, 
  getBudget, saveTransactions 
} from "@/utils/localStorage";
import { 
  calculateTotalIncome, 
  calculateTotalExpenses, 
  calculateBalance,
  calculateSpendingByCategory,
  formatCurrency
} from "@/utils/calculations";
import { useGame } from "@/components/game/GameContext";
import { Progress } from "@/components/ui/progress";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { importTransactionsFromCSV, exportTransactionsToCSV, getAIBudgetTips } from "@/utils/csvHandler";
import { toast } from "@/hooks/use-toast";

// NVIDIA AI API integration
const API_KEY = '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';
const BASE_URL = 'https://integrate.api.nvidia.com/v1';

async function generateAIResponse(userMessage: string, financialContext: any) {
  try {
    const response = await fetch(`${BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
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
        max_tokens: 1024
      }),
    });

    const data = await response.json();
    return data.choices[0]?.message?.content || "Sorry, I couldn't generate a response at this time.";
  } catch (error) {
    console.error("Error generating AI response:", error);
    return "Sorry, I encountered an error processing your request. Please try again later.";
  }
}

export default function AssistantPage() {
  const [conversation, setConversation] = useState<AIConversation>({
    id: "",
    messages: []
  });
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [csvContent, setCsvContent] = useState("");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [previewTransactions, setPreviewTransactions] = useState<Transaction[]>([]);
  const [selectedTab, setSelectedTab] = useState("import");
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { unlockAchievement, addPoints } = useGame();
  
  // Simulate AI understanding with thinking process
  const thinkingMessages = [
    "Analyzing financial data...",
    "Calculating spending patterns...",
    "Identifying budget opportunities...",
    "Applying financial models...",
    "Generating recommendations..."
  ];
  
  useEffect(() => {
    const savedConversation = getConversation();
    const loadedTransactions = getTransactions();
    setTransactions(loadedTransactions);
    
    if (savedConversation.messages.length === 0) {
      // Initialize with a welcome message if conversation is empty
      const initialMessage: AIMessage = {
        id: Math.random().toString(36).substring(2, 11),
        content: `Hello! 👋 I'm your Budget Buddy AI assistant, here to help you reach your financial goals!

I can analyze your spending, suggest budgets, provide savings tips, and answer your financial questions. Try asking me something like:
- "How can I save more money this month?"
- "Analyze my spending patterns"
- "Help me create a budget plan"
- "What are my top expense categories?"

You can also import your transaction data using the Import/Export button above!

What would you like help with today?`,
        sender: "assistant",
        timestamp: new Date().toISOString()
      };
      
      const newConversation: AIConversation = {
        id: Math.random().toString(36).substring(2, 11),
        messages: [initialMessage]
      };
      
      setConversation(newConversation);
      saveConversation(newConversation);
    } else {
      setConversation(savedConversation);
    }

    // Generate AI suggestions
    generateAiSuggestions();
  }, []);
  
  useEffect(() => {
    scrollToBottom();
  }, [conversation.messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    
    // Force scroll to bottom for the ScrollArea component
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  };

  const generateAiSuggestions = () => {
    const transactions = getTransactions();
    const budget = getBudget();
    const totalIncome = calculateTotalIncome(transactions);
    const totalExpenses = calculateTotalExpenses(transactions);
    const balance = calculateBalance(transactions);
    const spendingByCategory = calculateSpendingByCategory(transactions);
    
    // Generate smart suggestions based on financial data
    const suggestions: string[] = [];
    
    // Check if expenses are high relative to income
    if (totalExpenses > totalIncome * 0.8) {
      suggestions.push("How can I reduce my expenses?");
    }
    
    // Identify top spending category
    const topCategory = Object.entries(spendingByCategory)
      .sort(([, a], [, b]) => b - a)[0]?.[0];
      
    if (topCategory) {
      suggestions.push(`How can I spend less on ${topCategory}?`);
    }
    
    // Save more if balance is positive
    if (balance > 0) {
      suggestions.push("What's the best way to invest my savings?");
    }
    
    // General budget question
    suggestions.push("Create a budget plan for me");
    
    // Analyze spending
    suggestions.push("Analyze my spending patterns");
    
    // Show me budget tips
    suggestions.push("Show me budget tips");
    
    setAiSuggestions(suggestions);
  };
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputMessage.trim()) return;
    
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
    
    // Unlock AI assistant achievement if first time using
    if (conversation.messages.length <= 1) {
      unlockAchievement("ai_assistant");
      addPoints(5); // Give points for using the AI
    }
    
    try {
      // Get financial data for AI context
      const transactions = getTransactions();
      const budget = getBudget();
      
      const totalIncome = calculateTotalIncome(transactions);
      const totalExpenses = calculateTotalExpenses(transactions);
      const balance = calculateBalance(transactions);
      const spendingByCategory = calculateSpendingByCategory(transactions);
      
      // Simulate AI "thinking" with progress updates
      setIsThinking(true);
      let thinkingIndex = 0;
      
      const thinkingInterval = setInterval(() => {
        // Add a thinking message
        const thinkingMessage: AIMessage = {
          id: Math.random().toString(36).substring(2, 11),
          content: thinkingMessages[thinkingIndex],
          sender: "thinking",
          timestamp: new Date().toISOString()
        };
        
        setConversation(prev => ({
          ...prev,
          messages: [...prev.messages.filter(m => m.sender !== "thinking"), thinkingMessage]
        }));
        
        thinkingIndex = (thinkingIndex + 1) % thinkingMessages.length;
      }, 1000);
      
      // Create financial context for AI
      const financialContext = {
        totalIncome,
        totalExpenses,
        balance,
        spendingByCategory
      };

      // Generate AI response with NVIDIA API
      const aiResponse = await generateAIResponse(inputMessage, financialContext);
      
      clearInterval(thinkingInterval);
      setIsThinking(false);
      
      // Remove thinking messages
      const messagesWithoutThinking = updatedConversation.messages.filter(m => m.sender !== "thinking");
      
      // Add AI response
      const aiMessage: AIMessage = {
        id: Math.random().toString(36).substring(2, 11),
        content: aiResponse,
        sender: "assistant",
        timestamp: new Date().toISOString()
      };
      
      const finalMessages = [...messagesWithoutThinking, aiMessage];
      const finalConversation = { ...conversation, messages: finalMessages };
      
      setConversation(finalConversation);
      saveConversation(finalConversation);
      
      // Generate new AI suggestions after each conversation
      generateAiSuggestions();
      
      // Add points for using the AI
      addPoints(3);
    } catch (error) {
      console.error("Error generating AI response:", error);
      
      // Add error message
      const errorMessage: AIMessage = {
        id: Math.random().toString(36).substring(2, 11),
        content: "Sorry, I encountered an error processing your request. Please try again later.",
        sender: "assistant",
        timestamp: new Date().toISOString()
      };
      
      const errorMessages = [...updatedMessages.filter(m => m.sender !== "thinking"), errorMessage];
      const errorConversation = { ...conversation, messages: errorMessages };
      
      setConversation(errorConversation);
      saveConversation(errorConversation);
    } finally {
      setIsLoading(false);
    }
  };

  const useSuggestion = (suggestion: string) => {
    setInputMessage(suggestion);
  };
  
  const resetConversation = () => {
    const initialMessage: AIMessage = {
      id: Math.random().toString(36).substring(2, 11),
      content: `Hello! 👋 I'm your Budget Buddy AI assistant, here to help you reach your financial goals!

I can analyze your spending, suggest budgets, provide savings tips, and answer your financial questions. Try asking me something like:
- "How can I save more money this month?"
- "Analyze my spending patterns"
- "Help me create a budget plan"
- "What are my top expense categories?"

What would you like help with today?`,
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setCsvContent(content);
      
      try {
        // Parse CSV for preview
        const importedTransactions = importTransactionsFromCSV(content);
        if (Array.isArray(importedTransactions)) {
          setPreviewTransactions(importedTransactions);
          toast({
            title: "CSV Preview Loaded",
            description: `${importedTransactions.length} transactions found in CSV file.`,
          });
        }
      } catch (error) {
        toast({
          title: "Error Loading CSV",
          description: error instanceof Error ? error.message : "Failed to parse CSV file.",
          variant: "destructive"
        });
      }
    };
    reader.readAsText(file);
  };

  const importCSV = () => {
    try {
      if (!csvContent) {
        toast({
          title: "No CSV Content",
          description: "Please upload a CSV file first.",
          variant: "destructive"
        });
        return;
      }
      
      const importResult = importTransactionsFromCSV(csvContent);
      
      // Fix: Check if importResult is an array of transactions or a number
      if (Array.isArray(importResult)) {
        // If it's an array, use it directly
        setTransactions(importResult);
        saveTransactions(importResult);
        toast({
          title: "Import Successful",
          description: `${importResult.length} transactions imported.`,
        });
        
        // Generate new AI suggestions
        generateAiSuggestions();
        
        // Add points for importing data
        addPoints(5);
        
        // Clear CSV content and preview
        setCsvContent("");
        setPreviewTransactions([]);
      } else if (typeof importResult === 'number') {
        // If it's a number (count of imported transactions), get the updated transactions
        const updatedTransactions = getTransactions();
        setTransactions(updatedTransactions);
        
        toast({
          title: "Import Successful",
          description: `${importResult} new transactions imported.`,
        });
        
        // Generate new AI suggestions
        generateAiSuggestions();
        
        // Add points for importing data
        addPoints(5);
        
        // Clear CSV content and preview
        setCsvContent("");
        setPreviewTransactions([]);
      } else {
        toast({
          title: "No New Transactions",
          description: "All transactions in the CSV already exist in your data.",
        });
      }
    } catch (error) {
      toast({
        title: "Import Failed",
        description: error instanceof Error ? error.message : "Failed to import CSV file.",
        variant: "destructive"
      });
    }
  };

  const exportCSV = () => {
    try {
      const csv = exportTransactionsToCSV();
      
      // Create blob and download link
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `budget_buddy_transactions_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Export Successful",
        description: `${transactions.length} transactions exported to CSV.`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export transactions to CSV.",
        variant: "destructive"
      });
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header title="AI Assistant" />
      <main className="flex-1 p-4 lg:p-8 flex flex-col">
        <Card className="flex-1 flex flex-col animate-fade-in">
          <CardContent className="flex-1 flex flex-col p-0 gap-0">
            <div className="p-4 border-b flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-full bg-budget-purple flex items-center justify-center text-white">
                  <Bot size={18} />
                </div>
                <h2 className="font-semibold">Budget Buddy AI</h2>
              </div>
              <div className="flex gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="group transition-all duration-300"
                    >
                      <FileText className="h-4 w-4 mr-2 group-hover:text-primary transition-colors" />
                      Import/Export
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Import/Export Transactions</DialogTitle>
                    </DialogHeader>
                    <Tabs value={selectedTab} onValueChange={setSelectedTab}>
                      <TabsList className="grid grid-cols-2">
                        <TabsTrigger value="import">Import CSV</TabsTrigger>
                        <TabsTrigger value="export">Export CSV</TabsTrigger>
                      </TabsList>
                      <TabsContent value="import" className="space-y-4">
                        <div className="space-y-4">
                          <div className="flex flex-col gap-2">
                            <Label htmlFor="csvFile">Select CSV File</Label>
                            <div className="flex gap-2">
                              <Input
                                ref={fileInputRef}
                                id="csvFile"
                                type="file"
                                accept=".csv"
                                onChange={handleFileChange}
                                className="hidden"
                              />
                              <Button onClick={triggerFileInput} className="flex-1">
                                <Upload className="h-4 w-4 mr-2" />
                                Choose File
                              </Button>
                              {csvContent && (
                                <Button onClick={() => setCsvContent("")} variant="destructive" size="icon">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                            {csvContent && (
                              <p className="text-sm text-muted-foreground">
                                {previewTransactions.length} transactions found in file
                              </p>
                            )}
                          </div>
                          
                          {previewTransactions.length > 0 && (
                            <div className="border rounded-md overflow-hidden">
                              <div className="max-h-[200px] overflow-y-auto">
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>Date</TableHead>
                                      <TableHead>Description</TableHead>
                                      <TableHead>Amount</TableHead>
                                      <TableHead>Type</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {previewTransactions.slice(0, 5).map((transaction) => (
                                      <TableRow key={transaction.id}>
                                        <TableCell>{transaction.date}</TableCell>
                                        <TableCell className="max-w-[150px] truncate">
                                          {transaction.description}
                                        </TableCell>
                                        <TableCell>{formatCurrency(transaction.amount)}</TableCell>
                                        <TableCell>{transaction.type}</TableCell>
                                      </TableRow>
                                    ))}
                                    {previewTransactions.length > 5 && (
                                      <TableRow>
                                        <TableCell colSpan={4} className="text-center text-muted-foreground text-sm">
                                          +{previewTransactions.length - 5} more transactions
                                        </TableCell>
                                      </TableRow>
                                    )}
                                  </TableBody>
                                </Table>
                              </div>
                            </div>
                          )}
                        </div>
                        <DialogFooter>
                          <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                          </DialogClose>
                          <Button 
                            onClick={importCSV} 
                            disabled={!csvContent}
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            Import Data
                          </Button>
                        </DialogFooter>
                      </TabsContent>
                      <TabsContent value="export" className="space-y-4">
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">
                            Export all your transaction data in CSV format. This file can be imported into 
                            spreadsheet applications or back into Budget Buddy.
                          </p>
                          <p className="text-sm font-medium">
                            Total transactions: {transactions.length}
                          </p>
                        </div>
                        <DialogFooter>
                          <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                          </DialogClose>
                          <Button onClick={exportCSV} disabled={transactions.length === 0}>
                            <Download className="h-4 w-4 mr-2" />
                            Export to CSV
                          </Button>
                        </DialogFooter>
                      </TabsContent>
                    </Tabs>
                  </DialogContent>
                </Dialog>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={resetConversation}
                  className="group transition-all duration-300"
                >
                  <Trash2 className="h-4 w-4 mr-2 group-hover:text-destructive transition-colors" />
                  New Chat
                </Button>
              </div>
            </div>
            
            <div ref={scrollAreaRef} className="flex-1 relative">
              <ScrollArea className="h-[calc(100vh-220px)]">
                <div className="p-4 space-y-4">
                  {conversation.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.sender === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      {message.sender === "thinking" ? (
                        <div className="max-w-[80%] rounded-lg p-3 bg-muted flex items-center animate-pulse">
                          <Brain className="h-4 w-4 mr-2 text-budget-purple" />
                          <div className="text-sm">{message.content}</div>
                        </div>
                      ) : (
                        <div
                          className={`max-w-[80%] rounded-lg p-3 ${
                            message.sender === "user"
                              ? "bg-budget-purple text-white"
                              : "bg-muted"
                          } animate-fade-in shadow-sm`}
                        >
                          <div className="whitespace-pre-line markdown">
                            {message.content.split('# ').map((section, index) => {
                              if (index === 0 && !section.trim()) return null;
                              
                              if (index === 0) {
                                return <p key={index}>{section}</p>;
                              }
                              
                              const [title, ...content] = section.split('\n');
                              return (
                                <div key={index} className="mb-3">
                                  <h3 className={`text-lg font-bold mb-2 ${message.sender === "user" ? "text-white" : "text-foreground"}`}>
                                    {title}
                                  </h3>
                                  <div>
                                    {content.join('\n').split('## ').map((subsection, subIndex) => {
                                      if (subIndex === 0 && !subsection.trim()) return null;
                                      
                                      if (subIndex === 0) {
                                        return <p key={subIndex} dangerouslySetInnerHTML={{ 
                                          __html: subsection
                                            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                            .replace(/\n/g, '<br>') 
                                        }} />;
                                      }
                                      
                                      const [subtitle, ...subcontent] = subsection.split('\n');
                                      return (
                                        <div key={subIndex} className="mb-2 mt-3">
                                          <h4 className={`text-md font-semibold mb-1 ${message.sender === "user" ? "text-white" : "text-foreground"}`}>
                                            {subtitle}
                                          </h4>
                                          <p dangerouslySetInnerHTML={{ 
                                            __html: subcontent.join('\n')
                                              .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                              .replace(/\n/g, '<br>') 
                                          }} />
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          <div
                            className={`text-xs mt-2 ${
                              message.sender === "user"
                                ? "text-budget-purple-light"
                                : "text-muted-foreground"
                            }`}
                          >
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  {isLoading && !isThinking && (
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
            </div>
            
            {/* AI Suggestions */}
            <div className="p-3 border-t border-b bg-muted/50">
              <div className="flex items-center mb-2">
                <Sparkles size={16} className="text-budget-purple mr-2" />
                <span className="text-sm font-medium">AI Suggestions</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {aiSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => useSuggestion(suggestion)}
                    className="px-3 py-1.5 text-xs rounded-full bg-budget-purple-light text-budget-purple-dark hover:bg-budget-purple hover:text-white transition-colors duration-300"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="p-4 border-t">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <Input
                  placeholder="Ask a question about your finances..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button 
                  type="submit" 
                  disabled={isLoading || !inputMessage.trim()}
                  className="group"
                >
                  {isLoading ? 
                    <div className="animate-spin h-4 w-4 border-2 border-budget-purple border-t-transparent rounded-full" /> :
                    <Send className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                  }
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
