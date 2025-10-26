"use client"
import { useState, useEffect } from "react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { StocktakeHeader } from "@/components/stocktake/stocktake-header"
import { StocktakeForm } from "@/components/stocktake/stocktake-form"
import { StocktakeHistory } from "@/components/stocktake/stocktake-history"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { apiFetch } from "@/lib/api"

export default function StocktakePage() {
  const [tab, setTab] = useState("stocktake")
  const [showHistory, setShowHistory] = useState(false)
  const [resetKey, setResetKey] = useState(0)
  const [discrepancies, setDiscrepancies] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirming, setConfirming] = useState<string | null>(null)
  const { toast } = require("@/hooks/use-toast").useToast();

  // Fetch discrepancies when tab is active
  useEffect(() => {
    if (tab === "discrepancies") {
      setLoading(true)
      apiFetch("/api/stocktakes/discrepancies")
        .then(data => setDiscrepancies(data))
        .catch(err => setError(err.message))
        .finally(() => setLoading(false))
    }
  }, [tab, resetKey])

  const handleConfirm = async (id: string) => {
    setConfirming(id)
    try {
      await apiFetch(`/api/stocktakes/${id}/confirm`, { method: "POST" })
      toast({ title: "Discrepancy confirmed and stock adjusted." })
      setDiscrepancies(discrepancies.filter(d => d._id !== id))
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    } finally {
      setConfirming(null)
    }
  }

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <h1 className="text-lg font-semibold">Stocktake</h1>
      </header>
      <div className="flex flex-col gap-6 p-6">
        <StocktakeHeader
          tab={tab}
          setTab={setTab}
          onStartNew={() => setResetKey(k => k + 1)}
          onViewHistory={() => setShowHistory(true)}
        />
        {tab === "stocktake" ? (
          <StocktakeForm key={resetKey} />
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">Unresolved Discrepancies</h2>
                <p className="text-muted-foreground">Review and confirm stock adjustments</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-amber-600">
                  {discrepancies.length} pending
                </Badge>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading discrepancies...</div>
            ) : error ? (
              <div className="text-center py-8 text-destructive">{error}</div>
            ) : discrepancies.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-muted-foreground mb-2">No unresolved discrepancies</div>
                <p className="text-sm text-muted-foreground">All stock levels are accurate</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {discrepancies.map(d => (
                  <div key={d._id} className="border rounded-lg p-4 bg-card">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{d.product?.name}</h3>
                          <Badge variant={d.discrepancy > 0 ? "outline" : "destructive"}>
                            {d.discrepancy > 0 ? "+" : ""}{d.discrepancy}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                          <div>System Stock: <span className="font-medium">{d.system}</span></div>
                          <div>Counted: <span className="font-medium">{d.counted}</span></div>
                        </div>
                        {d.reason && (
                          <div className="text-sm">
                            <span className="text-muted-foreground">Reason: </span>
                            <span>{d.reason}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          size="sm" 
                          disabled={!!confirming} 
                          onClick={() => handleConfirm(d._id)}
                        >
                          {confirming === d._id ? "Confirming..." : "Confirm Adjustment"}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      <Dialog open={showHistory} onOpenChange={setShowHistory}>
        <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Stocktake History</DialogTitle>
          </DialogHeader>
          <StocktakeHistory />
        </DialogContent>
      </Dialog>
    </>
  )
}
