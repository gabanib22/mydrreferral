# MyDrReferral AWS Deployment Guide

This guide covers deploying the MyDrReferral application to AWS using Terraform and GitHub Actions.

## Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   CloudFront    │    │   Application   │    │   RDS           │
│   (Frontend)    │    │   Load Balancer │    │   PostgreSQL    │
│                 │    │                 │    │                 │
│   S3 Bucket     │    │   EC2 Instance  │    │   Database      │
│   (React App)   │    │   (.NET API)    │    │   (Production) │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Prerequisites

### Required Tools
- [AWS CLI](https://aws.amazon.com/cli/) v2.0+
- [Terraform](https://terraform.io/) v1.0+
- [Node.js](https://nodejs.org/) v18+
- [.NET SDK](https://dotnet.microsoft.com/) v8.0+
- [Git](https://git-scm.com/)

### AWS Account Setup
1. Create AWS account
2. Configure AWS CLI: `aws configure`
3. Create IAM user with required permissions
4. Generate SSH key pair for EC2 access

## Quick Start

### 1. Clone and Setup
```bash
git clone https://github.com/your-username/mydrreferral.git
cd mydrreferral
```

### 2. Configure Terraform
```bash
cd infrastructure/terraform
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your values
```

### 3. Deploy Infrastructure
```bash
# Make deployment script executable
chmod +x ../scripts/deploy.sh

# Run deployment
../scripts/deploy.sh
```

### 4. Configure GitHub Actions
1. Go to GitHub repository settings
2. Navigate to Secrets and variables > Actions
3. Add all required secrets (see `GITHUB_SECRETS.md`)
4. Update workflow variables in `.github/workflows/deploy.yml`

### 5. Test Deployment
```bash
# Check frontend
curl https://your-cloudfront-url

# Check API
curl http://your-ec2-ip/api/health

# Check database
psql -h your-rds-endpoint -U mydrreferral -d mydrreferral
```

## Detailed Setup

### Infrastructure Components

#### 1. S3 + CloudFront (Frontend)
- **S3 Bucket**: Static website hosting
- **CloudFront**: CDN with custom domain
- **Features**: HTTPS, caching, compression

#### 2. EC2 + ALB (API)
- **EC2 Instance**: .NET API server
- **Application Load Balancer**: Traffic distribution
- **Auto Scaling**: Future enhancement
- **Features**: Health checks, SSL termination

#### 3. RDS PostgreSQL (Database)
- **RDS Instance**: Managed PostgreSQL
- **Multi-AZ**: High availability
- **Backups**: Automated daily backups
- **Features**: Encryption, monitoring

### Security Configuration

#### Network Security
- VPC with public/private subnets
- Security groups with minimal access
- NAT Gateway for private subnet access
- WAF for application protection

#### Data Security
- Database encryption at rest
- SSL/TLS for all connections
- Secrets management via AWS Systems Manager
- Regular security updates

### Monitoring and Logging

#### CloudWatch Integration
- Application logs
- System metrics
- Custom metrics
- Alarms and notifications

#### Health Checks
- API endpoint monitoring
- Database connectivity
- SSL certificate expiry
- Performance metrics

## Environment Variables

### Production Environment
```bash
# Database
DB_HOST=your-rds-endpoint
DB_NAME=mydrreferral
DB_USERNAME=mydrreferral
DB_PASSWORD=your-secure-password

# JWT
JWT_SECRET_KEY=your-jwt-secret

# Email
SMTP_SERVER=smtp.gmail.com
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# AWS
AWS_ACCESS_KEY=your-access-key
AWS_SECRET_KEY=your-secret-key
```

### Frontend Environment
```bash
# API Configuration
NEXT_PUBLIC_API_URL=https://api.mydrreferral.com
NEXT_PUBLIC_APP_URL=https://mydrreferral.com
```

## Deployment Process

### Automatic Deployment (GitHub Actions)
1. Push to `main` branch
2. GitHub Actions triggers
3. Frontend builds and deploys to S3
4. API builds and deploys to EC2
5. Database migrations run
6. Health checks verify deployment

### Manual Deployment
```bash
# Frontend
cd Frontend
npm run build
aws s3 sync out/ s3://your-bucket-name

# API
cd Api
dotnet publish
scp -r publish/* ec2-user@your-ec2-ip:/var/www/mydrreferral/Api/
```

## Troubleshooting

### Common Issues

#### 1. Terraform Apply Fails
```bash
# Check AWS credentials
aws sts get-caller-identity

# Check Terraform state
terraform state list

# Clean and retry
terraform destroy
terraform apply
```

#### 2. GitHub Actions Fails
- Check all secrets are set
- Verify SSH key format
- Check EC2 security groups
- Review CloudWatch logs

#### 3. API Not Starting
```bash
# SSH into EC2
ssh ec2-user@your-ec2-ip

# Check service status
sudo systemctl status mydrreferral-api.service

# Check logs
sudo journalctl -u mydrreferral-api.service -f

# Restart service
sudo systemctl restart mydrreferral-api.service
```

#### 4. Database Connection Issues
- Check security groups
- Verify connection string
- Test connectivity from EC2
- Check RDS status

### Debug Commands

```bash
# Check API health
curl -v http://your-ec2-ip/api/health

# Check database
psql -h your-rds-endpoint -U mydrreferral -d mydrreferral -c "SELECT 1;"

# Check CloudFront
curl -v https://your-cloudfront-url

# Check S3
aws s3 ls s3://your-bucket-name
```

## Cost Optimization

### Current Setup (Estimated Monthly Cost)
- **EC2 t3.micro**: ~$8.50
- **RDS db.t3.micro**: ~$15.00
- **S3 + CloudFront**: ~$5.00
- **Data Transfer**: ~$2.00
- **Total**: ~$30.50/month

### Optimization Tips
1. Use Reserved Instances for long-term savings
2. Enable S3 Intelligent Tiering
3. Configure CloudFront caching
4. Monitor and optimize database queries
5. Use Spot Instances for non-critical workloads

## Scaling Considerations

### Horizontal Scaling
- Multiple EC2 instances behind ALB
- Auto Scaling Groups
- Database read replicas
- CDN edge locations

### Vertical Scaling
- Larger EC2 instances
- RDS instance upgrades
- Increased storage
- Enhanced networking

## Backup and Recovery

### Database Backups
- Automated daily backups (7-day retention)
- Point-in-time recovery
- Cross-region backup replication

### Application Backups
- Code repository (GitHub)
- Infrastructure as Code (Terraform)
- Configuration backups
- Disaster recovery procedures

## Security Best Practices

1. **Regular Updates**: Keep all components updated
2. **Access Control**: Use IAM roles and policies
3. **Network Security**: Implement proper security groups
4. **Data Encryption**: Encrypt data at rest and in transit
5. **Monitoring**: Set up CloudWatch alarms
6. **Backup Strategy**: Regular backups and testing
7. **Incident Response**: Document procedures

## Support and Maintenance

### Regular Tasks
- Security updates
- Performance monitoring
- Cost optimization
- Backup verification
- Log analysis

### Emergency Procedures
- Service restoration
- Data recovery
- Security incident response
- Communication protocols

## Contact and Support

- **Documentation**: This repository
- **Issues**: GitHub Issues
- **Security**: security@mydrreferral.com
- **Support**: support@mydrreferral.com
