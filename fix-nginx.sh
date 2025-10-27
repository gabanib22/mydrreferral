#!/bin/bash

echo "Installing and configuring Nginx..."

# Install Nginx
sudo yum install -y nginx

# Enable and start Nginx
sudo systemctl enable nginx
sudo systemctl start nginx

echo "Creating Nginx configuration for API proxy..."

# Create Nginx configuration
sudo tee /etc/nginx/conf.d/mydrreferral.conf > /dev/null << 'EOF'
server {
    listen 80;
    server_name _;
    
    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Test Nginx configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx

echo "Nginx configuration completed!"

# Show status
sudo systemctl status nginx
sudo systemctl status mydrreferral-api.service
