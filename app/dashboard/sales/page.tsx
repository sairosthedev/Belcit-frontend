"use client";

import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { POSSystem } from "@/components/sales/pos-system"
import { useTouch } from "@/contexts/touch-context"

export default function SalesPage() {
  const { isSmallScreen } = useTouch();
  
  return (
    <>
      <header className={`flex ${isSmallScreen ? 'h-14' : 'h-16'} shrink-0 items-center gap-2 border-b ${isSmallScreen ? 'px-2' : 'px-4'}`}>
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
      </header>
      <div className={`flex flex-col gap-6 ${isSmallScreen ? 'p-2' : 'p-4 md:p-6'}`}>
        <POSSystem />
      </div>
    </>
  )
}
