"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  DollarSign, 
  ShoppingCart, 
  Wallet, 
  ClipboardList, 
  Package, 
  AlertTriangle 
} from "lucide-react";

// UI Components
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// Dashboard Components
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardCards } from "@/components/dashboard/dashboard-cards";
import { RecentSales } from "@/components/dashboard/recent-sales";
import { StockAlerts } from "@/components/dashboard/stock-alerts";
import { TopSellingProducts } from "@/components/dashboard/top-selling-products";
import StockClerkDashboard from '@/components/dashboard/StockClerkDashboard';
import CashierDashboard from '@/components/dashboard/CashierDashboard';

// Auth & Role Components
import RequireRole from "@/components/RequireRole";
import { useAuth } from '@/hooks/use-auth';
import { useTouch } from '@/contexts/touch-context';

// API
import { apiFetch } from "@/lib/api";

// Types
interface User {
  id?: string;
  _id?: string;
  firstName: string;
  role: 'superAdmin' | 'manager' | 'admin' | 'stockClerk' | 'cashier';
}

interface ActivityItem {
  date: string;
  action: string;
  details: string;
}

interface StockClerkStats {
  inventoryCount: number;
  stocktakesThisMonth: number;
  discrepancyCount: number;
  recentActivity: ActivityItem[];
}

interface CashierStats {
  todaySales: number;
  transactionCount: number;
  recentSales: any[];
}

// Utility Functions
const formatCurrency = (amount: number): string => `$${amount.toFixed(2)}`;

const formatDate = (date: string): string => new Date(date).toLocaleDateString();

const getTodayDateString = (): string => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

// Dashboard Header Component
const DashboardPageHeader = ({ 
  user, 
  title, 
  subtitle 
}: { 
  user: User; 
  title: string; 
  subtitle: string;
}) => (
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <div>
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="text-muted-foreground text-sm">{subtitle}</p>
        </div>
      </header>
);

// Quick Actions Component
const QuickActions = ({ 
  actions 
}: { 
  actions: Array<{
    label: string;
    variant?: 'default' | 'outline';
    onClick: () => void;
  }>;
}) => (
        <div className="flex flex-wrap gap-3 mb-2">
    {actions.map((action, index) => (
      <Button
        key={index}
        aria-label={action.label}
        variant={action.variant || 'default'}
        className="transition-transform hover:scale-[1.03] focus-visible:ring-2 focus-visible:ring-primary/70"
        onClick={action.onClick}
      >
        {action.label}
      </Button>
    ))}
        </div>
);

// Error Alert Component
const ErrorAlert = ({ error }: { error: string }) => (
  <div 
    className="rounded-md bg-destructive/10 border border-destructive text-destructive px-4 py-3 text-sm font-medium" 
    role="alert"
  >
            {error}
          </div>
);

// Stat Card Component
const StatCard = ({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  iconColor, 
  loading = false 
}: {
  title: string;
  value: string | number;
  description: string;
  icon: React.ElementType;
  iconColor: string;
  loading?: boolean;
}) => (
          <Card className="transition-shadow hover:shadow-lg focus-within:shadow-lg rounded-xl">
            {loading ? (
              <CardContent className="py-6 flex flex-col gap-2">
                <Skeleton className="h-4 w-1/2 mb-2" />
                <Skeleton className="h-8 w-1/3" />
                <Skeleton className="h-3 w-1/2 mt-2" />
              </CardContent>
            ) : (
              <>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <Icon className={`h-5 w-5 ${iconColor}`} />
                </CardHeader>
                <CardContent>
          <div className="text-2xl font-bold">{value}</div>
          <div className="text-xs text-muted-foreground">{description}</div>
                </CardContent>
              </>
            )}
          </Card>
);

// Recent Activity Table Component
const RecentActivityTable = ({ 
  activities, 
  loading 
}: { 
  activities: ActivityItem[]; 
  loading: boolean;
}) => (
        <Card className="rounded-xl transition-shadow hover:shadow-lg focus-within:shadow-lg">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-6 w-full rounded" />
                ))}
              </div>
      ) : activities.length === 0 ? (
              <div className="text-muted-foreground">No recent activity.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm" aria-label="Recent Activity">
                  <thead>
                    <tr className="border-b">
                      <th className="px-2 py-1 text-left font-medium">Date</th>
                      <th className="px-2 py-1 text-left font-medium">Action</th>
                      <th className="px-2 py-1 text-left font-medium">Details</th>
                    </tr>
                  </thead>
                  <tbody>
              {activities.map((item, idx) => (
                <tr 
                  key={idx} 
                  tabIndex={0} 
                  className="hover:bg-accent/40 focus:bg-accent/60 transition-colors"
                >
                  <td className="px-2 py-1">{formatDate(item.date)}</td>
                        <td className="px-2 py-1">{item.action}</td>
                        <td className="px-2 py-1">{item.details}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
);

// Admin Dashboard Component
const AdminDashboard = () => {
  const auth = useAuth() as any;
  const user = auth?.user as User;
  const welcomeMsg = `Welcome back, ${user.firstName}! Here's an overview of your store.`;
  const { isSmallScreen } = useTouch();
  
    return (
      <RequireRole roles={['superAdmin', 'manager', 'admin']}>
        <div className="flex flex-1 flex-col">
          <header className={`flex ${isSmallScreen ? 'h-14' : 'h-16'} shrink-0 items-center gap-2 border-b ${isSmallScreen ? 'px-2' : 'px-4'}`}>
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <h1 className={`${isSmallScreen ? 'text-base' : 'text-lg'} font-semibold`}>Dashboard</h1>
          </header>
          <div className={`flex flex-1 flex-col gap-4 ${isSmallScreen ? 'p-2' : 'p-4'}`}>
          <DashboardHeader subtitle={welcomeMsg} />
            <DashboardCards />
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <RecentSales />
              <div className="flex flex-col gap-6">
                <StockAlerts />
                <TopSellingProducts />
              </div>
            </div>
          </div>
        </div>
      </RequireRole>
    );
};

// Unauthorized Access Component
const UnauthorizedAccess = () => (
    <RequireRole roles={['superAdmin', 'manager', 'admin']}>
      <div className="flex flex-1 flex-col items-center justify-center h-full">
        <h2 className="text-2xl font-bold mb-4">Not Authorized</h2>
        <p className="text-muted-foreground">You do not have access to this dashboard.</p>
      </div>
    </RequireRole>
  );

// Main Dashboard Component
export default function DashboardPage() {
  const auth = useAuth() as any;
  const user = auth?.user as User;
  const router = useRouter();

  // Role-based dashboard rendering
  const renderDashboard = () => {
    switch (user?.role) {
      case 'stockClerk':
        return <StockClerkDashboard user={user} />;
      case 'cashier':
        return <CashierDashboard user={user} />;
      case 'superAdmin':
      case 'manager':
      case 'admin':
        return <AdminDashboard />;
      default:
        return <UnauthorizedAccess />;
    }
  };

  return renderDashboard();
}