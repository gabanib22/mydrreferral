using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using System;
using System.Collections.Generic;
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

            // 🔹 Apply UTC ValueConverter globally for DateTime & DateTime?
            var dateTimeConverter = new ValueConverter<DateTime, DateTime>(
                v => v.Kind == DateTimeKind.Utc ? v : v.ToUniversalTime(),
                v => DateTime.SpecifyKind(v, DateTimeKind.Utc)
            );

            var nullableDateTimeConverter = new ValueConverter<DateTime?, DateTime?>(
                v => v.HasValue ? (v.Value.Kind == DateTimeKind.Utc ? v.Value : v.Value.ToUniversalTime()) : v,
                v => v.HasValue ? DateTime.SpecifyKind(v.Value, DateTimeKind.Utc) : v
            );

            foreach (var entityType in modelBuilder.Model.GetEntityTypes())
            {
                foreach (var property in entityType.GetProperties())
                {
                    if (property.ClrType == typeof(DateTime))
                        property.SetValueConverter(dateTimeConverter);
                    else if (property.ClrType == typeof(DateTime?))
                        property.SetValueConverter(nullableDateTimeConverter);
                }
            }
        }

        public override int SaveChanges()
        {
            ConvertAllDateTimesToUtc();
            return base.SaveChanges();
        }

        public override int SaveChanges(bool acceptAllChangesOnSuccess)
        {
            ConvertAllDateTimesToUtc();
            return base.SaveChanges(acceptAllChangesOnSuccess);
        }

        public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            ConvertAllDateTimesToUtc();
            return base.SaveChangesAsync(cancellationToken);
        }

        public override Task<int> SaveChangesAsync(bool acceptAllChangesOnSuccess, CancellationToken cancellationToken = default)
        {
            ConvertAllDateTimesToUtc();
            return base.SaveChangesAsync(acceptAllChangesOnSuccess, cancellationToken);
        }

        private void ConvertAllDateTimesToUtc()
        {
            foreach (var entry in ChangeTracker.Entries())
            {
                if (entry.State == EntityState.Detached || entry.State == EntityState.Unchanged)
                    continue;

                foreach (var prop in entry.Properties)
                {
                    var value = prop.CurrentValue;

                    // ✅ Single DateTime - FORCE to UTC regardless of current Kind
                    if (value is DateTime dt)
                    {
                        // Always convert to UTC - be aggressive about it
                        prop.CurrentValue = dt.Kind == DateTimeKind.Utc 
                            ? dt 
                            : DateTime.SpecifyKind(dt.ToUniversalTime(), DateTimeKind.Utc);
                    }

                    // ✅ Nullable DateTime - FORCE to UTC regardless of current Kind
                    else if (value is DateTime?)
                    {
                        DateTime? ndtValue = (DateTime?)value;
                        if (ndtValue.HasValue)
                        {
                            var dtValue = ndtValue.Value;
                            prop.CurrentValue = dtValue.Kind == DateTimeKind.Utc
                                ? dtValue
                                : DateTime.SpecifyKind(dtValue.ToUniversalTime(), DateTimeKind.Utc);
                        }
                    }

                    // ✅ Array of DateTime
                    else if (value is DateTime[] dtArray && dtArray.Length > 0)
                    {
                        prop.CurrentValue = dtArray
                            .Select(x => DateTime.SpecifyKind(x, DateTimeKind.Utc).ToUniversalTime())
                            .ToArray();
                    }

                    // ✅ List<DateTime>
                    else if (value is List<DateTime> dtList && dtList.Count > 0)
                    {
                        for (int i = 0; i < dtList.Count; i++)
                        {
                            var d = dtList[i];
                            if (d.Kind != DateTimeKind.Utc)
                                dtList[i] = DateTime.SpecifyKind(d, DateTimeKind.Utc).ToUniversalTime();
                        }
                    }

                    // ✅ IEnumerable<DateTime> fallback
                    else if (value is IEnumerable<DateTime> dateEnumerable)
                    {
                        var fixedList = dateEnumerable
                            .Select(d => DateTime.SpecifyKind(d, DateTimeKind.Utc).ToUniversalTime())
                            .ToList();
                        prop.CurrentValue = fixedList;
                    }
                }
            }
        }
    }
}
