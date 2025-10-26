"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { apiFetch } from "@/lib/api"
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar
} from "recharts"

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088FE", "#00C49F", "#FFBB28", "#FF8042"]

export function ReportsCharts({ period = "7days" }: { period?: string }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [profitLoss, setProfitLoss] = useState<any>(null)
  const [expenseBreakdown, setExpenseBreakdown] = useState<any[]>([])
  const [topProducts, setTopProducts] = useState<any[]>([])
  const [salesOverTime, setSalesOverTime] = useState<any[]>([])
  const [expensesOverTime, setExpensesOverTime] = useState<any[]>([])
  const [salesByCategory, setSalesByCategory] = useState<any[]>([])

  // Map period to date range
  const getDateRange = () => {
    const end = new Date()
    let start = new Date()
    if (period === "today") start = new Date(end)
    else if (period === "7days") start.setDate(end.getDate() - 6)
    else if (period === "30days") start.setDate(end.getDate() - 29)
    else if (period === "90days") start.setDate(end.getDate() - 89)
    else if (period === "1year") start.setFullYear(end.getFullYear() - 1)
    return { start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10) }
  }

  useEffect(() => {
    setLoading(true)
    setError(null)
    const { start, end } = getDateRange()
    Promise.all([
      apiFetch(`/api/reports/profit-loss?start=${start}&end=${end}`),
      apiFetch(`/api/reports/expense-breakdown?start=${start}&end=${end}`),
      apiFetch(`/api/reports/top-products?start=${start}&end=${end}`),
      apiFetch(`/api/reports/sales-over-time?start=${start}&end=${end}`), // Placeholder endpoint
      apiFetch(`/api/reports/expenses-over-time?start=${start}&end=${end}`), // Placeholder endpoint
      apiFetch(`/api/reports/sales-by-category?start=${start}&end=${end}`) // Placeholder endpoint
    ])
      .then(([profitLoss, expenseBreakdown, topProducts, salesOverTime, expensesOverTime, salesByCategory]) => {
        setProfitLoss(profitLoss)
        setExpenseBreakdown(expenseBreakdown)
        setTopProducts(topProducts)
        setSalesOverTime(salesOverTime)
        setExpensesOverTime(expensesOverTime)
        setSalesByCategory(salesByCategory)
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [period])

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading reports...</div>
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>

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
            <LineChart data={salesOverTime.length ? salesOverTime : [{ date: '', sales: 0, expenses: 0 }] }>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="sales" stroke="#8884d8" name="Sales" />
              <Line type="monotone" dataKey="expenses" stroke="#82ca9d" name="Expenses" />
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
