using System.ComponentModel.DataAnnotations;

public class RefreshToken
{
    [Key]
    public string Email { get; set; }
    public string Token { get; set; } = "";
    public DateTime Expires { get; set; }
    public bool Revoked{ get; set; }
}