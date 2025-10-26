"use client"
import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { apiFetch } from "@/lib/api"

export default function PurchaseOrderForm({ onSuccess }: { onSuccess?: () => void }) {
  const [suppliers, setSuppliers] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [supplier, setSupplier] = useState("")
  const [showAddSupplier, setShowAddSupplier] = useState(false)
  const [newSupplier, setNewSupplier] = useState({ name: "", address: "", contactInfo: "", email: "", phone: "" })
  const [items, setItems] = useState<any[]>([])
  const [expectedDate, setExpectedDate] = useState("")
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Fetch suppliers and products
  useEffect(() => {
    apiFetch("/api/vendors").then(setSuppliers)
    apiFetch("/api/products").then(setProducts)
  }, [])

  // Add new supplier
  const handleAddSupplier = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await apiFetch("/api/vendors", {
        method: "POST",
        body: JSON.stringify(newSupplier),
        headers: { "Content-Type": "application/json" },
      })
      setSuppliers((prev) => [...prev, res])
      setSupplier(res._id)
      setShowAddSupplier(false)
      setNewSupplier({ name: "", address: "", contactInfo: "", email: "", phone: "" })
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  // Add product to items
  const handleAddItem = () => {
    setItems([...items, { product: "", quantity: 1, cost: 0 }])
  }

  // Update item
  const handleItemChange = (idx: number, field: string, value: any) => {
    setItems(items.map((item, i) => i === idx ? { ...item, [field]: value } : item))
  }

  // Remove item
  const handleRemoveItem = (idx: number) => {
    setItems(items.filter((_, i) => i !== idx))
  }

  // Submit purchase order
  const handleSubmit = async (e: any) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await apiFetch("/api/purchases", {
        method: "POST",
        body: JSON.stringify({
          supplier,
          items,
          expectedDeliveryDate: expectedDate,
          notes,
        }),
        headers: { "Content-Type": "application/json" },
      })
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
      {success && <div className="text-green-600 text-sm">Purchase order created!</div>}
      {/* Supplier select */}
      <div>
        <label className="block text-sm font-medium mb-1">Supplier</label>
        <div className="flex gap-2">
          <select
            className="border rounded px-2 py-1 flex-1"
            value={supplier}
            onChange={e => setSupplier(e.target.value)}
            required
          >
            <option value="">Select supplier</option>
            {suppliers.map((s: any) => (
              <option key={s._id} value={s._id}>{s.name}</option>
            ))}
          </select>
          <Button type="button" size="sm" onClick={() => setShowAddSupplier(true)}>Add</Button>
        </div>
        {showAddSupplier && (
          <div className="border p-2 mt-2 rounded bg-muted">
            <div className="flex gap-2 mb-2">
              <Input placeholder="Name" value={newSupplier.name} onChange={e => setNewSupplier({ ...newSupplier, name: e.target.value })} required />
              <Input placeholder="Email" value={newSupplier.email} onChange={e => setNewSupplier({ ...newSupplier, email: e.target.value })} />
            </div>
            <div className="flex gap-2 mb-2">
              <Input placeholder="Phone" value={newSupplier.phone} onChange={e => setNewSupplier({ ...newSupplier, phone: e.target.value })} />
              <Input placeholder="Contact Info" value={newSupplier.contactInfo} onChange={e => setNewSupplier({ ...newSupplier, contactInfo: e.target.value })} />
            </div>
            <Input placeholder="Address" value={newSupplier.address} onChange={e => setNewSupplier({ ...newSupplier, address: e.target.value })} className="mb-2" />
            <div className="flex gap-2">
              <Button type="button" size="sm" onClick={handleAddSupplier} disabled={loading || !newSupplier.name}>Save</Button>
              <Button type="button" size="sm" variant="outline" onClick={() => setShowAddSupplier(false)}>Cancel</Button>
            </div>
          </div>
        )}
      </div>
      {/* Products */}
      <div>
        <label className="block text-sm font-medium mb-1">Products</label>
        {items.map((item, idx) => (
          <div key={idx} className="flex gap-2 mb-2 items-center">
            <select
              className="border rounded px-2 py-1 flex-1"
              value={item.product}
              onChange={e => handleItemChange(idx, "product", e.target.value)}
              required
            >
              <option value="">Select product</option>
              {products.map((p: any) => (
                <option key={p._id} value={p._id}>{p.name}</option>
              ))}
            </select>
            <Input
              type="number"
              min={1}
              className="w-20"
              value={item.quantity}
              onChange={e => handleItemChange(idx, "quantity", Number(e.target.value))}
              placeholder="Qty"
              required
            />
            <Input
              type="number"
              min={0}
              className="w-24"
              value={item.cost}
              onChange={e => handleItemChange(idx, "cost", Number(e.target.value))}
              placeholder="Cost"
              required
            />
            <Button type="button" size="icon" variant="ghost" onClick={() => handleRemoveItem(idx)}>-</Button>
          </div>
        ))}
        <Button type="button" size="sm" onClick={handleAddItem}>Add Product</Button>
      </div>
      {/* Expected delivery date */}
      <div>
        <label className="block text-sm font-medium mb-1">Expected Delivery Date</label>
        <Input type="date" value={expectedDate} onChange={e => setExpectedDate(e.target.value)} required />
      </div>
      {/* Notes */}
      <div>
        <label className="block text-sm font-medium mb-1">Notes</label>
        <Input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Optional notes..." />
      </div>
      <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Create Purchase Order"}</Button>
    </form>
  )
} 