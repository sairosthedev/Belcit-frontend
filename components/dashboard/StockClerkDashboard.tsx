import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Package, ClipboardList, AlertTriangle, TrendingUp, Sparkles, Activity } from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { apiFetch } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface User {
  id?: string;
  _id?: string;
  firstName: string;
  role: string;
}

interface ActivityItem {
  date: string;
  action: string;
  details: string;
}

const formatDate = (date: string): string => new Date(date).toLocaleDateString();

const StatCard = ({ title, value, description, icon: Icon, iconColor, loading = false, index = 0 }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
    whileHover={{ y: -5, transition: { duration: 0.2 } }}
  >
    <Card className="relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 shadow-lg hover:shadow-xl bg-gradient-to-br from-background via-background to-primary/5">
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

const RecentActivityTable = ({ activities, loading, page, setPage, totalPages, search, setSearch }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.3 }}
  >
    <Card className="border-2 hover:border-primary/30 transition-all duration-300 shadow-xl bg-gradient-to-br from-background via-background to-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          Recent Activity
          {activities.length > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="ml-2 px-2 py-1 bg-primary text-primary-foreground rounded-full text-xs font-bold"
            >
              {activities.length}
            </motion.span>
          )}
        </CardTitle>
        <Input
          type="text"
          placeholder="🔍 Search activity..."
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
        ) : activities.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <ClipboardList className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
            <p className="text-lg font-semibold text-muted-foreground">No recent activity</p>
            <p className="text-sm text-muted-foreground mt-1">Activity will appear here as tasks are performed</p>
          </motion.div>
        ) : (
          <div className="overflow-x-auto rounded-lg">
            <table className="min-w-full text-sm" aria-label="Recent Activity">
              <thead>
                <tr className="border-b-2 border-primary/20">
                  <th className="px-3 py-3 text-left font-bold">Date</th>
                  <th className="px-3 py-3 text-left font-bold">Action</th>
                  <th className="px-3 py-3 text-left font-bold">Details</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence mode="popLayout">
                  {activities.map((item: ActivityItem, idx: number) => (
                    <motion.tr
                      key={`${item.date}-${idx}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: idx * 0.05 }}
                      className="border-b hover:bg-primary/5 transition-colors"
                    >
                      <td className="px-3 py-3 font-medium">{formatDate(item.date)}</td>
                      <td className="px-3 py-3">
                        <span className="px-2 py-1 bg-primary/10 rounded-md text-xs font-semibold">
                          {item.action}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-muted-foreground">{item.details}</td>
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

const StockClerkDashboard = ({ user }: { user: User }) => {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 300);
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useQuery({
    queryKey: ['stockClerkStats'],
    queryFn: async () => {
      const [products, stocktakes, discrepancies] = await Promise.all([
        apiFetch('/api/products'),
        apiFetch('/api/stocktakes'),
        apiFetch('/api/stocktakes/discrepancies'),
      ]);
      const now = new Date();
      const thisMonth = now.getMonth();
      const thisYear = now.getFullYear();
      const stocktakesThisMonth = stocktakes.filter((s: any) => {
        const d = new Date(s.createdAt);
        return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
      });
      const recentActivity = [
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
      ]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      return {
        inventoryCount: products.length,
        stocktakesThisMonth: stocktakesThisMonth.length,
        discrepancyCount: discrepancies.length,
        recentActivity,
      };
    },
  });

  const filteredActivity = useMemo(() => {
    if (!data) return [];
    return data.recentActivity.filter((item: ActivityItem) =>
      item.action.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      item.details.toLowerCase().includes(debouncedSearch.toLowerCase())
    );
  }, [data, debouncedSearch]);

  const totalPages = Math.max(1, Math.ceil(filteredActivity.length / PAGE_SIZE));
  const paginatedActivity = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredActivity.slice(start, start + PAGE_SIZE);
  }, [filteredActivity, page]);

  const quickActions = [
    {
      label: 'Record Incoming Goods',
      onClick: () => router.push('/dashboard/inventory'),
      icon: Package
    },
    {
      label: 'Perform Stocktake',
      variant: 'outline' as const,
      onClick: () => router.push('/dashboard/stocktake'),
      icon: ClipboardList
    },
    {
      label: 'Correct Discrepancy',
      variant: 'outline' as const,
      onClick: () => router.push('/dashboard/stocktake?tab=discrepancies'),
      icon: AlertTriangle
    }
  ];

  return (
    <div className="flex flex-1 flex-col relative">
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
          <p className="text-muted-foreground text-sm font-medium">Stock Clerk Dashboard</p>
        </div>
      </motion.div>

      <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
        <QuickActions actions={quickActions} />
        {error && <ErrorAlert error={error.message || String(error)} />}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <StatCard
            title="Inventory Items"
            value={data?.inventoryCount || 0}
            description="Total items in inventory"
            icon={Package}
            iconColor="text-blue-500"
            loading={isLoading}
            index={0}
          />
          <StatCard
            title="Stocktakes This Month"
            value={data?.stocktakesThisMonth || 0}
            description="Stocktakes performed"
            icon={ClipboardList}
            iconColor="text-green-500"
            loading={isLoading}
            index={1}
          />
          <StatCard
            title="Discrepancies"
            value={data?.discrepancyCount || 0}
            description="Unresolved discrepancies"
            icon={AlertTriangle}
            iconColor="text-yellow-500"
            loading={isLoading}
            index={2}
          />
        </div>

        <RecentActivityTable
          activities={paginatedActivity}
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

export default StockClerkDashboard;