/**
 * Sunmi POS Printer Utility
 * Handles native printing on Sunmi devices using their SDK
 */

declare global {
  interface Window {
    wwise?: any; // Sunmi WebView SDK
    sunmi?: any; // Alternative Sunmi SDK
    Android?: any; // Android bridge
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
    
    // Check for Sunmi WebView SDK
    if (window.wwise || window.sunmi || window.Android) {
      this.printerAvailable = true;
    }
  }

  public isAvailable(): boolean {
    return this.isSunmiDevice && this.printerAvailable;
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

      // Try Sunmi WebView SDK (wwise)
      if (window.wwise) {
        await this.printWithWwise(text, { fontSize, align, bold, underline, lineSpacing });
        return true;
      }

      // Try Sunmi SDK
      if (window.sunmi) {
        await this.printWithSunmiSDK(text, { fontSize, align, bold, underline, lineSpacing });
        return true;
      }

      // Try Android bridge
      if (window.Android) {
        await this.printWithAndroidBridge(text, { fontSize, align, bold, underline, lineSpacing });
        return true;
      }

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
    const lines = text.split('\n');
    
    for (const line of lines) {
      if (line.trim().length === 0) {
        await this.printText('', { lineSpacing: 1 });
        continue;
      }

      // Detect header lines (usually all caps or contain specific keywords)
      const isHeader = line === line.toUpperCase() || 
                      line.includes('RECEIPT') || 
                      line.includes('INVOICE') ||
                      line.includes('BELCIT');

      if (isHeader) {
        await this.printText(line, { fontSize: 28, align: 'center', bold: true });
      } else if (line.includes('Total') || line.includes('TOTAL')) {
        await this.printText(line, { fontSize: 26, align: 'right', bold: true });
      } else if (line.includes('|')) {
        // Table row
        await this.printText(line, { fontSize: 22, align: 'left' });
      } else {
        await this.printText(line, { fontSize: 24, align: 'left' });
      }
      
      await this.printText('', { lineSpacing: 1 });
    }

    // Add footer spacing
    await this.printText('', { lineSpacing: 3 });
    await this.printText('Thank you for your business!', { fontSize: 22, align: 'center' });
    await this.printText('', { lineSpacing: 5 });

    return true;
  }

  private async printWithWwise(text: string, options: PrintOptions): Promise<void> {
    if (!window.wwise) return;
    
    // Sunmi WebView SDK format
    const command = {
      action: 'print',
      text: text,
      fontSize: options.fontSize,
      align: options.align,
      bold: options.bold,
      underline: options.underline
    };

    window.wwise.postMessage(JSON.stringify(command));
  }

  private async printWithSunmiSDK(text: string, options: PrintOptions): Promise<void> {
    if (!window.sunmi) return;
    
    // Sunmi SDK format
    window.sunmi.print({
      text: text,
      fontSize: options.fontSize,
      align: options.align,
      bold: options.bold
    });
  }

  private async printWithAndroidBridge(text: string, options: PrintOptions): Promise<void> {
    if (!window.Android) return;
    
    // Android bridge format
    window.Android.printText(
      text,
      options.fontSize || 24,
      options.align || 'left',
      options.bold || false
    );
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
  
  if (printer.isAvailable()) {
    const success = await printer.printReceipt(html);
    if (success) {
      return true;
    }
  }
  
  // Fallback to browser print
  await printer.printWithBrowser(html);
  return false;
}

