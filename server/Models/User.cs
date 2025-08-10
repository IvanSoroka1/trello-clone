using System.ComponentModel.DataAnnotations;

namespace server.Models
{
    public class User
    {
        public string PasswordHash { get; set; }

        [Key]
        public string Email { get; set; }
        public List<TodoTask> Tasks { get; set; }

        public bool Verified { get; set; }
    }
}
