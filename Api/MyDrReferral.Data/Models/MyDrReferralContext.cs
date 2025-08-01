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

//    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
//#warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see http://go.microsoft.com/fwlink/?LinkId=723263.
//        => optionsBuilder.UseSqlServer("Server=DESKTOP-HEJPL69\\MSSQLSERVER2019;Database=MyDrReferral;UID=sa;PWD=123;TrustServerCertificate=true;");

    //protected override void OnModelCreating(ModelBuilder modelBuilder)
    //{
    //    modelBuilder.Entity<AspNetRole>(entity =>
    //    {
    //        entity.HasKey(e => e.Id).HasName("PK__AspNetRo__3214EC0716C8BBA8");

    //        entity.Property(e => e.Name).HasMaxLength(256);
    //        entity.Property(e => e.NormalizedName).HasMaxLength(256);
    //    });

    //    modelBuilder.Entity<AspNetUser>(entity =>
    //    {
    //        entity.HasKey(e => e.Id).HasName("PK__AspNetUs__3214EC07E1128149");

    //        entity.Property(e => e.CreatedOn).HasColumnType("datetime");
    //        entity.Property(e => e.Email).HasMaxLength(256);
    //        entity.Property(e => e.FirstName).HasMaxLength(150);
    //        entity.Property(e => e.IsActive).HasDefaultValueSql("('TRUE')");
    //        entity.Property(e => e.IsDelete).HasDefaultValueSql("('FALSE')");
    //        entity.Property(e => e.LastName).HasMaxLength(150);
    //        entity.Property(e => e.NormalizedEmail).HasMaxLength(256);
    //        entity.Property(e => e.NormalizedUserName).HasMaxLength(256);
    //        entity.Property(e => e.UserId).ValueGeneratedOnAdd();
    //        entity.Property(e => e.UserName).HasMaxLength(256);

    //        entity.HasMany(d => d.Roles).WithMany(p => p.Users)
    //            .UsingEntity<Dictionary<string, object>>(
    //                "AspNetUserRole",
    //                r => r.HasOne<AspNetRole>().WithMany()
    //                    .HasForeignKey("RoleId")
    //                    .OnDelete(DeleteBehavior.ClientSetNull)
    //                    .HasConstraintName("FK_UserRoles_Roles"),
    //                l => l.HasOne<AspNetUser>().WithMany()
    //                    .HasForeignKey("UserId")
    //                    .OnDelete(DeleteBehavior.ClientSetNull)
    //                    .HasConstraintName("FK_UserRoles_Users"),
    //                j =>
    //                {
    //                    j.HasKey("UserId", "RoleId").HasName("PK__AspNetUs__AF2760AD7235A06B");
    //                    j.ToTable("AspNetUserRoles");
    //                });
    //    });

    //    modelBuilder.Entity<AspNetUserClaim>(entity =>
    //    {
    //        entity.HasKey(e => e.Id).HasName("PK__AspNetUs__3214EC07C1C5111C");

    //        entity.Property(e => e.UserId).HasMaxLength(450);

    //        entity.HasOne(d => d.User).WithMany(p => p.AspNetUserClaims)
    //            .HasForeignKey(d => d.UserId)
    //            .HasConstraintName("FK_UserClaims_Users");
    //    });

    //    modelBuilder.Entity<AspNetUserLogin>(entity =>
    //    {
    //        entity.HasKey(e => new { e.LoginProvider, e.ProviderKey }).HasName("PK__AspNetUs__2B2C5B524F74899A");

    //        entity.Property(e => e.LoginProvider).HasMaxLength(128);
    //        entity.Property(e => e.ProviderKey).HasMaxLength(128);
    //        entity.Property(e => e.UserId).HasMaxLength(450);

    //        entity.HasOne(d => d.User).WithMany(p => p.AspNetUserLogins)
    //            .HasForeignKey(d => d.UserId)
    //            .HasConstraintName("FK_UserLogins_Users");
    //    });

    //    modelBuilder.Entity<AspNetUserToken>(entity =>
    //    {
    //        entity.HasKey(e => new { e.UserId, e.LoginProvider, e.Name }).HasName("PK__AspNetUs__8CC498410DEE8FF9");

    //        entity.Property(e => e.LoginProvider).HasMaxLength(128);
    //        entity.Property(e => e.Name).HasMaxLength(128);

    //        entity.HasOne(d => d.User).WithMany(p => p.AspNetUserTokens)
    //            .HasForeignKey(d => d.UserId)
    //            .OnDelete(DeleteBehavior.ClientSetNull)
    //            .HasConstraintName("FK_UserTokens_Users");
    //    });

    //    modelBuilder.Entity<ErrorLog>(entity =>
    //    {
    //        entity.Property(e => e.CreatedBy).HasMaxLength(50);
    //        entity.Property(e => e.CreatedOn).HasColumnType("datetime");
    //        entity.Property(e => e.Subject).HasMaxLength(300);
    //    });

    //    modelBuilder.Entity<TblAddress>(entity =>
    //    {
    //        entity.ToTable("tblAddress");

    //        entity.Property(e => e.Address1)
    //            .HasMaxLength(300)
    //            .HasColumnName("address1");
    //        entity.Property(e => e.Address2)
    //            .HasMaxLength(300)
    //            .HasColumnName("address2");
    //        entity.Property(e => e.City)
    //            .HasMaxLength(50)
    //            .HasColumnName("city");
    //        entity.Property(e => e.District)
    //            .HasMaxLength(50)
    //            .HasColumnName("district");
    //        entity.Property(e => e.EstablishedOn).HasColumnType("date");
    //        entity.Property(e => e.FirmName).HasMaxLength(100);
    //        entity.Property(e => e.IsActive)
    //            .IsRequired()
    //            .HasDefaultValueSql("((1))")
    //            .HasColumnName("isActive");
    //        entity.Property(e => e.IsDelete).HasColumnName("isDelete");
    //        entity.Property(e => e.IsHome)
    //            .IsRequired()
    //            .HasDefaultValueSql("((1))")
    //            .HasColumnName("isHome");
    //        entity.Property(e => e.Lat)
    //            .HasColumnType("decimal(8, 6)")
    //            .HasColumnName("lat");
    //        entity.Property(e => e.Long)
    //            .HasColumnType("decimal(9, 6)")
    //            .HasColumnName("long");
    //        entity.Property(e => e.PostalCode)
    //            .HasMaxLength(50)
    //            .HasColumnName("postalCode");
    //        entity.Property(e => e.State)
    //            .HasMaxLength(50)
    //            .HasColumnName("state");
    //    });

    //    modelBuilder.Entity<TblConnection>(entity =>
    //    {
    //        entity.ToTable("tblConnections");

    //        entity.Property(e => e.CreatedDate).HasColumnType("datetime");
    //        entity.Property(e => e.LastUpdateDate).HasColumnType("datetime");
    //    });

    //    modelBuilder.Entity<TblPersonalDetail>(entity =>
    //    {
    //        entity.ToTable("tblPersonalDetail");

    //        entity.Property(e => e.Anniversary).HasColumnType("date");
    //        entity.Property(e => e.BirthDate).HasColumnType("date");
    //        entity.Property(e => e.Degrees).HasMaxLength(500);
    //        entity.Property(e => e.PhotoUrl).HasMaxLength(200);
    //        entity.Property(e => e.Services).HasMaxLength(500);
    //    });

    //    modelBuilder.Entity<TblReffer>(entity =>
    //    {
    //        entity.ToTable("tblReffer");

    //        entity.Property(e => e.AcceptedDate).HasColumnType("datetime");
    //        entity.Property(e => e.Notes).HasMaxLength(500);
    //        entity.Property(e => e.RrlfDate).HasColumnType("datetime");
    //    });

    //    OnModelCreatingPartial(modelBuilder);
    //}

    //partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
