import { useState, useEffect, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { apiFetch } from "@/lib/api"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function AddProductModal({ open, onOpenChange, initialData, mode = 'add', onSuccess }: {
  open: boolean,
  onOpenChange: (open: boolean) => void,
  initialData?: any,
  mode?: 'add' | 'edit',
  onSuccess?: () => void
}) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<{_id: string, name: string}[]>([]);
  const [form, setForm] = useState({
    name: initialData?.name || "",
    barcode: initialData?.barcode || "",
    category: initialData?.category || "",
    unit: initialData?.unit || "",
    price: initialData?.price?.toString() || "",
    stock: initialData?.stock?.toString() || "",
    minStock: initialData?.minStock?.toString() || "",
    description: initialData?.description || "",
  });
  const barcodeRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      apiFetch("/api/categories")
        .then((data) => setCategories(data))
        .catch(() => setCategories([]));
    }
  }, [open]);

  useEffect(() => {
    if (open && barcodeRef.current) {
      barcodeRef.current.focus();
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      setForm({
        name: initialData?.name || "",
        barcode: initialData?.barcode || "",
        category: initialData?.category || "",
        unit: initialData?.unit || "",
        price: initialData?.price?.toString() || "",
        stock: initialData?.stock?.toString() || "",
        minStock: initialData?.minStock?.toString() || "",
        description: initialData?.description || "",
      });
    }
  }, [open, initialData]);

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
      if (mode === 'add') {
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
      } else if (mode === 'edit' && initialData?._id) {
        await apiFetch(`/api/products/${initialData._id}`, {
          method: "PUT",
          body: JSON.stringify({
            ...form,
            price: parseFloat(form.price),
            stock: parseInt(form.stock),
            minStock: parseInt(form.minStock),
          }),
        });
        toast({ title: "Product updated!", description: `${form.name} has been updated.` });
      }
      onOpenChange(false);
      if (onSuccess) onSuccess();
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
          <DialogTitle>{mode === 'add' ? 'Add New Product' : 'Edit Product'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input name="name" placeholder="Product Name" value={form.name} onChange={handleChange} required />
          <Input name="barcode" placeholder="Barcode (optional)" value={form.barcode} onChange={handleChange} ref={barcodeRef} />
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
            <Button type="submit" disabled={loading}>{loading ? (mode === 'add' ? "Adding..." : "Saving...") : (mode === 'add' ? "Add Product" : "Save Changes")}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 