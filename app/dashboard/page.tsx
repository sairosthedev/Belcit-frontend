"use client";

import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardCards } from "@/components/dashboard/dashboard-cards"
import { RecentSales } from "@/components/dashboard/recent-sales"
import { StockAlerts } from "@/components/dashboard/stock-alerts"
import { TopSellingProducts } from "@/components/dashboard/top-selling-products"
import RequireRole from "@/components/RequireRole";

export default function DashboardPage() {
  return (
    <RequireRole roles={['superAdmin', 'accountant', 'cpuOfficer']}>
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
  )
}
