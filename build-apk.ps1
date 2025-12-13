# Build Android APK Script for Sunmi V2 Pro
# Run this script to build the APK without Android Studio

Write-Host "Building Android APK for BELCIT Trading..." -ForegroundColor Green
Write-Host ""

# Navigate to android folder
Set-Location android

Write-Host "Step 1: Cleaning previous build..." -ForegroundColor Yellow
.\gradlew.bat clean

Write-Host ""
Write-Host "Step 2: Building debug APK..." -ForegroundColor Yellow
.\gradlew.bat assembleDebug

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Build successful!" -ForegroundColor Green
    Write-Host ""
    Write-Host "APK Location:" -ForegroundColor Cyan
    Write-Host "android\app\build\outputs\apk\debug\app-debug.apk" -ForegroundColor White
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Transfer the APK to your Sunmi V2 Pro device" -ForegroundColor White
    Write-Host "2. Enable 'Install from Unknown Sources' in device settings" -ForegroundColor White
    Write-Host "3. Open the APK file on the device and install" -ForegroundColor White
    Write-Host ""
    
    # Check if APK exists and show size
    $apkPath = "app\build\outputs\apk\debug\app-debug.apk"
    if (Test-Path $apkPath) {
        $apkSize = (Get-Item $apkPath).Length / 1MB
        Write-Host "APK Size: $([math]::Round($apkSize, 2)) MB" -ForegroundColor Cyan
    }
} else {
    Write-Host ""
    Write-Host "❌ Build failed. Check the error messages above." -ForegroundColor Red
    Write-Host "Common fixes:" -ForegroundColor Yellow
    Write-Host "- Run: npm run sync" -ForegroundColor White
    Write-Host "- Check Java is installed: java -version" -ForegroundColor White
    Write-Host "- Try: .\gradlew.bat clean" -ForegroundColor White
}

# Return to project root
Set-Location ..

