import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { apiFetch } from "@/lib/api"

export function RecentSales() {
  const [sales, setSales] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [printError, setPrintError] = useState<string | null>(null);
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
    } catch (err: any) {
      setError("Could not load recent sales.");
      setSales([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";
  // Print receipt with authentication
  const printReceipt = async (saleId: string) => {
    setPrintError(null);
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
          setPrintError('Receipt not found. This sale may have been deleted.');
        } else {
          setPrintError('Failed to print receipt.');
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
      }
      // Refresh sales list after printing
      fetchSales(page);
    } catch (err) {
      setPrintError('Failed to print receipt.');
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Recent Sales</CardTitle>
        <CardDescription>
          {loading ? "Loading..." : error ? error : `You made ${total} sales recently`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {printError && <div className="text-red-500 mb-2">{printError}</div>}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Cashier</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Receipt</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(loading ? [] : sales).map((sale) => (
                <TableRow key={sale._id}>
                  <TableCell>{new Date(sale.date || sale.createdAt).toLocaleString()}</TableCell>
                  <TableCell>${sale.total?.toFixed(2) || sale.amount || "0.00"}</TableCell>
                  <TableCell>{sale.paymentType}</TableCell>
                  <TableCell>
                    {sale.cashier?.first_name
                      ? `${sale.cashier.first_name} ${sale.cashier.last_name || ""}`
                      : sale.cashier?.name || "—"}
                  </TableCell>
                  <TableCell>
                    {sale.items?.map((item: any) =>
                      `${item.product?.name || item.productName || "?"} x${item.quantity}`
                    ).join(", ")}
                  </TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline" onClick={() => printReceipt(sale._id)} disabled={!sale._id}>Print</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex justify-between items-center mt-4">
            <Button variant="outline" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Prev</Button>
            <span>Page {page} of {totalPages}</span>
            <Button variant="outline" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
