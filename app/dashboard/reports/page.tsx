"use client"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { ReportsHeader } from "@/components/reports/reports-header"
import { ReportsCharts } from "@/components/reports/reports-charts"
import { DashboardPageWrapper } from "@/components/dashboard/dashboard-page-wrapper"
import { useTouch } from "@/contexts/touch-context"
import { useState } from "react"

export default function ReportsPage() {
  const [period, setPeriod] = useState("7days")
  const { isSmallScreen } = useTouch();
  
  return (
    <>
      <header className={`flex ${isSmallScreen ? 'h-14' : 'h-16'} shrink-0 items-center gap-2 border-b ${isSmallScreen ? 'px-2' : 'px-4'}`}>
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <h1 className={`${isSmallScreen ? 'text-base' : 'text-lg'} font-semibold`}>Reports</h1>
      </header>
      <DashboardPageWrapper>
        <ReportsHeader period={period} onPeriodChange={setPeriod} />
        <ReportsCharts period={period} />
      </DashboardPageWrapper>
    </>
  )
}
