# Build Android APK Without Android Studio

You can build the APK using command line tools without Android Studio!

## Option 1: Build APK Directly (Recommended)

### Prerequisites

1. **Install Java JDK 11+**
   - Download from: https://adoptium.net/
   - Install and set JAVA_HOME environment variable

2. **Install Android SDK Command Line Tools**
   - Download from: https://developer.android.com/studio#command-tools
   - Extract to a folder (e.g., `C:\Android\cmdline-tools`)
   - Add to PATH: `C:\Android\cmdline-tools\bin`

### Build Steps

1. **Navigate to android folder:**
   ```bash
   cd android
   ```

2. **Build Debug APK:**
   ```bash
   .\gradlew.bat assembleDebug
   ```

3. **Find your APK:**
   - Location: `android\app\build\outputs\apk\debug\app-debug.apk`

4. **Transfer to Sunmi device:**
   - Copy APK to device via USB, email, or cloud storage
   - Enable "Install from Unknown Sources" in device settings
   - Open APK file and install

## Option 2: Use Android Studio (If You Want GUI)

### Install Android Studio

1. **Download Android Studio:**
   - https://developer.android.com/studio
   - Install the full package

2. **Configure Path (if needed):**
   ```powershell
   # Set environment variable
   $env:CAPACITOR_ANDROID_STUDIO_PATH = "C:\Program Files\Android\Android Studio\bin\studio64.exe"
   ```

3. **Open Project:**
   ```bash
   npm run android
   ```

## Option 3: Build Release APK (For Distribution)

### Create Keystore (One-time)

```bash
keytool -genkey -v -keystore belcit-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias belcit
```

### Configure Signing

Create `android/keystore.properties`:
```properties
storePassword=your-password
keyPassword=your-password
keyAlias=belcit
storeFile=../belcit-release-key.jks
```

### Update build.gradle

Add to `android/app/build.gradle`:

```gradle
def keystorePropertiesFile = rootProject.file("keystore.properties")
def keystoreProperties = new Properties()
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}

android {
    // ... existing code ...
    
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
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

### Build Release APK

```bash
cd android
.\gradlew.bat assembleRelease
```

APK location: `android\app\build\outputs\apk\release\app-release-unsigned.apk`

## Quick Command Reference

```bash
# Sync Capacitor
npm run sync

# Build debug APK
cd android
.\gradlew.bat assembleDebug

# Build release APK
.\gradlew.bat assembleRelease

# Clean build
.\gradlew.bat clean
.\gradlew.bat assembleDebug

# Install on connected device (if ADB is set up)
.\gradlew.bat installDebug
```

## Troubleshooting

### "gradlew.bat not found"
- Make sure you're in the `android` folder
- The file should be there if Capacitor sync worked

### "JAVA_HOME not set"
```powershell
# Find Java installation
where java

# Set JAVA_HOME (replace path with your Java location)
$env:JAVA_HOME = "C:\Program Files\Java\jdk-11"
```

### "SDK not found"
- Install Android SDK Command Line Tools
- Set ANDROID_HOME environment variable:
```powershell
$env:ANDROID_HOME = "C:\Android\Sdk"
```

### Build fails with Gradle errors
```bash
cd android
.\gradlew.bat clean
.\gradlew.bat --refresh-dependencies
.\gradlew.bat assembleDebug
```

## Installing APK on Sunmi V2 Pro

### Method 1: USB Transfer
1. Connect device via USB
2. Enable "File Transfer" mode
3. Copy APK to device
4. Open file manager on device
5. Tap APK to install

### Method 2: ADB Install (If ADB is set up)
```bash
adb install android\app\build\outputs\apk\debug\app-debug.apk
```

### Method 3: Cloud/Email
1. Upload APK to Google Drive/Dropbox
2. Download on device
3. Install

## Next Steps

1. ✅ Update URL in `capacitor.config.ts` (you already did this!)
2. ✅ Run `npm run sync`
3. ✅ Build APK: `cd android && .\gradlew.bat assembleDebug`
4. ✅ Transfer APK to Sunmi device
5. ✅ Install and test!

