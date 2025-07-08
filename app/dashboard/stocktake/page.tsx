import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { StocktakeHeader } from "@/components/stocktake/stocktake-header"
import { StocktakeForm } from "@/components/stocktake/stocktake-form"

export default function StocktakePage() {
  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <h1 className="text-lg font-semibold">Stocktake</h1>
      </header>
      <div className="flex flex-col gap-6 p-6">
        <StocktakeHeader />
        <StocktakeForm />
      </div>
    </>
  )
}
