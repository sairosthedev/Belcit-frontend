"use client"

import { useEffect, useState } from "react"
import { MoreHorizontal, ArrowUpDown, Edit, Trash2, Receipt, DollarSign } from "lucide-react"
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
import { Skeleton } from "@/components/ui/skeleton"
import { apiFetch } from "@/lib/api"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import ExpenseForm from "./expense-form"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"

export function ExpensesTable({ onChanged }: { onChanged?: () => void }) {
  const [expenses, setExpenses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editExpense, setEditExpense] = useState<any | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const fetchExpenses = () => {
    setLoading(true)
    apiFetch("/api/expenses")
      .then((data) => {
        setExpenses(data)
        toast.success("Expenses loaded", { duration: 1500 })
      })
      .catch((err) => {
        setError(err.message)
        toast.error("Failed to load expenses", { duration: 2000 })
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchExpenses()
  }, [])

  const handleEdit = (expense: any) => {
    setEditExpense(expense)
    setEditOpen(true)
  }

  const handleDelete = async (id: string) => {
    setDeleteLoading(true)
    try {
      await apiFetch(`/api/expenses/${id}`, { method: "DELETE" })
      toast.success("Expense deleted", { duration: 2000 })
      fetchExpenses()
      onChanged?.()
    } catch (e) {
      toast.error("Failed to delete expense", { duration: 2000 })
    } finally {
      setDeleteLoading(false)
      setDeleteId(null)
    }
  }

  if (loading) {
    return (
      <Card className="border-2">
        <CardContent className="p-6">
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="border-2 border-red-500/30">
        <CardContent className="p-8 text-center">
          <p className="text-red-600 mb-4">⚠️ {error}</p>
          <Button onClick={fetchExpenses} variant="outline">Retry</Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="border-2 hover:border-primary/30 transition-all duration-300 shadow-xl bg-gradient-to-br from-background via-background to-primary/5">
          <CardContent className="p-0">
            <div className="flex items-center justify-between p-4 border-b-2 border-primary/10">
              <div className="flex flex-1 items-center space-x-2">
                <Select defaultValue="all">
                  <SelectTrigger className="w-[180px] border-2">
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="utilities">⚡ Utilities</SelectItem>
                    <SelectItem value="rent">🏢 Rent</SelectItem>
                    <SelectItem value="supplies">📦 Supplies</SelectItem>
                    <SelectItem value="maintenance">🔧 Maintenance</SelectItem>
                    <SelectItem value="marketing">📣 Marketing</SelectItem>
                  </SelectContent>
                </Select>
                <Select defaultValue="all">
                  <SelectTrigger className="w-[180px] border-2">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="paid">✅ Paid</SelectItem>
                    <SelectItem value="pending">⏳ Pending</SelectItem>
                    <SelectItem value="overdue">❌ Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Select defaultValue="20">
                  <SelectTrigger className="w-[80px] border-2">
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

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b-2">
                    <TableHead className="font-bold">
                      <Button variant="ghost" className="p-0 hover:bg-transparent font-bold">
                        Description
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead className="font-bold">Category</TableHead>
                    <TableHead className="font-bold">Date</TableHead>
                    <TableHead className="font-bold">Amount</TableHead>
                    <TableHead className="font-bold">Paid By</TableHead>
                    <TableHead className="text-right font-bold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence mode="popLayout">
                    {expenses.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-12">
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                          >
                            <DollarSign className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
                            <p className="text-lg font-semibold text-muted-foreground">No expenses recorded</p>
                            <p className="text-sm text-muted-foreground mt-1">Expenses will appear here as they are added</p>
                          </motion.div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      expenses.map((expense, idx) => (
                        <motion.tr
                          key={expense._id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ delay: idx * 0.03 }}
                          className="border-b hover:bg-primary/5 transition-colors"
                        >
                          <TableCell className="font-semibold">{expense.description}</TableCell>
                          <TableCell>
                            <span className="px-2 py-1 bg-primary/10 rounded-md text-xs font-medium">
                              {expense.category}
                            </span>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{expense.date ? new Date(expense.date).toLocaleDateString() : "-"}</TableCell>
                          <TableCell className="font-bold text-primary">${expense.amount?.toFixed(2)}</TableCell>
                          <TableCell className="text-muted-foreground">{expense.paidBy?.name || "-"}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-primary/10">
                                  <span className="sr-only">Open menu</span>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="border-2">
                                <DropdownMenuLabel className="font-bold">Actions</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => handleEdit(expense)} className="cursor-pointer">
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer">
                                  <Receipt className="mr-2 h-4 w-4" />
                                  View Receipt
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600 cursor-pointer" onClick={() => setDeleteId(expense._id)}>
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
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

      {/* Edit Modal */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="border-2">
          <DialogHeader>
            <DialogTitle className="text-xl">Edit Expense</DialogTitle>
          </DialogHeader>
          {editExpense && (
            <ExpenseForm
              initialData={editExpense}
              onSuccess={() => {
                setEditOpen(false)
                fetchExpenses()
                onChanged?.()
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteId} onOpenChange={v => { if (!v) setDeleteId(null) }}>
        <DialogContent className="border-2">
          <DialogHeader>
            <DialogTitle>Delete Expense</DialogTitle>
          </DialogHeader>
          <div className="py-4">Are you sure you want to delete this expense?</div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setDeleteId(null)} disabled={deleteLoading} className="border-2">Cancel</Button>
            <Button variant="destructive" onClick={() => handleDelete(deleteId!)} disabled={deleteLoading}>
              {deleteLoading ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
