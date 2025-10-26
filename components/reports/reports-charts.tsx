"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { apiFetch } from "@/lib/api"
import { useAuth } from "@/hooks/use-auth"
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar
} from "recharts"

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088FE", "#00C49F", "#FFBB28", "#FF8042"]

export function ReportsCharts({ period = "7days" }: { period?: string }) {
  const { user } = useAuth() as { user: any }
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [profitLoss, setProfitLoss] = useState<any>(null)
  const [expenseBreakdown, setExpenseBreakdown] = useState<any[]>([])
  const [topProducts, setTopProducts] = useState<any[]>([])
  const [salesOverTime, setSalesOverTime] = useState<any[]>([])
  const [expensesOverTime, setExpensesOverTime] = useState<any[]>([])
  const [salesByCategory, setSalesByCategory] = useState<any[]>([])
  const [combinedTimeData, setCombinedTimeData] = useState<any[]>([])

  // Map period to date range
  const getDateRange = () => {
    const end = new Date()
    let start = new Date()
    
    if (period === "today") {
      start = new Date(end)
      start.setHours(0, 0, 0, 0)
      end.setHours(23, 59, 59, 999)
    } else if (period === "7days") {
      start.setDate(end.getDate() - 6)
      start.setHours(0, 0, 0, 0)
      end.setHours(23, 59, 59, 999)
    } else if (period === "30days") {
      start.setDate(end.getDate() - 29)
      start.setHours(0, 0, 0, 0)
      end.setHours(23, 59, 59, 999)
    } else if (period === "90days") {
      start.setDate(end.getDate() - 89)
      start.setHours(0, 0, 0, 0)
      end.setHours(23, 59, 59, 999)
    } else if (period === "1year") {
      start.setFullYear(end.getFullYear() - 1)
      start.setHours(0, 0, 0, 0)
      end.setHours(23, 59, 59, 999)
    }
    
    const startStr = start.toISOString().slice(0, 10)
    const endStr = end.toISOString().slice(0, 10)
    
    return { start: startStr, end: endStr }
  }

  // Combine sales and expenses data for line chart
  const combineTimeData = (sales: any[], expenses: any[]) => {
    const combined: any = {}
    
    // Add sales data
    sales.forEach(item => {
      if (!combined[item.date]) {
        combined[item.date] = { date: item.date, sales: 0, expenses: 0 }
      }
      combined[item.date].sales = item.sales || 0
    })
    
    // Add expenses data
    expenses.forEach(item => {
      if (!combined[item.date]) {
        combined[item.date] = { date: item.date, sales: 0, expenses: 0 }
      }
      combined[item.date].expenses = item.expenses || 0
    })
    
    return Object.values(combined).sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }

  useEffect(() => {
    setLoading(true)
    setError(null)
    const { start, end } = getDateRange()
    
    
    // Fetch each endpoint individually to handle errors gracefully
    const fetchReports = async () => {
      try {
        const [profitLoss, expenseBreakdown, topProducts, salesOverTime, expensesOverTime, salesByCategory] = await Promise.allSettled([
      apiFetch(`/api/reports/profit-loss?start=${start}&end=${end}`),
      apiFetch(`/api/reports/expense-breakdown?start=${start}&end=${end}`),
      apiFetch(`/api/reports/top-products?start=${start}&end=${end}`),
          apiFetch(`/api/reports/sales-over-time?start=${start}&end=${end}`),
          apiFetch(`/api/reports/expenses-over-time?start=${start}&end=${end}`),
          apiFetch(`/api/reports/sales-by-category?start=${start}&end=${end}`)
        ])
        
        // Handle each result, providing defaults for failed requests
        const profitLossData = profitLoss.status === 'fulfilled' ? profitLoss.value : { revenue: 0, cogs: 0, expenses: 0, profit: 0 }
        const expenseBreakdownData = expenseBreakdown.status === 'fulfilled' ? expenseBreakdown.value : []
        const topProductsData = topProducts.status === 'fulfilled' ? topProducts.value : []
        const salesOverTimeData = salesOverTime.status === 'fulfilled' ? salesOverTime.value : []
        const expensesOverTimeData = expensesOverTime.status === 'fulfilled' ? expensesOverTime.value : []
        const salesByCategoryData = salesByCategory.status === 'fulfilled' ? salesByCategory.value : []
        
        
        setProfitLoss(profitLossData)
        setExpenseBreakdown(expenseBreakdownData)
        setTopProducts(topProductsData)
        setSalesOverTime(salesOverTimeData)
        setExpensesOverTime(expensesOverTimeData)
        setSalesByCategory(salesByCategoryData)
        
        // Combine sales and expenses data for the line chart
        const combined = combineTimeData(salesOverTimeData, expensesOverTimeData)
        setCombinedTimeData(combined)
        
        // Log any failed requests
        const failedRequests = [profitLoss, expenseBreakdown, topProducts, salesOverTime, expensesOverTime, salesByCategory]
          .filter(result => result.status === 'rejected')
          .map(result => result.reason)
        
        if (failedRequests.length > 0) {
          // Check if it's an authentication error
          const authErrors = failedRequests.filter(err => 
            err.message?.includes('401') || 
            err.message?.includes('Unauthorized') || 
            err.message?.includes('Invalid token')
          )
          
          if (authErrors.length > 0) {
            setError('Authentication required. Please log in with admin or manager credentials to view reports.')
            return
          }
        }
        
      } catch (err) {
        setError(err.message || 'Failed to load reports')
      } finally {
        setLoading(false)
      }
    }
    
    fetchReports()
  }, [period])

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading reports...</div>
  if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>

  // Show message if no data available
  const hasData = profitLoss?.revenue > 0 || topProducts?.length > 0 || salesOverTime?.length > 0
  if (!hasData && !loading) {
    return (
      <div className="p-8 text-center">
        <div className="text-muted-foreground mb-4">
          <h3 className="text-lg font-semibold mb-2">No Data Available</h3>
          <p>No sales or expense data found for the selected period.</p>
          <p className="text-sm mt-2">Try selecting a different time period or check if you have sales data.</p>
        </div>
        <div className="text-sm text-muted-foreground">
          <p>Current period: {period}</p>
          <p>Date range: {getDateRange().start} to {getDateRange().end}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid gap-6">
      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${profitLoss?.revenue?.toLocaleString() ?? 0}</div>
            <p className="text-xs text-muted-foreground">Revenue for selected period</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">COGS</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${profitLoss?.cogs?.toLocaleString() ?? 0}</div>
            <p className="text-xs text-muted-foreground">Cost of Goods Sold</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${profitLoss?.expenses?.toLocaleString() ?? 0}</div>
            <p className="text-xs text-muted-foreground">Total Expenses</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${profitLoss?.profit?.toLocaleString() ?? 0}</div>
            <p className="text-xs text-muted-foreground">Net Profit</p>
          </CardContent>
        </Card>
      </div>

      {/* Line Chart: Sales & Expenses Over Time */}
      <Card>
        <CardHeader>
          <CardTitle>Sales & Expenses Over Time</CardTitle>
          <CardDescription>Track trends for the selected period</CardDescription>
        </CardHeader>
        <CardContent style={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={combinedTimeData.length ? combinedTimeData : [{ date: '', sales: 0, expenses: 0 }] }>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value, name) => [`$${value.toLocaleString()}`, name]} />
              <Legend />
              <Line type="monotone" dataKey="sales" stroke="#8884d8" name="Sales" strokeWidth={2} />
              <Line type="monotone" dataKey="expenses" stroke="#82ca9d" name="Expenses" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Pie Chart: Expense Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Expense Breakdown</CardTitle>
          <CardDescription>Distribution by category</CardDescription>
        </CardHeader>
        <CardContent style={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={expenseBreakdown}
                dataKey="total"
                nameKey="_id"
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                label
              >
                {expenseBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Bar Chart: Sales by Category */}
      <Card>
        <CardHeader>
          <CardTitle>Sales by Category</CardTitle>
          <CardDescription>Revenue by product category</CardDescription>
        </CardHeader>
        <CardContent style={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={salesByCategory.length ? salesByCategory : [{ category: '', revenue: 0 }] }>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="revenue" fill="#8884d8" name="Revenue" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top Products (existing) */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Products</CardTitle>
          <CardDescription>Best selling products for selected period</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topProducts.map((product: any, index: number) => (
              <div key={product.name} className="flex items-center">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-medium">
                  {index + 1}
                </div>
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">{product.name}</p>
                  <p className="text-sm text-muted-foreground">{product.sold} units sold</p>
                </div>
                <div className="ml-auto font-medium">${product.revenue?.toLocaleString() ?? 0}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
