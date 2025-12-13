import { useEffect, useState } from "react"
import { ArrowDownIcon, ArrowUpIcon, DollarSign, Package, ShoppingCart, Users } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { apiFetch } from "@/lib/api"
import { motion } from "framer-motion"
import { toast } from "sonner"

export function DashboardCards() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [revenue, setRevenue] = useState(0)
  const [salesCount, setSalesCount] = useState(0)
  const [productCount, setProductCount] = useState(0)
  const [customerCount, setCustomerCount] = useState(0)

  // Poll every 10 seconds for real-time updates
  useEffect(() => {
    let isMounted = true;
    const fetchData = () => {
      setLoading(true)
      setError(null)
      Promise.all([
        apiFetch("/api/sales"),
        apiFetch("/api/products"),
        apiFetch("/api/customers")
      ])
        .then(([salesRes, products, customers]) => {
          if (!isMounted) return;
          const salesArr = Array.isArray(salesRes) ? salesRes : (salesRes.sales || []);
          setRevenue(salesArr.reduce((sum, s) => sum + (s.total || 0), 0))
          setSalesCount(salesArr.length)
          setProductCount(products.length)
          setCustomerCount(customers.length)
          !loading && toast.success("Dashboard updated", { duration: 1000 })
        })
        .catch(err => {
          if (isMounted) {
            setError(err.message)
            toast.error("Failed to load dashboard data", { duration: 2000 })
          }
        })
        .finally(() => { if (isMounted) setLoading(false) })
    };
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => { isMounted = false; clearInterval(interval); };
  }, [])

  if (error) {
    return <div className="text-destructive font-semibold">⚠️ {error}</div>
  }

  const cards = [
    {
      title: "Total Revenue",
      value: loading ? null : (typeof revenue === 'number' ? `$${revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '$0.00'),
      trend: "+20.1%",
      trendUp: true,
      description: "from last month",
      icon: DollarSign,
      iconColor: "text-green-500"
    },
    {
      title: "Sales",
      value: loading ? null : (typeof salesCount === 'number' ? `+${salesCount.toLocaleString()}` : '+0'),
      trend: "+12.2%",
      trendUp: true,
      description: "from last month",
      icon: ShoppingCart,
      iconColor: "text-blue-500"
    },
    {
      title: "Products",
      value: loading ? null : (typeof productCount === 'number' ? productCount.toLocaleString() : '0'),
      trend: "+4.3%",
      trendUp: true,
      description: "new products this month",
      icon: Package,
      iconColor: "text-purple-500"
    },
    {
      title: "Customers",
      value: loading ? null : (typeof customerCount === 'number' ? `+${customerCount.toLocaleString()}` : '+0'),
      trend: "-2.5%",
      trendUp: false,
      description: "from last month",
      icon: Users,
      iconColor: "text-orange-500"
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1, type: "spring", stiffness: 100 }}
          whileHover={{ y: -5, transition: { duration: 0.2 } }}
        >
          <Card className="relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 shadow-lg hover:shadow-xl bg-gradient-to-br from-background via-background to-primary/5">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 pointer-events-none" />

            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground">{card.title}</CardTitle>
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <card.icon className={`h-6 w-6 ${card.iconColor}`} />
              </motion.div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-24 mb-2" />
              ) : (
                <motion.div
                  className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent"
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                >
                  {card.value}
                </motion.div>
              )}
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <span className={`flex items-center font-semibold ${card.trendUp ? 'text-green-500' : 'text-red-500'}`}>
                  {card.trendUp ? <ArrowUpIcon className="mr-1 h-4 w-4" /> : <ArrowDownIcon className="mr-1 h-4 w-4" />}
                  {card.trend}
                </span>{" "}
                {card.description}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
