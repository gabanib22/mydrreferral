#!/bin/bash

# MyDrReferral API Server Setup Script
# This script sets up the .NET API on EC2 instance

# Update system
yum update -y

# Install .NET 8 Runtime (not SDK)
rpm -Uvh https://packages.microsoft.com/config/centos/7/packages-microsoft-prod.rpm
yum install -y dotnet-runtime-8.0

# Also install the SDK for development tools
yum install -y dotnet-sdk-8.0

# Verify installation
dotnet --version
echo "✅ .NET installation completed"

# Install Nginx
yum install -y nginx

# Install Git
yum install -y git

# Install PostgreSQL client
yum install -y postgresql15

# Create application directory
mkdir -p /var/www/mydrreferral
cd /var/www/mydrreferral

# Clone the repository (you'll need to configure GitHub access)
# For now, we'll create a placeholder
mkdir -p Api
cd Api

# Create a simple startup script
cat > /var/www/mydrreferral/start-api.sh << 'EOF'
#!/bin/bash
cd /var/www/mydrreferral/Api/MyDrReferral.Api

# Set environment variables
export ASPNETCORE_ENVIRONMENT=Production
export ASPNETCORE_URLS=http://+:80
export ConnectionStrings__DefaultConnection="Host=${db_host};Database=${db_name};Username=${db_username};Password=${db_password}"

# Start the API
dotnet run --project MyDrReferral.Api.csproj
EOF

chmod +x /var/www/mydrreferral/start-api.sh

# Configure Nginx
cat > /etc/nginx/conf.d/mydrreferral.conf << 'EOF'
server {
    listen 80;
    server_name _;

    location /api/ {
        proxy_pass http://localhost:5000;
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
echo "Database endpoint: ${db_host}"
echo "Database name: ${db_name}"
echo "Database username: ${db_username}"
