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

  // Move fetchSales outside useEffect so it can be called from printReceipt
  const fetchSales = async () => {
    try {
      const data = await apiFetch("/api/sales?limit=5")
      setSales(data)
    } catch (err: any) {
      setError("Could not load recent sales.")
      setSales([])
    } finally {
      setLoading(false)
    }
  };

  useEffect(() => {
    fetchSales();
  }, []);

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
      fetchSales();
    } catch (err) {
      setPrintError('Failed to print receipt.');
    }
  };

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Recent Sales</CardTitle>
        <CardDescription>
          {loading ? "Loading..." : error ? error : `You made ${sales.length} sales recently`}
        </CardDescription>
        {/* Refresh button removed as requested */}
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
        </div>
      </CardContent>
    </Card>
  )
}
