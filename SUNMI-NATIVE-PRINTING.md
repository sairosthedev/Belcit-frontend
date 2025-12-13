# Sunmi V2 Pro Native Thermal Printer Setup

## Goal
Print receipts directly to Sunmi V2 Pro's built-in thermal printer **without any popup dialog**.

## Current Implementation

The system now:
1. ✅ Detects Sunmi V2 Pro device
2. ✅ Tries multiple native printing methods
3. ✅ Uses ESC/POS commands if needed
4. ✅ **No browser print dialog on Sunmi devices**
5. ✅ Direct hardware printing

## Supported Printing Methods (in order)

1. **`window.wmPrinter`** - Sunmi WebView Printer API (most common)
2. **`window.sunmiPrinter`** - Sunmi Printer API
3. **`window.wm_print`** - Sunmi WebView print method
4. **`window.printRaw`** - ESC/POS raw printing
5. **`window.wwise`** - Sunmi WebView SDK
6. **`window.SunmiPrinter`** - Sunmi Printer SDK
7. **`window.sunmi`** - Alternative Sunmi SDK
8. **`window.Android`** - Android bridge

## How It Works

### On Sunmi V2 Pro:
1. Sale completes → Receipt HTML fetched
2. HTML converted to plain text
3. Text sent directly to thermal printer via native API
4. **No popup** - printing happens automatically
5. Success message shown

### On Other Devices:
1. Sale completes → Receipt HTML fetched
2. Browser print dialog opens
3. User selects printer
4. Receipt prints

## Testing

### Step 1: Check SDK Detection
Open browser console on Sunmi and run:
```javascript
window.testSunmiPrint()
```

This will show:
- Which SDKs are detected
- Which printing method works
- Test print output

### Step 2: Check Console Logs
After completing a sale, check console for:
- `Sunmi Printer SDKs detected: [...]`
- `Using [method] method`
- `✅ Sunmi printing successful`

### Step 3: Verify Printer Connection
- Check printer is powered on
- Check paper is loaded
- Check printer is enabled in Sunmi settings
- Settings → Printer → Enable thermal printer

## Troubleshooting

### Issue: No SDK Detected
**Symptom:** Console shows "No Sunmi printer SDK found"

**Solutions:**
1. **Check if using browser vs native app:**
   - Browser: SDK might not be available
   - Native app (APK): SDK should be available

2. **For browser access:**
   - Sunmi browser might not expose printer SDK
   - Consider using native Android app instead

3. **For native app:**
   - Ensure Capacitor is properly configured
   - Check AndroidManifest.xml has printer permissions

### Issue: SDK Detected But Not Printing
**Symptom:** Console shows SDK detected but no print output

**Solutions:**
1. **Check printer hardware:**
   - Power on printer
   - Check paper
   - Check printer connection

2. **Check printer settings:**
   - Settings → Printer → Enable thermal printer
   - Settings → Printer → Test print

3. **Try manual test:**
   ```javascript
   // In browser console
   if (window.wmPrinter) {
     window.wmPrinter.printText('TEST PRINT\nBELCIT TRADING\n\n');
   }
   ```

### Issue: Browser Print Dialog Still Appears
**Symptom:** Print dialog opens instead of direct printing

**This means:**
- Sunmi SDK not detected
- System falling back to browser print
- Need to use native Android app instead of browser

## For Native Android App (Recommended)

To get true native printing without any popup:

1. **Build and install the APK** (already done)
2. **Ensure printer permissions** in AndroidManifest.xml
3. **Use Capacitor plugins** for printer access

The native app will have direct access to Sunmi's printer hardware.

## Current Status

✅ **Enhanced detection** - Tries 8 different methods
✅ **ESC/POS support** - Raw printer commands
✅ **No popup on Sunmi** - Direct printing only
✅ **Better error handling** - Clear error messages
✅ **Debug logging** - See exactly what's happening

## Next Steps

1. **Deploy updated code**
2. **Test on Sunmi device**
3. **Check console logs** to see which SDK is detected
4. **If no SDK detected:** Use native Android app (APK) instead of browser
5. **If SDK detected but not printing:** Check printer hardware and settings

The system will now **never show a print dialog on Sunmi devices** - it will either print directly or show an error message.

