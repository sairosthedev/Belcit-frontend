# Quick Print Test - Manual Commands

## Step 1: Check What's Available

Run these commands in browser console one by one:

```javascript
// Check for SunmiPrinterNative (injected from Android)
console.log('SunmiPrinterNative:', window.SunmiPrinterNative);
console.log('Type:', typeof window.SunmiPrinterNative);

// Check for wm_print
console.log('wm_print:', window.wm_print);
console.log('Type:', typeof window.wm_print);

// Check for wmPrinter
console.log('wmPrinter:', window.wmPrinter);

// Check for other methods
console.log('sunmiPrinter:', window.sunmiPrinter);
console.log('wwise:', window.wwise);
console.log('SunmiPrinter:', window.SunmiPrinter);
console.log('sunmi:', window.sunmi);
console.log('Android:', window.Android);
```

## Step 2: Try Printing Directly

Based on what's available, try these:

### If SunmiPrinterNative exists:
```javascript
if (window.SunmiPrinterNative && window.SunmiPrinterNative.printText) {
  window.SunmiPrinterNative.printText('TEST PRINT\nBELCIT TRADING\n\n');
  console.log('✅ Called SunmiPrinterNative.printText');
}
```

### If wm_print exists:
```javascript
if (typeof window.wm_print === 'function') {
  window.wm_print('TEST PRINT\nBELCIT TRADING\n\n');
  console.log('✅ Called wm_print');
}
```

### If wmPrinter exists:
```javascript
if (window.wmPrinter && window.wmPrinter.printText) {
  window.wmPrinter.printText('TEST PRINT\nBELCIT TRADING\n\n');
  console.log('✅ Called wmPrinter.printText');
}
```

## Step 3: Check Android Logs

Connect device via USB and run:
```bash
adb logcat | grep -E "MainActivity|printText|Sunmi"
```

Look for:
- `🖨️ ===== PRINT TEXT CALLED FROM JAVASCRIPT =====`
- `✅ Bound to Sunmi printer service`
- `✅ ✅ ✅ PRINTED VIA SUNMI SDK ✅ ✅ ✅`

## Step 4: If Nothing Works

1. **Rebuild APK:**
   ```bash
   npm run build:android
   ```

2. **Reinstall on device**

3. **Hard refresh browser:** Ctrl+Shift+R

4. **Check if using native app** (not browser)

## Quick One-Liner Test

Run this in console to try all methods at once:

```javascript
(function() {
  const text = 'TEST PRINT\nBELCIT TRADING\n' + new Date().toLocaleString() + '\n\n';
  console.log('🧪 Testing print methods...');
  
  // Try SunmiPrinterNative
  if (window.SunmiPrinterNative) {
    console.log('✅ Found SunmiPrinterNative');
    try {
      if (window.SunmiPrinterNative.printText) {
        window.SunmiPrinterNative.printText(text);
        console.log('✅ Called SunmiPrinterNative.printText');
        return;
      }
    } catch(e) { console.error('Error:', e); }
  }
  
  // Try wm_print
  if (typeof window.wm_print === 'function') {
    console.log('✅ Found wm_print');
    try {
      window.wm_print(text);
      console.log('✅ Called wm_print');
      return;
    } catch(e) { console.error('Error:', e); }
  }
  
  // Try wmPrinter
  if (window.wmPrinter && window.wmPrinter.printText) {
    console.log('✅ Found wmPrinter');
    try {
      window.wmPrinter.printText(text);
      console.log('✅ Called wmPrinter.printText');
      return;
    } catch(e) { console.error('Error:', e); }
  }
  
  console.log('❌ No print methods found or worked');
})();
```

