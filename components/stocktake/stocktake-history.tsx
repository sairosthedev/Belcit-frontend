"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, Calendar, User, Package, Download, ClipboardList, TrendingUp } from "lucide-react"
import { apiFetch } from "@/lib/api"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"

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
        toast.success("Stocktake history loaded", { duration: 1500 })
      })
      .catch(err => {
        setError(err.message)
        toast.error("Failed to load stocktakes", { duration: 2000 })
      })
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
      toast.error("No data to export", { duration: 2000 })
      return
    }

    setExporting(true)
    toast.info(`Exporting as ${format.toUpperCase()}...`, { duration: 2000 })

    try {
      const stocktakeIds = filteredStocktakes.map(s => s._id)
      const token = localStorage.getItem('token')

      if (!token) {
        toast.error("Authentication required", { duration: 2000 })
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
        toast.success("Export successful!", { duration: 2000 })
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || "Export failed", { duration: 2000 })
      }
    } catch (err) {
      toast.error("Export error occurred", { duration: 2000 })
    } finally {
      setExporting(false)
    }
  }

  const getDiscrepancyBadge = (discrepancy: number) => {
    if (discrepancy === 0) {
      return <Badge variant="default" className="font-semibold">✓ Match</Badge>
    } else if (discrepancy > 0) {
      return <Badge variant="outline" className="text-green-600 font-bold border-green-600">+{discrepancy}</Badge>
    } else {
      return <Badge variant="destructive" className="font-bold">{discrepancy}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-[400px] w-full rounded-lg" />
      </div>
    )
  }

  if (error) {
    return (
      <Card className="border-2 border-red-500/30">
        <CardContent className="p-8 text-center">
          <p className="text-red-600 mb-4">⚠️ {error}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
          <Card className="border-2 hover:border-primary/30 transition-all">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Total Stocktakes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                {stocktakes.length}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="border-2 hover:border-primary/30 transition-all">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Discrepancies</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-600">
                {stocktakes.filter(s => s.discrepancy !== 0).length}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="border-2 hover:border-primary/30 transition-all">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Confirmed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {stocktakes.filter(s => s.confirmed).length}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="border-2 hover:border-primary/30 transition-all">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">
                {stocktakes.filter(s => !s.confirmed).length}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Search and Export */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex gap-4 items-center"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="🔍 Search by product name or user..."
            className="pl-10 border-2"
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
            className="border-2"
          >
            <Download className="mr-2 h-4 w-4" />
            PDF
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport('xlsx')}
            disabled={exporting || filteredStocktakes.length === 0}
            className="border-2"
          >
            <Download className="mr-2 h-4 w-4" />
            Excel
          </Button>
        </div>
      </motion.div>

      {/* History Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="border-2 hover:border-primary/30 transition-all duration-300 shadow-xl bg-gradient-to-br from-background via-background to-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-primary" />
              Stocktake Records
            </CardTitle>
            <CardDescription>
              Complete history of all stocktake activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow className="border-b-2">
                    <TableHead className="font-bold">Product</TableHead>
                    <TableHead className="font-bold">System Stock</TableHead>
                    <TableHead className="font-bold">Counted</TableHead>
                    <TableHead className="font-bold">Discrepancy</TableHead>
                    <TableHead className="font-bold">Counted By</TableHead>
                    <TableHead className="font-bold">Date</TableHead>
                    <TableHead className="font-bold">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence mode="popLayout">
                    {filteredStocktakes.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-12">
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                          >
                            <ClipboardList className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
                            <p className="text-lg font-semibold text-muted-foreground">
                              {searchTerm ? "No stocktakes found matching your search" : "No stocktake records found"}
                            </p>
                          </motion.div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredStocktakes.map((stocktake, idx) => (
                        <motion.tr
                          key={stocktake._id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ delay: idx * 0.03 }}
                          className="border-b hover:bg-primary/5 transition-colors"
                        >
                          <TableCell className="font-semibold">
                            <div className="flex items-center gap-2">
                              <Package className="h-4 w-4 text-primary" />
                              {stocktake.product?.name || 'Unknown Product'}
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{stocktake.system}</TableCell>
                          <TableCell className="font-medium">{stocktake.counted}</TableCell>
                          <TableCell>{getDiscrepancyBadge(stocktake.discrepancy)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">
                                {stocktake.countedBy ?
                                  `${stocktake.countedBy.firstName} ${stocktake.countedBy.lastName}` :
                                  'Unknown User'
                                }
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              {formatDate(stocktake.date)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={stocktake.confirmed ? "default" : "secondary"} className="font-semibold">
                              {stocktake.confirmed ? "Confirmed" : "Pending"}
                            </Badge>
                          </TableCell>
                        </motion.tr>
                      ))
                    )}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
