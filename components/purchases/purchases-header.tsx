"use client"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useState } from "react"
import PurchaseOrderForm from "./purchase-order-form"

export function PurchasesHeader({ onCreated }: { onCreated?: () => void }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Purchases</h1>
        <p className="text-muted-foreground">Manage supplier orders and stock receipts.</p>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="default" size="sm" className="gap-1">
              <Plus className="h-4 w-4" /> New Purchase Order
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Purchase Order</DialogTitle>
            </DialogHeader>
            <PurchaseOrderForm onSuccess={() => { setOpen(false); onCreated?.(); }} />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
