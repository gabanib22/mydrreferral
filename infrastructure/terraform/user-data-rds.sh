#!/bin/bash

# MyDrReferral API Server Setup Script with RDS
# This script sets up the .NET API on EC2 instance connecting to RDS PostgreSQL

# Update system
yum update -y

# Install .NET 8 Runtime and SDK
echo "Installing .NET 8..."
rpm -Uvh https://packages.microsoft.com/config/centos/7/packages-microsoft-prod.rpm
yum install -y dotnet-runtime-8.0 dotnet-sdk-8.0

# Verify installation
echo "Verifying .NET installation..."
dotnet --version
echo "✅ .NET installation completed"

# Install Nginx
yum install -y nginx

# Install Git
yum install -y git

# Install PostgreSQL client (for testing connection)
yum install -y postgresql15

# Create application directory
mkdir -p /var/www/mydrreferral
cd /var/www/mydrreferral

# Test RDS connection
echo "Testing RDS connection..."
export PGPASSWORD='${db_password}'
if psql -h ${db_host} -U ${db_username} -d ${db_name} -c "SELECT 1;" > /dev/null 2>&1; then
  echo "✅ RDS connection successful"
else
  echo "❌ RDS connection failed"
  echo "Please check:"
  echo "1. RDS instance is running"
  echo "2. Security groups allow port 5432"
  echo "3. Database credentials are correct"
fi

# Create a startup script
cat > /var/www/mydrreferral/start-api.sh << 'EOF'
#!/bin/bash
echo "Starting MyDrReferral API..."
echo "Current directory: $(pwd)"

# Find .NET installation
DOTNET_CMD=""
if command -v dotnet &> /dev/null; then
  DOTNET_CMD="dotnet"
  echo "✅ .NET found in PATH"
elif [ -f "/usr/bin/dotnet" ]; then
  DOTNET_CMD="/usr/bin/dotnet"
  echo "✅ .NET found at /usr/bin/dotnet"
else
  echo "❌ .NET not found!"
  exit 1
fi

# Verify .NET is working
echo "Testing .NET installation..."
$DOTNET_CMD --version

# Find the correct API directory
API_DIR=$(find /var/www/mydrreferral/Api/ -name "MyDrReferral.Api*" -type d | head -1)
echo "Found API directory: $API_DIR"

if [ -z "$API_DIR" ]; then
  echo "❌ MyDrReferral.Api directory not found!"
  echo "Available directories:"
  find /var/www/mydrreferral/Api/ -type d
  exit 1
fi

cd "$API_DIR"
echo "Changed to: $(pwd)"
echo "Files in API directory:"
ls -la

# Set environment variables
export ASPNETCORE_ENVIRONMENT=Production
export ASPNETCORE_URLS=http://+:80
export ConnectionStrings__DefaultConnection="Host=${db_host};Database=${db_name};Username=${db_username};Password=${db_password};Port=5432"

# Start the API
echo "Starting API with: $DOTNET_CMD MyDrReferral.Api.dll"
$DOTNET_CMD MyDrReferral.Api.dll
EOF

chmod +x /var/www/mydrreferral/start-api.sh

# Configure Nginx
cat > /etc/nginx/conf.d/mydrreferral.conf << 'EOF'
server {
    listen 80;
    server_name _;

    location /api/ {
        proxy_pass http://localhost:80;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection keep-alive;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location / {
        return 404;
    }
}
EOF

# Start and enable Nginx
systemctl start nginx
systemctl enable nginx

# Create systemd service for the API
cat > /etc/systemd/system/mydrreferral-api.service << 'EOF'
[Unit]
Description=MyDrReferral API
After=network.target

[Service]
Type=simple
User=ec2-user
WorkingDirectory=/var/www/mydrreferral
ExecStart=/var/www/mydrreferral/start-api.sh
Restart=always
RestartSec=10
Environment=ASPNETCORE_ENVIRONMENT=Production

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd and enable service
systemctl daemon-reload
systemctl enable mydrreferral-api.service

# Create a simple health check endpoint
cat > /var/www/mydrreferral/health-check.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>MyDrReferral API Health Check</title>
</head>
<body>
    <h1>MyDrReferral API is running!</h1>
    <p>Status: Healthy</p>
    <p>Database: RDS PostgreSQL</p>
    <p>Timestamp: $(date)</p>
</body>
</html>
EOF

# Set up log rotation
cat > /etc/logrotate.d/mydrreferral << 'EOF'
/var/www/mydrreferral/logs/*.log {
    daily
    missingok
    rotate 7
    compress
    delaycompress
    notifempty
    create 644 ec2-user ec2-user
}
EOF

# Create logs directory
mkdir -p /var/www/mydrreferral/logs
chown -R ec2-user:ec2-user /var/www/mydrreferral

# Install CloudWatch agent for monitoring
yum install -y amazon-cloudwatch-agent

# Create CloudWatch agent configuration
cat > /opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json << 'EOF'
{
    "logs": {
        "logs_collected": {
            "files": {
                "collect_list": [
                    {
                        "file_path": "/var/www/mydrreferral/logs/*.log",
                        "log_group_name": "/aws/ec2/mydrreferral/api",
                        "log_stream_name": "{instance_id}"
                    }
                ]
            }
        }
    },
    "metrics": {
        "namespace": "MyDrReferral/API",
        "metrics_collected": {
            "cpu": {
                "measurement": ["cpu_usage_idle", "cpu_usage_iowait", "cpu_usage_user", "cpu_usage_system"],
                "metrics_collection_interval": 60
            },
            "disk": {
                "measurement": ["used_percent"],
                "metrics_collection_interval": 60,
                "resources": ["*"]
            },
            "mem": {
                "measurement": ["mem_used_percent"],
                "metrics_collection_interval": 60
            }
        }
    }
}
EOF

# Start CloudWatch agent
/opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
    -a fetch-config \
    -m ec2 \
    -c file:/opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json \
    -s

echo "MyDrReferral API setup completed!"
echo "Database: RDS PostgreSQL"
echo "Database endpoint: ${db_host}"
echo "Database name: ${db_name}"
echo "Database username: ${db_username}"
