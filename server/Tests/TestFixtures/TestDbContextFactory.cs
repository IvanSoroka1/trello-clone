using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.InMemory;
using server.Data;
using server.Models;
using System.Security.Claims;

namespace server.Tests.TestFixtures;

public class TestDbContextFactory
{
    public static AppDbContext CreateDbContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        var context = new AppDbContext(options);

        // Seed test data
        SeedTestData(context);

        return context;
    }

    private static void SeedTestData(AppDbContext context)
    {
        // Test user
        var testUser = new User
        {
            Email = "test@example.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("TestPassword123!"),
            Verified = true
        };

        // Another user for testing unauthorized access
        var otherUser = new User
        {
            Email = "other@example.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("OtherPassword123!"),
            Verified = true
        };

        // Test board for the first user
        var testBoard = new Board
        {
            Id = 1,
            Title = "Test Board",
            CreatedAt = DateTime.UtcNow,
            TaskLists = new List<TaskList>()
        };

        // Test task list
        var testTaskList = new TaskList
        {
            Id = 1,
            Name = "Test Task List",
            Position = 0,
            Tasks = new List<server.Models.Task>(),
            BoardId = 1
        };

        // Test task
        var testTask = new server.Models.Task
        {
            Id = 1,
            Name = "Test Task",
            Position = 0,
            TaskListId = 1,
            Completed = false
        };

        // Add relationships
        testUser.Boards.Add(testBoard);
        testBoard.TaskLists.Add(testTaskList);
        testTaskList.Tasks.Add(testTask);

        context.Users.AddRange(testUser, otherUser);
        context.Boards.Add(testBoard);
        context.TaskLists.Add(testTaskList);
        context.Tasks.Add(testTask);

        // Test refresh tokens
        var refreshToken = new RefreshToken
        {
            Email = testUser.Email,
            Token = "test-refresh-token-123",
            Expires = DateTime.UtcNow.AddDays(7),
            Revoked = false
        };

        context.RefreshTokens.Add(refreshToken);

        context.SaveChanges();
    }

    public static ClaimsPrincipal GetTestUserPrincipal()
    {
        var claims = new[]
        {
            new Claim(ClaimTypes.Email, "test@example.com"),
            new Claim(ClaimTypes.Name, "Test User")
        };

        var identity = new ClaimsIdentity(claims, "TestAuth");
        return new ClaimsPrincipal(identity);
    }

    public static ClaimsPrincipal GetOtherUserPrincipal()
    {
        var claims = new[]
        {
            new Claim(ClaimTypes.Email, "other@example.com"),
            new Claim(ClaimTypes.Name, "Other User")
        };

        var identity = new ClaimsIdentity(claims, "TestAuth");
        return new ClaimsPrincipal(identity);
    }
}