"use client";

import { useState, useEffect } from "react";

export function usePOSDevice() {
  const [isPOSDevice, setIsPOSDevice] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [screenSize, setScreenSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    // Check if running on Android (Sunmi devices run Android)
    const userAgent = navigator.userAgent.toLowerCase();
    const isAndroid = /android/.test(userAgent);
    
    // Check for Sunmi device indicators
    const isSunmi = /sunmi/i.test(userAgent) || 
                    /sunmi/i.test(navigator.vendor) ||
                    window.navigator.userAgent.includes("Sunmi");
    
    // Check for touch capability
    const hasTouch = 'ontouchstart' in window || 
                     navigator.maxTouchPoints > 0 ||
                     (navigator as any).msMaxTouchPoints > 0;
    
    // Check screen size (POS devices typically have smaller screens)
    const width = window.innerWidth;
    const height = window.innerHeight;
    const isSmallScreen = width < 1024 && height < 800;
    
    setIsPOSDevice(isAndroid && (isSunmi || isSmallScreen));
    setIsTouchDevice(hasTouch);
    setScreenSize({ width, height });

    const handleResize = () => {
      setScreenSize({ 
        width: window.innerWidth, 
        height: window.innerHeight 
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return {
    isPOSDevice,
    isTouchDevice,
    screenSize,
    isSmallScreen: screenSize.width < 1024,
  };
}

