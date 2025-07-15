"use client"

import { useEffect, useState } from "react"
import { MoreHorizontal, ArrowUpDown, FileText, Eye, CheckCircle, XCircle } from "lucide-react"
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

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
      })
      .catch(() => {
        setError('Could not load purchases.')
        setPurchases([])
        setTotal(0)
      })
      .finally(() => setLoading(false))
  }, [page, limit, status, supplier])

  const totalPages = Math.max(1, Math.ceil(total / limit))

  // Action handlers
  const handleReceive = async (id: string) => {
    setLoading(true)
    try {
      await apiFetch(`/api/purchases/${id}/receive`, { method: "POST" })
      // Refresh the table to show updated status
      setLoading(false)
    } catch (e) {
      // handle error
      setLoading(false)
    }
  }
  const handleCancel = async (id: string) => {
    setLoading(true)
    try {
      await apiFetch(`/api/purchases/${id}/cancel`, { method: "POST" })
      // Refresh the table to show updated status
      setLoading(false)
    } catch (e) {
      // handle error
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
      // handle error
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Card>
        <CardContent className="p-0">
          <div className="flex items-center justify-between p-4">
            <div className="flex flex-1 items-center space-x-2">
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="ordered">Ordered</SelectItem>
                  <SelectItem value="received">Received</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Select value={supplier} onValueChange={setSupplier}>
                <SelectTrigger className="w-[180px]">
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
                    PO Number
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Date Ordered</TableHead>
                <TableHead>Expected Delivery</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={7}>Loading...</TableCell></TableRow>
              ) : error ? (
                <TableRow><TableCell colSpan={7} className="text-red-500">{error}</TableCell></TableRow>
              ) : purchases.length === 0 ? (
                <TableRow><TableCell colSpan={7}>No purchases found.</TableCell></TableRow>
              ) : purchases.map((purchase) => (
                <TableRow key={purchase._id}>
                  <TableCell className="font-medium">{purchase._id.slice(-6)}</TableCell>
                  <TableCell>{purchase.supplier?.name || '—'}</TableCell>
                  <TableCell>{new Date(purchase.date).toLocaleDateString()}</TableCell>
                  <TableCell>{purchase.expectedDelivery ? new Date(purchase.expectedDelivery).toLocaleDateString() : '—'}</TableCell>
                  <TableCell>${purchase.total?.toFixed(2) || '0.00'}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        purchase.status === "received"
                          ? "default"
                          : purchase.status === "ordered"
                            ? "outline"
                            : "destructive"
                      }
                    >
                      {purchase.status}
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
                        <DropdownMenuItem onClick={() => handleView(purchase._id)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <FileText className="mr-2 h-4 w-4" />
                          Print PO
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {purchase.status === "ordered" && (
                          <>
                            <DropdownMenuItem onClick={() => handleReceive(purchase._id)} disabled={loading}>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Mark as Received
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleCancel(purchase._id)} disabled={loading} className="text-red-600">
                              <XCircle className="mr-2 h-4 w-4" />
                              Cancel Order
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex items-center justify-end space-x-2 p-4">
            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
              Previous
            </Button>
            <span>Page {page} of {totalPages}</span>
            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
              Next
            </Button>
          </div>
        </CardContent>
      </Card>
      {/* Details Modal */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Purchase Order Details</DialogTitle>
          </DialogHeader>
          {selectedPO && (
            <div className="space-y-2 print:bg-white print:text-black">
              <div><b>PO Number:</b> {selectedPO._id.slice(-6)}</div>
              <div><b>Supplier:</b> {selectedPO.supplier?.name || "-"}</div>
              <div><b>Date Ordered:</b> {selectedPO.dateOrdered ? new Date(selectedPO.dateOrdered).toLocaleDateString() : "-"}</div>
              <div><b>Expected Delivery:</b> {selectedPO.expectedDeliveryDate ? new Date(selectedPO.expectedDeliveryDate).toLocaleDateString() : "-"}</div>
              <div><b>Status:</b> {selectedPO.status}</div>
              <div><b>Notes:</b> {selectedPO.notes || "-"}</div>
              <div>
                <b>Items:</b>
                <table className="w-full text-xs border mt-1">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Quantity</th>
                      <th>Cost</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedPO.items?.map((item: any, idx: number) => (
                      <tr key={idx}>
                        <td>{item.product?.name || "-"}</td>
                        <td>{item.quantity}</td>
                        <td>${item.cost.toFixed(2)}</td>
                        <td>${(item.quantity * item.cost).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex gap-2 mt-4">
                <Button type="button" onClick={() => window.print()}>Print</Button>
                <Button type="button" variant="outline" onClick={() => setDetailsOpen(false)}>Close</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
