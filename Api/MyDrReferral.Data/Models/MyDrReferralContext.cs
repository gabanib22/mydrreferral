using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
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
        }

        // Simple DateTime conversion - convert Local to UTC before saving
        public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            ConvertLocalDateTimesToUtc();
            return base.SaveChangesAsync(cancellationToken);
        }

        public override int SaveChanges()
        {
            ConvertLocalDateTimesToUtc();
            return base.SaveChanges();
        }

        private void ConvertLocalDateTimesToUtc()
        {
            var entries = ChangeTracker.Entries()
                .Where(e => e.State == Microsoft.EntityFrameworkCore.EntityState.Added || 
                           e.State == Microsoft.EntityFrameworkCore.EntityState.Modified);

            foreach (var entry in entries)
            {
                foreach (var property in entry.Properties)
                {
                    var value = property.CurrentValue;
                    
                    // Handle non-nullable DateTime
                    if (value is DateTime dt && dt.Kind == DateTimeKind.Local)
                    {
                        property.CurrentValue = dt.ToUniversalTime();
                        continue;
                    }
                    
                    // Handle nullable DateTime
                    var nullableDt = value as DateTime?;
                    if (nullableDt.HasValue && nullableDt.Value.Kind == DateTimeKind.Local)
                    {
                        property.CurrentValue = nullableDt.Value.ToUniversalTime();
                    }
                }
            }
        }
    }
}
