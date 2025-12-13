/**
 * Sunmi POS Printer Utility
 * Handles native printing on Sunmi devices using their SDK
 */

declare global {
  interface Window {
    wwise?: any; // Sunmi WebView SDK
    sunmi?: any; // Alternative Sunmi SDK
    Android?: any; // Android bridge
    wm_print?: any; // Sunmi WebView print method
    SunmiPrinter?: any; // Sunmi Printer SDK
    Printer?: any; // Generic printer interface
    Capacitor?: any; // Capacitor bridge
    CapacitorWeb?: any; // Capacitor Web
    // Sunmi V2 Pro specific APIs
    wmPrinter?: any; // Sunmi Printer WebView API
    sunmiPrinter?: any; // Sunmi Printer API
    // ESC/POS commands
    printRaw?: any; // Raw print command
  }
}

export interface PrintOptions {
  fontSize?: number;
  align?: 'left' | 'center' | 'right';
  bold?: boolean;
  underline?: boolean;
  lineSpacing?: number;
}

export class SunmiPrinter {
  private static instance: SunmiPrinter;
  private _isSunmiDevice: boolean = false;
  private printerAvailable: boolean = false;

  private constructor() {
    this.detectSunmiDevice();
    this.checkPrinterAvailability();
  }

  public static getInstance(): SunmiPrinter {
    if (!SunmiPrinter.instance) {
      SunmiPrinter.instance = new SunmiPrinter();
    }
    return SunmiPrinter.instance;
  }

  // Public getter for device detection
  public get isSunmiDevice(): boolean {
    return this._isSunmiDevice;
  }

  private detectSunmiDevice(): void {
    if (typeof window === 'undefined') return;
    
    const userAgent = navigator.userAgent.toLowerCase();
    const vendor = (navigator.vendor || '').toLowerCase();
    
    // Multiple detection methods for Sunmi devices
    this._isSunmiDevice = 
      /sunmi/i.test(userAgent) || 
      /sunmi/i.test(vendor) ||
      userAgent.includes("sunmi") ||
      vendor.includes("sunmi") ||
      // Also check for Android devices that might be Sunmi
      (userAgent.includes("android") && (userAgent.includes("sunmi") || vendor.includes("sunmi")));
    
    console.log('🔍 Sunmi device detection:', {
      userAgent,
      vendor,
      isSunmiDevice: this._isSunmiDevice
    });
  }

  private checkPrinterAvailability(): void {
    if (typeof window === 'undefined') return;
    
    // Check for various Sunmi SDKs and print methods
    const availableSDKs = [];
    if ((window as any).SunmiPrinterNative) availableSDKs.push('SunmiPrinterNative');
    if (window.wm_print) availableSDKs.push('wm_print');
    if (window.wmPrinter) availableSDKs.push('wmPrinter');
    if (window.sunmiPrinter) availableSDKs.push('sunmiPrinter');
    if (window.wwise) availableSDKs.push('wwise');
    if (window.sunmi) availableSDKs.push('sunmi');
    if (window.Android) availableSDKs.push('Android');
    if (window.SunmiPrinter) availableSDKs.push('SunmiPrinter');
    if (window.Printer) availableSDKs.push('Printer');
    if (window.Capacitor) availableSDKs.push('Capacitor');
    if (window.printRaw) availableSDKs.push('printRaw');
    
    console.log('Sunmi Printer SDKs detected:', availableSDKs);
    console.log('User Agent:', navigator.userAgent);
    console.log('Full window object keys:', Object.keys(window).filter(k => 
      k.toLowerCase().includes('print') || 
      k.toLowerCase().includes('sunmi') || 
      k.toLowerCase().includes('wm') ||
      k.toLowerCase().includes('printer')
    ));
    
    // For Sunmi devices, assume printer is available even if SDK not detected
    // (SDK might be injected by WebView)
    if (this.isSunmiDevice || availableSDKs.length > 0) {
      this.printerAvailable = true;
    }
  }

  public isAvailable(): boolean {
    // On Sunmi devices, always consider printer available (SDK might be injected dynamically)
    const available = this._isSunmiDevice || this.printerAvailable;
    console.log('Sunmi Printer Available:', available, {
      isSunmiDevice: this._isSunmiDevice,
      printerAvailable: this.printerAvailable
    });
    return available;
  }

  /**
   * Print text using Sunmi native printer
   */
  public async printText(text: string, options: PrintOptions = {}): Promise<boolean> {
    // On Sunmi devices, always try printing even if SDK not detected
    const isSunmiDevice = this._isSunmiDevice;
    const shouldTryPrinting = this.isAvailable() || isSunmiDevice;
    
    if (!shouldTryPrinting) {
      console.warn('Sunmi printer not available and not a Sunmi device');
      return false;
    }
    
    if (!this.isAvailable() && isSunmiDevice) {
      console.warn('⚠️ Sunmi device detected but SDK not available - trying anyway');
    }

    try {
      const {
        fontSize = 24,
        align = 'left',
        bold = false,
        underline = false,
        lineSpacing = 0
      } = options;

      console.log('Attempting to print with Sunmi printer:', text.substring(0, 50) + '...');
      
      // Try Sunmi V2 Pro built-in printer methods (in order of likelihood)
      // Method 1: SunmiPrinterNative (Injected via MainActivity) - Try direct call first
      if ((window as any).SunmiPrinterNative) {
        console.log('✅ Found SunmiPrinterNative - calling printText directly');
        console.log('SunmiPrinterNative type:', typeof (window as any).SunmiPrinterNative);
        console.log('SunmiPrinterNative methods:', Object.keys((window as any).SunmiPrinterNative || {}));
        try {
          const native = (window as any).SunmiPrinterNative;
          
          // Try printText method
          if (typeof native.printText === 'function') {
            console.log('Calling SunmiPrinterNative.printText with text length:', text.length);
            native.printText(text);
            console.log('✅ SunmiPrinterNative.printText called successfully - print should happen now');
            // Give it a moment to process
            await new Promise(resolve => setTimeout(resolve, 100));
            return true;
          }
          
          // Try as direct function call
          if (typeof native === 'function') {
            console.log('Calling SunmiPrinterNative as function with text length:', text.length);
            native(text);
            console.log('✅ SunmiPrinterNative called as function - print should happen now');
            await new Promise(resolve => setTimeout(resolve, 100));
            return true;
          }
          
          // Try call method
          if (typeof native.call === 'function') {
            console.log('Calling SunmiPrinterNative.call("printText")');
            native.call('printText', text);
            console.log('✅ SunmiPrinterNative.call executed');
            await new Promise(resolve => setTimeout(resolve, 100));
            return true;
          }
        } catch (e: any) {
          console.error('❌ SunmiPrinterNative direct call failed:', e);
          console.error('Error details:', e?.message, e?.stack);
          // Fall through to try other methods
        }
      } else {
        console.warn('⚠️ SunmiPrinterNative not found in window object');
        console.log('Available window properties:', Object.keys(window).filter(k => 
          k.toLowerCase().includes('print') || 
          k.toLowerCase().includes('sunmi') || 
          k.toLowerCase().includes('wm') ||
          k.toLowerCase().includes('native')
        ));
      }
      
      // Method 1b: Try wm_print directly (most common Sunmi method)
      if (typeof (window as any).wm_print === 'function') {
        console.log('✅ Found wm_print - calling directly');
        try {
          console.log('Calling wm_print with text length:', text.length);
          (window as any).wm_print(text);
          console.log('✅ wm_print called successfully - print should happen now');
          // Give it a moment to process
          await new Promise(resolve => setTimeout(resolve, 100));
          return true;
        } catch (e: any) {
          console.error('❌ wm_print direct call failed:', e);
          console.error('Error details:', e?.message, e?.stack);
        }
      } else {
        console.log('⚠️ wm_print not found as function');
        console.log('window.wm_print type:', typeof (window as any).wm_print);
      }
      
      // Method 2: wmPrinter (Sunmi WebView Printer API)
      if (window.wmPrinter) {
        console.log('Using wmPrinter method');
        await this.printWithWmPrinter(text, { fontSize, align, bold, underline, lineSpacing });
        return true;
      }
      
      // Method 3: sunmiPrinter (Sunmi Printer API)
      if (window.sunmiPrinter) {
        console.log('Using sunmiPrinter method');
        await this.printWithSunmiPrinterAPI(text, { fontSize, align, bold, underline, lineSpacing });
        return true;
      }
      
      // Method 4: wm_print (Sunmi WebView print method)
      if (window.wm_print) {
        console.log('Using wm_print method');
        await this.printWithWmPrint(text, { fontSize, align, bold, underline, lineSpacing });
        return true;
      }
      
      // Method 5: printRaw (ESC/POS raw printing)
      if (window.printRaw) {
        console.log('Using printRaw method');
        await this.printWithRaw(text, { fontSize, align, bold, underline, lineSpacing });
        return true;
      }

      // Try Sunmi WebView SDK (wwise)
      if (window.wwise) {
        console.log('Using wwise method');
        await this.printWithWwise(text, { fontSize, align, bold, underline, lineSpacing });
        return true;
      }

      // Try Sunmi Printer SDK
      if (window.SunmiPrinter) {
        console.log('Using SunmiPrinter SDK');
        await this.printWithSunmiPrinterSDK(text, { fontSize, align, bold, underline, lineSpacing });
        return true;
      }

      // Try Sunmi SDK
      if (window.sunmi) {
        console.log('Using sunmi SDK');
        await this.printWithSunmiSDK(text, { fontSize, align, bold, underline, lineSpacing });
        return true;
      }

      // Try Android bridge
      if (window.Android) {
        console.log('Using Android bridge');
        await this.printWithAndroidBridge(text, { fontSize, align, bold, underline, lineSpacing });
        return true;
      }

      // Try generic Printer interface
      if (window.Printer) {
        console.log('Using Printer interface');
        await this.printWithPrinterInterface(text, { fontSize, align, bold, underline, lineSpacing });
        return true;
      }
      
      // If we're on a Sunmi device but no SDK found, try one more time with direct calls
      // Sometimes SDKs are available but not detected properly
      if (this._isSunmiDevice) {
        console.warn('⚠️ No SDK detected, but trying direct print calls anyway...');
        
        // Try calling SunmiPrinterNative directly (injected from Android)
        try {
          if ((window as any).SunmiPrinterNative) {
            console.log('✅ Found SunmiPrinterNative - trying direct call');
            if (typeof (window as any).SunmiPrinterNative.printText === 'function') {
              (window as any).SunmiPrinterNative.printText(text);
              console.log('✅ SunmiPrinterNative.printText called');
              return true;
            } else if (typeof (window as any).SunmiPrinterNative === 'function') {
              (window as any).SunmiPrinterNative(text);
              console.log('✅ SunmiPrinterNative called as function');
              return true;
            }
          }
        } catch (e) {
          console.error('Direct SunmiPrinterNative call failed:', e);
        }
        
        // Try calling wm_print directly (most common Sunmi method)
        try {
          if (typeof (window as any).wm_print === 'function') {
            console.log('✅ Found wm_print - trying direct call');
            (window as any).wm_print(text);
            console.log('✅ wm_print called');
            return true;
          }
        } catch (e) {
          console.error('Direct wm_print call failed:', e);
        }
        
        console.error('❌ Sunmi device detected but no printer SDK found');
        console.error('Available window methods:', Object.keys(window).filter(k => 
          k.toLowerCase().includes('print') || 
          k.toLowerCase().includes('sunmi') || 
          k.toLowerCase().includes('wm')
        ));
        console.error('Window.SunmiPrinterNative:', (window as any).SunmiPrinterNative);
        console.error('Window.wm_print:', (window as any).wm_print);
        // Don't throw error - return false so caller can handle it
        // The exported function will handle the error appropriately
        return false;
      }
      
      console.warn('No Sunmi printer SDK found');
      return false;
    } catch (error) {
      console.error('Sunmi print error:', error);
      return false;
    }
  }

  /**
   * Print receipt HTML by converting to plain text format
   * On Sunmi devices, always tries to print even if SDK not detected
   */
  public async printReceipt(html: string): Promise<boolean> {
    // On Sunmi devices, always try printing even if SDK not detected
    // SDK might be injected dynamically or available but not detected yet
    const isSunmiDevice = this._isSunmiDevice;
    const shouldTryPrinting = this.isAvailable() || isSunmiDevice;
    
    if (!shouldTryPrinting) {
      console.warn('Printer not available and not a Sunmi device');
      return false;
    }

    try {
      // Convert HTML to plain text for thermal printer
      const text = this.htmlToReceiptText(html);
      
      console.log('🖨️ Attempting to print receipt, text length:', text.length);
      console.log('🔍 Is Sunmi device:', isSunmiDevice);
      console.log('🔍 Printer available:', this.isAvailable());
      console.log('🔍 Full user agent:', typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A');
      
      // Print with formatting - this will try all available methods
      const success = await this.printFormattedReceipt(text);
      
      if (success) {
        console.log('✅ Print command sent successfully');
        return true;
      } else if (isSunmiDevice) {
        // On Sunmi, if no method worked, log but don't throw error
        // Let the exported function decide what to do
        console.warn('⚠️ PrintFormattedReceipt returned false on Sunmi device');
        return false;
      }
      
      return false;
    } catch (error) {
      console.error('❌ Receipt print error:', error);
      // On Sunmi devices, re-throw error to prevent browser print fallback
      if (isSunmiDevice) {
        throw error;
      }
      return false;
    }
  }

  private htmlToReceiptText(html: string): string {
    // Create a temporary DOM element to parse HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Extract text content
    let text = '';
    
    // Extract header/company name
    const header = doc.querySelector('h1, h2, .header, .company-name');
    if (header) {
      text += header.textContent?.trim() + '\n';
    }

    // Extract receipt details
    const details = doc.querySelectorAll('p, div, span');
    details.forEach(el => {
      const content = el.textContent?.trim();
      if (content && content.length > 0) {
        text += content + '\n';
      }
    });

    // Extract table data
    const tables = doc.querySelectorAll('table');
    tables.forEach(table => {
      const rows = table.querySelectorAll('tr');
      rows.forEach(row => {
        const cells = row.querySelectorAll('td, th');
        const rowText = Array.from(cells).map(cell => cell.textContent?.trim()).join(' | ');
        if (rowText) {
          text += rowText + '\n';
        }
      });
    });

    return text;
  }

  private async printFormattedReceipt(text: string): Promise<boolean> {
    try {
      // For Sunmi printers, we'll print the entire receipt as one block
      // This is more reliable than line-by-line printing
      console.log('Printing formatted receipt, length:', text.length);
      
      // Clean up the text - remove extra whitespace
      const cleanedText = text
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .join('\n');
      
      // Print the entire receipt
      const success = await this.printText(cleanedText, { 
        fontSize: 24, 
        align: 'left' 
      });
      
      if (success) {
        // Add some blank lines at the end
        await this.printText('\n\n\n', { lineSpacing: 3 });
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error printing formatted receipt:', error);
      return false;
    }
  }

  private async printWithSunmiPrinterNative(text: string, options: PrintOptions): Promise<void> {
    const native = (window as any).SunmiPrinterNative;
    if (!native) return;
    
    try {
      // Use injected native printer interface
      if (native.printText) {
        native.printText(text);
      } else if (typeof native === 'function') {
        native(text);
      }
      console.log('Print command sent via SunmiPrinterNative');
    } catch (error) {
      console.error('SunmiPrinterNative error:', error);
      throw error;
    }
  }

  private async printWithWmPrinter(text: string, options: PrintOptions): Promise<void> {
    if (!window.wmPrinter) return;
    
    try {
      // Sunmi V2 Pro WebView Printer API
      if (window.wmPrinter.printText) {
        window.wmPrinter.printText(text);
      } else if (window.wmPrinter.print) {
        window.wmPrinter.print(text);
      } else if (typeof window.wmPrinter === 'function') {
        window.wmPrinter(text);
      } else if (window.wmPrinter.sendRawData) {
        // ESC/POS mode
        const escPosData = this.textToEscPos(text, options);
        window.wmPrinter.sendRawData(escPosData);
      }
      console.log('Print command sent via wmPrinter');
    } catch (error) {
      console.error('wmPrinter error:', error);
      throw error;
    }
  }

  private async printWithSunmiPrinterAPI(text: string, options: PrintOptions): Promise<void> {
    if (!window.sunmiPrinter) return;
    
    try {
      // Sunmi Printer API
      if (window.sunmiPrinter.printText) {
        window.sunmiPrinter.printText(text);
      } else if (window.sunmiPrinter.print) {
        window.sunmiPrinter.print(text);
      } else if (typeof window.sunmiPrinter === 'function') {
        window.sunmiPrinter(text);
      }
      console.log('Print command sent via sunmiPrinter API');
    } catch (error) {
      console.error('sunmiPrinter API error:', error);
      throw error;
    }
  }

  private async printWithRaw(text: string, options: PrintOptions): Promise<void> {
    if (!window.printRaw) return;
    
    try {
      // ESC/POS raw printing
      const escPosData = this.textToEscPos(text, options);
      if (typeof window.printRaw === 'function') {
        window.printRaw(escPosData);
      } else if (window.printRaw.send) {
        window.printRaw.send(escPosData);
      }
      console.log('Print command sent via printRaw');
    } catch (error) {
      console.error('printRaw error:', error);
      throw error;
    }
  }

  /**
   * Convert text to ESC/POS commands for thermal printer
   */
  private textToEscPos(text: string, options: PrintOptions): Uint8Array {
    const ESC = 0x1B;
    const GS = 0x1D;
    const LF = 0x0A;
    
    let commands: number[] = [];
    
    // Initialize printer
    commands.push(ESC, 0x40); // ESC @ - Initialize
    
    // Set alignment
    if (options.align === 'center') {
      commands.push(ESC, 0x61, 0x01); // ESC a 1 - Center
    } else if (options.align === 'right') {
      commands.push(ESC, 0x61, 0x02); // ESC a 2 - Right
    } else {
      commands.push(ESC, 0x61, 0x00); // ESC a 0 - Left
    }
    
    // Set bold
    if (options.bold) {
      commands.push(ESC, 0x45, 0x01); // ESC E 1 - Bold on
    }
    
    // Set font size
    if (options.fontSize) {
      const size = options.fontSize >= 28 ? 0x11 : 0x00; // Double width/height for large
      commands.push(GS, 0x21, size);
    }
    
    // Add text (convert to bytes)
    const textBytes = new TextEncoder().encode(text);
    commands.push(...Array.from(textBytes));
    
    // Reset formatting
    commands.push(ESC, 0x45, 0x00); // Bold off
    commands.push(ESC, 0x61, 0x00); // Left align
    commands.push(GS, 0x21, 0x00); // Normal size
    
    // Line feed and cut
    commands.push(LF, LF, LF); // 3 blank lines
    commands.push(GS, 0x56, 0x00); // Partial cut
    
    return new Uint8Array(commands);
  }

  private async printWithWmPrint(text: string, options: PrintOptions): Promise<void> {
    if (!window.wm_print) return;
    
    try {
      // Sunmi WebView print method - most common API
      if (typeof window.wm_print === 'function') {
        window.wm_print(text);
      } else if (window.wm_print.printText) {
        window.wm_print.printText(text, options.fontSize || 24);
      } else if (window.wm_print.print) {
        window.wm_print.print({
          text: text,
          fontSize: options.fontSize || 24,
          align: options.align || 'left'
        });
      }
      console.log('Print command sent via wm_print');
    } catch (error) {
      console.error('wm_print error:', error);
      throw error;
    }
  }

  private async printWithWwise(text: string, options: PrintOptions): Promise<void> {
    if (!window.wwise) return;
    
    try {
      // Sunmi WebView SDK format
      if (window.wwise.printText) {
        window.wwise.printText(text, options.fontSize || 24);
      } else if (window.wwise.postMessage) {
        const command = {
          action: 'print',
          text: text,
          fontSize: options.fontSize,
          align: options.align,
          bold: options.bold,
          underline: options.underline
        };
        window.wwise.postMessage(JSON.stringify(command));
      } else if (window.wwise.print) {
        window.wwise.print(text);
      }
      console.log('Print command sent via wwise');
    } catch (error) {
      console.error('wwise print error:', error);
      throw error;
    }
  }

  private async printWithSunmiPrinterSDK(text: string, options: PrintOptions): Promise<void> {
    if (!window.SunmiPrinter) return;
    
    try {
      // Sunmi Printer SDK format
      if (window.SunmiPrinter.printText) {
        window.SunmiPrinter.printText(text);
      } else if (window.SunmiPrinter.print) {
        window.SunmiPrinter.print(text);
      } else if (typeof window.SunmiPrinter === 'function') {
        window.SunmiPrinter(text);
      }
      console.log('Print command sent via SunmiPrinter SDK');
    } catch (error) {
      console.error('SunmiPrinter SDK error:', error);
      throw error;
    }
  }

  private async printWithSunmiSDK(text: string, options: PrintOptions): Promise<void> {
    if (!window.sunmi) return;
    
    try {
      // Sunmi SDK format - try multiple methods
      if (window.sunmi.printText) {
        window.sunmi.printText(text, options.fontSize || 24);
      } else if (window.sunmi.print) {
        window.sunmi.print({
          text: text,
          fontSize: options.fontSize,
          align: options.align,
          bold: options.bold
        });
      } else if (typeof window.sunmi === 'function') {
        window.sunmi(text);
      }
      console.log('Print command sent via sunmi SDK');
    } catch (error) {
      console.error('sunmi SDK error:', error);
      throw error;
    }
  }

  private async printWithPrinterInterface(text: string, options: PrintOptions): Promise<void> {
    if (!window.Printer) return;
    
    try {
      if (window.Printer.printText) {
        window.Printer.printText(text);
      } else if (window.Printer.print) {
        window.Printer.print(text);
      }
      console.log('Print command sent via Printer interface');
    } catch (error) {
      console.error('Printer interface error:', error);
      throw error;
    }
  }

  private async printWithAndroidBridge(text: string, options: PrintOptions): Promise<void> {
    if (!window.Android) return;
    
    try {
      // Android bridge format - try multiple methods
      if (window.Android.printText) {
        window.Android.printText(
          text,
          options.fontSize || 24,
          options.align || 'left',
          options.bold || false
        );
      } else if (window.Android.print) {
        window.Android.print(text);
      } else if (window.Android.call) {
        window.Android.call('printText', text);
      }
      console.log('Print command sent via Android bridge');
    } catch (error) {
      console.error('Android bridge error:', error);
      throw error;
    }
  }

  /**
   * Fallback to standard browser print dialog
   */
  public async printWithBrowser(html: string): Promise<void> {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  }
}

/**
 * Test function to debug printing - call from browser console
 * Usage: window.testSunmiPrint()
 */
(window as any).testSunmiPrint = async function() {
  console.log('🧪 Testing Sunmi Print...');
  console.log('User Agent:', navigator.userAgent);
  console.log('Vendor:', navigator.vendor);
  
  const testText = 'TEST PRINT\nBELCIT TRADING\n' + new Date().toLocaleString() + '\n\n';
  
  console.log('Available print methods:');
  console.log('- SunmiPrinterNative:', (window as any).SunmiPrinterNative);
  console.log('- wm_print:', (window as any).wm_print);
  console.log('- wmPrinter:', (window as any).wmPrinter);
  console.log('- sunmiPrinter:', (window as any).sunmiPrinter);
  console.log('- wwise:', (window as any).wwise);
  console.log('- SunmiPrinter:', (window as any).SunmiPrinter);
  console.log('- sunmi:', (window as any).sunmi);
  console.log('- Android:', (window as any).Android);
  console.log('- Printer:', (window as any).Printer);
  console.log('- printRaw:', (window as any).printRaw);
  
  const printer = SunmiPrinter.getInstance();
  console.log('Is Sunmi device:', printer.isSunmiDevice);
  console.log('Printer available:', printer.isAvailable());
  
  console.log('Attempting test print...');
  try {
    const success = await printer.printText(testText);
    console.log('Print result:', success);
    if (success) {
      console.log('✅ Test print sent successfully!');
    } else {
      console.error('❌ Test print returned false');
    }
  } catch (e) {
    console.error('❌ Test print error:', e);
  }
};

/**
 * Convenience function to print receipt
 * Automatically uses Sunmi printer if available, otherwise falls back to browser print
 * NEVER opens browser window on Sunmi devices - prints directly or shows error
 */
export async function printReceipt(html: string): Promise<boolean> {
  const printer = SunmiPrinter.getInstance();
  
  console.log('🖨️ printReceipt called, HTML length:', html.length);
  console.log('🔍 Printer available:', printer.isAvailable());
  console.log('🔍 Is Sunmi device:', printer.isSunmiDevice);
  
  // Check if Sunmi device - use public getter
  const isSunmiDevice = printer.isSunmiDevice;
  
  // Also check user agent as backup
  const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent.toLowerCase() : '';
  const vendor = typeof navigator !== 'undefined' ? (navigator.vendor || '').toLowerCase() : '';
  const isSunmiUA = /sunmi/i.test(userAgent) || /sunmi/i.test(vendor);
  
  // Check if we're in Android/Capacitor app (never open browser window in native app)
  const isAndroid = /android/i.test(userAgent);
  const isCapacitor = typeof (window as any).Capacitor !== 'undefined';
  const isNativeApp = isAndroid && (isCapacitor || isSunmiDevice || isSunmiUA);
  
  console.log('🔍 Environment check:', {
    isSunmiDevice,
    isSunmiUA,
    isAndroid,
    isCapacitor,
    isNativeApp,
    userAgent
  });
  
  // If it's a Sunmi device OR we're in a native Android app, NEVER use browser print
  if (isSunmiDevice || isSunmiUA || isNativeApp) {
    console.log('✅ Native app/Sunmi device detected - attempting native printing ONLY');
    console.log('🚫 NO browser window will open - printing directly to thermal printer');
    
    try {
      // Try printing - this will attempt all available methods
      const success = await printer.printReceipt(html);
      
      if (success) {
        console.log('✅ Sunmi printing successful - receipt sent to thermal printer');
        return true;
      } else {
        // Even if printReceipt returns false, log what we tried
        console.warn('⚠️ Sunmi printing returned false - printing methods attempted but none succeeded');
        console.warn('This might mean:');
        console.warn('1. Printer SDK not loaded/injected');
        console.warn('2. Printer hardware issue (power, paper, connection)');
        console.warn('3. Printer service not running');
        
        // Don't throw error - let the caller show a user-friendly message
        // But return false so we don't open browser window
        return false;
      }
    } catch (error: any) {
      console.error('❌ Sunmi printing error:', error);
      // NEVER open browser window on Sunmi/native app - just throw error
      throw new Error(error.message || 'Failed to print to thermal printer. Check printer connection.');
    }
  } else {
    // Not a Sunmi device or native app - use browser print
    console.log('Not a Sunmi device or native app - using browser print dialog');
    await printer.printWithBrowser(html);
    return false;
  }
}

