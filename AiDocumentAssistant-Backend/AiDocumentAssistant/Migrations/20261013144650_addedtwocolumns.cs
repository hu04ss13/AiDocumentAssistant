using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AiDocumentAssistant.Migrations
{
    /// <inheritdoc />
    public partial class addedtwocolumns : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AiSummary",
                table: "Documents",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "ExtractedKeywords",
                table: "Documents",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AiSummary",
                table: "Documents");

            migrationBuilder.DropColumn(
                name: "ExtractedKeywords",
                table: "Documents");
        }
    }
}
