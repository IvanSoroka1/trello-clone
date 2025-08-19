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

            Tasks = new List<server.Models.Task>(),

            Position = board.TaskLists.Count
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

        for (int n = 0; n < board.TaskLists.Count; n++)
            if (board.TaskLists[n].Position > taskList.Position)
                board.TaskLists[n].Position--; // Decrease position of all task lists that were after the deleted one


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
            Position = taskList.Tasks.Count // Set the position of the task to the end of the task list
        };

        taskList.Tasks.Add(task);
        _context.SaveChanges();

        return Ok(new { message = task });
    }
    [HttpPost("togglecheck")]
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
    [HttpPut("edittask")]
    public IActionResult EditTask([FromBody] EditTaskNameRequest request)
    {
        IQueryable<Board>? boardQuery = null;
        string? message = checkValidBoard(request.BoardId, ref boardQuery);

        if (boardQuery == null)
            return BadRequest(new { message = message });

        Board board = boardQuery.FirstOrDefault();

        var taskList = board.TaskLists.FirstOrDefault(tl => tl.Id == request.ListId);

        if (taskList == null)
            return NotFound(new { message = "Task list not found" });

        var task = taskList.Tasks.FirstOrDefault(t => t.Id == request.TaskId);

        if (task == null)
            return NotFound(new { message = "Task not found" });

        task.Name = request.TaskName;
        _context.SaveChanges();

        return Ok(new { message = task });
    }

    [HttpDelete("deletetask")]
    public IActionResult DeleteTask([FromBody] DeleteTaskRequest request)
    {
        IQueryable<Board>? boardQuery = null;
        string? message = checkValidBoard(request.BoardId, ref boardQuery);

        if (boardQuery == null)
            return BadRequest(new { message = message });

        Board board = boardQuery.FirstOrDefault();

        var taskList = board.TaskLists.FirstOrDefault(tl => tl.Id == request.ListId);

        if (taskList == null)
            return NotFound(new { message = "Task list not found" });

        var task = taskList.Tasks.FirstOrDefault(t => t.Id == request.TaskId);

        if (task == null)
            return NotFound(new { message = "Task not found" });

        taskList.Tasks.Remove(task);

        for (int i = 0; i < taskList.Tasks.Count; i++)
        {
            if (taskList.Tasks[i].Position > task.Position)
            {
                taskList.Tasks[i].Position--; // Decrease position of all tasks that were after the deleted one
            }
        }



        _context.SaveChanges();

        return Ok(new { message = "Task deleted successfully" });
    }

    [HttpPut("edittasklistposition")]
    public IActionResult EditTaskListPosition([FromBody] EditTaskListPositionRequest request)
    {
        IQueryable<Board>? boardQuery = null;
        string? message = checkValidBoard(request.BoardId, ref boardQuery);

        if (boardQuery == null)
            return BadRequest(new { message = message });

        Board board = boardQuery.FirstOrDefault();

        var taskList = board.TaskLists.FirstOrDefault(tl => tl.Position == request.Index1);

        if (taskList == null)
            return NotFound(new { message = "Task list not found" });

        var swappingList = board.TaskLists.FirstOrDefault(tl => tl.Position == request.Index2);

        if (swappingList == null)
            return NotFound(new { message = "Swapping task list not found" });

        taskList.Position = request.Index2;
        swappingList.Position = request.Index1;

        _context.SaveChanges();

        return Ok();
    }

    [HttpPut("edittaskposition")]
    public IActionResult EditTaskPosition([FromBody] EditTaskPositionRequest request)
    {
        IQueryable<Board>? boardQuery = null;
        string? message = checkValidBoard(request.BoardId, ref boardQuery);

        if (boardQuery == null)
            return BadRequest(new { message = message });

        Board board = boardQuery.FirstOrDefault();

        var taskList = board.TaskLists.FirstOrDefault(tl => tl.Id == request.ListId);

        if (taskList == null)
            return NotFound(new { message = "Task list not found" });

        var task1 = taskList.Tasks.FirstOrDefault(t => t.Position == request.Index1);

        if (task1 == null)
            return NotFound(new { message = "Task not found" });

        var task2 = taskList.Tasks.FirstOrDefault(t => t.Position == request.Index2);

        if (task2 == null)
            return NotFound(new { message = "Task not found" });

        task1.Position = request.Index2;
        task2.Position = request.Index1;

        _context.SaveChanges();

        return Ok();
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

public class EditTaskNameRequest
{
    public int TaskId { get; set; }
    public string TaskName { get; set; }
    public int ListId { get; set; }
    public int BoardId { get; set; }
}

public class DeleteTaskRequest
{
    public int TaskId { get; set; }
    public int ListId { get; set; }
    public int BoardId { get; set; }

}

public class EditTaskListPositionRequest
{
    public int Index1 { get; set; }
    public int Index2 { get; set; } // the new position of the task list in the board
    public int BoardId { get; set; }

}

public class EditTaskPositionRequest
{
    public int BoardId { get; set; }
    public int ListId { get; set; }

    public int Index1 { get; set; }

    public int Index2 { get; set; } 

}