using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using System.Net.Http;

namespace server.Tests.Utilities;

public static class TestHelper
{
    public static T DeserializeResponse<T>(string content)
    {
        try
        {
            return JsonConvert.DeserializeObject<T>(content) ?? throw new InvalidOperationException("Deserialization returned null");
        }
        catch (JsonException ex)
        {
            throw new InvalidOperationException($"Failed to deserialize response: {ex.Message}");
        }
    }

    public static string SerializeRequest<T>(T request)
    {
        try
        {
            return JsonConvert.SerializeObject(request);
        }
        catch (JsonException ex)
        {
            throw new InvalidOperationException($"Failed to serialize request: {ex.Message}");
        }
    }

    public static bool IsSuccessStatusCode(System.Net.Http.HttpResponseMessage response)
    {
        return (int)response.StatusCode >= 200 && (int)response.StatusCode < 300;
    }

    public static IActionResult GetOkResult<T>(object data)
    {
        return new OkObjectResult(data);
    }

    public static IActionResult GetBadRequestResult(string message)
    {
        return new BadRequestObjectResult(new { message = message });
    }

    public static IActionResult GetUnauthorizedResult()
    {
        return new UnauthorizedResult();
    }

    public static IActionResult GetForbiddenResult(string message)
    {
        return new ObjectResult(new { message = message }) { StatusCode = 403 };
    }

    public static IActionResult GetNotFoundResult(string message)
    {
        return new ObjectResult(new { message = message }) { StatusCode = 404 };
    }

    public static string GenerateInvalidEmail()
    {
        return "invalid-email-format";
    }

    public static string GenerateValidPassword()
    {
        return "ValidPassword123!";
    }

    public static string GenerateWeakPassword()
    {
        return "weak";
    }

    public static string GenerateLongEmail()
    {
        return new string('a', 300) + "@example.com";
    }

    public static string GenerateValidJwtToken(string email = "test@example.com")
    {
        return GenerateTestToken(email, DateTime.UtcNow.AddMinutes(15));
    }

    public static string GenerateExpiredJwtToken(string email = "test@example.com")
    {
        return GenerateTestToken(email, DateTime.UtcNow.AddDays(-1));
    }

    private static string GenerateTestToken(string email, DateTime expiry)
    {
        var testKey = "test-secret-key-for-testing-purposes-only";
        var securityKey = new System.IdentityModel.Tokens.SymmetricSecurityKey(
            System.Text.Encoding.UTF8.GetBytes(testKey));

        var credentials = new System.IdentityModel.Tokens.SigningCredentials(
            securityKey, System.IdentityModel.Tokens.SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new System.Security.Claims.Claim(System.Security.Claims.ClaimTypes.Email, email)
        };

        var token = new System.IdentityModel.Tokens.Jwt.JwtSecurityToken(
            issuer: "test-issuer",
            audience: "test-audience",
            claims: claims,
            expires: expiry,
            signingCredentials: credentials);

        return new System.IdentityModel.Tokens.Jwt.JwtSecurityTokenHandler().WriteToken(token);
    }

    public static string GenerateInvalidJwtToken()
    {
        return "invalid.jwt.token.format";
    }
}