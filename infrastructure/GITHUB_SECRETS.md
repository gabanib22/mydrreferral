# GitHub Actions Secrets Configuration

This document outlines the required secrets for GitHub Actions auto-deployment.

## Required Secrets

Add these secrets to your GitHub repository settings (Settings > Secrets and variables > Actions):

### AWS Credentials
```
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
```
- Create an IAM user with appropriate permissions
- Attach policies: `AmazonS3FullAccess`, `AmazonEC2FullAccess`, `AmazonRDSFullAccess`, `CloudFrontFullAccess`

### EC2 Configuration
```
EC2_SSH_KEY
```
- Your private SSH key for EC2 access
- Generate with: `ssh-keygen -t rsa -b 4096 -C "your-email@example.com"`
- Add public key to EC2 instance

### Database Configuration
```
DATABASE_CONNECTION_STRING
```
- Format: `Host=your-rds-endpoint;Database=mydrreferral;Username=mydrreferral;Password=your-password`
- Get the RDS endpoint from Terraform outputs

### CloudFront Configuration
```
CLOUDFRONT_DISTRIBUTION_ID
```
- Get from AWS Console > CloudFront > Distributions
- Or from Terraform outputs

## GitHub Actions Workflow Variables

Update these variables in `.github/workflows/deploy.yml`:

```yaml
env:
  AWS_REGION: ap-south-1
  S3_BUCKET: your-s3-bucket-name
  EC2_INSTANCE_ID: i-1234567890abcdef0
  EC2_USER: ec2-user
  EC2_HOST: your-ec2-public-ip
```

## IAM Policy for GitHub Actions

Create an IAM user with this policy:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:*",
                "ec2:*",
                "rds:*",
                "cloudfront:*",
                "iam:*",
                "logs:*"
            ],
            "Resource": "*"
        }
    ]
}
```

## Security Best Practices

1. **Rotate Keys Regularly**: Change AWS access keys every 90 days
2. **Least Privilege**: Use minimal required permissions
3. **Encrypt Secrets**: All secrets are encrypted by GitHub
4. **Monitor Usage**: Check AWS CloudTrail for API usage
5. **Backup Keys**: Store SSH keys securely

## Troubleshooting

### Common Issues

1. **Permission Denied**: Check IAM policies
2. **SSH Connection Failed**: Verify SSH key format
3. **Database Connection Failed**: Check security groups
4. **S3 Upload Failed**: Verify bucket permissions

### Debug Steps

1. Check GitHub Actions logs
2. Verify all secrets are set correctly
3. Test AWS credentials manually
4. Check EC2 instance logs
5. Verify database connectivity

## Manual Deployment

If GitHub Actions fails, you can deploy manually:

```bash
# Deploy infrastructure
cd infrastructure/terraform
terraform apply

# Deploy frontend
cd ../../Frontend
npm run build
aws s3 sync out/ s3://your-bucket-name

# Deploy API
cd ../Api
dotnet publish
scp -r publish/* ec2-user@your-ec2-ip:/var/www/mydrreferral/Api/
```
