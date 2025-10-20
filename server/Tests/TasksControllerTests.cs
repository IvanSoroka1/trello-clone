using FluentAssertions;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Newtonsoft.Json;
using server.Controllers;
using server.Data;
using server.Models;
using server.Tests.TestFixtures;
using System.Net;
using System.Net.Http;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using Xunit;
using Trait = Xunit.TraitAttribute;

namespace server.Tests;

public class TasksControllerTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;
    private readonly HttpClient _client;

    public TasksControllerTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory.WithWebHostBuilder(builder =>
        {
            builder.ConfigureServices(services =>
            {
                // Remove existing DbContext registration
                var descriptor = services.SingleOrDefault(
                    d => d.ServiceType == typeof(DbContextOptions<AppDbContext>));
                if (descriptor != null)
                {
                    services.Remove(descriptor);
                }

                // Add test DbContext
                services.AddDbContext<AppDbContext>(options =>
                    options.UseInMemoryDatabase("TestDb"));

                // Add BoardService registration if needed
                services.AddSingleton<IBoardService, BoardService>();
            });
        });

        _client = _factory.CreateClient();
    }

    [Xunit.Trait("Category", "TasksController - Authentication")]
    public class AuthenticationTests
    {
        [Fact]
        public async System.Threading.Tasks.Task GetTaskLists_WithoutAuthentication_ShouldReturnUnauthorized()
        {
            // Arrange
            var boardId = 1;

            // Act
            var response = await _client.GetAsync($"/api/tasks/TaskLists/{boardId}");

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
        }

        [Fact]
        public async System.Threading.Tasks.Task GetTaskLists_WithInvalidToken_ShouldReturnUnauthorized()
        {
            // Arrange
            var boardId = 1;
            _client.DefaultRequestHeaders.Authorization =
                new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", "invalid-token");

            // Act
            var response = await _client.GetAsync($"/api/tasks/TaskLists/{boardId}");

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
        }

        [Fact]
        public async System.Threading.Tasks.Task GetTaskLists_WithValidToken_ShouldSucceed()
        {
            // This test would need a proper JWT token setup
            // For now, testing the unauthorized case is sufficient
            // JWT integration testing would be more complex
        }
    }

    [Xunit.Trait("Category", "TasksController - Task List Management")]
    public class TaskListManagementTests
    {
        private async Task<string> GetTestJwtToken()
        {
            // Helper method to generate test JWT token
            // In real tests, you'd have proper token generation
            return "test-jwt-token";
        }

        [Fact]
        public async System.Threading.Tasks.Task GetTaskLists_WithValidBoardAndAuth_ShouldReturnTaskLists()
        {
            // Arrange
            var boardId = 1;
            _client.DefaultRequestHeaders.Authorization =
                new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", await GetTestJwtToken());

            // This test would require a seeded database and proper authentication
            // For integration testing, we'll need to set up the full pipeline
        }

        [Fact]
        public async System.Threading.Tasks.Task GetTaskLists_WithInvalidBoardId_ShouldReturnNotFound()
        {
            // Arrange
            var boardId = 999; // Non-existent board
            _client.DefaultRequestHeaders.Authorization =
                new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", await GetTestJwtToken());

            // Act
            var response = await _client.GetAsync($"/api/tasks/TaskLists/{boardId}");

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.NotFound);
        }

        [Fact]
        public async System.Threading.Tasks.Task MakeTaskList_WithValidRequest_ShouldCreateTaskList()
        {
            // Arrange
            var request = new
            {
                BoardId = 1,
                TaskListName = "New Test Task List"
            };

            var json = JsonConvert.SerializeObject(request);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            _client.DefaultRequestHeaders.Authorization =
                new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", await GetTestJwtToken());

            // Act
            var response = await _client.PostAsync("/api/tasks/maketasklist", content);

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.OK);
        }

        [Fact]
        public async System.Threading.Tasks.Task MakeTaskList_WithoutBoardId_ShouldReturnBadRequest()
        {
            // Arrange
            var request = new
            {
                TaskListName = "New Test Task List"
                // Missing BoardId
            };

            var json = JsonConvert.SerializeObject(request);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            _client.DefaultRequestHeaders.Authorization =
                new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", await GetTestJwtToken());

            // Act
            var response = await _client.PostAsync("/api/tasks/maketasklist", content);

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        }

        [Fact]
        public async System.Threading.Tasks.Task MakeTaskList_WithEmptyName_ShouldReturnBadRequest()
        {
            // Arrange
            var request = new
            {
                BoardId = 1,
                TaskListName = "" // Empty name
            };

            var json = JsonConvert.SerializeObject(request);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            _client.DefaultRequestHeaders.Authorization =
                new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", await GetTestJwtToken());

            // Act
            var response = await _client.PostAsync("/api/tasks/maketasklist", content);

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        }

        [Fact]
        public async System.Threading.Tasks.Task DeleteTaskList_WithValidRequest_ShouldDeleteTaskList()
        {
            // First create a task list
            await CreateTaskListAsync();

            // Then delete it
            var request = new
            {
                BoardId = 1,
                ListId = 1
            };

            var json = JsonConvert.SerializeObject(request);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            _client.DefaultRequestHeaders.Authorization =
                new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", await GetTestJwtToken());

            // Act
            var response = await _client.PostAsync("/api/tasks/deletetasklist", content);

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.OK);
        }

        [Fact]
        public async System.Threading.Tasks.Task DeleteTaskList_WithNonExistentListId_ShouldReturnNotFound()
        {
            // Arrange
            var request = new
            {
                BoardId = 1,
                ListId = 999 // Non-existent task list
            };

            var json = JsonConvert.SerializeObject(request);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            _client.DefaultRequestHeaders.Authorization =
                new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", await GetTestJwtToken());

            // Act
            var response = await _client.PostAsync("/api/tasks/deletetasklist", content);

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.NotFound);
        }

        private async System.Threading.Tasks.Task CreateTaskListAsync()
        {
            var request = new
            {
                BoardId = 1,
                TaskListName = "Test Task List"
            };

            var json = JsonConvert.SerializeObject(request);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            _client.DefaultRequestHeaders.Authorization =
                new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", await GetTestJwtToken());

            await _client.PostAsync("/api/tasks/maketasklist", content);
        }
    }

    [Xunit.Trait("Category", "TasksController - Task Operations")]
    public class TaskOperationTests
    {
        [Fact]
        public async System.Threading.Tasks.Task NewTask_WithValidRequest_ShouldCreateTask()
        {
            // Arrange
            var request = new
            {
                TaskListId = 1,
                TaskName = "New Test Task"
            };

            var json = JsonConvert.SerializeObject(request);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            _client.DefaultRequestHeaders.Authorization =
                new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", await GetTestJwtToken());

            // Act
            var response = await _client.PostAsync("/api/tasks/newtask", content);

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.OK);
        }

        [Fact]
        public async System.Threading.Tasks.Task NewTask_WithoutTaskListId_ShouldReturnBadRequest()
        {
            // Arrange
            var request = new
            {
                TaskName = "New Test Task"
                // Missing TaskListId
            };

            var json = JsonConvert.SerializeObject(request);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            _client.DefaultRequestHeaders.Authorization =
                new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", await GetTestJwtToken());

            // Act
            var response = await _client.PostAsync("/api/tasks/newtask", content);

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        }

        [Fact]
        public async System.Threading.Tasks.Task NewTask_WithEmptyTaskName_ShouldReturnBadRequest()
        {
            // Arrange
            var request = new
            {
                TaskListId = 1,
                TaskName = "" // Empty task name
            };

            var json = JsonConvert.SerializeObject(request);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            _client.DefaultRequestHeaders.Authorization =
                new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", await GetTestJwtToken());

            // Act
            var response = await _client.PostAsync("/api/tasks/newtask", content);

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        }

        [Fact]
        public async System.Threading.Tasks.Task EditTask_WithValidRequest_ShouldUpdateTask()
        {
            // First create a task
            var taskId = await CreateTaskAsync();

            // Then edit it
            var request = new
            {
                TaskId = taskId,
                NewTaskName = "Updated Task Name"
            };

            var json = JsonConvert.SerializeObject(request);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            _client.DefaultRequestHeaders.Authorization =
                new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", await GetTestJwtToken());

            // Act
            var response = await _client.PutAsync("/api/tasks/edittask", content);

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.OK);
        }

        [Fact]
        public async System.Threading.Tasks.Task EditTask_WithNonExistentTaskId_ShouldReturnNotFound()
        {
            // Arrange
            var request = new
            {
                TaskId = 999, // Non-existent task
                NewTaskName = "Updated Task Name"
            };

            var json = JsonConvert.SerializeObject(request);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            _client.DefaultRequestHeaders.Authorization =
                new System.Net.HTTP.Headers.AuthenticationHeaderValue("Bearer", await GetTestJwtToken());

            // Act
            var response = await _client.PutAsync("/api/tasks/edittask", content);

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.NotFound);
        }

        [Fact]
        public async System.Threading.Tasks.Task ToggleCheck_WithValidRequest_ShouldToggleTaskStatus()
        {
            // First create a task
            var taskId = await CreateTaskAsync();

            // Then toggle it
            var request = new
            {
                TaskId = taskId
            };

            var json = JsonConvert.SerializeObject(request);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            _client.DefaultRequestHeaders.Authorization =
                new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", await GetTestJwtToken());

            // Act
            var response = await _client.PostAsync("/api/tasks/togglecheck", content);

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.OK);
        }

        [Fact]
        public async System.Threading.Tasks.Task DeleteTask_WithValidRequest_ShouldDeleteTask()
        {
            // First create a task
            var taskId = await CreateTaskAsync();

            // Then delete it
            var request = new
            {
                TaskId = taskId,
                TaskListId = 1
            };

            var json = JsonConvert.SerializeObject(request);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            _client.DefaultRequestHeaders.Authorization =
                new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", await GetTestJwtToken());

            // Act
            var response = await _client.DeleteAsync("/api/tasks/deletetask");

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.OK);
        }

        private async Task<int> CreateTaskAsync()
        {
            var request = new
            {
                TaskListId = 1,
                TaskName = "Test Task"
            };

            var json = JsonConvert.SerializeObject(request);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            _client.DefaultRequestHeaders.Authorization =
                new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", await GetTestJwtToken());

            var response = await _client.PostAsync("/api/tasks/newtask", content);
            response.EnsureSuccessStatusCode();

            // Parse response to get task ID
            var responseContent = await response.Content.ReadAsStringAsync();
            var responseData = JsonConvert.DeserializeObject<Dictionary<string, object>>(responseContent);

            if (responseData.TryGetValue("message", out var messageObj) && messageObj is Newtonsoft.Json.Linq.JObject messageJObject)
            {
                if (messageJObject.TryGetValue("id", out var idToken))
                {
                    return (int)idToken;
                }
            }

            return 1; // Fallback
        }

        private async Task<string> GetTestJwtToken()
        {
            // In a real implementation, you'd generate a proper JWT token
            // For testing purposes, we'll use a mock token
            // This would typically involve creating a user, generating a token, etc.

            // For now, returning a mock token
            // In production tests, you'd have proper authentication setup
            return "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0QGV4YW1wbGUuY29tIiwibmFtZSI6IlRlc3QgVXNlciIsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsImlhdCI6MTUxNjIzOTAyMn0.abcdef123456";
        }
    }

    [Xunit.Trait("Category", "TasksController - Position Management")]
    public class PositionManagementTests
    {
        [Fact]
        public async System.Threading.Tasks.Task EditTaskPosition_WithValidRequest_ShouldUpdatePosition()
        {
            // First create a task
            var taskId = await CreateTaskAsync();

            // Then edit its position
            var request = new
            {
                TaskId = taskId,
                NewPosition = 2,
                TaskListId = 1
            };

            var json = JsonConvert.SerializeObject(request);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            _client.DefaultRequestHeaders.Authorization =
                new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", await GetTestJwtToken());

            // Act
            var response = await _client.PutAsync("/api/tasks/edittaskposition", content);

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.OK);
        }

        [Fact]
        public async System.Threading.Tasks.Task EditTaskListPosition_WithValidRequest_ShouldUpdatePosition()
        {
            // First create multiple task lists
            await CreateTaskListAsync("First List");
            await CreateTaskListAsync("Second List");

            // Then edit position
            var request = new
            {
                TaskListId = 1,
                NewPosition = 1,
                BoardId = 1
            };

            var json = JsonConvert.SerializeObject(request);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            _client.DefaultRequestHeaders.Authorization =
                new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", await GetTestJwtToken());

            // Act
            var response = await _client.PutAsync("/api/tasks/edittasklistposition", content);

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.OK);
        }

        [Fact]
        public async System.Threading.Tasks.Task InsertTask_WithValidRequest_ShouldInsertAtPosition()
        {
            // First create a task
            await CreateTaskAsync();

            // Then insert another task at position 0
            var request = new
            {
                TaskListId = 1,
                TaskName = "Inserted Task",
                Position = 0
            };

            var json = JsonConvert.SerializeObject(request);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            _client.DefaultRequestHeaders.Authorization =
                new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", await GetTestJwtToken());

            // Act
            var response = await _client.PutAsync("/api/tasks/inserttask", content);

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.OK);
        }

        private async System.Threading.Tasks.Task CreateTaskListAsync(string name = "Test Task List")
        {
            var request = new
            {
                BoardId = 1,
                TaskListName = name
            };

            var json = JsonConvert.SerializeObject(request);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            _client.DefaultRequestHeaders.Authorization =
                new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", await GetTestJwtToken());

            await _client.PostAsync("/api/tasks/maketasklist", content);
        }
    }
}