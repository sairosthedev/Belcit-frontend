import { useEffect, useState } from "react"
import { TrendingUp, Award } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { apiFetch } from "@/lib/api"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"

export function TopSellingProducts() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [topProducts, setTopProducts] = useState<any[]>([])

  useEffect(() => {
    setLoading(true)
    setError(null)
    // Try to fetch from /api/sales/top-products, fallback to compute from /api/sales
    apiFetch("/api/sales/top-products")
      .then(data => {
        setTopProducts(data)
        toast.success("Top products loaded", { duration: 1500 })
      })
      .catch(async () => {
        try {
          const response = await apiFetch("/api/sales")
          const sales = Array.isArray(response) ? response : (response.sales || [])
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
          toast.success("Top products loaded", { duration: 1500 })
        } catch (err: any) {
          setError("Could not load top selling products.")
          toast.error("Failed to load top products", { duration: 2000 })
        }
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <Card className="border-2">
        <CardContent className="p-6">
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <Card className="border-2 hover:border-primary/30 transition-all duration-300 shadow-xl bg-gradient-to-br from-background via-background to-primary/5">
        <CardHeader className="flex flex-row items-center">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Top Selling Products
            </CardTitle>
            <CardDescription className="font-medium">This week's best performers</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {error ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-600 font-semibold"
            >
              ⚠️ {error}
            </motion.div>
          ) : topProducts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <Award className="mx-auto h-10 w-10 text-muted-foreground/50 mb-2" />
              <p className="text-muted-foreground font-medium">No sales data yet</p>
              <p className="text-sm text-muted-foreground mt-1">Top sellers will appear here</p>
            </motion.div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {topProducts.map((product, idx) => (
                  <motion.div
                    key={product.productId || product.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: idx * 0.08 }}
                    className="space-y-2 p-3 rounded-lg border-2 border-primary/10 bg-primary/5 hover:bg-primary/10 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {idx === 0 && <Award className="h-4 w-4 text-yellow-500" />}
                        <p className="font-semibold">{product.name}</p>
                      </div>
                      <span className="text-sm font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                        {product.sold} sold
                      </span>
                    </div>
                    <motion.div
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ delay: idx * 0.08 + 0.2, duration: 0.5 }}
                      style={{ originX: 0 }}
                    >
                      <Progress value={product.percentage} className="h-2" />
                    </motion.div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
