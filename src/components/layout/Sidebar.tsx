
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  BarChart3, 
  FileText, 
  PieChart, 
  MessageCircle, 
  ChevronLeft,
  ChevronRight,
  Home,
  LogOut
} from "lucide-react";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  
  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const routes = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: <Home className="h-5 w-5" />
    },
    {
      name: "Transactions",
      path: "/transactions",
      icon: <FileText className="h-5 w-5" />
    },
    {
      name: "Budget",
      path: "/budget",
      icon: <PieChart className="h-5 w-5" />
    },
    {
      name: "Assistant",
      path: "/assistant",
      icon: <MessageCircle className="h-5 w-5" />
    }
  ];

  return (
    <div
      className={cn(
        "relative flex flex-col border-r bg-sidebar transition-all duration-300",
        collapsed ? "w-16" : "w-64",
        className
      )}
    >
      <div className="flex h-14 items-center px-4 border-b">
        {!collapsed && (
          <div className="font-semibold text-xl text-budget-purple">Budget Buddy</div>
        )}
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-4 top-10 h-8 w-8 rounded-full border z-20 bg-background"
        onClick={toggleSidebar}
      >
        {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </Button>
      <ScrollArea className="flex-1">
        <nav className="flex flex-col gap-1 p-2">
          {routes.map((route) => (
            <Link
              key={route.path}
              to={route.path}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 transition-all",
                location.pathname === route.path
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
              )}
            >
              {route.icon}
              {!collapsed && <span>{route.name}</span>}
            </Link>
          ))}
        </nav>
      </ScrollArea>
      <div className="flex flex-col p-2 border-t">
        <Link
          to="/"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
        >
          <LogOut className="h-5 w-5" />
          {!collapsed && <span>Log Out</span>}
        </Link>
      </div>
    </div>
  );
}
