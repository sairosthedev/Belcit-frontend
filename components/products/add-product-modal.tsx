import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { apiFetch } from "@/lib/api"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function AddProductModal({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<{_id: string, name: string}[]>([]);
  const [form, setForm] = useState({
    name: "",
    barcode: "",
    category: "",
    unit: "",
    price: "",
    stock: "",
    minStock: "",
    description: "",
  });

  useEffect(() => {
    if (open) {
      apiFetch("/api/categories")
        .then((data) => setCategories(data))
        .catch(() => setCategories([]));
    }
  }, [open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCategoryChange = (value: string) => {
    setForm({ ...form, category: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiFetch("/api/products", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          price: parseFloat(form.price),
          stock: parseInt(form.stock),
          minStock: parseInt(form.minStock),
        }),
      });
      toast({ title: "Product added!", description: `${form.name} is now available for sale.` });
      onOpenChange(false);
      setForm({ name: "", barcode: "", category: "", unit: "", price: "", stock: "", minStock: "", description: "" });
    } catch (err) {
      toast({ title: "Error", description: (err as Error).message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input name="name" placeholder="Product Name" value={form.name} onChange={handleChange} required />
          <Input name="barcode" placeholder="Barcode (optional)" value={form.barcode} onChange={handleChange} />
          <Select value={form.category} onValueChange={handleCategoryChange} required>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat._id} value={cat.name}>{cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input name="unit" placeholder="Unit (e.g. pcs, kg)" value={form.unit} onChange={handleChange} required />
          <Input name="price" type="number" step="0.01" placeholder="Price" value={form.price} onChange={handleChange} required />
          <Input name="stock" type="number" placeholder="Initial Stock" value={form.stock} onChange={handleChange} required />
          <Input name="minStock" type="number" placeholder="Reorder Level (optional)" value={form.minStock} onChange={handleChange} />
          <Input name="description" placeholder="Description (optional)" value={form.description} onChange={handleChange} />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? "Adding..." : "Add Product"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 