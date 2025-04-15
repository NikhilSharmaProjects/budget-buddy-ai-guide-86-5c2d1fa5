
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Header } from "@/components/layout/Header";
import { 
  calculateBudgetVsActual, 
  formatCurrency, 
  formatPercentage 
} from "@/utils/calculations";
import { Transaction, Budget, MonthlyBudget, TransactionCategory } from "@/types";
import { getBudget, getTransactions, saveBudget } from "@/utils/localStorage";
import { categoryColors } from "@/utils/dummyData";
import { PencilIcon, CheckIcon, XIcon } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";

export default function BudgetPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [monthlyBudget, setMonthlyBudget] = useState<MonthlyBudget>({
    month: "",
    budgets: []
  });
  const [budgetVsActual, setBudgetVsActual] = useState<any[]>([]);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  
  useEffect(() => {
    const loadedTransactions = getTransactions();
    const loadedBudget = getBudget();
    
    setTransactions(loadedTransactions);
    setMonthlyBudget(loadedBudget);
    
    // Calculate budget vs actual
    const calculatedData = calculateBudgetVsActual(
      loadedTransactions,
      loadedBudget.budgets
    );
    
    setBudgetVsActual(calculatedData);
  }, []);

  const startEditing = (category: string, amount: number) => {
    setEditingCategory(category);
    setEditValue(amount.toString());
  };

  const cancelEditing = () => {
    setEditingCategory(null);
    setEditValue("");
  };

  const saveEdit = (category: TransactionCategory) => {
    const newAmount = parseFloat(editValue);
    
    if (isNaN(newAmount) || newAmount < 0) {
      cancelEditing();
      return;
    }
    
    const updatedBudgets = monthlyBudget.budgets.map(budget => 
      budget.category === category 
        ? { ...budget, amount: newAmount } 
        : budget
    );
    
    const updatedMonthlyBudget = {
      ...monthlyBudget,
      budgets: updatedBudgets
    };
    
    setMonthlyBudget(updatedMonthlyBudget);
    saveBudget(updatedMonthlyBudget);
    
    // Recalculate budget vs actual
    const recalculatedData = calculateBudgetVsActual(
      transactions,
      updatedBudgets
    );
    
    setBudgetVsActual(recalculatedData);
    cancelEditing();
  };

  // Format data for chart
  const chartData = budgetVsActual.map(item => ({
    name: item.category,
    budgeted: item.budgeted,
    spent: item.spent,
    color: categoryColors[item.category as TransactionCategory] || "#94a3b8"
  }));

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header title="Budget Planner" />
      <main className="flex-1 p-4 lg:p-8">
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="md:col-span-2 animate-fade-in">
            <CardHeader>
              <CardTitle>Budget Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                    barGap={0}
                    barCategoryGap={20}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name" 
                      angle={-45} 
                      textAnchor="end" 
                      height={70} 
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number) => [formatCurrency(value), "Amount"]}
                    />
                    <Legend />
                    <Bar 
                      dataKey="budgeted" 
                      name="Budgeted" 
                      fill="#9b87f5" 
                      radius={[4, 4, 0, 0]} 
                    />
                    <Bar 
                      dataKey="spent" 
                      name="Spent" 
                      radius={[4, 4, 0, 0]}
                    >
                      {chartData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.color} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-fade-in" style={{ animationDelay: "100ms" }}>
            <CardHeader>
              <CardTitle>Budget Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {budgetVsActual.map((item) => (
                  <div key={item.category} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{item.category}</span>
                      <div className="flex items-center space-x-2">
                        {editingCategory === item.category ? (
                          <>
                            <Input
                              type="number"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              className="w-24 h-8"
                              min="0"
                              step="10"
                            />
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8" 
                              onClick={() => saveEdit(item.category as TransactionCategory)}
                            >
                              <CheckIcon className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8" 
                              onClick={cancelEditing}
                            >
                              <XIcon className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <span>
                              {formatCurrency(item.budgeted)}
                            </span>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8" 
                              onClick={() => startEditing(item.category, item.budgeted)}
                            >
                              <PencilIcon className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          {formatCurrency(item.spent)} spent
                        </span>
                        <span className="text-muted-foreground">
                          {formatCurrency(item.remaining)} remaining
                        </span>
                      </div>
                      <Progress 
                        value={(item.spent / item.budgeted) * 100} 
                        className="h-2"
                        indicatorClassName={
                          item.spent > item.budgeted ? "bg-budget-red" : "bg-budget-green"
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="animate-fade-in" style={{ animationDelay: "200ms" }}>
            <CardHeader>
              <CardTitle>Budget Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Monthly Overview</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Total Budgeted</span>
                      <span className="font-medium">
                        {formatCurrency(
                          budgetVsActual.reduce((sum, item) => sum + item.budgeted, 0)
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Total Spent</span>
                      <span className="font-medium">
                        {formatCurrency(
                          budgetVsActual.reduce((sum, item) => sum + item.spent, 0)
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t">
                      <span className="font-medium">Remaining Budget</span>
                      <span className="font-bold text-lg">
                        {formatCurrency(
                          budgetVsActual.reduce((sum, item) => sum + item.remaining, 0)
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-4">Top Spending Categories</h3>
                  <div className="space-y-4">
                    {budgetVsActual
                      .sort((a, b) => b.spent - a.spent)
                      .slice(0, 3)
                      .map(item => (
                        <div key={`top-${item.category}`} className="flex justify-between items-center">
                          <div className="flex items-center">
                            <div 
                              className="w-3 h-3 rounded-full mr-2" 
                              style={{ backgroundColor: categoryColors[item.category as TransactionCategory] || "#94a3b8" }}
                            />
                            <span>{item.category}</span>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="font-medium">{formatCurrency(item.spent)}</span>
                            <span className="text-xs text-muted-foreground">
                              {formatPercentage(
                                item.spent,
                                budgetVsActual.reduce((sum, i) => sum + i.spent, 0)
                              )}
                            </span>
                          </div>
                        </div>
                      ))
                    }
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
