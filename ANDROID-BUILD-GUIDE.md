# Android App Build Guide for Sunmi V2 Pro

This guide will help you build a native Android app for your Sunmi V2 Pro POS device.

## Prerequisites

- Node.js 18+ installed
- Java JDK 11 or higher
- Android Studio (for building APK)
- Your Next.js app deployed to Vercel (or another hosting service)

## Quick Start

### Step 1: Install Dependencies

```bash
npm install
```

This will install Capacitor and all required dependencies.

### Step 2: Configure Your Deployed URL

Update `capacitor.config.ts` with your deployed Vercel URL:

```typescript
const DEPLOYED_URL = 'https://your-actual-app.vercel.app';
```

Or set it as an environment variable:

```bash
# Create .env.local
NEXT_PUBLIC_DEPLOYED_URL=https://your-app.vercel.app
```

### Step 3: Sync Capacitor

```bash
npm run sync
```

This syncs your web assets with the Android project.

### Step 4: Build the Android App

#### Option A: Using Android Studio (Recommended)

1. **Open Android Studio**
2. **Open Project**: File → Open → Select the `android` folder
3. **Wait for Gradle Sync** (first time may take a few minutes)
4. **Connect your Sunmi V2 Pro** via USB (enable USB debugging in device settings)
5. **Build and Run**:
   - Click the green "Run" button, or
   - Build → Build Bundle(s) / APK(s) → Build APK(s)
6. **Install on Device**: The app will automatically install and launch

#### Option B: Using Command Line

```bash
# Navigate to android folder
cd android

# Build debug APK
./gradlew assembleDebug

# The APK will be in: android/app/build/outputs/apk/debug/app-debug.apk

# Install on connected device
./gradlew installDebug
```

### Step 5: Build Release APK (For Distribution)

```bash
cd android

# Build release APK (unsigned)
./gradlew assembleRelease

# The APK will be in: android/app/build/outputs/apk/release/app-release-unsigned.apk
```

**For signed release APK** (required for distribution):
1. Create a keystore (one-time setup):
   ```bash
   keytool -genkey -v -keystore belcit-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias belcit
   ```
2. Create `android/keystore.properties`:
   ```properties
   storePassword=your-store-password
   keyPassword=your-key-password
   keyAlias=belcit
   storeFile=../belcit-release-key.jks
   ```
3. Update `android/app/build.gradle` to use signing config (see below)

## Configuration Details

### Capacitor Config

The app uses **server mode**, which means:
- ✅ Your Next.js app runs on Vercel (all features work)
- ✅ Native app provides native experience
- ✅ Better performance than web browser
- ✅ Access to native device features
- ✅ Works offline (with limitations)

### Android Manifest

Already configured for:
- ✅ Internet access
- ✅ Network state checking
- ✅ Barcode scanner support (camera permission)
- ✅ File access for printing
- ✅ Hardware acceleration

## Building for Sunmi V2 Pro

### Device Specifications
- **Android Version**: 7.1+ (API 24+)
- **Screen**: Optimized for touch
- **Barcode Scanner**: Built-in (works as keyboard input)

### Build Configuration

The app is already configured for:
- **Min SDK**: 24 (Android 7.1) - Compatible with Sunmi V2 Pro
- **Target SDK**: 36 (Latest Android)
- **Package Name**: `com.belcit.trading`
- **App Name**: BELCIT Trading

## Updating the App

When you make changes to your Next.js app:

1. **Deploy to Vercel** (or your hosting service)
2. **Update the URL** in `capacitor.config.ts` if it changed
3. **Sync Capacitor**:
   ```bash
   npm run sync
   ```
4. **Rebuild APK** in Android Studio or via command line
5. **Install on device**

## Troubleshooting

### Issue: "Cannot find module '@capacitor/cli'"

**Solution:**
```bash
npm install
```

### Issue: Gradle build fails

**Solutions:**
1. Update Android Studio to latest version
2. Update Gradle wrapper:
   ```bash
   cd android
   ./gradlew wrapper --gradle-version=8.5
   ```
3. Clean and rebuild:
   ```bash
   ./gradlew clean
   ./gradlew build
   ```

### Issue: App shows blank screen

**Solutions:**
1. Check `capacitor.config.ts` - ensure `server.url` is correct
2. Check device internet connection
3. Check browser console in Android Studio (View → Tool Windows → Logcat)
4. Verify your deployed URL is accessible

### Issue: Barcode scanner not working

**Solutions:**
1. Ensure camera permission is granted in device settings
2. Check that `captureInput: true` is set in `capacitor.config.ts`
3. Test scanner in another app to verify hardware works

### Issue: App crashes on launch

**Solutions:**
1. Check Logcat in Android Studio for error messages
2. Verify all dependencies are installed
3. Try clean build:
   ```bash
   cd android
   ./gradlew clean
   ./gradlew assembleDebug
   ```

## Development Workflow

### For Development (Local Testing)

1. **Start Next.js dev server**:
   ```bash
   npm run dev
   ```

2. **Find your local IP**:
   - Windows: `ipconfig` (look for IPv4)
   - Mac/Linux: `ifconfig` or `ip addr`

3. **Update `capacitor.config.ts`**:
   ```typescript
   server: {
     url: 'http://YOUR_LOCAL_IP:3000',
     cleartext: true, // Required for http://
   }
   ```

4. **Sync and run**:
   ```bash
   npm run sync
   npm run android
   ```

### For Production

1. **Deploy to Vercel**
2. **Update config with production URL**
3. **Build release APK**
4. **Distribute to devices**

## Signing the APK for Release

### Create Keystore (One-time)

```bash
keytool -genkey -v -keystore belcit-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias belcit
```

### Configure Signing

Create `android/keystore.properties`:
```properties
storePassword=your-store-password
keyPassword=your-key-password
keyAlias=belcit
storeFile=../belcit-release-key.jks
```

Update `android/app/build.gradle`:
```gradle
// Add at the top
def keystorePropertiesFile = rootProject.file("keystore.properties")
def keystoreProperties = new Properties()
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}

android {
    // ... existing config ...
    
    signingConfigs {
        release {
            if (keystorePropertiesFile.exists()) {
                keyAlias keystoreProperties['keyAlias']
                keyPassword keystoreProperties['keyPassword']
                storeFile file(keystoreProperties['storeFile'])
                storePassword keystoreProperties['storePassword']
            }
        }
    }
    
    buildTypes {
        release {
            signingConfig signingConfigs.release
            // ... rest of config
        }
    }
}
```

## Distribution

### Option 1: Direct Install (APK)

1. Build release APK
2. Transfer APK to Sunmi device (via USB, email, or cloud storage)
3. Enable "Install from Unknown Sources" in device settings
4. Open APK file and install

### Option 2: Google Play Store

1. Create Google Play Developer account
2. Build signed release APK or AAB
3. Upload to Play Console
4. Submit for review

### Option 3: Internal Distribution

- Use MDM (Mobile Device Management) solution
- Distribute via company app store
- Use ADB to install on multiple devices

## Features

✅ **Native App Experience** - Fullscreen, no browser UI
✅ **Offline Support** - Caches web content
✅ **Barcode Scanner** - Works with built-in scanner
✅ **Touch Optimized** - All UI elements optimized for touch
✅ **Fast Loading** - Native WebView is faster than browser
✅ **Auto Updates** - When you deploy new version, app loads it automatically

## Next Steps

1. ✅ Install dependencies: `npm install`
2. ✅ Update deployed URL in `capacitor.config.ts`
3. ✅ Sync Capacitor: `npm run sync`
4. ✅ Open in Android Studio: `npm run android`
5. ✅ Build and install on Sunmi V2 Pro

## Support

If you encounter issues:
1. Check Android Studio Logcat for errors
2. Verify your deployed URL is accessible
3. Ensure device has internet connection
4. Check device permissions in Settings

