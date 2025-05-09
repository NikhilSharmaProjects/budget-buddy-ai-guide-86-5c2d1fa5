import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowUpRight, ArrowDownRight, DollarSign, PiggyBank } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { Header } from "@/components/layout/Header";
import { 
  formatCurrency, 
  calculateTotalIncome, 
  calculateTotalExpenses, 
  calculateBalance,
  formatCategoryDataForChart 
} from "@/utils/calculations";
import { Transaction } from "@/types";
import { getTransactions } from "@/utils/localStorage";
import { categoryColors } from "@/utils/dummyData";

export default function DashboardPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [balance, setBalance] = useState(0);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  
  useEffect(() => {
    const loadedTransactions = getTransactions();
    setTransactions(loadedTransactions);
    
    // Calculate financial stats
    setTotalIncome(calculateTotalIncome(loadedTransactions));
    setTotalExpenses(calculateTotalExpenses(loadedTransactions));
    setBalance(calculateBalance(loadedTransactions));
    
    // Prepare chart data
    setCategoryData(formatCategoryDataForChart(loadedTransactions));
  }, []);

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header title="Dashboard" />
      <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
        <div className="grid gap-4 md:gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          <Card className="animate-fade-in">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Income</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-budget-green">{formatCurrency(totalIncome)}</div>
              <p className="text-xs text-muted-foreground">
                Monthly Income
              </p>
            </CardContent>
          </Card>
          <Card className="animate-fade-in" style={{ animationDelay: "100ms" }}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
              <ArrowDownRight className="h-4 w-4 text-budget-red" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-budget-red">{formatCurrency(totalExpenses)}</div>
              <p className="text-xs text-muted-foreground">
                Monthly Expenses
              </p>
            </CardContent>
          </Card>
          <Card className="animate-fade-in" style={{ animationDelay: "200ms" }}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
              <PiggyBank className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${balance >= 0 ? 'text-budget-green' : 'text-budget-red'}`}>
                {formatCurrency(balance)}
              </div>
              <p className="text-xs text-muted-foreground">
                Available to spend
              </p>
            </CardContent>
          </Card>
          <Card className="animate-fade-in" style={{ animationDelay: "300ms" }}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Savings Rate</CardTitle>
              <ArrowUpRight className="h-4 w-4 text-budget-green" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalIncome > 0 ? 
                  `${Math.round((balance / totalIncome) * 100)}%` : 
                  '0%'
                }
              </div>
              <p className="text-xs text-muted-foreground">
                Of total income
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <Tabs defaultValue="pieChart">
            <TabsList>
              <TabsTrigger value="pieChart">Spending by Category</TabsTrigger>
              <TabsTrigger value="barChart">Income vs Expenses</TabsTrigger>
            </TabsList>
            <TabsContent value="pieChart">
              <Card className="animate-fade-in" style={{ animationDelay: "400ms" }}>
                <CardHeader>
                  <CardTitle>Spending by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    {categoryData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={categoryData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={renderCustomizedLabel}
                            outerRadius={120}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {categoryData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value: number) => [formatCurrency(value), "Amount"]} 
                          />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <p className="text-muted-foreground">No expense data available</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="barChart">
              <Card className="animate-fade-in" style={{ animationDelay: "400ms" }}>
                <CardHeader>
                  <CardTitle>Income vs Expenses</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[
                        { name: "Income", value: totalIncome, color: categoryColors.Income },
                        { name: "Expenses", value: totalExpenses, color: categoryColors.Shopping }
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value: number) => [formatCurrency(value), "Amount"]} />
                        <Legend />
                        <Bar dataKey="value" name="Amount">
                          {[
                            { name: "Income", value: totalIncome, color: categoryColors.Income },
                            { name: "Expenses", value: totalExpenses, color: categoryColors.Shopping }
                          ].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="mt-8">
          <Card className="animate-fade-in" style={{ animationDelay: "500ms" }}>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="grid grid-cols-[1fr_1fr_2fr_1fr] md:grid-cols-[1fr_1fr_2fr_1fr] gap-4 p-4 font-medium border-b">
                  <div>Date</div>
                  <div>Category</div>
                  <div>Description</div>
                  <div className="text-right">Amount</div>
                </div>
                <div className="divide-y">
                  {transactions.slice(0, 5).map((transaction) => (
                    <div 
                      key={transaction.id} 
                      className="grid grid-cols-[1fr_1fr_2fr_1fr] md:grid-cols-[1fr_1fr_2fr_1fr] gap-4 p-4"
                    >
                      <div className="text-sm">{new Date(transaction.date).toLocaleDateString()}</div>
                      <div className="text-sm">{transaction.category}</div>
                      <div className="text-sm">{transaction.description}</div>
                      <div className={`text-sm text-right ${
                        transaction.type === "income" ? "text-budget-green" : "text-budget-red"
                      }`}>
                        {transaction.type === "income" ? "+" : "-"}
                        {formatCurrency(transaction.amount)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
