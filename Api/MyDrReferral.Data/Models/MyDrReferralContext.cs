using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace MyDrReferral.Data.Models
{
    public partial class MyDrReferralContext : IdentityDbContext<ApplicationUser>
    {
        public MyDrReferralContext()
        {
        }

        public MyDrReferralContext(DbContextOptions<MyDrReferralContext> options)
            : base(options)
        {
        }

        public virtual DbSet<ErrorLog> ErrorLogs { get; set; }
        public virtual DbSet<TblAddress> TblAddress { get; set; }
        public virtual DbSet<TblConnection> TblConnections { get; set; }
        public virtual DbSet<TblPersonalDetail> TblPersonalDetail { get; set; }
        public virtual DbSet<TblReffer> TblReffer { get; set; }
        public virtual DbSet<Patient> Patient { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder); // required for Identity

            modelBuilder.Entity<ApplicationUser>(entity =>
            {
                entity.Property(e => e.UserId)
                      .ValueGeneratedOnAdd()
                      .Metadata.SetAfterSaveBehavior(Microsoft.EntityFrameworkCore.Metadata.PropertySaveBehavior.Ignore);
            });

            // Apply UTC converter to ALL DateTime properties globally
            var dateTimeConverter = new ValueConverter<DateTime, DateTime>(
                v => v.Kind == DateTimeKind.Utc ? v : DateTime.SpecifyKind(v.ToUniversalTime(), DateTimeKind.Utc),
                v => DateTime.SpecifyKind(v, DateTimeKind.Utc)
            );

            var nullableDateTimeConverter = new ValueConverter<DateTime?, DateTime?>(
                v => v.HasValue 
                    ? (v.Value.Kind == DateTimeKind.Utc ? v.Value : DateTime.SpecifyKind(v.Value.ToUniversalTime(), DateTimeKind.Utc))
                    : v,
                v => v.HasValue ? DateTime.SpecifyKind(v.Value, DateTimeKind.Utc) : v
            );

            foreach (var entityType in modelBuilder.Model.GetEntityTypes())
            {
                foreach (var property in entityType.GetProperties())
                {
                    if (property.ClrType == typeof(DateTime))
                    {
                        property.SetValueConverter(dateTimeConverter);
                    }
                    else if (property.ClrType == typeof(DateTime?))
                    {
                        property.SetValueConverter(nullableDateTimeConverter);
                    }
                }
            }
        }

        public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            FixDateTimes();
            return base.SaveChangesAsync(cancellationToken);
        }

        public override int SaveChanges()
        {
            FixDateTimes();
            return base.SaveChanges();
        }

        private void FixDateTimes()
        {
            foreach (var entry in ChangeTracker.Entries())
            {
                if (entry.State == Microsoft.EntityFrameworkCore.EntityState.Added || 
                    entry.State == Microsoft.EntityFrameworkCore.EntityState.Modified)
                {
                    foreach (var prop in entry.Properties)
                    {
                        // Force ALL DateTime to UTC - be aggressive
                        if (prop.CurrentValue != null)
                        {
                            // Handle non-nullable DateTime
                            if (prop.CurrentValue.GetType() == typeof(DateTime))
                            {
                                DateTime dt = (DateTime)prop.CurrentValue;
                                if (dt.Kind != DateTimeKind.Utc)
                                {
                                    prop.CurrentValue = DateTime.SpecifyKind(dt.ToUniversalTime(), DateTimeKind.Utc);
                                }
                            }
                            // Handle nullable DateTime
                            else if (prop.CurrentValue.GetType() == typeof(DateTime?))
                            {
                                DateTime? nullableDt = (DateTime?)prop.CurrentValue;
                                if (nullableDt.HasValue && nullableDt.Value.Kind != DateTimeKind.Utc)
                                {
                                    prop.CurrentValue = (DateTime?)DateTime.SpecifyKind(nullableDt.Value.ToUniversalTime(), DateTimeKind.Utc);
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
