import { useEffect, useState } from "react"
import { AlertTriangle, Package } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { apiFetch } from "@/lib/api"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"

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
        const lowStock = products.filter((item: any) => item.stock <= (item.minStock ?? 5));
        setLowStockItems(lowStock)
        if (lowStock.length > 0) {
          toast.warning(`${lowStock.length} low stock items`, { duration: 2000 })
        }
      })
      .catch(err => {
        setError(err.message)
        toast.error("Failed to load stock alerts", { duration: 2000 })
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <Card className="border-2">
        <CardContent className="p-6">
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
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
      transition={{ delay: 0.3 }}
    >
      <Card className="border-2 hover:border-primary/30 transition-all duration-300 shadow-xl bg-gradient-to-br from-background via-background to-primary/5">
        <CardHeader className="flex flex-row items-center">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Low Stock Alerts
              {lowStockItems.length > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="ml-2 px-2 py-1 bg-amber-500 text-white rounded-full text-xs font-bold"
                >
                  {lowStockItems.length}
                </motion.span>
              )}
            </CardTitle>
            <CardDescription className="font-medium">Products that need restocking</CardDescription>
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
          ) : lowStockItems.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <Package className="mx-auto h-10 w-10 text-green-500/50 mb-2" />
              <p className="text-green-600 font-semibold">✓ All stock levels healthy!</p>
              <p className="text-sm text-muted-foreground mt-1">No items need restocking</p>
            </motion.div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {lowStockItems.map((item, idx) => (
                  <motion.div
                    key={item._id || item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex items-center justify-between gap-4 p-3 rounded-lg border-2 border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.category} • <span className="font-mono">SKU: {item.barcode}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={item.stock <= 5 ? "destructive" : "outline"}
                        className="font-bold"
                      >
                        {item.stock === 0 ? "❌ Out" : `⚠️ ${item.stock} left`}
                      </Badge>
                    </div>
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
