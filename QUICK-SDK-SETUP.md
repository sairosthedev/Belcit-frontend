# Quick Android SDK Setup

## 🚀 Easiest Method: Install Android Studio

### Step 1: Download & Install
1. **Download Android Studio**: https://developer.android.com/studio
2. **Install** (it will automatically install Android SDK)
3. **During setup**, make note of where SDK is installed (usually `C:\Users\YourUsername\AppData\Local\Android\Sdk`)

### Step 2: Configure Your Project

After installation, run:

```powershell
.\setup-android-sdk.ps1
```

This will automatically detect and configure the SDK path.

**OR** manually edit `android\local.properties`:

```properties
sdk.dir=C\:\\Users\\macdo\\AppData\\Local\\Android\\Sdk
```

(Replace `macdo` with your Windows username)

### Step 3: Build APK

```powershell
.\build-apk.ps1
```

## ⚡ Alternative: Command Line Tools Only (Smaller Download)

If you don't want to install full Android Studio:

### Step 1: Download Command Line Tools
- Go to: https://developer.android.com/studio#command-tools
- Download "Command line tools only" for Windows
- Extract to: `C:\Android\cmdline-tools\latest`

### Step 2: Install SDK

```powershell
# Navigate to cmdline-tools
cd C:\Android\cmdline-tools\latest\bin

# Accept licenses (press 'y' for each)
.\sdkmanager.bat --licenses

# Install required components
.\sdkmanager.bat "platform-tools" "platforms;android-36" "build-tools;34.0.0"
```

### Step 3: Configure

Edit `android\local.properties`:
```properties
sdk.dir=C\:\\Android\\Sdk
```

### Step 4: Build

```powershell
.\build-apk.ps1
```

## ✅ After SDK is Installed

Once SDK is configured, you can build anytime with:

```powershell
.\build-apk.ps1
```

The APK will be at: `android\app\build\outputs\apk\debug\app-debug.apk`

