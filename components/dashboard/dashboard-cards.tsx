import { useEffect, useState } from "react"
import { ArrowDownIcon, ArrowUpIcon, DollarSign, Package, ShoppingCart, Users } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { apiFetch } from "@/lib/api"

export function DashboardCards() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [revenue, setRevenue] = useState(0)
  const [salesCount, setSalesCount] = useState(0)
  const [productCount, setProductCount] = useState(0)
  const [customerCount, setCustomerCount] = useState(0)

  useEffect(() => {
    setLoading(true)
    setError(null)
    Promise.all([
      apiFetch("/api/sales"),
      apiFetch("/api/products"),
      apiFetch("/api/customers")
    ])
      .then(([sales, products, customers]) => {
        setRevenue(sales.reduce((sum: number, s: any) => sum + (s.total || 0), 0))
        setSalesCount(sales.length)
        setProductCount(products.length)
        setCustomerCount(customers.length)
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  if (error) {
    return <div className="text-destructive">{error}</div>
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{loading ? <span className="animate-pulse">...</span> : `$${revenue.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}`}</div>
          <p className="text-xs text-muted-foreground">
            <span className="flex items-center text-green-500">
              <ArrowUpIcon className="mr-1 h-4 w-4" />
              +20.1%
            </span>{" "}
            from last month
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Sales</CardTitle>
          <ShoppingCart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{loading ? <span className="animate-pulse">...</span> : `+${salesCount.toLocaleString()}`}</div>
          <p className="text-xs text-muted-foreground">
            <span className="flex items-center text-green-500">
              <ArrowUpIcon className="mr-1 h-4 w-4" />
              +12.2%
            </span>{" "}
            from last month
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Products</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{loading ? <span className="animate-pulse">...</span> : productCount.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            <span className="flex items-center text-green-500">
              <ArrowUpIcon className="mr-1 h-4 w-4" />
              +4.3%
            </span>{" "}
            new products this month
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Customers</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{loading ? <span className="animate-pulse">...</span> : `+${customerCount.toLocaleString()}`}</div>
          <p className="text-xs text-muted-foreground">
            <span className="flex items-center text-red-500">
              <ArrowDownIcon className="mr-1 h-4 w-4" />
              -2.5%
            </span>{" "}
            from last month
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
