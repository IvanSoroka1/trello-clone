using System.Reflection.Metadata.Ecma335;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.VisualBasic;
using server.Data;
using server.Models;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TasksController : ControllerBase
{
    private readonly AppDbContext _context;

    public TasksController(AppDbContext context)
    {
        _context = context;
    }

    private string checkValidBoard(int BoardId, ref IQueryable<Board> board)
    {

        var email = User.FindFirst(ClaimTypes.Email)?.Value;

        if (email == null)
             return "Email not found";

        var possibleBoard = _context.Boards.Where(u => u.Id == BoardId);

        if (possibleBoard == null)
            return "No board with such an ID exists";

        var user = _context.Users.Where(u => email == u.Email);
        var boards = user.SelectMany(u => u.Boards).ToList();

        // if the board id is not in the current user's boards, then it's a bad request
        // var boardIds = _context.Boards
        // .Where(b => b.Email == email) // but the email property of the boards was deleted because of the boards array from the user
        // .Select(b => b.Id)
        // .ToList();

        // this approach is better cuz there is an "IN" in SQL?
        //bool boardExists = _context.Boards
        //.Where(b => b.Email == userEmail)
        //.Select(b => b.Id)
        //.Contains(boardIdToCheck);

        var boardIds = user.SelectMany(u => u.Boards).Select(b => b.Id).ToList();

        if (!boardIds.Contains(BoardId))
            return "You do not have access to this board!";

        board = possibleBoard;
        return "Success!";
    }
    [HttpPost("TaskLists")]
    public IActionResult GetTaskLists([FromBody] TaskListsRequest request)
    {

        IQueryable<Board>? board = null;
        string? message = checkValidBoard(request.BoardId, ref board);

        if (board == null)
            return BadRequest(new { message = message });

        var taskLists = board.SelectMany(b => b.TaskLists).ToList();

        return Ok(new { message = taskLists });
    }


    [HttpPost("maketasklist")]
    public IActionResult MakeTaskList(MakeTaskListRequest request)
    {
        IQueryable<Board>? boardQuery = null;
        string? message = checkValidBoard(request.BoardId, ref boardQuery);


        if (boardQuery == null)
            return BadRequest(new { message = message });

        Board board = boardQuery.FirstOrDefault();

        var taskList = new TaskList
        {
            Name = request.TaskListName,

            Tasks = new List<server.Models.Task>()
        };

        board.TaskLists.Add(taskList);

        _context.SaveChanges();

        return Ok(new { message = "Added new board!" });

    }
}

public class TaskListsRequest
{
    public int BoardId { get; set; }
}

public class MakeTaskListRequest
{
    public string TaskListName { get; set; }
    public int BoardId { get; set; }
}