"use client"

import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { ExpensesHeader } from "@/components/expenses/expenses-header"
import { ExpensesTable } from "@/components/expenses/expenses-table"
import { useState } from "react"

export default function ExpensesPage() {
  const [refreshKey, setRefreshKey] = useState(0)
  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <h1 className="text-lg font-semibold">Expenses</h1>
      </header>
      <div className="flex flex-col gap-6 p-6">
        <ExpensesHeader onCreated={() => setRefreshKey(k => k + 1)} />
        <ExpensesTable key={refreshKey} />
      </div>
    </>
  )
}
