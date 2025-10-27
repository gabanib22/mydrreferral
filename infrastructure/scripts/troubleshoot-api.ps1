# MyDrReferral API Troubleshooting Script (PowerShell)
# This script helps diagnose and fix API deployment issues

Write-Host "🔍 MyDrReferral API Troubleshooting Script" -ForegroundColor Blue
Write-Host "==========================================" -ForegroundColor Blue

# Colors
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"
$Blue = "Blue"

# Function to print colored output
function Write-Status {
    param(
        [string]$Status,
        [string]$Message
    )
    
    switch ($Status) {
        "OK" { Write-Host "✅ $Message" -ForegroundColor $Green }
        "WARN" { Write-Host "⚠️  $Message" -ForegroundColor $Yellow }
        "ERROR" { Write-Host "❌ $Message" -ForegroundColor $Red }
        default { Write-Host "ℹ️  $Message" -ForegroundColor $Blue }
    }
}

Write-Host ""
Write-Status "INFO" "Starting comprehensive API diagnostics..."

# 1. Check if EC2 instance is running
Write-Host ""
Write-Status "INFO" "1. Checking EC2 instance status..."
try {
    $ping = Test-Connection -ComputerName "52.66.197.58" -Count 1 -Quiet
    if ($ping) {
        Write-Status "OK" "EC2 instance is reachable"
    } else {
        Write-Status "ERROR" "EC2 instance is not reachable"
        exit 1
    }
} catch {
    Write-Status "ERROR" "Failed to ping EC2 instance: $_"
    exit 1
}

# 2. Test API connectivity
Write-Host ""
Write-Status "INFO" "2. Testing API connectivity..."

for ($i = 1; $i -le 5; $i++) {
    Write-Host "Attempt $i`: Testing API health..."
    try {
        $response = Invoke-WebRequest -Uri "http://52.66.197.58/api/health" -TimeoutSec 10 -UseBasicParsing
        if ($response.StatusCode -eq 200) {
            Write-Status "OK" "API is healthy!"
            Write-Host "Response: $($response.Content)"
            exit 0
        }
    } catch {
        Write-Host "API not responding: $($_.Exception.Message)"
        if ($i -lt 5) {
            Write-Host "Waiting 5 seconds before next attempt..."
            Start-Sleep -Seconds 5
        }
    }
}

Write-Status "ERROR" "API health check failed after all attempts"

# 3. Manual troubleshooting steps
Write-Host ""
Write-Status "INFO" "3. Manual troubleshooting steps:"
Write-Host ""
Write-Host "Please SSH into your EC2 instance and run these commands:" -ForegroundColor $Yellow
Write-Host ""
Write-Host "1. Check if services are running:" -ForegroundColor $Blue
Write-Host "   sudo systemctl status mydrreferral-api.service" -ForegroundColor White
Write-Host "   sudo systemctl status nginx" -ForegroundColor White
Write-Host "   sudo systemctl status postgresql" -ForegroundColor White
Write-Host ""
Write-Host "2. Check what's listening on port 80:" -ForegroundColor $Blue
Write-Host "   sudo netstat -tlnp | grep :80" -ForegroundColor White
Write-Host ""
Write-Host "3. Check API logs:" -ForegroundColor $Blue
Write-Host "   sudo journalctl -u mydrreferral-api.service -f" -ForegroundColor White
Write-Host ""
Write-Host "4. Check API directory:" -ForegroundColor $Blue
Write-Host "   ls -la /var/www/mydrreferral/Api/" -ForegroundColor White
Write-Host ""
Write-Host "5. Test API startup script manually:" -ForegroundColor $Blue
Write-Host "   cd /var/www/mydrreferral" -ForegroundColor White
Write-Host "   ./start-api.sh" -ForegroundColor White
Write-Host ""
Write-Host "6. Restart services:" -ForegroundColor $Blue
Write-Host "   sudo systemctl restart mydrreferral-api.service" -ForegroundColor White
Write-Host "   sudo systemctl restart nginx" -ForegroundColor White
Write-Host ""

Write-Status "INFO" "Troubleshooting completed. Check the manual steps above."
