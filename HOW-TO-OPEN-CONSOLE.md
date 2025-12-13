# How to Open Browser Console on Sunmi V2 Pro

## Method 1: Using Chrome DevTools (Recommended - Easiest)

### Step 1: Enable USB Debugging on Sunmi Device
1. Go to **Settings** → **About Phone**
2. Tap **Build Number** 7 times (enables Developer Options)
3. Go back to **Settings** → **Developer Options**
4. Enable **USB Debugging**
5. Connect device to computer via USB

### Step 2: Open Chrome DevTools on Computer
1. Open **Chrome** browser on your computer
2. Type in address bar: `chrome://inspect`
3. You should see your Sunmi device listed
4. Click **inspect** next to your app/website
5. Console tab will open - you can run `window.testSunmiPrint()` there

## Method 2: Using Browser on Sunmi Device (If Available)

### Option A: Chrome Browser
1. Open **Chrome** browser on Sunmi device
2. Navigate to your app URL
3. Tap menu (3 dots) → **More tools** → **Developer tools**
   - OR: Tap menu → **Settings** → **Developer tools**
   - OR: Some devices: Long press on page → **Inspect**

### Option B: Using JavaScript URL
1. Open browser on Sunmi device
2. Navigate to your app
3. In address bar, type: `javascript:console.log('test')`
4. This should open console (if supported)

## Method 3: Using ADB Shell (Advanced)

### Step 1: Connect via USB
1. Enable USB Debugging (see Method 1, Step 1)
2. Connect device to computer

### Step 2: Open ADB Shell
```bash
adb shell
```

### Step 3: Launch Browser with Console
```bash
# This is more complex - Method 1 is easier
```

## Method 4: Add Debug Button in App (Easiest for Testing)

Add a debug button directly in your app that calls the test function.

## Quick Test Without Console

If you can't access console, you can also:

1. **Check Android Logs:**
   ```bash
   adb logcat | grep -E "MainActivity|printText|Sunmi"
   ```

2. **Complete a sale** and check:
   - Toast messages (success/error)
   - Android logs
   - Printer output

3. **Look for these logs:**
   - `🖨️ printReceipt called`
   - `✅ Found SunmiPrinterNative`
   - `✅ SunmiPrinterNative.printText called successfully`

## Recommended: Use Chrome DevTools (Method 1)

This is the easiest way:
1. Connect Sunmi device to computer via USB
2. Enable USB Debugging
3. Open `chrome://inspect` in Chrome
4. Click "inspect" on your app
5. Console tab opens
6. Type: `window.testSunmiPrint()`
7. Press Enter

## Troubleshooting

### Can't find Developer Options?
- Go to Settings → About Phone
- Tap "Build Number" 7 times
- Developer Options will appear in Settings

### Chrome DevTools not showing device?
- Make sure USB Debugging is enabled
- Try different USB cable/port
- Install/update ADB drivers
- Check device shows "USB Debugging connected" notification

### Console not opening in browser?
- Some Sunmi browsers don't support console
- Use Chrome DevTools method instead (Method 1)
- Or check Android logs instead

