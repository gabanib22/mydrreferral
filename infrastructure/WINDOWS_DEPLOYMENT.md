# MyDrReferral Windows Deployment Guide

This guide covers deploying the MyDrReferral application to AWS from Windows using PowerShell.

## Prerequisites

### Required Tools
- [AWS CLI](https://aws.amazon.com/cli/) v2.0+
- [Terraform](https://terraform.io/) v1.0+
- [Node.js](https://nodejs.org/) v18+
- [.NET SDK](https://dotnet.microsoft.com/) v8.0+
- [Git](https://git-scm.com/)
- [PowerShell](https://docs.microsoft.com/en-us/powershell/) (Windows 10+)

### AWS Account Setup
1. Create AWS account at https://aws.amazon.com/
2. Configure AWS CLI: `aws configure`
3. Create IAM user with required permissions
4. Generate SSH key pair for EC2 access

## Step-by-Step Deployment

### 1. Generate SSH Key Pair

Open PowerShell and run:

```powershell
# Generate SSH key pair
ssh-keygen -t rsa -b 4096 -C "your-email@example.com" -f ~/.ssh/mydrreferral_key

# Display public key (copy this for terraform.tfvars)
Get-Content ~/.ssh/mydrreferral_key.pub
```

### 2. Configure Terraform Variables

Edit the `terraform.tfvars` file with your values:

```powershell
# Open terraform.tfvars in notepad
notepad terraform.tfvars
```

Update these values:

```hcl
# AWS Configuration
aws_region = "ap-south-1"
project_name = "mydrreferral"
environment = "production"

# Domain Configuration (optional - you can use CloudFront URL)
domain_name = "mydrreferral.com"

# Database Configuration - CHANGE THIS!
db_password = "YourSecurePassword123!"

# SSH Configuration - PASTE YOUR PUBLIC KEY HERE
ssh_public_key = "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQC... your-public-key"
```

### 3. Initialize Terraform

```powershell
# Navigate to terraform directory
cd infrastructure\terraform

# Initialize Terraform
terraform init
```

### 4. Plan Deployment

```powershell
# Review what will be created
terraform plan
```

### 5. Deploy Infrastructure

```powershell
# Deploy the infrastructure
terraform apply

# Type 'yes' when prompted
```

### 6. Get Deployment Outputs

After deployment, note these outputs:

```powershell
# Get all outputs
terraform output

# Get specific outputs
terraform output frontend_url
terraform output api_url
terraform output database_endpoint
terraform output ec2_public_ip
```

### 7. Configure GitHub Actions

1. Go to your GitHub repository
2. Navigate to Settings > Secrets and variables > Actions
3. Add these secrets:

```
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
EC2_SSH_KEY=content-of-your-private-key-file
DATABASE_CONNECTION_STRING=Host=your-rds-endpoint;Database=mydrreferral;Username=mydrreferral;Password=YourSecurePassword123!
CLOUDFRONT_DISTRIBUTION_ID=your-cloudfront-distribution-id
```

### 8. Update GitHub Actions Workflow

Edit `.github/workflows/deploy.yml` and update these variables:

```yaml
env:
  AWS_REGION: ap-south-1
  S3_BUCKET: your-s3-bucket-name
  EC2_INSTANCE_ID: your-ec2-instance-id
  EC2_USER: ec2-user
  EC2_HOST: your-ec2-public-ip
```

### 9. Test Deployment

```powershell
# Test frontend
Invoke-WebRequest -Uri "https://your-cloudfront-url" -UseBasicParsing

# Test API
Invoke-WebRequest -Uri "http://your-ec2-ip/api/health" -UseBasicParsing
```

## Windows-Specific Commands

### File Operations
```powershell
# Copy files
Copy-Item source.txt destination.txt

# Create directories
New-Item -ItemType Directory -Path "new-folder"

# List files
Get-ChildItem
```

### AWS CLI
```powershell
# Check AWS credentials
aws sts get-caller-identity

# List S3 buckets
aws s3 ls

# Check EC2 instances
aws ec2 describe-instances
```

### Terraform
```powershell
# Initialize
terraform init

# Plan
terraform plan

# Apply
terraform apply

# Destroy (if needed)
terraform destroy
```

## Troubleshooting

### Common Windows Issues

#### 1. PowerShell Execution Policy
```powershell
# If you get execution policy errors
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

#### 2. AWS CLI Not Found
```powershell
# Install AWS CLI
winget install Amazon.AWSCLI
# Or download from: https://aws.amazon.com/cli/
```

#### 3. Terraform Not Found
```powershell
# Install Terraform
winget install HashiCorp.Terraform
# Or download from: https://terraform.io/downloads
```

#### 4. SSH Key Issues
```powershell
# Check SSH key format
Get-Content ~/.ssh/mydrreferral_key.pub

# Test SSH connection (after EC2 is created)
ssh -i ~/.ssh/mydrreferral_key ec2-user@your-ec2-ip
```

### Debug Commands

```powershell
# Check Terraform state
terraform state list

# Check AWS resources
aws ec2 describe-instances --query 'Reservations[*].Instances[*].[InstanceId,State.Name,PublicIpAddress]'

# Check S3 bucket
aws s3 ls s3://your-bucket-name

# Check RDS
aws rds describe-db-instances --query 'DBInstances[*].[DBInstanceIdentifier,DBInstanceStatus,Endpoint.Address]'
```

## Cost Estimation

### Monthly AWS Costs (Estimated)
- **EC2 t3.micro**: ~$8.50
- **RDS db.t3.micro**: ~$15.00
- **S3 + CloudFront**: ~$5.00
- **Data Transfer**: ~$2.00
- **Total**: ~$30.50/month

## Security Notes

1. **Change Default Passwords**: Update database password
2. **SSH Key Security**: Keep private key secure
3. **AWS Permissions**: Use least privilege principle
4. **Regular Updates**: Keep all tools updated

## Next Steps

1. **Domain Setup**: Configure your domain DNS
2. **SSL Certificates**: Set up HTTPS
3. **Monitoring**: Configure CloudWatch alarms
4. **Backups**: Test backup and recovery
5. **Scaling**: Plan for future growth

## Support

- **Documentation**: This repository
- **Issues**: GitHub Issues
- **AWS Support**: AWS Console
- **Terraform Docs**: https://terraform.io/docs
