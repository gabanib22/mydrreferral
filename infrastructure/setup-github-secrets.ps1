# GitHub Secrets Setup Script
# This script helps you set up the required secrets for GitHub Actions

Write-Host "=== MyDrReferral GitHub Actions Secrets Setup ===" -ForegroundColor Green
Write-Host ""

Write-Host "Please add these secrets to your GitHub repository:" -ForegroundColor Yellow
Write-Host "Repository: https://github.com/gabanib22/mydrreferral" -ForegroundColor Cyan
Write-Host "Navigate to: Settings → Secrets and variables → Actions" -ForegroundColor Cyan
Write-Host ""

Write-Host "=== REQUIRED SECRETS ===" -ForegroundColor Red
Write-Host ""

Write-Host "1. AWS_ACCESS_KEY_ID" -ForegroundColor Yellow
Write-Host "   Name: AWS_ACCESS_KEY_ID" -ForegroundColor White
Write-Host "   Value: [Your AWS Access Key ID]" -ForegroundColor Gray
Write-Host "   Get from: AWS Console → IAM → Users → Your user → Security credentials" -ForegroundColor Gray
Write-Host ""

Write-Host "2. AWS_SECRET_ACCESS_KEY" -ForegroundColor Yellow
Write-Host "   Name: AWS_SECRET_ACCESS_KEY" -ForegroundColor White
Write-Host "   Value: [Your AWS Secret Access Key]" -ForegroundColor Gray
Write-Host "   Get from: AWS Console → IAM → Users → Your user → Security credentials" -ForegroundColor Gray
Write-Host ""

Write-Host "3. EC2_SSH_KEY" -ForegroundColor Yellow
Write-Host "   Name: EC2_SSH_KEY" -ForegroundColor White
Write-Host "   Value: [Copy the private key content below]" -ForegroundColor Gray
Write-Host ""

Write-Host "4. EC2_HOST" -ForegroundColor Yellow
Write-Host "   Name: EC2_HOST" -ForegroundColor White
Write-Host "   Value: 52.66.197.58" -ForegroundColor Green
Write-Host ""

Write-Host "5. S3_BUCKET_NAME" -ForegroundColor Yellow
Write-Host "   Name: S3_BUCKET_NAME" -ForegroundColor White
Write-Host "   Value: mydrreferral-frontend-1eqovfla" -ForegroundColor Green
Write-Host ""

Write-Host "6. DATABASE_CONNECTION_STRING" -ForegroundColor Yellow
Write-Host "   Name: DATABASE_CONNECTION_STRING" -ForegroundColor White
Write-Host "   Value: Host=localhost;Database=mydrreferral;Username=mydrreferral;Password=MyDrReferral2024!SecurePassword" -ForegroundColor Green
Write-Host ""

Write-Host "=== SSH PRIVATE KEY CONTENT ===" -ForegroundColor Red
Write-Host "Copy this entire content for EC2_SSH_KEY secret:" -ForegroundColor Yellow
Write-Host ""

# Display the private key content
$privateKeyPath = "$env:USERPROFILE\.ssh\mydrreferral_key"
if (Test-Path $privateKeyPath) {
    $privateKeyContent = Get-Content $privateKeyPath -Raw
    Write-Host $privateKeyContent -ForegroundColor White
} else {
    Write-Host "Private key not found at: $privateKeyPath" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== NEXT STEPS ===" -ForegroundColor Green
Write-Host "1. Add all secrets to GitHub repository" -ForegroundColor White
Write-Host "2. Test the deployment by pushing to main branch" -ForegroundColor White
Write-Host "3. Monitor the GitHub Actions workflow" -ForegroundColor White
Write-Host "4. Check your application URLs:" -ForegroundColor White
Write-Host "   - Frontend: http://mydrreferral-frontend-1eqovfla.s3-website.ap-south-1.amazonaws.com" -ForegroundColor Cyan
Write-Host "   - API: http://52.66.197.58" -ForegroundColor Cyan
Write-Host ""

Write-Host "Press any key to continue..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
