# GitHub Secrets Update Guide
# The EC2 instance IP has changed and needs to be updated in GitHub secrets

## 🔧 **Current Issue:**
- **Old EC2 IP**: 52.66.197.58 (GitHub secret still has this)
- **New EC2 IP**: 43.205.146.64 (Current actual IP)
- **RDS Endpoint**: mydrreferral-db.c9og0uw2ieyc.ap-south-1.rds.amazonaws.com

## 🚀 **Required Actions:**

### **Step 1: Update GitHub Secrets**

Go to your GitHub repository → Settings → Secrets and variables → Actions

**Update these secrets:**

1. **`EC2_HOST`**: 
   ```
   43.205.146.64
   ```

2. **`DATABASE_CONNECTION_STRING`**: 
   ```
   Host=mydrreferral-db.c9og0uw2ieyc.ap-south-1.rds.amazonaws.com;Database=mydrreferral;Username=mydrreferral;Password=MyDrReferral2024!SecurePassword;Port=5432
   ```

3. **`S3_BUCKET_NAME`**: 
   ```
   mydrreferral-frontend-1eqovfla
   ```

### **Step 2: Test Connection**

After updating secrets, test the connection:

```bash
# Test SSH connection
ssh ec2-user@43.205.146.64 "echo 'SSH connection successful'"

# Test API health (after deployment)
curl http://43.205.146.64/api/health
```

### **Step 3: Re-run GitHub Actions**

1. **Push any change** to trigger GitHub Actions
2. **Or manually trigger** the workflow
3. **Monitor the deployment** logs

## 🔍 **Expected Deployment Flow:**

1. ✅ **SSH to EC2** (43.205.146.64)
2. ✅ **Stop API service**
3. ✅ **Backup current deployment**
4. ✅ **Create deployment directory**
5. ✅ **Upload new API package**
6. ✅ **Extract and configure**
7. ✅ **Start API service**
8. ✅ **Test health endpoint**

## 🚨 **If Issues Persist:**

### **Check EC2 Instance Status:**
```bash
# SSH into EC2 and check services
ssh ec2-user@43.205.146.64

# Check if services are running
sudo systemctl status mydrreferral-api.service
sudo systemctl status nginx
sudo systemctl status postgresql

# Check API logs
sudo journalctl -u mydrreferral-api.service -f
```

### **Check Security Groups:**
- Ensure EC2 security group allows port 22 (SSH)
- Ensure EC2 security group allows port 80 (HTTP)
- Ensure RDS security group allows port 5432 from EC2

## 📊 **Current Infrastructure Status:**

- ✅ **RDS Database**: Running and accessible
- ✅ **EC2 Instance**: Running on 43.205.146.64
- ✅ **SSH Access**: Working (port 22)
- ❌ **API Service**: Not running (port 80)
- ❌ **GitHub Secrets**: Need to be updated

## 🎯 **Next Steps:**

1. **Update GitHub secrets** with new IP and RDS connection string
2. **Re-run GitHub Actions** deployment
3. **Monitor deployment** logs for success
4. **Test API health** endpoint

The deployment should succeed once the GitHub secrets are updated with the correct values!
