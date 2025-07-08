import { TrendingUp } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

export function TopSellingProducts() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center">
        <div className="flex-1">
          <CardTitle>Top Selling Products</CardTitle>
          <CardDescription>This week's best performers</CardDescription>
        </div>
        <TrendingUp className="h-5 w-5 text-green-500" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topSellingProducts.map((product) => (
            <div key={product.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="font-medium">{product.name}</p>
                <span className="text-sm font-medium">{product.sold} sold</span>
              </div>
              <Progress value={product.percentage} className="h-2" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

const topSellingProducts = [
  {
    id: 1,
    name: "Fresh Milk 1L",
    sold: 245,
    percentage: 85,
  },
  {
    id: 2,
    name: "White Bread",
    sold: 190,
    percentage: 65,
  },
  {
    id: 3,
    name: "Chicken Breast",
    sold: 175,
    percentage: 60,
  },
  {
    id: 4,
    name: "Coca Cola 2L",
    sold: 165,
    percentage: 55,
  },
]
