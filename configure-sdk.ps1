# Configure Android SDK Path
# Run this after installing Android SDK

Write-Host "Configuring Android SDK Path..." -ForegroundColor Green
Write-Host ""

# Check common SDK locations
$sdkLocations = @(
    "C:\Android\Sdk",
    "$env:LOCALAPPDATA\Android\Sdk",
    "$env:USERPROFILE\AppData\Local\Android\Sdk"
)

$foundSdk = $null
foreach ($location in $sdkLocations) {
    if (Test-Path $location) {
        $foundSdk = $location
        Write-Host "✅ Found Android SDK at: $location" -ForegroundColor Green
        break
    }
}

if ($foundSdk) {
    # Escape backslashes for Java properties file format
    $escapedPath = $foundSdk -replace '\\', '\\'
    
    # Create local.properties file
    $localPropsPath = "android\local.properties"
    $content = "# Android SDK location`nsdk.dir=$escapedPath"
    
    Set-Content -Path $localPropsPath -Value $content -Force
    
    Write-Host ""
    Write-Host "✅ Configured SDK path in local.properties" -ForegroundColor Green
    Write-Host ""
    Write-Host "SDK Location: $foundSdk" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "You can now build the APK:" -ForegroundColor Yellow
    Write-Host "  .\build-apk.ps1" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host "❌ Android SDK not found in common locations" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please specify your SDK location:" -ForegroundColor Yellow
    Write-Host ""
    $customPath = Read-Host "Enter SDK path (e.g., C:\Android\Sdk)"
    
    if ($customPath -and (Test-Path $customPath)) {
        $escapedPath = $customPath -replace '\\', '\\'
        $localPropsPath = "android\local.properties"
        $content = "# Android SDK location`nsdk.dir=$escapedPath"
        Set-Content -Path $localPropsPath -Value $content -Force
        Write-Host ""
        Write-Host "✅ Configured SDK path!" -ForegroundColor Green
        Write-Host "You can now build: .\build-apk.ps1" -ForegroundColor Cyan
    } else {
        Write-Host ""
        Write-Host "❌ Invalid path. Please run this script again after installing SDK." -ForegroundColor Red
    }
}

