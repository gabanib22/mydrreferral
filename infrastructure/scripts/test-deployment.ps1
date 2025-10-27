# MyDrReferral Deployment Test Script (PowerShell)
# This script tests the deployment process locally on Windows

param(
    [switch]$Verbose
)

# Colors for output
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"
$Blue = "Blue"

Write-Host "🧪 Testing MyDrReferral deployment process..." -ForegroundColor $Blue

# Check if we're in the right directory
if (-not (Test-Path "Api/MyDrReferral.Api/MyDrReferral.Api.csproj")) {
    Write-Host "❌ Please run this script from the project root directory" -ForegroundColor $Red
    exit 1
}

# Test .NET build
Write-Host "🔧 Testing .NET build..." -ForegroundColor $Yellow
Set-Location Api
try {
    dotnet build MyDrReferral.Api/MyDrReferral.Api.csproj --configuration Release
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ .NET build successful" -ForegroundColor $Green
    } else {
        Write-Host "❌ .NET build failed" -ForegroundColor $Red
        exit 1
    }
}
catch {
    Write-Host "❌ .NET build failed" -ForegroundColor $Red
    exit 1
}

# Test .NET publish
Write-Host "📦 Testing .NET publish..." -ForegroundColor $Yellow
try {
    dotnet publish MyDrReferral.Api/MyDrReferral.Api.csproj `
        --configuration Release `
        --output ./publish `
        --no-restore
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ .NET publish successful" -ForegroundColor $Green
    } else {
        Write-Host "❌ .NET publish failed" -ForegroundColor $Red
        exit 1
    }
}
catch {
    Write-Host "❌ .NET publish failed" -ForegroundColor $Red
    exit 1
}

# Test deployment package creation
Write-Host "📁 Testing deployment package creation..." -ForegroundColor $Yellow
try {
    # Create a zip file instead of tar.gz on Windows
    if (Test-Path "publish") {
        Compress-Archive -Path "publish/*" -DestinationPath "mydrreferral-api.zip" -Force
        Write-Host "✅ Deployment package created successfully" -ForegroundColor $Green
        $packageSize = (Get-Item "mydrreferral-api.zip").Length
        Write-Host "Package size: $([math]::Round($packageSize / 1MB, 2)) MB"
    } else {
        Write-Host "❌ Publish directory not found" -ForegroundColor $Red
        exit 1
    }
}
catch {
    Write-Host "❌ Deployment package creation failed" -ForegroundColor $Red
    exit 1
}

# Test package extraction
Write-Host "📂 Testing package extraction..." -ForegroundColor $Yellow
try {
    if (Test-Path "mydrreferral-api.zip") {
        New-Item -ItemType Directory -Path "test-extract" -Force | Out-Null
        Expand-Archive -Path "mydrreferral-api.zip" -DestinationPath "test-extract" -Force
        Write-Host "✅ Package extraction successful" -ForegroundColor $Green
        Write-Host "Extracted files:"
        Get-ChildItem "test-extract" | Format-Table Name, Length
    } else {
        Write-Host "❌ Package file not found" -ForegroundColor $Red
        exit 1
    }
}
catch {
    Write-Host "❌ Package extraction failed" -ForegroundColor $Red
    exit 1
}

# Check for required files
Write-Host "🔍 Checking for required files..." -ForegroundColor $Yellow
if (Test-Path "test-extract/MyDrReferral.Api.dll") {
    Write-Host "✅ MyDrReferral.Api.dll found" -ForegroundColor $Green
}
else {
    Write-Host "❌ MyDrReferral.Api.dll not found" -ForegroundColor $Red
    exit 1
}

# Cleanup
Write-Host "🧹 Cleaning up test files..." -ForegroundColor $Yellow
Remove-Item -Path "test-extract" -Recurse -Force
Remove-Item -Path "mydrreferral-api.zip" -Force
Remove-Item -Path "publish" -Recurse -Force

Write-Host "🎉 All deployment tests passed!" -ForegroundColor $Green
Write-Host "📋 Test Summary:" -ForegroundColor $Blue
Write-Host "  ✅ .NET build"
Write-Host "  ✅ .NET publish"
Write-Host "  ✅ Package creation"
Write-Host "  ✅ Package extraction"
Write-Host "  ✅ Required files present"
Write-Host ""
Write-Host "The deployment process is ready for production!" -ForegroundColor $Green
