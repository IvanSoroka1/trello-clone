
namespace server.Models
{
    public class TodoTask
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public DateTime CreatedAt { get; set; }

        public User User { get; set; }
    }
}
