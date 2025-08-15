using System.Reflection.Metadata.Ecma335;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
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

        var possibleBoard = _context.Boards.Include(b => b.TaskLists).ThenInclude(b => b.Tasks).Where(u => u.Id == BoardId); // Is this Include always necessary?

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
    [HttpGet("TaskLists/{boardId}")]
    public IActionResult GetTaskLists(int boardId)
    {

        IQueryable<Board>? board = null;
        string? message = checkValidBoard(boardId, ref board);

        if (board == null)
            return BadRequest(new { message = message });

        var taskLists = board.Include(b => b.TaskLists).ThenInclude(tl => tl.Tasks).SelectMany(b => b.TaskLists).ToList();

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

        return Ok(new { message = taskList });

    }

    [HttpDelete("deletetasklist")]
    public IActionResult DeleteTaskList([FromBody] DeleteTaskListReq request)
    {
        IQueryable<Board>? boardQuery = null;
        string? message = checkValidBoard(request.BoardId, ref boardQuery);

        if (boardQuery == null)
            return BadRequest(new { message = message });

        Board board = boardQuery.FirstOrDefault();

        var taskList = board.TaskLists.FirstOrDefault(tl => tl.Id == request.ListId);

        if (taskList == null)
            return NotFound(new { message = "Task list not found" });

        board.TaskLists.Remove(taskList);
        _context.SaveChanges();

        return Ok(new { message = "Task list deleted successfully" });
    }

    [HttpPost("newtask")]
    public IActionResult NewTask([FromBody] NewTaskRequest request)
    {
        IQueryable<Board>? boardQuery = null;
        string? message = checkValidBoard(request.BoardId, ref boardQuery);

        if (boardQuery == null)
            return BadRequest(new { message = message });

        Board board = boardQuery.FirstOrDefault();

        var taskList = board.TaskLists.FirstOrDefault(tl => tl.Id == request.ListId);

        if (taskList == null)
            return NotFound(new { message = "Task list not found" });

        var task = new server.Models.Task
        {
            Name = request.TaskName,
            Completed = false,
        };

        taskList.Tasks.Add(task);
        _context.SaveChanges();

        return Ok(new { message = task });
    }
    [HttpPost ("togglecheck")]
    public IActionResult ToggleCheck([FromBody] ToggleCheckRequest request) // could you do this without the board id? Get the board id from the task id and then solve it from there...
    {
        IQueryable<Board>? boardQuery = null;
        string? message = checkValidBoard(request.BoardId, ref boardQuery);

        if (boardQuery == null)
            return BadRequest(new { message = message });

        Board board = boardQuery.FirstOrDefault();

        var taskId = board.TaskLists.SelectMany(tl => tl.Tasks).FirstOrDefault(t => t.Id == request.TaskId);

        if (taskId == null)
            return NotFound(new { message = "Task not found" });



        taskId.Completed = request.Completed;
        _context.SaveChanges();

        return Ok(new { message = taskId });
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

public class DeleteTaskListReq
{
    public int BoardId { get; set; } // do you need to send this? 
    public int ListId { get; set; }
}

public class NewTaskRequest
{
    public string TaskName { get; set; }
    public int BoardId { get; set; }
    public int ListId { get; set; }
}

public class ToggleCheckRequest
{
    public int TaskId { get; set; }
    public int BoardId { get; set; }
    public int ListId { get; set; }
    public bool Completed { get; set; }
}