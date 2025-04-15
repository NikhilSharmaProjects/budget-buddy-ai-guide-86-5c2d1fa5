
import { useState } from "react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Bell, Download } from "lucide-react";
import { formatCurrency } from "@/utils/calculations";
import { getTransactions } from "@/utils/localStorage";

interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  const [showMenu, setShowMenu] = useState(false);
  
  const exportData = () => {
    const transactions = getTransactions();
    const dataStr = JSON.stringify(transactions, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    
    const exportFileDefaultName = `budget_buddy_export_${new Date().toLocaleDateString()}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <header className="border-b">
      <div className="h-14 flex items-center justify-between px-4 lg:px-8">
        <h1 className="font-semibold text-lg md:text-xl">{title}</h1>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            className="hidden md:flex"
            onClick={exportData}
          >
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowMenu(!showMenu)}
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
            </Button>
            {showMenu && (
              <div className="absolute right-0 mt-2 w-72 bg-card rounded-md shadow-lg border z-50">
                <div className="p-4">
                  <h3 className="font-medium">Notifications</h3>
                  <div className="mt-2 text-sm text-muted-foreground">No new notifications</div>
                </div>
              </div>
            )}
          </div>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
