# Debugging Sunmi Printing Issues

## Quick Test

Open browser console on Sunmi device and run:
```javascript
window.testSunmiPrint()
```

This will:
- Show all available print methods
- Test each method
- Print a test receipt
- Show which method works (if any)

## Check Console Logs

After completing a sale, check browser console for:
- `🖨️ printReceipt called`
- `✅ Found SunmiPrinterNative` or `⚠️ SunmiPrinterNative not found`
- `✅ SunmiPrinterNative.printText called successfully`
- Any error messages

## Check Android Logs

Connect device via USB and run:
```bash
adb logcat | grep MainActivity
```

Look for:
- `🖨️ ===== PRINT TEXT CALLED FROM JAVASCRIPT =====`
- `✅ Bound to Sunmi printer service`
- `✅ ✅ ✅ PRINTED VIA SUNMI SDK ✅ ✅ ✅`
- Any error messages

## Common Issues

### Issue 1: SunmiPrinterNative not found
**Symptom:** Console shows `⚠️ SunmiPrinterNative not found`

**Solution:**
1. Make sure you're using the **native Android app** (APK), not browser
2. Rebuild APK: `npm run build:android`
3. Reinstall on device
4. Check that JavaScript interface is injected (see Android logs)

### Issue 2: Service binding fails
**Symptom:** Android logs show `⚠️ Could not bind to Sunmi printer service`

**Solution:**
1. Check printer service is installed: `adb shell pm list packages | grep woyou`
2. Check printer is enabled in device Settings → Printer
3. Restart the app
4. Try restarting the device

### Issue 3: Print called but nothing prints
**Symptom:** Logs show print was called but no output

**Solution:**
1. Check printer hardware:
   - Power is on
   - Paper is loaded
   - Printer is enabled
2. Test with Sunmi's test app (if available)
3. Check printer settings in device Settings → Printer
4. Try printing from another app to verify printer works

### Issue 4: No methods detected
**Symptom:** `window.testSunmiPrint()` shows no available methods

**Solution:**
1. You're probably using browser instead of native app
2. Build and install the Android APK
3. Use the native app, not browser

## Step-by-Step Debugging

1. **Test print function:**
   ```javascript
   window.testSunmiPrint()
   ```

2. **Check what's available:**
   ```javascript
   console.log('SunmiPrinterNative:', window.SunmiPrinterNative);
   console.log('wm_print:', window.wm_print);
   console.log('wmPrinter:', window.wmPrinter);
   ```

3. **Try manual print:**
   ```javascript
   if (window.SunmiPrinterNative && window.SunmiPrinterNative.printText) {
     window.SunmiPrinterNative.printText('TEST PRINT\n\n');
   }
   ```

4. **Check Android logs:**
   ```bash
   adb logcat | grep -E "MainActivity|printText|Sunmi"
   ```

5. **Verify printer service:**
   ```bash
   adb shell pm list packages | grep woyou
   ```

## Expected Behavior

When printing works correctly:
1. Sale completes
2. Console shows: `✅ Found SunmiPrinterNative`
3. Console shows: `✅ SunmiPrinterNative.printText called successfully`
4. Android logs show: `✅ ✅ ✅ PRINTED VIA SUNMI SDK ✅ ✅ ✅`
5. Receipt prints automatically
6. No popup dialog appears

## Still Not Working?

1. Share console logs from browser
2. Share Android logs (`adb logcat | grep MainActivity`)
3. Confirm you're using native Android app (not browser)
4. Confirm printer hardware is working (test with other app)
5. Check device model and Android version

