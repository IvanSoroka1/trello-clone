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

    private readonly IBoardService _boardService;
    public DashboardController(AppDbContext context, IBoardService boardService)
    {
        _context = context;
        _boardService = boardService;
    }

    [HttpGet("boards")]
    public IActionResult GetBoards()
    {

        var email = User.FindFirst(ClaimTypes.Email)?.Value;

        if (email == null)
            return BadRequest(new { message = "Email not found" });

        var boards = _context.Users.Where(u => u.Email == email).SelectMany(u => u.Boards).ToList();

        return Ok(new { message = boards });

    }

    [HttpPost("board")]
    public IActionResult MakeBoard([FromBody] BoardRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Title))
            return BadRequest(new { message = "Title is required" });

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

        return Ok(new { id = board.Id, title = board.Title });
    }
    
    [HttpPut("board")]
    public IActionResult RenameBoard([FromBody] BoardRenameRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Title))
            return BadRequest(new { message = "Title is required" });

        IQueryable<Board>? boardQuery = null;
        string? message = _boardService.checkValidBoard(request.BoardId, ref boardQuery, User);

        if (boardQuery == null || message != "Success!")
            return BadRequest(new { message = message ?? "Board lookup failed" });

        Board board = boardQuery.First();
        board.Title = request.Title.Trim();

        _context.SaveChanges();

        return Ok(new { id = board.Id, title = board.Title });
    }

    [HttpDelete("board")]
    public IActionResult DeleteBoard([FromBody] BoardDeletionRequest request)
    {
        IQueryable<Board>? boardQuery = null;
        string? message = _boardService.checkValidBoard(request.BoardId, ref boardQuery, User);

        if (boardQuery == null)
            return BadRequest(new { message = message });

        Board board = boardQuery.FirstOrDefault();

        _context.Boards.Remove(board);
        // should you delete all tasklists that are on the board? And then all tasks that are part of each task? Is this deletion done properly?

        _context.SaveChanges();

        return Ok(new { message = "Board deleted successfully" });
    }
}

public class BoardRequest {
    public string Title { get; set; } = string.Empty;
}

public class BoardRenameRequest
{
    public int BoardId { get; set; }
    public string Title { get; set; } = string.Empty;
}

public class BoardDeletionRequest
{
    public int BoardId
    {
        get; set;
    }
}
