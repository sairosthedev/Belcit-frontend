"use client"

import { useState, useEffect } from "react"
import { MoreHorizontal, ArrowUpDown, Edit, Trash2, Package } from "lucide-react"
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
import { apiFetch } from "@/lib/api"
import { AddProductModal } from "./add-product-modal"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"

export function ProductsTable({ refreshKey, search }: { refreshKey?: number, search?: string }) {
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<any | null>(null);

  // Fetch products and categories
  const fetchData = () => {
    setLoading(true)
    setError(null)
    Promise.all([
      apiFetch("/api/products"),
      apiFetch("/api/categories")
    ])
      .then(([products, cats]) => {
        setProducts(products)
        setCategories(cats)
        toast.success("Products loaded", { duration: 1500 })
      })
      .catch(err => {
        setError(err.message)
        toast.error("Failed to load products", { duration: 2000 })
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey])

  // Map backend product to include sku and status for table display
  const mapped = products.map(p => ({
    ...p,
    sku: p.barcode,
    status:
      p.stock === 0
        ? "Out of Stock"
        : p.stock <= (p.minStock || 0)
          ? "Low Stock"
          : "In Stock",
  }));

  // Filter by search, selected category, and status
  const filtered = mapped.filter(p => {
    const matchesSearch = !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.barcode || "").toLowerCase().includes(search.toLowerCase());
    const catName = typeof p.category === 'object' ? p.category?.name : p.category;
    const matchesCategory = selectedCategory === "all" || catName === selectedCategory;
    const matchesStatus = selectedStatus === "all" ||
      (selectedStatus === "in-stock" && p.status === "In Stock") ||
      (selectedStatus === "low-stock" && p.status === "Low Stock") ||
      (selectedStatus === "out-of-stock" && p.status === "Out of Stock");
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Pagination
  const total = filtered.length;
  const totalPages = Math.ceil(total / pageSize);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  // Handlers
  const handleRetry = () => fetchData();
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) setPage(newPage);
  };
  const handlePageSizeChange = (val: string) => {
    setPageSize(Number(val));
    setPage(1);
  };

  useEffect(() => { setPage(1); }, [selectedCategory, selectedStatus, search]);

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
          <Button onClick={handleRetry} variant="outline">Retry</Button>
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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-between p-4 border-b-2 border-primary/10"
          >
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
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-[180px] border-2">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="in-stock">✅ In Stock</SelectItem>
                  <SelectItem value="low-stock">⚠️ Low Stock</SelectItem>
                  <SelectItem value="out-of-stock">❌ Out of Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Select value={String(pageSize)} onValueChange={handlePageSizeChange}>
                <SelectTrigger className="w-[80px] border-2">
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
          </motion.div>

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
                  <TableHead className="font-bold">Price</TableHead>
                  <TableHead className="font-bold">Stock</TableHead>
                  <TableHead className="font-bold">Status</TableHead>
                  <TableHead className="text-right font-bold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence mode="popLayout">
                  {paginated.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12">
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                        >
                          <Package className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
                          <p className="text-lg font-semibold text-muted-foreground">No products found</p>
                          <p className="text-sm text-muted-foreground mt-1">Try adjusting your filters</p>
                        </motion.div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginated.map((product, idx) => (
                      <motion.tr
                        key={product._id || product.id || product.barcode || idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: idx * 0.03 }}
                        className="border-b hover:bg-primary/5 transition-colors"
                      >
                        <TableCell className="font-semibold">{product.name}</TableCell>
                        <TableCell className="font-mono text-sm text-muted-foreground">{product.sku}</TableCell>
                        <TableCell>
                          <span className="px-2 py-1 bg-primary/10 rounded-md text-xs font-medium">
                            {typeof product.category === 'object' ? product.category?.name : product.category}
                          </span>
                        </TableCell>
                        <TableCell className="font-bold text-primary">${product.price.toFixed(2)}</TableCell>
                        <TableCell>
                          <span className={`font-bold ${product.stock < 10 ? 'text-red-500' : 'text-green-600'}`}>
                            {product.stock}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              product.status === "In Stock"
                                ? "default"
                                : product.status === "Low Stock"
                                  ? "outline"
                                  : "destructive"
                            }
                            className="font-semibold"
                          >
                            {product.status}
                          </Badge>
                        </TableCell>
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
                              <DropdownMenuItem
                                onClick={() => { setEditProduct(product); setEditModalOpen(true); }}
                                className="cursor-pointer"
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600 cursor-pointer">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
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

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-between space-x-2 p-4 border-t-2 border-primary/10"
          >
            <div className="text-sm font-medium text-muted-foreground">
              Page <span className="text-primary font-bold">{page}</span> of {totalPages} ({total} products)
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="border-2"
              >
                ← Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages || totalPages === 0}
                className="border-2"
              >
                Next →
              </Button>
            </div>
          </motion.div>

          <AddProductModal
            open={editModalOpen}
            onOpenChange={(open) => { setEditModalOpen(open); if (!open) setEditProduct(null); }}
            initialData={editProduct}
            mode="edit"
            onSuccess={fetchData}
          />
        </CardContent>
      </Card>
    </motion.div>
  )
}
