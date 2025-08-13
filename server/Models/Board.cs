
namespace server.Models
{
    public class Board
    {
        public int Id { get; set; }
        public string Title { get; set; }
        //public string Description { get; set; }
        public DateTime CreatedAt { get; set; }

        public List<TaskList> TaskLists { get; set; } = new List<TaskList>();

        //email of the owner of that board
        //public string Email { get; set; } not necessary I guess because making a list from the Users class automatically creates this class.
    }
}
