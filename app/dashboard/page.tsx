"use client";

import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardCards } from "@/components/dashboard/dashboard-cards"
import { RecentSales } from "@/components/dashboard/recent-sales"
import { StockAlerts } from "@/components/dashboard/stock-alerts"
import { TopSellingProducts } from "@/components/dashboard/top-selling-products"
import RequireRole from "@/components/RequireRole";
import { useAuth } from '@/hooks/use-auth';
import { InventoryHeader } from "@/components/inventory/inventory-header";
import { InventoryTable } from "@/components/inventory/inventory-table";
import { StocktakeHeader } from "@/components/stocktake/stocktake-header";
import { StocktakeForm } from "@/components/stocktake/stocktake-form";
import { SalesHeader } from "@/components/sales/sales-header";
import { POSSystem } from "@/components/sales/pos-system";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { DollarSign, ShoppingCart, Wallet, ClipboardList, Package, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";

function StockClerkDashboard({ user, router }: { user: any, router: any }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inventoryCount, setInventoryCount] = useState(0);
  const [stocktakesThisMonth, setStocktakesThisMonth] = useState(0);
  const [discrepancyCount, setDiscrepancyCount] = useState(0);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      apiFetch('/api/products'),
      apiFetch('/api/stocktakes'),
      apiFetch('/api/stocktakes/discrepancies'),
    ])
      .then(([products, stocktakes, discrepancies]) => {
        setInventoryCount(products.length);
        const now = new Date();
        const thisMonth = now.getMonth();
        const thisYear = now.getFullYear();
        const stocktakesThisMonth = stocktakes.filter((s: any) => {
          const d = new Date(s.createdAt);
          return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
        });
        setStocktakesThisMonth(stocktakesThisMonth.length);
        setDiscrepancyCount(discrepancies.length);
        const recent = [
          ...stocktakes.slice(-3).map((s: any) => ({
            date: s.createdAt,
            action: 'Stocktake',
            details: s.location || s.notes || '-',
          })),
          ...discrepancies.slice(-3).map((d: any) => ({
            date: d.createdAt,
            action: 'Discrepancy',
            details: d.product?.name || '-',
          })),
        ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);
        setRecentActivity(recent);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <div>
          <h1 className="text-2xl font-bold">Welcome, {user.firstName}!</h1>
          <p className="text-muted-foreground text-sm">Your stock clerk dashboard</p>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3 mb-2">
          <Button aria-label="Record Incoming Goods" className="transition-transform hover:scale-[1.03] focus-visible:ring-2 focus-visible:ring-primary/70" onClick={() => router.push('/dashboard/inventory')}>Record Incoming Goods</Button>
          <Button aria-label="Perform Stocktake" variant="outline" className="transition-transform hover:scale-[1.03] focus-visible:ring-2 focus-visible:ring-primary/70" onClick={() => router.push('/dashboard/stocktake')}>Perform Stocktake</Button>
          <Button aria-label="Correct Discrepancy" variant="outline" className="transition-transform hover:scale-[1.03] focus-visible:ring-2 focus-visible:ring-primary/70" onClick={() => router.push('/dashboard/stocktake?tab=discrepancies')}>Correct Discrepancy</Button>
        </div>
        {/* Error State */}
        {error && (
          <div className="rounded-md bg-destructive/10 border border-destructive text-destructive px-4 py-3 text-sm font-medium" role="alert">
            {error}
          </div>
        )}
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
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
                  <CardTitle className="text-sm font-medium">Inventory Items</CardTitle>
                  <Package className="h-5 w-5 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{inventoryCount}</div>
                  <div className="text-xs text-muted-foreground">Total items in inventory</div>
                </CardContent>
              </>
            )}
          </Card>
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
                  <CardTitle className="text-sm font-medium">Stocktakes This Month</CardTitle>
                  <ClipboardList className="h-5 w-5 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stocktakesThisMonth}</div>
                  <div className="text-xs text-muted-foreground">Stocktakes performed</div>
                </CardContent>
              </>
            )}
          </Card>
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
                  <CardTitle className="text-sm font-medium">Discrepancies</CardTitle>
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{discrepancyCount}</div>
                  <div className="text-xs text-muted-foreground">Unresolved discrepancies</div>
                </CardContent>
              </>
            )}
          </Card>
        </div>
        {/* Recent Activity Table */}
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
            ) : recentActivity.length === 0 ? (
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
                    {recentActivity.map((item, idx) => (
                      <tr key={idx} tabIndex={0} className="hover:bg-accent/40 focus:bg-accent/60 transition-colors">
                        <td className="px-2 py-1">{new Date(item.date).toLocaleDateString()}</td>
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
      </div>
    </div>
  );
}

function CashierDashboard({ user, router }: { user: any, router: any }) {
  const [cashierLoading, setCashierLoading] = useState(true);
  const [cashierError, setCashierError] = useState<string | null>(null);
  const [todaySales, setTodaySales] = useState(0);
  const [transactionCount, setTransactionCount] = useState(0);
  const [recentSales, setRecentSales] = useState<any[]>([]);
  useEffect(() => {
    if (!user) return;
    setCashierLoading(true);
    setCashierError(null);
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;
    apiFetch(`/api/sales?date=${dateStr}&cashierId=${user.id || user._id || ''}`)
      .then((sales) => {
        setTransactionCount(sales.length);
        setTodaySales(sales.reduce((sum: number, s: any) => sum + (s.total || 0), 0));
        setRecentSales(sales.slice(-5).reverse());
      })
      .catch((err) => setCashierError(err.message))
      .finally(() => setCashierLoading(false));
  }, [user]);
  return (
    <div className="flex flex-1 flex-col">
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <div>
          <h1 className="text-2xl font-bold">Welcome, {user.firstName}!</h1>
          <p className="text-muted-foreground text-sm">Your cashier dashboard</p>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-6 p-6">
        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3 mb-2">
          <Button onClick={() => router.push('/dashboard/sales')}>Go to Point of Sale</Button>
          <Button variant="outline" onClick={() => router.push("/dashboard/sales/history")}>View Sales History</Button>
          <Button variant="outline" onClick={async () => {
            try {
              const sales = await apiFetch(`/api/sales?cashierId=${user?.id || user?._id || ""}&limit=1`);
              if (sales && sales.length > 0) {
                const lastSale = sales[0];
                window.open(`/dashboard/sales/receipt/${lastSale._id || lastSale.id}`, "_blank");
              } else {
                alert("No sales found to print receipt.");
              }
            } catch (err) {
              alert("Failed to fetch last sale.");
            }
          }}>Print Last Receipt</Button>
        </div>
        {/* Error State */}
        {cashierError && (
          <div className="rounded-md bg-destructive/10 border border-destructive text-destructive px-4 py-3 text-sm font-medium" role="alert">
            {cashierError}
          </div>
        )}
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Today's Sales</CardTitle>
              <DollarSign className="h-5 w-5 text-green-500" />
            </CardHeader>
            <CardContent>
              {cashierLoading ? (
                <div className="text-2xl font-bold animate-pulse">...</div>
              ) : (
                <div className="text-2xl font-bold">${todaySales.toFixed(2)}</div>
              )}
              <div className="text-xs text-muted-foreground">Total sales today</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Transactions</CardTitle>
              <ShoppingCart className="h-5 w-5 text-blue-500" />
            </CardHeader>
            <CardContent>
              {cashierLoading ? (
                <div className="text-2xl font-bold animate-pulse">...</div>
              ) : (
                <div className="text-2xl font-bold">{transactionCount}</div>
              )}
              <div className="text-xs text-muted-foreground">Number of sales</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Cash in Drawer</CardTitle>
              <Wallet className="h-5 w-5 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$0.00</div>
              <div className="text-xs text-muted-foreground">Current shift</div>
            </CardContent>
          </Card>
        </div>
        {/* Recent Sales Table */}
        <RecentSales />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth() as any;
  const router = useRouter();

  if (user?.role === 'stockClerk') {
    return <StockClerkDashboard user={user} router={router} />;
  }
  if (user?.role === 'cashier') {
    return <CashierDashboard user={user} router={router} />;
  }
  if (user?.role === 'superAdmin' || user?.role === 'manager' || user?.role === 'admin') {
    return (
      <RequireRole roles={['superAdmin', 'manager', 'admin']}>
        <div className="flex flex-1 flex-col">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <h1 className="text-lg font-semibold">Dashboard</h1>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4">
            <DashboardHeader />
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
  }
  return (
    <RequireRole roles={['superAdmin', 'manager', 'admin']}>
      <div className="flex flex-1 flex-col items-center justify-center h-full">
        <h2 className="text-2xl font-bold mb-4">Not Authorized</h2>
        <p className="text-muted-foreground">You do not have access to this dashboard.</p>
      </div>
    </RequireRole>
  );
}
