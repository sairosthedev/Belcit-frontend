"use client";

import type React from "react"
import { useEffect, useState } from "react"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { MandatoryCheckinModal } from "@/components/attendance/mandatory-checkin-modal"
import { MandatoryCheckoutModal } from "@/components/attendance/mandatory-checkout-modal"
import { useAuth } from "@/hooks/use-auth"
import { useTouch } from "@/contexts/touch-context"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [mounted, setMounted] = useState(false);
  const authContext = useAuth() as any;
  const { isSmallScreen } = useTouch();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Provide default values if auth context is not available
  const user = authContext?.user ?? null;
  const isCheckedIn = authContext?.isCheckedIn ?? false;
  const showCheckinModal = authContext?.showCheckinModal ?? false;
  const showCheckoutModal = authContext?.showCheckoutModal ?? false;
  const handleCheckIn = authContext?.handleCheckIn ?? (() => {});
  const handleCheckOut = authContext?.handleCheckOut ?? (() => {});
  const handleCheckOutAndLogout = authContext?.handleCheckOutAndLogout ?? (() => {});
  const setShowCheckoutModal = authContext?.setShowCheckoutModal ?? ((value: boolean) => {});

  console.log('DashboardLayout render - isCheckedIn:', isCheckedIn, 'showCheckinModal:', showCheckinModal);

  return (
    <SidebarProvider>
      <DashboardSidebar />
      <SidebarInset>
        {/* Always render children to maintain layout router structure */}
        <div 
          className={`${!mounted || (!isCheckedIn && showCheckinModal) ? "pointer-events-none opacity-50" : ""} ${isSmallScreen ? "p-2" : "p-3 md:p-4 lg:p-6"} w-full max-w-full overflow-x-hidden`}
        >
            {children}
        </div>
        {!mounted && (
          <AppLoader 
            message="Loading Dashboard" 
            onComplete={() => setMounted(true)} 
          />
        )}
      </SidebarInset>
      
      {/* Mandatory Check-in Modal */}
      {mounted && (
        <>
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
        </>
      )}
    </SidebarProvider>
  )
}
