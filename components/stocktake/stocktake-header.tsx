import { Plus, FileText, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export function StocktakeHeader({ tab, setTab, onStartNew, onViewHistory }: { tab: string, setTab: (tab: string) => void, onStartNew: () => void, onViewHistory: () => void }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Stocktake</h1>
        <p className="text-muted-foreground">Conduct stock audits and manage discrepancies.</p>
        <div className="mt-2 flex gap-2">
          <Button variant={tab === "stocktake" ? "default" : "outline"} onClick={() => setTab("stocktake")}>Stocktake</Button>
          <Button variant={tab === "discrepancies" ? "default" : "outline"} onClick={() => setTab("discrepancies")}>Discrepancies <AlertTriangle className="ml-1 h-4 w-4 text-yellow-500" /></Button>
        </div>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button variant="outline" onClick={onViewHistory}>
          <FileText className="mr-2 h-4 w-4" />
          View History
        </Button>
        <Button onClick={onStartNew}>
          <Plus className="mr-2 h-4 w-4" />
          Start New Stocktake
        </Button>
      </div>
    </div>
  )
}
