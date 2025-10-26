"use client"
import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { apiFetch } from "@/lib/api"

const categories = [
  "Utilities",
  "Rent",
  "Supplies",
  "Maintenance",
  "Marketing",
  "Other",
]

export default function ExpenseForm({ initialData, onSuccess }: { initialData?: any, onSuccess?: () => void }) {
  const [description, setDescription] = useState("")
  const [amount, setAmount] = useState("")
  const [category, setCategory] = useState("")
  const [date, setDate] = useState("")
  const [paidBy, setPaidBy] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (initialData) {
      setDescription(initialData.description || "")
      setAmount(initialData.amount?.toString() || "")
      setCategory(initialData.category || "")
      setDate(initialData.date ? new Date(initialData.date).toISOString().slice(0, 10) : "")
      setPaidBy(initialData.paidBy?.name || initialData.paidBy || "")
    }
  }, [initialData])

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      if (initialData && initialData._id) {
        await apiFetch(`/api/expenses/${initialData._id}`, {
          method: "PUT",
          body: JSON.stringify({
            description,
            amount: parseFloat(amount),
            category,
            date: date || undefined,
            paidBy: paidBy || undefined,
          }),
          headers: { "Content-Type": "application/json" },
        })
      } else {
        await apiFetch("/api/expenses", {
          method: "POST",
          body: JSON.stringify({
            description,
            amount: parseFloat(amount),
            category,
            date: date || undefined,
            paidBy: paidBy || undefined,
          }),
          headers: { "Content-Type": "application/json" },
        })
      }
      setSuccess(true)
      onSuccess?.()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="text-red-500 text-sm">{error}</div>}
      {success && <div className="text-green-600 text-sm">Expense {initialData ? "updated" : "added"}!</div>}
      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <Input value={description} onChange={e => setDescription(e.target.value)} required />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Amount</label>
        <Input type="number" min={0} step="0.01" value={amount} onChange={e => setAmount(e.target.value)} required />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Category</label>
        <select className="border rounded px-2 py-1 w-full" value={category} onChange={e => setCategory(e.target.value)} required>
          <option value="">Select category</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Date</label>
        <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Paid By</label>
        <Input value={paidBy} onChange={e => setPaidBy(e.target.value)} placeholder="Staff name (optional)" />
      </div>
      <Button type="submit" disabled={loading}>{loading ? (initialData ? "Saving..." : "Adding...") : (initialData ? "Save Changes" : "Add Expense")}</Button>
    </form>
  )
} 