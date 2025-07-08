import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function InventoryHeader() {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
        <p className="text-muted-foreground">Track and manage your stock levels.</p>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input placeholder="Search inventory..." className="sm:w-[250px]" />
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Stock Adjustment
        </Button>
      </div>
    </div>
  )
}
