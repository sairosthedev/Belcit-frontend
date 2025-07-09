import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { POSSystem } from "@/components/sales/pos-system"

export default function SalesPage() {
  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
      </header>
      <div className="flex flex-col gap-6 p-6">
        <POSSystem />
      </div>
    </>
  )
}
