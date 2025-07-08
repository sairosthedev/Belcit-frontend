"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, Box, ClipboardList, DollarSign, Home, Package, ShoppingCart, Truck, LogOut } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";

export function DashboardSidebar() {
  const pathname = usePathname()

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(`${path}/`)
  }

  const auth = useAuth() as any;
  const user = auth?.user;
  const logout = auth?.logout;
  const router = useRouter();

  const handleLogout = async () => {
    if (logout) {
      await logout();
      router.push("/");
    }
  };

  // Role-based menu items
  const canViewReports = user && ["superAdmin", "accountant", "manager"].includes(user.role);

  return (
    <Sidebar variant="inset">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2">
          <Box className="h-6 w-6" />
          <span className="text-lg font-bold">BELCIT TRADING</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/dashboard"}>
                  <Link href="/dashboard">
                    <Home />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/dashboard/products")}> 
                  <Link href="/dashboard/products">
                    <Package />
                    <span>Products</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/dashboard/inventory")}> 
                  <Link href="/dashboard/inventory">
                    <Box />
                    <span>Inventory</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/dashboard/sales")}> 
                  <Link href="/dashboard/sales">
                    <ShoppingCart />
                    <span>Sales (POS)</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/dashboard/purchases")}> 
                  <Link href="/dashboard/purchases">
                    <Truck />
                    <span>Purchases</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/dashboard/expenses")}> 
                  <Link href="/dashboard/expenses">
                    <DollarSign />
                    <span>Expenses</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {canViewReports && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isActive("/dashboard/reports")}> 
                    <Link href="/dashboard/reports">
                      <BarChart3 />
                      <span>Reports</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/dashboard/stocktake")}> 
                  <Link href="/dashboard/stocktake">
                    <ClipboardList />
                    <span>Stocktake</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="flex items-center justify-between p-2">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={user?.picture || "/placeholder.svg?height=32&width=32"} alt="User" />
              <AvatarFallback>{user ? (user.firstName?.[0] || "") + (user.lastName?.[0] || "") : "?"}</AvatarFallback>
            </Avatar>
            <div className="group-data-[collapsible=icon]:hidden">
              <p className="text-sm font-medium">{user ? `${user.firstName} ${user.lastName}` : "Guest"}</p>
              <p className="text-xs text-muted-foreground">{user ? user.role : "Role"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ModeToggle />
            <Button variant="ghost" size="icon" title="Logout" onClick={handleLogout} disabled={!logout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
