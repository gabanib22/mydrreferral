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
                        if (prop.CurrentValue is DateTime dt && dt.Kind == DateTimeKind.Local)
                        {
                            prop.CurrentValue = dt.ToUniversalTime();
                        }
                        else if (prop.CurrentValue != null)
                        {
                            var nullableDt = prop.CurrentValue as DateTime?;
                            if (nullableDt != null && nullableDt.HasValue && nullableDt.Value.Kind == DateTimeKind.Local)
                            {
                                prop.CurrentValue = nullableDt.Value.ToUniversalTime();
                            }
                        }
                    }
                }
            }
        }
    }
}
