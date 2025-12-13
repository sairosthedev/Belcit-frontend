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
  private isSunmiDevice: boolean = false;
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

  private detectSunmiDevice(): void {
    if (typeof window === 'undefined') return;
    
    const userAgent = navigator.userAgent.toLowerCase();
    this.isSunmiDevice = /sunmi/i.test(userAgent) || 
                        /sunmi/i.test(navigator.vendor) ||
                        window.navigator.userAgent.includes("Sunmi");
  }

  private checkPrinterAvailability(): void {
    if (typeof window === 'undefined') return;
    
    // Check for various Sunmi SDKs and print methods
    const availableSDKs = [];
    if (window.wwise) availableSDKs.push('wwise');
    if (window.sunmi) availableSDKs.push('sunmi');
    if (window.Android) availableSDKs.push('Android');
    if (window.wm_print) availableSDKs.push('wm_print');
    if (window.SunmiPrinter) availableSDKs.push('SunmiPrinter');
    if (window.Printer) availableSDKs.push('Printer');
    
    console.log('Sunmi Printer SDKs detected:', availableSDKs);
    console.log('User Agent:', navigator.userAgent);
    
    if (availableSDKs.length > 0) {
      this.printerAvailable = true;
    }
  }

  public isAvailable(): boolean {
    const available = this.isSunmiDevice && this.printerAvailable;
    console.log('Sunmi Printer Available:', available, {
      isSunmiDevice: this.isSunmiDevice,
      printerAvailable: this.printerAvailable
    });
    return available;
  }

  /**
   * Print text using Sunmi native printer
   */
  public async printText(text: string, options: PrintOptions = {}): Promise<boolean> {
    if (!this.isAvailable()) {
      console.warn('Sunmi printer not available, falling back to window.print()');
      return false;
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
      
      // Try Sunmi WebView print method (most common)
      if (window.wm_print) {
        console.log('Using wm_print method');
        await this.printWithWmPrint(text, { fontSize, align, bold, underline, lineSpacing });
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
      
      console.warn('No Sunmi printer SDK found');

      return false;
    } catch (error) {
      console.error('Sunmi print error:', error);
      return false;
    }
  }

  /**
   * Print receipt HTML by converting to plain text format
   */
  public async printReceipt(html: string): Promise<boolean> {
    if (!this.isAvailable()) {
      return false;
    }

    try {
      // Convert HTML to plain text for thermal printer
      const text = this.htmlToReceiptText(html);
      
      // Print with formatting
      return await this.printFormattedReceipt(text);
    } catch (error) {
      console.error('Receipt print error:', error);
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
 * Convenience function to print receipt
 * Automatically uses Sunmi printer if available, otherwise falls back to browser print
 */
export async function printReceipt(html: string): Promise<boolean> {
  const printer = SunmiPrinter.getInstance();
  
  console.log('printReceipt called, HTML length:', html.length);
  console.log('Printer available:', printer.isAvailable());
  
  // Always try Sunmi printing first if device is detected
  if (printer.isAvailable()) {
    console.log('Attempting Sunmi native printing...');
    try {
      const success = await printer.printReceipt(html);
      if (success) {
        console.log('Sunmi printing successful');
        return true;
      } else {
        console.warn('Sunmi printing returned false, falling back to browser print');
      }
    } catch (error) {
      console.error('Sunmi printing error:', error);
    }
  } else {
    console.log('Sunmi printer not available, device detection:', {
      isSunmiDevice: (printer as any).isSunmiDevice,
      printerAvailable: (printer as any).printerAvailable
    });
  }
  
  // Fallback to browser print
  console.log('Falling back to browser print dialog');
  await printer.printWithBrowser(html);
  return false;
}

