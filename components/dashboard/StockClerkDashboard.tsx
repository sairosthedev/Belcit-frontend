import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Package, ClipboardList, AlertTriangle } from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { apiFetch } from '@/lib/api';

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

const RecentActivityTable = ({ activities, loading, page, setPage, totalPages, search, setSearch }: any) => (
  <Card className="rounded-xl transition-shadow hover:shadow-lg focus-within:shadow-lg">
    <CardHeader>
      <CardTitle>Recent Activity</CardTitle>
      <input
        type="text"
        placeholder="Search activity..."
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
              {activities.map((item: ActivityItem, idx: number) => (
                <tr key={idx} tabIndex={0} className="hover:bg-accent/40 focus:bg-accent/60 transition-colors">
                  <td className="px-2 py-1">{formatDate(item.date)}</td>
                  <td className="px-2 py-1">{item.action}</td>
                  <td className="px-2 py-1">{item.details}</td>
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
      onClick: () => router.push('/dashboard/inventory')
    },
    {
      label: 'Perform Stocktake',
      variant: 'outline' as const,
      onClick: () => router.push('/dashboard/stocktake')
    },
    {
      label: 'Correct Discrepancy',
      variant: 'outline' as const,
      onClick: () => router.push('/dashboard/stocktake?tab=discrepancies')
    }
  ];

  return (
    <div className="flex flex-1 flex-col">
      <DashboardHeader />
      <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
        <QuickActions actions={quickActions} />
        {error && <ErrorAlert error={error.message || String(error)} />}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <StatCard
            title="Inventory Items"
            value={data?.inventoryCount || 0}
            description="Total items in inventory"
            icon={Package}
            iconColor="text-blue-500"
            loading={isLoading}
          />
          <StatCard
            title="Stocktakes This Month"
            value={data?.stocktakesThisMonth || 0}
            description="Stocktakes performed"
            icon={ClipboardList}
            iconColor="text-green-500"
            loading={isLoading}
          />
          <StatCard
            title="Discrepancies"
            value={data?.discrepancyCount || 0}
            description="Unresolved discrepancies"
            icon={AlertTriangle}
            iconColor="text-yellow-500"
            loading={isLoading}
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