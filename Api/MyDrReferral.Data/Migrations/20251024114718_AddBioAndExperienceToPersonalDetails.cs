using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MyDrReferral.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddBioAndExperienceToPersonalDetails : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Bio",
                table: "TblPersonalDetail",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Experience",
                table: "TblPersonalDetail",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Bio",
                table: "TblPersonalDetail");

            migrationBuilder.DropColumn(
                name: "Experience",
                table: "TblPersonalDetail");
        }
    }
}
