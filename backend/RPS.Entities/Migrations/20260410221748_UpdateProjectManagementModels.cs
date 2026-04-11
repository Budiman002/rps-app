using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RPS.Entities.Migrations
{
    /// <inheritdoc />
    public partial class UpdateProjectManagementModels : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "MemberChangesJson",
                table: "ChangeRequests",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RoleChangesJson",
                table: "ChangeRequests",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "MemberChangesJson",
                table: "ChangeRequests");

            migrationBuilder.DropColumn(
                name: "RoleChangesJson",
                table: "ChangeRequests");
        }
    }
}
