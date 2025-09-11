using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace server.Migrations
{
    /// <inheritdoc />
    public partial class TaskAndTaskListContext : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Task_TaskList_TaskListId",
                table: "Task");

            migrationBuilder.DropForeignKey(
                name: "FK_TaskList_Boards_BoardId",
                table: "TaskList");

            migrationBuilder.DropPrimaryKey(
                name: "PK_TaskList",
                table: "TaskList");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Task",
                table: "Task");

            migrationBuilder.RenameTable(
                name: "TaskList",
                newName: "TaskLists");

            migrationBuilder.RenameTable(
                name: "Task",
                newName: "Tasks");

            migrationBuilder.RenameIndex(
                name: "IX_TaskList_BoardId",
                table: "TaskLists",
                newName: "IX_TaskLists_BoardId");

            migrationBuilder.RenameIndex(
                name: "IX_Task_TaskListId",
                table: "Tasks",
                newName: "IX_Tasks_TaskListId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_TaskLists",
                table: "TaskLists",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Tasks",
                table: "Tasks",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_TaskLists_Boards_BoardId",
                table: "TaskLists",
                column: "BoardId",
                principalTable: "Boards",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Tasks_TaskLists_TaskListId",
                table: "Tasks",
                column: "TaskListId",
                principalTable: "TaskLists",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_TaskLists_Boards_BoardId",
                table: "TaskLists");

            migrationBuilder.DropForeignKey(
                name: "FK_Tasks_TaskLists_TaskListId",
                table: "Tasks");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Tasks",
                table: "Tasks");

            migrationBuilder.DropPrimaryKey(
                name: "PK_TaskLists",
                table: "TaskLists");

            migrationBuilder.RenameTable(
                name: "Tasks",
                newName: "Task");

            migrationBuilder.RenameTable(
                name: "TaskLists",
                newName: "TaskList");

            migrationBuilder.RenameIndex(
                name: "IX_Tasks_TaskListId",
                table: "Task",
                newName: "IX_Task_TaskListId");

            migrationBuilder.RenameIndex(
                name: "IX_TaskLists_BoardId",
                table: "TaskList",
                newName: "IX_TaskList_BoardId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Task",
                table: "Task",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_TaskList",
                table: "TaskList",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Task_TaskList_TaskListId",
                table: "Task",
                column: "TaskListId",
                principalTable: "TaskList",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_TaskList_Boards_BoardId",
                table: "TaskList",
                column: "BoardId",
                principalTable: "Boards",
                principalColumn: "Id");
        }
    }
}
