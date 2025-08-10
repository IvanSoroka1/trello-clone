using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace server.Migrations
{
    /// <inheritdoc />
    public partial class MakeEmailPrimaryKey : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_TodoTasks_Users_UserId",
                table: "TodoTasks");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Users",
                table: "Users");

            migrationBuilder.DropIndex(
                name: "IX_TodoTasks_UserId",
                table: "TodoTasks");

            migrationBuilder.DropColumn(
                name: "Id",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "Username",
                table: "Users");

            migrationBuilder.AddColumn<string>(
                name: "UserEmail",
                table: "TodoTasks",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Users",
                table: "Users",
                column: "Email");

            migrationBuilder.CreateIndex(
                name: "IX_TodoTasks_UserEmail",
                table: "TodoTasks",
                column: "UserEmail");

            migrationBuilder.AddForeignKey(
                name: "FK_TodoTasks_Users_UserEmail",
                table: "TodoTasks",
                column: "UserEmail",
                principalTable: "Users",
                principalColumn: "Email",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_TodoTasks_Users_UserEmail",
                table: "TodoTasks");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Users",
                table: "Users");

            migrationBuilder.DropIndex(
                name: "IX_TodoTasks_UserEmail",
                table: "TodoTasks");

            migrationBuilder.DropColumn(
                name: "UserEmail",
                table: "TodoTasks");

            migrationBuilder.AddColumn<int>(
                name: "Id",
                table: "Users",
                type: "integer",
                nullable: false,
                defaultValue: 0)
                .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

            migrationBuilder.AddColumn<string>(
                name: "Username",
                table: "Users",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Users",
                table: "Users",
                column: "Id");

            migrationBuilder.CreateIndex(
                name: "IX_TodoTasks_UserId",
                table: "TodoTasks",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_TodoTasks_Users_UserId",
                table: "TodoTasks",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
