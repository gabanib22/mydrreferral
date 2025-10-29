using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using System;
using System.Collections;
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

            // ✅ Apply UTC ValueConverter globally for DateTime & DateTime?
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

        public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            ConvertAllDateTimesToUtc();
            return base.SaveChangesAsync(cancellationToken);
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

                    // Single DateTime
                    if (value is DateTime dt)
                    {
                        if (dt.Kind != DateTimeKind.Utc)
                            prop.CurrentValue = DateTime.SpecifyKind(dt, DateTimeKind.Utc).ToUniversalTime();
                    }

                    // Nullable DateTime
                    else if (value is DateTime ? ndt && ndt.HasValue)
                    {
                        if (ndt.Value.Kind != DateTimeKind.Utc)
                            prop.CurrentValue = DateTime.SpecifyKind(ndt.Value, DateTimeKind.Utc).ToUniversalTime();
                    }

                    // Array of DateTime
                    else if (value is DateTime[] dtArray && dtArray.Length > 0)
                    {
                        prop.CurrentValue = dtArray.Select(x =>
                            DateTime.SpecifyKind(x, DateTimeKind.Utc).ToUniversalTime()).ToArray();
                    }

                    // List of DateTime
                    else if (value is IList<DateTime> dtList && dtList.Count > 0)
                    {
                        prop.CurrentValue = dtList.Select(x =>
                            DateTime.SpecifyKind(x, DateTimeKind.Utc).ToUniversalTime()).ToList();
                    }

                    // IEnumerable fallback (rare cases like arrays or navigation lists)
                    else if (value is IEnumerable enumerable)
                    {
                        var list = new List<object>();
                        bool anyDateTime = false;

                        foreach (var item in enumerable)
                        {
                            if (item is DateTime d)
                            {
                                anyDateTime = true;
                                list.Add(DateTime.SpecifyKind(d, DateTimeKind.Utc).ToUniversalTime());
                            }
                            else
                                list.Add(item);
                        }

                        if (anyDateTime)
                            prop.CurrentValue = list.ToArray();
                    }
                }
            }
        }
    }
}
