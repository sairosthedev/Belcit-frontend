# Install Android SDK for Building APK

The build failed because Android SDK is not installed. Here's how to fix it:

## Option 1: Install Android SDK Command Line Tools (Recommended - No Android Studio)

### Step 1: Download Command Line Tools

1. Go to: https://developer.android.com/studio#command-tools
2. Download "Command line tools only" for Windows
3. Extract to a folder, e.g., `C:\Android\cmdline-tools`

### Step 2: Install SDK Components

Open PowerShell and run:

```powershell
# Navigate to cmdline-tools
cd C:\Android\cmdline-tools\bin

# Accept licenses
.\sdkmanager.bat --licenses

# Install required SDK components
.\sdkmanager.bat "platform-tools" "platforms;android-36" "build-tools;34.0.0"
```

### Step 3: Set Environment Variables

```powershell
# Set ANDROID_HOME
$env:ANDROID_HOME = "C:\Android\Sdk"
[Environment]::SetEnvironmentVariable("ANDROID_HOME", "C:\Android\Sdk", "User")

# Add to PATH
$env:PATH += ";C:\Android\Sdk\platform-tools"
[Environment]::SetEnvironmentVariable("PATH", $env:PATH, "User")
```

### Step 4: Update local.properties

Edit `android\local.properties`:
```properties
sdk.dir=C\:\\Android\\Sdk
```

## Option 2: Install Android Studio (Easier but Larger Download)

### Step 1: Download Android Studio

1. Go to: https://developer.android.com/studio
2. Download and install Android Studio
3. During installation, it will install the Android SDK automatically

### Step 2: Find SDK Location

After installation, the SDK is usually at:
```
C:\Users\YourUsername\AppData\Local\Android\Sdk
```

### Step 3: Update local.properties

Edit `android\local.properties`:
```properties
sdk.dir=C\:\\Users\\YourUsername\\AppData\\Local\\Android\\Sdk
```

Replace `YourUsername` with your actual Windows username.

## Option 3: Quick Fix - Use Capacitor's Built-in SDK

If you just want to build quickly, you can use Capacitor's approach:

1. Install Android Studio (even if you don't use it)
2. It will install SDK automatically
3. Update `local.properties` with the SDK path

## Verify Installation

After setting up, verify:

```powershell
# Check ANDROID_HOME
$env:ANDROID_HOME

# Check if SDK exists
Test-Path "$env:ANDROID_HOME\platform-tools"
```

## Then Build Again

```powershell
cd android
.\gradlew.bat assembleDebug
```

## Quick Setup Script

I'll create a script to help you set this up automatically.

