"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { usePOSDevice } from "@/hooks/use-pos-device";

interface TouchContextType {
  isPOSDevice: boolean;
  isTouchDevice: boolean;
  isSmallScreen: boolean;
  buttonSize: "sm" | "default" | "lg";
  iconButtonSize: "sm" | "default" | "lg" | "icon";
  touchPadding: string;
  minTouchSize: string;
}

const TouchContext = createContext<TouchContextType | undefined>(undefined);

export function TouchProvider({ children }: { children: React.ReactNode }) {
  const { isPOSDevice, isTouchDevice, isSmallScreen } = usePOSDevice();
  
  // Determine optimal sizes based on device type
  const buttonSize = isPOSDevice || isTouchDevice ? "lg" : "default";
  const iconButtonSize = isPOSDevice || isTouchDevice ? "default" : "icon";
  const touchPadding = isPOSDevice || isTouchDevice ? "p-2" : "p-1";
  const minTouchSize = isPOSDevice || isTouchDevice ? "min-h-[44px] min-w-[44px]" : "";

  return (
    <TouchContext.Provider
      value={{
        isPOSDevice,
        isTouchDevice,
        isSmallScreen,
        buttonSize,
        iconButtonSize,
        touchPadding,
        minTouchSize,
      }}
    >
      <div className={isPOSDevice || isTouchDevice ? "touch-device" : ""}>
        {children}
      </div>
    </TouchContext.Provider>
  );
}

export function useTouch() {
  const context = useContext(TouchContext);
  if (context === undefined) {
    throw new Error("useTouch must be used within a TouchProvider");
  }
  return context;
}

