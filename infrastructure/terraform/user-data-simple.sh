#!/bin/bash

# Simple MyDrReferral API Setup Script
echo "Starting MyDrReferral API setup..."

# Update system
yum update -y

# Install .NET 8 Runtime
echo "Installing .NET 8..."
rpm -Uvh https://packages.microsoft.com/config/centos/7/packages-microsoft-prod.rpm
yum install -y dotnet-runtime-8.0

# Install Nginx
echo "Installing Nginx..."
yum install -y nginx

# Create application directory
mkdir -p /var/www/mydrreferral
cd /var/www/mydrreferral

# Create a simple startup script
cat > /var/www/mydrreferral/start-api.sh << 'EOF'
#!/bin/bash
echo "Starting API..."

# Find .NET installation
DOTNET_CMD=""
if command -v dotnet &> /dev/null; then
  DOTNET_CMD="dotnet"
elif [ -f "/usr/bin/dotnet" ]; then
  DOTNET_CMD="/usr/bin/dotnet"
elif [ -f "/root/.dotnet/dotnet" ]; then
  DOTNET_CMD="/root/.dotnet/dotnet"
else
  echo "❌ .NET not found!"
  exit 1
fi

echo "Using .NET: $DOTNET_CMD"

# Set environment variables
export ASPNETCORE_ENVIRONMENT=Production
export ASPNETCORE_URLS=http://+:5000

# Create a simple API directory structure
mkdir -p /var/www/mydrreferral/Api/MyDrReferral.Api
cd /var/www/mydrreferral/Api/MyDrReferral.Api

# Create a simple Program.cs for testing
cat > Program.cs << 'PROGRAM_EOF'
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

// Add health check endpoint
app.MapGet("/api/health", () => new { status = "healthy", timestamp = DateTime.UtcNow });

app.Run();
PROGRAM_EOF

# Create a simple project file
cat > MyDrReferral.Api.csproj << 'PROJECT_EOF'
<Project Sdk="Microsoft.NET.Sdk.Web">

  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
  </PropertyGroup>

</Project>
PROJECT_EOF

# Create a simple controller
mkdir -p Controllers
cat > Controllers/HealthController.cs << 'CONTROLLER_EOF'
using Microsoft.AspNetCore.Mvc;

namespace MyDrReferral.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HealthController : ControllerBase
{
    [HttpGet]
    public IActionResult Get()
    {
        return Ok(new { status = "healthy", timestamp = DateTime.UtcNow });
    }
}
CONTROLLER_EOF

echo "Starting API with: $DOTNET_CMD run"
$DOTNET_CMD run
EOF

chmod +x /var/www/mydrreferral/start-api.sh

# Configure Nginx
echo "Configuring Nginx..."
cat > /etc/nginx/conf.d/mydrreferral.conf << 'EOF'
server {
    listen 80;
    server_name _;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
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
User=root
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
systemctl start mydrreferral-api.service

echo "MyDrReferral API setup completed!"
echo "Nginx status:"
systemctl status nginx
echo "API service status:"
systemctl status mydrreferral-api.service