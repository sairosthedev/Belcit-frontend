"use client"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { ProductsHeader } from "@/components/products/products-header"
import { ProductsTable } from "@/components/products/products-table"
import { useState } from "react"

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const handleAdd = () => setRefreshKey(k => k + 1);
  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <h1 className="text-lg font-semibold">Products</h1>
      </header>
      <div className="flex flex-col gap-6 p-6">
        <ProductsHeader search={search} setSearch={setSearch} onAdd={handleAdd} refreshKey={refreshKey} />
        <ProductsTable search={search} refreshKey={refreshKey} />
      </div>
    </>
  )
}
