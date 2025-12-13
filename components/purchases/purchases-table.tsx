"use client"

import { useEffect, useState } from "react"
import { MoreHorizontal, ArrowUpDown, FileText, Eye, CheckCircle, XCircle, Truck } from "lucide-react"
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"

export function PurchasesTable() {
  const [purchases, setPurchases] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const [total, setTotal] = useState(0)
  const [status, setStatus] = useState('all')
  const [supplier, setSupplier] = useState('all')
  const [suppliers, setSuppliers] = useState<any[]>([])
  const [selectedPO, setSelectedPO] = useState<any | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)

  // Fetch suppliers for filter dropdown
  useEffect(() => {
    apiFetch('/api/vendors')
      .then((data) => setSuppliers(data))
      .catch(() => setSuppliers([]))
  }, [])

  // Fetch purchases
  useEffect(() => {
    setLoading(true)
    setError(null)
    apiFetch(`/api/purchases?page=${page}&limit=${limit}&status=${status}&supplier=${supplier}`)
      .then((res) => {
        setPurchases(res.purchases || [])
        setTotal(res.total || 0)
        toast.success("Purchases loaded", { duration: 1500 })
      })
      .catch(() => {
        setError('Could not load purchases.')
        setPurchases([])
        setTotal(0)
        toast.error("Failed to load purchases", { duration: 2000 })
      })
      .finally(() => setLoading(false))
  }, [page, limit, status, supplier])

  const totalPages = Math.max(1, Math.ceil(total / limit))

  // Action handlers
  const handleReceive = async (id: string) => {
    setLoading(true)
    try {
      await apiFetch(`/api/purchases/${id}/receive`, { method: "POST" })
      toast.success("Purchase marked as received", { duration: 2000 })
      setLoading(false)
    } catch (e) {
      toast.error("Failed to mark as received", { duration: 2000 })
      setLoading(false)
    }
  }

  const handleCancel = async (id: string) => {
    setLoading(true)
    try {
      await apiFetch(`/api/purchases/${id}/cancel`, { method: "POST" })
      toast.success("Purchase order cancelled", { duration: 2000 })
      setLoading(false)
    } catch (e) {
      toast.error("Failed to cancel order", { duration: 2000 })
      setLoading(false)
    }
  }

  // Fetch PO details
  const handleView = async (id: string) => {
    setLoading(true)
    try {
      const po = await apiFetch(`/api/purchases/${id}`)
      setSelectedPO(po)
      setDetailsOpen(true)
    } catch (e) {
      toast.error("Failed to load purchase details", { duration: 2000 })
    } finally {
      setLoading(false)
    }
  }

  if (loading && purchases.length === 0) {
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

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="border-2 hover:border-primary/30 transition-all duration-300 shadow-xl bg-gradient-to-br from-background via-background to-primary/5">
          <CardContent className="p-0">
            <div className="flex items-center justify-between p-4 border-b-2 border-primary/10">
              <div className="flex flex-1 items-center space-x-2">
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="w-[180px] border-2">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="ordered">📦 Ordered</SelectItem>
                    <SelectItem value="received">✅ Received</SelectItem>
                    <SelectItem value="cancelled">❌ Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={supplier} onValueChange={setSupplier}>
                  <SelectTrigger className="w-[180px] border-2">
                    <SelectValue placeholder="Filter by supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Suppliers</SelectItem>
                    {suppliers.map((s: any) => (
                      <SelectItem key={s._id} value={s._id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Select value={String(limit)} onValueChange={v => { setLimit(Number(v)); setPage(1); }}>
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
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b-2">
                    <TableHead className="font-bold">
                      <Button variant="ghost" className="p-0 hover:bg-transparent font-bold">
                        PO Number
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead className="font-bold">Supplier</TableHead>
                    <TableHead className="font-bold">Date Ordered</TableHead>
                    <TableHead className="font-bold">Expected Delivery</TableHead>
                    <TableHead className="font-bold">Total Amount</TableHead>
                    <TableHead className="font-bold">Status</TableHead>
                    <TableHead className="text-right font-bold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence mode="popLayout">
                    {error ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-12">
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                          >
                            <p className="text-red-600 mb-4">⚠️ {error}</p>
                          </motion.div>
                        </TableCell>
                      </TableRow>
                    ) : purchases.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-12">
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                          >
                            <Truck className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
                            <p className="text-lg font-semibold text-muted-foreground">No purchases found</p>
                            <p className="text-sm text-muted-foreground mt-1">Purchase orders will appear here</p>
                          </motion.div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      purchases.map((purchase, idx) => (
                        <motion.tr
                          key={purchase._id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ delay: idx * 0.03 }}
                          className="border-b hover:bg-primary/5 transition-colors"
                        >
                          <TableCell className="font-bold font-mono">#{purchase._id.slice(-6)}</TableCell>
                          <TableCell className="font-medium">{purchase.supplier?.name || '—'}</TableCell>
                          <TableCell>{new Date(purchase.date).toLocaleDateString()}</TableCell>
                          <TableCell>{purchase.expectedDelivery ? new Date(purchase.expectedDelivery).toLocaleDateString() : '—'}</TableCell>
                          <TableCell className="font-bold text-primary">${purchase.total?.toFixed(2) || '0.00'}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                purchase.status === "received"
                                  ? "default"
                                  : purchase.status === "ordered"
                                    ? "outline"
                                    : "destructive"
                              }
                              className="font-semibold"
                            >
                              {purchase.status}
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
                                <DropdownMenuItem onClick={() => handleView(purchase._id)} className="cursor-pointer">
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer">
                                  <FileText className="mr-2 h-4 w-4" />
                                  Print PO
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {purchase.status === "ordered" && (
                                  <>
                                    <DropdownMenuItem onClick={() => handleReceive(purchase._id)} disabled={loading} className="cursor-pointer">
                                      <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                                      Mark as Received
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleCancel(purchase._id)} disabled={loading} className="text-red-600 cursor-pointer">
                                      <XCircle className="mr-2 h-4 w-4" />
                                      Cancel Order
                                    </DropdownMenuItem>
                                  </>
                                )}
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

            <div className="flex items-center justify-between space-x-2 p-4 border-t-2 border-primary/10">
              <div className="text-sm font-medium text-muted-foreground">
                Page <span className="text-primary font-bold">{page}</span> of {totalPages} ({total} purchases)
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="border-2"
                >
                  ← Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="border-2"
                >
                  Next →
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Details Modal */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="border-2">
          <DialogHeader>
            <DialogTitle className="text-xl">Purchase Order Details</DialogTitle>
          </DialogHeader>
          {selectedPO && (
            <div className="space-y-2 print:bg-white print:text-black">
              <div><b>PO Number:</b> #{selectedPO._id.slice(-6)}</div>
              <div><b>Supplier:</b> {selectedPO.supplier?.name || "-"}</div>
              <div><b>Date Ordered:</b> {selectedPO.dateOrdered ? new Date(selectedPO.dateOrdered).toLocaleDateString() : "-"}</div>
              <div><b>Expected Delivery:</b> {selectedPO.expectedDeliveryDate ? new Date(selectedPO.expectedDeliveryDate).toLocaleDateString() : "-"}</div>
              <div><b>Status:</b> {selectedPO.status}</div>
              <div><b>Notes:</b> {selectedPO.notes || "-"}</div>
              <div>
                <b>Items:</b>
                <table className="w-full text-xs border mt-1">
                  <thead>
                    <tr className="bg-muted">
                      <th className="p-2 text-left">Product</th>
                      <th className="p-2 text-left">Quantity</th>
                      <th className="p-2 text-left">Cost</th>
                      <th className="p-2 text-left">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedPO.items?.map((item: any, idx: number) => (
                      <tr key={idx} className="border-b">
                        <td className="p-2">{item.product?.name || "-"}</td>
                        <td className="p-2">{item.quantity}</td>
                        <td className="p-2">${item.cost.toFixed(2)}</td>
                        <td className="p-2 font-bold">${(item.quantity * item.cost).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex gap-2 mt-4">
                <Button type="button" onClick={() => window.print()} className="bg-gradient-to-r from-purple-600 to-blue-600">Print</Button>
                <Button type="button" variant="outline" onClick={() => setDetailsOpen(false)} className="border-2">Close</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
