"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Calendar, User, Package, Download } from "lucide-react"
import { apiFetch } from "@/lib/api"

export function StocktakeHistory() {
  const [stocktakes, setStocktakes] = useState<any[]>([])
  const [filteredStocktakes, setFilteredStocktakes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    setLoading(true)
    apiFetch("/api/stocktakes")
      .then(data => {
        setStocktakes(data)
        setFilteredStocktakes(data)
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredStocktakes(stocktakes)
    } else {
      const filtered = stocktakes.filter(stocktake =>
        stocktake.product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stocktake.countedBy?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stocktake.countedBy?.lastName?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredStocktakes(filtered)
    }
  }, [searchTerm, stocktakes])

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleExport = async (format: 'pdf' | 'xlsx') => {
    if (filteredStocktakes.length === 0) {
      return
    }

    setExporting(true)
    try {
      const stocktakeIds = filteredStocktakes.map(s => s._id)
      const token = localStorage.getItem('token')
      
      if (!token) {
        console.error('No authentication token found')
        return
      }
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/stocktakes/export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ stocktakeIds, format })
      })
      
      if (response.ok) {
        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `stocktake-history-${new Date().toISOString().split('T')[0]}.${format}`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      } else {
        const errorData = await response.json()
        console.error('Export failed:', errorData.error || 'Unknown error')
      }
    } catch (err) {
      console.error('Export error:', err)
    } finally {
      setExporting(false)
    }
  }

  const getDiscrepancyBadge = (discrepancy: number) => {
    if (discrepancy === 0) {
      return <Badge variant="default">Match</Badge>
    } else if (discrepancy > 0) {
      return <Badge variant="outline" className="text-green-600">+{discrepancy}</Badge>
    } else {
      return <Badge variant="destructive">{discrepancy}</Badge>
    }
  }

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading stocktake history...</div>
  if (error) return <div className="p-8 text-center text-destructive">{error}</div>

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Stocktakes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stocktakes.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Discrepancies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {stocktakes.filter(s => s.discrepancy !== 0).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Confirmed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stocktakes.filter(s => s.confirmed).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {stocktakes.filter(s => !s.confirmed).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Export */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by product name or user..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleExport('pdf')}
            disabled={exporting || filteredStocktakes.length === 0}
          >
            <Download className="mr-2 h-4 w-4" />
            PDF
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleExport('xlsx')}
            disabled={exporting || filteredStocktakes.length === 0}
          >
            <Download className="mr-2 h-4 w-4" />
            Excel
          </Button>
        </div>
      </div>

      {/* History Table */}
      <Card>
        <CardHeader>
          <CardTitle>Stocktake Records</CardTitle>
          <CardDescription>
            Complete history of all stocktake activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>System Stock</TableHead>
                <TableHead>Counted</TableHead>
                <TableHead>Discrepancy</TableHead>
                <TableHead>Counted By</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStocktakes.map((stocktake) => (
                <TableRow key={stocktake._id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      {stocktake.product?.name || 'Unknown Product'}
                    </div>
                  </TableCell>
                  <TableCell>{stocktake.system}</TableCell>
                  <TableCell>{stocktake.counted}</TableCell>
                  <TableCell>{getDiscrepancyBadge(stocktake.discrepancy)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      {stocktake.countedBy ? 
                        `${stocktake.countedBy.firstName} ${stocktake.countedBy.lastName}` : 
                        'Unknown User'
                      }
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {formatDate(stocktake.date)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={stocktake.confirmed ? "default" : "secondary"}>
                      {stocktake.confirmed ? "Confirmed" : "Pending"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredStocktakes.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? "No stocktakes found matching your search." : "No stocktake records found."}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
