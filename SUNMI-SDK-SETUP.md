# Sunmi V2 Pro Built-in Thermal Printer Setup

## Goal
Use Sunmi V2 Pro's **built-in thermal printer** to print receipts automatically after sales.

## Current Status
✅ JavaScript interface injected into WebView  
✅ Multiple printing methods attempted  
✅ Fallback to system print  
⚠️ **Sunmi SDK needs to be added for full native printing**

## Option 1: Use Sunmi WebView SDK (Easiest)

Sunmi V2 Pro's WebView has built-in printer SDK. The code will automatically detect and use:
- `window.wm_print()` - Most common method
- `window.wmPrinter` - Object-based API
- `window.SunmiPrinterNative` - Injected from Android

**Check if available:**
1. Open browser console on Sunmi device
2. Run: `console.log(window.wm_print, window.wmPrinter, window.SunmiPrinterNative)`
3. If any exist, printing should work automatically

## Option 2: Add Sunmi Printer SDK (Recommended for Native App)

### Step 1: Download Sunmi Printer SDK

1. Go to: https://developer.sunmi.com/docs/en-US/doc/printer-sdk-en
2. Download the latest Sunmi Printer SDK (JAR or AAR file)
3. Save it as `sunmi-printer-sdk.jar` or `sunmi-printer-sdk.aar`

### Step 2: Add SDK to Android Project

1. Copy SDK file to: `android/app/libs/sunmi-printer-sdk.jar`
2. The build.gradle is already configured to include JAR files from libs/

### Step 3: Update MainActivity.java

Uncomment the Sunmi SDK code in `MainActivity.java`:

```java
// Uncomment these imports:
import woyou.aidlservice.jiuiv5.IWoyouService;
import woyou.aidlservice.jiuiv5.ICallback;

// Uncomment the service connection code in onCreate()
private IWoyouService woyouService;
private ServiceConnection connService = new ServiceConnection() {
    @Override
    public void onServiceConnected(ComponentName name, IBinder service) {
        woyouService = IWoyouService.Stub.asInterface(service);
        Log.d(TAG, "Sunmi printer service connected");
    }
    @Override
    public void onServiceDisconnected(ComponentName name) {
        woyouService = null;
        Log.d(TAG, "Sunmi printer service disconnected");
    }
};

// In onCreate(), uncomment:
Intent intent = new Intent();
intent.setPackage("woyou.aidlservice.jiuiv5");
intent.setAction("woyou.aidlservice.jiuiv5.IWoyouService");
bindService(intent, connService, Context.BIND_AUTO_CREATE);

// In printText(), uncomment:
if (woyouService != null) {
    woyouService.printText(text, null);
    Log.d(TAG, "✅ Printed via Sunmi SDK");
    return;
}
```

### Step 4: Rebuild APK

```bash
npm run build:android
```

## Option 3: Use Current Implementation (Works Without SDK)

The current code uses **reflection** to call Sunmi SDK methods. This works if:
- Sunmi printer service is installed on device
- Service is running
- App has permission to access printer

**This should work out of the box on Sunmi V2 Pro!**

## Testing

### Step 1: Check Printer Hardware
- ✅ Printer is powered on
- ✅ Paper is loaded
- ✅ Printer is enabled in Settings → Printer

### Step 2: Check Console Logs
After completing a sale, check browser console for:
- `🖨️ printText called from JavaScript`
- `✅ Found SunmiPrinterNative`
- `✅ Printed via Sunmi SDK`

### Step 3: Check Android Logs
```bash
adb logcat | grep MainActivity
```

Look for:
- `Sunmi printer service connected`
- `Printed via Sunmi SDK`

## Troubleshooting

### Issue: "No printer SDK found"
**Solution:** 
1. Make sure you're using the **native Android app** (APK), not browser
2. Check if Sunmi printer service is installed: `adb shell pm list packages | grep woyou`
3. If not installed, download from Sunmi app store

### Issue: "Service connection failed"
**Solution:**
1. Check printer is enabled in device settings
2. Restart the app
3. Check Android logs for errors

### Issue: "Printing but nothing prints"
**Solution:**
1. Check printer hardware (power, paper)
2. Test printer with Sunmi's test app
3. Check printer settings in device Settings → Printer

## Current Implementation Details

The code tries printing in this order:
1. **SunmiPrinterNative** (injected from Android) - Direct call
2. **wm_print()** - Sunmi WebView function
3. **wmPrinter** - Sunmi WebView object
4. **Sunmi SDK via reflection** - Works without SDK JAR
5. **Android PrintManager** - System print (fallback)

All methods are tried automatically - no user interaction needed!

