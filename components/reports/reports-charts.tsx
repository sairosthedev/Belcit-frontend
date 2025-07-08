"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

export function ReportsCharts() {
  return (
    <div className="grid gap-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$12,234</div>
            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+2,350</div>
            <p className="text-xs text-muted-foreground">+180.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Order Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$5.21</div>
            <p className="text-xs text-muted-foreground">+19% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23.5%</div>
            <p className="text-xs text-muted-foreground">+2.1% from last month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Sales by Category</CardTitle>
            <CardDescription>Revenue breakdown by product category</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {salesByCategory.map((category) => (
              <div key={category.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{category.name}</span>
                  <span className="text-sm text-muted-foreground">${category.amount.toLocaleString()}</span>
                </div>
                <Progress value={category.percentage} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Performing Products</CardTitle>
            <CardDescription>Best selling products this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={product.name} className="flex items-center">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-medium">
                    {index + 1}
                  </div>
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">{product.name}</p>
                    <p className="text-sm text-muted-foreground">{product.sold} units sold</p>
                  </div>
                  <div className="ml-auto font-medium">${product.revenue.toLocaleString()}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Expense Breakdown</CardTitle>
          <CardDescription>Operating expenses for the current month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {expenseBreakdown.map((expense) => (
              <div key={expense.category} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{expense.category}</span>
                  <span className="text-sm text-muted-foreground">${expense.amount.toLocaleString()}</span>
                </div>
                <Progress value={expense.percentage} className="h-2" />
                <p className="text-xs text-muted-foreground">{expense.percentage}% of total expenses</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

const salesByCategory = [
  { name: "Dairy", amount: 4500, percentage: 85 },
  { name: "Bakery", amount: 3200, percentage: 60 },
  { name: "Produce", amount: 2800, percentage: 53 },
  { name: "Meat & Poultry", amount: 2100, percentage: 40 },
  { name: "Beverages", amount: 1800, percentage: 34 },
]

const topProducts = [
  { name: "Fresh Milk 1L", sold: 245, revenue: 731 },
  { name: "White Bread", sold: 190, revenue: 663 },
  { name: "Chicken Breast", sold: 175, revenue: 1749 },
  { name: "Coca Cola 2L", sold: 165, revenue: 411 },
  { name: "Organic Eggs", sold: 145, revenue: 869 },
]

const expenseBreakdown = [
  { category: "Rent", amount: 2500, percentage: 45 },
  { category: "Utilities", amount: 800, percentage: 14 },
  { category: "Supplies", amount: 650, percentage: 12 },
  { category: "Maintenance", amount: 500, percentage: 9 },
  { category: "Marketing", amount: 400, percentage: 7 },
  { category: "Insurance", amount: 350, percentage: 6 },
]
