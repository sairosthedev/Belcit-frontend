import { useEffect, useState } from "react"
import { AlertTriangle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { apiFetch } from "@/lib/api"

export function StockAlerts() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lowStockItems, setLowStockItems] = useState<any[]>([])

  useEffect(() => {
    setLoading(true)
    setError(null)
    apiFetch("/api/products")
      .then(products => {
        // Filter for low stock: stock <= minStock or stock <= 5
        setLowStockItems(products.filter((item: any) => item.stock <= (item.minStock ?? 5)))
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <Card>
      <CardHeader className="flex flex-row items-center">
        <div className="flex-1">
          <CardTitle>Low Stock Alerts</CardTitle>
          <CardDescription>Products that need restocking</CardDescription>
        </div>
        <AlertTriangle className="h-5 w-5 text-amber-500" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-muted-foreground animate-pulse">Loading...</div>
        ) : error ? (
          <div className="text-destructive">{error}</div>
        ) : lowStockItems.length === 0 ? (
          <div className="text-muted-foreground">No low stock items.</div>
        ) : (
          <div className="space-y-4">
            {lowStockItems.map((item) => (
              <div key={item._id || item.id} className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.category} • SKU: {item.barcode}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={item.stock <= 5 ? "destructive" : "outline"}>{item.stock} left</Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
