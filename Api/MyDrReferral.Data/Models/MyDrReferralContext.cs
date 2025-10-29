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
            // This ensures ALL DateTime values are stored as UTC in PostgreSQL
            var dateTimeConverter = new ValueConverter<DateTime, DateTime>(
                // Convert to DB: Ensure UTC Kind
                v => v.Kind == DateTimeKind.Utc ? v : DateTime.SpecifyKind(v.ToUniversalTime(), DateTimeKind.Utc),
                // Convert from DB: Always UTC from PostgreSQL
                v => DateTime.SpecifyKind(v, DateTimeKind.Utc)
            );

            var nullableDateTimeConverter = new ValueConverter<DateTime?, DateTime?>(
                // Convert to DB: Ensure UTC Kind
                v => !v.HasValue ? null : (v.Value.Kind == DateTimeKind.Utc ? v.Value : DateTime.SpecifyKind(v.Value.ToUniversalTime(), DateTimeKind.Utc)),
                // Convert from DB: Always UTC from PostgreSQL
                v => v.HasValue ? DateTime.SpecifyKind(v.Value, DateTimeKind.Utc) : null
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

        public override Task<int> SaveChangesAsync(bool acceptAllChangesOnSuccess, CancellationToken cancellationToken = default)
        {
            FixDateTimes();
            return base.SaveChangesAsync(acceptAllChangesOnSuccess, cancellationToken);
        }

        public override int SaveChanges()
        {
            FixDateTimes();
            return base.SaveChanges();
        }

        public override int SaveChanges(bool acceptAllChangesOnSuccess)
        {
            FixDateTimes();
            return base.SaveChanges(acceptAllChangesOnSuccess);
        }

        private void FixDateTimes()
        {
            Console.WriteLine("=== FixDateTimes START ===");
            int fixedCount = 0;
            
            foreach (var entry in ChangeTracker.Entries())
            {
                if (entry.State == Microsoft.EntityFrameworkCore.EntityState.Added || 
                    entry.State == Microsoft.EntityFrameworkCore.EntityState.Modified)
                {
                    Console.WriteLine($">>> Entity: {entry.Entity.GetType().Name}, State: {entry.State}");
                    
                    foreach (var prop in entry.Properties)
                    {
                        if (prop.CurrentValue != null)
                        {
                            var valueType = prop.CurrentValue.GetType();
                            
                            if (valueType == typeof(DateTime))
                            {
                                DateTime dt = (DateTime)prop.CurrentValue;
                                Console.WriteLine($">>>>>> Property: {prop.Metadata.Name}, Kind: {dt.Kind}");
                                if (dt.Kind != DateTimeKind.Utc)
                                {
                                    var fixedDt = DateTime.SpecifyKind(dt.ToUniversalTime(), DateTimeKind.Utc);
                                    prop.CurrentValue = fixedDt;
                                    fixedCount++;
                                    Console.WriteLine($">>>>>> FIXED! Changed {prop.Metadata.Name} from {dt.Kind} to UTC");
                                }
                            }
                            else if (valueType == typeof(DateTime?))
                            {
                                DateTime? nullableDt = (DateTime?)prop.CurrentValue;
                                if (nullableDt.HasValue)
                                {
                                    Console.WriteLine($">>>>>> Property: {prop.Metadata.Name}, Kind: {nullableDt.Value.Kind}");
                                    if (nullableDt.Value.Kind != DateTimeKind.Utc)
                                    {
                                        var fixedDt = DateTime.SpecifyKind(nullableDt.Value.ToUniversalTime(), DateTimeKind.Utc);
                                        prop.CurrentValue = (DateTime?)fixedDt;
                                        fixedCount++;
                                        Console.WriteLine($">>>>>> FIXED! Changed {prop.Metadata.Name} from {nullableDt.Value.Kind} to UTC");
                                    }
                                }
                            }
                        }
                    }
                }
            }
            
            Console.WriteLine($"=== FixDateTimes END - Fixed {fixedCount} DateTime values ===");
        }
    }
}
