# PostgreSQL Database Setup Script for MyDrReferral
# Run this script as Administrator

Write-Host "Setting up PostgreSQL database for MyDrReferral..." -ForegroundColor Green

# Check if PostgreSQL is installed
try {
    $pgVersion = psql --version
    Write-Host "PostgreSQL found: $pgVersion" -ForegroundColor Green
} catch {
    Write-Host "PostgreSQL not found. Please install PostgreSQL first." -ForegroundColor Red
    Write-Host "Download from: https://www.postgresql.org/download/" -ForegroundColor Yellow
    exit 1
}

# Database configuration
$prodDb = "MyDrReferralDB"
$devDb = "MyDrReferralDB_Dev"
$username = "postgres"
$password = "postgres"

Write-Host "Creating databases..." -ForegroundColor Yellow

# Create production database
try {
    $env:PGPASSWORD = $password
    psql -U $username -h localhost -c "CREATE DATABASE `"$prodDb`";" 2>$null
    Write-Host "✓ Production database '$prodDb' created" -ForegroundColor Green
} catch {
    Write-Host "⚠ Production database might already exist" -ForegroundColor Yellow
}

# Create development database
try {
    psql -U $username -h localhost -c "CREATE DATABASE `"$devDb`";" 2>$null
    Write-Host "✓ Development database '$devDb' created" -ForegroundColor Green
} catch {
    Write-Host "⚠ Development database might already exist" -ForegroundColor Yellow
}

Write-Host "`nApplying Entity Framework migrations..." -ForegroundColor Yellow

# Navigate to Data project and apply migrations
Set-Location "MyDrReferral.Data"

try {
    dotnet ef database update --startup-project ../MyDrReferral.Api
    Write-Host "✓ Database migrations applied successfully" -ForegroundColor Green
} catch {
    Write-Host "✗ Failed to apply migrations. Please check the error above." -ForegroundColor Red
    exit 1
}

Write-Host "`nDatabase setup completed successfully!" -ForegroundColor Green
Write-Host "You can now run the application with: dotnet run --project MyDrReferral.Api" -ForegroundColor Cyan

# Reset environment variable
Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue
