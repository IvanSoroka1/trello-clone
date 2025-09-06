public class SecretsService
{
    public string JwtSecret { get; }

    public string EmailPassword{ get; }

    public string PersonalEmail{ get; }
    public SecretsService(string jwtSecret, string emailPassword, string email)
    {
        JwtSecret = jwtSecret;
        EmailPassword = emailPassword;
        PersonalEmail = email;
    }
}
