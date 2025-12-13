# Quick Start: Build Android App for Sunmi V2 Pro

## 🚀 Fast Setup (5 Steps)

### Step 1: Update Your Vercel URL

Edit `capacitor.config.ts` and replace the URL:

```typescript
const DEPLOYED_URL = 'https://YOUR-ACTUAL-VERCEL-URL.vercel.app';
```

Or set environment variable:
```bash
# In .env.local
NEXT_PUBLIC_DEPLOYED_URL=https://your-app.vercel.app
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Sync Capacitor

```bash
npm run sync
```

### Step 4: Open in Android Studio

```bash
npm run android
```

This will open Android Studio with your project.

### Step 5: Build & Install

1. **Connect your Sunmi V2 Pro** via USB
2. **Enable USB Debugging** on the device (Settings → Developer Options)
3. **Click the green "Run" button** in Android Studio
4. The app will build and install automatically!

## 📱 What You Get

✅ **Native Android App** - No browser needed
✅ **Fullscreen Experience** - Looks like a real app
✅ **Faster Loading** - Native WebView is faster than Chrome
✅ **Auto Updates** - When you deploy to Vercel, app gets updates automatically
✅ **Barcode Scanner** - Works with built-in scanner
✅ **Touch Optimized** - All UI elements optimized for POS

## 🔧 Troubleshooting

### "Cannot find module '@capacitor/cli'"
```bash
npm install --legacy-peer-deps
```

### App shows blank screen
- Check `capacitor.config.ts` - ensure URL is correct
- Verify device has internet connection
- Check Android Studio Logcat for errors

### Build fails in Android Studio
- Update Android Studio to latest version
- File → Invalidate Caches → Invalidate and Restart
- Try: Build → Clean Project, then Build → Rebuild Project

## 📦 Building APK for Distribution

### Debug APK (for testing)
```bash
cd android
./gradlew assembleDebug
# APK location: android/app/build/outputs/apk/debug/app-debug.apk
```

### Release APK (for distribution)
```bash
cd android
./gradlew assembleRelease
# APK location: android/app/build/outputs/apk/release/app-release-unsigned.apk
```

Transfer the APK to your Sunmi device and install it.

## 🎯 Next Steps

1. ✅ Update Vercel URL in `capacitor.config.ts`
2. ✅ Run `npm install`
3. ✅ Run `npm run sync`
4. ✅ Run `npm run android` to open Android Studio
5. ✅ Build and install on your Sunmi V2 Pro!

That's it! Your native Android app is ready! 🎉

