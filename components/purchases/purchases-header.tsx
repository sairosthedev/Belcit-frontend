import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function PurchasesHeader() {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Purchases</h1>
        <p className="text-muted-foreground">Manage supplier orders and stock receipts.</p>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input placeholder="Search purchases..." className="sm:w-[250px]" />
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Purchase Order
        </Button>
      </div>
    </div>
  )
}
