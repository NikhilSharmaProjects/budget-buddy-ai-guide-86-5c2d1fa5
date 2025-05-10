
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { Upload, Download, Trash2, FileText } from "lucide-react";
import { Transaction } from "@/types";
import { importTransactionsFromCSV, exportTransactionsToCSV } from "@/utils/csvHandler";
import { getTransactions, saveTransactions } from "@/utils/localStorage";
import { formatCurrency } from "@/utils/calculations";

export function TransactionImportExport({ onImportComplete }: { onImportComplete: () => void }) {
  const [csvContent, setCsvContent] = useState("");
  const [selectedTab, setSelectedTab] = useState("import");
  const [previewTransactions, setPreviewTransactions] = useState<Transaction[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const transactions = getTransactions();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setCsvContent(content);
      
      try {
        // Parse CSV for preview
        const importResult = importTransactionsFromCSV(content + 'preview'); // Add preview flag
        
        if (Array.isArray(importResult)) {
          setPreviewTransactions(importResult);
          toast({
            title: "CSV Preview Loaded",
            description: `${importResult.length} transactions found in CSV file.`,
          });
        } else {
          // Handle unexpected result
          toast({
            title: "Error Loading CSV Preview",
            description: "Unexpected result format from CSV parser.",
            variant: "destructive"
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
      
      if (Array.isArray(importResult)) {
        toast({
          title: "Import Successful",
          description: `${importResult.length} transactions imported.`,
        });
        
        // Clear CSV content and preview
        setCsvContent("");
        setPreviewTransactions([]);
        onImportComplete();
      } else if (typeof importResult === 'number') {
        toast({
          title: "Import Successful",
          description: `${importResult} new transactions imported.`,
        });
        
        // Clear CSV content and preview
        setCsvContent("");
        setPreviewTransactions([]);
        onImportComplete();
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
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="group transition-all duration-300">
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
  );
}
