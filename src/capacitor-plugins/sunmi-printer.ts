import { registerPlugin } from '@capacitor/core';

export interface SunmiPrinterPlugin {
  printText(options: { text: string }): Promise<void>;
  isAvailable(): Promise<{ available: boolean }>;
}

const SunmiPrinter = registerPlugin<SunmiPrinterPlugin>('SunmiPrinter');

export default SunmiPrinter;

/**
 * Print receipt using Sunmi V2 Pro thermal printer
 */
export async function printSunmiReceipt(text: string): Promise<boolean> {
  try {
    // Check if printer is available
    const { available } = await SunmiPrinter.isAvailable();
    if (!available) {
      console.error('❌ Sunmi printer service not available');
      return false;
    }
    
    // Print the text
    await SunmiPrinter.printText({ text });
    console.log('✅ Receipt printed to Sunmi thermal printer');
    return true;
    
  } catch (error) {
    console.error('❌ Sunmi print error:', error);
    return false;
  }
}
