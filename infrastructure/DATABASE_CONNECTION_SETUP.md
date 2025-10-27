# Database Connection String Setup Guide

## Current Issue

Your GitHub Actions deployment is failing because the `DATABASE_CONNECTION_STRING` secret is set to `Host=localhost`, which tries to connect to a PostgreSQL database running locally on the GitHub Actions runner. This will always fail because there's no local database available.

## Solution

You need to update your `DATABASE_CONNECTION_STRING` GitHub secret to point to your actual database server.

## Database Options

### Option 1: AWS RDS PostgreSQL (Recommended)

If you're using AWS RDS, your connection string should look like:

```
Host=your-rds-endpoint.region.rds.amazonaws.com;Database=mydrreferral;Username=mydrreferral;Password=your-secure-password;Port=5432
```

**Example:**
```
Host=mydrreferral-db.cluster-xyz.ap-south-1.rds.amazonaws.com;Database=mydrreferral;Username=mydrreferral;Password=MySecurePassword123;Port=5432
```

### Option 2: Local PostgreSQL on EC2

If you're using the free tier setup with PostgreSQL installed on your EC2 instance, you need to:

1. **Update the connection string** to point to your EC2 instance:
```
Host=your-ec2-public-ip;Database=mydrreferral;Username=mydrreferral;Password=your-password;Port=5432
```

2. **Ensure PostgreSQL is accessible** from external connections:
   - Update PostgreSQL configuration to listen on all interfaces
   - Update EC2 security group to allow port 5432

### Option 3: External Database Service

If you're using a different database service (like Supabase, Railway, etc.), use their provided connection string format.

## How to Update GitHub Secret

1. Go to your GitHub repository
2. Click on **Settings** tab
3. In the left sidebar, click **Secrets and variables** → **Actions**
4. Find `DATABASE_CONNECTION_STRING` and click **Update**
5. Replace the value with your correct connection string
6. Click **Update secret**

## Testing Your Connection String

You can test your connection string locally:

```bash
# Test with psql (if you have PostgreSQL client)
psql "Host=your-host;Database=mydrreferral;Username=mydrreferral;Password=your-password"

# Or test with your .NET application
dotnet ef database update --connection "Host=your-host;Database=mydrreferral;Username=mydrreferral;Password=your-password"
```

## Security Considerations

- Never commit connection strings to your code
- Use strong passwords
- Consider using AWS Secrets Manager for production
- Rotate passwords regularly
- Use SSL/TLS connections when possible

## Troubleshooting

### Common Issues:

1. **Connection Refused**: Check if the database server is running and accessible
2. **Authentication Failed**: Verify username and password
3. **Database Not Found**: Ensure the database exists
4. **Network Issues**: Check security groups and firewall rules

### Debug Commands:

```bash
# Test network connectivity
telnet your-db-host 5432

# Test with psql
psql -h your-db-host -U mydrreferral -d mydrreferral

# Check PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-*.log
```

## Next Steps

1. Update your `DATABASE_CONNECTION_STRING` secret with the correct connection string
2. Re-run the GitHub Actions deployment
3. Monitor the logs to ensure the database migration succeeds
4. Test your API endpoints to verify everything is working

## Example Connection Strings

### AWS RDS:
```
Host=mydrreferral-db.cluster-xyz.ap-south-1.rds.amazonaws.com;Database=mydrreferral;Username=mydrreferral;Password=MySecurePassword123;Port=5432
```

### EC2 with PostgreSQL:
```
Host=52.66.197.58;Database=mydrreferral;Username=mydrreferral;Password=MySecurePassword123;Port=5432
```

### Local Development:
```
Host=localhost;Database=mydrreferral;Username=mydrreferral;Password=MySecurePassword123;Port=5432
```

Remember: The localhost connection string only works for local development, not for GitHub Actions!
