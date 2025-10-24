using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace MyDrReferral.Data.Models;

//public partial class MyDrReferralContext : DbContext
public partial class MyDrReferralContext : IdentityDbContext<ApplicationUser>
{
    public MyDrReferralContext()
    {
    }

    public MyDrReferralContext(DbContextOptions<MyDrReferralContext> options)
        : base(options)
    {
    }
    //Added By me
    //public virtual DbSet<ApplicationUser> AspNetUsers { get; set; }

    //
    //public virtual DbSet<AspNetRole> AspNetRoles { get; set; }

    //public virtual DbSet<AspNetUser> AspNetUsers { get; set; }

    //public virtual DbSet<AspNetUserClaim> AspNetUserClaims { get; set; }

    //public virtual DbSet<AspNetUserLogin> AspNetUserLogins { get; set; }

    //public virtual DbSet<AspNetUserToken> AspNetUserTokens { get; set; }

    public virtual DbSet<ErrorLog> ErrorLogs { get; set; }

    public virtual DbSet<TblAddress> TblAddress { get; set; }

    public virtual DbSet<TblConnection> TblConnections { get; set; }

    public virtual DbSet<TblPersonalDetail> TblPersonalDetail { get; set; }

    public virtual DbSet<TblReffer> TblReffer { get; set; }
    public virtual DbSet<Patient> Patient { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder); // ← required when using IdentityDbContext

        modelBuilder.Entity<ApplicationUser>(entity =>
        {
            // If UserId is a surrogate key (auto-increment identity)
            entity.Property(e => e.UserId)
                  .ValueGeneratedOnAdd()
                  .Metadata.SetAfterSaveBehavior(Microsoft.EntityFrameworkCore.Metadata.PropertySaveBehavior.Ignore);
        });

        // Configure all DateTime properties to use UTC
        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            foreach (var property in entityType.GetProperties())
            {
                if (property.ClrType == typeof(DateTime) || property.ClrType == typeof(DateTime?))
                {
                    property.SetColumnType("timestamp with time zone");
                }
            }
        }
    }

    public override int SaveChanges()
    {
        ConvertDateTimesToUtc();
        return base.SaveChanges();
    }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        ConvertDateTimesToUtc();
        return await base.SaveChangesAsync(cancellationToken);
    }

    private void ConvertDateTimesToUtc()
    {
        var entries = ChangeTracker.Entries()
            .Where(e => e.State == Microsoft.EntityFrameworkCore.EntityState.Added || 
                       e.State == Microsoft.EntityFrameworkCore.EntityState.Modified);

        foreach (var entry in entries)
        {
            foreach (var property in entry.Properties)
            {
                if (property.Metadata.ClrType == typeof(DateTime) || 
                    property.Metadata.ClrType == typeof(DateTime?))
                {
                    if (property.CurrentValue is DateTime dateTime && dateTime.Kind == DateTimeKind.Local)
                    {
                        property.CurrentValue = dateTime.ToUniversalTime();
                    }
                }
            }
        }
    }
}
