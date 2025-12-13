# Simple APK Build Guide (No Android Studio Needed)

## ✅ You Don't Need Android Studio!

You can build the APK using command line tools.

## Quick Build Steps

### Step 1: Sync Capacitor (if you changed config)

```powershell
npm run sync
```

### Step 2: Build the APK

```powershell
cd android
.\gradlew.bat assembleDebug
```

### Step 3: Find Your APK

The APK will be created at:
```
android\app\build\outputs\apk\debug\app-debug.apk
```

### Step 4: Install on Sunmi V2 Pro

1. **Transfer APK to device:**
   - Copy via USB
   - Email to yourself
   - Upload to Google Drive and download on device

2. **Enable installation:**
   - Settings → Security → Enable "Install from Unknown Sources"

3. **Install:**
   - Open file manager on device
   - Find the APK file
   - Tap to install

## What You Need

### Minimum Requirements:
- ✅ Java JDK 11 or higher
- ✅ Gradle (included in project - `gradlew.bat`)

### Check if Java is installed:
```powershell
java -version
```

If not installed, download from: https://adoptium.net/

## Troubleshooting

### "java: command not found"
**Install Java JDK:**
1. Download from https://adoptium.net/
2. Install
3. Restart terminal
4. Verify: `java -version`

### "gradlew.bat: Access Denied"
**Fix permissions:**
```powershell
cd android
Unblock-File .\gradlew.bat
.\gradlew.bat assembleDebug
```

### Build takes too long (first time)
- First build downloads dependencies (5-10 minutes)
- Subsequent builds are faster (1-2 minutes)

### Build fails with errors
**Try clean build:**
```powershell
cd android
.\gradlew.bat clean
.\gradlew.bat assembleDebug
```

## Alternative: Use Online Build Service

If command line doesn't work, you can use:

1. **GitHub Actions** - Automated builds
2. **AppCenter** - Microsoft's build service
3. **Bitrise** - CI/CD for mobile apps

## Your Current Setup

✅ Capacitor configured
✅ Android project ready
✅ URL set to: `https://belcit-frontend.vercel.app`
✅ Build scripts added

**Just run:**
```powershell
cd android
.\gradlew.bat assembleDebug
```

Then transfer the APK to your Sunmi device!

