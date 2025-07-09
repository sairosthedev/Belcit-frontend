"use client"

import { useState, useEffect } from "react"
import { MoreHorizontal, ArrowUpDown, Edit, Trash2 } from "lucide-react"
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
import { apiFetch } from "@/lib/api"

export function ProductsTable({ refreshKey, search }: { refreshKey?: number, search?: string }) {
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

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
      })
      .catch(err => setError(err.message))
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
    // Robust category check (support object or string)
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

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading products...</div>
  if (error) return <div className="p-8 text-center text-destructive">{error} <Button onClick={handleRetry} variant="outline" size="sm">Retry</Button></div>

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
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
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
            <Select value={String(pageSize)} onValueChange={handlePageSizeChange}>
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
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">No products found.</TableCell>
              </TableRow>
            ) : (
              paginated.map((product, idx) => (
                <TableRow key={product._id || product.id || product.barcode || idx}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.sku}</TableCell>
                  <TableCell>{typeof product.category === 'object' ? product.category?.name : product.category}</TableCell>
                  <TableCell>${product.price.toFixed(2)}</TableCell>
                  <TableCell>{product.stock}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        product.status === "In Stock"
                          ? "default"
                          : product.status === "Low Stock"
                            ? "outline"
                            : "destructive"
                      }
                    >
                      {product.status}
                    </Badge>
                  </TableCell>
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
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <div className="flex items-center justify-between space-x-2 p-4">
          <div className="text-sm text-muted-foreground">
            Page {page} of {totalPages} ({total} products)
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => handlePageChange(page - 1)} disabled={page === 1}>
              Previous
            </Button>
            <Button variant="outline" size="sm" onClick={() => handlePageChange(page + 1)} disabled={page === totalPages || totalPages === 0}>
              Next
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
