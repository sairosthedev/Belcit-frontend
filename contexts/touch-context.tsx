"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

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
  const [deviceInfo, setDeviceInfo] = useState<{isPOSDevice: boolean, isTouchDevice: boolean, isSmallScreen: boolean}>({
    isPOSDevice: false,
    isTouchDevice: false,
    isSmallScreen: false,
  });
  
  useEffect(() => {
    // Check if running on Android (Sunmi devices run Android)
    const userAgent = typeof window !== 'undefined' ? navigator.userAgent.toLowerCase() : '';
    const isAndroid = /android/.test(userAgent);
    
    // Check for Sunmi device indicators
    const isSunmi = /sunmi/i.test(userAgent) || 
                    (typeof window !== 'undefined' && /sunmi/i.test(navigator.vendor)) ||
                    (typeof window !== 'undefined' && window.navigator.userAgent.includes("Sunmi"));
    
    // Check for touch capability
    const hasTouch = typeof window !== 'undefined' && (
      'ontouchstart' in window || 
      navigator.maxTouchPoints > 0 ||
      (navigator as any).msMaxTouchPoints > 0
    );
    
    // Check screen size (POS devices typically have smaller screens)
    const width = typeof window !== 'undefined' ? window.innerWidth : 1920;
    const height = typeof window !== 'undefined' ? window.innerHeight : 1080;
    const isSmallScreen = width < 1024 && height < 800;
    
    setDeviceInfo({
      isPOSDevice: isAndroid && (isSunmi || isSmallScreen),
      isTouchDevice: hasTouch || false,
      isSmallScreen,
    });
  }, []);
  
  // Determine optimal sizes based on device type
  const buttonSize = deviceInfo.isPOSDevice || deviceInfo.isTouchDevice ? "lg" : "default";
  const iconButtonSize = deviceInfo.isPOSDevice || deviceInfo.isTouchDevice ? "default" : "icon";
  const touchPadding = deviceInfo.isPOSDevice || deviceInfo.isTouchDevice ? "p-2" : "p-1";
  const minTouchSize = deviceInfo.isPOSDevice || deviceInfo.isTouchDevice ? "min-h-[44px] min-w-[44px]" : "";

  return (
    <TouchContext.Provider
      value={{
        isPOSDevice: deviceInfo.isPOSDevice,
        isTouchDevice: deviceInfo.isTouchDevice,
        isSmallScreen: deviceInfo.isSmallScreen,
        buttonSize,
        iconButtonSize,
        touchPadding,
        minTouchSize,
      }}
    >
      <div className={deviceInfo.isPOSDevice || deviceInfo.isTouchDevice ? "touch-device" : ""}>
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

