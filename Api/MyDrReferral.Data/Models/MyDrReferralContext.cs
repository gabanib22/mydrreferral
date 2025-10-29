using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

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

        // ✅ Universal ValueConverter દરેક DateTime field માટે
        var dateTimeConverter = new ValueConverter<DateTime, DateTime>(
            v => v.ToUniversalTime(),  // DB માં save કરતા પહેલા UTC માં રૂપાંતરિત કરે છે
            v => DateTime.SpecifyKind(v, DateTimeKind.Utc) // Read કરતા સમયે પણ UTC તરીકે રાખે છે
        );

        // ✅ બધાં DateTime property માટે converter લાગુ કરો
        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            foreach (var property in entityType.GetProperties())
            {
                if (property.ClrType == typeof(DateTime))
                {
                    property.SetValueConverter(dateTimeConverter);
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
