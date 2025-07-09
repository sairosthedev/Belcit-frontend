"use client";

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { useState } from "react"

export function SalesHeader({ onSearch }: { onSearch?: (query: string) => void }) {
  const [search, setSearch] = useState("");
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Point of Sale</h1>
        <p className="text-muted-foreground">Process customer transactions quickly and efficiently.</p>
      </div>
      <div className="flex items-center gap-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Scan barcode or search..."
            className="w-full pl-8 sm:w-[300px]"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter" && onSearch) {
                onSearch(search.trim());
                setSearch("");
              }
            }}
          />
        </div>
        <Button variant="outline">View Sales History</Button>
      </div>
    </div>
  )
}
