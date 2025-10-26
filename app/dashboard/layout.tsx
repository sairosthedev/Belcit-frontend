"use client";

import type React from "react"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { MandatoryCheckinModal } from "@/components/attendance/mandatory-checkin-modal"
import { MandatoryCheckoutModal } from "@/components/attendance/mandatory-checkout-modal"
import { useAuth } from "@/hooks/use-auth"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { 
    user, 
    isCheckedIn, 
    showCheckinModal, 
    showCheckoutModal, 
    handleCheckIn, 
    handleCheckOut, 
    handleCheckOutAndLogout,
    setShowCheckoutModal 
  } = useAuth();

  console.log('DashboardLayout render - isCheckedIn:', isCheckedIn, 'showCheckinModal:', showCheckinModal);

  return (
    <SidebarProvider>
      <DashboardSidebar />
      <SidebarInset>
        {/* Block access if not checked in and modal is showing */}
        {!isCheckedIn && showCheckinModal ? (
          <div className="pointer-events-none opacity-50">
            {children}
          </div>
        ) : (
          children
        )}
      </SidebarInset>
      
      {/* Mandatory Check-in Modal */}
      <MandatoryCheckinModal
        user={user}
        onCheckIn={handleCheckIn}
        isOpen={showCheckinModal}
      />
      
      {/* Mandatory Check-out Modal */}
      <MandatoryCheckoutModal
        user={user}
        onCheckOut={handleCheckOutAndLogout}
        onCancel={() => setShowCheckoutModal(false)}
        isOpen={showCheckoutModal}
      />
    </SidebarProvider>
  )
}
