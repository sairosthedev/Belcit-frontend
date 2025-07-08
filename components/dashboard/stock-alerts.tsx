import { AlertTriangle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function StockAlerts() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center">
        <div className="flex-1">
          <CardTitle>Low Stock Alerts</CardTitle>
          <CardDescription>Products that need restocking</CardDescription>
        </div>
        <AlertTriangle className="h-5 w-5 text-amber-500" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {lowStockItems.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-4">
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-muted-foreground">
                  {item.category} • SKU: {item.sku}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={item.quantity <= 5 ? "destructive" : "outline"}>{item.quantity} left</Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

const lowStockItems = [
  {
    id: 1,
    name: "Fresh Milk 1L",
    category: "Dairy",
    sku: "DRY-1001",
    quantity: 3,
  },
  {
    id: 2,
    name: "Whole Wheat Bread",
    category: "Bakery",
    sku: "BKY-2034",
    quantity: 5,
  },
  {
    id: 3,
    name: "Organic Eggs (12pk)",
    category: "Dairy",
    sku: "DRY-1087",
    quantity: 2,
  },
  {
    id: 4,
    name: "Premium Coffee Beans",
    category: "Beverages",
    sku: "BEV-3045",
    quantity: 8,
  },
]
