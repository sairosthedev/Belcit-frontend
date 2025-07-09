"use client"

import { useState, useEffect } from "react"
import { MoreHorizontal, ArrowUpDown, ArrowUp, ArrowDown, History } from "lucide-react"
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
import { useToast } from "@/hooks/use-toast"
import { apiFetch } from "@/lib/api"

function StockInModal({ open, onOpenChange, product, onStockIn }: { open: boolean, onOpenChange: (open: boolean) => void, product: any, onStockIn: (qty: number, notes: string) => void }) {
  const [qty, setQty] = useState(1)
  const [notes, setNotes] = useState("")
  return (
    open ? (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div className="bg-background rounded-lg p-6 w-full max-w-sm shadow-lg">
          <h2 className="text-lg font-bold mb-2">Stock In: {product?.name}</h2>
          <input type="number" min={1} value={qty} onChange={e => setQty(Number(e.target.value))} className="mb-2 w-full border rounded px-2 py-1" placeholder="Quantity" />
          <input value={notes} onChange={e => setNotes(e.target.value)} className="mb-2 w-full border rounded px-2 py-1" placeholder="Notes (optional)" />
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={() => { onStockIn(qty, notes); onOpenChange(false); }}>Stock In</Button>
          </div>
        </div>
      </div>
    ) : null
  )
}

function StockOutModal({ open, onOpenChange, product, onStockOut }: { open: boolean, onOpenChange: (open: boolean) => void, product: any, onStockOut: (qty: number, notes: string) => void }) {
  const [qty, setQty] = useState(1)
  const [notes, setNotes] = useState("")
  return (
    open ? (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div className="bg-background rounded-lg p-6 w-full max-w-sm shadow-lg">
          <h2 className="text-lg font-bold mb-2">Stock Out: {product?.name}</h2>
          <input type="number" min={1} value={qty} onChange={e => setQty(Number(e.target.value))} className="mb-2 w-full border rounded px-2 py-1" placeholder="Quantity" />
          <input value={notes} onChange={e => setNotes(e.target.value)} className="mb-2 w-full border rounded px-2 py-1" placeholder="Notes (optional)" />
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={() => { onStockOut(qty, notes); onOpenChange(false); }}>Stock Out</Button>
          </div>
        </div>
      </div>
    ) : null
  )
}

function StockAdjustModal({ open, onOpenChange, product, onAdjust }: { open: boolean, onOpenChange: (open: boolean) => void, product: any, onAdjust: (qty: number, notes: string) => void }) {
  const [qty, setQty] = useState(product?.currentStock || 0)
  const [notes, setNotes] = useState("")
  useEffect(() => {
    setQty(product?.currentStock || 0)
  }, [product])
  return (
    open ? (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div className="bg-background rounded-lg p-6 w-full max-w-sm shadow-lg">
          <h2 className="text-lg font-bold mb-2">Adjust Stock: {product?.name}</h2>
          <input type="number" min={0} value={qty} onChange={e => setQty(Number(e.target.value))} className="mb-2 w-full border rounded px-2 py-1" placeholder="New Stock" />
          <input value={notes} onChange={e => setNotes(e.target.value)} className="mb-2 w-full border rounded px-2 py-1" placeholder="Reason/Notes (optional)" />
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={() => { onAdjust(qty, notes); onOpenChange(false); }}>Adjust</Button>
          </div>
        </div>
      </div>
    ) : null
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
      })
      .catch(err => setError(err.message))
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
      toast({ title: `Stocked in ${qty} units of ${product.name}` })
      refreshProducts()
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    }
  }

  const handleStockOut = async (product: any, qty: number, notes: string) => {
    try {
      await apiFetch("/api/inventory/stock-out", {
        method: "POST",
        body: JSON.stringify({ productId: product._id || product.id, quantity: qty, reason: notes }),
      })
      toast({ title: `Stocked out ${qty} units of ${product.name}` })
      refreshProducts()
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    }
  }

  const handleStockAdjust = async (product: any, qty: number, notes: string) => {
    try {
      await apiFetch("/api/inventory/adjust", {
        method: "POST",
        body: JSON.stringify({ productId: product._id || product.id, quantity: qty, reason: notes }),
      })
      toast({ title: `Stock adjusted to ${qty} units for ${product.name}` })
      refreshProducts()
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" })
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

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading inventory...</div>
  if (error) return <div className="p-8 text-center text-destructive">{error}</div>

  return (
    <Card>
      <CardContent className="p-0">
        <div className="flex items-center justify-between p-4">
          <div className="flex flex-1 items-center space-x-2">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat._id} value={cat.name}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select defaultValue="all">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="in-stock">In Stock</SelectItem>
                <SelectItem value="low-stock">Low Stock</SelectItem>
                <SelectItem value="out-of-stock">Out of Stock</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <Select defaultValue="20">
              <SelectTrigger className="w-[80px]">
                <SelectValue placeholder="20" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button variant="ghost" className="p-0 hover:bg-transparent">
                  Product Name
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Current Stock</TableHead>
              <TableHead>Reorder Level</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mappedInventory.map((item) => (
              <TableRow key={item._id || item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>{item.sku}</TableCell>
                <TableCell>{item.category}</TableCell>
                <TableCell>{item.currentStock}</TableCell>
                <TableCell>{item.reorderLevel}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      item.status === "In Stock" ? "default" : item.status === "Low Stock" ? "outline" : "destructive"
                    }
                  >
                    {item.status}
                  </Badge>
                </TableCell>
                <TableCell>{item.lastUpdated}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => setStockInProduct(item)}>
                        <ArrowUp className="mr-2 h-4 w-4" />
                        Stock In
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setStockOutProduct(item)}>
                        <ArrowDown className="mr-2 h-4 w-4" />
                        Stock Out
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setStockAdjustProduct(item)}>
                        <ArrowUpDown className="mr-2 h-4 w-4" />
                        Adjust Stock
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <History className="mr-2 h-4 w-4" />
                        View History
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="flex items-center justify-end space-x-2 p-4">
          <Button variant="outline" size="sm">
            Previous
          </Button>
          <Button variant="outline" size="sm">
            Next
          </Button>
        </div>
      </CardContent>
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
    </Card>
  )
}

const inventoryData = [
  {
    id: 1,
    name: "Fresh Milk 1L",
    sku: "DRY-1001",
    category: "Dairy",
    currentStock: 45,
    reorderLevel: 20,
    status: "In Stock",
    lastUpdated: "2023-07-05",
  },
  {
    id: 2,
    name: "Whole Wheat Bread",
    sku: "BKY-2034",
    category: "Bakery",
    currentStock: 28,
    reorderLevel: 15,
    status: "In Stock",
    lastUpdated: "2023-07-06",
  },
  {
    id: 3,
    name: "Organic Eggs (12pk)",
    sku: "DRY-1087",
    category: "Dairy",
    currentStock: 12,
    reorderLevel: 10,
    status: "Low Stock",
    lastUpdated: "2023-07-06",
  },
  {
    id: 4,
    name: "Premium Coffee Beans",
    sku: "BEV-3045",
    category: "Beverages",
    currentStock: 8,
    reorderLevel: 10,
    status: "Low Stock",
    lastUpdated: "2023-07-04",
  },
  {
    id: 5,
    name: "Chicken Breast (1kg)",
    sku: "MET-4023",
    category: "Meat & Poultry",
    currentStock: 15,
    reorderLevel: 12,
    status: "In Stock",
    lastUpdated: "2023-07-07",
  },
  {
    id: 6,
    name: "Organic Bananas (1kg)",
    sku: "PRD-5012",
    category: "Produce",
    currentStock: 50,
    reorderLevel: 25,
    status: "In Stock",
    lastUpdated: "2023-07-07",
  },
  {
    id: 7,
    name: "Chocolate Chip Cookies",
    sku: "BKY-2089",
    category: "Bakery",
    currentStock: 0,
    reorderLevel: 15,
    status: "Out of Stock",
    lastUpdated: "2023-07-03",
  },
  {
    id: 8,
    name: "Coca Cola 2L",
    sku: "BEV-3078",
    category: "Beverages",
    currentStock: 60,
    reorderLevel: 30,
    status: "In Stock",
    lastUpdated: "2023-07-05",
  },
]
