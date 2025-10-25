# GitHub Secrets Setup Guide

## 🚨 **CRITICAL: You MUST add these secrets to your GitHub repository before deployment will work!**

### **Step 1: Go to Your GitHub Repository**
1. Navigate to: https://github.com/gabanib22/mydrreferral
2. Click **Settings** (in the repository menu)
3. Click **Secrets and variables** → **Actions**
4. Click **New repository secret**

### **Step 2: Add These Required Secrets**

| Secret Name | Value | How to Get |
|-------------|-------|------------|
| `AWS_ACCESS_KEY_ID` | Your AWS Access Key | AWS Console → IAM → Users → Your user → Security credentials |
| `AWS_SECRET_ACCESS_KEY` | Your AWS Secret Key | AWS Console → IAM → Users → Your user → Security credentials |
| `EC2_SSH_KEY` | [Copy the private key below] | From the Terraform output |
| `EC2_HOST` | `52.66.197.58` | Your EC2 public IP |
| `S3_BUCKET_NAME` | `mydrreferral-frontend-1eqovfla` | Your S3 bucket name |
| `DATABASE_CONNECTION_STRING` | `Host=localhost;Database=mydrreferral;Username=mydrreferral;Password=MyDrReferral2024!SecurePassword` | Local PostgreSQL connection |

### **Step 3: SSH Private Key Content**
Copy this entire content for the `EC2_SSH_KEY` secret:

```
-----BEGIN OPENSSH PRIVATE KEY-----
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
-----END OPENSSH PRIVATE KEY-----
```

### **Step 4: Verify Secrets Are Added**
After adding all secrets, you should see them listed in your repository secrets page.

### **Step 5: Test the Deployment**
1. Go to **Actions** tab in your repository
2. You should see a new workflow run starting automatically
3. Monitor the progress and check for any errors

## **🚨 Common Issues & Solutions**

### **Issue: "Credentials could not be loaded"**
- **Solution**: Make sure you've added `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` secrets
- **Check**: Go to AWS Console → IAM → Users → Your user → Security credentials

### **Issue: "S3 bucket not found"**
- **Solution**: Make sure you've added the `S3_BUCKET_NAME` secret with the correct bucket name

### **Issue: "SSH connection failed"**
- **Solution**: Make sure you've added the `EC2_SSH_KEY` secret with the complete private key

### **Issue: "Database connection failed"**
- **Solution**: Make sure you've added the `DATABASE_CONNECTION_STRING` secret

## **✅ Success Indicators**

When everything is working correctly, you should see:
- ✅ AWS credentials verified successfully!
- ✅ Frontend deployment completed successfully!
- ✅ API deployment completed successfully!
- ✅ Database migration completed successfully!
- ✅ All API tests passed!

## **🔗 Your Application URLs**

Once deployment is successful:
- **Frontend**: http://mydrreferral-frontend-1eqovfla.s3-website.ap-south-1.amazonaws.com
- **API**: http://52.66.197.58/api/health

---

**Need help?** Check the GitHub Actions logs for detailed error messages and troubleshooting steps.
