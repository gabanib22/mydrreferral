# MyDrReferral RDS Migration Guide

This guide helps you migrate from local PostgreSQL on EC2 to AWS RDS PostgreSQL for better reliability, automated backups, and easier management.

## 🎯 **Why Migrate to RDS?**

### **Current Setup (Local PostgreSQL on EC2)**
- ❌ **Manual maintenance** required
- ❌ **Single point of failure**
- ❌ **Manual backups** needed
- ❌ **No high availability**
- ❌ **Limited monitoring**

### **New Setup (AWS RDS PostgreSQL)**
- ✅ **Fully managed** by AWS
- ✅ **Automated backups** (7-day retention)
- ✅ **High availability** with Multi-AZ
- ✅ **Enhanced monitoring** and alerts
- ✅ **Security and encryption**
- ✅ **Easy scaling** when needed

## 📊 **Cost Comparison**

| **Component** | **Current (Free Tier)** | **RDS Setup** |
|---------------|-------------------------|----------------|
| EC2 Instance | Free (t3.micro) | Free (t3.micro) |
| Database | Free (local PostgreSQL) | ~$15-20/month (db.t3.micro) |
| Storage | Free | ~$2-5/month (20GB) |
| Backups | Manual | Free (7-day retention) |
| **Total** | **~$0/month** | **~$20-25/month** |

## 🚀 **Migration Steps**

### **Step 1: Deploy RDS Infrastructure**

#### **Option A: Using PowerShell (Windows)**
```powershell
.\infrastructure\scripts\deploy-rds.ps1
```

#### **Option B: Using Bash (Linux/Mac)**
```bash
./infrastructure/scripts/deploy-rds.sh
```

#### **Option C: Manual Terraform**
```bash
cd infrastructure/terraform
terraform init
terraform plan -var-file="terraform.tfvars"
terraform apply -var-file="terraform.tfvars"
```

### **Step 2: Update GitHub Secrets**

After deployment, update your GitHub repository secrets:

1. **Go to GitHub** → **Settings** → **Secrets and variables** → **Actions**
2. **Update `DATABASE_CONNECTION_STRING`** with the RDS connection string:
   ```
   Host=your-rds-endpoint.region.rds.amazonaws.com;Database=mydrreferral;Username=mydrreferral;Password=your-password;Port=5432
   ```

### **Step 3: Run Database Migration**

The GitHub Actions workflow will automatically:
1. ✅ **Connect to RDS** using the new connection string
2. ✅ **Run Entity Framework migrations**
3. ✅ **Create all database tables**
4. ✅ **Deploy the API** to EC2

### **Step 4: Verify Deployment**

Test your deployment:
```bash
# Test API health
curl http://your-ec2-ip/api/health

# Test database connection
psql -h your-rds-endpoint -U mydrreferral -d mydrreferral -c "SELECT 1;"
```

## 🔧 **Infrastructure Components**

### **What Gets Created:**

1. **VPC with Subnets**
   - 2 Public subnets (for EC2)
   - 2 Private subnets (for RDS)

2. **RDS PostgreSQL Instance**
   - Engine: PostgreSQL 15.4
   - Instance: db.t3.micro (Free Tier eligible)
   - Storage: 20GB (expandable to 100GB)
   - Encryption: Enabled
   - Backups: 7-day retention

3. **Security Groups**
   - API security group (ports 80, 443, 22)
   - RDS security group (port 5432 from API only)

4. **EC2 Instance**
   - Amazon Linux 2
   - t3.micro (Free Tier eligible)
   - Connects to RDS (no local PostgreSQL)

5. **S3 Bucket**
   - Static website hosting for frontend
   - CloudFront distribution (optional)

## 📋 **Configuration Files**

### **Terraform Configuration**
- `main-rds.tf` - Main infrastructure with RDS
- `user-data-rds.sh` - EC2 setup script (no local PostgreSQL)
- `terraform.tfvars` - Your configuration values

### **Required Variables**
```hcl
aws_region = "ap-south-1"
project_name = "mydrreferral"
environment = "production"
domain_name = "mydrreferral.com"
db_password = "YourSecurePassword123!"
ssh_public_key = "your-ssh-public-key"
```

## 🔒 **Security Features**

### **RDS Security**
- ✅ **Encryption at rest** (AES-256)
- ✅ **Encryption in transit** (SSL/TLS)
- ✅ **Private subnets** (not publicly accessible)
- ✅ **Security groups** (restricted access)
- ✅ **Automated security updates**

### **Network Security**
- ✅ **VPC isolation**
- ✅ **Private subnets** for database
- ✅ **Security groups** with minimal access
- ✅ **No direct internet access** to RDS

## 📊 **Monitoring and Alerts**

### **CloudWatch Integration**
- ✅ **Database metrics** (CPU, memory, connections)
- ✅ **Storage metrics** (free space, IOPS)
- ✅ **Connection metrics** (active connections)
- ✅ **Custom alarms** for critical events

### **Performance Insights**
- ✅ **Query performance** analysis
- ✅ **Slow query** identification
- ✅ **Resource utilization** tracking
- ✅ **7-day retention** of performance data

## 🔄 **Backup and Recovery**

### **Automated Backups**
- ✅ **Daily backups** (7-day retention)
- ✅ **Point-in-time recovery**
- ✅ **Automated backup scheduling**
- ✅ **Cross-region backup** (optional)

### **Manual Snapshots**
- ✅ **On-demand snapshots**
- ✅ **Long-term retention**
- ✅ **Cross-region copying**

## 🚨 **Troubleshooting**

### **Common Issues**

1. **Connection Timeout**
   - Check security groups
   - Verify RDS instance status
   - Check VPC configuration

2. **Authentication Failed**
   - Verify username/password
   - Check database exists
   - Verify user permissions

3. **Migration Failed**
   - Check connection string format
   - Verify EF tools installation
   - Check database accessibility

### **Debug Commands**
```bash
# Check RDS status
aws rds describe-db-instances --db-instance-identifier mydrreferral-db

# Test connection
psql -h your-rds-endpoint -U mydrreferral -d mydrreferral

# Check security groups
aws ec2 describe-security-groups --group-names mydrreferral-rds-*
```

## 📈 **Scaling Options**

### **Vertical Scaling**
- **db.t3.small** - 2 vCPU, 2 GB RAM (~$25/month)
- **db.t3.medium** - 2 vCPU, 4 GB RAM (~$50/month)
- **db.r5.large** - 2 vCPU, 16 GB RAM (~$150/month)

### **Horizontal Scaling**
- **Read replicas** for read-heavy workloads
- **Multi-AZ deployment** for high availability
- **Connection pooling** for better performance

## 🎉 **Benefits After Migration**

1. **Reliability**: 99.95% uptime SLA
2. **Security**: Enterprise-grade security
3. **Monitoring**: Comprehensive monitoring
4. **Backups**: Automated backup management
5. **Scaling**: Easy vertical and horizontal scaling
6. **Maintenance**: AWS handles all maintenance

## 📞 **Support**

If you encounter any issues during migration:

1. **Check the logs** in GitHub Actions
2. **Review CloudWatch** logs for RDS
3. **Test connectivity** manually
4. **Verify security groups** configuration
5. **Check Terraform** outputs for correct values

The RDS migration will significantly improve your application's reliability and make database management much easier!
