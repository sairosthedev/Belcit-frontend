import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { apiFetch } from "@/lib/api"

export function RecentSales() {
  const [sales, setSales] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchSales() {
      try {
        const data = await apiFetch("/api/sales?limit=5")
        setSales(data)
      } catch (err: any) {
        setError("Could not load recent sales.")
        setSales([])
      } finally {
        setLoading(false)
      }
    }
    fetchSales()
  }, [])

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Recent Sales</CardTitle>
        <CardDescription>
          {loading ? "Loading..." : error ? error : `You made ${sales.length} sales recently`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
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
                    <Button size="sm" variant="outline" onClick={() => window.open(`${process.env.NEXT_PUBLIC_API_BASE_URL || ""}/api/sales/${sale._id}/receipt`, "_blank")}>Print</Button>
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
