# MyDrReferral Deployment Troubleshooting Guide

This guide helps resolve common deployment issues, particularly the .NET installation problems you're experiencing.

## Current Issue Analysis

Based on the error output, the main issues are:

1. **❌ .NET installation failed!** - The .NET 8 installation is not working properly
2. **Process exited with status 1** - The deployment script is failing

## Root Causes

### 1. .NET Installation Issues
- The Microsoft repository installation is failing
- The dotnet-install.sh script is not executing properly
- PATH environment variables are not being set correctly

### 2. Deployment Script Issues
- The startup script is looking for .NET in the wrong location
- Environment variables are not properly configured
- File permissions may be incorrect

## Solutions Implemented

### 1. Updated GitHub Actions Workflow (`.github/workflows/deploy.yml`)

**Fixed .NET Installation Process:**
```bash
# Install .NET 8 using Microsoft's official repository
sudo rpm -Uvh https://packages.microsoft.com/config/centos/7/packages-microsoft-prod.rpm
sudo yum install -y dotnet-runtime-8.0

# Fallback to installation script if repository method fails
curl -sSL https://dot.net/v1/dotnet-install.sh | bash /dev/stdin --channel 8.0
```

**Improved Startup Script:**
- Dynamic .NET path detection
- Better error handling
- Comprehensive logging

### 2. Updated EC2 User Data Script (`infrastructure/terraform/user-data-simple.sh`)

**Enhanced .NET Installation:**
```bash
# Install both runtime and SDK
rpm -Uvh https://packages.microsoft.com/config/centos/7/packages-microsoft-prod.rpm
yum install -y dotnet-runtime-8.0 dotnet-sdk-8.0

# Verify installation
dotnet --version
```

**Robust Startup Script:**
- Multiple .NET path detection methods
- Better error messages
- Proper environment variable setup

## Testing the Fix

### 1. Test Deployment Process Locally

**On Windows:**
```powershell
.\infrastructure\scripts\test-deployment.ps1
```

**On Linux/Mac:**
```bash
./infrastructure/scripts/test-deployment.sh
```

### 2. Manual EC2 Testing

If you have access to the EC2 instance, you can test manually:

```bash
# SSH into EC2
ssh ec2-user@your-ec2-ip

# Check .NET installation
which dotnet
dotnet --version

# If .NET is not found, install it
sudo rpm -Uvh https://packages.microsoft.com/config/centos/7/packages-microsoft-prod.rpm
sudo yum install -y dotnet-runtime-8.0

# Test the startup script
sudo systemctl status mydrreferral-api.service
sudo journalctl -u mydrreferral-api.service -f
```

## Alternative Solutions

### Option 1: Use Docker (Recommended)

Instead of installing .NET directly on EC2, use Docker:

```dockerfile
# Dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:8.0
COPY . /app
WORKDIR /app
EXPOSE 80
ENTRYPOINT ["dotnet", "MyDrReferral.Api.dll"]
```

### Option 2: Use AWS Lambda

Deploy the API as a serverless function:

```yaml
# serverless.yml
service: mydrreferral-api
provider:
  name: aws
  runtime: dotnet8
  region: ap-south-1
```

### Option 3: Use AWS App Runner

Deploy as a containerized service:

```yaml
# apprunner.yaml
version: 1.0
runtime: dotnet8
build:
  commands:
    build:
      - echo "Building the application"
      - dotnet publish -c Release -o out
run:
  runtime-version: 8.0
  command: dotnet out/MyDrReferral.Api.dll
  network:
    port: 80
    env: PORT
```

## Monitoring and Debugging

### 1. Check EC2 Logs

```bash
# System logs
sudo journalctl -u mydrreferral-api.service -f

# Application logs
tail -f /var/www/mydrreferral/logs/*.log

# CloudWatch logs
aws logs describe-log-groups --log-group-name-prefix "/aws/ec2/mydrreferral"
```

### 2. Health Checks

```bash
# API health check
curl -f http://your-ec2-ip/api/health

# Database connectivity
psql -h localhost -U mydrreferral -d mydrreferral -c "SELECT 1;"
```

### 3. Service Status

```bash
# Check service status
sudo systemctl status mydrreferral-api.service

# Restart service
sudo systemctl restart mydrreferral-api.service

# Check nginx
sudo systemctl status nginx
```

## Prevention Measures

### 1. Infrastructure as Code
- Use Terraform for consistent infrastructure
- Version control all configuration files
- Test infrastructure changes in staging

### 2. CI/CD Pipeline
- Automated testing before deployment
- Rollback capabilities
- Health checks after deployment

### 3. Monitoring
- Set up CloudWatch alarms
- Monitor application performance
- Track deployment success rates

## Next Steps

1. **Deploy the updated configuration** - The fixes are now in place
2. **Test the deployment** - Run the test scripts to verify
3. **Monitor the deployment** - Watch the logs during deployment
4. **Set up monitoring** - Configure CloudWatch alarms
5. **Document the process** - Update deployment documentation

## Emergency Rollback

If the deployment fails:

```bash
# Restore from backup
sudo cp -r /var/www/mydrreferral/Api.backup.* /var/www/mydrreferral/Api

# Restart service
sudo systemctl restart mydrreferral-api.service

# Check status
sudo systemctl status mydrreferral-api.service
```

## Support

If you continue to experience issues:

1. Check the GitHub Actions logs
2. Review EC2 system logs
3. Test the deployment process locally
4. Consider using Docker or serverless alternatives

The fixes implemented should resolve the .NET installation issues and make the deployment more robust.
