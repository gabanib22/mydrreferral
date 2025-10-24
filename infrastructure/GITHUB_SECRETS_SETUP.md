# GitHub Actions Secrets Setup

## Required Secrets for Auto-Deployment

Go to your GitHub repository: https://github.com/gabanib22/mydrreferral

Navigate to: **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

### Add these secrets:

#### 1. AWS_ACCESS_KEY_ID
- **Name**: `AWS_ACCESS_KEY_ID`
- **Value**: Your AWS access key ID
- **How to get**: AWS Console → IAM → Users → Your user → Security credentials

#### 2. AWS_SECRET_ACCESS_KEY
- **Name**: `AWS_SECRET_ACCESS_KEY`
- **Value**: Your AWS secret access key
- **How to get**: AWS Console → IAM → Users → Your user → Security credentials

#### 3. EC2_SSH_KEY
- **Name**: `EC2_SSH_KEY`
- **Value**: Content of your private SSH key file
- **How to get**: 
  ```powershell
  Get-Content $env:USERPROFILE\.ssh\mydrreferral_key
  ```

#### 4. EC2_HOST
- **Name**: `EC2_HOST`
- **Value**: `52.66.197.58`

#### 5. S3_BUCKET_NAME
- **Name**: `S3_BUCKET_NAME`
- **Value**: `mydrreferral-frontend-1eqovfla`

#### 6. DATABASE_CONNECTION_STRING
- **Name**: `DATABASE_CONNECTION_STRING`
- **Value**: `Host=localhost;Database=mydrreferral;Username=mydrreferral;Password=MyDrReferral2024!SecurePassword`

## IAM User Permissions

Your AWS user needs these permissions:
- `AmazonS3FullAccess`
- `AmazonEC2FullAccess`
- `CloudWatchLogsFullAccess`

## Test Commands

After adding secrets, test with:
```bash
# Test API (wait for EC2 setup to complete)
curl http://52.66.197.58/api/health

# Test S3 bucket
aws s3 ls s3://mydrreferral-frontend-1eqovfla
```
