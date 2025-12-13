# Android SDK Setup Script
# This script helps you set up Android SDK for building APK

Write-Host "Android SDK Setup for BELCIT Trading" -ForegroundColor Green
Write-Host ""

# Check if SDK already exists
$sdkPaths = @(
    "$env:LOCALAPPDATA\Android\Sdk",
    "$env:USERPROFILE\AppData\Local\Android\Sdk",
    "C:\Android\Sdk"
)

$foundSdk = $null
foreach ($path in $sdkPaths) {
    if (Test-Path $path) {
        $foundSdk = $path
        Write-Host "✅ Found Android SDK at: $path" -ForegroundColor Green
        break
    }
}

if ($foundSdk) {
    Write-Host ""
    Write-Host "Updating local.properties..." -ForegroundColor Yellow
    
    # Escape backslashes for Java properties file
    $escapedPath = $foundSdk -replace '\\', '\\'
    
    # Create or update local.properties
    $localProps = "android\local.properties"
    $content = "sdk.dir=$escapedPath"
    Set-Content -Path $localProps -Value $content
    
    Write-Host "✅ Updated local.properties with SDK path" -ForegroundColor Green
    Write-Host ""
    Write-Host "You can now build the APK:" -ForegroundColor Cyan
    Write-Host "  cd android" -ForegroundColor White
    Write-Host "  .\gradlew.bat assembleDebug" -ForegroundColor White
} else {
    Write-Host "❌ Android SDK not found" -ForegroundColor Red
    Write-Host ""
    Write-Host "You need to install Android SDK first:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Option 1: Install Android Studio (Easiest)" -ForegroundColor Cyan
    Write-Host "  1. Download from: https://developer.android.com/studio" -ForegroundColor White
    Write-Host "  2. Install (it will install SDK automatically)" -ForegroundColor White
    Write-Host "  3. Run this script again" -ForegroundColor White
    Write-Host ""
    Write-Host "Option 2: Install Command Line Tools Only" -ForegroundColor Cyan
    Write-Host "  1. Download from: https://developer.android.com/studio#command-tools" -ForegroundColor White
    Write-Host "  2. Extract to C:\Android\cmdline-tools" -ForegroundColor White
    Write-Host "  3. Run: .\sdkmanager.bat 'platform-tools' 'platforms;android-36' 'build-tools;34.0.0'" -ForegroundColor White
    Write-Host "  4. Run this script again" -ForegroundColor White
    Write-Host ""
    Write-Host "See INSTALL-ANDROID-SDK.md for detailed instructions" -ForegroundColor Yellow
}

