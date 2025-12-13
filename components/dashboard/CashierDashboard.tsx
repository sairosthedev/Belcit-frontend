import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { DollarSign, ShoppingCart, Wallet, TrendingUp, Sparkles, Receipt, History, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { apiFetch } from '@/lib/api';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

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

const StatCard = ({ title, value, description, icon: Icon, iconColor, loading = false, index = 0 }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
    whileHover={{ y: -5, transition: { duration: 0.2 } }}
  >
    <Card className="relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 shadow-lg hover:shadow-xl bg-gradient-to-br from-background via-background to-primary/5">
      {/* Shimmer effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 pointer-events-none" />

      {loading ? (
        <CardContent className="py-6 flex flex-col gap-2">
          <Skeleton className="h-4 w-1/2 mb-2" />
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-3 w-1/2 mt-2" />
        </CardContent>
      ) : (
        <>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">{title}</CardTitle>
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Icon className={`h-6 w-6 ${iconColor}`} />
            </motion.div>
          </CardHeader>
          <CardContent>
            <motion.div
              className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              {value}
            </motion.div>
            <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              {description}
            </div>
          </CardContent>
        </>
      )}
    </Card>
  </motion.div>
);

const ErrorAlert = ({ error }: { error: string }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    className="rounded-lg bg-red-500/10 border-2 border-red-500/30 text-red-600 px-4 py-3 text-sm font-semibold shadow-lg"
    role="alert"
  >
    ⚠️ {error}
  </motion.div>
);

const QuickActions = ({ actions }: { actions: Array<{ label: string; variant?: 'default' | 'outline'; onClick: () => void; icon?: any }> }) => (
  <motion.div
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-wrap gap-3 mb-6"
  >
    {actions.map((action, index) => (
      <motion.div
        key={index}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: index * 0.05 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button
          aria-label={action.label}
          variant={action.variant || 'default'}
          className={`${action.variant === 'outline'
              ? 'border-2 hover:border-primary hover:bg-primary/10'
              : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl'
            } transition-all duration-300 font-semibold relative overflow-hidden group`}
          onClick={action.onClick}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
          <span className="relative z-10 flex items-center gap-2">
            {action.icon && <action.icon className="h-4 w-4" />}
            {action.label}
          </span>
        </Button>
      </motion.div>
    ))}
  </motion.div>
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
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.3 }}
  >
    <Card className="border-2 hover:border-primary/30 transition-all duration-300 shadow-xl bg-gradient-to-br from-background via-background to-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Receipt className="h-5 w-5 text-primary" />
          Recent Sales
          {sales.length > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="ml-2 px-2 py-1 bg-primary text-primary-foreground rounded-full text-xs font-bold"
            >
              {sales.length}
            </motion.span>
          )}
        </CardTitle>
        <Input
          type="text"
          placeholder="🔍 Search sales..."
          className="mt-3 border-2 focus:border-primary transition-colors"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        ) : sales.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
            <p className="text-lg font-semibold text-muted-foreground">No recent sales</p>
            <p className="text-sm text-muted-foreground mt-1">Sales will appear here once transactions are made</p>
          </motion.div>
        ) : (
          <div className="overflow-x-auto rounded-lg">
            <table className="min-w-full text-sm" aria-label="Recent Sales">
              <thead>
                <tr className="border-b-2 border-primary/20">
                  <th className="px-3 py-3 text-left font-bold">Date</th>
                  <th className="px-3 py-3 text-left font-bold">Total</th>
                  <th className="px-3 py-3 text-left font-bold">Customer</th>
                  <th className="px-3 py-3 text-left font-bold">Products</th>
                  <th className="px-3 py-3 text-left font-bold">Payment</th>
                  <th className="px-3 py-3 text-left font-bold">Cashier</th>
                  <th className="px-3 py-3 text-left font-bold">Sale ID</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence mode="popLayout">
                  {sales.map((item: any, idx: number) => (
                    <motion.tr
                      key={item._id || item.id || idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: idx * 0.05 }}
                      className="border-b hover:bg-primary/5 transition-colors"
                    >
                      <td className="px-3 py-3 font-medium">{formatDate(item.date)}</td>
                      <td className="px-3 py-3 font-bold text-primary">{formatCurrency(item.total)}</td>
                      <td className="px-3 py-3">{item.customer ? `${item.customer.firstName || ''} ${item.customer.lastName || ''}`.trim() : '👤 Walk-in'}</td>
                      <td className="px-3 py-3 text-xs max-w-xs truncate">{item.items && item.items.length > 0 ? item.items.map((it: any) => `${it.product?.name || '-'} (${it.quantity})`).join(', ') : '-'}</td>
                      <td className="px-3 py-3">
                        <span className="px-2 py-1 bg-primary/10 rounded-md text-xs font-semibold">
                          {item.paymentType || '-'}
                        </span>
                      </td>
                      <td className="px-3 py-3">{item.cashier ? `${item.cashier.firstName || ''} ${item.cashier.lastName || ''}`.trim() : '-'}</td>
                      <td className="px-3 py-3 font-mono text-xs text-muted-foreground">{(item._id || item.id).slice(-8)}</td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
            <div className="flex justify-between items-center mt-4 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setPage((p: number) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="border-2 hover:border-primary disabled:opacity-50"
              >
                ← Prev
              </Button>
              <span className="font-semibold">
                Page <span className="text-primary">{page}</span> of {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage((p: number) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="border-2 hover:border-primary disabled:opacity-50"
              >
                Next →
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  </motion.div>
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
        toast.success("Opening receipt...", { duration: 2000 });
      } else {
        toast.error("No sales found to print receipt", { duration: 2000 });
      }
    } catch (err) {
      toast.error("Failed to fetch last sale", { duration: 2000 });
    }
  };

  const quickActions = [
    {
      label: 'Go to Point of Sale',
      onClick: () => router.push('/dashboard/sales'),
      icon: ShoppingCart
    },
    {
      label: 'View Sales History',
      variant: 'outline' as const,
      onClick: () => router.push("/dashboard/sales/history"),
      icon: History
    },
    {
      label: 'Print Last Receipt',
      variant: 'outline' as const,
      onClick: handlePrintLastReceipt,
      icon: Receipt
    }
  ];

  return (
    <div className="flex flex-1 flex-col relative">
      {/* Premium gradient background overlay */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-purple-500/5 via-transparent to-blue-500/5 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex h-16 shrink-0 items-center gap-2 border-b-2 px-4 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      >
        <SidebarTrigger className="-ml-1" />
        <div className="flex-1">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Welcome, {user.firstName}!
            </span>
            <Sparkles className="h-5 w-5 text-yellow-500" />
          </h1>
          <p className="text-muted-foreground text-sm font-medium">Your premium cashier dashboard</p>
        </div>
      </motion.div>

      <div className="flex flex-1 flex-col gap-6 p-6">
        <QuickActions actions={quickActions} />
        {error && <ErrorAlert error={error.message || String(error)} />}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Today's Sales"
            value={formatCurrency(salesArray ? salesArray.reduce((sum: number, s: any) => sum + (s.total || 0), 0) : 0)}
            description="Total sales today"
            icon={DollarSign}
            iconColor="text-green-500"
            loading={isLoading}
            index={0}
          />
          <StatCard
            title="Transactions"
            value={salesArray ? salesArray.length : 0}
            description="Number of sales"
            icon={ShoppingCart}
            iconColor="text-blue-500"
            loading={isLoading}
            index={1}
          />
          <StatCard
            title="Cash in Drawer"
            value={formatCurrency(0)}
            description="Current shift"
            icon={Wallet}
            iconColor="text-yellow-500"
            loading={false}
            index={2}
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