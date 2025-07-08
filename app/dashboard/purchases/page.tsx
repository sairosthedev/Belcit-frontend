import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { PurchasesHeader } from "@/components/purchases/purchases-header"
import { PurchasesTable } from "@/components/purchases/purchases-table"

export default function PurchasesPage() {
  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <h1 className="text-lg font-semibold">Purchases</h1>
      </header>
      <div className="flex flex-col gap-6 p-6">
        <PurchasesHeader />
        <PurchasesTable />
      </div>
    </>
  )
}
