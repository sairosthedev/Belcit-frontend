"use client"
import { useState, useEffect } from "react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { StocktakeHeader } from "@/components/stocktake/stocktake-header"
import { StocktakeForm } from "@/components/stocktake/stocktake-form"
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
          <div className="rounded border p-8">
            <h2 className="text-xl font-bold mb-4">Unresolved Discrepancies</h2>
            {loading ? (
              <div className="text-muted-foreground">Loading discrepancies...</div>
            ) : error ? (
              <div className="text-destructive">{error}</div>
            ) : discrepancies.length === 0 ? (
              <div className="text-muted-foreground">No unresolved discrepancies.</div>
            ) : (
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="px-2 py-1 text-left font-medium">Product</th>
                    <th className="px-2 py-1 text-left font-medium">System</th>
                    <th className="px-2 py-1 text-left font-medium">Counted</th>
                    <th className="px-2 py-1 text-left font-medium">Discrepancy</th>
                    <th className="px-2 py-1 text-left font-medium">Notes</th>
                    <th className="px-2 py-1 text-left font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {discrepancies.map(d => (
                    <tr key={d._id} className="border-b">
                      <td className="px-2 py-1">{d.product?.name}</td>
                      <td className="px-2 py-1">{d.system}</td>
                      <td className="px-2 py-1">{d.counted}</td>
                      <td className="px-2 py-1">
                        <Badge variant={d.discrepancy > 0 ? "outline" : "destructive"}>{d.discrepancy > 0 ? "+" : ""}{d.discrepancy}</Badge>
                      </td>
                      <td className="px-2 py-1">{d.reason || d.notes || "-"}</td>
                      <td className="px-2 py-1">
                        <Button size="sm" disabled={!!confirming} onClick={() => handleConfirm(d._id)}>
                          {confirming === d._id ? "Confirming..." : "Confirm"}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
      <Dialog open={showHistory} onOpenChange={setShowHistory}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Stocktake History</DialogTitle>
          </DialogHeader>
          <div className="text-muted-foreground">History view coming soon...</div>
        </DialogContent>
      </Dialog>
    </>
  )
}
