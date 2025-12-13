# Sunmi V2 Pro Native Printer Setup - No Popup

## Goal
Print receipts directly to Sunmi V2 Pro's built-in thermal printer **without any popup dialog**.

## Current Status

✅ **Enhanced printer detection** - Tries 8 different methods
✅ **No popup on Sunmi** - Never shows browser print dialog
✅ **JavaScript interface** - Injected into WebView
✅ **ESC/POS support** - Raw printer commands

## Important: Browser vs Native App

### If Using Browser (Chrome):
- Sunmi SDK might not be available
- Browser doesn't have access to native printer hardware
- **Solution:** Use the native Android app (APK) instead

### If Using Native Android App (APK):
- Has access to Sunmi hardware
- Can use native printer SDK
- **This is the recommended approach**

## Setup for Native Printing

### Option 1: Use Sunmi WebView SDK (If Available)

If your Sunmi device's browser/WebView has the SDK injected:

1. The code will automatically detect and use it
2. Check browser console for detected SDKs
3. Run `window.testSunmiPrint()` to test

### Option 2: Add Sunmi Printer SDK to Android App

For true native printing, add Sunmi's printer SDK:

1. **Download Sunmi Printer SDK** from Sunmi developer website
2. **Add to `android/app/libs/`** directory
3. **Update `android/app/build.gradle`**:

```gradle
dependencies {
    // ... existing dependencies
    implementation files('libs/sunmi-printer-sdk.jar') // Add Sunmi SDK
}
```

4. **Update MainActivity.java** to use Sunmi SDK:

```java
import woyou.aidlservice.jiuiv5.IWoyouService;

// In MainActivity
private IWoyouService woyouService;

// In SunmiPrinterJSInterface
@JavascriptInterface
public void printText(String text) {
    try {
        if (woyouService != null) {
            woyouService.printText(text, null);
        }
    } catch (Exception e) {
        Log.e(TAG, "Print error", e);
    }
}
```

### Option 3: Use Capacitor Plugin

Install a Capacitor printer plugin:

```bash
npm install @capacitor-community/printer
npx cap sync android
```

Then use it in code:
```typescript
import { Printer } from '@capacitor-community/printer';

await Printer.print({
  text: receiptText
});
```

## Current Implementation

The system now:

1. ✅ **Detects Sunmi device** automatically
2. ✅ **Tries 8 printing methods** in order
3. ✅ **Never shows popup** on Sunmi devices
4. ✅ **Injects JavaScript interface** into WebView
5. ✅ **Uses ESC/POS commands** if needed

## Testing

### Step 1: Check What's Available
On Sunmi device, open browser console and run:
```javascript
// Check available SDKs
console.log('wmPrinter:', window.wmPrinter);
console.log('sunmiPrinter:', window.sunmiPrinter);
console.log('wm_print:', window.wm_print);
console.log('SunmiPrinterNative:', window.SunmiPrinterNative);

// Test print
window.testSunmiPrint();
```

### Step 2: Test Native App
1. Build and install the APK
2. Complete a sale
3. Receipt should print automatically
4. Check console logs for which method was used

## If Still Not Working

### Check 1: Are you using browser or native app?
- **Browser:** SDK might not be available → Use native app
- **Native app:** Should have SDK access → Check logs

### Check 2: Printer Hardware
- Power on printer
- Check paper loaded
- Check printer enabled in settings
- Settings → Printer → Test print

### Check 3: Permissions
- Android app needs printer permissions
- Check AndroidManifest.xml

### Check 4: SDK Detection
- Open console on Sunmi
- Run: `window.testSunmiPrint()`
- Check which SDKs are detected
- Share the output

## Next Steps

1. **If using browser:** Switch to native Android app (APK)
2. **If using native app:** Check console logs to see detected SDKs
3. **If no SDK detected:** Add Sunmi Printer SDK to Android project
4. **Share console output** so we can identify the correct method

The code is now set up to **never show a popup on Sunmi devices** - it will either print directly or show an error message.

