using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MyDrReferral.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddReferralAmountToUsers : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsPaid",
                table: "TblReffer",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "PatientVisitedDate",
                table: "TblReffer",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "PaymentDate",
                table: "TblReffer",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "ReferralAmount",
                table: "AspNetUsers",
                type: "numeric",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsPaid",
                table: "TblReffer");

            migrationBuilder.DropColumn(
                name: "PatientVisitedDate",
                table: "TblReffer");

            migrationBuilder.DropColumn(
                name: "PaymentDate",
                table: "TblReffer");

            migrationBuilder.DropColumn(
                name: "ReferralAmount",
                table: "AspNetUsers");
        }
    }
}
