"use client"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { ProductsHeader } from "@/components/products/products-header"
import { ProductsTable } from "@/components/products/products-table"
import { DashboardPageWrapper } from "@/components/dashboard/dashboard-page-wrapper"
import { useTouch } from "@/contexts/touch-context"
import { useState } from "react"

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const handleAdd = () => setRefreshKey(k => k + 1);
  const { isSmallScreen } = useTouch();
  
  return (
    <>
      <header className={`flex ${isSmallScreen ? 'h-14' : 'h-16'} shrink-0 items-center gap-2 border-b ${isSmallScreen ? 'px-2' : 'px-4'}`}>
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <h1 className={`${isSmallScreen ? 'text-base' : 'text-lg'} font-semibold`}>Products</h1>
      </header>
      <DashboardPageWrapper>
        <ProductsHeader search={search} setSearch={setSearch} onAdd={handleAdd} refreshKey={refreshKey} />
        <ProductsTable search={search} refreshKey={refreshKey} />
      </DashboardPageWrapper>
    </>
  )
}
