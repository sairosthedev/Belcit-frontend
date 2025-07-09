"use client"

import { useState, useEffect } from "react"
import { Search, Save, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { apiFetch } from "@/lib/api"

export function StocktakeForm() {
  const [stocktakeItems, setStocktakeItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const { toast } = require("@/hooks/use-toast").useToast();

  // Fetch products from backend
  useEffect(() => {
    setLoading(true)
    apiFetch("/api/products")
      .then(data => setStocktakeItems(data.map((p: any) => ({
        id: p._id || p.id,
        name: p.name,
        sku: p.barcode,
        expectedStock: p.stock,
        actualStock: p.stock,
        discrepancy: 0,
        notes: "",
      }))))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const updateActualStock = (id: string, actualStock: number) => {
    setStocktakeItems(
      stocktakeItems.map((item) =>
        item.id === id
          ? {
              ...item,
              actualStock,
              discrepancy: actualStock - item.expectedStock,
            }
          : item,
      ),
    )
  }

  const updateNotes = (id: string, notes: string) => {
    setStocktakeItems(stocktakeItems.map((item) => (item.id === id ? { ...item, notes } : item)))
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      for (const item of stocktakeItems) {
        await apiFetch("/api/stocktakes", {
          method: "POST",
          body: JSON.stringify({
            productId: item.id,
            counted: item.actualStock,
            countedBy: null, // TODO: set current user ID
            reason: item.discrepancy !== 0 ? item.notes : undefined,
          }),
        })
      }
      toast({ title: "Stocktake submitted!" })
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    } finally {
      setSubmitting(false)
    }
  }

  const totalDiscrepancies = stocktakeItems.filter((item) => item.discrepancy !== 0).length

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading products...</div>
  if (error) return <div className="p-8 text-center text-destructive">{error}</div>

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Items Counted</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stocktakeItems.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Discrepancies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{totalDiscrepancies}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="outline">In Progress</Badge>
          </CardContent>
        </Card>
      </div>

      {totalDiscrepancies > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{totalDiscrepancies} item(s) have discrepancies that need to be reviewed.</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Stock Count</CardTitle>
          <CardDescription>Enter the actual stock count for each item</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Search products by name or SKU..." className="pl-8" />
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Expected</TableHead>
                <TableHead>Actual Count</TableHead>
                <TableHead>Discrepancy</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stocktakeItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.sku}</TableCell>
                  <TableCell>{item.expectedStock}</TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={item.actualStock}
                      onChange={(e) => updateActualStock(item.id, Number.parseInt(e.target.value) || 0)}
                      className="w-20"
                    />
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={item.discrepancy === 0 ? "default" : item.discrepancy > 0 ? "outline" : "destructive"}
                    >
                      {item.discrepancy > 0 ? "+" : ""}
                      {item.discrepancy}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Input
                      placeholder="Add notes..."
                      value={item.notes}
                      onChange={(e) => updateNotes(item.id, e.target.value)}
                      className="w-40"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="mt-6 flex justify-end space-x-2">
            <Button variant="outline" disabled={submitting}>Save Draft</Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              <Save className="mr-2 h-4 w-4" />
              {submitting ? "Submitting..." : "Complete Stocktake"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
