"use client"

import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { AddProductModal } from "./add-product-modal"

export function ProductsHeader({ search, setSearch, onAdd, refreshKey }: {
  search: string,
  setSearch: (s: string) => void,
  onAdd: () => void,
  refreshKey: number,
}) {
  const [open, setOpen] = useState(false)
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Products</h1>
        <p className="text-muted-foreground">Manage your product catalog and inventory.</p>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input placeholder="Search products..." className="sm:w-[250px]" value={search} onChange={e => setSearch(e.target.value)} />
        <Button onClick={() => { setOpen(true); onAdd(); }}>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>
      <AddProductModal open={open} onOpenChange={o => { setOpen(o); if (!o) onAdd(); }} />
    </div>
  )
}
