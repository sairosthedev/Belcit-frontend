import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { DollarSign, ShoppingCart, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { apiFetch } from '@/lib/api';
import { SidebarTrigger } from '@/components/ui/sidebar';

interface User {
  id?: string;
  _id?: string;
  firstName: string;
  role: string;
}

const formatCurrency = (amount: number): string => `$${amount.toFixed(2)}`;
const formatDate = (date: string): string => new Date(date).toLocaleDateString();
const getTodayDateString = (): string => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const StatCard = ({ title, value, description, icon: Icon, iconColor, loading = false }: any) => (
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

const ErrorAlert = ({ error }: { error: string }) => (
  <div className="rounded-md bg-destructive/10 border border-destructive text-destructive px-4 py-3 text-sm font-medium" role="alert">
    {error}
  </div>
);

const QuickActions = ({ actions }: { actions: Array<{ label: string; variant?: 'default' | 'outline'; onClick: () => void }> }) => (
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

function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  React.useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debounced;
}

const PAGE_SIZE = 5;

const RecentSalesTable = ({ sales, loading, page, setPage, totalPages, search, setSearch }: any) => (
  <Card className="rounded-xl transition-shadow hover:shadow-lg focus-within:shadow-lg">
    <CardHeader>
      <CardTitle>Recent Sales</CardTitle>
      <input
        type="text"
        placeholder="Search sales..."
        className="mt-2 p-2 border rounded w-full"
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
    </CardHeader>
    <CardContent>
      {loading ? (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-6 w-full rounded" />
          ))}
        </div>
      ) : sales.length === 0 ? (
        <div className="text-muted-foreground">No recent sales.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm" aria-label="Recent Sales">
            <thead>
              <tr className="border-b">
                <th className="px-2 py-1 text-left font-medium">Date</th>
                <th className="px-2 py-1 text-left font-medium">Total</th>
                <th className="px-2 py-1 text-left font-medium">Customer</th>
                <th className="px-2 py-1 text-left font-medium">Products</th>
                <th className="px-2 py-1 text-left font-medium">Payment Method</th>
                <th className="px-2 py-1 text-left font-medium">Cashier</th>
                <th className="px-2 py-1 text-left font-medium">Sale ID</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((item: any, idx: number) => (
                <tr key={idx} tabIndex={0} className="hover:bg-accent/40 focus:bg-accent/60 transition-colors">
                  <td className="px-2 py-1">{formatDate(item.date)}</td>
                  <td className="px-2 py-1">{formatCurrency(item.total)}</td>
                  <td className="px-2 py-1">{item.customer ? `${item.customer.firstName || ''} ${item.customer.lastName || ''}`.trim() : '-'}</td>
                  <td className="px-2 py-1">{item.items && item.items.length > 0 ? item.items.map((it: any) => `${it.product?.name || '-'} (${it.quantity})`).join(', ') : '-'}</td>
                  <td className="px-2 py-1">{item.paymentType || '-'}</td>
                  <td className="px-2 py-1">{item.cashier ? `${item.cashier.firstName || ''} ${item.cashier.lastName || ''}`.trim() : '-'}</td>
                  <td className="px-2 py-1">{item._id || item.id}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex justify-between items-center mt-2">
            <Button variant="outline" onClick={() => setPage((p: number) => Math.max(1, p - 1))} disabled={page === 1}>Prev</Button>
            <span>Page {page} of {totalPages}</span>
            <Button variant="outline" onClick={() => setPage((p: number) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</Button>
          </div>
        </div>
      )}
    </CardContent>
  </Card>
);

const CashierDashboard = ({ user }: { user: User }) => {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 300);
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useQuery({
    queryKey: ['cashierSales', user?.id || user?._id],
    queryFn: async () => {
      const dateStr = getTodayDateString();
      const userId = user.id || user._id || '';
      const sales = await apiFetch(`/api/sales?date=${dateStr}&cashierId=${userId}`);
      return sales;
    },
    enabled: !!user,
  });

  const salesArray = Array.isArray(data) ? data : data?.sales || [];

  const filteredSales = useMemo(() => {
    if (!salesArray) return [];
    return salesArray.filter((item: any) =>
      (item.customer?.name || '').toLowerCase().includes(debouncedSearch.toLowerCase())
    );
  }, [salesArray, debouncedSearch]);

  const totalPages = Math.max(1, Math.ceil(filteredSales.length / PAGE_SIZE));
  const paginatedSales = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredSales.slice(start, start + PAGE_SIZE);
  }, [filteredSales, page]);

  const handlePrintLastReceipt = async () => {
    try {
      const userId = user?.id || user?._id || "";
      const sales = await apiFetch(`/api/sales?cashierId=${userId}&limit=1`);
      if (sales && sales.length > 0) {
        const lastSale = sales[0];
        const receiptId = lastSale._id || lastSale.id;
        window.open(`/dashboard/sales/receipt/${receiptId}`, "_blank");
      } else {
        alert("No sales found to print receipt.");
      }
    } catch (err) {
      alert("Failed to fetch last sale.");
    }
  };

  const quickActions = [
    {
      label: 'Go to Point of Sale',
      onClick: () => router.push('/dashboard/sales')
    },
    {
      label: 'View Sales History',
      variant: 'outline' as const,
      onClick: () => router.push("/dashboard/sales/history")
    },
    {
      label: 'Print Last Receipt',
      variant: 'outline' as const,
      onClick: handlePrintLastReceipt
    }
  ];

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex h-16 shrink-0 items-center gap-2 border-b px-4 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <SidebarTrigger className="-ml-1" />
        <div>
          <h1 className="text-2xl font-bold">{`Welcome, ${user.firstName}!`}</h1>
          <p className="text-muted-foreground text-sm">Your cashier dashboard</p>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-6 p-6">
        <QuickActions actions={quickActions} />
        {error && <ErrorAlert error={error.message || String(error)} />}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title="Today's Sales"
            value={formatCurrency(salesArray ? salesArray.reduce((sum: number, s: any) => sum + (s.total || 0), 0) : 0)}
            description="Total sales today"
            icon={DollarSign}
            iconColor="text-green-500"
            loading={isLoading}
          />
          <StatCard
            title="Transactions"
            value={salesArray ? salesArray.length : 0}
            description="Number of sales"
            icon={ShoppingCart}
            iconColor="text-blue-500"
            loading={isLoading}
          />
          <StatCard
            title="Cash in Drawer"
            value={formatCurrency(0)}
            description="Current shift"
            icon={Wallet}
            iconColor="text-yellow-500"
            loading={false}
          />
        </div>
        <RecentSalesTable
          sales={paginatedSales}
          loading={isLoading}
          page={page}
          setPage={setPage}
          totalPages={totalPages}
          search={search}
          setSearch={setSearch}
        />
      </div>
    </div>
  );
};

export default CashierDashboard; 