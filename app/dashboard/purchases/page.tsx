"use client";

import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { PurchasesHeader } from "@/components/purchases/purchases-header"
import { PurchasesTable } from "@/components/purchases/purchases-table"
import { DashboardPageWrapper } from "@/components/dashboard/dashboard-page-wrapper"
import { useTouch } from "@/contexts/touch-context"

export default function PurchasesPage() {
  const { isSmallScreen } = useTouch();
  
  return (
    <>
      <header className={`flex ${isSmallScreen ? 'h-14' : 'h-16'} shrink-0 items-center gap-2 border-b ${isSmallScreen ? 'px-2' : 'px-4'}`}>
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <h1 className={`${isSmallScreen ? 'text-base' : 'text-lg'} font-semibold`}>Purchases</h1>
      </header>
      <DashboardPageWrapper>
        <PurchasesHeader />
        <PurchasesTable />
      </DashboardPageWrapper>
    </>
  )
}
