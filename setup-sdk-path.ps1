# Setup Android SDK Path
# Run this script to configure Android SDK

Write-Host "Setting up Android SDK Path..." -ForegroundColor Green
Write-Host ""

# Check if SDK directory exists
$sdkPath = "C:\Android\Sdk"
if (-not (Test-Path $sdkPath)) {
    Write-Host "⚠️  SDK directory not found at: $sdkPath" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "The SDK will be created when you install components." -ForegroundColor Cyan
    Write-Host "After running sdkmanager, the SDK will be at: $sdkPath" -ForegroundColor Cyan
    Write-Host ""
    
    # Ask if they want to create the directory structure
    $create = Read-Host "Create SDK directory structure? (y/n)"
    if ($create -eq 'y') {
        New-Item -ItemType Directory -Path $sdkPath -Force | Out-Null
        Write-Host "✅ Created SDK directory" -ForegroundColor Green
    }
}

# Set environment variable for current session
$env:ANDROID_HOME = $sdkPath
Write-Host "✅ Set ANDROID_HOME for current session: $sdkPath" -ForegroundColor Green

# Set permanently for user
try {
    [Environment]::SetEnvironmentVariable("ANDROID_HOME", $sdkPath, "User")
    Write-Host "✅ Set ANDROID_HOME permanently (requires new terminal session)" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Could not set permanent environment variable: $_" -ForegroundColor Yellow
}

# Update local.properties
$escapedPath = $sdkPath -replace '\\', '\\'
$localPropsPath = "android\local.properties"
$content = "# Android SDK location`nsdk.dir=$escapedPath"

Set-Content -Path $localPropsPath -Value $content -Force
Write-Host "✅ Updated android\local.properties" -ForegroundColor Green

Write-Host ""
Write-Host "Configuration complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Complete SDK installation (if still running)" -ForegroundColor White
Write-Host "2. Verify SDK exists: Test-Path C:\Android\Sdk" -ForegroundColor White
Write-Host "3. Build APK: .\build-apk.ps1" -ForegroundColor White
Write-Host ""

