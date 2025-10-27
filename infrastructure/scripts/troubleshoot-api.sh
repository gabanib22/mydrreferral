#!/bin/bash

# MyDrReferral API Troubleshooting Script
# This script helps diagnose and fix API deployment issues

echo "🔍 MyDrReferral API Troubleshooting Script"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    local status=$1
    local message=$2
    if [ "$status" = "OK" ]; then
        echo -e "${GREEN}✅ $message${NC}"
    elif [ "$status" = "WARN" ]; then
        echo -e "${YELLOW}⚠️  $message${NC}"
    elif [ "$status" = "ERROR" ]; then
        echo -e "${RED}❌ $message${NC}"
    else
        echo -e "${BLUE}ℹ️  $message${NC}"
    fi
}

echo ""
print_status "INFO" "Starting comprehensive API diagnostics..."

# 1. Check if EC2 instance is running
echo ""
print_status "INFO" "1. Checking EC2 instance status..."
if ping -c 1 52.66.197.58 > /dev/null 2>&1; then
    print_status "OK" "EC2 instance is reachable"
else
    print_status "ERROR" "EC2 instance is not reachable"
    exit 1
fi

# 2. Check if SSH is working
echo ""
print_status "INFO" "2. Testing SSH connectivity..."
if ssh -o ConnectTimeout=10 -o BatchMode=yes ec2-user@52.66.197.58 "echo 'SSH OK'" > /dev/null 2>&1; then
    print_status "OK" "SSH connection successful"
else
    print_status "ERROR" "SSH connection failed"
    print_status "INFO" "Please check your SSH key and EC2 security group"
    exit 1
fi

# 3. Check system services
echo ""
print_status "INFO" "3. Checking system services on EC2..."

ssh ec2-user@52.66.197.58 << 'EOF'
echo "🔍 Checking system services..."

# Check if .NET is installed
echo "Checking .NET installation..."
if command -v dotnet &> /dev/null; then
    echo "✅ .NET found: $(dotnet --version)"
else
    echo "❌ .NET not found"
fi

# Check if PostgreSQL is running
echo "Checking PostgreSQL status..."
if sudo systemctl is-active --quiet postgresql; then
    echo "✅ PostgreSQL is running"
else
    echo "❌ PostgreSQL is not running"
    echo "Starting PostgreSQL..."
    sudo systemctl start postgresql
    sudo systemctl enable postgresql
fi

# Check if Nginx is running
echo "Checking Nginx status..."
if sudo systemctl is-active --quiet nginx; then
    echo "✅ Nginx is running"
else
    echo "❌ Nginx is not running"
    echo "Starting Nginx..."
    sudo systemctl start nginx
    sudo systemctl enable nginx
fi

# Check if API service is running
echo "Checking API service status..."
if sudo systemctl is-active --quiet mydrreferral-api.service; then
    echo "✅ API service is running"
else
    echo "❌ API service is not running"
    echo "Checking service status..."
    sudo systemctl status mydrreferral-api.service
fi

# Check what's listening on port 80
echo "Checking what's listening on port 80..."
sudo netstat -tlnp | grep :80 || echo "Nothing listening on port 80"

# Check API directory
echo "Checking API directory..."
if [ -d "/var/www/mydrreferral/Api" ]; then
    echo "✅ API directory exists"
    ls -la /var/www/mydrreferral/Api/
else
    echo "❌ API directory not found"
fi

# Check startup script
echo "Checking startup script..."
if [ -f "/var/www/mydrreferral/start-api.sh" ]; then
    echo "✅ Startup script exists"
    echo "Script permissions:"
    ls -la /var/www/mydrreferral/start-api.sh
else
    echo "❌ Startup script not found"
fi

# Check API logs
echo "Checking API service logs..."
sudo journalctl -u mydrreferral-api.service --no-pager -n 20

EOF

echo ""
print_status "INFO" "4. Attempting to fix common issues..."

# Fix common issues
ssh ec2-user@52.66.197.58 << 'EOF'
echo "🔧 Attempting to fix common issues..."

# Ensure proper permissions
echo "Setting proper permissions..."
sudo chown -R ec2-user:ec2-user /var/www/mydrreferral
sudo chmod +x /var/www/mydrreferral/start-api.sh

# Restart services
echo "Restarting services..."
sudo systemctl restart postgresql
sudo systemctl restart nginx
sudo systemctl restart mydrreferral-api.service

# Check service status
echo "Checking service status after restart..."
sudo systemctl status mydrreferral-api.service --no-pager

# Test API startup script manually
echo "Testing API startup script..."
cd /var/www/mydrreferral
if [ -f "start-api.sh" ]; then
    echo "Running startup script manually..."
    timeout 10 ./start-api.sh || echo "Startup script timed out or failed"
fi

EOF

echo ""
print_status "INFO" "5. Testing API connectivity..."

# Test API connectivity
for i in {1..5}; do
    echo "Attempt $i: Testing API health..."
    if curl -f -m 10 http://52.66.197.58/api/health 2>/dev/null; then
        print_status "OK" "API is healthy!"
        exit 0
    else
        echo "API not responding, waiting 5 seconds..."
        sleep 5
    fi
done

print_status "ERROR" "API health check failed after all attempts"
print_status "INFO" "Please check the logs above for specific error messages"

echo ""
print_status "INFO" "Troubleshooting completed. Check the output above for issues."
