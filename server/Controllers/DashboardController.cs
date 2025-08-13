using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.VisualBasic;
using server.Data;
using server.Models;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DashboardController : ControllerBase
{
    private readonly AppDbContext _context;

    public DashboardController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("boards")]
    public IActionResult GetBoards()
    {

        // if (!User.Identity.IsAuthenticated) this is not necessary since the class is preceded by [Authorize]
        //     return BadRequest(new { message = "Not Authenticated" });

        var email = User.FindFirst(ClaimTypes.Email)?.Value;

        if (email == null)
            return BadRequest(new { message = "Email not found" });

        var boards = _context.Users.Where(u => u.Email == email).SelectMany(u => u.Boards).ToList();

        return Ok(new { message = boards });

    }
    [HttpPost("board")]
    public IActionResult MakeBoard([FromBody] BoardRequest request)
    {
        var email = User.FindFirst(ClaimTypes.Email)?.Value;
        if (email == null)
            return BadRequest(new { message = "Email not found" });

        var user = _context.Users.FirstOrDefault(u => u.Email == email);
        if (user == null)
            return BadRequest(new { message = "User not found" });

        var board = new Board
        {
            Title = request.Title,
            //Email = email,
            CreatedAt = DateTime.UtcNow
        };
        _context.Boards.Add(board);

        _context.SaveChanges();

        user.Boards.Add(board);

        _context.SaveChanges();

        return Ok(new { message = "Succesfully created board!" });
    }
}

public class BoardRequest {
    public string Title { get; set; }
}