# PostgreSQL Database Setup for MyDrReferral

## Prerequisites
1. Install PostgreSQL on your system
2. Ensure PostgreSQL service is running
3. Have access to a PostgreSQL database server

## Database Setup Steps

### 1. Create Database
```sql
-- Connect to PostgreSQL as superuser
CREATE DATABASE "MyDrReferralDB";
CREATE DATABASE "MyDrReferralDB_Dev";

-- Create a user for the application (optional)
CREATE USER mydrreferral_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE "MyDrReferralDB" TO mydrreferral_user;
GRANT ALL PRIVILEGES ON DATABASE "MyDrReferralDB_Dev" TO mydrreferral_user;
```

### 2. Update Connection Strings
Update the connection strings in `appsettings.json` and `appsettings.Development.json`:

**Production:**
```json
"ConnectionStrings": {
  "DefaultConnection": "Host=your-postgres-host;Database=MyDrReferralDB;Username=your-username;Password=your-password;"
}
```

**Development:**
```json
"ConnectionStrings": {
  "DefaultConnection": "Host=localhost;Database=MyDrReferralDB_Dev;Username=postgres;Password=postgres;"
}
```

### 3. Apply Migrations
```bash
# Navigate to the Data project directory
cd Api/MyDrReferral.Data

# Apply migrations to create tables
dotnet ef database update --startup-project ../MyDrReferral.Api
```

### 4. Verify Database
After running migrations, you should see the following tables:
- AspNetRoles
- AspNetUsers
- AspNetUserClaims
- AspNetUserLogins
- AspNetUserTokens
- ErrorLogs
- TblAddress
- TblConnections
- TblPersonalDetail
- TblReffer
- Patient

## Deployment Notes

### For Production Deployment:
1. Use environment variables for connection strings
2. Ensure PostgreSQL is properly configured for production
3. Set up proper backup strategies
4. Configure connection pooling if needed

### Environment Variables Example:
```bash
# Set these in your production environment
export ConnectionStrings__DefaultConnection="Host=your-prod-host;Database=MyDrReferralDB;Username=prod-user;Password=prod-password;"
```

## Troubleshooting

### Common Issues:
1. **Connection refused**: Ensure PostgreSQL service is running
2. **Authentication failed**: Check username/password
3. **Database does not exist**: Create the database first
4. **Permission denied**: Grant proper permissions to the user

### Useful Commands:
```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Connect to PostgreSQL
psql -U postgres -h localhost

# List databases
\l

# Connect to specific database
\c MyDrReferralDB
```
