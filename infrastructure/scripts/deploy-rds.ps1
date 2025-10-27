# MyDrReferral RDS Deployment Script (PowerShell)
# This script deploys the application to AWS with RDS PostgreSQL

param(
    [switch]$Force
)

# Colors for output
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

Write-Host "🚀 Starting MyDrReferral RDS deployment..." -ForegroundColor $Blue

# Check if AWS CLI is installed
try {
    aws --version | Out-Null
    Write-Status "OK" "AWS CLI is installed"
} catch {
    Write-Status "ERROR" "AWS CLI is not installed. Please install it first."
    exit 1
}

# Check if Terraform is installed
try {
    terraform --version | Out-Null
    Write-Status "OK" "Terraform is installed"
} catch {
    Write-Status "ERROR" "Terraform is not installed. Please install it first."
    exit 1
}

# Check AWS credentials
Write-Status "INFO" "Checking AWS credentials..."
try {
    aws sts get-caller-identity | Out-Null
    Write-Status "OK" "AWS credentials configured"
} catch {
    Write-Status "ERROR" "AWS credentials not configured. Please run 'aws configure'"
    exit 1
}

# Navigate to terraform directory
Set-Location infrastructure/terraform

# Check if terraform.tfvars exists
if (-not (Test-Path "terraform.tfvars")) {
    Write-Status "ERROR" "terraform.tfvars not found!"
    Write-Host ""
    Write-Host "Please create terraform.tfvars with your configuration:" -ForegroundColor $Yellow
    Write-Host ""
    Write-Host "aws_region = `"ap-south-1`""
    Write-Host "project_name = `"mydrreferral`""
    Write-Host "environment = `"production`""
    Write-Host "domain_name = `"mydrreferral.com`""
    Write-Host "db_password = `"YourSecurePassword123!`""
    Write-Host "ssh_public_key = `"your-ssh-public-key`""
    Write-Host ""
    exit 1
}

# Initialize Terraform
Write-Status "INFO" "Initializing Terraform..."
terraform init

# Plan deployment
Write-Status "INFO" "Planning RDS deployment..."
terraform plan -var-file="terraform.tfvars"

# Ask for confirmation
if (-not $Force) {
    Write-Host ""
    Write-Host "⚠️  This will create:" -ForegroundColor $Yellow
    Write-Host "  • VPC with public and private subnets"
    Write-Host "  • RDS PostgreSQL instance (db.t3.micro)"
    Write-Host "  • EC2 instance for API"
    Write-Host "  • S3 bucket for frontend"
    Write-Host "  • Security groups and networking"
    Write-Host ""
    Write-Host "💰 Estimated monthly cost: ~$25-35" -ForegroundColor $Yellow
    Write-Host ""
    
    $confirmation = Read-Host "Do you want to proceed with the RDS deployment? (y/N)"
    if ($confirmation -ne 'y' -and $confirmation -ne 'Y') {
        Write-Status "INFO" "Deployment cancelled."
        exit 1
    }
}

# Apply deployment
Write-Status "INFO" "Deploying RDS infrastructure..."
terraform apply -var-file="terraform.tfvars" -auto-approve

# Get outputs
Write-Status "INFO" "Getting deployment outputs..."
$frontendUrl = terraform output -raw frontend_url
$apiUrl = terraform output -raw api_url
$databaseEndpoint = terraform output -raw database_endpoint
$ec2PublicIp = terraform output -raw ec2_public_ip
$databasePort = terraform output -raw database_port
$databaseName = terraform output -raw database_name
$databaseUsername = terraform output -raw database_username

Write-Status "OK" "RDS Infrastructure deployed successfully!"
Write-Host ""
Write-Host "📋 Deployment Summary:" -ForegroundColor $Blue
Write-Host "  Frontend URL: $frontendUrl"
Write-Host "  API URL: $apiUrl"
Write-Host "  Database Endpoint: $databaseEndpoint"
Write-Host "  Database Port: $databasePort"
Write-Host "  Database Name: $databaseName"
Write-Host "  Database Username: $databaseUsername"
Write-Host "  EC2 Public IP: $ec2PublicIp"

# Save outputs to file
$outputs = @"
FRONTEND_URL=$frontendUrl
API_URL=$apiUrl
DATABASE_ENDPOINT=$databaseEndpoint
DATABASE_PORT=$databasePort
DATABASE_NAME=$databaseName
DATABASE_USERNAME=$databaseUsername
EC2_PUBLIC_IP=$ec2PublicIp
"@

$outputs | Out-File -FilePath "../../deployment-outputs-rds.txt" -Encoding UTF8
Write-Status "OK" "Deployment outputs saved to deployment-outputs-rds.txt"

# Generate connection string
$dbPassword = (Get-Content "terraform.tfvars" | Where-Object { $_ -match "db_password" } | ForEach-Object { ($_ -split '"')[1] })
$connectionString = "Host=$databaseEndpoint;Database=$databaseName;Username=$databaseUsername;Password=$dbPassword;Port=$databasePort"

Write-Host ""
Write-Host "📝 Next Steps:" -ForegroundColor $Blue
Write-Host "1. Update GitHub Secrets with the following values:"
Write-Host "   - AWS_ACCESS_KEY_ID: Your AWS access key"
Write-Host "   - AWS_SECRET_ACCESS_KEY: Your AWS secret key"
Write-Host "   - EC2_SSH_KEY: Your EC2 SSH private key"
Write-Host "   - DATABASE_CONNECTION_STRING: $connectionString"
Write-Host "   - EC2_HOST: $ec2PublicIp"
Write-Host "   - S3_BUCKET_NAME: $(terraform output -raw s3_bucket_name)"
Write-Host ""
Write-Host "2. Configure your domain DNS to point to:"
Write-Host "   - Frontend: $frontendUrl"
Write-Host "   - API: $apiUrl"
Write-Host ""
Write-Host "3. Test the deployment:"
Write-Host "   - Frontend: $frontendUrl"
Write-Host "   - API Health: $apiUrl/api/health"
Write-Host "   - Database: $databaseEndpoint`:$databasePort"

Write-Status "OK" "RDS deployment completed successfully!"
Write-Host ""
Write-Host "💡 Your database is now managed by AWS RDS with:" -ForegroundColor $Yellow
Write-Host "  • Automated backups"
Write-Host "  • High availability"
Write-Host "  • Monitoring and alerts"
Write-Host "  • Security and encryption"
