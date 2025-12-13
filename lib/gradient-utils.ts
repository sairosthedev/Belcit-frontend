/**
 * Utility for gradient text that falls back to solid color on devices
 * that don't support CSS gradients (like older Sunmi browsers)
 */

export function getGradientTextClass(isPOSDevice: boolean = false, size: 'sm' | 'md' | 'lg' | 'xl' = 'md'): string {
  if (isPOSDevice) {
    // Sunmi devices: Use solid blue color instead of gradient
    const sizeClasses = {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
      xl: 'text-xl'
    };
    return `${sizeClasses[size]} font-bold text-blue-600`;
  }
  
  // Modern devices: Use gradient
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };
  return `${sizeClasses[size]} font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent`;
}

export function getGradientBgClass(isPOSDevice: boolean = false): string {
  if (isPOSDevice) {
    return 'bg-blue-600';
  }
  return 'bg-gradient-to-r from-purple-600 to-blue-600';
}

