"use client";

import { ReactNode } from "react";
import { useTouch } from "@/contexts/touch-context";
import { cn } from "@/lib/utils";

interface DashboardPageWrapperProps {
  children: ReactNode;
  className?: string;
}

export function DashboardPageWrapper({ children, className }: DashboardPageWrapperProps) {
  const { isSmallScreen } = useTouch();
  
  return (
    <div className={cn(
      "flex flex-col gap-6",
      isSmallScreen ? "p-2 gap-4" : "p-4 md:p-6",
      className
    )}>
      {children}
    </div>
  );
}

