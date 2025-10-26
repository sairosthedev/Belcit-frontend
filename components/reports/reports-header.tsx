import { Download, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"
import { apiFetch } from "@/lib/api"

export function ReportsHeader({ period, onPeriodChange }: { period: string, onPeriodChange: (p: string) => void }) {
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    setIsExporting(true)
    try {
      // Get date range
      const end = new Date()
      let start = new Date()
      if (period === "today") start = new Date(end)
      else if (period === "7days") start.setDate(end.getDate() - 6)
      else if (period === "30days") start.setDate(end.getDate() - 29)
      else if (period === "90days") start.setDate(end.getDate() - 89)
      else if (period === "1year") start.setFullYear(end.getFullYear() - 1)
      
      const startStr = start.toISOString().slice(0, 10)
      const endStr = end.toISOString().slice(0, 10)
      
      // Fetch all report data
      const [profitLoss, salesOverTime, expensesOverTime, topProducts, salesByCategory] = await Promise.all([
        apiFetch(`/api/reports/profit-loss?start=${startStr}&end=${endStr}`),
        apiFetch(`/api/reports/sales-over-time?start=${startStr}&end=${endStr}`),
        apiFetch(`/api/reports/expenses-over-time?start=${startStr}&end=${endStr}`),
        apiFetch(`/api/reports/top-products?start=${startStr}&end=${endStr}`),
        apiFetch(`/api/reports/sales-by-category?start=${startStr}&end=${endStr}`)
      ])
      
      // Create CSV content
      const csvContent = createCSVContent({
        profitLoss,
        salesOverTime,
        expensesOverTime,
        topProducts,
        salesByCategory,
        period,
        dateRange: { start: startStr, end: endStr }
      })
      
      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `reports-${period}-${startStr}-to-${endStr}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export failed:', error)
      alert('Failed to export report. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  const createCSVContent = (data: any) => {
    const lines = []
    
    // Header
    lines.push('BELCIT TRADING - BUSINESS REPORT')
    lines.push(`Period: ${data.period}`)
    lines.push(`Date Range: ${data.dateRange.start} to ${data.dateRange.end}`)
    lines.push('')
    
    // Profit & Loss Summary
    lines.push('PROFIT & LOSS SUMMARY')
    lines.push('Metric,Amount')
    lines.push(`Revenue,${data.profitLoss.revenue || 0}`)
    lines.push(`Cost of Goods Sold,${data.profitLoss.cogs || 0}`)
    lines.push(`Expenses,${data.profitLoss.expenses || 0}`)
    lines.push(`Net Profit,${data.profitLoss.profit || 0}`)
    lines.push('')
    
    // Sales Over Time
    lines.push('SALES OVER TIME')
    lines.push('Date,Sales')
    data.salesOverTime.forEach((item: any) => {
      lines.push(`${item.date},${item.sales || 0}`)
    })
    lines.push('')
    
    // Expenses Over Time
    lines.push('EXPENSES OVER TIME')
    lines.push('Date,Expenses')
    data.expensesOverTime.forEach((item: any) => {
      lines.push(`${item.date},${item.expenses || 0}`)
    })
    lines.push('')
    
    // Top Products
    lines.push('TOP PRODUCTS')
    lines.push('Product Name,Units Sold,Revenue')
    data.topProducts.forEach((product: any) => {
      lines.push(`${product.name || 'Unknown'},${product.sold || 0},${product.revenue || 0}`)
    })
    lines.push('')
    
    // Sales by Category
    lines.push('SALES BY CATEGORY')
    lines.push('Category,Revenue')
    data.salesByCategory.forEach((item: any) => {
      lines.push(`${item.category || 'Unknown'},${item.revenue || 0}`)
    })
    
    return lines.join('\n')
  }
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground">Analyze your business performance and trends.</p>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Select value={period} onValueChange={onPeriodChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="7days">Last 7 days</SelectItem>
            <SelectItem value="30days">Last 30 days</SelectItem>
            <SelectItem value="90days">Last 90 days</SelectItem>
            <SelectItem value="1year">Last year</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline">
          <Calendar className="mr-2 h-4 w-4" />
          Custom Range
        </Button>
        <Button onClick={handleExport} disabled={isExporting}>
          <Download className="mr-2 h-4 w-4" />
          {isExporting ? 'Exporting...' : 'Export Report'}
        </Button>
      </div>
    </div>
  )
}
