#!/bin/bash

echo "🔍 Debugging EC2 connectivity issues..."

# Check if instance is accessible
echo "Testing basic connectivity..."
ping -c 3 43.205.146.64 || echo "Ping failed"

# Check if there's a firewall blocking traffic
echo "Checking firewall status..."
sudo systemctl status firewalld || echo "Firewalld not running"
sudo iptables -L || echo "iptables not available"

# Check if services are running
echo "Checking service status..."
sudo systemctl status mydrreferral-api.service
sudo systemctl status nginx || echo "Nginx not installed"

# Check what's listening on port 80
echo "Checking what's listening on port 80..."
sudo netstat -tlnp | grep :80 || echo "Nothing listening on port 80"

# Check what's listening on port 5000
echo "Checking what's listening on port 5000..."
sudo netstat -tlnp | grep :5000 || echo "Nothing listening on port 5000"

# Check if there are any processes running
echo "Checking running processes..."
ps aux | grep dotnet || echo "No dotnet processes"
ps aux | grep nginx || echo "No nginx processes"

echo "Debugging completed."
