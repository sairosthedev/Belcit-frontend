# Sunmi Printing Troubleshooting Guide

## Problem
Receipt is not printing on Sunmi device after sale completion.

## Enhanced Solution

I've updated the printer utility to support multiple Sunmi printing methods:

### Supported Methods (in order of priority):
1. **`window.wm_print`** - Most common Sunmi WebView print method
2. **`window.wwise.printText()`** - Sunmi WebView SDK
3. **`window.SunmiPrinter`** - Sunmi Printer SDK
4. **`window.sunmi.print()`** - Alternative Sunmi SDK
5. **`window.Android.printText()`** - Android bridge
6. **`window.Printer`** - Generic printer interface

## Debugging Steps

### Step 1: Check Console Logs
On your Sunmi device:
1. Open Chrome browser
2. Press F12 (or menu → Developer tools)
3. Go to Console tab
4. Complete a sale
5. Look for these logs:
   - `Sunmi Printer SDKs detected: [...]`
   - `Sunmi Printer Available: true/false`
   - `Attempting to print with Sunmi printer: ...`
   - `Using [method] method`

### Step 2: Test Print Function
In the browser console, type:
```javascript
window.testSunmiPrint()
```

This will:
- Show all available SDKs
- Test each printing method
- Print a test receipt
- Show which method works (if any)

### Step 3: Manual Test
Try printing directly in console:
```javascript
// Test wm_print (most common)
if (window.wm_print) {
  window.wm_print('TEST PRINT\nBELCIT TRADING\n\n');
}

// Test wwise
if (window.wwise && window.wwise.printText) {
  window.wwise.printText('TEST PRINT\nBELCIT TRADING\n\n');
}
```

## Common Issues

### Issue 1: No SDK Detected
**Symptom:** Console shows "No Sunmi printer SDK found"

**Solutions:**
- The Sunmi device might not have the printer SDK loaded
- Check if you're using the native Android app (APK) or browser
- Native app might need printer permissions in AndroidManifest.xml

### Issue 2: SDK Detected But Not Printing
**Symptom:** Console shows SDK detected but no print output

**Solutions:**
1. **Check Printer Connection:**
   - Ensure thermal printer is connected
   - Check printer power and paper
   - Verify printer is enabled in Sunmi settings

2. **Check Permissions:**
   - Android app needs printing permissions
   - Check AndroidManifest.xml for printer permissions

3. **Try Different Method:**
   - The SDK might be available but method name is different
   - Check console for which SDK is detected
   - Try manual test with that SDK

### Issue 3: Browser Print Dialog Appears
**Symptom:** Browser print dialog opens instead of direct printing

**This is expected fallback behavior:**
- Sunmi SDK not detected → Falls back to browser print
- This ensures receipts can always be printed
- Select your thermal printer from the print dialog

## For Native Android App (APK)

If you're using the native Android app, you may need to:

1. **Add Printer Permissions** to `android/app/src/main/AndroidManifest.xml`:
```xml
<uses-permission android:name="android.permission.BLUETOOTH" />
<uses-permission android:name="android.permission.BLUETOOTH_ADMIN" />
```

2. **Add Sunmi Printer SDK** to the Android app (if using Capacitor):
   - Install Capacitor printer plugin
   - Or use Sunmi's native SDK

## Quick Fix: Use Browser Print

If native printing doesn't work, the system automatically falls back to browser print dialog. You can:
1. Select your thermal printer from the dialog
2. Print the receipt
3. This works on any device with a connected printer

## Next Steps

1. **Deploy the updated code**
2. **Open browser console on Sunmi device**
3. **Complete a sale and check console logs**
4. **Run `window.testSunmiPrint()` to test**
5. **Share the console output** so we can identify the correct SDK method

The enhanced code now:
- ✅ Detects all possible Sunmi SDKs
- ✅ Tries multiple printing methods
- ✅ Provides detailed debug logs
- ✅ Falls back to browser print if needed
- ✅ Includes test function for debugging

