"use client"

import { useState, useEffect } from "react"
import { MoreHorizontal, ArrowUpDown, ArrowUp, ArrowDown, History, Box } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { apiFetch } from "@/lib/api"
import { motion, AnimatePresence } from "framer-motion"
import { toast as sonnerToast } from "sonner"

function StockInModal({ open, onOpenChange, product, onStockIn }: { open: boolean, onOpenChange: (open: boolean) => void, product: any, onStockIn: (qty: number, notes: string) => void }) {
  const [qty, setQty] = useState(1)
  const [notes, setNotes] = useState("")
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-background rounded-xl p-6 w-full max-w-sm shadow-2xl border-2"
          >
            <h2 className="text-xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Stock In: {product?.name}
            </h2>
            <Input type="number" min={1} value={qty} onChange={e => setQty(Number(e.target.value))} className="mb-3 border-2" placeholder="Quantity" />
            <Input value={notes} onChange={e => setNotes(e.target.value)} className="mb-4 border-2" placeholder="Notes (optional)" />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => onOpenChange(false)} className="border-2">Cancel</Button>
              <Button onClick={() => { onStockIn(qty, notes); onOpenChange(false); }} className="bg-gradient-to-r from-purple-600 to-blue-600">Stock In</Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function StockOutModal({ open, onOpenChange, product, onStockOut }: { open: boolean, onOpenChange: (open: boolean) => void, product: any, onStockOut: (qty: number, notes: string) => void }) {
  const [qty, setQty] = useState(1)
  const [notes, setNotes] = useState("")
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-background rounded-xl p-6 w-full max-w-sm shadow-2xl border-2"
          >
            <h2 className="text-xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Stock Out: {product?.name}
            </h2>
            <Input type="number" min={1} value={qty} onChange={e => setQty(Number(e.target.value))} className="mb-3 border-2" placeholder="Quantity" />
            <Input value={notes} onChange={e => setNotes(e.target.value)} className="mb-4 border-2" placeholder="Notes (optional)" />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => onOpenChange(false)} className="border-2">Cancel</Button>
              <Button onClick={() => { onStockOut(qty, notes); onOpenChange(false); }} className="bg-gradient-to-r from-purple-600 to-blue-600">Stock Out</Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function StockAdjustModal({ open, onOpenChange, product, onAdjust }: { open: boolean, onOpenChange: (open: boolean) => void, product: any, onAdjust: (qty: number, notes: string) => void }) {
  const [qty, setQty] = useState(product?.currentStock || 0)
  const [notes, setNotes] = useState("")
  useEffect(() => {
    setQty(product?.currentStock || 0)
  }, [product])
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-background rounded-xl p-6 w-full max-w-sm shadow-2xl border-2"
          >
            <h2 className="text-xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Adjust Stock: {product?.name}
            </h2>
            <Input type="number" min={0} value={qty} onChange={e => setQty(Number(e.target.value))} className="mb-3 border-2" placeholder="New Stock" />
            <Input value={notes} onChange={e => setNotes(e.target.value)} className="mb-4 border-2" placeholder="Reason/Notes (optional)" />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => onOpenChange(false)} className="border-2">Cancel</Button>
              <Button onClick={() => { onAdjust(qty, notes); onOpenChange(false); }} className="bg-gradient-to-r from-purple-600 to-blue-600">Adjust</Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function InventoryTable() {
  const [inventory, setInventory] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stockInProduct, setStockInProduct] = useState(null)
  const [stockOutProduct, setStockOutProduct] = useState(null)
  const [stockAdjustProduct, setStockAdjustProduct] = useState(null)
  const { toast } = useToast()

  // Fetch products and categories from backend
  useEffect(() => {
    setLoading(true)
    Promise.all([
      apiFetch("/api/products"),
      apiFetch("/api/categories")
    ])
      .then(([products, cats]) => {
        setInventory(products)
        setCategories(cats)
        sonnerToast.success("Inventory loaded", { duration: 1500 })
      })
      .catch(err => {
        setError(err.message)
        sonnerToast.error("Failed to load inventory", { duration: 2000 })
      })
      .finally(() => setLoading(false))
  }, [])

  const refreshProducts = () => {
    setLoading(true)
    apiFetch("/api/products")
      .then(data => setInventory(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }

  const handleStockIn = async (product: any, qty: number, notes: string) => {
    try {
      await apiFetch("/api/inventory/stock-in", {
        method: "POST",
        body: JSON.stringify({ productId: product._id || product.id, quantity: qty, reason: notes }),
      })
      sonnerToast.success(`Stocked in ${qty} units of ${product.name}`, { duration: 2000 })
      refreshProducts()
    } catch (err: any) {
      sonnerToast.error(err.message || "Stock in failed", { duration: 2000 })
    }
  }

  const handleStockOut = async (product: any, qty: number, notes: string) => {
    try {
      await apiFetch("/api/inventory/stock-out", {
        method: "POST",
        body: JSON.stringify({ productId: product._id || product.id, quantity: qty, reason: notes }),
      })
      sonnerToast.success(`Stocked out ${qty} units of ${product.name}`, { duration: 2000 })
      refreshProducts()
    } catch (err: any) {
      sonnerToast.error(err.message || "Stock out failed", { duration: 2000 })
    }
  }

  const handleStockAdjust = async (product: any, qty: number, notes: string) => {
    try {
      await apiFetch("/api/inventory/adjust", {
        method: "POST",
        body: JSON.stringify({ productId: product._id || product.id, quantity: qty, reason: notes }),
      })
      sonnerToast.success(`Stock adjusted to ${qty} units for ${product.name}`, { duration: 2000 })
      refreshProducts()
    } catch (err: any) {
      sonnerToast.error(err.message || "Adjustment failed", { duration: 2000 })
    }
  }

  // Filter inventory by selected category
  const filteredInventory: any[] = selectedCategory === "all"
    ? inventory
    : inventory.filter((p: any) => p.category === selectedCategory)

  // Map backend product fields to table fields
  const mappedInventory: any[] = filteredInventory.map((item: any) => ({
    ...item,
    sku: item.barcode,
    currentStock: item.stock,
    reorderLevel: item.minStock,
    status:
      item.stock === 0
        ? "Out of Stock"
        : item.stock <= (item.minStock || 0)
          ? "Low Stock"
          : "In Stock",
    lastUpdated: item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : "",
  }))

  if (loading) {
    return (
      <Card className="border-2">
        <CardContent className="p-6">
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="border-2 border-red-500/30">
        <CardContent className="p-8 text-center">
          <p className="text-red-600 mb-4">⚠️ {error}</p>
          <Button onClick={refreshProducts} variant="outline">Retry</Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-2 hover:border-primary/30 transition-all duration-300 shadow-xl bg-gradient-to-br from-background via-background to-primary/5">
        <CardContent className="p-0">
          <div className="flex items-center justify-between p-4 border-b-2 border-primary/10">
            <div className="flex flex-1 items-center space-x-2">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[180px] border-2">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat._id} value={cat.name}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b-2">
                  <TableHead className="font-bold">
                    <Button variant="ghost" className="p-0 hover:bg-transparent font-bold">
                      Product Name
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead className="font-bold">SKU</TableHead>
                  <TableHead className="font-bold">Category</TableHead>
                  <TableHead className="font-bold">Current Stock</TableHead>
                  <TableHead className="font-bold">Reorder Level</TableHead>
                  <TableHead className="font-bold">Status</TableHead>
                  <TableHead className="font-bold">Last Updated</TableHead>
                  <TableHead className="text-right font-bold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence mode="popLayout">
                  {mappedInventory.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-12">
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                        >
                          <Box className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
                          <p className="text-lg font-semibold text-muted-foreground">No inventory items</p>
                          <p className="text-sm text-muted-foreground mt-1">Stock will appear here as products are added</p>
                        </motion.div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    mappedInventory.map((item, idx) => (
                      <motion.tr
                        key={item._id || item.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: idx * 0.03 }}
                        className="border-b hover:bg-primary/5 transition-colors"
                      >
                        <TableCell className="font-semibold">{item.name}</TableCell>
                        <TableCell className="font-mono text-sm text-muted-foreground">{item.sku}</TableCell>
                        <TableCell>
                          <span className="px-2 py-1 bg-primary/10 rounded-md text-xs font-medium">
                            {item.category}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={`font-bold ${item.currentStock < 10 ? 'text-red-500' : 'text-green-600'}`}>
                            {item.currentStock}
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{item.reorderLevel}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              item.status === "In Stock" ? "default" : item.status === "Low Stock" ? "outline" : "destructive"
                            }
                            className="font-semibold"
                          >
                            {item.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">{item.lastUpdated}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-primary/10">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="border-2">
                              <DropdownMenuLabel className="font-bold">Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => setStockInProduct(item)} className="cursor-pointer">
                                <ArrowUp className="mr-2 h-4 w-4 text-green-500" />
                                Stock In
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setStockOutProduct(item)} className="cursor-pointer">
                                <ArrowDown className="mr-2 h-4 w-4 text-orange-500" />
                                Stock Out
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setStockAdjustProduct(item)} className="cursor-pointer">
                                <ArrowUpDown className="mr-2 h-4 w-4" />
                                Adjust Stock
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="cursor-pointer">
                                <History className="mr-2 h-4 w-4" />
                                View History
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </motion.tr>
                    ))
                  )}
                </AnimatePresence>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <StockInModal
        open={!!stockInProduct}
        onOpenChange={open => !open && setStockInProduct(null)}
        product={stockInProduct}
        onStockIn={(qty, notes) => handleStockIn(stockInProduct, qty, notes)}
      />
      <StockOutModal
        open={!!stockOutProduct}
        onOpenChange={open => !open && setStockOutProduct(null)}
        product={stockOutProduct}
        onStockOut={(qty, notes) => handleStockOut(stockOutProduct, qty, notes)}
      />
      <StockAdjustModal
        open={!!stockAdjustProduct}
        onOpenChange={open => !open && setStockAdjustProduct(null)}
        product={stockAdjustProduct}
        onAdjust={(qty, notes) => handleStockAdjust(stockAdjustProduct, qty, notes)}
      />
    </motion.div>
  )
}
