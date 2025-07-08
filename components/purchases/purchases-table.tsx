"use client"

import { useState } from "react"
import { MoreHorizontal, ArrowUpDown, FileText, Eye, CheckCircle, XCircle } from "lucide-react"
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

export function PurchasesTable() {
  const [purchases, setPurchases] = useState(purchaseData)

  return (
    <Card>
      <CardContent className="p-0">
        <div className="flex items-center justify-between p-4">
          <div className="flex flex-1 items-center space-x-2">
            <Select defaultValue="all">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="received">Received</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="all">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by supplier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Suppliers</SelectItem>
                <SelectItem value="dairy-farms">Dairy Farms Inc.</SelectItem>
                <SelectItem value="bakery-supplies">Bakery Supplies Co.</SelectItem>
                <SelectItem value="fresh-produce">Fresh Produce Ltd.</SelectItem>
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
                  PO Number
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead>Date Ordered</TableHead>
              <TableHead>Expected Delivery</TableHead>
              <TableHead>Total Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {purchases.map((purchase) => (
              <TableRow key={purchase.id}>
                <TableCell className="font-medium">{purchase.poNumber}</TableCell>
                <TableCell>{purchase.supplier}</TableCell>
                <TableCell>{purchase.dateOrdered}</TableCell>
                <TableCell>{purchase.expectedDelivery}</TableCell>
                <TableCell>${purchase.totalAmount.toFixed(2)}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      purchase.status === "Received"
                        ? "default"
                        : purchase.status === "Pending"
                          ? "outline"
                          : "destructive"
                    }
                  >
                    {purchase.status}
                  </Badge>
                </TableCell>
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
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <FileText className="mr-2 h-4 w-4" />
                        Print PO
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {purchase.status === "Pending" && (
                        <>
                          <DropdownMenuItem>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Mark as Received
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            <XCircle className="mr-2 h-4 w-4" />
                            Cancel Order
                          </DropdownMenuItem>
                        </>
                      )}
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

const purchaseData = [
  {
    id: 1,
    poNumber: "PO-2023-001",
    supplier: "Dairy Farms Inc.",
    dateOrdered: "2023-07-01",
    expectedDelivery: "2023-07-08",
    totalAmount: 1250.0,
    status: "Received",
  },
  {
    id: 2,
    poNumber: "PO-2023-002",
    supplier: "Bakery Supplies Co.",
    dateOrdered: "2023-07-03",
    expectedDelivery: "2023-07-10",
    totalAmount: 850.5,
    status: "Pending",
  },
  {
    id: 3,
    poNumber: "PO-2023-003",
    supplier: "Fresh Produce Ltd.",
    dateOrdered: "2023-07-05",
    expectedDelivery: "2023-07-12",
    totalAmount: 2100.75,
    status: "Pending",
  },
  {
    id: 4,
    poNumber: "PO-2023-004",
    supplier: "Meat & Poultry Co.",
    dateOrdered: "2023-07-02",
    expectedDelivery: "2023-07-09",
    totalAmount: 1800.25,
    status: "Received",
  },
  {
    id: 5,
    poNumber: "PO-2023-005",
    supplier: "Beverage Distributors",
    dateOrdered: "2023-07-04",
    expectedDelivery: "2023-07-11",
    totalAmount: 950.0,
    status: "Cancelled",
  },
]
