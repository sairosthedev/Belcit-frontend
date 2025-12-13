import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { apiFetch } from "@/lib/api"
import { ShoppingBag, Printer } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"

export function RecentSales() {
  const [sales, setSales] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [total, setTotal] = useState(0);

  // Fetch paginated sales
  const fetchSales = async (pageNum = page) => {
    setLoading(true);
    try {
      const res = await apiFetch(`/api/sales?page=${pageNum}&limit=${limit}`);
      setSales(res.sales || []);
      setTotal(res.total || 0);
      setError(null);
      toast.success("Sales loaded", { duration: 1500 });
    } catch (err: any) {
      setError("Could not load recent sales.");
      setSales([]);
      setTotal(0);
      toast.error("Failed to load sales", { duration: 2000 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "https://belcit-backend.onrender.com";

  const printReceipt = async (saleId: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/sales/${saleId}/receipt`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept': 'text/html',
        },
        credentials: 'include',
      });
      if (!res.ok) {
        if (res.status === 404) {
          toast.error('Receipt not found', { duration: 2000 });
        } else {
          toast.error('Failed to print receipt', { duration: 2000 });
        }
        return;
      }
      const html = await res.text();
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        toast.success("Receipt printed", { duration: 2000 });
      }
      fetchSales(page);
    } catch (err) {
      toast.error('Print error occurred', { duration: 2000 });
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));

  if (loading && sales.length === 0) {
    return (
      <Card className="col-span-1 border-2">
        <CardContent className="p-6">
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-lg" />
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
      transition={{ delay: 0.2 }}
      className="col-span-1"
    >
      <Card className="border-2 hover:border-primary/30 transition-all duration-300 shadow-xl bg-gradient-to-br from-background via-background to-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-primary" />
            Recent Sales
          </CardTitle>
          <CardDescription className="font-medium">
            {error ? <span className="text-red-500">{error}</span> : `You made ${total} sales recently`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="overflow-x-auto rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow className="border-b-2">
                    <TableHead className="font-bold">Date</TableHead>
                    <TableHead className="font-bold">Amount</TableHead>
                    <TableHead className="font-bold">Payment</TableHead>
                    <TableHead className="font-bold">Cashier</TableHead>
                    <TableHead className="font-bold">Items</TableHead>
                    <TableHead className="font-bold">Receipt</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence mode="popLayout">
                    {sales.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                          >
                            <ShoppingBag className="mx-auto h-10 w-10 text-muted-foreground/50 mb-2" />
                            <p className="text-muted-foreground font-medium">No sales yet</p>
                          </motion.div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      sales.map((sale, idx) => (
                        <motion.tr
                          key={sale._id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ delay: idx * 0.05 }}
                          className="border-b hover:bg-primary/5 transition-colors"
                        >
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(sale.date || sale.createdAt).toLocaleString()}
                          </TableCell>
                          <TableCell className="font-bold text-primary">
                            ${sale.total?.toFixed(2) || sale.amount || "0.00"}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="font-semibold">
                              {sale.paymentType}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">
                            {sale.cashier?.first_name
                              ? `${sale.cashier.first_name} ${sale.cashier.last_name || ""}`
                              : sale.cashier?.name || "—"}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground max-w-xs truncate">
                            {sale.items?.map((item: any) =>
                              `${item.product?.name || item.productName || "?"} x${item.quantity}`
                            ).join(", ")}
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => printReceipt(sale._id)}
                              disabled={!sale._id}
                              className="border-2 hover:bg-primary/10"
                            >
                              <Printer className="h-3 w-3 mr-1" />
                              Print
                            </Button>
                          </TableCell>
                        </motion.tr>
                      ))
                    )}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </div>
            <div className="flex justify-between items-center pt-2 border-t-2 border-primary/10">
              <Button
                variant="outline"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="border-2"
              >
                ← Prev
              </Button>
              <span className="font-semibold">
                Page <span className="text-primary">{page}</span> of {totalPages}
              </span>
              <Button
                variant="outline"
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
  )
}
