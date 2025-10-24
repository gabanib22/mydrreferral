#!/bin/bash

# PostgreSQL Database Setup Script for MyDrReferral
# Run this script with appropriate permissions

echo "Setting up PostgreSQL database for MyDrReferral..."

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "PostgreSQL not found. Please install PostgreSQL first."
    echo "Ubuntu/Debian: sudo apt-get install postgresql postgresql-contrib"
    echo "CentOS/RHEL: sudo yum install postgresql postgresql-server"
    echo "macOS: brew install postgresql"
    exit 1
fi

# Check if PostgreSQL service is running
if ! pg_isready -q; then
    echo "PostgreSQL service is not running. Please start it first."
    echo "Ubuntu/Debian: sudo systemctl start postgresql"
    echo "CentOS/RHEL: sudo systemctl start postgresql"
    echo "macOS: brew services start postgresql"
    exit 1
fi

echo "PostgreSQL is running ✓"

# Database configuration
PROD_DB="MyDrReferralDB"
DEV_DB="MyDrReferralDB_Dev"
USERNAME="postgres"

echo "Creating databases..."

# Create production database
createdb -U $USERNAME "$PROD_DB" 2>/dev/null && echo "✓ Production database '$PROD_DB' created" || echo "⚠ Production database might already exist"

# Create development database
createdb -U $USERNAME "$DEV_DB" 2>/dev/null && echo "✓ Development database '$DEV_DB' created" || echo "⚠ Development database might already exist"

echo ""
echo "Applying Entity Framework migrations..."

# Navigate to Data project and apply migrations
cd MyDrReferral.Data

if dotnet ef database update --startup-project ../MyDrReferral.Api; then
    echo "✓ Database migrations applied successfully"
else
    echo "✗ Failed to apply migrations. Please check the error above."
    exit 1
fi

echo ""
echo "Database setup completed successfully!"
echo "You can now run the application with: dotnet run --project MyDrReferral.Api"
