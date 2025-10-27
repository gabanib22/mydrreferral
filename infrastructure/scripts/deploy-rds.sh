#!/bin/bash

# MyDrReferral RDS Deployment Script
# This script deploys the application to AWS with RDS PostgreSQL

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="mydrreferral"
AWS_REGION="ap-south-1"
ENVIRONMENT="production"

echo -e "${BLUE}🚀 Starting MyDrReferral RDS deployment...${NC}"

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI is not installed. Please install it first.${NC}"
    exit 1
fi

# Check if Terraform is installed
if ! command -v terraform &> /dev/null; then
    echo -e "${RED}❌ Terraform is not installed. Please install it first.${NC}"
    exit 1
fi

# Check AWS credentials
echo -e "${YELLOW}🔐 Checking AWS credentials...${NC}"
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}❌ AWS credentials not configured. Please run 'aws configure'${NC}"
    exit 1
fi

echo -e "${GREEN}✅ AWS credentials configured${NC}"

# Navigate to terraform directory
cd infrastructure/terraform

# Check if terraform.tfvars exists
if [ ! -f "terraform.tfvars" ]; then
    echo -e "${RED}❌ terraform.tfvars not found!${NC}"
    echo -e "${YELLOW}Please create terraform.tfvars with your configuration:${NC}"
    echo ""
    echo "aws_region = \"ap-south-1\""
    echo "project_name = \"mydrreferral\""
    echo "environment = \"production\""
    echo "domain_name = \"mydrreferral.com\""
    echo "db_password = \"YourSecurePassword123!\""
    echo "ssh_public_key = \"your-ssh-public-key\""
    echo ""
    exit 1
fi

# Initialize Terraform
echo -e "${YELLOW}🔧 Initializing Terraform...${NC}"
terraform init

# Plan deployment
echo -e "${YELLOW}📋 Planning RDS deployment...${NC}"
terraform plan -var-file="terraform.tfvars"

# Ask for confirmation
echo -e "${YELLOW}⚠️  This will create:${NC}"
echo -e "  • VPC with public and private subnets"
echo -e "  • RDS PostgreSQL instance (db.t3.micro)"
echo -e "  • EC2 instance for API"
echo -e "  • S3 bucket for frontend"
echo -e "  • Security groups and networking"
echo ""
echo -e "${YELLOW}💰 Estimated monthly cost: ~$25-35${NC}"
echo ""

read -p "Do you want to proceed with the RDS deployment? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Deployment cancelled.${NC}"
    exit 1
fi

# Apply deployment
echo -e "${YELLOW}🚀 Deploying RDS infrastructure...${NC}"
terraform apply -var-file="terraform.tfvars" -auto-approve

# Get outputs
echo -e "${YELLOW}📊 Getting deployment outputs...${NC}"
FRONTEND_URL=$(terraform output -raw frontend_url)
API_URL=$(terraform output -raw api_url)
DATABASE_ENDPOINT=$(terraform output -raw database_endpoint)
EC2_PUBLIC_IP=$(terraform output -raw ec2_public_ip)
DATABASE_PORT=$(terraform output -raw database_port)
DATABASE_NAME=$(terraform output -raw database_name)
DATABASE_USERNAME=$(terraform output -raw database_username)

echo -e "${GREEN}✅ RDS Infrastructure deployed successfully!${NC}"
echo -e "${BLUE}📋 Deployment Summary:${NC}"
echo -e "  Frontend URL: ${FRONTEND_URL}"
echo -e "  API URL: ${API_URL}"
echo -e "  Database Endpoint: ${DATABASE_ENDPOINT}"
echo -e "  Database Port: ${DATABASE_PORT}"
echo -e "  Database Name: ${DATABASE_NAME}"
echo -e "  Database Username: ${DATABASE_USERNAME}"
echo -e "  EC2 Public IP: ${EC2_PUBLIC_IP}"

# Save outputs to file
cat > ../../deployment-outputs-rds.txt << EOF
FRONTEND_URL=${FRONTEND_URL}
API_URL=${API_URL}
DATABASE_ENDPOINT=${DATABASE_ENDPOINT}
DATABASE_PORT=${DATABASE_PORT}
DATABASE_NAME=${DATABASE_NAME}
DATABASE_USERNAME=${DATABASE_USERNAME}
EC2_PUBLIC_IP=${EC2_PUBLIC_IP}
EOF

echo -e "${GREEN}✅ Deployment outputs saved to deployment-outputs-rds.txt${NC}"

# Generate connection string
DB_PASSWORD=$(grep "db_password" terraform.tfvars | cut -d'"' -f2)
CONNECTION_STRING="Host=${DATABASE_ENDPOINT};Database=${DATABASE_NAME};Username=${DATABASE_USERNAME};Password=${DB_PASSWORD};Port=${DATABASE_PORT}"

echo -e "${BLUE}📝 Next Steps:${NC}"
echo -e "1. Update GitHub Secrets with the following values:"
echo -e "   - AWS_ACCESS_KEY_ID: Your AWS access key"
echo -e "   - AWS_SECRET_ACCESS_KEY: Your AWS secret key"
echo -e "   - EC2_SSH_KEY: Your EC2 SSH private key"
echo -e "   - DATABASE_CONNECTION_STRING: ${CONNECTION_STRING}"
echo -e "   - EC2_HOST: ${EC2_PUBLIC_IP}"
echo -e "   - S3_BUCKET_NAME: $(terraform output -raw s3_bucket_name)"
echo -e ""
echo -e "2. Configure your domain DNS to point to:"
echo -e "   - Frontend: ${FRONTEND_URL}"
echo -e "   - API: ${API_URL}"
echo -e ""
echo -e "3. Test the deployment:"
echo -e "   - Frontend: ${FRONTEND_URL}"
echo -e "   - API Health: ${API_URL}/api/health"
echo -e "   - Database: ${DATABASE_ENDPOINT}:${DATABASE_PORT}"

echo -e "${GREEN}🎉 RDS deployment completed successfully!${NC}"
echo -e "${YELLOW}💡 Your database is now managed by AWS RDS with:${NC}"
echo -e "  • Automated backups"
echo -e "  • High availability"
echo -e "  • Monitoring and alerts"
echo -e "  • Security and encryption"
