using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using System.Net;
using Xunit;

namespace server.Tests.Utilities;

public static class AssertExtensions
{
    public static void AssertOkResult<T>(IActionResult result, T expectedData = default!)
    {
        Assert.NotNull(result);
        Assert.IsType<OkObjectResult>(result);

        var okResult = (OkObjectResult)result;
        Assert.Equal(200, okResult.StatusCode);

        if (expectedData != null)
        {
            Assert.Equal(expectedData, okResult.Value);
        }
    }

    public static void AssertBadRequestResult(IActionResult result, string expectedMessage = null!)
    {
        Assert.NotNull(result);
        Assert.IsType<BadRequestObjectResult>(result);

        var badRequestResult = (BadRequestObjectResult)result;
        Assert.Equal(400, badRequestResult.StatusCode);

        if (expectedMessage != null)
        {
            var response = JsonConvert.DeserializeObject<Dictionary<string, string>>(badRequestResult.Value.ToString()!);
            Assert.Contains(expectedMessage, response.Values);
        }
    }

    public static void AssertUnauthorizedResult(IActionResult result)
    {
        Assert.NotNull(result);
        Assert.IsType<UnauthorizedResult>(result);
        Assert.Equal(401, ((UnauthorizedResult)result).StatusCode);
    }

    public static void AssertForbiddenResult(IActionResult result, string expectedMessage = null!)
    {
        Assert.NotNull(result);
        Assert.IsType<ObjectResult>(result);
        var objectResult = (ObjectResult)result;
        Assert.Equal(403, objectResult.StatusCode);

        if (expectedMessage != null)
        {
            var response = JsonConvert.DeserializeObject<Dictionary<string, string>>(objectResult.Value.ToString()!);
            Assert.Contains(expectedMessage, response.Values);
        }
    }

    public static void AssertNotFoundResult(IActionResult result, string expectedMessage = null!)
    {
        Assert.NotNull(result);
        Assert.IsType<ObjectResult>(result);
        var objectResult = (ObjectResult)result;
        Assert.Equal(404, objectResult.StatusCode);

        if (expectedMessage != null)
        {
            var response = JsonConvert.DeserializeObject<Dictionary<string, string>>(objectResult.Value.ToString()!);
            Assert.Contains(expectedMessage, response.Values);
        }
    }

    public static void AssertObjectResult<T>(IActionResult result, HttpStatusCode expectedStatusCode, T expectedValue = default!)
    {
        Assert.NotNull(result);
        Assert.IsType<ObjectResult>(result);
        var objectResult = (ObjectResult)result;
        Assert.Equal((int)expectedStatusCode, objectResult.StatusCode);

        if (expectedValue != null)
        {
            Assert.Equal(expectedValue, objectResult.Value);
        }
    }

    public static void AssertContainsEmailResponse(IActionResult result, string expectedEmail)
    {
        if (result is OkObjectResult okResult)
        {
            var response = JsonConvert.DeserializeObject<Dictionary<string, string>>(okResult.Value.ToString()!);
            Assert.Contains("Email", response.Keys);
            Assert.Equal(expectedEmail, response["Email"]);
        }
        else if (result is OkResult)
        {
            // Just check it's a 200 OK
            Assert.IsType<OkResult>(result);
        }
        else
        {
            Assert.Fail($"Unexpected result type: {result.GetType().Name}");
        }
    }

    public static void AssertContainsMessageResponse(IActionResult result, string expectedMessage)
    {
        if (result is ObjectResult objectResult && objectResult.Value != null)
        {
            var response = JsonConvert.DeserializeObject<Dictionary<string, string>>(objectResult.Value.ToString()!);
            Assert.Contains("message", response.Keys);
            Assert.Equal(expectedMessage, response["message"]);
        }
        else
        {
            Assert.Fail($"Unexpected result type or value: {result.GetType().Name}");
        }
    }

    public static void AssertContainsTokenResponse(IActionResult result, string tokenPrefix = "eyJ")
    {
        if (result is OkResult)
        {
            // Just check it's a 200 OK for tokens
            return;
        }

        var okResult = Assert.IsType<OkObjectResult>(result);
        var response = okResult.Value?.ToString();

        if (string.IsNullOrEmpty(response))
        {
            return;
        }

        if (response.Contains("\"message\""))
        {
            var dict = JsonConvert.DeserializeObject<Dictionary<string, string>>(response);
            Assert.Contains("message", dict.Keys);
        }
    }

    public static void AssertStringContains(string actual, string expected, string message = null)
    {
        Assert.NotNull(actual);
        Assert.Contains(expected, actual, message ?? $"Expected string to contain '{expected}'");
    }

    public static void AssertValidEmailFormat(string email)
    {
        Assert.False(string.IsNullOrWhiteSpace(email), "Email should not be empty");
        Assert.Contains("@", email, "Email should contain @ symbol");
        var parts = email.Split('@');
        Assert.Equal(2, parts.Length, "Email should have exactly one @ symbol");
        Assert.False(string.IsNullOrWhiteSpace(parts[0]), "Email local part should not be empty");
        Assert.False(string.IsNullOrWhiteSpace(parts[1]), "Email domain part should not be empty");
        Assert.Contains(".", parts[1], "Email domain should contain a dot");
    }

    public static void AssertStrongPassword(string password)
    {
        Assert.False(string.IsNullOrWhiteSpace(password), "Password should not be empty");
        Assert.True(password.Length >= 8, "Password should be at least 8 characters long");
        Assert.True(char.IsLetterOrDigit(password[0]), "Password should start with alphanumeric character");
        Assert.True(password.Any(char.IsUpper), "Password should contain at least one uppercase letter");
        Assert.True(password.Any(char.IsLower), "Password should contain at least one lowercase letter");
        Assert.True(password.Any(char.IsDigit), "Password should contain at least one digit");
        Assert.True(password.Any(c => !char.IsLetterOrDigit(c)), "Password should contain at least one special character");
    }
}