import { useEffect, useState } from "react"
import { TrendingUp } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { apiFetch } from "@/lib/api"

export function TopSellingProducts() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [topProducts, setTopProducts] = useState<any[]>([])

  useEffect(() => {
    setLoading(true)
    setError(null)
    // Try to fetch from /api/sales/top-products, fallback to compute from /api/sales
    apiFetch("/api/sales/top-products")
      .then(data => setTopProducts(data))
      .catch(async () => {
        try {
          const sales = await apiFetch("/api/sales")
          // Compute top products by count
          const productMap: Record<string, { name: string, sold: number }> = {}
          sales.forEach((sale: any) => {
            (sale.items || []).forEach((item: any) => {
              if (!productMap[item.productId]) {
                productMap[item.productId] = { name: item.name, sold: 0 }
              }
              productMap[item.productId].sold += item.quantity || 1
            })
          })
          const sorted = Object.entries(productMap)
            .map(([id, v]) => ({ id, ...v }))
            .sort((a, b) => b.sold - a.sold)
            .slice(0, 4)
          // Add percentage for progress bar
          const max = sorted[0]?.sold || 1
          setTopProducts(sorted.map(p => ({ ...p, percentage: Math.round((p.sold / max) * 100) })))
        } catch (err: any) {
          setError("Could not load top selling products.")
        }
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <Card>
      <CardHeader className="flex flex-row items-center">
        <div className="flex-1">
          <CardTitle>Top Selling Products</CardTitle>
          <CardDescription>This week's best performers</CardDescription>
        </div>
        <TrendingUp className="h-5 w-5 text-green-500" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-muted-foreground animate-pulse">Loading...</div>
        ) : error ? (
          <div className="text-destructive">{error}</div>
        ) : topProducts.length === 0 ? (
          <div className="text-muted-foreground">No sales data.</div>
        ) : (
          <div className="space-y-4">
            {topProducts.map((product) => (
              <div key={product.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{product.name}</p>
                  <span className="text-sm font-medium">{product.sold} sold</span>
                </div>
                <Progress value={product.percentage} className="h-2" />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
