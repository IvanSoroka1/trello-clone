
using System.Reflection.Metadata.Ecma335;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.VisualBasic;
using server.Data;
using server.Models;


public interface IBoardService
{
    string checkValidBoard(int boardId, ref IQueryable<Board> board, ClaimsPrincipal user);
}

public class BoardService : IBoardService
{
    private readonly AppDbContext _context;

    public BoardService(AppDbContext context)
    {
        _context = context;
    }

    public string checkValidBoard(int boardId, ref IQueryable<Board> board,  ClaimsPrincipal user)
    {
        var email = user.FindFirst(ClaimTypes.Email)?.Value;
        if (email == null)
            return "Email not found";

        var possibleBoard = _context.Boards
            .Include(b => b.TaskLists)
            .ThenInclude(b => b.Tasks)
            .Where(u => u.Id == boardId);

        if (!possibleBoard.Any())
            return "No board with such an ID exists";

        var boardIds = _context.Users
            .Where(u => u.Email == email)
            .SelectMany(u => u.Boards)
            .Select(b => b.Id)
            .ToList();

        if (!boardIds.Contains(boardId))
            return "You do not have access to this board!";

        board = possibleBoard;
        return "Success!";
    }
}
