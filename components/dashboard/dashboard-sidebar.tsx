"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, Box, ClipboardList, Clock, DollarSign, Home, Package, ShoppingCart, Truck, LogOut, Sparkles } from "lucide-react"
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
import { CheckinStatusIndicator } from "@/components/attendance/checkin-status-indicator";
import { motion } from "framer-motion"

export function DashboardSidebar() {
  const pathname = usePathname()

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(`${path}/`)
  }

  const auth = useAuth() as any;
  const user = auth?.user;
  const logout = auth?.logout;
  const isCheckedIn = auth?.isCheckedIn;
  const router = useRouter();

  const handleLogout = async () => {
    if (logout) {
      await logout();
    }
  };

  // Role-based menu items
  const isSuperAdmin = user && user.role === "superAdmin";
  const isAdmin = user && user.role === "admin";
  const isManager = user && user.role === "manager";
  const isStockClerk = user && user.role === "stockClerk";
  const isCashier = user && user.role === "cashier";

  const menuItems = [
    {
      path: "/dashboard",
      icon: Home,
      label: "Dashboard",
      show: true
    },
    {
      path: "/dashboard/products",
      icon: Package,
      label: "Products",
      show: isManager || isStockClerk || isAdmin || isSuperAdmin
    },
    {
      path: "/dashboard/inventory",
      icon: Box,
      label: "Inventory",
      show: isManager || isStockClerk || isAdmin || isSuperAdmin
    },
    {
      path: "/dashboard/sales",
      icon: ShoppingCart,
      label: "Sales (POS)",
      show: isCashier || isManager || isAdmin || isSuperAdmin
    },
    {
      path: "/dashboard/purchases",
      icon: Truck,
      label: "Purchases",
      show: isManager || isAdmin || isSuperAdmin
    },
    {
      path: "/dashboard/expenses",
      icon: DollarSign,
      label: "Expenses",
      show: isManager || isAdmin || isSuperAdmin
    },
    {
      path: "/dashboard/reports",
      icon: BarChart3,
      label: "Reports",
      show: isManager || isAdmin || isSuperAdmin
    },
    {
      path: "/dashboard/stocktake",
      icon: ClipboardList,
      label: "Stocktake",
      show: isStockClerk || isManager || isAdmin || isSuperAdmin
    },
    {
      path: "/dashboard/attendance",
      icon: Clock,
      label: "Attendance",
      show: isCashier || isManager || isStockClerk || isAdmin || isSuperAdmin
    }
  ];

  return (
    <Sidebar variant="inset">
      <SidebarHeader>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2 px-2"
        >
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 5 }}
          >
            <Box className="h-6 w-6 text-primary" />
          </motion.div>
          <span className="text-lg font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            BELCIT TRADING
          </span>
          <Sparkles className="h-4 w-4 text-yellow-500 ml-auto" />
        </motion.div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-bold uppercase tracking-wider">Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item, index) => (
                item.show && (
                  <motion.div
                    key={item.path}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive(item.path)}
                        className="transition-all duration-200 hover:bg-primary/10 data-[active=true]:bg-gradient-to-r data-[active=true]:from-purple-600 data-[active=true]:to-blue-600 data-[active=true]:text-white"
                      >
                        <Link href={item.path}>
                          <item.icon className="h-4 w-4" />
                          <span className="font-medium">{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </motion.div>
                )
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-between p-2 border-t-2 border-primary/10"
        >
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Avatar className="border-2 border-primary/20">
                <AvatarImage src={user?.picture || "/placeholder.svg?height=32&width=32"} alt="User" />
                <AvatarFallback className="bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold">
                  {user ? (user.firstName?.[0] || "") + (user.lastName?.[0] || "") : "?"}
                </AvatarFallback>
              </Avatar>
            </motion.div>
            <div className="group-data-[collapsible=icon]:hidden">
              <p className="text-sm font-semibold">{user ? `${user.firstName} ${user.lastName}` : "Guest"}</p>
              <p className="text-xs text-muted-foreground font-medium">{user ? user.role : "Role"}</p>
              <div className="mt-1">
                <CheckinStatusIndicator isCheckedIn={isCheckedIn} />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ModeToggle />
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Button
                variant="ghost"
                size="icon"
                title="Logout"
                onClick={handleLogout}
                disabled={!logout}
                className="hover:bg-red-500/10 hover:text-red-500 transition-colors"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </SidebarFooter>
    </Sidebar>
  )
}
