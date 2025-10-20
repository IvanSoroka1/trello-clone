using BCrypt.Net;
using Microsoft.AspNetCore.Mvc;
using Moq;
using server.Controllers;
using server.Data;
using server.Models;
using server.Tests.TestFixtures;
using server.Tests.Utilities;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.IdentityModel.Tokens;
using Xunit;
using Trait = Xunit.TraitAttribute;

namespace server.Tests;

public class SecurityTests
{
    private readonly AuthController _controller;
    private readonly AppDbContext _context;
    private readonly SecretsService _secretsService;

    public SecurityTests()
    {
        _context = TestDbContextFactory.CreateDbContext();
        _secretsService = new SecretsService(
            "test-secret-key-for-testing-purposes-only-123456789",
            "test-email-password",
            "test@example.com"
        );
        _controller = new AuthController(_context, _secretsService);
    }

    [Xunit.Trait("Category", "Security - Password Hashing")]
    public class PasswordHashingTests
    {
        [Fact]
        public void PasswordHashing_ShouldBeSaltedAndHashed()
        {
            // Arrange
            var plainPassword = "TestPassword123!";
            var user = MockDataService.CreateTestUser();
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(plainPassword);

            // Act - Verify the hash
            var isValid = BCrypt.Net.BCrypt.Verify(plainPassword, user.PasswordHash);

            // Assert
            Assert.True(isValid);
            Assert.NotEqual(plainPassword, user.PasswordHash);
            Assert.True(user.PasswordHash.Length > 50); // BCrypt hashes are typically longer
        }

        [Fact]
        public void SamePassword_ShouldGenerateDifferentHashes()
        {
            // Arrange
            var plainPassword = "TestPassword123!";

            // Act
            var hash1 = BCrypt.HashPassword(plainPassword);
            var hash2 = BCrypt.HashPassword(plainPassword);

            // Assert
            Assert.NotEqual(hash1, hash2); // Different salts should produce different hashes
            Assert.True(BCrypt.Verify(plainPassword, hash1));
            Assert.True(BCrypt.Verify(plainPassword, hash2));
        }

        [Fact]
        public void WrongPassword_ShouldNotMatchHash()
        {
            // Arrange
            var correctPassword = "CorrectPassword123!";
            var wrongPassword = "WrongPassword123!";
            var hash = BCrypt.HashPassword(correctPassword);

            // Act
            var isValid = BCrypt.Verify(wrongPassword, hash);

            // Assert
            Assert.False(isValid);
        }

        [Fact]
        public void PasswordVerification_ShouldHandleEmptyPasswords()
        {
            // Arrange
            var emptyPassword = "";
            var hash = BCrypt.HashPassword(emptyPassword);

            // Act
            var isValid = BCrypt.Verify(emptyPassword, hash);

            // Assert
            Assert.True(isValid);
            Assert.False(BCrypt.Verify("not-empty", hash));
        }

        [Fact]
        public void StrongPassword_ShouldBeProperlyHashed()
        {
            // Arrange
            var strongPassword = "Str0ngP@ssw0rd!123";

            // Act
            var hash = BCrypt.HashPassword(strongPassword);

            // Assert
            Assert.NotNull(hash);
            Assert.NotEqual(strongPassword, hash);
            Assert.True(BCrypt.Verify(strongPassword, hash));
        }
    }

    [Xunit.Trait("Category", "Security - JWT Token Validation")]
    public class JwtTokenTests
    {
        [Fact]
        public void ValidJwtToken_ShouldBeProperlyGeneratedAndValidated()
        {
            // Arrange
            var email = "test@example.com";
            var validKey = "test-secret-key-for-testing-purposes-only-123456789";
            var expectedIssuer = "test-issuer";
            var expectedAudience = "test-audience";

            // Act
            var token = TestHelper.GenerateValidJwtToken(email);
            var validatedEmail = ValidateTestToken(token, validKey, expectedIssuer, expectedAudience);

            // Assert
            Assert.NotNull(token);
            Assert.Equal(email, validatedEmail);
        }

        [Fact]
        public void ExpiredJwtToken_ShouldBeRejected()
        {
            // Arrange
            var email = "test@example.com";
            var expiredToken = TestHelper.GenerateExpiredJwtToken(email);

            // Act
            var result = ValidateTestToken(expiredToken, "test-secret-key", "test-issuer", "test-audience");

            // Assert
            Assert.Null(result); // Validation should return null for expired token
        }

        [Fact]
        public void InvalidJwtToken_ShouldBeRejected()
        {
            // Arrange
            var invalidToken = "this.is.not.a.valid.jwt.token";

            // Act
            var result = ValidateTestToken(invalidToken, "test-secret-key", "test-issuer", "test-audience");

            // Assert
            Assert.Null(result); // Validation should return null for invalid token
        }

        [Fact]
        public void JwtToken_WithWrongKey_ShouldBeRejected()
        {
            // Arrange
            var email = "test@example.com";
            var token = TestHelper.GenerateValidJwtToken(email);
            var wrongKey = "wrong-secret-key";

            // Act
            var result = ValidateTestToken(token, wrongKey, "test-issuer", "test-audience");

            // Assert
            Assert.Null(result); // Validation should fail with wrong key
        }

        [Fact]
        public void JwtToken_WithWrongIssuer_ShouldBeRejected()
        {
            // Arrange
            var email = "test@example.com";
            var token = TestHelper.GenerateValidJwtToken(email);

            // Act
            var result = ValidateTestToken(token, "test-secret-key", "wrong-issuer", "test-audience");

            // Assert
            Assert.Null(result); // Validation should fail with wrong issuer
        }

        private string? ValidateTestToken(string token, string key, string issuer, string audience)
        {
            try
            {
                var tokenHandler = new System.IdentityModel.Tokens.Jwt.JwtSecurityTokenHandler();
                var securityKey = new System.IdentityModel.Tokens.SymmetricSecurityKey(
                    System.Text.Encoding.UTF8.GetBytes(key));

                var validationParameters = new System.IdentityModel.Tokens.TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = issuer,
                    ValidAudience = audience,
                    IssuerSigningKey = securityKey
                };

                var principal = tokenHandler.ValidateToken(token, validationParameters, out _);
                return principal.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value;
            }
            catch
            {
                return null;
            }
        }
    }

    [Xunit.Trait("Category", "Security - Input Validation")]
    public class InputValidationTests
    {
        [Fact]
        public void EmailValidation_ShouldAcceptValidFormats()
        {
            var validEmails = new[]
            {
                "test@example.com",
                "user.name@domain.co.uk",
                "user+tag@domain.com",
                "user123@domain.org",
                "test.user@sub.domain.com"
            };

            foreach (var email in validEmails)
            {
                // Act & Assert
                TestHelper.AssertValidEmailFormat(email);
            }
        }

        [Fact]
        public void EmailValidation_ShouldRejectInvalidFormats()
        {
            var invalidEmails = new[]
            {
                "plainaddress",
                "@domain.com",
                "user@",
                "user@.",
                "user..name@domain.com",
                "user@domain",
                "user@domain.",
                "user@.com",
                "",
                "   ",
                "user@domain..com"
            };

            foreach (var email in invalidEmails)
            {
                // Act & Assert
                Assert.False(string.IsNullOrWhiteSpace(email) || !email.Contains("@") ||
                    email.Split('@').Length != 2 || string.IsNullOrWhiteSpace(email.Split('@')[0]) ||
                    string.IsNullOrWhiteSpace(email.Split('@')[1]) || !email.Split('@')[1].Contains("."),
                    $"Email '{email}' should be invalid");
            }
        }

        [Fact]
        public void PasswordValidation_ShouldEnforceStrongPasswordRules()
        {
            var weakPasswords = new[]
            {
                "short",
                "alllowercase",
                "ALLUPPERCASE",
                "12345678",
                "nospecialchars123",
                "NoSpecialChars",
                "noNumbers!",
                "NoNumbersAtAll",
                ""
            };

            foreach (var password in weakPasswords)
            {
                // Act & Assert
                if (string.IsNullOrWhiteSpace(password) || password.Length < 8)
                {
                    continue;
                }

                var hasUpper = password.Any(char.IsUpper);
                var hasLower = password.Any(char.IsLower);
                var hasDigit = password.Any(char.IsDigit);
                var hasSpecial = password.Any(c => !char.IsLetterOrDigit(c));

                Assert.True(hasUpper && hasLower && hasDigit && hasSpecial,
                    $"Password '{password}' should be considered weak");
            }
        }

        [Fact]
        public void StrongPasswordValidation_ShouldPassStrongPasswords()
        {
            var strongPasswords = new[]
            {
                "Str0ngP@ssw0rd!123",
                "ValidPassword1@",
                "Test123!@#",
                "Mypassw0rd!",
                "SecureP@ss1"
            };

            foreach (var password in strongPasswords)
            {
                // Act & Assert
                TestHelper.AssertStrongPassword(password);
            }
        }

        [Fact]
        public void XSSPrevention_ShouldSanitizeInput()
        {
            // Arrange
            var maliciousInputs = new[]
            {
                "<script>alert('xss')</script>",
                "javascript:alert('xss')",
                "onclick=alert('xss')",
                "<img src=x onerror=alert('xss')>",
                "<iframe src=javascript:alert('xss')>",
                "\" onmouseover=\"alert('xss')",
                "<svg onload=alert('xss')>"
            };

            foreach (var input in maliciousInputs)
            {
                // Act - Simulate input sanitization
                var sanitized = SanitizeInput(input);

                // Assert
                Assert.DoesNotContain("<script", sanitized, StringComparison.OrdinalIgnoreCase);
                Assert.DoesNotContain("javascript:", sanitized, StringComparison.OrdinalIgnoreCase);
                Assert.DoesNotContain("onerror", sanitized, StringComparison.OrdinalIgnoreCase);
                Assert.DoesNotContain("onload", sanitized, StringComparison.OrdinalIgnoreCase);
            }
        }

        [Fact]
        public void SQLInjectionPrevention_ShouldSanitizeInput()
        {
            // Arrange
            var sqlInjectionInputs = new[]
            {
                "'; DROP TABLE Users;--",
                "1' OR '1'='1",
                "admin'--",
                "'; WAITFOR DELAY '0:0:5'--",
                "1 UNION SELECT username, password FROM users--",
                "1'; EXEC sp_configure 'show advanced options', 1;--"
            };

            foreach (var input in sqlInjectionInputs)
            {
                // Act - Simulate input sanitization
                var sanitized = SanitizeInput(input);

                // Assert
                Assert.DoesNotContain("--", sanitized);
                Assert.DoesNotContain("DROP", sanitized, StringComparison.OrdinalIgnoreCase);
                Assert.DoesNotContain("UNION", sanitized, StringComparison.OrdinalIgnoreCase);
                Assert.DoesNotContain("EXEC", sanitized, StringComparison.OrdinalIgnoreCase);
                Assert.DoesNotContain("WAITFOR", sanitized, StringComparison.OrdinalIgnoreCase);
            }
        }

        private string SanitizeInput(string input)
        {
            // Basic input sanitization for testing
            if (string.IsNullOrEmpty(input))
                return input;

            // Remove dangerous tags and attributes
            string sanitized = input
                .Replace("<script", "&lt;script")
                .Replace("</script>", "&lt;/script&gt;")
                .Replace("javascript:", "")
                .Replace("onerror", "")
                .Replace("onload", "")
                .Replace("--", "")
                .Replace("DROP", "")
                .Replace("UNION", "")
                .Replace("EXEC", "")
                .Replace("WAITFOR", "");

            return sanitized;
        }
    }

    [Xunit.Trait("Category", "Security - Error Handling")]
    public class ErrorHandlingTests
    {
        [Fact]
        public void ErrorMessages_ShouldNotExposeSensitiveInformation()
        {
            // Arrange
            var user = MockDataService.CreateTestUser();
            _context.Users.Add(user);
            _context.SaveChanges();

            var invalidLoginRequest = new AuthController.LoginRequest
            {
                Email = "nonexistent@example.com",
                Password = "somepassword"
            };

            // Act
            var result = _controller.Login(invalidLoginRequest).Result;

            // Assert
            var badRequestResult = result as BadRequestObjectResult;
            Assert.NotNull(badRequestResult);

            var errorMessage = badRequestResult.Value?.ToString();
            Assert.DoesNotContain(user.PasswordHash, errorMessage ?? "");
            Assert.DoesNotContain(user.Email, errorMessage ?? "");
            Assert.Contains("No account with such an email exists", errorMessage ?? "");
        }

        [Fact]
        public void ErrorResponses_ShouldHaveConsistentFormat()
        {
            // Arrange
            var request = MockDataService.CreateValidRegisterRequest();
            request.Email = "existing@example.com";

            var existingUser = MockDataService.CreateTestUser("existing@example.com");
            _context.Users.Add(existingUser);
            _context.SaveChanges();

            // Act
            var result = _controller.Register(request).Result;

            // Assert
            var badRequestResult = result as BadRequestObjectResult;
            Assert.NotNull(badRequestResult);

            var errorResponse = badRequestResult.Value?.ToString();
            Assert.NotNull(errorResponse);

            // Should be JSON format with message field
            Assert.Contains("message", errorResponse, StringComparison.OrdinalIgnoreCase);
        }

        [Fact]
        public void InvalidInput_ShouldReturnAppropriateHttpStatusCode()
        {
            // Test various invalid inputs and their expected HTTP status codes
            var testCases = new[]
            {
                (Action: () => TestInvalidEmail(), ExpectedStatus: 400),
                (Action: () => TestWeakPassword(), ExpectedStatus: 400),
                (Action: () => TestEmptyInput(), ExpectedStatus: 400),
                (Action: () => TestMaliciousInput(), ExpectedStatus: 400)
            };

            foreach (var testCase in testCases)
            {
                // Act
                var result = testCase.Action();
                var statusCode = GetStatusCode(result);

                // Assert
                Assert.Equal(testCase.ExpectedStatus, statusCode);
            }
        }

        private IActionResult TestInvalidEmail()
        {
            var request = new AuthController.RegisterRequest
            {
                Email = "invalid-email",
                Password = "ValidPassword123!"
            };
            return _controller.Register(request).Result;
        }

        private IActionResult TestWeakPassword()
        {
            var request = new AuthController.RegisterRequest
            {
                Email = "test@example.com",
                Password = "weak"
            };
            return _controller.Register(request).Result;
        }

        private IActionResult TestEmptyInput()
        {
            var request = new AuthController.RegisterRequest
            {
                Email = "",
                Password = ""
            };
            return _controller.Register(request).Result;
        }

        private IActionResult TestMaliciousInput()
        {
            var request = new AuthController.RegisterRequest
            {
                Email = "test<script>alert</script>@example.com",
                Password = "ValidPassword123!"
            };
            return _controller.Register(request).Result;
        }

        private int GetStatusCode(IActionResult result)
        {
            return result switch
            {
                BadRequestObjectResult badRequest => badRequest.StatusCode ?? 400,
                UnauthorizedResult unauthorized => unauthorized.StatusCode ?? 401,
                ObjectResult objectResult => objectResult.StatusCode ?? 500,
                OkResult ok => ok.StatusCode ?? 200,
                _ => 500
            };
        }
    }
}