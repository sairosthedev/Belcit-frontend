# Sunmi Receipt Printing Guide

## Overview

The system now supports native receipt printing on Sunmi POS devices using their SDK, with automatic fallback to browser printing on other devices.

## How It Works

### Automatic Detection
- The system automatically detects if it's running on a Sunmi device
- Checks for available Sunmi printing SDKs:
  - `window.wwise` (Sunmi WebView SDK)
  - `window.sunmi` (Sunmi SDK)
  - `window.Android` (Android bridge)

### Printing Flow

1. **User clicks "Print Receipt"**
2. **System fetches receipt HTML** from backend API
3. **Converts HTML to plain text** format suitable for thermal printer
4. **Attempts native Sunmi printing** if device is detected
5. **Falls back to browser print dialog** if Sunmi printing is not available

## Features

### ✅ Native Sunmi Printing
- Direct communication with Sunmi thermal printer
- Proper formatting for thermal receipts
- Automatic text sizing and alignment
- No print dialog popup (seamless printing)

### ✅ Browser Fallback
- Works on any device/browser
- Opens standard print dialog
- Can print to any connected printer

### ✅ Smart Formatting
- Converts HTML receipts to thermal printer format
- Handles headers, tables, and totals
- Proper spacing and alignment
- Barcode support (if needed)

## Usage

### In Code

```typescript
import { printReceipt } from '@/lib/sunmi-printer';

// Print a receipt (automatically uses Sunmi if available)
await printReceipt(htmlContent);
```

### Manual Control

```typescript
import { SunmiPrinter } from '@/lib/sunmi-printer';

const printer = SunmiPrinter.getInstance();

if (printer.isAvailable()) {
  // Use native Sunmi printing
  await printer.printReceipt(html);
} else {
  // Use browser print
  await printer.printWithBrowser(html);
}
```

## Where It's Used

1. **POS System** (`components/sales/pos-system.tsx`)
   - Prints receipt after completing a sale
   - "Print Receipt" button

2. **Recent Sales** (`components/dashboard/recent-sales.tsx`)
   - Print receipts from dashboard
   - Quick print action

3. **Sales History** (`app/dashboard/sales/history/page.tsx`)
   - Print any historical receipt
   - From sales history table

## Testing

### On Sunmi Device
1. Complete a sale in POS system
2. Click "Print Receipt"
3. Receipt should print directly to thermal printer
4. No print dialog should appear

### On Other Devices
1. Complete a sale
2. Click "Print Receipt"
3. Browser print dialog should appear
4. Select printer and print

## Troubleshooting

### Receipt Not Printing on Sunmi

1. **Check SDK Availability**
   ```javascript
   // Open browser console and check:
   console.log('wwise:', window.wwise);
   console.log('sunmi:', window.sunmi);
   console.log('Android:', window.Android);
   ```

2. **Check Device Detection**
   ```javascript
   const printer = SunmiPrinter.getInstance();
   console.log('Is Sunmi:', printer.isAvailable());
   ```

3. **Check Printer Connection**
   - Ensure thermal printer is connected to Sunmi device
   - Check printer power and paper
   - Verify printer is enabled in device settings

4. **Check Permissions**
   - App may need printing permissions
   - Check Android app permissions

### Fallback to Browser Print

If Sunmi printing fails, the system automatically falls back to browser print dialog. This ensures receipts can always be printed, even if:
- Sunmi SDK is not available
- Printer is not connected
- Permissions are missing

## Advanced Configuration

### Custom Print Options

```typescript
const printer = SunmiPrinter.getInstance();

await printer.printText('Hello', {
  fontSize: 28,
  align: 'center',
  bold: true,
  underline: false,
  lineSpacing: 2
});
```

### Print Options

- `fontSize`: Text size (default: 24)
- `align`: 'left' | 'center' | 'right' (default: 'left')
- `bold`: Boolean (default: false)
- `underline`: Boolean (default: false)
- `lineSpacing`: Number of blank lines (default: 0)

## Notes

- The system automatically detects Sunmi devices
- No manual configuration needed
- Works seamlessly with existing receipt printing code
- Backward compatible with browser printing

## Support

If you encounter issues:
1. Check browser console for errors
2. Verify Sunmi SDK is loaded
3. Test with browser print fallback
4. Check printer connection and settings

