import { Plus, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"

export function StocktakeHeader() {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Stocktake</h1>
        <p className="text-muted-foreground">Conduct stock audits and manage discrepancies.</p>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button variant="outline">
          <FileText className="mr-2 h-4 w-4" />
          View History
        </Button>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Start New Stocktake
        </Button>
      </div>
    </div>
  )
}
