"use client"

import { useState, useEffect } from "react"
import { Search, Save, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { apiFetch } from "@/lib/api"
import { useAuth } from "@/hooks/use-auth"

export function StocktakeForm() {
  const { user } = useAuth() as { user: any }
  const [stocktakeItems, setStocktakeItems] = useState<any[]>([])
  const [filteredItems, setFilteredItems] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [saving, setSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const { toast } = require("@/hooks/use-toast").useToast();

  // Fetch products from backend
  useEffect(() => {
    setLoading(true)
    apiFetch("/api/products")
      .then(data => {
        const items = data.map((p: any) => ({
          id: p._id || p.id,
          name: p.name,
          sku: p.barcode,
          expectedStock: p.stock,
          actualStock: p.stock,
          discrepancy: 0,
          notes: "",
        }))
        setStocktakeItems(items)
        setFilteredItems(items)
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  // Filter items based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredItems(stocktakeItems)
    } else {
      const filtered = stocktakeItems.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredItems(filtered)
    }
  }, [searchTerm, stocktakeItems])

  const updateActualStock = (id: string, actualStock: number) => {
    setStocktakeItems(
      stocktakeItems.map((item) =>
        item.id === id
          ? {
              ...item,
              actualStock,
              discrepancy: actualStock - item.expectedStock,
            }
          : item,
      ),
    )
  }

  const updateNotes = (id: string, notes: string) => {
    setStocktakeItems(stocktakeItems.map((item) => (item.id === id ? { ...item, notes } : item)))
  }

  const handleSaveDraft = async () => {
    setSaving(true)
    try {
      // Save to localStorage as draft
      const draftData = {
        items: stocktakeItems,
        timestamp: new Date().toISOString(),
        user: user?.id || user?._id
      }
      localStorage.setItem('stocktake-draft', JSON.stringify(draftData))
      setLastSaved(new Date())
      toast({ title: "Draft saved", description: "Your progress has been saved locally" })
    } catch (err) {
      toast({ title: "Error saving draft", description: "Could not save your progress", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  const loadDraft = () => {
    try {
      const draft = localStorage.getItem('stocktake-draft')
      if (draft) {
        const draftData = JSON.parse(draft)
        if (draftData.user === (user?.id || user?._id)) {
          setStocktakeItems(draftData.items)
          setLastSaved(new Date(draftData.timestamp))
          toast({ title: "Draft loaded", description: "Your previous progress has been restored" })
        }
      }
    } catch (err) {
      toast({ title: "Error loading draft", description: "Could not load saved progress", variant: "destructive" })
    }
  }

  const generateReports = async (stocktakeResults: any[]) => {
    try {
      let stocktakeIds = []
      
      if (stocktakeResults && stocktakeResults.length > 0) {
        // Use provided results from stocktake submission
        stocktakeIds = stocktakeResults.map(result => result._id || result.id)
      } else {
        // Fetch recent stocktakes for manual export
        try {
          const recentStocktakes = await apiFetch('/api/stocktakes?limit=50')
          if (Array.isArray(recentStocktakes)) {
            stocktakeIds = recentStocktakes.map((s: any) => s._id || s.id).filter(id => id)
          } else {
            stocktakeIds = []
          }
        } catch (err) {
          console.error('Error fetching stocktakes:', err)
          toast({ 
            title: "No Data", 
            description: "No stocktake data found to export", 
            variant: "destructive" 
          })
          return
        }
      }
      
      if (stocktakeIds.length === 0) {
        toast({ 
          title: "No Data to Export", 
          description: "Complete a stocktake first to generate reports", 
          variant: "destructive" 
        })
        return
      }
      
      // Get auth token
      const token = localStorage.getItem('token')
      if (!token) {
        toast({ 
          title: "Authentication Error", 
          description: "Please log in to export reports", 
          variant: "destructive" 
        })
        return
      }
      
      // Generate PDF
      const pdfResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/stocktakes/export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ stocktakeIds, format: 'pdf' })
      })
      
      if (pdfResponse.ok) {
        const pdfBlob = await pdfResponse.blob()
        const pdfUrl = URL.createObjectURL(pdfBlob)
        const pdfLink = document.createElement('a')
        pdfLink.href = pdfUrl
        pdfLink.download = `stocktake-report-${new Date().toISOString().split('T')[0]}.pdf`
        document.body.appendChild(pdfLink)
        pdfLink.click()
        document.body.removeChild(pdfLink)
        URL.revokeObjectURL(pdfUrl)
      } else {
        const errorData = await pdfResponse.json()
        throw new Error(errorData.error || 'Failed to generate PDF')
      }
      
      // Generate XLSX
      const xlsxResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/stocktakes/export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ stocktakeIds, format: 'xlsx' })
      })
      
      if (xlsxResponse.ok) {
        const xlsxBlob = await xlsxResponse.blob()
        const xlsxUrl = URL.createObjectURL(xlsxBlob)
        const xlsxLink = document.createElement('a')
        xlsxLink.href = xlsxUrl
        xlsxLink.download = `stocktake-report-${new Date().toISOString().split('T')[0]}.xlsx`
        document.body.appendChild(xlsxLink)
        xlsxLink.click()
        document.body.removeChild(xlsxLink)
        URL.revokeObjectURL(xlsxUrl)
      } else {
        const errorData = await xlsxResponse.json()
        throw new Error(errorData.error || 'Failed to generate Excel file')
      }
      
      toast({ 
        title: "Reports Generated", 
        description: "PDF and Excel reports have been downloaded" 
      })
    } catch (err) {
      console.error('Error generating reports:', err)
      toast({ 
        title: "Export Error", 
        description: "Could not generate reports, but stocktake was saved", 
        variant: "destructive" 
      })
    }
  }

  const validateStocktake = () => {
    const errors: string[] = []
    
    // Check for negative stock counts
    const negativeItems = stocktakeItems.filter(item => item.actualStock < 0)
    if (negativeItems.length > 0) {
      errors.push("Stock counts cannot be negative")
    }
    
    // Check for discrepancies without reasons
    const discrepanciesWithoutReasons = stocktakeItems.filter(item => 
      item.discrepancy !== 0 && (!item.notes || item.notes.trim() === "")
    )
    if (discrepanciesWithoutReasons.length > 0) {
      errors.push("Reasons are required for all discrepancies")
    }
    
    return errors
  }

  const handleSubmit = async () => {
    if (!user?.id && !user?._id) {
      toast({ title: "Error", description: "You must be logged in to submit stocktake", variant: "destructive" })
      return
    }

    // Validate before submission
    const validationErrors = validateStocktake()
    if (validationErrors.length > 0) {
      toast({ 
        title: "Validation Error", 
        description: validationErrors.join(", "), 
        variant: "destructive" 
      })
      return
    }

    setSubmitting(true)
    try {
      // Filter items that have been counted (actual stock differs from expected)
      const itemsToSubmit = stocktakeItems.filter(item => 
        item.actualStock !== item.expectedStock || item.notes.trim() !== ""
      )

      if (itemsToSubmit.length === 0) {
        toast({ title: "No changes to submit", description: "All items match expected stock levels" })
        return
      }

      // Submit all items in a single batch
      const stocktakeData = itemsToSubmit.map(item => ({
        productId: item.id,
        counted: item.actualStock,
        countedBy: user.id || user._id,
        reason: item.discrepancy !== 0 ? item.notes : undefined,
      }))

      const response = await apiFetch("/api/stocktakes/bulk", {
        method: "POST",
        body: JSON.stringify({ stocktakes: stocktakeData }),
      })

      // Handle partial success
      if (response.errors && response.errors.length > 0) {
        toast({ 
          title: "Partial Success", 
          description: `${response.success} items processed, ${response.errors.length} errors occurred`,
          variant: "destructive"
        })
      } else {
        toast({ 
          title: "Stocktake submitted successfully!", 
          description: `${response.success} items processed` 
        })
        
        // Generate and download reports
        await generateReports(response.results)
      }
      
      // Reset form after successful submission
      setStocktakeItems(prev => prev.map(item => ({
        ...item,
        actualStock: item.expectedStock,
        discrepancy: 0,
        notes: ""
      })))
    } catch (err: any) {
      toast({ 
        title: "Error submitting stocktake", 
        description: err.message || "Please try again", 
        variant: "destructive" 
      })
    } finally {
      setSubmitting(false)
    }
  }

  const totalDiscrepancies = stocktakeItems.filter((item) => item.discrepancy !== 0).length

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading products...</div>
  if (error) return <div className="p-8 text-center text-destructive">{error}</div>

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Items Counted</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stocktakeItems.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Discrepancies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{totalDiscrepancies}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Badge variant="outline">In Progress</Badge>
              {lastSaved && (
                <div className="text-xs text-muted-foreground">
                  Last saved: {lastSaved.toLocaleTimeString()}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {totalDiscrepancies > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{totalDiscrepancies} item(s) have discrepancies that need to be reviewed.</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Stock Count</CardTitle>
          <CardDescription>Enter the actual stock count for each item</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                type="search" 
                placeholder="Search products by name or SKU..." 
                className="pl-8" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {searchTerm && (
              <p className="text-sm text-muted-foreground mt-2">
                Showing {filteredItems.length} of {stocktakeItems.length} products
              </p>
            )}
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Expected</TableHead>
                <TableHead>Actual Count</TableHead>
                <TableHead>Discrepancy</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map((item) => (
                <TableRow 
                  key={item.id} 
                  className={item.discrepancy !== 0 ? "bg-yellow-50" : ""}
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {item.name}
                      {item.discrepancy !== 0 && (
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{item.sku}</TableCell>
                  <TableCell>{item.expectedStock}</TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={item.actualStock}
                      onChange={(e) => updateActualStock(item.id, Number.parseInt(e.target.value) || 0)}
                      className="w-20"
                      min="0"
                    />
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={item.discrepancy === 0 ? "default" : item.discrepancy > 0 ? "outline" : "destructive"}
                    >
                      {item.discrepancy > 0 ? "+" : ""}
                      {item.discrepancy}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Input
                      placeholder={item.discrepancy !== 0 ? "Reason required..." : "Add notes..."}
                      value={item.notes}
                      onChange={(e) => updateNotes(item.id, e.target.value)}
                      className={`w-40 ${item.discrepancy !== 0 && !item.notes ? "border-red-300" : ""}`}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="mt-6 flex justify-between">
            <div className="flex space-x-2">
              <Button variant="outline" onClick={loadDraft} disabled={submitting || saving}>
                Load Draft
              </Button>
              <Button variant="outline" onClick={handleSaveDraft} disabled={submitting || saving}>
                {saving ? "Saving..." : "Save Draft"}
              </Button>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => generateReports([])} disabled={submitting}>
                Export Reports
              </Button>
              <Button onClick={handleSubmit} disabled={submitting}>
                <Save className="mr-2 h-4 w-4" />
                {submitting ? "Submitting..." : "Complete Stocktake"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
