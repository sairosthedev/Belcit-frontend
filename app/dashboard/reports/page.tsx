import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { ReportsHeader } from "@/components/reports/reports-header"
import { ReportsCharts } from "@/components/reports/reports-charts"

export default function ReportsPage() {
  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <h1 className="text-lg font-semibold">Reports</h1>
      </header>
      <div className="flex flex-col gap-6 p-6">
        <ReportsHeader />
        <ReportsCharts />
      </div>
    </>
  )
}
