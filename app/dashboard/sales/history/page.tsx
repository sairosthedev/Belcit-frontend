"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { apiFetch } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

export default function SalesHistoryPage() {
  const { user } = useAuth() as any;
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSales() {
      try {
        const data = await apiFetch(`/api/sales?cashierId=${user?.id || user?._id || ""}`);
        // Ensure data is an array
        setSales(Array.isArray(data) ? data : []);
      } catch (err: any) {
        setError("Could not load sales history.");
        setSales([]); // Set empty array on error
      } finally {
        setLoading(false);
      }
    }
    if (user) fetchSales();
  }, [user]);

  // Print receipt with authentication and Sunmi support
  const printReceipt = async (saleId: string) => {
    try {
      // Normalize API base URL (remove trailing slash)
      const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || "https://belcit-backend.onrender.com").replace(/\/$/, '');
      const receiptUrl = `${API_BASE}/api/sales/${saleId}/receipt`;
      console.log('Fetching receipt from:', receiptUrl);
      
      const res = await fetch(receiptUrl, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept': 'text/html',
        },
        credentials: 'include',
      });
      if (!res.ok) {
        toast.error('Failed to print receipt.');
        return;
      }
      const html = await res.text();
      
      // Try Sunmi native printing first, fallback to browser print
      const sunmiPrinted = await sunmiPrintReceipt(html);
      
      if (sunmiPrinted) {
        toast.success("Receipt sent to Sunmi printer", { duration: 2000 });
      } else {
        toast.success("Receipt printed", { duration: 2000 });
      }
    } catch (err: any) {
      console.error('Print error:', err);
      toast.error(err.message || 'Failed to print receipt.', { duration: 2000 });
    }
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Sales History</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : (
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
              {sales && Array.isArray(sales) ? sales.map((sale) => (
                <TableRow key={sale._id || sale.id}>
                  <TableCell>{new Date(sale.date || sale.createdAt).toLocaleString()}</TableCell>
                  <TableCell>${sale.total?.toFixed(2) || sale.amount || "0.00"}</TableCell>
                  <TableCell>{sale.paymentType}</TableCell>
                  <TableCell>{sale.cashier?.first_name ? `${sale.cashier.first_name} ${sale.cashier.last_name || ""}` : sale.cashier?.name || "—"}</TableCell>
                  <TableCell>{sale.items?.map((item: any) => `${item.product?.name || item.productName || "?"} x${item.quantity}`).join(", ")}</TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline" onClick={() => printReceipt(sale._id || sale.id)}>Print</Button>
                  </TableCell>
                </TableRow>
              )) : null}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
} 