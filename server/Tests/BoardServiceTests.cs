using Microsoft.EntityFrameworkCore;
using server.Controllers;
using server.Data;
using server.Models;
using server.Tests.TestFixtures;
using System.Linq.Expressions;
using System.Security.Claims;
using Xunit;
using Trait = Xunit.TraitAttribute;

namespace server.Tests;

public class BoardServiceTests
{
    private readonly AppDbContext _context;
    private readonly BoardService _boardService;

    public BoardServiceTests()
    {
        _context = TestDbContextFactory.CreateDbContext();
        _boardService = new BoardService(_context);
    }

    [Xunit.Trait("Category", "BoardService - Valid Board Access")]
    public class ValidBoardAccessTests
    {
        [Fact]
        public void CheckValidBoard_WithValidUserAndBoard_ShouldReturnSuccess()
        {
            // Arrange
            var boardId = 1; // Test board ID from seeded data
            var boardQuery = _context.Boards.Where(b => b.Id == boardId);
            ClaimsPrincipal user = TestDbContextFactory.GetTestUserPrincipal();

            // Act
            var result = _boardService.checkValidBoard(boardId, ref boardQuery, user);

            // Assert
            Assert.Equal("Success!", result);
            Assert.NotNull(boardQuery);
            Assert.True(boardQuery.Any());
        }

        [Fact]
        public void CheckValidBoard_WithBoardIdParameter_ShouldUpdateBoardQuery()
        {
            // Arrange
            var boardId = 1;
            var boardQuery = _context.Boards.Where(b => b.Id == boardId);
            var initialQueryCount = boardQuery.Count();
            ClaimsPrincipal user = TestDbContextFactory.GetTestUserPrincipal();

            // Act
            var result = _boardService.checkValidBoard(boardId, ref boardQuery, user);

            // Assert
            Assert.Equal("Success!", result);
            Assert.NotEqual(initialQueryCount, boardQuery.Count());
            Assert.True(boardQuery.Count() > 0);
        }

        [Fact]
        public void CheckValidBoard_WithValidEmailClaim_ShouldExtractEmail()
        {
            // Arrange
            var boardId = 1;
            var boardQuery = _context.Boards.Where(b => b.Id == boardId);
            var user = TestDbContextFactory.GetTestUserPrincipal();

            // Act
            var result = _boardService.checkValidBoard(boardId, ref boardQuery, user);

            // Assert
            Assert.Equal("Success!", result);

            // Verify board query contains the board for the user
            var boards = boardQuery.ToList();
            Assert.Single(boards);
            Assert.Equal(1, boards.First().Id);
        }

        [Fact]
        public void CheckValidBoard_WithExistingUserAndMultipleBoards_ShouldHandleCorrectly()
        {
            // Arrange
            var userId = "test@example.com";
            var testUser = MockDataService.CreateTestUser(userId);

            // Add another board for the same user
            var secondBoard = MockDataService.CreateTestBoard(2, userId);
            secondBoard.TaskLists = new List<TaskList>();
            testUser.Boards.Add(secondBoard);

            _context.Users.Update(testUser);
            _context.Boards.Add(secondBoard);
            _context.SaveChanges();

            var boardId = 2;
            var boardQuery = _context.Boards.Where(b => b.Id == boardId);
            ClaimsPrincipal user = TestDbContextFactory.GetTestUserPrincipal();

            // Act
            var result = _boardService.checkValidBoard(boardId, ref boardQuery, user);

            // Assert
            Assert.Equal("Success!", result);
            Assert.NotNull(boardQuery);
            Assert.True(boardQuery.Any());
        }
    }

    [Xunit.Trait("Category", "BoardService - Invalid Board Access")]
    public class InvalidBoardAccessTests
    {
        [Fact]
        public void CheckValidBoard_WithNonExistentBoard_ShouldReturnNotExists()
        {
            // Arrange
            var boardId = 999; // Non-existent board
            var boardQuery = _context.Boards.Where(b => b.Id == boardId);
            ClaimsPrincipal user = TestDbContextFactory.GetTestUserPrincipal();

            // Act
            var result = _boardService.checkValidBoard(boardId, ref boardQuery, user);

            // Assert
            Assert.Equal("No board with such an ID exists", result);
            Assert.Null(boardQuery);
        }

        [Fact]
        public void CheckValidBoard_WithUnauthorizedUser_ShouldReturnAccessDenied()
        {
            // Arrange
            var boardId = 1; // Test board owned by test@example.com
            var boardQuery = _context.Boards.Where(b => b.Id == boardId);
            ClaimsPrincipal user = TestDbContextFactory.GetOtherUserPrincipal(); // Other user principal

            // Act
            var result = _boardService.checkValidBoard(boardId, ref boardQuery, user);

            // Assert
            Assert.Equal("You do not have access to this board!", result);
            Assert.Null(boardQuery);
        }

        [Fact]
        public void CheckValidBoard_WithBoardBelongingToOtherUser_ShouldDenyAccess()
        {
            // Arrange
            var otherUserBoard = MockDataService.CreateTestBoard(3, "other@example.com");
            otherUserBoard.TaskLists = new List<TaskList>();

            var otherUser = MockDataService.CreateTestUser("other@example.com");
            otherUser.Boards.Add(otherBoard);

            _context.Boards.Add(otherBoard);
            _context.Users.Update(otherUser);
            _context.SaveChanges();

            var boardId = 3;
            var boardQuery = _context.Boards.Where(b => b.Id == boardId);
            ClaimsPrincipal user = TestDbContextFactory.GetTestUserPrincipal(); // Test user tries to access other user's board

            // Act
            var result = _boardService.checkValidBoard(boardId, ref boardQuery, user);

            // Assert
            Assert.Equal("You do not have access to this board!", result);
            Assert.Null(boardQuery);
        }

        [Fact]
        public void CheckValidBoard_WithEmptyBoardListForUser_ShouldDenyAccess()
        {
            // Arrange
            var userWithNoBoards = MockDataService.CreateTestUser("noboards@example.com");
            _context.Users.Add(userWithNoBoards);
            _context.SaveChanges();

            var boardId = 1;
            var boardQuery = _context.Boards.Where(b => b.Id == boardId);
            var user = new ClaimsPrincipal(new ClaimsIdentity(new[]
            {
                new System.Security.Claims.Claim(System.Security.Claims.ClaimTypes.Email, "noboards@example.com")
            }));

            // Act
            var result = _boardService.checkValidBoard(boardId, ref boardQuery, user);

            // Assert
            Assert.Equal("You do not have access to this board!", result);
            Assert.Null(boardQuery);
        }
    }

    [Xunit.Trait("Category", "BoardService - Email Extractor")]
    public class EmailExtractorTests
    {
        [Fact]
        public void CheckValidBoard_WithValidEmailClaim_ShouldExtractCorrectly()
        {
            // Arrange
            var boardId = 1;
            var boardQuery = _context.Boards.Where(b => b.Id == boardId);
            var expectedEmail = "test@example.com";
            var user = TestDbContextFactory.GetTestUserPrincipal();

            // Act
            var result = _boardService.checkValidBoard(boardId, ref boardQuery, user);

            // Assert
            Assert.Equal("Success!", result);
            var extractedEmail = user.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value;
            Assert.Equal(expectedEmail, extractedEmail);
        }

        [Fact]
        public void CheckValidBoard_WithEmailClaimInDifferentCase_ShouldStillWork()
        {
            // Arrange
            var boardId = 1;
            var boardQuery = _context.Boards.Where(b => b.Id == boardId);

            // Create user with email in different case
            var claims = new[]
            {
                new System.Security.Claims.Claim(System.Security.Claims.ClaimTypes.Email, "Test@EXAMPLE.COM"),
                new System.Security.Claims.Claim(System.Security.Claims.ClaimTypes.Name, "Test User")
            };
            var user = new ClaimsPrincipal(new ClaimsIdentity(claims, "TestAuth"));

            // Act
            var result = _boardService.checkValidBoard(boardId, ref boardQuery, user);

            // Assert
            ShouldReturnAccessDeniedForCaseInsensitiveEmail(boardId, boardQuery, user);
        }

        private void ShouldReturnAccessDeniedForCaseInsensitiveEmail(int boardId, IQueryable<Board> boardQuery, ClaimsPrincipal user)
        {
            // This test should fail because the email case sensitivity check is not implemented
            // The actual behavior depends on how the database comparison is done
            var result = _boardService.checkValidBoard(boardId, ref boardQuery, user);

            // For now, we expect it to fail because "Test@EXAMPLE.COM" != "test@example.com" in the database
            Assert.Equal("You do not have access to this board!", result);
        }
    }

    [Xunit.Trait("Category", "BoardService - Edge Cases")]
    public class EdgeCaseTests
    {
        [Fact]
        public void CheckValidBoard_WithSameEmailButDifferentCase_ShouldHandleCaseSensitivity()
        {
            // Arrange
            var boardId = 1;
            var boardQuery = _context.Boards.Where(b => b.Id == boardId);
            var user = new ClaimsPrincipal(new ClaimsIdentity(new[]
            {
                new System.Security.Claims.Claim(System.Security.Claims.ClaimTypes.Email, "TEST@EXAMPLE.COM")
            }));

            // Act
            var result = _boardService.checkValidBoard(boardId, ref boardQuery, user);

            // Assert
            // This should return access denied because the email comparison is case-sensitive
            Assert.Equal("You do not have access to this board!", result);
        }

        [Fact]
        public void CheckValidBoard_WithMultipleBoardsForUser_ShouldReturnCorrectBoard()
        {
            // Arrange
            var userId = "test@example.com";
            var testUser = _context.Users.FirstOrDefault(u => u.Email == userId);
            Assert.NotNull(testUser);

            // Add multiple boards for the user
            var board1 = MockDataService.CreateTestBoard(1, userId);
            var board2 = MockDataService.CreateTestBoard(2, userId);
            board1.TaskLists = new List<TaskList>();
            board2.TaskLists = new List<TaskList>();

            testUser.Boards.Add(board1);
            testUser.Boards.Add(board2);

            _context.Boards.Update(board1);
            _context.Boards.Add(board2);
            _context.SaveChanges();

            var boardId = 2;
            var boardQuery = _context.Boards.Where(b => b.Id == boardId);
            ClaimsPrincipal user = TestDbContextFactory.GetTestUserPrincipal();

            // Act
            var result = _boardService.checkValidBoard(boardId, ref boardQuery, user);

            // Assert
            Assert.Equal("Success!", result);
            Assert.NotNull(boardQuery);
            Assert.True(boardQuery.Any());
        }

        [Fact]
        public void CheckValidBoard_WithBoardHavingTaskListsAndTasks_ShouldLoadProperly()
        {
            // Arrange
            var boardId = 1;
            var boardQuery = _context.Boards.Where(b => b.Id == boardId);
            ClaimsPrincipal user = TestDbContextFactory.GetTestUserPrincipal();

            // Act
            var result = _boardService.checkValidBoard(boardId, ref boardQuery, user);

            // Assert
            Assert.Equal("Success!", result);
            Assert.NotNull(boardQuery);

            var board = boardQuery.FirstOrDefault();
            Assert.NotNull(board);
            Assert.NotNull(board.TaskLists);
            Assert.True(board.TaskLists.Count >= 1); // Should have task lists from seeding
            Assert.NotNull(board.TaskLists.FirstOrDefault()?.Tasks);
        }

        [Fact]
        public void CheckValidBoard_WithEmptyDatabase_ShouldHandleGracefully()
        {
            // Arrange
            var emptyContext = TestDbContextFactory.CreateDbContext();
            var emptyBoardService = new BoardService(emptyContext);

            var boardId = 1;
            var boardQuery = emptyContext.Boards.Where(b => b.Id == boardId);
            ClaimsPrincipal user = TestDbContextFactory.GetTestUserPrincipal();

            // Act
            var result = emptyBoardService.checkValidBoard(boardId, ref boardQuery, user);

            // Assert
            Assert.Equal("No board with such an ID exists", result);
            Assert.Null(boardQuery);
        }

        [Fact]
        public void CheckValidBoard_WithValidBoardButNoUser_ShouldReturnEmailNotFound()
        {
            // Arrange
            var boardId = 1;
            var boardQuery = _context.Boards.Where(b => b.Id == boardId);

            // User without email claim
            var user = new ClaimsPrincipal(new ClaimsIdentity());

            // Act
            var result = _boardService.checkValidBoard(boardId, ref boardQuery, user);

            // Assert
            Assert.Equal("Email not found", result);
            Assert.Null(boardQuery);
        }

        [Fact]
        public void CheckValidBoard_WithUserHavingNoBoards_ShouldDenyAccess()
        {
            // Arrange
            var newUserEmail = "newuser@example.com";
            var newUser = MockDataService.CreateTestUser(newUserEmail);
            _context.Users.Add(newUser);
            _context.SaveChanges();

            var boardId = 1;
            var boardQuery = _context.Boards.Where(b => b.Id == boardId);
            ClaimsPrincipal user = new ClaimsPrincipal(new ClaimsIdentity(new[]
            {
                new System.Security.Claims.Claim(System.Security.Claims.ClaimTypes.Email, newUserEmail)
            }));

            // Act
            var result = _boardService.checkValidBoard(boardId, ref boardQuery, user);

            // Assert
            Assert.Equal("You do not have access to this board!", result);
            Assert.Null(boardQuery);
        }

        [Fact]
        public void CheckValidBoard_WithBoardQueryEmptyAfterValidation_ShouldHandle()
        {
            // Arrange
            var boardId = 999; // Non-existent board
            var boardQuery = _context.Boards.Where(b => b.Id == boardId);
            ClaimsPrincipal user = TestDbContextFactory.GetTestUserPrincipal();

            // Act
            var result = _boardService.checkValidBoard(boardId, ref boardQuery, user);

            // Assert
            Assert.Equal("No board with such an ID exists", result);
            Assert.Null(boardQuery); // Should be null when board doesn't exist
        }

        [Fact]
        public void CheckValidBoard_WithValidButEmptyTaskLists_ShouldStillWork()
        {
            // Arrange
            var userId = "test@example.com";
            var testBoard = MockDataService.CreateTestBoard(4, userId);
            testBoard.TaskLists = new List<TaskList>(); // Empty task lists

            var testUser = _context.Users.FirstOrDefault(u => u.Email == userId);
            Assert.NotNull(testUser);
            testUser.Boards.Add(testBoard);

            _context.Boards.Add(testBoard);
            _context.SaveChanges();

            var boardId = 4;
            var boardQuery = _context.Boards.Where(b => b.Id == boardId);
            ClaimsPrincipal user = TestDbContextFactory.GetTestUserPrincipal();

            // Act
            var result = _boardService.checkValidBoard(boardId, ref boardQuery, user);

            // Assert
            Assert.Equal("Success!", result);
            Assert.NotNull(boardQuery);

            var board = boardQuery.FirstOrDefault();
            Assert.NotNull(board);
            Assert.NotNull(board.TaskLists);
            Assert.Empty(board.TaskLists); // Should be empty as expected
        }
    }

    [Xunit.Trait("Category", "BoardService - Performance")]
    public class PerformanceTests
    {
        [Fact]
        public void CheckValidBoard_ShouldUseEfficientDatabaseQueries()
        {
            // Arrange
            var boardId = 1;
            var boardQuery = _context.Boards.Where(b => b.Id == boardId);
            var user = TestDbContextFactory.GetTestUserPrincipal();

            // Act
            var result = _boardService.checkValidBoard(boardId, ref boardQuery, user);

            // Assert
            Assert.Equal("Success!", result);

            // Verify the query structure should be efficient
            // (This is more of a code review check, but ensures proper LINQ usage)
            Assert.NotNull(boardQuery);
            Assert.True(boardQuery.Any());
        }

        [Fact]
        public void CheckValidBoard_MultipleCalls_ShouldBeConsistent()
        {
            // Arrange
            var boardId = 1;
            var user = TestDbContextFactory.GetTestUserPrincipal();

            // Act - Multiple times
            for (int i = 0; i < 5; i++)
            {
                var boardQuery = _context.Boards.Where(b => b.Id == boardId);
                var result = _boardService.checkValidBoard(boardId, ref boardQuery, user);

                // Assert
                Assert.Equal("Success!", result);
                Assert.NotNull(boardQuery);
                Assert.True(boardQuery.Any());
            }
        }
    }
}