"use client"

import { useState } from "react"
import { MoreHorizontal, ArrowUpDown, ArrowUp, ArrowDown, History } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"

export function InventoryTable() {
  const [inventory, setInventory] = useState(inventoryData)

  return (
    <Card>
      <CardContent className="p-0">
        <div className="flex items-center justify-between p-4">
          <div className="flex flex-1 items-center space-x-2">
            <Select defaultValue="all">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="dairy">Dairy</SelectItem>
                <SelectItem value="bakery">Bakery</SelectItem>
                <SelectItem value="beverages">Beverages</SelectItem>
                <SelectItem value="produce">Produce</SelectItem>
                <SelectItem value="meat">Meat & Poultry</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="all">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="in-stock">In Stock</SelectItem>
                <SelectItem value="low-stock">Low Stock</SelectItem>
                <SelectItem value="out-of-stock">Out of Stock</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <Select defaultValue="20">
              <SelectTrigger className="w-[80px]">
                <SelectValue placeholder="20" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button variant="ghost" className="p-0 hover:bg-transparent">
                  Product Name
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Current Stock</TableHead>
              <TableHead>Reorder Level</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inventory.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>{item.sku}</TableCell>
                <TableCell>{item.category}</TableCell>
                <TableCell>{item.currentStock}</TableCell>
                <TableCell>{item.reorderLevel}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      item.status === "In Stock" ? "default" : item.status === "Low Stock" ? "outline" : "destructive"
                    }
                  >
                    {item.status}
                  </Badge>
                </TableCell>
                <TableCell>{item.lastUpdated}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem>
                        <ArrowUp className="mr-2 h-4 w-4" />
                        Stock In
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <ArrowDown className="mr-2 h-4 w-4" />
                        Stock Out
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <History className="mr-2 h-4 w-4" />
                        View History
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="flex items-center justify-end space-x-2 p-4">
          <Button variant="outline" size="sm">
            Previous
          </Button>
          <Button variant="outline" size="sm">
            Next
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

const inventoryData = [
  {
    id: 1,
    name: "Fresh Milk 1L",
    sku: "DRY-1001",
    category: "Dairy",
    currentStock: 45,
    reorderLevel: 20,
    status: "In Stock",
    lastUpdated: "2023-07-05",
  },
  {
    id: 2,
    name: "Whole Wheat Bread",
    sku: "BKY-2034",
    category: "Bakery",
    currentStock: 28,
    reorderLevel: 15,
    status: "In Stock",
    lastUpdated: "2023-07-06",
  },
  {
    id: 3,
    name: "Organic Eggs (12pk)",
    sku: "DRY-1087",
    category: "Dairy",
    currentStock: 12,
    reorderLevel: 10,
    status: "Low Stock",
    lastUpdated: "2023-07-06",
  },
  {
    id: 4,
    name: "Premium Coffee Beans",
    sku: "BEV-3045",
    category: "Beverages",
    currentStock: 8,
    reorderLevel: 10,
    status: "Low Stock",
    lastUpdated: "2023-07-04",
  },
  {
    id: 5,
    name: "Chicken Breast (1kg)",
    sku: "MET-4023",
    category: "Meat & Poultry",
    currentStock: 15,
    reorderLevel: 12,
    status: "In Stock",
    lastUpdated: "2023-07-07",
  },
  {
    id: 6,
    name: "Organic Bananas (1kg)",
    sku: "PRD-5012",
    category: "Produce",
    currentStock: 50,
    reorderLevel: 25,
    status: "In Stock",
    lastUpdated: "2023-07-07",
  },
  {
    id: 7,
    name: "Chocolate Chip Cookies",
    sku: "BKY-2089",
    category: "Bakery",
    currentStock: 0,
    reorderLevel: 15,
    status: "Out of Stock",
    lastUpdated: "2023-07-03",
  },
  {
    id: 8,
    name: "Coca Cola 2L",
    sku: "BEV-3078",
    category: "Beverages",
    currentStock: 60,
    reorderLevel: 30,
    status: "In Stock",
    lastUpdated: "2023-07-05",
  },
]
