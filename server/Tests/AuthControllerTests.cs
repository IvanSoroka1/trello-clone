using Microsoft.AspNetCore.Mvc;
using Moq;
using server.Controllers;
using server.Data;
using server.Models;
using server.Tests.TestFixtures;
using server.Tests.Utilities;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Xunit;

namespace server.Tests;

public class AuthControllerTests
{
    private readonly AuthController _controller;
    private readonly AppDbContext _context;
    private readonly SecretsService _secretsService;

    public AuthControllerTests()
    {
        _context = TestDbContextFactory.CreateDbContext();
        _secretsService = new SecretsService(
            "test-secret-key-for-testing-purposes-only-123456789",
            "test-email-password",
            "test@example.com"
        );
        _controller = new AuthController(_context, _secretsService);
    }

    [Xunit.Trait("Category", "AuthController - Registration")]
    public class RegistrationTests
    {
        private readonly AuthController _controller;
        private readonly AppDbContext _context;
        private readonly SecretsService _secretsService;

        public RegistrationTests()
        {
            _context = TestDbContextFactory.CreateDbContext();
            _secretsService = new SecretsService(
                "test-secret-key-for-testing-purposes-only-123456789",
                "test-email-password",
                "test@example.com"
            );
            _controller = new AuthController(_context, _secretsService);
        }

        [Fact]
        public async System.Threading.Tasks.Task Register_WithValidData_ShouldReturnSuccessAndCreateUser()
        {
            // Arrange
            var request = MockDataService.CreateValidRegisterRequest();
            request.Email = "newuser@example.com";

            // Act
            var result = await _controller.Register(request);

            // Assert
            AssertExtensions.AssertOkResult(result);
            var user = _context.Users.FirstOrDefault(u => u.Email == request.Email);
            Assert.NotNull(user);
            Assert.Equal(request.Email, user.Email);
            Assert.Equal("newuser@example.com", user.Email);
            Assert.False(user.Verified);
        }

        [Fact]
        public async System.Threading.Tasks.Task Register_WithDuplicateEmail_ShouldReturnBadRequest()
        {
            // Arrange
            var existingUser = _context.Users.FirstOrDefault(u => u.Email == "test@example.com");
            Assert.NotNull(existingUser);

            var request = MockDataService.CreateValidRegisterRequest();
            request.Email = "test@example.com";

            // Act
            var result = await _controller.Register(request);

            // Assert
            AssertExtensions.AssertBadRequestResult(result, "EMAIL_EXISTS");
        }

        [Fact]
        public async System.Threading.Tasks.Task Register_WithValidEmailFormat_ShouldCreateUser()
        {
            // Arrange
            var request = MockDataService.CreateValidRegisterRequest();
            request.Email = "test.user+alias@example.com";

            // Act
            var result = await _controller.Register(request);

            // Assert
            AssertExtensions.AssertOkResult(result);
            var user = _context.Users.FirstOrDefault(u => u.Email == request.Email);
            Assert.NotNull(user);
            TestHelper.AssertValidEmailFormat(user.Email);
        }

        [Fact]
        public async System.Threading.Tasks.Task Register_WithStrongPassword_ShouldHashPasswordProperly()
        {
            // Arrange
            var request = MockDataService.CreateValidRegisterRequest();
            request.Password = "StrongPass123!@#";

            // Act
            var result = await _controller.Register(request);

            // Assert
            AssertExtensions.AssertOkResult(result);
            var user = _context.Users.FirstOrDefault(u => u.Email == request.Email);
            Assert.NotNull(user);
            Assert.NotEqual(request.Password, user.PasswordHash); // Hash should be different
            Assert.True(BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash));
        }
    }

    [Xunit.Trait("Category", "AuthController - Login")]
    public class LoginTests
    {
        private readonly AuthController _controller;
        private readonly AppDbContext _context;
        private readonly SecretsService _secretsService;

        public LoginTests()
        {
            _context = TestDbContextFactory.CreateDbContext();
            _secretsService = new SecretsService(
                "test-secret-key-for-testing-purposes-only-123456789",
                "test-email-password",
                "test@example.com"
            );
            _controller = new AuthController(_context, _secretsService);

            // Ensure test user exists and is verified
            var testUser = _context.Users.FirstOrDefault(u => u.Email == "test@example.com");
            if (testUser != null && !testUser.Verified)
            {
                testUser.Verified = true;
                _context.SaveChanges();
            }
        }

        [Fact]
        public async System.Threading.Tasks.Task Login_WithValidCredentials_ShouldReturnSuccessAndSetCookies()
        {
            // Arrange
            var request = MockDataService.CreateValidLoginRequest();

            // Act
            var result = await _controller.Login(request);

            // Assert
            AssertExtensions.AssertOkResult(result);

            // Check if cookies were set
            var response = result as OkObjectResult;
            Assert.NotNull(response);
            Assert.NotNull(response.HttpContext.Response.Cookies);
        }

        [Fact]
        public async System.Threading.Tasks.Task Login_WithNonExistentEmail_ShouldReturnBadRequest()
        {
            // Arrange
            var request = MockDataService.CreateValidLoginRequest();
            request.Email = "nonexistent@example.com";
            request.Password = "SomePassword123!";

            // Act
            var result = await _controller.Login(request);

            // Assert
            AssertExtensions.AssertBadRequestResult(result, "No account with such an email exists");
        }

        [Fact]
        public async System.Threading.Tasks.Task Login_WithIncorrectPassword_ShouldReturnBadRequest()
        {
            // Arrange
            var request = MockDataService.CreateValidLoginRequest();
            request.Password = "WrongPassword123!";

            // Act
            var result = await _controller.Login(request);

            // Assert
            AssertExtensions.AssertBadRequestResult(result, "Incorrect password");
        }

        [Fact]
        public async System.Threading.Tasks.Task Login_WithUnverifiedAccount_ShouldRequestVerification()
        {
            // Arrange
            var unverifiedUser = MockDataService.CreateUnverifiedUser();
            _context.Users.Add(unverifiedUser);
            _context.SaveChanges();

            var request = new AuthController.LoginRequest
            {
                Email = unverifiedUser.Email,
                Password = "UnverifiedPassword123!"
            };

            // Act
            var result = await _controller.Login(request);

            // Assert
            AssertExtensions.AssertBadRequestResult(result, "Please verify your email");
        }

        [Fact]
        public async System.Threading.Tasks.Task Login_ShouldUpdateExistingRefreshToken()
        {
            // Arrange
            var request = MockDataService.CreateValidLoginRequest();
            var existingToken = _context.RefreshTokens.FirstOrDefault();
            Assert.NotNull(existingToken);

            // Act
            var result = await _controller.Login(request);

            // Assert
            AssertExtensions.AssertOkResult(result);

            var updatedToken = _context.RefreshTokens.FirstOrDefault(rt => rt.Email == request.Email);
            Assert.NotNull(updatedToken);
            Assert.NotEqual(existingToken.Token, updatedToken.Token); // Token should be updated
        }
    }

    [Xunit.Trait("Category", "AuthController - Token Management")]
    public class TokenManagementTests
    {
        [Fact]
        public async System.Threading.Tasks.Task Me_WithValidRefreshTokenInCookie_ShouldReturnUserInfo()
        {
            // Arrange - Set refresh token cookie
            var request = MockDataService.CreateValidLoginRequest();
            var loginResult = await _controller.Login(request);

            // Act
            var result = _controller.Me();

            // Assert
            AssertExtensions.AssertOkResult(result);
            AssertExtensions.AssertContainsEmailResponse(result, "test@example.com");
        }

        [Fact]
        public IActionResult Me_WithoutRefreshToken_ShouldReturnUnauthorized()
        {
            // Arrange - No refresh token cookie

            // Act
            var result = _controller.Me();

            // Assert
            AssertExtensions.AssertUnauthorizedResult(result);
        }

        [Fact]
        public async System.Threading.Tasks.Task Me_WithInvalidRefreshToken_ShouldReturnUnauthorized()
        {
            // Arrange
            var controller = new AuthController(_context, _secretsService);

            // Set invalid refresh token cookie by mocking
            controller.ControllerContext.HttpContext.Request.Cookies = new MockMicrosoft.AspNetCore.Http.MockRequestCookieCollection();
            ((MockMicrosoft.AspNetCore.Http.MockRequestCookieCollection)controller.ControllerContext.HttpContext.Request.Cookies)["refreshToken"] = "invalid-token";

            // Act
            var result = controller.Me();

            // Assert
            AssertExtensions.AssertUnauthorizedResult(result);
        }

        [Fact]
        public void Refresh_WithoutRefreshToken_ShouldReturnUnauthorized()
        {
            // Arrange

            // Act
            var result = _controller.Refresh();

            // Assert
            AssertExtensions.AssertUnauthorizedResult(result);
        }

        [Fact]
        public void Refresh_WithValidRefreshToken_ShouldReturnNewAccessToken()
        {
            // Arrange - Login first to get valid refresh token
            var loginRequest = MockDataService.CreateValidLoginRequest();
            _controller.Login(loginRequest).Wait();

            // Act
            var result = _controller.Refresh();

            // Assert
            AssertExtensions.AssertOkResult(result);
        }

        [Fact]
        public IActionResult Logout_WithValidRefreshToken_ShouldRevokeTokenAndDeleteCookies()
        {
            // Arrange
            var loginRequest = MockDataService.CreateValidLoginRequest();
            _controller.Login(loginRequest).Wait();

            // Act
            var result = _controller.Logout();

            // Assert
            AssertExtensions.AssertOkResult(result);
            AssertExtensions.AssertContainsMessageResponse(result, "Logged out successfully");
        }

        [Fact]
        public IActionResult Logout_WithoutRefreshToken_ShouldStillReturnSuccess()
        {
            // Arrange

            // Act
            var result = _controller.Logout();

            // Assert
            AssertExtensions.AssertOkResult(result);
        }
    }

    [Xunit.Trait("Category", "AuthController - Password Recovery")]
    public class PasswordRecoveryTests
    {
        [Fact]
        public async System.Threading.Tasks.Task ForgotPassword_WithValidEmail_ShouldSendEmailAndReturnSuccess()
        {
            // Arrange
            var request = MockDataService.CreateValidForgotPasswordRequest();

            // Act
            var result = await _controller.ForgotPassword(request);

            // Assert
            AssertExtensions.AssertOkResult(result);
            AssertExtensions.AssertContainsMessageResponse(result, "Email sent succesfully");
        }

        [Fact]
        public async System.Threading.Tasks.Task ForgotPassword_WithNonExistentEmail_ShouldReturnUserNotFound()
        {
            // Arrange
            var request = new AuthController.ForgotPasswordRequest
            {
                Email = "nonexistent@example.com"
            };

            // Act
            var result = await _controller.ForgotPassword(request);

            // Assert
            AssertExtensions.AssertBadRequestResult(result, "User not found");
        }

        [Fact]
        public async System.Threading.Tasks.Task ResetPassword_WithValidTokenAndNewPassword_ShouldUpdatePassword()
        {
            // Arrange
            var email = "test@example.com";
            var token = TestHelper.GenerateValidJwtToken(email);
            var request = new AuthController.ResetPasswordRequest
            {
                Token = token,
                NewPassword = "NewStrongPassword123!"
            };

            // Act
            var result = await _controller.ResetPassword(request);

            // Assert
            AssertExtensions.AssertOkResult(result);
            AssertExtensions.AssertContainsMessageResponse(result, "Password reset successfully");

            var user = _context.Users.FirstOrDefault(u => u.Email == email);
            Assert.NotNull(user);
            Assert.True(BCrypt.Net.BCrypt.Verify(request.NewPassword, user.PasswordHash));
        }

        [Fact]
        public async System.Threading.Tasks.Task ResetPassword_WithInvalidToken_ShouldReturnBadRequest()
        {
            // Arrange
            var request = new AuthController.ResetPasswordRequest
            {
                Token = "invalid-token",
                NewPassword = "NewStrongPassword123!"
            };

            // Act
            var result = await _controller.ResetPassword(request);

            // Assert
            AssertExtensions.AssertBadRequestResult(result, "Invalid Token");
        }

        [Fact]
        public async System.Threading.Tasks.Task ResetPassword_WithValidTokenButNonExistentUser_ShouldReturnUserNotFound()
        {
            // Arrange
            var token = TestHelper.GenerateValidJwtToken("nonexistent@example.com");
            var request = new AuthController.ResetPasswordRequest
            {
                Token = token,
                NewPassword = "NewStrongPassword123!"
            };

            // Act
            var result = await _controller.ResetPassword(request);

            // Assert
            AssertExtensions.AssertBadRequestResult(result, "User not found");
        }
    }

    [Xunit.Trait("Category", "AuthController - Email Verification")]
    public class EmailVerificationTests
    {
        [Fact]
        public async System.Threading.Tasks.Task Verify_WithValidToken_ShouldMarkUserAsVerified()
        {
            // Arrange
            var unverifiedUser = MockDataService.CreateUnverifiedUser();
            _context.Users.Add(unverifiedUser);
            _context.SaveChanges();

            var token = TestHelper.GenerateValidJwtToken(unverifiedUser.Email);
            var request = new AuthController.VerifyRequest
            {
                Token = token
            };

            // Act
            var result = await _controller.Verify(request);

            // Assert
            AssertExtensions.AssertOkResult(result);
            AssertExtensions.AssertContainsMessageResponse(result, "You have succesfully registered!");

            var user = _context.Users.FirstOrDefault(u => u.Email == unverifiedUser.Email);
            Assert.NotNull(user);
            Assert.True(user.Verified);
        }

        [Fact]
        public async System.Threading.Tasks.Task Verify_WithInvalidToken_ShouldReturnBadRequest()
        {
            // Arrange
            var request = new AuthController.VerifyRequest
            {
                Token = "invalid-token"
            };

            // Act
            var result = await _controller.Verify(request);

            // Assert
            AssertExtensions.AssertBadRequestResult(result, "Invalid Token");
        }

        [Fact]
        public async System.Threading.Tasks.Task Verify_WithAlreadyVerifiedUser_ShouldReturnAlreadyVerified()
        {
            // Arrange
            var verifiedUser = MockDataService.CreateTestUser();
            verifiedUser.Verified = true;
            _context.Users.Add(verifiedUser);
            _context.SaveChanges();

            var token = TestHelper.GenerateValidJwtToken(verifiedUser.Email);
            var request = new AuthController.VerifyRequest
            {
                Token = token
            };

            // Act
            var result = await _controller.Verify(request);

            // Assert
            AssertExtensions.AssertBadRequestResult(result, "Already verified");
        }

        [Fact]
        public async System.Threading.Tasks.Task Verify_WithValidTokenButNonExistentUser_ShouldReturnUserNotFound()
        {
            // Arrange
            var token = TestHelper.GenerateValidJwtToken("nonexistent@example.com");
            var request = new AuthController.VerifyRequest
            {
                Token = token
            };

            // Act
            var result = await _controller.Verify(request);

            // Assert
            AssertExtensions.AssertBadRequestResult(result, "User not found");
        }

        [Fact]
        public async System.Threading.Tasks.Task VerifyToken_WithValidToken_ShouldReturnSuccess()
        {
            // Arrange
            var email = "test@example.com";
            var token = TestHelper.GenerateValidJwtToken(email);
            var request = new AuthController.TokenRequest
            {
                Token = token
            };

            // Act
            var result = await _controller.VerifyToken(request);

            // Assert
            AssertExtensions.AssertOkResult(result);
            AssertExtensions.AssertContainsMessageResponse(result, "Token is valid");
        }

        [Fact]
        public async System.Threading.Tasks.Task VerifyToken_WithInvalidToken_ShouldReturnInvalidToken()
        {
            // Arrange
            var request = new AuthController.TokenRequest
            {
                Token = "invalid-token"
            };

            // Act
            var result = await _controller.VerifyToken(request);

            // Assert
            AssertExtensions.AssertBadRequestResult(result, "Invalid Token");
        }

        [Fact]
        public async System.Threading.Tasks.Task VerifyToken_WithValidTokenButNonExistentUser_ShouldReturnUserNotFound()
        {
            // Arrange
            var token = TestHelper.GenerateValidJwtToken("nonexistent@example.com");
            var request = new AuthController.TokenRequest
            {
                Token = token
            };

            // Act
            var result = await _controller.VerifyToken(request);

            // Assert
            AssertExtensions.AssertBadRequestResult(result, "User not found");
        }
    }

    [Xunit.Trait("Category", "AuthController - Input Validation")]
    public class InputValidationTests
    {
        [Fact]
        public async System.Threading.Tasks.Task Register_WithEmptyEmail_ShouldFail()
        {
            // Arrange
            var request = MockDataService.CreateValidRegisterRequest();
            request.Email = "";

            // Act
            var result = await _controller.Register(request);

            // Assert
            // Should fail validation, but actual behavior depends on model validation
            var badRequestResult = result as BadRequestObjectResult;
            Assert.NotNull(badRequestResult);
        }

        [Fact]
        public async System.Threading.Tasks.Task Register_WithInvalidEmailFormat_ShouldFail()
        {
            // Arrange
            var request = MockDataService.CreateValidRegisterRequest();
            request.Email = "invalid-email";

            // Act
            var result = await _controller.Register(request);

            // Assert
            var badRequestResult = result as BadRequestObjectResult;
            Assert.NotNull(badRequestResult);
        }

        [Fact]
        public async System.Threading.Tasks.Task Register_WithEmptyPassword_ShouldFail()
        {
            // Arrange
            var request = MockDataService.CreateValidRegisterRequest();
            request.Password = "";

            // Act
            var result = await _controller.Register(request);

            // Assert
            var badRequestResult = result as BadRequestObjectResult;
            Assert.NotNull(badRequestResult);
        }

        [Fact]
        public async System.Threading.Tasks.Task Register_WithWeakPassword_ShouldFail()
        {
            // Arrange
            var request = MockDataService.CreateValidRegisterRequest();
            request.Password = "weak";

            // Act
            var result = await _controller.Register(request);

            // Assert
            var badRequestResult = result as BadRequestObjectResult;
            Assert.NotNull(badRequestResult);
        }

        [Fact]
        public async System.Threading.Tasks.Task Login_WithEmptyEmail_ShouldFail()
        {
            // Arrange
            var request = MockDataService.CreateValidLoginRequest();
            request.Email = "";

            // Act
            var result = await _controller.Login(request);

            // Assert
            var badRequestResult = result as BadRequestObjectResult;
            Assert.NotNull(badRequestResult);
        }

        [Fact]
        public async System.Threading.Tasks.Task Login_WithEmptyPassword_ShouldFail()
        {
            // Arrange
            var request = MockDataService.CreateValidLoginRequest();
            request.Password = "";

            // Act
            var result = await _controller.Login(request);

            // Assert
            var badRequestResult = result as BadRequestObjectResult;
            Assert.NotNull(badRequestResult);
        }
    }
}

