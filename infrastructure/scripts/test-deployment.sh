#!/bin/bash

# MyDrReferral Deployment Test Script
# This script tests the deployment process locally

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧪 Testing MyDrReferral deployment process...${NC}"

# Check if we're in the right directory
if [ ! -f "Api/MyDrReferral.Api/MyDrReferral.Api.csproj" ]; then
    echo -e "${RED}❌ Please run this script from the project root directory${NC}"
    exit 1
fi

# Test .NET build
echo -e "${YELLOW}🔧 Testing .NET build...${NC}"
cd Api
if dotnet build MyDrReferral.Api/MyDrReferral.Api.csproj --configuration Release; then
    echo -e "${GREEN}✅ .NET build successful${NC}"
else
    echo -e "${RED}❌ .NET build failed${NC}"
    exit 1
fi

# Test .NET publish
echo -e "${YELLOW}📦 Testing .NET publish...${NC}"
if dotnet publish MyDrReferral.Api/MyDrReferral.Api.csproj \
    --configuration Release \
    --output ./publish \
    --no-restore; then
    echo -e "${GREEN}✅ .NET publish successful${NC}"
else
    echo -e "${RED}❌ .NET publish failed${NC}"
    exit 1
fi

# Test deployment package creation
echo -e "${YELLOW}📁 Testing deployment package creation...${NC}"
if tar -czf mydrreferral-api.tar.gz -C publish .; then
    echo -e "${GREEN}✅ Deployment package created successfully${NC}"
    echo -e "Package size: $(du -h mydrreferral-api.tar.gz)"
else
    echo -e "${RED}❌ Deployment package creation failed${NC}"
    exit 1
fi

# Test package extraction
echo -e "${YELLOW}📂 Testing package extraction...${NC}"
mkdir -p test-extract
cd test-extract
if tar -xzf ../mydrreferral-api.tar.gz; then
    echo -e "${GREEN}✅ Package extraction successful${NC}"
    echo -e "Extracted files:"
    ls -la
else
    echo -e "${RED}❌ Package extraction failed${NC}"
    exit 1
fi

# Check for required files
echo -e "${YELLOW}🔍 Checking for required files...${NC}"
if [ -f "MyDrReferral.Api.dll" ]; then
    echo -e "${GREEN}✅ MyDrReferral.Api.dll found${NC}"
else
    echo -e "${RED}❌ MyDrReferral.Api.dll not found${NC}"
    exit 1
fi

# Cleanup
echo -e "${YELLOW}🧹 Cleaning up test files...${NC}"
cd ..
rm -rf test-extract
rm -f mydrreferral-api.tar.gz
rm -rf publish

echo -e "${GREEN}🎉 All deployment tests passed!${NC}"
echo -e "${BLUE}📋 Test Summary:${NC}"
echo -e "  ✅ .NET build"
echo -e "  ✅ .NET publish"
echo -e "  ✅ Package creation"
echo -e "  ✅ Package extraction"
echo -e "  ✅ Required files present"
echo -e ""
echo -e "${GREEN}The deployment process is ready for production!${NC}"
