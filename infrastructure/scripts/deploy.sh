#!/bin/bash

# MyDrReferral Deployment Script
# This script deploys the application to AWS

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

echo -e "${BLUE}🚀 Starting MyDrReferral deployment...${NC}"

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

# Initialize Terraform
echo -e "${YELLOW}🔧 Initializing Terraform...${NC}"
terraform init

# Plan deployment
echo -e "${YELLOW}📋 Planning deployment...${NC}"
terraform plan -var="aws_region=${AWS_REGION}" -var="project_name=${PROJECT_NAME}" -var="environment=${ENVIRONMENT}"

# Ask for confirmation
read -p "Do you want to proceed with the deployment? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Deployment cancelled.${NC}"
    exit 1
fi

# Apply deployment
echo -e "${YELLOW}🚀 Deploying infrastructure...${NC}"
terraform apply -var="aws_region=${AWS_REGION}" -var="project_name=${PROJECT_NAME}" -var="environment=${ENVIRONMENT}" -auto-approve

# Get outputs
echo -e "${YELLOW}📊 Getting deployment outputs...${NC}"
FRONTEND_URL=$(terraform output -raw frontend_url)
API_URL=$(terraform output -raw api_url)
DATABASE_ENDPOINT=$(terraform output -raw database_endpoint)
EC2_PUBLIC_IP=$(terraform output -raw ec2_public_ip)

echo -e "${GREEN}✅ Infrastructure deployed successfully!${NC}"
echo -e "${BLUE}📋 Deployment Summary:${NC}"
echo -e "  Frontend URL: ${FRONTEND_URL}"
echo -e "  API URL: ${API_URL}"
echo -e "  Database Endpoint: ${DATABASE_ENDPOINT}"
echo -e "  EC2 Public IP: ${EC2_PUBLIC_IP}"

# Save outputs to file
cat > ../../deployment-outputs.txt << EOF
FRONTEND_URL=${FRONTEND_URL}
API_URL=${API_URL}
DATABASE_ENDPOINT=${DATABASE_ENDPOINT}
EC2_PUBLIC_IP=${EC2_PUBLIC_IP}
EOF

echo -e "${GREEN}✅ Deployment outputs saved to deployment-outputs.txt${NC}"

# Next steps
echo -e "${BLUE}📝 Next Steps:${NC}"
echo -e "1. Update GitHub Secrets with the following values:"
echo -e "   - AWS_ACCESS_KEY_ID: Your AWS access key"
echo -e "   - AWS_SECRET_ACCESS_KEY: Your AWS secret key"
echo -e "   - EC2_SSH_KEY: Your EC2 SSH private key"
echo -e "   - DATABASE_CONNECTION_STRING: Host=${DATABASE_ENDPOINT};Database=mydrreferral;Username=mydrreferral;Password=YOUR_PASSWORD"
echo -e "   - CLOUDFRONT_DISTRIBUTION_ID: Get from AWS Console"
echo -e ""
echo -e "2. Update the GitHub Actions workflow with:"
echo -e "   - EC2_INSTANCE_ID: Get from AWS Console"
echo -e "   - EC2_HOST: ${EC2_PUBLIC_IP}"
echo -e "   - S3_BUCKET: Get from AWS Console"
echo -e ""
echo -e "3. Configure your domain DNS to point to:"
echo -e "   - Frontend: ${FRONTEND_URL}"
echo -e "   - API: ${API_URL}"

echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
