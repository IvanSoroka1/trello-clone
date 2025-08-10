using System.Net.Mail;
using System.Net;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
public class EmailController : ControllerBase
{
    string myEmail = "l.soroka333@gmail.com";
    string password = "qofp wbvs bxqg dfqr "; 

    [HttpPost("send")]
    public async Task<IActionResult> SendEmail([FromBody] Email email)
    {
        Console.WriteLine($"Attempting to send Email to {email.To}");
        try
        {

            var smtpClient = new SmtpClient("smtp.gmail.com")
            {
                Port = 587,
                Credentials = new NetworkCredential(myEmail, password),
                EnableSsl = true
            };
            var mailMessage = new MailMessage
            {
                From = new MailAddress(myEmail),
                Subject = "Register for The Task Manager App",
                Body = "Please click on this link to verify your email",
            };
            mailMessage.To.Add(email.To);

            await smtpClient.SendMailAsync(mailMessage);

            return Ok(new { message = "Email sent succesfully" });

        }
        catch (System.Exception ex)
        {
            Console.WriteLine(ex);
            return StatusCode(500, new { message = "Failed to send email", error = ex.Message });

        }

    }
}

public class Email
{
    public string To { get; set; }
}