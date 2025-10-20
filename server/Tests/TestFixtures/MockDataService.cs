using BCrypt.Net;
using server.Models;
using System.Security.Claims;

namespace server.Tests.TestFixtures;

public static class MockDataService
{
    public static User CreateTestUser(string email = "test@example.com", bool verified = true)
    {
        return new User
        {
            Email = email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("TestPassword123!"),
            Verified = verified
        };
    }

    public static User CreateUnverifiedUser(string email = "unverified@example.com")
    {
        return new User
        {
            Email = email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("UnverifiedPassword123!"),
            Verified = false
        };
    }

    public static Board CreateTestBoard(int id = 1, string email = "test@example.com")
    {
        return new Board
        {
            Id = id,
            Title = $"Test Board {id}",
            CreatedAt = DateTime.UtcNow,
            TaskLists = new List<TaskList>()
        };
    }

    public static TaskList CreateTestTaskList(int id = 1, int boardId = 1)
    {
        return new TaskList
        {
            Id = id,
            Name = $"Test Task List {id}",
            Position = id - 1,
            Tasks = new List<server.Models.Task>(),
            BoardId = boardId
        };
    }

    public static server.Models.Task CreateTestTask(int id = 1, int taskListId = 1)
    {
        return new server.Models.Task
        {
            Id = id,
            Name = $"Test Task {id}",
            Position = id - 1,
            TaskListId = taskListId,
            Completed = false
        };
    }

    public static RefreshToken CreateTestRefreshToken(string email = "test@example.com", string? token = null)
    {
        return new RefreshToken
        {
            Email = email,
            Token = token ?? "test-refresh-token-" + Guid.NewGuid().ToString(),
            Expires = DateTime.UtcNow.AddDays(7),
            Revoked = false
        };
    }

    public static ClaimsPrincipal CreateTestUserPrincipal(string email = "test@example.com")
    {
        var claims = new[]
        {
            new Claim(ClaimTypes.Email, email),
            new Claim(ClaimTypes.Name, $"Test {email.Split('@')[0]}")
        };

        var identity = new ClaimsIdentity(claims, "TestAuth");
        return new ClaimsPrincipal(identity);
    }

    public static object CreateValidLoginRequest()
    {
        return new
        {
            Email = "test@example.com",
            Password = "TestPassword123!"
        };
    }

    public static object CreateValidRegisterRequest()
    {
        return new
        {
            Email = "newuser@example.com",
            Password = "NewUserPassword123!"
        };
    }

    public static object CreateValidForgotPasswordRequest()
    {
        return new
        {
            Email = "test@example.com"
        };
    }

    public static object CreateValidResetPasswordRequest()
    {
        return new
        {
            NewPassword = "NewPassword123!",
            Token = "valid-test-token"
        };
    }
}